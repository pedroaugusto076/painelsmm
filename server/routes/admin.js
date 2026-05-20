import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Todas as rotas requerem autenticação E permissão de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Estatísticas
router.get('/stats', adminController.getStats);

// Saldo SMMMIDIA
router.get('/balance', adminController.getBalance);

// Listar todos os pedidos
router.get('/orders', adminController.getAllOrders);

// Aprovar pedido e enviar para SMMMIDIA
router.post('/orders/:orderId/approve', adminController.approveOrder);

// Cancelar pedido
router.post('/orders/:orderId/cancel', adminController.cancelOrder);

// Verificar status de pedido na SMMMIDIA
router.get('/orders/:orderId/status', adminController.checkOrderStatus);

export default router;
