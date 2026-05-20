import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Webhook do Mercado Pago
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const { type, data } = req.body;

    // Mercado Pago envia notificações de diferentes tipos
    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar detalhes do pagamento no Mercado Pago
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      const payment = await response.json();

      // Se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const orderId = payment.external_reference;
        
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );

        // Verificar se é uma recarga de saldo (não tem external_reference ou começa com 'balance_')
        if (!orderId || orderId.startsWith('balance_')) {

          // Buscar transação pendente pelo payment_id
          const { data: transactions, error: txError } = await supabase
            .from('balance_transactions')
            .select('*')
            .eq('payment_id', paymentId)
            .eq('status', 'pending')
            .limit(1);

          if (txError || !transactions || transactions.length === 0) {
            
            return res.status(200).json({ success: true });
          }

          const transaction = transactions[0];

          // Buscar saldo atual do usuário
          const { data: users, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', transaction.user_id)
            .single();

          if (userError || !users) {
            
            return res.status(200).json({ success: true });
          }

          const currentBalance = users.balance || 0;
          const newBalance = currentBalance + transaction.amount;

          // Atualizar saldo do usuário
          const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', transaction.user_id);

          if (updateError) {
            
            return res.status(200).json({ success: false });
          }

          // Atualizar transação
          await supabase
            .from('balance_transactions')
            .update({
              status: 'completed',
              balance_after: newBalance
            })
            .eq('id', transaction.id);

        } else {
          // É um pedido normal

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
            
          } else {
            
          }
        }
      }
    }

    // Sempre retornar 200 para o Mercado Pago
    return res.status(200).json({ success: true });
  } catch (error) {
    
    // Mesmo com erro, retornar 200 para não ficar recebendo notificações repetidas
    return res.status(200).json({ success: false, error: error.message });
  }
};
