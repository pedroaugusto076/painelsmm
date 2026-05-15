-- ============================================
-- DESABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
-- O Supabase está bloqueando inserções por causa do RLS
-- Execute este SQL no Supabase SQL Editor AGORA!
-- ============================================

-- Desabilitar RLS na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Resultado esperado: rowsecurity = false

-- ============================================
-- ALTERNATIVA: Criar política permissiva
-- ============================================
-- Se preferir manter RLS ativo mas permitir inserções:

/*
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir INSERT de qualquer um
CREATE POLICY "Permitir INSERT público" 
ON users 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Criar política para permitir SELECT de qualquer um
CREATE POLICY "Permitir SELECT público" 
ON users 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Criar política para permitir UPDATE do próprio usuário
CREATE POLICY "Permitir UPDATE próprio usuário" 
ON users 
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);
*/

-- ============================================
-- RECOMENDAÇÃO: DESABILITAR RLS
-- ============================================
-- Para este projeto, é mais simples desabilitar o RLS
-- porque você está usando JWT próprio, não o auth do Supabase
-- ============================================
