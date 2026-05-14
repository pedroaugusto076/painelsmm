import { MercadoPagoConfig, Payment } from 'mercadopago';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

async function checkPendingPayments() {
  try {
    console.log('🔍 Verificando pagamentos pendentes...\n');

    // Buscar pedidos com pagamento pendente
    const result = await query(
      `SELECT id, payment_id, service_type, quantity, instagram_username, 
              post_url, status, payment_status, created_at
       FROM orders 
       WHERE status IN ('pending', 'processing') 
       AND payment_id IS NOT NULL
       ORDER BY created_at DESC`
    );

    const pendingOrders = result.rows;
    
    if (pendingOrders.length === 0) {
      console.log('✅ Nenhum pagamento pendente encontrado!');
      process.exit(0);
    }

    console.log(`📦 Encontrados ${pendingOrders.length} pedidos pendentes:\n`);

    for (const order of pendingOrders) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Pedido: ${order.id}`);
      console.log(`💳 Payment ID: ${order.payment_id}`);
      console.log(`📊 Status atual: ${order.status}`);
      console.log(`💰 Payment Status: ${order.payment_status || 'N/A'}`);
      console.log(`📅 Criado em: ${order.created_at}`);

      try {
        // Buscar status do pagamento no Mercado Pago
        console.log(`\n🔍 Consultando Mercado Pago...`);
        const paymentInfo = await payment.get({ id: order.payment_id });
        const status = paymentInfo.status;

        console.log(`✅ Status no Mercado Pago: ${status}`);

        // Atualizar status do pedido
        if (status === 'approved' && order.status !== 'completed') {
          console.log(`\n🎉 PAGAMENTO APROVADO! Atualizando pedido...`);

          await query(
            `UPDATE orders 
             SET status = 'completed',
                 payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          console.log(`✅ Pedido ${order.id} marcado como CONCLUÍDO!`);
        } else if (status === 'rejected' || status === 'cancelled') {
          console.log(`\n❌ Pagamento ${status}. Atualizando pedido...`);

          await query(
            `UPDATE orders 
             SET status = 'cancelled',
                 payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          console.log(`✅ Pedido ${order.id} marcado como CANCELADO`);
        } else if (status === 'pending') {
          console.log(`\n⏳ Pagamento ainda pendente (aguardando pagamento)`);
          
          await query(
            `UPDATE orders 
             SET payment_status = ?
             WHERE id = ?`,
            [status, order.id]
          );
        } else {
          console.log(`\n⚠️ Status desconhecido: ${status}`);
          
          await query(
            `UPDATE orders 
             SET payment_status = ?
             WHERE id = ?`,
            [status, order.id]
          );
        }
      } catch (error) {
        console.error(`\n❌ Erro ao processar pedido ${order.id}:`, error.message);
      }
    }

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Verificação concluída!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao verificar pagamentos:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar
checkPendingPayments();
