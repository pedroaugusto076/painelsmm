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

    // Total de pedidos
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Pedidos por status
    const { data: statusData } = await supabase
      .from('orders')
      .select('status');

    const ordersByStatus = statusData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Receita total (apenas pedidos pagos)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('price')
      .in('status', ['completed', 'processing', 'delivered']);

    const totalRevenue = revenueData.reduce((sum, order) => sum + order.price, 0);

    // Pedidos de hoje
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        ordersByStatus: ordersByStatus,
        totalRevenue: totalRevenue || 0,
        todayOrders: todayOrders || 0,
        totalUsers: totalUsers || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};
