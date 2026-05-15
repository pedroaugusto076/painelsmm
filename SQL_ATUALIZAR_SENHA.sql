-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE AGORA
-- ============================================

-- 1. Atualizar senha do admin
UPDATE users 
SET password_hash = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
    updated_at = NOW()
WHERE email = 'userpedro111@gmail.com';

-- 2. Verificar se atualizou
SELECT 
  email, 
  is_admin, 
  role,
  email_verified,
  is_active,
  substring(password_hash, 1, 30) as hash_preview
FROM users 
WHERE email = 'userpedro111@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- hash_preview: $2a$10$u1KFYUvrAlqj0Ep5cp9X/e
-- is_admin: true
-- role: admin
-- email_verified: true
-- is_active: true
-- ============================================
