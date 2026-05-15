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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Senha deve ter pelo menos 8 caracteres' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Registrar com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          name: name.trim()
        }
      }
    });

    if (authError) {
      console.error('Erro auth:', authError);
      
      if (authError.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está cadastrado. Tente fazer login.'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Criar registro na tabela users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: 'managed_by_supabase_auth'
      });

    if (insertError) {
      console.error('Erro ao inserir na tabela users:', insertError);
    }

    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      data: {
        user: {
          id: authData.user.id,
          name: name.trim(),
          email: authData.user.email,
          createdAt: authData.user.created_at
        },
        token: authData.session?.access_token
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Não foi possível completar o cadastro',
      error: error.message
    });
  }
};
