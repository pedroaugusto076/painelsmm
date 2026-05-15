const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    const { orderId } = req.query;
    const { reason } = req.body;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log('❌ [ADMIN] Cancelando pedido:', orderId);

    // Atualizar pedido
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        error_message: reason || 'Cancelado pelo administrador',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erro ao cancelar pedido:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar pedido'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pedido cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao cancelar pedido'
    });
  }
};
