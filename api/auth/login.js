const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (authError) {
      console.error('Erro auth:', authError);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
      });
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, is_admin')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
    }

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: userData || {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || 'Usuário',
          role: 'user',
          is_admin: false
        },
        token: authData.session.access_token
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};
