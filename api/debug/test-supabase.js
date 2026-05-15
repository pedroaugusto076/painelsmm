const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const checks = {
      env_vars: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET,
        SUPABASE_URL_value: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 40) + '...' : null
      },
      connection: null,
      query_test: null
    };

    // Testar conexão
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      
      checks.connection = '✅ Cliente Supabase criado';

      // Testar query simples
      const { data, error, count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        checks.query_test = {
          status: '❌ Erro na query',
          error: error.message,
          code: error.code
        };
      } else {
        checks.query_test = {
          status: '✅ Query funcionou',
          total_users: count,
          sample_user_id: data && data.length > 0 ? data[0].id : null
        };
      }
    } catch (error) {
      checks.connection = '❌ Erro ao criar cliente: ' + error.message;
    }

    return res.status(200).json({
      success: true,
      message: 'Diagnóstico completo',
      checks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
