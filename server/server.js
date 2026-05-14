import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/payments.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - prevenir ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas de login
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

// Aplicar rate limiting geral
app.use('/api/', limiter);

// Log de requisições em produção
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Rota 404
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.url,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Erro global:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor apenas em desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

export default app;
