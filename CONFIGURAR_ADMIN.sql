-- Script para configurar usuário admin
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário admin existe
SELECT id, email, role, is_admin FROM users WHERE email = 'userpedro111@gmail.com';

-- 2. Atualizar usuário para ser admin (se já existe)
UPDATE users 
SET 
  role = 'admin',
  is_admin = true
WHERE email = 'userpedro111@gmail.com';

-- 3. Verificar se foi atualizado
SELECT id, email, role, is_admin FROM users WHERE email = 'userpedro111@gmail.com';

-- 4. Se o usuário não existir, criar um novo admin
-- (Descomente as linhas abaixo se necessário)
/*
INSERT INTO users (id, name, email, password_hash, role, is_admin, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'Admin',
  'userpedro111@gmail.com',
  '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu', -- Admin@2024
  'admin',
  true,
  true,
  NOW()
);
*/

-- 5. Verificar todos os admins
SELECT id, name, email, role, is_admin, created_at 
FROM users 
WHERE role = 'admin' OR is_admin = true;
