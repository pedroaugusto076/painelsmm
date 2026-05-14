-- Script de inicialização do banco de dados PostgreSQL
-- Execute este script no Vercel Postgres para criar as tabelas

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Tabela de reset de senha
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de tentativas de autenticação
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  email VARCHAR(255),
  user_id UUID,
  attempt_type VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  package_id VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  instagram_username VARCHAR(255) NOT NULL,
  post_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_preference_id VARCHAR(255),
  payment_status VARCHAR(50),
  pix_qr_code TEXT,
  pix_qr_code_base64 TEXT,
  smmmidia_order_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON auth_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_type ON auth_attempts(attempt_type, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
