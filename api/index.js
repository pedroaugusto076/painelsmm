// Vercel Serverless Function Entry Point
// Usando dynamic import para suportar ES modules

export default async function handler(req, res) {
  try {
    // Importar o app dinamicamente
    const { default: app } = await import('../server/server.js');
    
    // Executar o app
    return app(req, res);
  } catch (error) {
    console.error('Erro ao carregar servidor:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
