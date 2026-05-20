import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Mapeamento de serviços para IDs da SMMMIDIA
const SERVICE_MAPPING = {
  followers: process.env.SMMMIDIA_SERVICE_ID || process.env.SMMMIDIA_SERVICE_FOLLOWERS || '1353',
  likes: process.env.SMMMIDIA_SERVICE_LIKES || '1354',
  comments: process.env.SMMMIDIA_SERVICE_COMMENTS || '1355',
  views: process.env.SMMMIDIA_SERVICE_VIEWS || '1356'
};

async function sendToSMMIDIA(serviceType, link, quantity) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const serviceId = SERVICE_MAPPING[serviceType];
    if (!serviceId) {
      throw new Error(`Serviço ${serviceType} não mapeado`);
    }

    const response = await fetch(process.env.SMMMIDIA_API_URL || 'https://smmmidia.com/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: process.env.SMMMIDIA_API_KEY,
        action: 'add',
        service: serviceId,
        link: link,
        quantity: quantity
      })
    });

    const data = await response.json();

    // Se a API retornar um erro
    if (data.error) {
      return {
        success: false,
        error: data.error,
        apiResponse: data
      };
    }

    // Se não tiver o campo 'order', algo deu errado
    if (!data.order) {
      return {
        success: false,
        error: 'Resposta inválida da API SMMMIDIA',
        apiResponse: data
      };
    }

    return {
      success: true,
      orderId: data.order,
      data: data
    };
  } catch (error) {
    
    return {
      success: false,
      error: error.message,
      apiResponse: null
    };
  }
}

export default async function handler(req, res) {
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

    // Verificar se é admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }

    const { orderId } = req.query;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Verificar se o pagamento foi confirmado
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Pedido precisa estar com pagamento confirmado (status: completed)'
      });
    }

    // Construir link do Instagram
    let link = '';
    if (order.service_type === 'followers') {
      link = `https://instagram.com/${order.instagram_username}`;
    } else if (order.post_url) {
      link = order.post_url;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Link do Instagram não disponível'
      });
    }

    // Enviar para SMMMIDIA
    const smmmidiaResult = await sendToSMMIDIA(
      order.service_type,
      link,
      order.quantity
    );

    if (!smmmidiaResult.success) {

      // Salvar erro no banco
      await supabase
        .from('orders')
        .update({
          error_message: smmmidiaResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar para o fornecedor',
        error: smmmidiaResult.error,
        apiResponse: smmmidiaResult.apiResponse,
        details: {
          serviceType: order.service_type,
          serviceId: SERVICE_MAPPING[order.service_type],
          link: link,
          quantity: order.quantity,
          apiConfigured: !!process.env.SMMMIDIA_API_KEY,
          apiUrl: process.env.SMMMIDIA_API_URL || 'https://smmmidia.com/api/v2'
        }
      });
    }

    // Atualizar pedido com ID da SMMMIDIA e status
    await supabase
      .from('orders')
      .update({
        smmmidia_order_id: smmmidiaResult.orderId.toString(),
        status: 'processing',
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return res.status(200).json({
      success: true,
      message: 'Pedido aprovado e enviado para o fornecedor com sucesso!',
      data: {
        orderId: order.id,
        smmmidiaOrderId: smmmidiaResult.orderId,
        smmmidiaResponse: smmmidiaResult.data
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao aprovar pedido',
      error: error.message
    });
  }
}
