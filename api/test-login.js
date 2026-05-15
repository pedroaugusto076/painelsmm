// API Route para testar login diretamente
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Variáveis de ambiente não configuradas'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { email, password } = req.body;
    
    // Buscar usuário
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, email, password_hash, is_admin, role, is_active')
      .eq('email', email)
      .limit(1);
    
    if (selectError) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário',
        details: selectError.message
      });
    }
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        email: email
      });
    }
    
    const user = users[0];
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    return res.status(200).json({
      success: true,
      userFound: true,
      passwordValid: isPasswordValid,
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        role: user.role,
        is_active: user.is_active,
        hash_preview: user.password_hash.substring(0, 30)
      },
      message: isPasswordValid 
        ? '✅ Login válido! Senha correta.' 
        : '❌ Senha incorreta. Execute o SQL para atualizar a senha.'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
