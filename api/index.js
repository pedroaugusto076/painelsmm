// Vercel Serverless Function Entry Point
let app;
let initError;

async function initializeApp() {
  if (app) return app;
  if (initError) throw initError;
  
  try {
    console.log('🚀 [API] Inicializando servidor...');
    console.log('📁 [API] __dirname:', import.meta.url);
    console.log('🔧 [API] NODE_ENV:', process.env.NODE_ENV);
    
    const serverModule = await import('../server/server.js');
    app = serverModule.default;
    
    console.log('✅ [API] Servidor inicializado com sucesso!');
    return app;
  } catch (error) {
    console.error('❌ [API] Erro ao inicializar servidor:', error);
    console.error('📋 [API] Tipo:', error.constructor.name);
    console.error('📋 [API] Mensagem:', error.message);
    console.error('📋 [API] Stack:', error.stack);
    console.error('📋 [API] Causa:', error.cause);
    
    initError = error;
    throw error;
  }
}

export default async function handler(req, res) {
  console.log(`📥 [API] ${req.method} ${req.url}`);
  
  try {
    const expressApp = await initializeApp();
    
    // Ajustar o path para o Express processar corretamente
    // Vercel envia /api/payments/webhook, mas Express espera /api/payments/webhook
    const originalUrl = req.url;
    
    console.log('🔍 [API] URL original:', originalUrl);
    console.log('🔍 [API] Headers:', JSON.stringify(req.headers, null, 2));
    
    // Express app já é um handler válido
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ [API] Erro ao processar requisição:', error);
    console.error('📋 [API] URL:', req.url);
    console.error('📋 [API] Method:', req.method);
    console.error('📋 [API] Headers:', JSON.stringify(req.headers, null, 2));
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
