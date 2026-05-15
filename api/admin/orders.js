const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Verificar token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Verificar se é admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar todos os pedidos com informações do usuário
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!inner(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar pedidos'
      });
    }

    // Formatar dados
    const formattedOrders = orders.map(order => ({
      id: order.id,
      user_id: order.user_id,
      user_name: order.users.name,
      user_email: order.users.email,
      service_type: order.service_type,
      package_id: order.package_id,
      quantity: order.quantity,
      price: order.price,
      instagram_username: order.instagram_username,
      post_url: order.post_url,
      status: order.status,
      payment_status: order.payment_status,
      payment_id: order.payment_id,
      smmmidia_order_id: order.smmmidia_order_id,
      error_message: order.error_message,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        total: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos'
    });
  }
};
