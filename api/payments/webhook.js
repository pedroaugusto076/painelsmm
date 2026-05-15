const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Webhook do Mercado Pago
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 [WEBHOOK] Recebido do Mercado Pago:', req.body);

    const { type, data } = req.body;

    // Mercado Pago envia notificações de diferentes tipos
    if (type === 'payment') {
      const paymentId = data.id;
      
      console.log('💳 [WEBHOOK] Payment ID:', paymentId);

      // Buscar detalhes do pagamento no Mercado Pago
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      const payment = await response.json();
      
      console.log('💰 [WEBHOOK] Status do pagamento:', payment.status);
      console.log('📋 [WEBHOOK] External reference:', payment.external_reference);

      // Se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const orderId = payment.external_reference;
        
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );

        // Atualizar pedido no banco
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) {
          console.error('❌ [WEBHOOK] Erro ao atualizar pedido:', error);
        } else {
          console.log('✅ [WEBHOOK] Pedido atualizado com sucesso!');
        }
      }
    }

    // Sempre retornar 200 para o Mercado Pago
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro:', error);
    // Mesmo com erro, retornar 200 para não ficar recebendo notificações repetidas
    return res.status(200).json({ success: false, error: error.message });
  }
};
