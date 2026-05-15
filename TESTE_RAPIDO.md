# 🧪 Teste Rápido - Verificar Configuração

## ❌ Erro Atual

Você está vendo:
```
401 - Email ou senha incorretos
500 - Não foi possível completar o cadastro
```

**CAUSA**: As variáveis de ambiente NÃO estão configuradas no Vercel!

## ✅ Como Verificar

### Teste 1: Verificar Variáveis de Ambiente

Acesse esta URL no navegador:
```
https://painelsmm-two.vercel.app/api/test-env
```

**Se retornar:**
```json
{
  "variables": {
    "SUPABASE_URL": "MISSING",
    "SUPABASE_ANON_KEY": "MISSING"
  }
}
```

**Significa**: Você NÃO configurou as variáveis no Vercel! ⚠️

**Se retornar:**
```json
{
  "variables": {
    "SUPABASE_URL": "configured",
    "SUPABASE_ANON_KEY": "configured"
  }
}
```

**Significa**: Variáveis configuradas! ✅

## 🔧 Como Configurar (PASSO A PASSO)

### 1. Acesse o Vercel

1. Vá em: https://vercel.com
2. Faça login
3. Clique no seu projeto: **painelsmm-two**

### 2. Abra as Configurações

1. Clique em **Settings** (no topo)
2. No menu lateral, clique em **Environment Variables**

### 3. Adicione as Variáveis

Para cada variável abaixo, clique em **Add New**:

#### Variável 1: SUPABASE_URL
- **Key**: `SUPABASE_URL`
- **Value**: `https://xicorwjdvlpwjczvtizm.supabase.co`
- **Environments**: Marque todos (Production, Preview, Development)
- Clique **Save**

#### Variável 2: SUPABASE_ANON_KEY
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpY29yd2pkdmxwd2pjenZ0aXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg0MDMsImV4cCI6MjA5NDI2NDQwM30.XDK7aF-196C9G6lRZlVw60GE0kblIzH8ZzKawrpyCII`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 3: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 4: JWT_EXPIRES_IN
- **Key**: `JWT_EXPIRES_IN`
- **Value**: `7d`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 5: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 6: FRONTEND_URL
- **Key**: `FRONTEND_URL`
- **Value**: `https://painelsmm-two.vercel.app`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 7: BACKEND_URL
- **Key**: `BACKEND_URL`
- **Value**: `https://painelsmm-two.vercel.app`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 8: MERCADOPAGO_ACCESS_TOKEN
- **Key**: `MERCADOPAGO_ACCESS_TOKEN`
- **Value**: `APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 9: MERCADOPAGO_WEBHOOK_SECRET
- **Key**: `MERCADOPAGO_WEBHOOK_SECRET`
- **Value**: `759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 10: SMMMIDIA_API_URL
- **Key**: `SMMMIDIA_API_URL`
- **Value**: `https://smmmidia.com/api/v2`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 11: SMMMIDIA_API_KEY
- **Key**: `SMMMIDIA_API_KEY`
- **Value**: `f1aba6dc3fde9dbb2f6600840a865c13`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 12: SMMMIDIA_SERVICE_ID
- **Key**: `SMMMIDIA_SERVICE_ID`
- **Value**: `1353`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 13: RESEND_API_KEY
- **Key**: `RESEND_API_KEY`
- **Value**: `re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc`
- **Environments**: Marque todos
- Clique **Save**

#### Variável 14: EMAIL_FROM
- **Key**: `EMAIL_FROM`
- **Value**: `testsmm <onboarding@resend.dev>`
- **Environments**: Marque todos
- Clique **Save**

### 4. Forçar Novo Deploy

Depois de adicionar TODAS as variáveis:

1. Vá em **Deployments** (no topo)
2. Clique nos 3 pontinhos do último deployment
3. Clique em **Redeploy**
4. Aguarde 1-2 minutos

### 5. Testar Novamente

Acesse: https://painelsmm-two.vercel.app/api/test-env

Deve mostrar:
```json
{
  "message": "✅ Todas as variáveis críticas estão configuradas"
}
```

### 6. Atualizar Senha no Supabase

Agora execute no Supabase SQL Editor:

```sql
UPDATE users 
SET password_hash = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu'
WHERE email = 'userpedro111@gmail.com';
```

### 7. Testar Login

Acesse: https://painelsmm-two.vercel.app

Login:
- Email: `userpedro111@gmail.com`
- Senha: `Admin@2024`

## 🎯 Resumo

1. ⚠️ **Teste**: https://painelsmm-two.vercel.app/api/test-env
2. ⚠️ **Configure**: Adicione TODAS as 14 variáveis no Vercel
3. ⚠️ **Redeploy**: Force um novo deploy
4. ⚠️ **Teste novamente**: Verifique se variáveis estão configuradas
5. ⚠️ **Atualize senha**: Execute SQL no Supabase
6. ✅ **Login**: Teste o login

## 📞 Se Ainda Não Funcionar

Envie o resultado de:
```
https://painelsmm-two.vercel.app/api/test-env
```

Isso vai mostrar exatamente qual variável está faltando.

---

**IMPORTANTE**: Sem as variáveis de ambiente, o backend NÃO consegue conectar no Supabase!
