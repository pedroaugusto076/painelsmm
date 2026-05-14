import express from 'express';
import { 
  createPayment, 
  handleWebhook, 
  getPaymentStatus,
  getUserOrders,
  checkPendingPayments
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Criar pagamento (protegido)
router.post('/create', authenticateToken, createPayment);

// Webhook do Mercado Pago (público - não precisa de autenticação)
router.post('/webhook', handleWebhook);

// Rota de teste do webhook (apenas para desenvolvimento)
router.get('/webhook-test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint está ativo',
    timestamp: new Date().toISOString(),
    env: {
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      backendUrl: process.env.BACKEND_URL
    }
  });
});

// Verificar pagamentos pendentes manualmente (protegido)
router.get('/check-pending', authenticateToken, checkPendingPayments);

// Buscar status do pagamento (protegido)
router.get('/status/:orderId', authenticateToken, getPaymentStatus);

// Listar pedidos do usuário (protegido)
router.get('/orders', authenticateToken, getUserOrders);

export default router;
