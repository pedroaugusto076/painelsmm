# 🔧 Corrigir Login no Vercel - Guia Completo

## ❌ Problema Atual

O backend no Vercel está retornando erros:
- `/api/auth/login` → 401 "Email ou senha incorretos"
- `/api/auth/register` → 500 "Cannot read properties of undefined (reading 'count')"
- `/api/auth/profile` → 404 "Usuário não encontrado"

## ✅ Solução Implementada

Reescrevemos completamente o arquivo `server/config/database.js` para:
1. ✅ Corrigir queries COUNT que estavam falhando
2. ✅ Melhorar parsing de queries SQL para Supabase
3. ✅ Adicionar suporte para JOINs e GROUP BY
4. ✅ Corrigir condições WHERE com datetime
5. ✅ Melhorar logs de debug

## 📋 Passos para Corrigir

### 1️⃣ Configurar Variáveis de Ambiente no Vercel

**CRÍTICO**: Você DEVE adicionar as variáveis de ambiente no Vercel:

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione as seguintes variáveis:

```
SUPABASE_URL=https://xicorwjdvlpwjczvtizm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpY29yd2pkdmxwd2pjenZ0aXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg0MDMsImV4cCI6MjA5NDI2NDQwM30.XDK7aF-196C9G6lRZlVw60GE0kblIzH8ZzKawrpyCII
JWT_SECRET=15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://painelsmm-two.vercel.app
BACKEND_URL=https://painelsmm-two.vercel.app
RESEND_API_KEY=re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc
EMAIL_FROM=testsmm <onboarding@resend.dev>
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
MERCADOPAGO_WEBHOOK_SECRET=759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=f1aba6dc3fde9dbb2f6600840a865c13
SMMMIDIA_SERVICE_ID=1353
NODE_ENV=production
PORT=5000
```

3. Selecione os ambientes: **Production**, **Preview**, **Development**
4. Clique em **Save**

### 2️⃣ Atualizar Senha do Admin no Supabase

Execute este SQL no Supabase SQL Editor:

```sql
-- Atualizar senha do admin para: Admin@2024
UPDATE users 
SET password_hash = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu'
WHERE email = 'userpedro111@gmail.com';

-- Verificar se foi atualizado
SELECT 
  email, 
  is_admin, 
  role, 
  email_verified, 
  is_active,
  substring(password_hash, 1, 20) as hash_preview
FROM users 
WHERE email = 'userpedro111@gmail.com';
```

### 3️⃣ Fazer Deploy no Vercel

Agora que o código foi corrigido, faça o deploy:

```bash
# Commit das mudanças
git add .
git commit -m "fix: corrigir query function para suportar COUNT e JOINs no Supabase"
git push origin main
```

O Vercel vai fazer deploy automaticamente.

### 4️⃣ Testar o Login

Após o deploy:

1. Acesse: https://painelsmm-two.vercel.app
2. Faça login com:
   - **Email**: userpedro111@gmail.com
   - **Password**: Admin@2024
3. Você deve ser redirecionado para `/admin`

## 🔍 Como Verificar se Funcionou

### Teste 1: Health Check
```bash
curl https://painelsmm-two.vercel.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-05-15T..."
}
```

### Teste 2: Database Check
```bash
curl https://painelsmm-two.vercel.app/api/db-check
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected",
  "supabase": true
}
```

### Teste 3: Login
```bash
curl -X POST https://painelsmm-two.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userpedro111@gmail.com","password":"Admin@2024"}'
```

Deve retornar:
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

## 🐛 Se Ainda Não Funcionar

### Verificar Logs no Vercel

1. Acesse: https://vercel.com/seu-projeto/deployments
2. Clique no último deployment
3. Vá em **Functions** → Clique em uma função
4. Veja os logs para identificar erros

### Verificar Variáveis de Ambiente

```bash
# No terminal local
vercel env pull .env.vercel
cat .env.vercel
```

Verifique se todas as variáveis estão presentes.

### Forçar Novo Deploy

```bash
# Fazer um commit vazio para forçar redeploy
git commit --allow-empty -m "chore: force redeploy"
git push origin main
```

## 📊 Mudanças Feitas no Código

### `server/config/database.js`

**Antes**: Query function básica que não suportava COUNT
**Depois**: Query function completa com:
- ✅ Suporte para `SELECT COUNT(*) as count`
- ✅ Suporte para condições WHERE complexas
- ✅ Suporte para datetime comparisons (`> datetime('now', '-30 minutes')`)
- ✅ Suporte para múltiplas condições AND
- ✅ Suporte para JOINs (LEFT JOIN users)
- ✅ Suporte para GROUP BY
- ✅ Melhor tratamento de erros
- ✅ Logs detalhados para debug

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. ✅ Login funciona com `userpedro111@gmail.com` / `Admin@2024`
2. ✅ Usuário é redirecionado para `/admin`
3. ✅ Painel admin mostra todos os pedidos
4. ✅ Admin pode aprovar/cancelar pedidos
5. ✅ Pedidos são enviados para SMMMIDIA

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs no Vercel
2. Execute os testes de health check
3. Verifique se as variáveis de ambiente estão corretas
4. Verifique se o admin existe no Supabase com `is_admin = true`

---

**Data**: 15/05/2026
**Status**: Código corrigido, aguardando deploy no Vercel
