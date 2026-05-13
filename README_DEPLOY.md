# 🚀 Guia Rápido de Deploy

## ✅ Correções Aplicadas

Todos os erros foram corrigidos:
- ✅ "Cannot use import statement outside a module"
- ✅ "Unexpected token 'A'"
- ✅ Sintaxe SQL incorreta
- ✅ Polling automático de pagamento implementado

## 📋 Checklist Antes do Deploy

### 1. Verificar Arquivos Localmente
```bash
# No diretório painelsmm/
node --check server/server.js
node --check server/controllers/authController.js
node --check server/controllers/paymentController.js
```

Se todos retornarem sem erro, está pronto! ✅

### 2. Commit e Push
```bash
git add .
git commit -m "fix: corrigir sistema de pagamento e módulos ES6"
git push origin main
```

### 3. Deploy no Vercel
```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer login
vercel login

# Deploy (na pasta painelsmm)
cd painelsmm
vercel --prod
```

**IMPORTANTE**: Se aparecer erro sobre "Conflicting functions and builds", o arquivo `vercel.json` já foi corrigido para usar apenas `functions`.

## ⚙️ Configurar Variáveis de Ambiente no Vercel

Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables

Adicione estas variáveis:

```env
# JWT
JWT_SECRET=15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production

# URLs (IMPORTANTE: Substituir pela URL do seu projeto Vercel)
FRONTEND_URL=https://seu-projeto.vercel.app
BACKEND_URL=https://seu-projeto.vercel.app

# Email
RESEND_API_KEY=re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc
EMAIL_FROM="testsmm <onboarding@resend.dev>"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
MERCADOPAGO_WEBHOOK_SECRET=759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7

# SMMMIDIA
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=f1aba6dc3fde9dbb2f6600840a865c13
SMMMIDIA_SERVICE_ID=1353
```

## 🗄️ Criar Banco de Dados Postgres

### 1. No Painel do Vercel
1. Vá em **Storage** → **Create Database**
2. Selecione **Postgres**
3. Escolha a região (preferencialmente mesma do projeto)
4. Clique em **Create**

### 2. Executar SQL de Criação de Tabelas

No console do Postgres (Vercel Dashboard → Storage → seu-database → Query):

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

-- Índices
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

### 3. Fazer Novo Deploy
Após criar o banco, faça um novo deploy para aplicar as variáveis:
```bash
vercel --prod
```

## 🧪 Testar o Sistema

### 1. Testar Health Check
```bash
curl https://seu-projeto.vercel.app/api/health
```

Deve retornar:
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2026-05-13T..."
}
```

### 2. Testar Registro
Abra o site e:
1. Clique em "Cadastrar"
2. Preencha os dados
3. Clique em "Criar Conta"
4. Deve fazer login automaticamente

### 3. Testar Pagamento
1. Vá em "Serviços"
2. Selecione "Seguidores"
3. Escolha o pacote de 100 (R$ 0,01 para teste)
4. Preencha o usuário do Instagram
5. Clique em "Finalizar Pedido"
6. Verifique se o QR Code PIX aparece
7. Pague o PIX (ou use PIX de teste)
8. Feche o modal
9. Deve aparecer "Aguardando Pagamento..."
10. Após alguns segundos, deve mudar para "Pagamento Confirmado!"

### 4. Verificar Pedidos
1. Vá em "Meus Pedidos"
2. Deve aparecer o pedido com status "Concluído" ou "Processando"

## 🐛 Troubleshooting

### Erro 500 ao fazer login
- Verificar se o banco de dados foi criado
- Verificar se as tabelas foram criadas
- Ver logs: `vercel logs`

### Erro ao criar pagamento
- Verificar se `MERCADOPAGO_ACCESS_TOKEN` está configurado
- Verificar se o token é válido
- Ver logs: `vercel logs`

### Pagamento não confirma
- Aguardar até 5 minutos (polling automático)
- Ir em "Admin/Logs" e clicar em "Verificar Pendentes"
- Verificar se o webhook está configurado no Mercado Pago

### Ver Logs em Tempo Real
```bash
vercel logs --follow
```

## 📊 Monitoramento

### Painel do Vercel
- **Analytics**: Ver tráfego e performance
- **Functions**: Ver logs de cada função serverless
- **Deployments**: Histórico de deploys

### Endpoints Importantes
- `GET /api/health` - Status da API
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/payments/create` - Criar pagamento
- `GET /api/payments/orders` - Listar pedidos
- `POST /api/payments/webhook` - Webhook Mercado Pago

## 🎉 Pronto!

Se tudo funcionou:
- ✅ Login funciona
- ✅ Pagamento funciona
- ✅ PIX é gerado
- ✅ Confirmação automática funciona
- ✅ Pedidos aparecem corretamente

## 📚 Documentação Adicional

- `FIXES_APPLIED.md` - Detalhes de todas as correções
- `PAYMENT_FLOW_FIX.md` - Documentação do fluxo de pagamento
- `DEPLOY_GUIDE.md` - Guia completo de deploy

## 🆘 Suporte

Se ainda houver problemas:
1. Verificar logs: `vercel logs`
2. Verificar variáveis de ambiente
3. Verificar se o banco foi criado
4. Testar endpoints individualmente
