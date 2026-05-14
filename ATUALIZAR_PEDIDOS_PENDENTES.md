# 🔄 Atualizar Pedidos Pendentes Manualmente

## 📊 Situação Atual

Você tem **17 pedidos** no banco, mas alguns estão como `"pending"` mesmo tendo sido pagos.

Exemplo:
```json
{
  "id": "fbce1e03-0513-4ed8-9cf5-9d36a27735e4",
  "status": "pending"  // ❌ Deveria ser "completed"
}
```

## ✅ Solução

Vou te mostrar 2 formas de atualizar os pedidos pendentes:

---

## 🔧 Opção 1: Via API (Recomendado)

### Passo 1: Aguardar Deploy
Aguarde 2 minutos para o novo deploy terminar.

### Passo 2: Fazer Login
Acesse: https://painelsmm-two.vercel.app e faça login

### Passo 3: Abrir Console
Pressione **F12** e vá na aba **Console**

### Passo 4: Executar Script
Cole e execute este código:

```javascript
fetch('https://painelsmm-two.vercel.app/api/payments/check-pending', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resultado:', data);
  alert(`Verificados ${data.data?.checked || 0} pedidos!`);
  
  // Recarregar a página para ver os pedidos atualizados
  setTimeout(() => location.reload(), 2000);
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao verificar pagamentos');
});
```

Isso vai:
1. Buscar todos os pedidos pendentes
2. Consultar o status no Mercado Pago
3. Atualizar automaticamente os que foram pagos
4. Recarregar a página

---

## 🗄️ Opção 2: Via SQL (Avançado)

Se você tiver acesso ao Vercel Postgres Query Editor:

### 1. Acessar Query Editor
Dashboard → Storage → painelsmm-db → Query

### 2. Ver Pedidos Pendentes
```sql
SELECT id, payment_id, status, payment_status, created_at 
FROM orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### 3. Atualizar Manualmente (se souber que foi pago)
```sql
UPDATE orders 
SET status = 'completed', 
    payment_status = 'approved',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'fbce1e03-0513-4ed8-9cf5-9d36a27735e4';
```

---

## 📋 Verificar Logs

Após executar a Opção 1, vá nos logs da Vercel e procure por:

```
🔍 Verificando pagamentos pendentes...
📦 Encontrados X pedidos pendentes
💳 Pedido <id>: Payment <payment_id> = approved
✅ Status atualizado: completed
```

---

## 🎯 Próximos Passos

Após atualizar os pedidos pendentes:

### 1. Testar Novo Pedido
1. Criar novo pedido
2. Pagar PIX
3. Aguardar 10 segundos
4. Atualizar página
5. ✅ Deve aparecer como "completed"

### 2. Verificar Logs
Procure por:
```
📋 [GET-ORDERS] Buscando pedidos do usuário: <uuid>
✅ [GET-ORDERS] Pedidos encontrados: X
```

Se aparecer:
```
⚠️ [GET-ORDERS] Nenhum pedido encontrado
```

Significa que há um problema com o `user_id`.

---

## 🐛 Se os Pedidos Ainda Não Aparecerem

### Verificar User ID

Execute no console:
```javascript
console.log('User ID:', JSON.parse(localStorage.getItem('user')).id);
```

Depois compare com os `user_id` dos pedidos em:
```
https://painelsmm-two.vercel.app/api/db-check
```

Se forem diferentes, há um problema de autenticação.

---

## 📊 Status dos Pedidos

Segundo o `/api/db-check`:

```json
{
  "totalOrders": "17",
  "recentOrders": [
    {
      "id": "fbce1e03-0513-4ed8-9cf5-9d36a27735e4",
      "user_id": "00a16301-3d25-4925-8cec-ea1782823f25",
      "status": "pending"  // ← Este precisa ser atualizado
    },
    {
      "id": "375ab306-a949-416a-9ad0-7b6c0dc98938",
      "status": "completed"  // ← Este já está correto
    }
  ]
}
```

---

## ✅ Checklist

- [ ] Aguardar deploy (2 minutos)
- [ ] Fazer login no painel
- [ ] Abrir console (F12)
- [ ] Executar script de verificação
- [ ] Aguardar processamento
- [ ] Página recarrega automaticamente
- [ ] Pedidos aparecem na lista ✅

---

## 💡 Dica

Após configurar tudo, os **novos pedidos** serão confirmados automaticamente pelo webhook. Você só precisa atualizar os pedidos antigos uma vez!

---

**🚀 Execute a Opção 1 agora e seus pedidos serão atualizados!**
