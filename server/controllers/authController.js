import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
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

// Função para registrar tentativa de autenticação
const logAuthAttempt = async (ip, email, userId, type, success) => {
  try {
    await query(
      'INSERT INTO auth_attempts (ip_address, email, user_id, attempt_type, success) VALUES (?, ?, ?, ?, ?)',
      [ip, email, userId, type, success]
    );
  } catch (error) {
    // Log silencioso - não mostrar no console
  }
};

// Função para verificar rate limiting (30 TENTATIVAS EM 30 MINUTOS POR USUÁRIO)
const checkRateLimit = async (ip, userId, type) => {
  // Verificar tentativas por IP (últimos 30 minutos)
  const ipAttempts = await query(
    `SELECT COUNT(*) as count FROM auth_attempts 
     WHERE ip_address = ? 
     AND attempt_type = ? 
     AND created_at > datetime('now', '-30 minutes')`,
    [ip, type]
  );

  const ipCount = parseInt(ipAttempts.rows[0].count);
  
  // Limite por IP: 100 tentativas em 30 minutos (muito permissivo)
  if (ipCount >= 100) {
    return {
      limited: true,
      message: 'Muitas tentativas deste dispositivo. Por favor, aguarde 30 minutos.'
    };
  }

  // Se userId fornecido, verificar tentativas por usuário
  if (userId) {
    const userAttempts = await query(
      `SELECT COUNT(*) as count FROM auth_attempts 
       WHERE user_id = ? 
       AND attempt_type = ? 
       AND created_at > datetime('now', '-30 minutes')`,
      [userId, type]
    );

    const userCount = parseInt(userAttempts.rows[0].count);
    
    // Limite por usuário: 30 tentativas em 30 minutos
    if (userCount >= 30) {
      return {
        limited: true,
        message: 'Muitas tentativas para este usuário. Por favor, aguarde 30 minutos.'
      };
    }
  }

  return { limited: false };
};

// Função para limpar tentativas falhadas após login bem-sucedido
const clearFailedAttempts = async (userId, type) => {
  try {
    await query(
      'DELETE FROM auth_attempts WHERE user_id = ? AND attempt_type = ? AND success = ?',
      [userId, type, 0]
    );
  } catch (error) {
    // Log silencioso - não mostrar no console
  }
};

// Função para sanitizar mensagens de erro (não expor detalhes técnicos)
const sanitizeError = (error, defaultMessage) => {
  // Lista de erros técnicos que não devem ser expostos
  const technicalErrors = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'relation',
    'column',
    'syntax',
    'constraint',
    'duplicate key',
    'violates',
    'pg_',
    'SQL',
    'database'
  ];

  const errorMessage = error.message || '';
  
  // Verificar se contém termos técnicos
  const isTechnical = technicalErrors.some(term => 
    errorMessage.toLowerCase().includes(term.toLowerCase())
  );

  if (isTechnical) {
    return defaultMessage;
  }

  return errorMessage || defaultMessage;
};

