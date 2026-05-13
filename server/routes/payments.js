import express from 'express';
import { 
  createPayment, 
  handleWebhook, 
  getPaymentStatus,
  getUserOrders 
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Criar pagamento (protegido)
router.post('/create', authenticateToken, createPayment);

// Webhook do Mercado Pago (público - não precisa de autenticação)
router.post('/webhook', handleWebhook);

// Buscar status do pagamento (protegido)
router.get('/status/:orderId', authenticateToken, getPaymentStatus);

// Listar pedidos do usuário (protegido)
router.get('/orders', authenticateToken, getUserOrders);

export default router;
