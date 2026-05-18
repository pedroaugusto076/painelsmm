# 🔑 Configurar Sistema de API Keys por Usuário

## ✅ O que foi implementado:

1. **Geração automática de API key** no registro de novos usuários
2. **Validação de API key** no banco de dados (não mais hardcoded)
3. **Exibição da API key real** no Dashboard do usuário
4. **Logs de uso** da API por usuário

---

## 📋 Passos para Ativar:

### 1. Executar SQL no Supabase

Acesse: https://supabase.com/dashboard/project/xicorwjdvlpwjczvtizm/editor

Execute o SQL do arquivo `ADICIONAR_API_KEY_USERS.sql`:

```sql
-- Adicionar coluna api_key na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key VARCHAR(64) UNIQUE;

-- Gerar API keys para usuários existentes
UPDATE users 
SET api_key = 'sk_' || encode(gen_random_bytes(32), 'hex')
WHERE api_key IS NULL;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- Verificar
SELECT id, email, api_key FROM users LIMIT 5;
```

### 2. Fazer Deploy no Vercel

```bash
git add .
git commit -m "Adiciona sistema de API keys por usuário"
git push origin main
```

Ou force um redeploy:
- https://vercel.com/seu-usuario/painelsmm/deployments
- Clique nos 3 pontinhos → **Redeploy**

### 3. Testar

1. **Registre um novo usuário** ou faça login
2. **Vá na aba "API"** no Dashboard
3. **Copie sua API key** (será algo como: `sk_a1b2c3d4e5f6...`)
4. **Teste a API** com sua chave:

```json
{
  "key": "sk_sua_chave_aqui",
  "action": "services"
}
```

---

## 🧪 Como Testar a API:

### PowerShell:
```powershell
$body = @{
    key = "sk_sua_chave_aqui"
    action = "services"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://painelsmm-two.vercel.app/api/v1" -Method Post -Body $body -ContentType "application/json"
```

### Postman:
- **URL**: `https://painelsmm-two.vercel.app/api/v1`
- **Method**: POST
- **Body** (raw JSON):
```json
{
  "key": "sk_sua_chave_aqui",
  "action": "services"
}
```

---

## 🎯 Funcionalidades:

### ✅ Cada usuário tem sua própria API key
- Gerada automaticamente no registro
- Única e segura (64 caracteres)
- Formato: `sk_a1b2c3d4e5f6g7h8...`

### ✅ Validação no banco de dados
- A API verifica se a chave existe na tabela `users`
- Logs mostram qual usuário fez a requisição
- Seguro e escalável

### ✅ Exibição no Dashboard
- Usuário vê sua chave na aba "API"
- Botão para copiar
- Exemplos de código com a chave já preenchida

---

## 🔒 Segurança:

- ✅ API keys únicas por usuário
- ✅ Validação no banco de dados
- ✅ Logs de uso por usuário
- ✅ Chaves não podem ser duplicadas (UNIQUE constraint)
- ✅ Índice para busca rápida

---

## 📊 Monitoramento:

### Ver quem está usando a API:

```sql
-- Ver últimos pedidos via API
SELECT 
  o.id,
  o.created_at,
  u.email,
  u.name,
  o.service_type,
  o.quantity
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY o.created_at DESC;
```

---

## 🚀 Pronto!

Agora cada usuário tem sua própria API key funcional e pode integrar os serviços em suas aplicações!
