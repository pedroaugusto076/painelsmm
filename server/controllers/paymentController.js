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
      // notification_url removido para desenvolvimento local
      // Em produção, será adicionado automaticamente pela Vercel
    };

    // Adicionar notification_url apenas se não for localhost
    if (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost')) {
      body.notification_url = `${process.env.BACKEND_URL}/api/payments/webhook`;
    }

    console.log('💳 Criando PIX no Mercado Pago...');
    console.log('Body:', JSON.stringify(body, null, 2));

    const response = await payment.create({ body });

    console.log('✅ PIX criado:', response.id);
    console.log('QR Code:', response.point_of_interaction?.transaction_data?.qr_code ? 'Gerado' : 'Não gerado');

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

    res.json({
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
    });
  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX:', error);
    console.error('Detalhes do erro:', error.message);
    console.error('Stack:', error.stack);
    
    // Mensagem de erro mais específica
    let errorMessage = 'Não foi possível gerar o PIX. Tente novamente.';
    
    if (error.message?.includes('credentials')) {
      errorMessage = 'Token do Mercado Pago inválido. Verifique suas credenciais.';
    } else if (error.message?.includes('payer')) {
      errorMessage = 'Erro nos dados do pagador. Verifique seu cadastro.';
    } else if (error.message?.includes('amount')) {
      errorMessage = 'Valor do pagamento inválido.';
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
    const { type, data, action } = req.body;

    console.log('📥 Webhook recebido:', { type, action, paymentId: data?.id });

    // Responder imediatamente ao Mercado Pago
    res.status(200).send('OK');

    // Processar apenas notificações de pagamento
    if (type === 'payment' || action === 'payment.updated') {
      const paymentId = data.id;

      console.log('💳 Buscando informações do pagamento:', paymentId);

      // Buscar informações do pagamento
      const paymentInfo = await payment.get({ id: paymentId });

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
        orderStatus = 'processing';
      } else if (status === 'rejected' || status === 'cancelled') {
        orderStatus = 'cancelled';
      }

      await query(
        `UPDATE orders 
         SET status = ?, 
             payment_status = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [orderStatus, status, externalReference]
      );

      console.log(`✅ Status atualizado: ${orderStatus}`);

      // Se aprovado, enviar para SMMMIDIA
      if (status === 'approved' && order.current_status !== 'completed') {
        console.log('🚀 Pagamento aprovado! Enviando para SMMMIDIA...');

        // Construir link do Instagram
        let instagramLink = '';
        if (order.service_type === 'followers') {
          instagramLink = `https://instagram.com/${order.instagram_username}`;
        } else {
          instagramLink = order.post_url;
        }

        console.log('📤 Link:', instagramLink);
        console.log('📊 Quantidade:', order.quantity);

        // Enviar pedido para SMMMIDIA
        const smmmidiaResult = await smmmidiaService.createOrder(
          order.service_type,
          instagramLink,
          order.quantity
        );

        if (smmmidiaResult.success) {
          console.log('✅ Pedido enviado para SMMMIDIA! Order ID:', smmmidiaResult.orderId);

          // Atualizar pedido com ID da SMMMIDIA
          await query(
            `UPDATE orders 
             SET status = 'completed',
                 smmmidia_order_id = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [smmmidiaResult.orderId, externalReference]
          );

          console.log('✅ Pedido concluído:', externalReference);
        } else {
          console.error('❌ Erro ao enviar para SMMMIDIA:', smmmidiaResult.error);

          // Marcar como erro
          await query(
            `UPDATE orders 
             SET status = 'error',
                 error_message = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [smmmidiaResult.error, externalReference]
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
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

    res.json({
      success: true,
      data: {
        orders: result.rows
      }
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível carregar seus pedidos'
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
