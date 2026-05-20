const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

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
    // Verificar variáveis de ambiente críticas
    if (!process.env.JWT_SECRET) {
      
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta (JWT_SECRET)'
      });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta (Supabase)'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { action } = req.query;

    // ============================================
    // LOGIN
    // ============================================
    if (action === 'login') {
      const { email, password } = req.body;

      // Validação
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Senha é obrigatória'
        });
      }

      // Buscar usuário
      const { data: users, error: selectError } = await supabase
        .from('users')
        .select('id, name, email, password_hash, is_active, role, is_admin')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (selectError) {
        
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer login'
        });
      }

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
        });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Sua conta está desativada. Entre em contato com o suporte.'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
        });
      }

      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Gerar token
      const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role || (user.is_admin ? 'admin' : 'user')
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_admin: user.is_admin
          },
          token
        }
      });
    }

    // ============================================
    // REGISTER
    // ============================================
    if (action === 'register') {
      const { name, email, password } = req.body;

      // Validação
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres'
        });
      }

      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter pelo menos 8 caracteres'
        });
      }

      // Verificar se email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (checkError) {
        
        return res.status(500).json({
          success: false,
          message: 'Erro ao verificar email'
        });
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está cadastrado. Tente fazer login.'
        });
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Gerar ID único
      const userId = crypto.randomUUID();

      // Gerar API Key única
      const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

      // Inserir usuário
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          api_key: apiKey
        })
        .select('id, name, email, api_key, created_at')
        .single();

      if (insertError) {
        
        return res.status(500).json({
          success: false,
          message: 'Não foi possível completar o cadastro'
        });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.created_at
          },
          token
        }
      });
    }

    // ============================================
    // FORGOT PASSWORD
    // ============================================
    if (action === 'forgot-password') {
      const { email } = req.body;

      // Validação
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      // Buscar usuário
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (userError) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao buscar usuário'
        });
      }

      // Por segurança, sempre retornar sucesso mesmo se o email não existir
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

      const resetLink = `${process.env.FRONTEND_URL || 'https://painelsmm-two.vercel.app'}/reset-password?token=${resetToken}`;

      return res.status(200).json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
        // Em desenvolvimento, retornar o link (REMOVER EM PRODUÇÃO)
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      });
    }

    // ============================================
    // RESET PASSWORD
    // ============================================
    if (action === 'reset-password') {
      const { token, newPassword } = req.body;

      // Validações
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        });
      }

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter no mínimo 8 caracteres'
        });
      }

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
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha e limpar token
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
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
    }

    return res.status(400).json({
      success: false,
      message: 'Ação inválida. Use: login, register, forgot-password ou reset-password'
    });

  } catch (error) {

    // Garantir que sempre retornamos JSON
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
