# 🎛️ PAINEL DE ADMIN - GUIA COMPLETO

## ✅ SIM! O Painel foi Criado!

O painel administrativo completo está em:
```
src/components/AdminPanel.tsx
```

## 🎯 Funcionalidades do Painel

### 📊 Dashboard com Estatísticas
- **Total de Pedidos** - Todos os pedidos já feitos
- **Receita Total** - Soma de todos os pedidos pagos
- **Pedidos Hoje** - Pedidos criados hoje
- **Total de Usuários** - Usuários cadastrados
- **Pedidos Pendentes** - Aguardando aprovação

### 📦 Lista de Pedidos
Mostra TODOS os pedidos com:
- ID do pedido
- Nome e email do cliente
- Tipo de serviço (seguidores, curtidas, etc)
- Instagram do cliente
- Valor pago
- Status atual
- Data de criação

### 🔍 Filtros e Busca
- **Filtrar por Status:**
  - Todos
  - Pendente (aguardando pagamento)
  - Pago (aguardando aprovação do admin)
  - Processando (enviado ao fornecedor)
  - Entregue (concluído)
  - Cancelado

- **Buscar por:**
  - Instagram do cliente
  - Email do cliente
  - ID do pedido

### ⚡ Ações Disponíveis

#### 1. ✅ APROVAR E ENVIAR (Botão Verde "Enviar")
**Quando aparece:** Pedidos com status "completed" (pagos)

**O que faz:**
1. Valida se o pagamento foi confirmado
2. Envia o pedido para o fornecedor (SMMMIDIA)
3. Atualiza o status para "processing"
4. Salva o ID do pedido no fornecedor

**Como usar:**
- Clique no botão verde "Enviar"
- Confirme a ação
- Sistema envia automaticamente

#### 2. ❌ CANCELAR (Botão Vermelho)
**Quando aparece:** Qualquer pedido não cancelado

**O que faz:**
1. Solicita o motivo do cancelamento
2. Atualiza o status para "cancelled"
3. Salva a mensagem de erro

**Como usar:**
- Clique no botão vermelho "Cancelar"
- Digite o motivo
- Confirme

#### 3. 👁️ VER DETALHES (Botão Cinza)
**Sempre disponível**

**O que mostra:**
- Todas as informações do pedido
- Dados do cliente
- Link da publicação (se houver)
- IDs de pagamento
- Mensagens de erro (se houver)
- Datas de criação e atualização

## 🔄 Fluxo de Trabalho

### Cenário 1: Cliente Faz Pedido e Paga

```
1. Cliente cria pedido
   └─> Status: "pending"

2. Cliente paga via PIX
   └─> Webhook do Mercado Pago atualiza
   └─> Status: "completed" ✅ APARECE NO PAINEL ADMIN

3. Admin vê pedido no painel
   └─> Botão verde "Enviar" aparece

4. Admin clica em "Enviar"
   └─> Sistema envia para SMMMIDIA
   └─> Status: "processing"

5. SMMMIDIA processa e entrega
   └─> Status: "delivered"
```

### Cenário 2: Admin Cancela Pedido

```
1. Admin vê pedido problemático
   └─> Clica em "Cancelar"

2. Admin digita motivo
   └─> Ex: "Instagram inválido"

3. Sistema cancela
   └─> Status: "cancelled"
   └─> Motivo salvo no banco
```

## 🚀 Como Acessar o Painel

### Passo 1: Criar Usuário Admin

```bash
cd server
npm run generate-admin
```

Isso vai:
1. Pedir uma senha
2. Gerar o hash
3. Mostrar o SQL para executar no Supabase

### Passo 2: Executar SQL no Supabase

Copie o SQL gerado e execute no SQL Editor do Supabase.

Exemplo:
```sql
INSERT INTO users (name, email, password_hash, is_admin, role, email_verified)
VALUES (
  'Administrador',
  'admin@seudominio.com',
  'hash_gerado_aqui',
  TRUE,
  'admin',
  TRUE
);
```

### Passo 3: Fazer Login

