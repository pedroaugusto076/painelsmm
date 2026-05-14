import { MercadoPagoConfig, Payment } from 'mercadopago';
import { query } from '../config/database.js';
import * as smmmidiaService from '../services/smmmidiaService.js';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

// Criar pagamento PIX
export const createPayment = async (req, res) => {
  try {
    const { serviceType, packageId, quantity, price, instagramUsername, postUrl } = req.body;
    const userId = req.user.id;

    console.log('📝 Dados recebidos:', { serviceType, packageId, quantity, price, instagramUsername, userId });

    // Validações
    if (!serviceType || !packageId || !quantity || !price || !instagramUsername) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos para criar o pagamento'
      });
    }

    // Validar URL do post se necessário
    if (['likes', 'comments', 'views'].includes(serviceType) && !postUrl) {
      console.log('❌ Link da publicação obrigatório');
      return res.status(400).json({
        success: false,
        message: 'Link da publicação é obrigatório para este serviço'
      });
    }

    // Verificar se o token do Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
      return res.status(500).json({
        success: false,
        message: 'Mercado Pago não está configurado. Entre em contato com o suporte.'
      });
    }

    console.log('✅ Token Mercado Pago configurado');

    // Gerar ID único para o pedido
    const crypto = await import('crypto');
    const orderId = crypto.randomUUID();

    console.log('📦 Criando pedido no banco:', orderId);

    // Criar pedido no banco de dados
    await query(
      `INSERT INTO orders (id, user_id, service_type, package_id, quantity, price, instagram_username, post_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderId, userId, serviceType, packageId, quantity, price, instagramUsername, postUrl || null]
    );

    // Buscar pedido criado
    const orderResult = await query(
      'SELECT id, created_at FROM orders WHERE id = ?',
      [orderId]
    );

    const order = orderResult.rows[0];
    console.log('✅ Pedido criado:', order.id);

    // Mapear nomes de serviços
    const serviceNames = {
      followers: 'Seguidores',
      likes: 'Curtidas',
      comments: 'Comentários',
      views: 'Visualizações'
    };

    // Criar pagamento PIX no Mercado Pago
    const body = {
      transaction_amount: parseFloat(price),
      description: `${quantity} ${serviceNames[serviceType]} - @${instagramUsername}`,
      payment_method_id: 'pix',
      payer: {
        email: req.user.email,
        first_name: req.user.name.split(' ')[0],
        last_name: req.user.name.split(' ').slice(1).join(' ') || req.user.name.split(' ')[0]
      },
      external_reference: order.id.toString()
    };

    // Adicionar notification_url - Vercel sempre tem BACKEND_URL configurado
    const backendUrl = process.env.BACKEND_URL || process.env.VERCEL_URL;
    if (backendUrl) {
      // Garantir que a URL tenha https:// se for Vercel
      const webhookUrl = backendUrl.startsWith('http') 
        ? `${backendUrl}/api/payments/webhook`
        : `https://${backendUrl}/api/payments/webhook`;
      
      body.notification_url = webhookUrl;
      console.log('🔔 Notification URL configurada:', webhookUrl);
    } else {
      console.log('⚠️ BACKEND_URL não configurado - webhook pode não funcionar');
    }

    console.log('💳 Criando PIX no Mercado Pago...');
    console.log('📋 [DEBUG] Body completo:', JSON.stringify(body, null, 2));
    console.log('🔑 [DEBUG] Token (primeiros 20 chars):', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...');

    const response = await payment.create({ body });

    console.log('✅ PIX criado:', response.id);
    console.log('📊 [DEBUG] Status do pagamento:', response.status);
    console.log('💰 [DEBUG] Valor:', response.transaction_amount);
    console.log('🔗 [DEBUG] QR Code gerado?', !!response.point_of_interaction?.transaction_data?.qr_code);
    console.log('📱 [DEBUG] QR Code Base64 gerado?', !!response.point_of_interaction?.transaction_data?.qr_code_base64);
    console.log('📦 [DEBUG] Resposta completa:', JSON.stringify(response, null, 2));

    // Salvar payment_id e dados do PIX no pedido
    await query(
      `UPDATE orders 
       SET payment_id = ?, 
           pix_qr_code = ?, 
           pix_qr_code_base64 = ?,
           payment_status = ?
       WHERE id = ?`,
      [
        response.id,
        response.point_of_interaction?.transaction_data?.qr_code || null,
        response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        response.status,
        order.id
      ]
    );

    console.log('✅ Pedido atualizado com dados do PIX');
    console.log('📤 [DEBUG] Enviando resposta para o frontend...');

    const responseData = {
      success: true,
      message: 'PIX gerado com sucesso',
      data: {
        orderId: order.id,
        paymentId: response.id,
        pixQrCode: response.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        expirationDate: response.date_of_expiration,
        amount: response.transaction_amount,
        status: response.status
      }
    };

    console.log('✅ [DEBUG] Resposta enviada:', JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    console.error('❌ [ERRO CRÍTICO] Erro ao criar pagamento PIX:', error);
    console.error('📋 [ERRO] Tipo:', error.constructor.name);
    console.error('📋 [ERRO] Mensagem:', error.message);
    console.error('📋 [ERRO] Stack:', error.stack);
    console.error('📋 [ERRO] Causa:', error.cause);
    
    // Se for erro do Mercado Pago, logar detalhes
    if (error.response) {
      console.error('📋 [ERRO MP] Status:', error.response.status);
      console.error('📋 [ERRO MP] Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Mensagem de erro mais específica
    let errorMessage = 'Não foi possível gerar o PIX. Tente novamente.';
    
    if (error.message?.includes('credentials') || error.message?.includes('authentication')) {
      errorMessage = 'Token do Mercado Pago inválido. Verifique suas credenciais.';
    } else if (error.message?.includes('payer')) {
      errorMessage = 'Erro nos dados do pagador. Verifique seu cadastro.';
    } else if (error.message?.includes('amount')) {
      errorMessage = 'Valor do pagamento inválido.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Timeout ao conectar com Mercado Pago. Tente novamente.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Webhook do Mercado Pago
export const handleWebhook = async (req, res) => {
  try {
    // Log completo do body para debug
    console.log('📥 Webhook recebido - Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📥 Webhook recebido - Query params:', JSON.stringify(req.query, null, 2));

    // Mercado Pago pode enviar dados via query params ou body
    const type = req.body.type || req.query.type;
    const dataId = req.body['data.id'] || req.query['data.id'] || req.body.data?.id;
    const action = req.body.action || req.query.action;

    console.log('📥 Webhook processado:', { type, action, paymentId: dataId });

    // Responder imediatamente ao Mercado Pago
    res.status(200).send('OK');

    // Validar se temos um payment ID
    if (!dataId) {
      console.log('⚠️ Webhook sem payment ID, ignorando');
      return;
    }

    // Processar apenas notificações de pagamento
    if (type === 'payment' || action?.includes('payment')) {
      const paymentId = dataId;

      console.log('💳 Buscando informações do pagamento:', paymentId);

      // Buscar informações do pagamento
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('📋 Informações do pagamento:', JSON.stringify({
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        transaction_amount: paymentInfo.transaction_amount
      }, null, 2));

      const externalReference = paymentInfo.external_reference;
      const status = paymentInfo.status;

      console.log('📦 Pedido:', externalReference, '| Status:', status);

      if (!externalReference) {
        console.log('⚠️ Sem external_reference, ignorando');
        return;
      }

      // Buscar dados do pedido
      const orderResult = await query(
        `SELECT id, service_type, quantity, instagram_username, post_url, status as current_status
         FROM orders 
         WHERE id = ?`,
        [externalReference]
      );

      if (orderResult.rows.length === 0) {
        console.log('❌ Pedido não encontrado:', externalReference);
        return;
      }

      const order = orderResult.rows[0];

      // Atualizar status do pedido
      let orderStatus = 'pending';
      if (status === 'approved') {
        orderStatus = 'completed'; // Marcar como concluído direto
      } else if (status === 'rejected' || status === 'cancelled') {
        orderStatus = 'cancelled';
      }

      console.log(`🔄 Atualizando status do pedido ${externalReference}: ${order.current_status} -> ${orderStatus}`);

      await query(
        `UPDATE orders 
         SET status = ?, 
             payment_status = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [orderStatus, status, externalReference]
      );

      console.log(`✅ Status atualizado: ${orderStatus} (payment_status: ${status})`);

      // Não enviar para SMMMIDIA - apenas marcar como concluído
      console.log('ℹ️ Pedido marcado como concluído. Integração com SMMMIDIA desabilitada.');
    } else {
      console.log('⚠️ Tipo de notificação ignorado:', type, action);
    }
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    console.error('📋 Stack:', error.stack);
  }
};

// Buscar status do pagamento
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT id, service_type, quantity, price, status, payment_status, created_at, updated_at
       FROM orders 
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        order: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível buscar o status do pagamento'
    });
  }
};

// Listar pedidos do usuário
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 [DEBUG] Buscando pedidos do usuário:', userId);
    console.log('📋 [DEBUG] Tipo do userId:', typeof userId);

    const result = await query(
      `SELECT id, service_type, package_id, quantity, price, instagram_username, 
              status, payment_status, created_at, updated_at, payment_id, 
              smmmidia_order_id, error_message
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    console.log('✅ [DEBUG] Pedidos encontrados:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('📦 [DEBUG] Primeiro pedido:', JSON.stringify(result.rows[0], null, 2));
    }

    res.json({
      success: true,
      data: {
        orders: result.rows
      }
    });
  } catch (error) {
    console.error('❌ [ERRO] Erro ao listar pedidos:', error);
    console.error('📋 [ERRO] Message:', error.message);
    console.error('📋 [ERRO] Stack:', error.stack);
    console.error('📋 [ERRO] Name:', error.name);
    
    // Tentar retornar array vazio em caso de erro
    res.status(200).json({
      success: true,
      data: {
        orders: []
      },
      warning: 'Erro ao buscar pedidos, retornando lista vazia'
    });
  }
};

// Verificar pagamentos pendentes manualmente (útil quando webhook falha)
export const checkPendingPayments = async (req, res) => {
  try {
    console.log('🔍 Verificando pagamentos pendentes...');

    // Buscar pedidos com pagamento pendente
    const result = await query(
      `SELECT id, payment_id, service_type, quantity, instagram_username, post_url, status
       FROM orders 
       WHERE status IN ('pending', 'processing') 
       AND payment_id IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 20`
    );

    const pendingOrders = result.rows;
    console.log(`📦 Encontrados ${pendingOrders.length} pedidos pendentes`);

    const updates = [];

    for (const order of pendingOrders) {
      try {
        // Buscar status do pagamento no Mercado Pago
        const paymentInfo = await payment.get({ id: order.payment_id });
        const status = paymentInfo.status;

        console.log(`💳 Pedido ${order.id}: Payment ${order.payment_id} = ${status}`);

        // Atualizar status do pedido
        let orderStatus = order.status;
        if (status === 'approved' && order.status !== 'completed') {
          orderStatus = 'processing';

          // Enviar para SMMMIDIA
          let instagramLink = '';
          if (order.service_type === 'followers') {
            instagramLink = `https://instagram.com/${order.instagram_username}`;
          } else {
            instagramLink = order.post_url;
          }

          console.log('🚀 Enviando para SMMMIDIA:', instagramLink);

          const smmmidiaResult = await smmmidiaService.createOrder(
            order.service_type,
            instagramLink,
            order.quantity
          );

          if (smmmidiaResult.success) {
            console.log('✅ Enviado! Order ID:', smmmidiaResult.orderId);

            await query(
              `UPDATE orders 
               SET status = 'completed',
                   payment_status = ?,
                   smmmidia_order_id = ?,
                   updated_at = datetime('now')
               WHERE id = ?`,
              [status, smmmidiaResult.orderId, order.id]
            );

            updates.push({
              orderId: order.id,
              status: 'completed',
              smmmidiaOrderId: smmmidiaResult.orderId
            });
          } else {
            console.error('❌ Erro SMMMIDIA:', smmmidiaResult.error);

            await query(
              `UPDATE orders 
               SET status = 'error',
                   payment_status = ?,
                   error_message = ?,
                   updated_at = datetime('now')
               WHERE id = ?`,
              [status, smmmidiaResult.error, order.id]
            );

            updates.push({
              orderId: order.id,
              status: 'error',
              error: smmmidiaResult.error
            });
          }
        } else if (status === 'rejected' || status === 'cancelled') {
          await query(
            `UPDATE orders 
             SET status = 'cancelled',
                 payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          updates.push({
            orderId: order.id,
            status: 'cancelled'
          });
        } else {
          // Apenas atualizar payment_status
          await query(
            `UPDATE orders 
             SET payment_status = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [status, order.id]
          );

          updates.push({
            orderId: order.id,
            status: orderStatus,
            paymentStatus: status
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
    console.error('❌ Erro ao verificar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar pagamentos pendentes',
      error: error.message
    });
  }
};
