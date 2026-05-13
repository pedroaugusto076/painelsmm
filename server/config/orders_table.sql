-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- followers, likes, comments, views
    package_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    instagram_username VARCHAR(255) NOT NULL,
    post_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
    payment_id VARCHAR(255),
    payment_preference_id VARCHAR(255),
    payment_status VARCHAR(50), -- pending, approved, rejected, cancelled
    pix_qr_code TEXT, -- Código PIX copia e cola
    pix_qr_code_base64 TEXT, -- QR Code em base64 para exibir imagem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Comentários
COMMENT ON TABLE orders IS 'Tabela de pedidos de serviços SMM';
COMMENT ON COLUMN orders.service_type IS 'Tipo de serviço: followers, likes, comments, views';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pending, processing, completed, cancelled';
COMMENT ON COLUMN orders.payment_status IS 'Status do pagamento no Mercado Pago';
COMMENT ON COLUMN orders.pix_qr_code IS 'Código PIX para copiar e colar';
COMMENT ON COLUMN orders.pix_qr_code_base64 IS 'QR Code PIX em base64 para exibir como imagem';
