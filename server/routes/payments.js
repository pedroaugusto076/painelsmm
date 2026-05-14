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
router.post('/check-pending', authenticateToken, checkPendingPayments);

// Buscar status do pagamento (protegido)
router.get('/status/:orderId', authenticateToken, getPaymentStatus);

// Listar pedidos do usuário (protegido)
router.get('/orders', authenticateToken, getUserOrders);

// Rota de debug do banco de dados (apenas desenvolvimento)
router.get('/debug/db', authenticateToken, async (req, res) => {
  try {
    const { query, isVercel } = await import('../config/database.js');
    
    console.log('🔍 [DEBUG] Verificando banco de dados...');
    console.log('🔍 [DEBUG] É Vercel?', isVercel);
    console.log('🔍 [DEBUG] User ID:', req.user.id);
    
    // Testar query simples
    const testResult = await query('SELECT 1 as test');
    console.log('✅ [DEBUG] Query de teste funcionou:', testResult);
    
    // Verificar se tabela orders existe
    let tableCheck;
    if (isVercel) {
      tableCheck = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'orders'
      `);
    } else {
      tableCheck = await query(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='orders'
      `);
    }
    
    console.log('📋 [DEBUG] Tabela orders existe?', tableCheck.rows);
    
    // Contar pedidos do usuário
    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [req.user.id]
    );
    
    console.log('📊 [DEBUG] Total de pedidos:', countResult.rows);
    
    res.json({
      success: true,
      data: {
        isVercel,
        userId: req.user.id,
        testQuery: testResult.rows,
        tableExists: tableCheck.rows,
        orderCount: countResult.rows
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
