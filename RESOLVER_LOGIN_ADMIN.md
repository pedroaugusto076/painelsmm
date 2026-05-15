# 🔧 Resolver Problema de Login do Admin

## ❌ Erro Atual
```
Email ou senha incorretos. Verifique seus dados e tente novamente.
```

## 🔍 Possíveis Causas

1. **Usuário não foi criado corretamente**
2. **Hash da senha está diferente**
3. **Backend não está conectado ao Supabase**
4. **Variáveis de ambiente não configuradas na Vercel**

## ✅ Solução Passo a Passo

### PASSO 1: Verificar no Supabase

Execute este SQL no **SQL Editor** do Supabase:

```sql
SELECT 
  id, 
  name, 
  email, 
  LEFT(password_hash, 30) as hash_inicio,
  is_admin, 
  role, 
  email_verified,
  is_active
FROM users
WHERE email = 'userpedro111@gmail.com';
```

**O que você deve ver:**
```
is_admin: true
role: admin
email_verified: true
is_active: true
hash_inicio: $2a$10$u1KFYUvrAlqj0Ep5cp9X/e
```

### PASSO 2: Se o Usuário NÃO Existe

Execute:
```sql
INSERT INTO users (name, email, password_hash, is_admin, role, email_verified, is_active)
VALUES (
  'Administrador',
  'userpedro111@gmail.com',
  '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  TRUE,
  'admin',
  TRUE,
  TRUE
);
```

### PASSO 3: Se o Usuário Existe mas Não Loga

Execute:
```sql
UPDATE users
SET 
  password_hash = '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  is_admin = TRUE,
  role = 'admin',
  email_verified = TRUE,
  is_active = TRUE
WHERE email = 'userpedro111@gmail.com';
```

### PASSO 4: Verificar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com
2. Vá no seu projeto
3. **Settings** > **Environment Variables**
4. Verifique se existe:
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   ```

**Se NÃO existir, adicione:**
```
SUPABASE_URL = https://xicorwjdvlpwjczvtizm.supabase.co
SUPABASE_ANON_KEY = (sua chave anon do Supabase)
```

**Depois:** Deployments > Redeploy

### PASSO 5: Testar a API

Antes de tentar login, teste se o backend está funcionando:

```
https://painelsmm-two.vercel.app/api/health
```

**Deve retornar:**
```json
{
  "success": true,
  "database": {
    "type": "Supabase",
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true
  }
}
```

**Se retornar `hasSupabaseUrl: false`:**
- As variáveis não estão configuradas na Vercel
- Adicione e faça redeploy

### PASSO 6: Limpar Cache do Navegador

1. Pressione **Ctrl + Shift + Delete**
2. Selecione "Cookies e dados de sites"
3. Clique em "Limpar dados"
4. Feche e abra o navegador novamente

### PASSO 7: Tentar Login Novamente

1. Acesse: https://painelsmm-two.vercel.app
2. Clique em **Login**
3. Use:
   - **Email:** userpedro111@gmail.com
   - **Senha:** Admin@2024
4. Clique em **Entrar**

## 🔄 Alternativa: Senha Diferente

Se ainda não funcionar, tente com senha mais simples:

```sql
-- Atualizar para senha: admin123
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'userpedro111@gmail.com';
```

**Depois tente login com:**
- Email: userpedro111@gmail.com
- Senha: **admin123**

## 🐛 Debug Avançado

### Verificar Logs da Vercel

1. Vercel Dashboard > Seu projeto
2. **Deployments** > Clique no último deployment
3. **Functions** > Clique em uma função
4. Veja os logs de erro

### Testar Localmente

```bash
cd server
npm run dev
```

Depois tente login em: http://localhost:5173

Se funcionar localmente mas não na Vercel:
- Problema é nas variáveis de ambiente da Vercel

## 📋 Checklist de Verificação

- [ ] Usuário existe no Supabase
- [ ] `is_admin = TRUE`
- [ ] `role = 'admin'`
- [ ] `email_verified = TRUE`
- [ ] `is_active = TRUE`
- [ ] Hash da senha correto
- [ ] Variáveis configuradas na Vercel
- [ ] Deploy completado
- [ ] API /health retorna success
- [ ] Cache do navegador limpo

## 🎯 Solução Rápida (Mais Provável)

**Problema:** Variáveis de ambiente não configuradas na Vercel

**Solução:**
1. Vercel > Settings > Environment Variables
2. Adicionar SUPABASE_URL e SUPABASE_ANON_KEY
3. Redeploy
4. Aguardar 2-3 minutos
5. Tentar login novamente

## 📞 Ainda Não Funciona?

Execute o arquivo: **`VERIFICAR_E_CORRIGIR_ADMIN.sql`**

Ele tem todos os SQLs necessários para verificar e corrigir.

---

**Credenciais:**
- Email: userpedro111@gmail.com
- Senha: Admin@2024 (ou admin123 se usar a alternativa)
