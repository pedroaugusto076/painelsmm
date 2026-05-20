// API Pública v1 - Endpoint Único
// Compatível com formato SMMMIDIA
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Mapeamento de service IDs para tipos internos
const SERVICE_MAPPING = {
  '1': 'followers',
  '2': 'likes',
  '3': 'comments',
  '4': 'views'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { key, action } = req.body;

    // Validar API key
    if (!key) {
      return res.status(401).json({
        error: 'API key is required'
      });
    }

    // Verificar se a API key existe no banco de dados
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('api_key', key)
      .limit(1);

    if (userError || !users || users.length === 0) {
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }

    const user = users[0];

    // Ação: listar serviços
    if (action === 'services') {
      const services = [
        {
          service: '1',
          name: 'Instagram Seguidores Brasil',
          type: 'Default',
          category: 'Instagram',
          rate: '0.149',
          min: '100',
          max: '10000',
          description: 'Seguidores brasileiros reais e ativos'
        },
        {
          service: '2',
          name: 'Instagram Curtidas Brasil',
          type: 'Default',
          category: 'Instagram',
          rate: '0.049',
          min: '100',
          max: '10000',
          description: 'Curtidas de perfis brasileiros'
        },
        {
          service: '3',
          name: 'Instagram Comentários Brasil',
          type: 'Custom Comments',
          category: 'Instagram',
          rate: '1.49',
          min: '10',
          max: '1000',
          description: 'Comentários personalizados em português'
        },
        {
          service: '4',
          name: 'Instagram Visualizações',
          type: 'Default',
          category: 'Instagram',
          rate: '0.0049',
          min: '1000',
          max: '100000',
          description: 'Visualizações para vídeos e reels'
        }
      ];

      return res.status(200).json(services);
    }

    // Ação: adicionar pedido
    if (action === 'add') {
      const { service, link, quantity, comments } = req.body;

      // Validações
      if (!service) {
        return res.status(400).json({ error: 'Service ID is required' });
      }

      if (!link) {
        return res.status(400).json({ error: 'Link is required' });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be greater than 0' });
      }

      // Mapear service ID para tipo interno
      const serviceType = SERVICE_MAPPING[service];
      
      if (!serviceType) {
        return res.status(400).json({ error: 'Invalid service ID' });
      }

      if (serviceType === 'comments' && (!comments || !String(comments).trim())) {
        return res.status(400).json({ error: 'Comments text is required for custom comments service (service 3)' });
      }

      // Extrair username do Instagram do link
      let instagramUsername = '';
      
      if (serviceType === 'followers') {
        const match = link.match(/instagram\.com\/([^\/\?]+)/);
        if (match) {
          instagramUsername = match[1];
        } else {
          return res.status(400).json({ error: 'Invalid Instagram link format' });
        }
      } else {
        const match = link.match(/instagram\.com\/([^\/\?]+)/);
        if (match) {
          instagramUsername = match[1];
        }
      }

      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      // Calcular preço baseado no serviço e quantidade
      // Tabela de preços por pacote
      const pricingTable = {
        'followers': {
          100: 14.90,
          500: 64.90,
          1000: 119.90,
          2500: 279.90,
          5000: 499.90,
          10000: 899.90
        },
        'likes': {
          100: 4.90,
          500: 17.90,
          1000: 29.90,
          2500: 64.90,
          5000: 119.90,
          10000: 199.90
        },
        'comments': {
          10: 14.90,
          50: 69.90,
          100: 139.90,
          250: 349.90,
          500: 699.90,
          1000: 1399.90
        },
        'views': {
          1000: 4.90,
          5000: 19.90,
          10000: 34.90,
          25000: 74.90,
          50000: 129.90,
          100000: 229.90
        }
      };

      // Buscar preço exato da tabela ou calcular proporcionalmente
      let price = 0;
      const servicePricing = pricingTable[serviceType];
      
      if (servicePricing && servicePricing[quantity]) {
        // Preço exato encontrado na tabela
        price = servicePricing[quantity];
      } else {
        // Calcular proporcionalmente baseado no menor pacote
        const rates = {
          'followers': 14.90 / 100,  // R$ 14,90 para 100 = R$ 0,149 por unidade
          'likes': 4.90 / 100,        // R$ 4,90 para 100 = R$ 0,049 por unidade
          'comments': 14.90 / 10,     // R$ 14,90 para 10 = R$ 1,49 por unidade
          'views': 4.90 / 1000        // R$ 4,90 para 1000 = R$ 0,0049 por unidade
        };
        price = quantity * rates[serviceType];
      }

      // Buscar saldo do usuário
      const { data: userData, error: userBalanceError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (userBalanceError) {
        
        return res.status(500).json({ error: 'Failed to check balance' });
      }

      const currentBalance = userData.balance || 0;

      // Verificar se tem saldo suficiente
      if (currentBalance < price) {
        return res.status(400).json({ 
          error: 'Insufficient balance',
          required: price.toFixed(2),
          current: currentBalance.toFixed(2)
        });
      }

      // Deduzir saldo
      const newBalance = currentBalance - price;

      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        
        return res.status(500).json({ error: 'Failed to update balance' });
      }

      // Criar pedido no banco (status completed = confirmado, aguardando aprovação do admin)
      const orderId = crypto.randomUUID();

      const commentText = serviceType === 'comments' ? String(comments).trim() : null;

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          service_type: serviceType,
          package_id: service,
          quantity: quantity,
          price: price,
          instagram_username: instagramUsername,
          post_url: serviceType !== 'followers' ? link : null,
          comment_text: commentText,
          status: 'completed',  // Confirmado, aguardando aprovação do admin
          payment_status: 'paid',
          payment_id: `api_${orderId}`,
          created_at: new Date().toISOString()
        });

      if (orderError) {

        // Reverter saldo em caso de erro
        await supabase
          .from('users')
          .update({ balance: currentBalance })
          .eq('id', user.id);
        
        return res.status(500).json({ error: 'Failed to create order' });
      }

      // Registrar transação de saldo
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: -price,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: `Compra via API: ${quantity} ${serviceType} para @${instagramUsername}`,
          order_id: orderId,
          status: 'completed'
        });

      console.log(`Novo saldo: R$ ${newBalance.toFixed(2)}`);

      return res.status(200).json({ 
        order: orderId,
        charge: price.toFixed(2),
        balance: newBalance.toFixed(2)
      });
    }

    // Ação: verificar status
    if (action === 'status') {
      const { order } = req.body;

      if (!order) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order)
        .single();

      if (orderError || !orderData) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Mapear status interno para formato da API
      const statusMapping = {
        'pending': 'Pending',
        'completed': 'Completed',
        'processing': 'In progress',
        'delivered': 'Completed',
        'cancelled': 'Canceled'
      };

      const apiStatus = statusMapping[orderData.status] || 'Pending';
      const remains = apiStatus === 'Completed' ? '0' : orderData.quantity.toString();

      return res.status(200).json({
        charge: orderData.price.toFixed(2),
        start_count: '0',
        status: apiStatus,
        remains: remains,
        currency: 'BRL'
      });
    }

    // Ação: verificar saldo
    if (action === 'balance') {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      const { data: userData, error: balanceError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (balanceError) {
        
        return res.status(500).json({ error: 'Failed to get balance' });
      }

      const balance = userData.balance || 0;

      return res.status(200).json({
        balance: balance.toFixed(2),
        currency: 'BRL'
      });
    }

    return res.status(400).json({
      error: 'Invalid action. Use: services, add, status, or balance'
    });

  } catch (error) {
    
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};
