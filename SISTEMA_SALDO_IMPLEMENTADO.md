# 💰 Sistema de Saldo Implementado

## ✅ O que foi criado:

### 1. Banco de Dados
- ✅ Coluna `balance` na tabela `users`
- ✅ Tabela `balance_transactions` para histórico
- ✅ Índices para performance

### 2. Backend (API Endpoints)
- ✅ `/api/payments/add-balance` - Adicionar saldo via PIX
- ✅ `/api/payments/webhook-balance` - Confirmar pagamento de saldo
- ✅ `/api/payments/purchase-with-balance` - Comprar com saldo
- ✅ `/api/payments/balance-history` - Histórico de transações

### 3. Frontend (Serviços)
- ✅ `paymentApi.addBalance()` - Adicionar saldo
- ✅ `paymentApi.purchaseWithBalance()` - Comprar com saldo
- ✅ `paymentApi.getBalanceHistory()` - Ver histórico

---

## 📋 Para Ativar:

### 1. Executar SQL no Supabase

Acesse: https://supabase.com/dashboard/project/xicorwjdvlpwjczvtizm/editor

Execute o arquivo `ADICIONAR_SISTEMA_SALDO.sql`:

```sql
-- 1. Adicionar coluna de saldo
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;

-- 2. Criar tabela de transações
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_id VARCHAR(255),
  order_id UUID,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);

-- 4. Inicializar saldo
UPDATE users SET balance = 0.00 WHERE balance IS NULL;
```

### 2. Configurar Webhook no Mercado Pago

Adicione uma segunda URL de webhook:
- URL: `https://painelsmm-two.vercel.app/api/payments/webhook-balance`
- Eventos: `payment`

### 3. Deploy no Vercel

```bash
git add .
git commit -m "Adiciona sistema de saldo"
git push origin main
```

---

## 🎯 Como Funciona:

### Fluxo de Adicionar Saldo:

1. **Usuário clica em "Adicionar Saldo"**
2. **Informa o valor** (mínimo R$ 10, máximo R$ 10.000)
3. **Sistema gera PIX** via Mercado Pago
4. **Usuário paga o PIX**
5. **Webhook confirma** o pagamento
6. **Saldo é adicionado** automaticamente
7. **Transação registrada** no histórico

### Fluxo de Compra com Saldo:

1. **Usuário seleciona serviço**
2. **Sistema verifica saldo**
3. **Se tem saldo suficiente:**
   - Desconta do saldo
   - Cria o pedido
   - Registra transação
4. **Se não tem saldo:**
   - Mostra mensagem
   - Oferece adicionar saldo

---

## 🔧 Próximos Passos (UI):

Agora você precisa atualizar o Dashboard para:

### 1. Mostrar Saldo do Usuário
- Card com saldo atual
- Botão "Adicionar Saldo"

### 2. Modal de Adicionar Saldo
- Input para valor
- Gerar QR Code PIX
- Polling para confirmar pagamento

### 3. Atualizar Fluxo de Compra
- Verificar saldo antes
- Se tem saldo: comprar direto
- Se não tem: mostrar opção de adicionar

### 4. Aba de Histórico
- Lista de transações
- Filtros (depósitos/compras)
- Saldo antes/depois

---

## 📊 Estrutura de Dados:

### Tabela `users`:
```
- balance: DECIMAL(10,2) - Saldo atual do usuário
```

### Tabela `balance_transactions`:
```
- id: UUID
- user_id: UUID
- type: 'deposit' ou 'purchase'
- amount: DECIMAL(10,2) - Valor (positivo para deposit, negativo para purchase)
- balance_before: DECIMAL(10,2)
- balance_after: DECIMAL(10,2)
- description: TEXT
- payment_id: VARCHAR(255) - ID do PIX (para deposits)
- order_id: UUID - ID do pedido (para purchases)
- status: 'pending', 'completed', 'failed'
- created_at: TIMESTAMP
```

---

## 🧪 Como Testar:

### 1. Adicionar Saldo:
```javascript
const response = await paymentApi.addBalance(50.00);
// Retorna QR Code PIX
```

### 2. Comprar com Saldo:
```javascript
const response = await paymentApi.purchaseWithBalance({
  serviceType: 'followers',
  packageId: '1000',
  quantity: 1000,
  price: 15.00,
  instagramUsername: 'teste'
});
// Retorna orderId e novo saldo
```

### 3. Ver Histórico:
```javascript
const response = await paymentApi.getBalanceHistory();
// Retorna lista de transações
```

---

## 🎨 Sugestão de UI:

### Card de Saldo (no topo do Dashboard):
```
┌─────────────────────────────────────┐
│ 💰 Seu Saldo                        │
│                                     │
│ R$ 150,00                           │
│                                     │
│ [+ Adicionar Saldo]  [Ver Histórico]│
└─────────────────────────────────────┘
```

### Modal de Adicionar Saldo:
```
┌─────────────────────────────────────┐
│ Adicionar Saldo                  [X]│
├─────────────────────────────────────┤
│                                     │
│ Quanto deseja adicionar?            │
│ ┌─────────────────────────────────┐ │
│ │ R$ [____]                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Valores sugeridos:                  │
│ [R$ 50] [R$ 100] [R$ 200] [R$ 500] │
│                                     │
│ [Gerar PIX]                         │
└─────────────────────────────────────┘
```

---

## ✅ Pronto!

O backend está 100% implementado. Agora só falta criar a interface no Dashboard para o usuário usar o sistema de saldo! 🚀
