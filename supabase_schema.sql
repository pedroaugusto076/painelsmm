-- ============================================
-- SCHEMA DO BANCO DE DADOS - SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para ATUALIZAR o banco existente com as novas colunas
-- ============================================

-- ============================================
-- ATUALIZAÇÃO: Adicionar colunas faltantes
-- ============================================

-- Adicionar coluna is_admin na tabela users (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN public.users.is_admin IS 'Define se o usuário tem acesso ao painel administrativo';
  END IF;
END $$;

-- Adicionar colunas smmmidia_order_id e error_message na tabela orders (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'smmmidia_order_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN smmmidia_order_id VARCHAR(255);
    COMMENT ON COLUMN public.orders.smmmidia_order_id IS 'ID do pedido no fornecedor SMMMIDIA';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN error_message TEXT;
    COMMENT ON COLUMN public.orders.error_message IS 'Mensagem de erro caso o pedido falhe';
  END IF;
END $$;

-- ============================================
-- ÍNDICES ADICIONAIS
-- ============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_smmmidia_order_id ON public.orders(smmmidia_order_id) WHERE smmmidia_order_id IS NOT NULL;

-- Índices para password_resets
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON public.password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON public.password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON public.password_resets(expires_at);

-- Índices para auth_attempts
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON public.auth_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON public.auth_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_type ON public.auth_attempts(attempt_type, created_at);

-- ============================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ============================================

-- Comentários na tabela users
COMMENT ON TABLE public.users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN public.users.role IS 'Papel do usuário no sistema (user, admin)';

-- Comentários na tabela orders
COMMENT ON TABLE public.orders IS 'Tabela de pedidos/compras dos usuários';
COMMENT ON COLUMN public.orders.status IS 'Status do pedido: pending, completed, processing, delivered, cancelled';
COMMENT ON COLUMN public.orders.service_type IS 'Tipo de serviço: followers, likes, comments, views';

-- Comentários na tabela password_resets
COMMENT ON TABLE public.password_resets IS 'Tabela para gerenciar tokens de redefinição de senha';

-- Comentários na tabela auth_attempts
COMMENT ON TABLE public.auth_attempts IS 'Tabela para rastrear tentativas de autenticação e prevenir ataques';
COMMENT ON COLUMN public.auth_attempts.attempt_type IS 'Tipo de tentativa: login, register, reset_password';

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERIR/ATUALIZAR USUÁRIO ADMIN PADRÃO
-- ============================================
-- IMPORTANTE: Altere o email e gere um novo hash de senha!
-- Para gerar o hash, use: npm run generate-admin
-- Exemplo de hash para senha "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO public.users (name, email, password_hash, is_admin, role, email_verified)
VALUES (
  'Administrador',
  'admin@painelsmm.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  TRUE,
  'admin',
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  role = 'admin',
  email_verified = TRUE;

-- ============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================

-- View: Pedidos com informações do usuário
CREATE OR REPLACE VIEW orders_with_user AS
SELECT 
  o.*,
  u.name as user_name,
  u.email as user_email
FROM public.orders o
LEFT JOIN public.users u ON o.user_id = u.id;

-- View: Estatísticas diárias
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(price) as total_revenue,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM public.orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ============================================
-- Descomente se quiser usar RLS para maior segurança

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
-- CREATE POLICY "Users can view own data" ON public.users
--   FOR SELECT USING (auth.uid() = id);

-- Política: Usuários podem ver apenas seus próprios pedidos
-- CREATE POLICY "Users can view own orders" ON public.orders
--   FOR SELECT USING (auth.uid() = user_id);

-- Política: Admins podem ver tudo
-- CREATE POLICY "Admins can view all" ON public.orders
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE users.id = auth.uid() 
--       AND users.is_admin = TRUE
--     )
--   );

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente

-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar colunas da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Contar registros em cada tabela
SELECT 
  'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'password_resets', COUNT(*) FROM public.password_resets
UNION ALL
SELECT 'auth_attempts', COUNT(*) FROM public.auth_attempts;

-- Verificar usuário admin
SELECT id, name, email, is_admin, role, created_at 
FROM public.users 
WHERE is_admin = TRUE;

-- Verificar índices criados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- CONCLUÍDO!
-- ============================================
-- ✅ Banco de dados atualizado com sucesso!
-- 
-- Próximos passos:
-- 1. Configure as variáveis de ambiente:
--    SUPABASE_URL=sua_url_aqui
--    SUPABASE_ANON_KEY=sua_chave_aqui
--
-- 2. Se necessário, crie um novo usuário admin:
--    Execute: npm run generate-admin
--
-- 3. Teste a conexão:
--    https://seu-dominio.vercel.app/api/health
-- ============================================
