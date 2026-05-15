-- ============================================
-- ATUALIZAR SENHA DO ADMIN
-- ============================================
-- Execute este SQL no Supabase (SQL Editor)
-- ============================================

-- Seu usuário existe e está correto:
-- Email: userpedro111@gmail.com
-- is_admin: TRUE ✅
-- role: admin ✅
-- email_verified: TRUE ✅
-- is_active: TRUE ✅

-- O problema é o hash da senha!
-- Vamos atualizar para a senha correta:

-- ============================================
-- OPÇÃO 1: Senha: Admin@2024
-- ============================================

UPDATE users
SET password_hash = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu'
WHERE email = 'userpedro111@gmail.com';

-- Depois tente login com:
-- Email: userpedro111@gmail.com
-- Senha: Admin@2024

-- ============================================
-- OPÇÃO 2: Senha: admin123 (mais simples)
-- ============================================

/*
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'userpedro111@gmail.com';

-- Depois tente login com:
-- Email: userpedro111@gmail.com
-- Senha: admin123
*/

-- ============================================
-- OPÇÃO 3: Senha: 123456 (bem simples)
-- ============================================

/*
UPDATE users
SET password_hash = '$2a$10$8K1p/a0dL3.I1/YsGbj6OeYCkm6AYXVmVqKfvpAKfqNvJL5Hm3jKW'
WHERE email = 'userpedro111@gmail.com';

-- Depois tente login com:
-- Email: userpedro111@gmail.com
-- Senha: 123456
*/

-- ============================================
-- VERIFICAR APÓS ATUALIZAR:
-- ============================================

SELECT 
  id,
  name,
  email,
  LEFT(password_hash, 30) as hash_inicio,
  is_admin,
  role,
  email_verified,
  is_active
FROM users
WHERE email = 'userpedro111@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- hash_inicio: $2a$10$u1KFYUvrAlqj0Ep5cp9X/e
-- is_admin: true
-- role: admin
-- email_verified: true
-- is_active: true
-- ============================================

-- ============================================
-- IMPORTANTE: Configurar Variáveis na Vercel
-- ============================================
-- Mesmo com a senha correta, você precisa:
-- 1. Vercel > Settings > Environment Variables
-- 2. Adicionar:
--    SUPABASE_URL = https://xicorwjdvlpwjczvtizm.supabase.co
--    SUPABASE_ANON_KEY = (sua chave anon)
-- 3. Redeploy
-- ============================================

-- ============================================
-- TESTAR A API PRIMEIRO:
-- ============================================
-- Antes de tentar login, teste:
-- https://painelsmm-two.vercel.app/api/health
--
-- Deve retornar:
-- {
--   "success": true,
--   "database": {
--     "hasSupabaseUrl": true,
--     "hasSupabaseKey": true
--   }
-- }
--
-- Se retornar false, as variáveis não estão configuradas!
-- ============================================
