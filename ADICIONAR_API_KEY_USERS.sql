-- Adicionar coluna api_key na tabela users (aumentado para 100 caracteres)
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key VARCHAR(100) UNIQUE;

-- Gerar API keys para usuários existentes (sk_ + 32 bytes hex = 3 + 64 = 67 caracteres)
UPDATE users 
SET api_key = 'sk_' || encode(gen_random_bytes(32), 'hex')
WHERE api_key IS NULL;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- Verificar
SELECT id, email, api_key FROM users LIMIT 5;
