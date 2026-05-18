// API Pública v1 - Endpoint Único
// Compatível com formato SMMMIDIA
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Mapeamento de service IDs para tipos internos
const SERVICE_MAPPING = {
  '1': 'followers',
  '2': 'likes',
  '3': 'comments',
  '4': 'views'
};

module.exports = async function handler(req, res) {
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

    const validApiKey = process.env.PUBLIC_API_KEY || 'demo-key-123';
    
    if (key !== validApiKey) {
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }

    // Ação: listar serviços
    if (action === 'services') {
      const services = [
        {
          service: '1',
          name: 'Instagram Seguidores Brasil',
          type: 'Default',
          category: 'Instagram',
          rate: '0.15',
          min: '100',
          max: '10000',
          description: 'Seguidores brasileiros reais e ativos'
        },
        {
          service: '2',
          name: 'Instagram Curtidas Brasil',
          type: 'Default',
          category: 'Instagram',
          rate: '0.12',
          min: '100',
          max: '10000',
          description: 'Curtidas de perfis brasileiros'
        },
        {
          service: '3',
          name: 'Instagram Comentários Brasil',
          type: 'Custom Comments',
          category: 'Instagram',
          rate: '0.20',
          min: '10',
          max: '500',
          description: 'Comentários personalizados em português'
        },
        {
          service: '4',
          name: 'Instagram Visualizações',
          type: 'Default',
          category: 'Instagram',
          rate: '0.10',
          min: '1000',
          max: '100000',
          description: 'Visualizações para vídeos e reels'
        }
      ];

      return res.status(200).json(services);
    }

    // Ação: adicionar pedido
    if (action === 'add') {
      const { service, link, quantity } = req.body;

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

      // Criar pedido no banco
      const orderId = crypto.randomUUID();
      
      // Calcular preço baseado no serviço e quantidade
      const rates = {
        'followers': 0.0015,
        'likes': 0.0012,
        'comments': 0.0020,
        'views': 0.0010
      };
      
      const price = quantity * rates[serviceType];

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: '00000000-0000-0000-0000-000000000000', // API user
          service_type: serviceType,
          package_id: service,
          quantity: quantity,
          price: price,
          instagram_username: instagramUsername,
          post_url: serviceType !== 'followers' ? link : null,
          status: 'processing',
          payment_status: 'paid',
          created_at: new Date().toISOString()
        });

      if (orderError) {
        console.error('Erro ao criar pedido:', orderError);
        return res.status(500).json({ error: 'Failed to create order' });
      }

      return res.status(200).json({ order: orderId });
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
      return res.status(200).json({
        balance: '999999.99',
        currency: 'BRL'
      });
    }

    return res.status(400).json({
      error: 'Invalid action. Use: services, add, status, or balance'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};
