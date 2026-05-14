# 🚨 PASSO A PASSO URGENTE - Configurar Banco de Dados

## ❌ O Problema

Você está vendo:
- ✅ PIX é gerado
- ✅ Você paga o PIX
- ❌ Pedido não aparece na lista
- ❌ Warning: "Erro ao buscar pedidos, retornando lista vazia"

**Causa:** O banco de dados PostgreSQL não está configurado na Vercel!

---

## ✅ SOLUÇÃO (10 minutos)

### 📍 PASSO 1: Verificar o Problema

Aguarde 2 minutos para o deploy terminar, depois acesse:

```
https://painelsmm-two.vercel.app/api/db-check
```

**Se aparecer erro ou `"hasPostgresUrl": false`** → Banco não configurado!

---

### 📍 PASSO 2: Criar Vercel Postgres

#### 2.1 - Acessar Dashboard
https://vercel.com/dashboard

#### 2.2 - Selecionar Projeto
Clique em: **painelsmm-two**

#### 2.3 - Ir para Storage
No menu lateral esquerdo, clique em: **Storage**

#### 2.4 - Criar Database
1. Clique no botão: **Create Database**
2. Selecione: **Postgres**
3. Nome do banco: `painelsmm-db`
4. Região: **Washington, D.C., USA (iad1)** (ou a mais próxima)
5. Clique em: **Create**

#### 2.5 - Conectar ao Projeto
1. Após criar, clique em: **Connect Project**
2. Selecione: **painelsmm-two**
3. Marque TODOS os ambientes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
4. Clique em: **Connect**

---

### 📍 PASSO 3: Aguardar e Redeploy

#### 3.1 - Aguardar Propagação
Aguarde **1-2 minutos** para as variáveis serem configuradas.

#### 3.2 - Verificar Variáveis
1. Vá em: **Settings** → **Environment Variables**
2. Procure por variáveis que começam com `POSTGRES_`:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - etc.

Se essas variáveis aparecerem → ✅ Configurado!

#### 3.3 - Fazer Redeploy
1. Vá em: **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em: **Redeploy**
4. Aguarde o deploy terminar (1-2 minutos)

---

### 📍 PASSO 4: Testar

#### 4.1 - Verificar Banco
Acesse:
```
https://painelsmm-two.vercel.app/api/db-check
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "isVercel": true,
    "hasPostgresUrl": true,
    "tableExists": true,
    "totalOrders": 0
  }
}
```

✅ Se `"hasPostgresUrl": true` e `"tableExists": true` → Tudo certo!

#### 4.2 - Testar Pedido
1. Acesse: https://painelsmm-two.vercel.app
2. Faça login
3. Crie um novo pedido
4. Pague o PIX
5. Aguarde 10 segundos
6. Atualize a página

✅ O pedido deve aparecer na lista!

---

## 🔍 Verificar Logs

Após fazer um pedido, vá nos logs da Vercel e procure por:

### Logs Esperados:

```
🌐 Ambiente Vercel detectado - usando Vercel Postgres
🔧 [DB] Inicializando tabelas do PostgreSQL...
✅ [DB] Tabelas PostgreSQL inicializadas
📦 Criando pedido no banco: <uuid>
✅ Insert executado
✅ Pedido criado e confirmado
```

### Logs do Webhook:
```
📥 Webhook recebido
💳 Buscando informações do pagamento
📋 Informações do pagamento: {"status": "approved", ...}
🔍 [WEBHOOK] Buscando pedido com ID: <uuid>
✅ [WEBHOOK] Pedido encontrado
🔄 Atualizando status do pedido
✅ Status atualizado: completed
```

---

## 🆘 Alternativa: Neon (PostgreSQL Gratuito)

Se você não conseguir usar o Vercel Postgres:

### 1. Criar conta
https://neon.tech

### 2. Criar banco
- Nome: `painelsmm`
- Região: Escolha a mais próxima

### 3. Copiar Connection String
Copie a URL que começa com `postgresql://`

### 4. Adicionar na Vercel
1. Dashboard → painelsmm-two
2. Settings → Environment Variables
3. Adicionar:
   - Nome: `POSTGRES_URL`
   - Valor: `postgresql://user:password@host/database`
   - Ambientes: Production, Preview, Development
4. Salvar

### 5. Redeploy

---

## 📋 Checklist Final

- [ ] Vercel Postgres criado
- [ ] Projeto conectado ao banco
- [ ] Variáveis `POSTGRES_*` aparecem em Environment Variables
- [ ] Redeploy feito
- [ ] `/api/db-check` retorna `"hasPostgresUrl": true`
- [ ] `/api/db-check` retorna `"tableExists": true`
- [ ] Criar pedido de teste
- [ ] Pagar PIX
- [ ] Pedido aparece na lista ✅

---

## 🎯 Resumo Visual

```
❌ ANTES (sem banco):
Criar pedido → Pagar PIX → ❌ Nada acontece

✅ DEPOIS (com banco):
Criar pedido → Pagar PIX → ✅ Pedido confirmado!
```

---

## ⏱️ Tempo Estimado

- Criar Vercel Postgres: **2 minutos**
- Conectar ao projeto: **1 minuto**
- Aguardar propagação: **2 minutos**
- Redeploy: **2 minutos**
- Testar: **2 minutos**

**Total: ~10 minutos**

---

## 💬 Dúvidas?

Se após seguir todos os passos ainda não funcionar:

1. Acesse: `https://painelsmm-two.vercel.app/api/db-check`
2. Copie a resposta completa
3. Verifique os logs da Vercel
4. Procure por erros relacionados a "database" ou "postgres"

---

**🚀 Boa sorte! Depois de configurar o banco, tudo vai funcionar perfeitamente!**
