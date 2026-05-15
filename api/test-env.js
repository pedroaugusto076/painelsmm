// API Route para testar variáveis de ambiente no Vercel
export default function handler(req, res) {
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  
  res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV || 'unknown',
    variables: {
      SUPABASE_URL: hasSupabaseUrl ? 'configured' : 'MISSING',
      SUPABASE_ANON_KEY: hasSupabaseKey ? 'configured' : 'MISSING',
      JWT_SECRET: hasJwtSecret ? 'configured' : 'MISSING',
      SUPABASE_URL_VALUE: hasSupabaseUrl ? process.env.SUPABASE_URL.substring(0, 30) + '...' : null,
    },
    message: (hasSupabaseUrl && hasSupabaseKey && hasJwtSecret) 
      ? '✅ Todas as variáveis críticas estão configuradas'
      : '❌ FALTAM VARIÁVEIS DE AMBIENTE! Configure no Vercel: Settings > Environment Variables'
  });
}
