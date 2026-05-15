import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { sendPasswordResetEmail } from '../config/email.js';

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Função para obter IP do cliente
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
};

// Registro de novo usuário
export const register = async (req, res) => {
  const ip = getClientIp(req);
  const { name, email, password } = req.body;

  try {
    // Validação adicional de entrada
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
    const crypto = await import('crypto');
    const userId = crypto.randomUUID();

    // Inserir usuário no banco
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash
      })
      .select('id, name, email, created_at')
      .single();

    if (insertError) {
      console.error('Erro ao inserir usuário:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Não foi possível completar o cadastro'
      });
    }

    // Gerar token
    const token = generateToken(newUser.id);

    res.status(201).json({
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
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível completar o cadastro. Tente novamente mais tarde.'
    });
  }
};

// Login de usuário
export const login = async (req, res) => {
  const ip = getClientIp(req);
  const { email, password } = req.body;

  try {
    // Validação de entrada
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

    // Se usuário não existe
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
      });
    }

    const user = users[0];

    // Verificar se conta está ativa
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
    const token = generateToken(user.id);

    res.json({
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
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível fazer login. Tente novamente mais tarde.'
    });
  }
};

// Obter perfil do usuário autenticado
export const getProfile = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, email_verified, created_at, last_login, role, is_admin')
      .eq('id', req.user.id)
      .limit(1);

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar perfil'
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          role: user.role,
          isAdmin: user.is_admin
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível carregar seu perfil. Tente novamente.'
    });
  }
};

// Atualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) {
      updates.name = name;
    }

    if (email) {
      // Verificar se email já existe para outro usuário
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', req.user.id)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, updated_at')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          updatedAt: updatedUser.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível atualizar seu perfil. Tente novamente.'
    });
  }
};

// Mudar senha
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Buscar senha atual
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .limit(1);

    if (selectError || !users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar senha'
      });
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível alterar sua senha. Tente novamente.'
    });
  }
};

// Verificar token (para validar se ainda está válido)
export const verifyToken = async (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
};