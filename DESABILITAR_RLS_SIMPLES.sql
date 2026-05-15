-- ============================================
-- DESABILITAR RLS - VERSÃO SIMPLES
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Desabilitar RLS nas tabelas que existem
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Se estas tabelas existirem, desabilitar também:
-- (Se der erro, ignore e continue)
ALTER TABLE auth_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets DISABLE ROW LEVEL SECURITY;

-- Verificar quais tabelas você tem
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- RESULTADO: Todas devem ter rowsecurity = false
-- ============================================
