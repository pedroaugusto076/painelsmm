// API Serverless - Esqueci a Senha
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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
    const { email } = req.body;

    // Validações
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Conectar ao Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Verificar se o usuário existe
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .limit(1);

    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário'
      });
    }

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      });
    }

    const user = users[0];

    // Gerar token de recuperação (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hora

    // Salvar token no banco
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar token de recuperação'
      });
    }

    // TODO: Enviar email com o link de recuperação
    // Por enquanto, vamos apenas retornar sucesso
    // Em produção, você deve integrar com um serviço de email (Resend, SendGrid, etc.)
    
    const resetLink = `${process.env.FRONTEND_URL || 'https://painelsmm-two.vercel.app'}/reset-password?token=${resetToken}`;
    
    // Aqui você enviaria o email com o resetLink
    // await sendEmail(user.email, 'Recuperação de Senha', resetLink);

    return res.status(200).json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
      // Em desenvolvimento, retornar o link (REMOVER EM PRODUÇÃO)
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
};
