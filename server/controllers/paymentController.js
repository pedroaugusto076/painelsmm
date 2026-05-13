import { MercadoPagoConfig, Payment } from 'mercadopago';
import { query } from '../config/database.js';

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

    // Validações
    if (!serviceType || !packageId || !quantity || !price || !instagramUsername) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos para criar o pagamento'
      });
    }

    // Validar URL do post se necessário
    if (['likes', 'comments', 'views'].includes(serviceType) && !postUrl) {
      return res.status(400).json({
        success: false,
        message: 'Link da publicação é obrigatório para este serviço'
      });
    }

    // Criar pedido no banco de dados
    const orderResult = await query(
      `INSERT INTO orders (user_id, service_type, package_id, quantity, price, instagram_username, post_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id, created_at`,
      [userId, serviceType, packageId, quantity, price, instagramUsername, postUrl || null]
    );

    const order = orderResult.rows[0];

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
      external_reference: order.id.toString(),
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    };

    const response = await payment.create({ body });

    // Salvar payment_id e dados do PIX no pedido
    await query(
      `UPDATE orders 
       SET payment_id = $1, 
           pix_qr_code = $2, 
           pix_qr_code_base64 = $3,
           payment_status = $4
       WHERE id = $5`,
      [
        response.id,
        response.point_of_interaction?.transaction_data?.qr_code || null,
        response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        response.status,
        order.id
      ]
    );

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
    console.error('Erro ao criar pagamento PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível gerar o PIX. Tente novamente.'
    });
  }
};

// Webhook do Mercado Pago
export const handleWebhook = async (req, res) => {
  try {
    const { type, data, action } = req.body;

    // Responder imediatamente ao Mercado Pago
    res.status(200).send('OK');

    // Processar apenas notificações de pagamento
    if (type === 'payment' || action === 'payment.updated') {
      const paymentId = data.id;

      // Buscar informações do pagamento
      const paymentInfo = await payment.get({ id: paymentId });

      const externalReference = paymentInfo.external_reference;
      const status = paymentInfo.status;

      if (!externalReference) return;

      // Atualizar status do pedido
      let orderStatus = 'pending';
      if (status === 'approved') {
        orderStatus = 'processing';
      } else if (status === 'rejected' || status === 'cancelled') {
        orderStatus = 'cancelled';
      }

      await query(
        `UPDATE orders 
         SET status = $1, 
             payment_status = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [orderStatus, status, externalReference]
      );

      // Se aprovado, iniciar processamento do pedido
      if (status === 'approved') {
        console.log(`✅ PIX aprovado! Pedido ${externalReference} em processamento`);
        // Aqui você pode adicionar lógica para processar o pedido
        // Por exemplo, enviar para API de SMM, etc.
      }
    }
  } catch (error) {
    console.error('Erro no webhook:', error);
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
       WHERE id = $1 AND user_id = $2`,
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
              status, payment_status, created_at, updated_at
       FROM orders 
       WHERE user_id = $1 
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
