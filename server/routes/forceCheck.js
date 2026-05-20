import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { query } from '../config/database.js';
import * as smmmidiaService from '../services/smmmidiaService.js';

const router = express.Router();

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

// ROTA PÚBLICA - Verificar TODOS os pagamentos pendentes
router.get('/check-all', async (req, res) => {
  try {
    console.log('🔍 VERIFICAÇÃO FORÇADA - Buscando TODOS os pedidos pendentes...');

    // Buscar TODOS os pedidos pendentes ou processing
    const result = await query(
      `SELECT id, payment_id, service_type, quantity, instagram_username, post_url, status, user_id
       FROM orders 
       WHERE status IN ('pending', 'processing') 
       AND payment_id IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 50`
    );

    const pendingOrders = result.rows;
    console.log(`📦 Encontrados ${pendingOrders.length} pedidos pendentes`);

    const updates = [];

    for (const order of pendingOrders) {
      try {
        console.log(`💳 Verificando pagamento ${order.payment_id} do pedido ${order.id}`);

        // Buscar status do pagamento no Mercado Pago
        const paymentInfo = await payment.get({ id: order.payment_id });
        const status = paymentInfo.status;

        console.log(`📊 Status do pagamento: ${status}`);

        if (status === 'approved' && order.status !== 'completed') {
          console.log('✅ PAGAMENTO APROVADO! Marcando como concluído...');

          // Atualizar pedido como concluído (SEM enviar para SMMMIDIA)
          await query(
            `UPDATE orders 
             SET status = 'completed',
                 payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          updates.push({
            orderId: order.id,
            paymentId: order.payment_id,
            status: 'completed',
            message: '✅ Pagamento confirmado e pedido concluído!'
          });
        } else if (status === 'approved') {
          updates.push({
            orderId: order.id,
            paymentId: order.payment_id,
            status: 'already_completed',
            message: 'Pedido já foi processado anteriormente'
          });
        } else {
          // Atualizar apenas o payment_status
          await query(
            `UPDATE orders 
             SET payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          updates.push({
            orderId: order.id,
            paymentId: order.payment_id,
            status: status,
            message: `Status do pagamento: ${status}`
          });
        }
      } catch (error) {
        console.error(`❌ Erro ao processar pedido ${order.id}:`, error.message);
        updates.push({
          orderId: order.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Verificados ${pendingOrders.length} pedidos`,
      data: {
        checked: pendingOrders.length,
        updates: updates
      }
    });
  } catch (error) {
    console.error('❌ Erro na verificação forçada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar pagamentos',
      error: error.message
    });
  }
});

export default router;
