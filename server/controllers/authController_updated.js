// ARQUIVO TEMPORÁRIO - Copiar funções updateProfile e changePassword para authController.js

// Atualizar perfil - SUBSTITUIR NO ARQUIVO ORIGINAL
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name.trim());
      paramCount++;
    }

    if (email) {
      // Verificar se email já existe para outro usuário
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está sendo usado por outra conta'
        });
      }

      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase().trim());
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma informação para atualizar'
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
      message: 'Perfil atualizado com sucesso!',
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
    console.error('❌ Erro ao atualizar perfil:', error.message);
    const userMessage = sanitizeError(error, 'Não foi possível atualizar seu perfil. Tente novamente.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

// Mudar senha - SUBSTITUIR NO ARQUIVO ORIGINAL
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validação
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 8 caracteres'
      });
    }

    // Buscar senha atual
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
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
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao mudar senha:', error.message);
    const userMessage = sanitizeError(error, 'Não foi possível alterar sua senha. Tente novamente.');
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};
