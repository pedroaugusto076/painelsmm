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
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Pegar orderId da URL (dynamic route)
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID não fornecido'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar pedido
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order: {
          id: order.id,
          status: order.status,
          payment_status: order.payment_status,
          service_type: order.service_type,
          quantity: order.quantity,
          price: order.price,
          created_at: order.created_at,
          updated_at: order.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar status do pagamento'
    });
  }
};
