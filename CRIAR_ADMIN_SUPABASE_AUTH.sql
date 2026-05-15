-- ============================================
-- CRIAR ADMIN NO SUPABASE AUTH
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Criar usuário no Supabase Auth
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00a16301-3d25-4925-8cec-ea1782823f25',
  '00000000-0000-0000-0000-000000000000',
  'userpedro111@gmail.com',
  '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Pedro Augusto"}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Criar/atualizar na tabela users
INSERT INTO public.users (
  id,
  name,
  email,
  password_hash,
  is_admin,
  role,
  email_verified,
  is_active
)
VALUES (
  '00a16301-3d25-4925-8cec-ea1782823f25',
  'Pedro Augusto',
  'userpedro111@gmail.com',
  'managed_by_supabase_auth',
  true,
  'admin',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  email_verified = true,
  is_active = true;

-- 3. Verificar
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  pu.name,
  pu.is_admin,
  pu.role
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'userpedro111@gmail.com';

-- ============================================
-- CREDENCIAIS DE LOGIN:
-- ============================================
-- Email: userpedro111@gmail.com
-- Senha: Admin@2024
-- ============================================
