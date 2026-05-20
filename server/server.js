import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/payments.js';
import forceCheckRoutes from './routes/forceCheck.js';
import adminRoutes from './routes/admin.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de segurança
app.use(helmet());

// CORS
const allowedOrigins = [
  'https://painelsmm-two.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/force-check', forceCheckRoutes);
app.use('/api/admin', adminRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: {
      type: 'Supabase',
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
    }
  });
});

// Rota de diagnóstico do banco de dados
app.get('/api/db-check', async (req, res) => {
  try {
    const { query, supabase } = await import('./config/database.js');
    
    console.log('🔍 [DB-CHECK] Verificando banco de dados Supabase...');
    
    // Verificar se tabela orders existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code !== 'PGRST116') {
      throw tableError;
    }
    
    // Contar total de pedidos
    const { count: totalOrders, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Listar últimos 5 pedidos
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) throw ordersError;
    
    res.json({
      success: true,
      data: {
        database: 'Supabase',
        tableExists: !tableError,
        totalOrders: totalOrders || 0,
        recentOrders: recentOrders || []
      }
    });
  } catch (error) {
    console.error('❌ [DB-CHECK] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      details: {
        database: 'Supabase',
        errorName: error.name,
        errorCode: error.code
      }
    });
  }
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
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

export default app;
