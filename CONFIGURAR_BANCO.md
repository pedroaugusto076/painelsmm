# 🗄️ Configurar Banco de Dados PostgreSQL no Vercel

## ❌ Problema Atual

O erro 500 ao listar pedidos indica que:
- ✅ A autenticação está funcionando
- ✅ A API está online
- ❌ A tabela `orders` pode não existir no PostgreSQL
- ❌ Ou há incompatibilidade de tipos de dados

## 🔧 Solução: Criar as Tabelas no Vercel Postgres

### Opção 1: Via Vercel Dashboard (Recomendado)

1. **Acesse o Vercel Postgres:**
   - Vá para: https://vercel.com/pedroaugusto076s-projects/painelsmm
   - Clique em **"Storage"** no menu lateral
   - Selecione seu banco **Vercel Postgres**

2. **Abra o Query Editor:**
   - Clique em **"Query"** ou **"Data"**
   - Você verá um editor SQL

3. **Execute o script de inicialização:**
   - Copie o conteúdo do arquivo `server/init-postgres.sql`
   - Cole no editor
   - Clique em **"Run Query"** ou **"Execute"**

4. **Verifique se as tabelas foram criadas:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

   Deve retornar:
   ```
   auth_attempts
   orders
   password_resets
   users
   ```

### Opção 2: Via CLI (Avançado)

Se você tem o Vercel CLI instalado:

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer login
vercel login

# Conectar ao banco
vercel env pull

# Executar script
psql $POSTGRES_URL < server/init-postgres.sql
```

### Opção 3: Via Código (Automático)

Vou criar uma rota que inicializa o banco automaticamente:

## 🧪 Testar o Banco de Dados

Após fazer o deploy das correções, teste esta rota:

```
GET https://painelsmm-two.vercel.app/api/payments/debug/db
Authorization: Bearer SEU_TOKEN_JWT
```

**Response esperada (sucesso):**
```json
{
  "success": true,
  "data": {
    "isVercel": true,
    "userId": "00a16301-3d25-4925-8cec-ea1782823f25",
    "testQuery": [{ "test": 1 }],
    "tableExists": [{ "table_name": "orders" }],
    "orderCount": [{ "total": 2 }]
  }
}
```

**Response esperada (tabela não existe):**
```json
{
  "success": true,
  "data": {
    "isVercel": true,
    "userId": "00a16301-3d25-4925-8cec-ea1782823f25",
    "testQuery": [{ "test": 1 }],
    "tableExists": [],  // ❌ Vazio = tabela não existe
    "orderCount": []
  }
}
```

## 📋 Script SQL Completo

O arquivo `server/init-postgres.sql` contém:

### Tabelas:
- ✅ `users` - Usuários do sistema
- ✅ `password_resets` - Tokens de reset de senha
- ✅ `auth_attempts` - Tentativas de login
- ✅ `orders` - Pedidos de serviços

### Tipos de Dados Corretos:
- `UUID` para IDs (PostgreSQL)
- `TIMESTAMP` para datas
- `BOOLEAN` para flags
- `DECIMAL(10,2)` para preços
- `VARCHAR` e `TEXT` para strings

### Índices:
- Índices em colunas frequentemente consultadas
- Melhora performance das queries

## 🚀 Próximos Passos

1. **Executar o script SQL no Vercel Postgres**
2. **Fazer commit e push das correções:**
   ```bash
   cd painelsmm
   git add .
   git commit -m "fix: adicionar logs de debug e script de inicialização do banco"
   git push origin main
   ```

3. **Aguardar deploy**

4. **Testar a rota de debug:**
   ```bash
   # Fazer login primeiro
   curl -X POST https://painelsmm-two.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"seu_email","password":"sua_senha"}'
   
   # Usar o token retornado
   curl -X GET https://painelsmm-two.vercel.app/api/payments/debug/db \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

5. **Se a tabela não existir, executar o script SQL**

6. **Testar listar pedidos novamente:**
   ```bash
   curl -X GET https://painelsmm-two.vercel.app/api/payments/orders \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

## 🔍 Verificar Logs

Após o deploy, verifique os logs no Vercel:
https://vercel.com/pedroaugusto076s-projects/painelsmm/logs

**Logs esperados (sucesso):**
```
📋 [DEBUG] Buscando pedidos do usuário: 00a16301-3d25-4925-8cec-ea1782823f25
📋 [DEBUG] Tipo do userId: string
🔍 [DB] Query original: SELECT id, service_type...
🔍 [DB] Query convertida: SELECT id, service_type...
🔍 [DB] Params: [ '00a16301-3d25-4925-8cec-ea1782823f25' ]
✅ [DB] Query executada com sucesso. Rows: 2
✅ [DEBUG] Pedidos encontrados: 2
```

**Logs de erro (tabela não existe):**
```
📋 [DEBUG] Buscando pedidos do usuário: 00a16301-3d25-4925-8cec-ea1782823f25
❌ [DB] Erro na query Vercel Postgres: relation "orders" does not exist
```

## 💡 Dica

Se você está migrando de SQLite para PostgreSQL, os dados antigos não serão migrados automaticamente. Você precisará:

1. Exportar dados do SQLite (se houver)
2. Criar as tabelas no PostgreSQL
3. Importar os dados

Ou simplesmente começar do zero no PostgreSQL.

---

**Status:** Aguardando execução do script SQL  
**Próximo passo:** Executar `init-postgres.sql` no Vercel Postgres
