const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório',
        usage: '/api/debug/check-user?email=seu@email.com'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, is_admin, role, is_active, email_verified, created_at, password_hash')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário',
        details: error.message,
        code: error.code
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        email: email
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      message: 'Usuário encontrado!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        password_hash_preview: user.password_hash ? user.password_hash.substring(0, 30) + '...' : 'NULL'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
