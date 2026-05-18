const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const mercadopago = require('mercadopago');

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

    const { amount } = req.body;

    // Validação
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valor mínimo para adicionar saldo é R$ 10,00'
      });
    }

    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Valor máximo para adicionar saldo é R$ 10.000,00'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário
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

    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    // Criar pagamento PIX
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(amount),
      description: `Adicionar saldo - R$ ${parseFloat(amount).toFixed(2)}`,
      payment_method_id: 'pix',
      payer: {
        email: user.email,
        first_name: user.name
      },
      // Não usar external_reference para diferenciar de pedidos normais
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    });

    console.log('✅ [ADD BALANCE] Pagamento PIX criado:', payment.body.id);

    // Criar transação pendente
    const transactionId = require('crypto').randomUUID();
    
    await supabase
      .from('balance_transactions')
      .insert({
        id: transactionId,
        user_id: user.id,
        type: 'deposit',
        amount: parseFloat(amount),
        balance_before: user.balance || 0,
        balance_after: user.balance || 0, // Será atualizado quando o pagamento for confirmado
        description: `Adicionar saldo via PIX`,
        payment_id: payment.body.id,
        status: 'pending'
      });

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.body.id,
        qrCode: payment.body.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
        amount: parseFloat(amount),
        transactionId: transactionId
      }
    });
  } catch (error) {
    console.error('❌ [ADD BALANCE] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento',
      error: error.message
    });
  }
};
