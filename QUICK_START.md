# 🚀 Quick Start - Deploy em 5 Minutos

## ✅ Status das Correções

Todos os erros foram corrigidos:
- ✅ "Cannot use import statement outside a module"
- ✅ "Unexpected token 'A'"
- ✅ "Conflicting functions and builds configuration"
- ✅ Sintaxe SQL incorreta
- ✅ Sistema de polling de pagamento implementado

## 📋 Passo a Passo

### 1️⃣ Commit e Push (1 minuto)
```bash
cd painelsmm
git add .
git commit -m "fix: corrigir todos os erros e configurar Vercel"
git push origin main
```

### 2️⃣ Deploy no Vercel (2 minutos)
```bash
# Se não tiver Vercel CLI instalado
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Anote a URL do deploy**: `https://seu-projeto.vercel.app`

### 3️⃣ Configurar Variáveis de Ambiente (1 minuto)

Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables

**Copie e cole estas variáveis** (substitua a URL):

```env
JWT_SECRET=15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://seu-projeto.vercel.app
BACKEND_URL=https://seu-projeto.vercel.app
RESEND_API_KEY=re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc
EMAIL_FROM=testsmm <onboarding@resend.dev>
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
MERCADOPAGO_WEBHOOK_SECRET=759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=f1aba6dc3fde9dbb2f6600840a865c13
SMMMIDIA_SERVICE_ID=1353
```

**⚠️ IMPORTANTE**: Substitua `https://seu-projeto.vercel.app` pela URL real do seu projeto!

### 4️⃣ Criar Banco de Dados (1 minuto)

1. Vá em: https://vercel.com/seu-usuario/seu-projeto/stores
2. Clique em **Create Database**
3. Selecione **Postgres**
4. Clique em **Create**
5. Aguarde a criação (30 segundos)

### 5️⃣ Criar Tabelas no Banco (30 segundos)

1. Clique no banco criado
2. Vá em **Query**
3. Cole este SQL e clique em **Run**:

```sql
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

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX idx_auth_attempts_ip ON auth_attempts(ip_address, created_at);
CREATE INDEX idx_auth_attempts_user_id ON auth_attempts(user_id, created_at);
CREATE INDEX idx_auth_attempts_type ON auth_attempts(attempt_type, created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 6️⃣ Fazer Novo Deploy (30 segundos)

Após configurar as variáveis e criar o banco:

```bash
vercel --prod
```

## 🧪 Testar

### 1. Health Check
Abra: `https://seu-projeto.vercel.app/api/health`

Deve retornar:
```json
{
  "success": true,
  "message": "API está funcionando"
}
```

### 2. Criar Conta
1. Abra: `https://seu-projeto.vercel.app`
2. Clique em "Cadastrar"
3. Preencha os dados
4. Clique em "Criar Conta"

### 3. Fazer Pedido
1. Vá em "Serviços"
2. Selecione "Seguidores"
3. Escolha o pacote de **100 (R$ 0,01)** para teste
4. Preencha o usuário do Instagram
5. Clique em "Finalizar Pedido"
6. Verifique se o QR Code PIX aparece ✅

### 4. Testar Pagamento
1. Pague o PIX (ou use PIX de teste do Mercado Pago)
2. Feche o modal do PIX
3. Deve aparecer "Aguardando Pagamento..." ✅
4. Após alguns segundos: "Pagamento Confirmado!" ✅
5. Vá em "Meus Pedidos" e veja o pedido ✅

## 🎉 Pronto!

Se tudo funcionou, você tem:
- ✅ Sistema de login funcionando
- ✅ Criação de pedidos funcionando
- ✅ PIX sendo gerado corretamente
- ✅ Confirmação automática de pagamento
- ✅ Pedidos aparecendo corretamente

## 🐛 Problemas?

### Erro 500 ao fazer login
```bash
# Ver logs
vercel logs

# Verificar se o banco foi criado
# Verificar se as tabelas foram criadas
```

### Erro ao criar pagamento
```bash
# Verificar variáveis de ambiente
vercel env ls

# Ver logs
vercel logs --follow
```

### Pagamento não confirma
- Aguardar até 5 minutos (polling automático)
- Ir em "Admin/Logs" → "Verificar Pendentes"

## 📚 Documentação Completa

- **README_DEPLOY.md** - Guia detalhado de deploy
- **VERCEL_CONFIG.md** - Configuração do Vercel explicada
- **FIXES_APPLIED.md** - Todas as correções aplicadas
- **PAYMENT_FLOW_FIX.md** - Sistema de pagamento

## 🆘 Suporte

Se ainda houver problemas:
1. Ver logs: `vercel logs --follow`
2. Verificar variáveis: `vercel env ls`
3. Verificar banco: Vercel Dashboard → Storage
4. Testar endpoints: `curl https://seu-projeto.vercel.app/api/health`

---

**Tempo total: ~5 minutos** ⏱️
