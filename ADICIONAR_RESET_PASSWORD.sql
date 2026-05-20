-- Adicionar colunas para recuperação de senha na tabela users

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Criar índice para melhorar performance na busca por token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
