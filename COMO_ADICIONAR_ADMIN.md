# 🔐 Como Adicionar um Administrador

## 📋 Passo a Passo

### Passo 1: Acessar o Supabase

1. Vá em: https://supabase.com
2. Faça login
3. Selecione seu projeto: **painelsmm** (ou o nome que você deu)

### Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em: **SQL Editor** (ícone de banco de dados)
2. Clique em: **New query**

### Passo 3: Executar o SQL

Copie e cole este SQL no editor:

```sql
-- Criar usuário admin
INSERT INTO users (name, email, password_hash, is_admin, role, email_verified, is_active)
VALUES (
  'Administrador',
  'admin@painelsmm.com',
  '$2a$10$u1KFYUvrAlqj0Ep5cp9X/enBqFHMvKH3m5EHIwwtSv.cXj/QAihUu',
  TRUE,
  'admin',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  role = 'admin',
  email_verified = TRUE,
  is_active = TRUE;
```

**⚠️ IMPORTANTE:** Altere o email `admin@painelsmm.com` para o seu email real!

### Passo 4: Executar

1. Clique em **RUN** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem "Success"

### Passo 5: Verificar

Execute este SQL para confirmar:

```sql
SELECT id, name, email, is_admin, role, email_verified
FROM users
WHERE is_admin = TRUE;
```

Você deve ver o usuário admin criado.

### Passo 6: Fazer Login

1. Acesse: https://painelsmm-two.vercel.app
2. Clique em **Login**
3. Use as credenciais:
   - **Email:** admin@painelsmm.com (ou o que você alterou)
   - **Senha:** Admin@2024
4. Clique em **Entrar**
5. **Você será redirecionado automaticamente para `/admin`**

## 🎯 Credenciais Criadas

```
Email: admin@painelsmm.com
Senha: Admin@2024
```

**⚠️ Altere o email no SQL antes de executar!**

## 🔄 Alternativa: Tornar Usuário Existente em Admin

Se você já tem uma conta e quer torná-la admin:

```sql
UPDATE users
SET is_admin = TRUE, role = 'admin', email_verified = TRUE
WHERE email = 'seu-email@exemplo.com';
```

Substitua `seu-email@exemplo.com` pelo seu email.

## 🐛 Problemas?

### Erro: "duplicate key value violates unique constraint"
**Solução:** O email já existe. Use a alternativa acima para tornar o usuário existente em admin.

### Erro: "relation users does not exist"
**Solução:** Execute o script `supabase_schema.sql` primeiro para criar as tabelas.

### Login não redireciona para /admin
**Solução:** 
1. Verifique se `is_admin = TRUE` no banco
2. Limpe o cache do navegador
3. Faça logout e login novamente

### Não consigo acessar /admin diretamente
**Solução:** Você precisa fazer login primeiro. O sistema redireciona automaticamente após o login.

## 📝 Arquivo SQL Pronto

O arquivo `CRIAR_ADMIN.sql` contém o SQL completo pronto para executar.

## 🔐 Segurança

### Alterar a Senha Padrão

Depois de fazer login, é recomendado alterar a senha:

1. Gere um novo hash:
```bash
cd server
npm run generate-admin
```

2. Execute no Supabase:
```sql
UPDATE users
SET password_hash = 'novo_hash_aqui'
WHERE email = 'admin@painelsmm.com';
```

### Criar Múltiplos Admins

Para criar mais admins, repita o processo com emails diferentes:

```sql
INSERT INTO users (name, email, password_hash, is_admin, role, email_verified, is_active)
VALUES (
  'Admin 2',
  'admin2@painelsmm.com',
  'hash_da_senha_aqui',
  TRUE,
  'admin',
  TRUE,
  TRUE
);
```

## ✅ Checklist

- [ ] Acessei o Supabase
- [ ] Abri o SQL Editor
- [ ] Alterei o email no SQL
- [ ] Executei o SQL
- [ ] Verifiquei que foi criado
- [ ] Acessei https://painelsmm-two.vercel.app
- [ ] Fiz login com as credenciais
- [ ] Fui redirecionado para /admin
- [ ] Vejo o painel administrativo

## 🎉 Pronto!

Agora você tem acesso ao painel administrativo e pode:
- Ver todas as compras
- Aprovar pedidos
- Enviar ao fornecedor
- Cancelar pedidos
- Ver estatísticas

---

**Próximo passo:** Teste fazendo um pedido como cliente e depois aprove no painel admin!
