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
        console.error('Erro ao buscar usuário:', selectError);
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
        console.error('Erro ao verificar email:', checkError);
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
        console.error('Erro ao inserir usuário:', insertError);
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

    return res.status(400).json({
      success: false,
      message: 'Ação inválida. Use: login ou register'
    });

  } catch (error) {
    console.error('❌ [AUTH] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
