-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR
-- ============================================
-- Execute este SQL no Supabase (SQL Editor)
-- ============================================

-- OPÇÃO 1: Criar novo usuário admin
-- Substitua o email pelo seu email real!
INSERT INTO users (name, email, password_hash, is_admin, role, email_verified, is_active)
VALUES (
  'Administrador',
  'admin@painelsmm.com',
  '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  TRUE,
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  role = 'admin',
  email_verified = TRUE,
  is_active = TRUE;

-- ============================================
-- CREDENCIAIS DO ADMIN CRIADO:
-- ============================================
-- Email: admin@painelsmm.com
-- Senha: Admin@2024
-- ============================================
-- ⚠️ IMPORTANTE: Altere o email acima antes de executar!
-- ============================================

-- OPÇÃO 2: Tornar um usuário existente em admin
-- Descomente e substitua o email:
-- UPDATE users
-- SET is_admin = TRUE, role = 'admin', email_verified = TRUE
-- WHERE email = 'seu-email@exemplo.com';

-- ============================================
-- VERIFICAR SE FOI CRIADO:
-- ============================================
SELECT id, name, email, is_admin, role, email_verified, created_at
FROM users
WHERE is_admin = TRUE;

-- ============================================
-- PRÓXIMOS PASSOS:
-- ============================================
-- 1. Execute o SQL acima no Supabase
-- 2. Acesse: https://painelsmm-two.vercel.app
-- 3. Faça login com:
--    Email: admin@painelsmm.com (ou o que você alterou)
--    Senha: Admin@2024
-- 4. Você será redirecionado para /admin automaticamente
-- ============================================
