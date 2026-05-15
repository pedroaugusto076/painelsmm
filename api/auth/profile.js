const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Buscar usuário
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, email_verified, created_at, last_login, role, is_admin')
      .eq('id', decoded.userId)
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

    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      message: 'Não foi possível carregar seu perfil. Tente novamente.'
    });
  }
};
