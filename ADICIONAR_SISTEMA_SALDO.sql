-- 1. Adicionar coluna de saldo na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;

-- 2. Criar tabela de transações de saldo
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'deposit' (adicionar) ou 'purchase' (compra)
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_id VARCHAR(255), -- ID do pagamento PIX (para deposits)
  order_id UUID, -- ID do pedido (para purchases)
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_payment_id ON balance_transactions(payment_id);

-- 4. Atualizar saldo dos usuários existentes para 0
UPDATE users SET balance = 0.00 WHERE balance IS NULL;

-- 5. Verificar
SELECT id, email, balance FROM users;
SELECT * FROM balance_transactions LIMIT 5;
