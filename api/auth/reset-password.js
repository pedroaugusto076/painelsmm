// API Serverless - Redefinir Senha
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { token, newPassword } = req.body;

    // Validações
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Conectar ao Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário pelo token
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, reset_token_expiry')
      .eq('reset_token', token)
      .limit(1);

    if (userError || !users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const user = users[0];

    // Verificar se o token expirou
    const now = new Date();
    const expiry = new Date(user.reset_token_expiry);

    if (now > expiry) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicite uma nova recuperação de senha.'
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar senha'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
};