1. Acesse: http://localhost:5173
2. Clique em "Login"
3. Use o email e senha do admin
4. **Você será redirecionado automaticamente para `/admin`**

## 📸 O que Você Vai Ver

### Tela Principal
```
┌─────────────────────────────────────────────────────────────┐
│ Painel Administrativo                    [🔄 Atualizar]     │
│ Gerencie todas as compras e pedidos                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📦 Total: 150    💰 Receita: R$ 5.430   📅 Hoje: 12       │
│  👥 Usuários: 45  ⏳ Pendentes: 8                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  🔍 [Buscar...]              [Filtro: Todos ▼]             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pedido    Cliente         Serviço      Instagram   Valor   │
│  ───────────────────────────────────────────────────────────│
│  #abc123   João Silva      Seguidores   @joao      R$ 50   │
│            joao@email.com  1000 un                          │
│            Status: PAGO                                      │
│            [✅ Enviar] [❌ Cancelar] [👁️ Ver]               │
│  ───────────────────────────────────────────────────────────│
│  #def456   Maria Santos    Curtidas     @maria     R$ 30   │
│            maria@email.com 500 un                           │
│            Status: PROCESSANDO                              │
│            [❌ Cancelar] [👁️ Ver]                           │
│  ───────────────────────────────────────────────────────────│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Cores dos Status

- 🟡 **PENDING** (Amarelo) - Aguardando pagamento
- 🟢 **COMPLETED** (Verde) - Pago, pronto para enviar
- 🔵 **PROCESSING** (Azul) - Enviado ao fornecedor
- 🟣 **DELIVERED** (Roxo) - Entregue
- 🔴 **CANCELLED** (Vermelho) - Cancelado

## 🔐 Segurança

### Proteção de Rotas
- Apenas usuários com `is_admin = TRUE` podem acessar
- Token JWT validado em cada requisição
- Middleware de autenticação no backend

### Código de Proteção
```javascript
// server/middleware/adminAuth.js
export const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};
```

## 📡 APIs Disponíveis

### GET /api/admin/stats
Retorna estatísticas gerais

### GET /api/admin/orders
Lista todos os pedidos

### POST /api/admin/orders/:id/approve
Aprova e envia pedido ao fornecedor

### POST /api/admin/orders/:id/cancel
Cancela um pedido

### GET /api/admin/orders/:id/status
Verifica status no fornecedor

### GET /api/admin/balance
Verifica saldo no SMMMIDIA

## 🧪 Como Testar

### 1. Criar Pedido de Teste (Como Cliente)
1. Faça logout do admin
2. Crie uma conta normal
3. Faça um pedido
4. Gere o PIX (não precisa pagar)

### 2. Simular Pagamento
Execute no SQL Editor do Supabase:
```sql
UPDATE orders
SET status = 'completed', payment_status = 'approved'
WHERE id = 'id_do_pedido_aqui';
```

### 3. Ver no Painel Admin
1. Faça login como admin
2. Veja o pedido com status "PAGO"
3. Clique em "Enviar"
4. Veja o status mudar para "PROCESSANDO"

## 📝 Arquivos Relacionados

### Frontend
- `src/components/AdminPanel.tsx` - Componente principal
- `src/services/api.ts` - Funções de API (adminApi)
- `src/App.tsx` - Roteamento para /admin

### Backend
- `server/routes/admin.js` - Rotas do admin
- `server/controllers/adminController.js` - Lógica de negócio
- `server/middleware/adminAuth.js` - Proteção de rotas

## 🎯 Resumo

✅ **Painel criado:** `src/components/AdminPanel.tsx`
✅ **Funcionalidades:**
   - Dashboard com estatísticas
   - Lista de todos os pedidos
   - Filtros e busca
   - Aprovar e enviar ao fornecedor
   - Cancelar pedidos
   - Ver detalhes completos

✅ **Acesso:** Login com usuário admin → Redireciona para `/admin`
✅ **Seguro:** Protegido por JWT e middleware
✅ **Completo:** Pronto para uso em produção

---

**Próximo passo:** Criar usuário admin e testar!
```bash
npm run generate-admin
```
