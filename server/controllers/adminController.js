import { query } from '../config/database.js';
import * as smmmidiaService from '../services/smmmidiaService.js';

// Listar todos os pedidos (admin)
export const getAllOrders = async (req, res) => {
  try {
    console.log('📋 [ADMIN] Buscando todos os pedidos...');

    const result = await query(
      `SELECT 
        o.id, 
        o.user_id, 
        o.service_type, 
        o.package_id, 
        o.quantity, 
        o.price, 
        o.instagram_username, 
        o.post_url,
        o.status, 
        o.payment_status, 
        o.payment_id,
        o.smmmidia_order_id,
        o.created_at, 
        o.updated_at,
        u.name as user_name,
        u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 100`
    );

    console.log('✅ [ADMIN] Pedidos encontrados:', result.rows.length);

    res.json({
      success: true,
      data: {
        orders: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao listar pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Aprovar pedido e enviar para SMMMIDIA
export const approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('✅ [ADMIN] Aprovando pedido:', orderId);

    // Buscar dados do pedido
    const orderResult = await query(
      `SELECT id, user_id, service_type, quantity, instagram_username, post_url, status, smmmidia_order_id
       FROM orders 
       WHERE id = ?`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    const order = orderResult.rows[0];

    // Verificar se já foi enviado para SMMMIDIA
    if (order.smmmidia_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Pedido já foi enviado para o fornecedor'
      });
    }

    // Verificar se o pagamento foi confirmado
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Pedido precisa estar com pagamento confirmado'
      });
    }

    // Construir link do Instagram
    let link = '';
    if (order.service_type === 'followers') {
      link = `https://instagram.com/${order.instagram_username}`;
    } else if (order.post_url) {
      link = order.post_url;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Link do Instagram não disponível'
      });
    }

    console.log('📤 [ADMIN] Enviando para SMMMIDIA:', {
      serviceType: order.service_type,
      link,
      quantity: order.quantity
    });

    // Enviar para SMMMIDIA
    const smmmidiaResult = await smmmidiaService.createOrder(
      order.service_type,
      link,
      order.quantity
    );

    if (!smmmidiaResult.success) {
      console.error('❌ [ADMIN] Erro ao enviar para SMMMIDIA:', smmmidiaResult.error);
      
      // Salvar erro no banco
      await query(
        `UPDATE orders 
         SET error_message = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [smmmidiaResult.error, orderId]
      );

      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar para o fornecedor',
        error: smmmidiaResult.error
      });
    }

    console.log('✅ [ADMIN] Pedido enviado para SMMMIDIA:', smmmidiaResult.orderId);

    // Atualizar pedido com ID da SMMMIDIA e status
    await query(
      `UPDATE orders 
       SET smmmidia_order_id = ?,
           status = 'processing',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [smmmidiaResult.orderId, orderId]
    );

    res.json({
      success: true,
      message: 'Pedido aprovado e enviado para o fornecedor',
      data: {
        orderId: order.id,
        smmmidiaOrderId: smmmidiaResult.orderId
      }
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao aprovar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancelar pedido
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log('❌ [ADMIN] Cancelando pedido:', orderId);

    await query(
      `UPDATE orders 
       SET status = 'cancelled',
           error_message = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [reason || 'Cancelado pelo administrador', orderId]
    );

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso'
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao cancelar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar status de pedido na SMMMIDIA
export const checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('🔍 [ADMIN] Verificando status do pedido:', orderId);

    // Buscar dados do pedido
    const orderResult = await query(
      `SELECT id, smmmidia_order_id, status
       FROM orders 
       WHERE id = ?`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    const order = orderResult.rows[0];

    if (!order.smmmidia_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Pedido ainda não foi enviado para o fornecedor'
      });
    }

    // Verificar status na SMMMIDIA
    const statusResult = await smmmidiaService.getOrderStatus(order.smmmidia_order_id);

    if (!statusResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar status no fornecedor',
        error: statusResult.error
      });
    }

    // Atualizar status local se necessário
    let localStatus = order.status;
    if (statusResult.status === 'Completed') {
      localStatus = 'delivered';
      await query(
        `UPDATE orders 
         SET status = 'delivered',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [orderId]
      );
    } else if (statusResult.status === 'Canceled' || statusResult.status === 'Refunded') {
      localStatus = 'cancelled';
      await query(
        `UPDATE orders 
         SET status = 'cancelled',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [orderId]
      );
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        localStatus: localStatus,
        smmmidiaStatus: statusResult.status,
        charge: statusResult.charge,
        startCount: statusResult.startCount,
        remains: statusResult.remains
      }
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Estatísticas do painel
export const getStats = async (req, res) => {
  try {
    console.log('📊 [ADMIN] Buscando estatísticas...');

    // Total de pedidos
    const totalResult = await query('SELECT COUNT(*) as total FROM orders');
    const total = parseInt(totalResult.rows[0].total);

    // Pedidos por status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       GROUP BY status`
    );

    // Receita total
    const revenueResult = await query(
      `SELECT SUM(price) as total_revenue 
       FROM orders 
       WHERE status IN ('completed', 'processing', 'delivered')`
    );

    // Pedidos hoje
    const todayResult = await query(
      `SELECT COUNT(*) as today_orders 
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`
    );

    // Total de usuários
    const usersResult = await query('SELECT COUNT(*) as total_users FROM users');

    const stats = {
      totalOrders: total,
      ordersByStatus: statusResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
      todayOrders: parseInt(todayResult.rows[0].today_orders),
      totalUsers: parseInt(usersResult.rows[0].total_users)
    };

    console.log('✅ [ADMIN] Estatísticas:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar saldo SMMMIDIA
export const getBalance = async (req, res) => {
  try {
    console.log('💰 [ADMIN] Verificando saldo SMMMIDIA...');

    const balanceResult = await smmmidiaService.getBalance();

    if (!balanceResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar saldo',
        error: balanceResult.error
      });
    }

    res.json({
      success: true,
      data: {
        balance: balanceResult.balance,
        currency: balanceResult.currency
      }
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao verificar saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar saldo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
