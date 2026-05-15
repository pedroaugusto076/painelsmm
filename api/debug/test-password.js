const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Use POST',
      usage: 'POST /api/debug/test-password com body: { "email": "seu@email.com", "password": "suasenha" }'
    });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e password são obrigatórios'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        step: 'buscar_usuario',
        error: error.message
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        step: 'buscar_usuario',
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Testar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    return res.status(200).json({
      success: true,
      message: isPasswordValid ? '✅ SENHA CORRETA!' : '❌ SENHA INCORRETA',
      details: {
        user_id: user.id,
        email: user.email,
        password_hash_preview: user.password_hash.substring(0, 30) + '...',
        password_provided: password,
        password_valid: isPasswordValid
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      step: 'exception',
      error: error.message,
      stack: error.stack
    });
  }
};
