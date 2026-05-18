const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    const { serviceType, packageId, quantity, price, instagramUsername, postUrl } = req.body;

    // Validação
    if (!serviceType || !quantity || !price || !instagramUsername) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário e saldo
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name, balance')
      .eq('id', decoded.userId)
      .single();

    if (userError || !users) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users;
    const currentBalance = user.balance || 0;

    // Verificar se tem saldo suficiente
    if (currentBalance < price) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente. Você tem R$ ${currentBalance.toFixed(2)} e precisa de R$ ${price.toFixed(2)}`,
        insufficientBalance: true,
        currentBalance: currentBalance,
        requiredAmount: price
      });
    }

    // Criar pedido
    const orderId = crypto.randomUUID();
    const newBalance = currentBalance - price;

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        service_type: serviceType,
        package_id: packageId,
        quantity: quantity,
        price: price,
        instagram_username: instagramUsername,
        post_url: postUrl,
        status: 'completed', // Já está pago com saldo
        payment_status: 'paid',
        payment_id: `balance_${orderId}`,
        created_at: new Date().toISOString()
      });

    if (orderError) {
      console.error('❌ [PURCHASE] Erro ao criar pedido:', orderError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar pedido'
      });
    }

    // Atualizar saldo do usuário
    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (balanceError) {
      console.error('❌ [PURCHASE] Erro ao atualizar saldo:', balanceError);
      // Reverter pedido
      await supabase.from('orders').delete().eq('id', orderId);
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar pagamento'
      });
    }

    // Registrar transação
    await supabase
      .from('balance_transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: -price, // Negativo porque é uma compra
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Compra de ${quantity} ${serviceType} para @${instagramUsername}`,
        order_id: orderId,
        status: 'completed'
      });

    console.log(`✅ [PURCHASE] Pedido criado com saldo! User: ${user.email}, Valor: R$ ${price}, Novo saldo: R$ ${newBalance}`);

    return res.status(200).json({
      success: true,
      data: {
        orderId: orderId,
        newBalance: newBalance,
        amountCharged: price
      },
      message: 'Pedido criado com sucesso!'
    });
  } catch (error) {
    console.error('❌ [PURCHASE] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar compra',
      error: error.message
    });
  }
};
