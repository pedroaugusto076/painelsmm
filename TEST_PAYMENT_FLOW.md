# 🧪 Teste do Fluxo de Pagamento

## ✅ Status Atual

**PIX foi gerado com sucesso!** 🎉
- Order ID: `93bde739-93de-4211-b2ad-a00dfe2aeaa6`
- Payment ID: `159181361408`
- QR Code: Gerado ✅
- Valor: R$ 0,01

## 🔍 Próximos Passos para Debug

### 1. Verificar se o Pedido Foi Salvo no Banco

**No Console do Navegador (F12):**
1. Ir para aba "Meus Pedidos"
2. Ver logs:
   ```
   📋 [DEBUG] Carregando pedidos...
   ✅ [DEBUG] Resposta getUserOrders: {...}
   📦 [DEBUG] Pedidos recebidos: X
   📦 [DEBUG] Pedidos: [...]
   ```

**Esperado:**
- Se aparecer `Pedidos recebidos: 1` → Pedido foi salvo ✅
- Se aparecer `Pedidos recebidos: 0` → Pedido não foi salvo ❌

### 2. Verificar Logs do Servidor

**Vercel:**
```bash
vercel logs --follow
```

**Local:**
```bash
cd painelsmm/server
npm start
# Ver logs no terminal
```

**Logs Esperados:**
```
📋 [DEBUG] Buscando pedidos do usuário: abc-123-def
✅ [DEBUG] Pedidos encontrados: 1
📦 [DEBUG] Pedidos: [
  {
    id: "93bde739-93de-4211-b2ad-a00dfe2aeaa6",
    service_type: "followers",
    quantity: 100,
    price: 0.01,
    status: "pending",
    payment_status: "pending",
    ...
  }
]
```

### 3. Verificar Webhook do Mercado Pago

**Problema Comum:**
- Webhook não está configurado
- Webhook não consegue acessar o servidor
- Mercado Pago não enviou notificação

**Solução Temporária:**
1. Ir para aba "Admin/Logs"
2. Clicar em "Verificar Pendentes"
3. Isso vai buscar manualmente o status do pagamento

### 4. Verificar Status do Pagamento Manualmente

**No Console do Navegador:**
```javascript
// Copiar o Order ID
const orderId = "93bde739-93de-4211-b2ad-a00dfe2aeaa6";

// Buscar status
fetch(`/api/payments/status/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Status do pedido:', data));
```

## 🐛 Possíveis Problemas

### Problema 1: Pedidos não aparecem

**Causa:** Banco de dados não está salvando

**Debug:**
1. Ver logs do servidor ao criar pedido
2. Verificar se aparece: `✅ Pedido criado: abc-123-def`
3. Verificar se aparece: `✅ Pedido atualizado com dados do PIX`

**Solução:**
- Verificar se tabela `orders` existe
- Verificar se `user_id` está correto
- Ver logs de erro no servidor

### Problema 2: Webhook não funciona

**Causa:** Mercado Pago não consegue acessar o servidor

**Debug:**
1. Ver logs do servidor
2. Procurar por: `📥 Webhook recebido:`
3. Se não aparecer → Webhook não está chegando

**Solução:**
1. Usar botão "Verificar Pendentes" na aba Admin/Logs
2. Ou configurar webhook manualmente no Mercado Pago

### Problema 3: Pagamento não confirma

**Causa:** Status do pagamento não mudou para "approved"

**Debug:**
1. Verificar status no Mercado Pago
2. Ver se pagamento foi realmente aprovado
3. Usar botão "Verificar Pendentes"

## 📊 Fluxo Completo

```
1. Criar Pedido
   ↓
2. Salvar no Banco (status: pending)
   ↓
3. Gerar PIX no Mercado Pago
   ↓
4. Atualizar Pedido com payment_id
   ↓
5. Mostrar QR Code
   ↓
6. Usuário paga PIX
   ↓
7. Mercado Pago envia webhook
   ↓
8. Servidor recebe webhook
   ↓
9. Atualizar status para "processing"
   ↓
10. Enviar para SMMMIDIA
   ↓
11. Atualizar status para "completed"
```

## 🧪 Teste Agora

### Passo 1: Ver Pedidos
1. Ir para aba "Meus Pedidos"
2. Abrir console (F12)
3. Ver logs:
   ```
   📋 [DEBUG] Carregando pedidos...
   ✅ [DEBUG] Resposta getUserOrders: {...}
   📦 [DEBUG] Pedidos recebidos: ?
   ```

### Passo 2: Se Pedidos = 0
**Problema:** Pedido não foi salvo no banco

**Verificar:**
1. Logs do servidor ao criar pedido
2. Erro ao salvar no banco?
3. Tabela `orders` existe?

### Passo 3: Se Pedidos = 1 mas status = "pending"
**Problema:** Webhook não funcionou

**Solução:**
1. Ir para "Admin/Logs"
2. Clicar em "Verificar Pendentes"
3. Aguardar processamento

### Passo 4: Ver Resultado
- Se status mudou para "completed" → Sucesso! ✅
- Se status continua "pending" → Ver logs de erro

## 🔧 Comandos Úteis

### Ver Logs do Servidor
```bash
# Vercel
vercel logs --follow

# Local
cd painelsmm/server && npm start
```

### Testar API Diretamente
```bash
# Buscar pedidos
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://seu-projeto.vercel.app/api/payments/orders

# Verificar pendentes
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://seu-projeto.vercel.app/api/payments/check-pending
```

### Ver Banco de Dados (Vercel)
1. Vercel Dashboard → Storage → seu-database
2. Query:
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
   ```

## 📝 Checklist

- [ ] PIX foi gerado? ✅ (Sim!)
- [ ] Pedido aparece em "Meus Pedidos"?
- [ ] Status do pedido está correto?
- [ ] Webhook está funcionando?
- [ ] Botão "Verificar Pendentes" funciona?

---

**Próximo passo:** Ir para aba "Meus Pedidos" e ver os logs no console!
