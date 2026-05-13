import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Verificar se usuário ainda existe e está ativo
      const result = await query(
        'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Conta desativada'
        });
      }

      // Adicionar informações do usuário ao request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
};

// Middleware para verificar se é admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
};

// Middleware para verificar se o usuário está acessando seus próprios dados
export const isOwnerOrAdmin = (req, res, next) => {
  const requestedUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.id === requestedUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  }
};
