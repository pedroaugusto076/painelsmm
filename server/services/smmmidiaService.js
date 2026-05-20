import axios from 'axios';

const SMMMIDIA_API_URL = process.env.SMMMIDIA_API_URL || 'https://smmmidia.com/api/v2';
const SMMMIDIA_API_KEY = process.env.SMMMIDIA_API_KEY;

// Mapeamento de serviços internos para IDs da SMMMIDIA
const SERVICE_MAPPING = {
  followers: '1353',  // Instagram Seguidores BR
  likes: '1425',      // Instagram Curtidas BR
  comments: '1034',   // Instagram Comentários BR
  views: '1429'       // Instagram Visualizações
};

/**
 * Cria um pedido na API da SMMMIDIA
 * @param {string} serviceType - Tipo de serviço (followers, likes, etc)
 * @param {string} link - Link do perfil/post do Instagram
 * @param {number} quantity - Quantidade desejada
 * @returns {Promise<Object>} - Resposta da API com order ID
 */
function parseCommentLines(text) {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
}

function buildCommentsPayload(commentText) {
  return parseCommentLines(commentText).join('\n');
}

export async function createOrder(serviceType, link, quantity, commentText) {
  try {
    if (!SMMMIDIA_API_KEY) {
      throw new Error('SMMMIDIA_API_KEY não configurada');
    }

    const serviceId = SERVICE_MAPPING[serviceType];
    if (!serviceId) {
      throw new Error(`Serviço ${serviceType} não mapeado`);
    }

    const payload = {
      key: SMMMIDIA_API_KEY,
      action: 'add',
      service: serviceId,
      link: link,
      quantity: quantity
    };

    if (serviceType === 'comments') {
      if (!commentText || !commentText.trim()) {
        throw new Error('Texto do comentário não informado no pedido');
      }
      payload.comments = buildCommentsPayload(commentText);
      payload.quantity = parseCommentLines(commentText).length;
    }

    console.log('📤 Enviando pedido para SMMMIDIA:', {
      service: serviceId,
      link,
      quantity,
      hasComments: serviceType === 'comments'
    });

    const response = await axios.post(SMMMIDIA_API_URL, payload);

    console.log('✅ Resposta da SMMMIDIA:', response.data);

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return {
      success: true,
      orderId: response.data.order,
      data: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao criar pedido na SMMMIDIA:', error.message);
    
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }

    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

/**
 * Verifica o status de um pedido na SMMMIDIA
 * @param {string} orderId - ID do pedido na SMMMIDIA
 * @returns {Promise<Object>} - Status do pedido
 */
export async function getOrderStatus(orderId) {
  try {
    if (!SMMMIDIA_API_KEY) {
      throw new Error('SMMMIDIA_API_KEY não configurada');
    }

    const response = await axios.post(SMMMIDIA_API_URL, {
      key: SMMMIDIA_API_KEY,
      action: 'status',
      order: orderId
    });

    console.log(`📊 Status do pedido ${orderId}:`, response.data);

    return {
      success: true,
      status: response.data.status,
      charge: response.data.charge,
      startCount: response.data.start_count,
      remains: response.data.remains,
      currency: response.data.currency
    };

  } catch (error) {
    console.error('❌ Erro ao verificar status na SMMMIDIA:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica o saldo disponível na conta SMMMIDIA
 * @returns {Promise<Object>} - Saldo disponível
 */
export async function getBalance() {
  try {
    if (!SMMMIDIA_API_KEY) {
      throw new Error('SMMMIDIA_API_KEY não configurada');
    }

    const response = await axios.post(SMMMIDIA_API_URL, {
      key: SMMMIDIA_API_KEY,
      action: 'balance'
    });

    console.log('💰 Saldo SMMMIDIA:', response.data);

    return {
      success: true,
      balance: response.data.balance,
      currency: response.data.currency
    };

  } catch (error) {
    console.error('❌ Erro ao verificar saldo na SMMMIDIA:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

