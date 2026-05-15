const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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

    // Aqui você integraria com Mercado Pago
    // Por enquanto, retornar dados mockados para teste
    return res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      data: {
        orderId: order.id,
        paymentId: order.id, // Usar o mesmo ID por enquanto
        amount: price,
        pixQrCode: 'PIX_CODE_MOCK_' + order.id,
        pixQrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 pixel transparente
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
