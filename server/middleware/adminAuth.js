import { query } from '../config/database.js';

export const requireAdmin = async (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    // Buscar usuário no banco para verificar se é admin
    const result = await query(
      'SELECT id, is_admin FROM users WHERE id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];

    // Verificar se é admin
    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta rota.'
      });
    }

    // Usuário é admin, continuar
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar permissões de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};