// Registro de novo usuário
export const register = async (req, res) => {
  const ip = getClientIp(req);
  const { name, email, password } = req.body;

  try {
    // Verificar rate limiting por IP apenas (não tem user_id ainda)
    const rateCheck = await checkRateLimit(ip, null, 'register');
    if (rateCheck.limited) {
      await logAuthAttempt(ip, email, null, 'register', false);
      return res.status(429).json({
        success: false,
        message: rateCheck.message
      });
    }

    // Validação adicional de entrada
    if (!name || name.trim().length < 2) {
      await logAuthAttempt(ip, email, null, 'register', false);
      return res.status(400).json({
        success: false,
        message: 'Nome deve ter pelo menos 2 caracteres'
      });
    }

    if (!email || !email.includes('@')) {
      await logAuthAttempt(ip, email, null, 'register', false);
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (!password || password.length < 8) {
      await logAuthAttempt(ip, email, null, 'register', false);
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres'
      });
    }

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      await logAuthAttempt(ip, email, null, 'register', false);
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado. Tente fazer login.'
      });
    }

    // Hash da senha
    const saltRounds = 12; // Aumentado para maior segurança
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Gerar ID único
    const crypto = await import('crypto');
    const userId = crypto.randomUUID();

    // Inserir usuário no banco
    await query(
      `INSERT INTO users (id, name, email, password_hash) 
       VALUES (?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    // Buscar usuário inserido
    const userResult = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = userResult.rows[0];

    // Registrar tentativa bem-sucedida
    await logAuthAttempt(ip, email, user.id, 'register', true);

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    await logAuthAttempt(ip, email, null, 'register', false);
    
    const userMessage = sanitizeError(error, 'Não foi possível completar o cadastro. Tente novamente mais tarde.');
    
    res.status(500).json({
      success: false,
      message: userMessage
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
      await logAuthAttempt(ip, email, null, 'login', false);
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (!password) {
      await logAuthAttempt(ip, email, null, 'login', false);
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    // Buscar usuário PRIMEIRO para pegar o user_id
    const result = await query(
      'SELECT id, name, email, password_hash, is_active, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Se usuário não existe, registrar tentativa sem user_id
    if (result.rows.length === 0) {
      await logAuthAttempt(ip, email, null, 'login', false);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
      });
    }

    const user = result.rows[0];

    // Verificar rate limiting POR USUÁRIO (user_id)
    const rateCheck = await checkRateLimit(ip, user.id, 'login');
    if (rateCheck.limited) {
      await logAuthAttempt(ip, email, user.id, 'login', false);
      return res.status(429).json({
        success: false,
        message: rateCheck.message
      });
    }

    // Verificar se conta está ativa
    if (!user.is_active) {
      await logAuthAttempt(ip, email, user.id, 'login', false);
      return res.status(403).json({
        success: false,
        message: 'Sua conta está desativada. Entre em contato com o suporte.'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await logAuthAttempt(ip, email, user.id, 'login', false);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.'
      });
    }

    // Atualizar último login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Registrar tentativa bem-sucedida
    await logAuthAttempt(ip, email, user.id, 'login', true);

    // LIMPAR todas as tentativas falhadas anteriores deste usuário
    await clearFailedAttempts(user.id, 'login');

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
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    await logAuthAttempt(ip, email, null, 'login', false);
    
    const userMessage = sanitizeError(error, 'Não foi possível fazer login. Tente novamente mais tarde.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// Obter perfil do usuário autenticado
export const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, email_verified, created_at, last_login, role FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];

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
          role: user.role
        }
      }
    });
  } catch (error) {
    const userMessage = sanitizeError(error, 'Não foi possível carregar seu perfil. Tente novamente.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// Atualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = [];
    const values = [];
    

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      
    }

    if (email) {
      // Verificar se email já existe para outro usuário
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      updates.push(`email = $${paramCount}`);
      values.push(email);
      
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    values.push(req.user.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, email, updated_at`,
      values
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    const userMessage = sanitizeError(error, 'Não foi possível atualizar seu perfil. Tente novamente.');
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// Mudar senha
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Buscar senha atual
    const result = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = result.rows[0];

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
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    const userMessage = sanitizeError(error, 'Não foi possível alterar sua senha. Tente novamente.');
    res.status(500).json({
      success: false,
      message: userMessage
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

// Esqueceu senha - enviar email com token
export const forgotPassword = async (req, res) => {
  const ip = getClientIp(req);
  const { email } = req.body;

  try {
    // Validação de entrada
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça um email válido'
      });
    }

    // Buscar usuário
    const result = await query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Por segurança, sempre retornar sucesso mesmo se email não existir
    if (result.rows.length === 0) {
      await logAuthAttempt(ip, email, null, 'password_reset', false);
      return res.json({
        success: true,
        message: 'Se o email existir em nossa base, você receberá um link de recuperação'
      });
    }

    const user = result.rows[0];

    // PROTEÇÃO 1: Verificar se já existe um token recente (último 1 minuto)
    const recentTokenCheck = await query(
      `SELECT created_at FROM password_resets 
       WHERE user_id = ? 
       AND created_at > datetime('now', '-1 minute')`,
      [user.id]
    );

    if (recentTokenCheck.rows.length > 0) {
      const createdAt = new Date(recentTokenCheck.rows[0].created_at);
      const now = new Date();
      const diffSeconds = Math.floor((now - createdAt) / 1000);
      const waitSeconds = 60 - diffSeconds; // 1 minuto = 60 segundos

      await logAuthAttempt(ip, email, user.id, 'password_reset', false);
      return res.status(429).json({
        success: false,
        message: `Por favor, aguarde antes de solicitar um novo link`,
        waitSeconds
      });
    }

    // PROTEÇÃO 2: Limitar tentativas por usuário (máximo 10 tokens em 1 hora)
    const attemptsCheck = await query(
      `SELECT COUNT(*) as count FROM password_resets 
       WHERE user_id = ? 
       AND created_at > datetime('now', '-1 hour')`,
      [user.id]
    );

    const attemptCount = parseInt(attemptsCheck.rows[0].count);
    if (attemptCount >= 10) {
      await logAuthAttempt(ip, email, user.id, 'password_reset', false);
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Por favor, aguarde 1 hora antes de tentar novamente.'
      });
    }

    // PROTEÇÃO 3: Rate limiting por IP e user_id
    const rateCheck = await checkRateLimit(ip, user.id, 'password_reset');
    if (rateCheck.limited) {
      await logAuthAttempt(ip, email, user.id, 'password_reset', false);
      return res.status(429).json({
        success: false,
        message: rateCheck.message
      });
    }

    // Gerar token de recuperação (válido por 1 hora)
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hora

    // Deletar tokens antigos do usuário
    await query(
      'DELETE FROM password_resets WHERE user_id = ?',
      [user.id]
    );

    // Salvar novo token no banco
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) 
       VALUES (?, ?, ?)`,
      [user.id, resetTokenHash, resetTokenExpiry]
    );

    // Criar link de recuperação
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetLink);
      await logAuthAttempt(ip, email, user.id, 'password_reset', true);
    } catch (emailError) {
      await logAuthAttempt(ip, email, user.id, 'password_reset', false);
      // Continuar mesmo se o email falhar (token já foi salvo)
    }

    res.json({
      success: true,
      message: 'Se o email existir em nossa base, você receberá um link de recuperação'
    });
  } catch (error) {
    await logAuthAttempt(ip, email, null, 'password_reset', false);
    
    const userMessage = sanitizeError(error, 'Não foi possível processar sua solicitação. Tente novamente mais tarde.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// Redefinir senha com token
export const resetPassword = async (req, res) => {
  const ip = getClientIp(req);
  
  try {
    const { token, password } = req.body;

    // Validação de entrada
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de recuperação é obrigatório'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 8 caracteres'
      });
    }

    // Hash do token recebido
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar token válido
    const result = await query(
      `SELECT pr.user_id, pr.expires_at, u.email 
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = ? AND pr.expires_at > datetime('now')`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      await logAuthAttempt(ip, null, 'password_reset', false);
      return res.status(400).json({
        success: false,
        message: 'Link de recuperação inválido ou expirado. Solicite um novo link.'
      });
    }

    const { user_id, email } = result.rows[0];

    // Hash da nova senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Atualizar senha
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, user_id]
    );

    // Deletar token usado
    await query(
      'DELETE FROM password_resets WHERE user_id = ?',
      [user_id]
    );

    await logAuthAttempt(ip, email, 'password_reset', true);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    });
  } catch (error) {
    await logAuthAttempt(ip, null, null, 'password_reset', false);
    
    const userMessage = sanitizeError(error, 'Não foi possível redefinir sua senha. Tente novamente mais tarde.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

