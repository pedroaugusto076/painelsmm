-- Adiciona coluna para texto dos comentários personalizados
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comment_text TEXT;
