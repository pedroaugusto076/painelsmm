const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Função para criar pagamento no Mercado Pago
async function createMercadoPagoPayment(amount, orderId, description) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': orderId // Usar orderId como chave de idempotência
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@email.com'
        },
        external_reference: orderId,
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro Mercado Pago:', data);
      throw new Error(data.message || 'Erro ao criar pagamento');
    }

    return {
      success: true,
      paymentId: data.id,
      pixQrCode: data.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      status: data.status
    };
  } catch (error) {
    console.error('Erro ao criar pagamento MP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

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

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { serviceType, packageId, quantity, price, instagramUsername, postUrl } = req.body;

    // Validação
    if (!serviceType || !packageId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos'
      });
    }

    // Criar pedido
    const orderId = crypto.randomUUID();
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: decoded.userId,
        service_type: serviceType,
        package_id: packageId,
        quantity: quantity,
        price: price,
        instagram_username: instagramUsername,
        post_url: postUrl,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar pedido'
      });
    }

    // Criar pagamento no Mercado Pago
    const description = `${serviceType} - ${quantity} unidades`;
    const mpResult = await createMercadoPagoPayment(price, orderId, description);

    if (!mpResult.success) {
      // Se falhar, deletar o pedido
      await supabase.from('orders').delete().eq('id', orderId);
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar PIX: ' + mpResult.error
      });
    }

    // Atualizar pedido com payment_id
    await supabase
      .from('orders')
      .update({ payment_id: mpResult.paymentId.toString() })
      .eq('id', orderId);

    return res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      data: {
        orderId: order.id,
        paymentId: mpResult.paymentId,
        amount: price,
        pixQrCode: mpResult.pixQrCode,
        pixQrCodeBase64: mpResult.pixQrCodeBase64,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento'
    });
  }
};
