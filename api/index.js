// Vercel Serverless Function Entry Point
let app;

export default async function handler(req, res) {
  try {
    // Importar o app apenas uma vez (cache)
    if (!app) {
      const serverModule = await import('../server/server.js');
      app = serverModule.default;
    }
    
    // Express app já é um handler válido
    return app(req, res);
  } catch (error) {
    console.error('❌ Erro ao carregar servidor:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
