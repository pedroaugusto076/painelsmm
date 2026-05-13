# Guia de Deploy no Vercel

## Problemas Corrigidos

### 1. Erro de Sintaxe no authController.js
- **Problema**: `};` duplicado causando erro de parsing
- **Solução**: Removido o `};` extra após a função `clearFailedAttempts`

### 2. Erro Crítico no database.js
- **Problema**: String literal não terminada causando "Cannot use import statement outside a module"
- **Solução**: Corrigido a linha `if (sqlQuery.includes('?') && !sqlQuery.includes('$'))`

## Configuração do Vercel

### Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel do Vercel:

```env
# JWT Configuration
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production

# Frontend URL (URL do seu projeto Vercel)
FRONTEND_URL=https://seu-projeto.vercel.app

# Backend URL (mesma URL do projeto)
BACKEND_URL=https://seu-projeto.vercel.app

# Resend Email Configuration
RESEND_API_KEY=sua_chave_resend_aqui
EMAIL_FROM="Seu Nome <seu-email@resend.dev>"

# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago_aqui
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui

# SMMMIDIA API Configuration
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=sua_chave_smmmidia_aqui
SMMMIDIA_SERVICE_ID=1353

# Vercel Postgres (será configurado automaticamente pelo Vercel)
POSTGRES_URL=será_configurado_pelo_vercel
```

### Configuração do Banco de Dados

1. No painel do Vercel, vá em **Storage** → **Create Database**
2. Selecione **Postgres**
3. Crie o banco de dados
4. O Vercel irá automaticamente adicionar as variáveis `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.

### Criar Tabelas no Postgres

Após criar o banco de dados, execute os seguintes comandos SQL no console do Vercel Postgres:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Tabela de redefinição de senha
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de tentativas de autenticação
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email TEXT,
  user_id UUID,
  attempt_type TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  package_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  instagram_username TEXT NOT NULL,
  post_url TEXT,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  payment_preference_id TEXT,
  payment_status TEXT,
  pix_qr_code TEXT,
  pix_qr_code_base64 TEXT,
  smmmidia_order_id TEXT,
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
```

## Passos para Deploy

1. **Instalar Vercel CLI** (se ainda não tiver):
   ```bash
   npm install -g vercel
   ```

2. **Fazer login no Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy do projeto**:
   ```bash
   cd painelsmm
   vercel
   ```

4. **Configurar variáveis de ambiente**:
   - Acesse o painel do Vercel
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis listadas acima

5. **Criar banco de dados Postgres**:
   - Vá em Storage → Create Database → Postgres
   - Execute os comandos SQL acima no console

6. **Fazer novo deploy** (para aplicar as variáveis):
   ```bash
   vercel --prod
   ```

## Verificação

Após o deploy, teste as seguintes rotas:

1. **Health Check**: `https://seu-projeto.vercel.app/api/health`
2. **Registro**: `POST https://seu-projeto.vercel.app/api/auth/register`
3. **Login**: `POST https://seu-projeto.vercel.app/api/auth/login`

## Troubleshooting

### Erro "Cannot use import statement outside a module"
- ✅ **Corrigido**: Erro de sintaxe no `database.js` foi corrigido

### Erro "Unexpected token 'A'"
- ✅ **Corrigido**: Erro de sintaxe no `authController.js` foi corrigido

### Erro de conexão com banco de dados
- Verifique se as variáveis `POSTGRES_URL` estão configuradas
- Verifique se as tabelas foram criadas no banco de dados

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurado corretamente
- Deve ser a URL completa do seu projeto Vercel

## Logs

Para ver os logs do servidor no Vercel:
```bash
vercel logs
```

Ou acesse o painel do Vercel → seu projeto → Deployments → clique no deployment → Functions
