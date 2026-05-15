-- ============================================
-- DESABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
-- O Supabase está bloqueando inserções por causa do RLS
-- Execute este SQL no Supabase SQL Editor AGORA!
-- ============================================

-- Desabilitar RLS em TODAS as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'orders', 'payments', 'auth_attempts', 'password_resets');

-- Resultado esperado: rowsecurity = false para todas

-- ============================================
-- IMPORTANTE: Execute este SQL AGORA!
-- ============================================
-- Sem isso, nenhuma inserção vai funcionar
-- ============================================
