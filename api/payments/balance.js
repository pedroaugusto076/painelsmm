import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import mercadopago from 'mercadopago';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Verificar variáveis de ambiente críticas
    if (!process.env.JWT_SECRET) {
      
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta (JWT_SECRET)'
      });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta (Supabase)'
      });
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta (Mercado Pago)'
      });
    }
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

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { action } = req.query;

    // ============================================
    // ADICIONAR SALDO
    // ============================================
    if (action === 'add' && req.method === 'POST') {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Digite um valor válido'
        });
      }

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

      mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
      });

      const payment = await mercadopago.payment.create({
        transaction_amount: parseFloat(amount),
        description: `Adicionar saldo - R$ ${parseFloat(amount).toFixed(2)}`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.name
        },
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
      });

      const transactionId = crypto.randomUUID();
      
      await supabase
        .from('balance_transactions')
        .insert({
          id: transactionId,
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(amount),
          balance_before: user.balance || 0,
          balance_after: user.balance || 0,
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
    }

    // ============================================
    // HISTÓRICO DE SALDO
    // ============================================
    if (action === 'history' && req.method === 'GET') {
      const { data: transactions, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', decoded.userId)
        .eq('status', 'completed')  // Apenas transações completadas
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        
        return res.status(500).json({
          success: false,
          message: 'Erro ao buscar histórico'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          transactions: transactions || []
        }
      });
    }

    // ============================================
    // COMPRAR COM SALDO
    // ============================================
    if (action === 'purchase' && req.method === 'POST') {
      const { serviceType, packageId, quantity, price, instagramUsername, postUrl } = req.body;

      if (!serviceType || !quantity || !price || !instagramUsername) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos'
        });
      }

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

      if (currentBalance < price) {
        return res.status(400).json({
          success: false,
          message: `Saldo insuficiente. Você tem R$ ${currentBalance.toFixed(2)} e precisa de R$ ${price.toFixed(2)}`,
          insufficientBalance: true,
          currentBalance: currentBalance,
          requiredAmount: price
        });
      }

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
          status: 'completed',
          payment_status: 'paid',
          payment_id: `balance_${orderId}`,
          created_at: new Date().toISOString()
        });

      if (orderError) {
        
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar pedido'
        });
      }

      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        
        await supabase.from('orders').delete().eq('id', orderId);
        return res.status(500).json({
          success: false,
          message: 'Erro ao processar pagamento'
        });
      }

      await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: -price,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: `Compra de ${quantity} ${serviceType} para @${instagramUsername}`,
          order_id: orderId,
          status: 'completed'
        });

      return res.status(200).json({
        success: true,
        data: {
          orderId: orderId,
          newBalance: newBalance,
          amountCharged: price
        },
        message: 'Pedido criado com sucesso!'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Ação inválida. Use: add, history ou purchase'
    });

  } catch (error) {

    // Garantir que sempre retornamos JSON
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
