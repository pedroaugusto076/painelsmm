# 🔄 Script para Atualizar TODOS os Pedidos Pendentes

## 📊 Situação Atual

Você tem **10 pedidos**, mas a maioria está como `"pending"` mesmo tendo sido pagos:

- ❌ `d4da7e46-25b7-4f9d-8cdb-9e2f032c0c15` - pending
- ❌ `fbce1e03-0513-4ed8-9cf5-9d36a27735e4` - pending  
- ✅ `375ab306-a949-416a-9ad0-7b6c0dc98938` - completed (único correto!)
- ❌ Outros 7 pedidos - pending/processing

## 🚀 Solução Rápida (2 minutos)

### Passo 1: Aguardar Deploy
Aguarde 2 minutos para o novo deploy terminar.

### Passo 2: Executar Script

1. **Acesse:** https://painelsmm-two.vercel.app
2. **Faça login**
3. **Pressione F12** (DevTools)
4. **Vá na aba Console**
5. **Cole e execute:**

```javascript
// Atualizar todos os pedidos pendentes
fetch('https://painelsmm-two.vercel.app/api/payments/check-pending', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== RESULTADO ===');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log('\n✅ Verificados:', data.data.checked, 'pedidos');
    console.log('📊 Atualizações:', data.data.updates.length);
    
    data.data.updates.forEach((update, i) => {
      console.log(`\n${i+1}. Pedido:`, update.orderId);
      console.log('   Status:', update.status);
      if (update.error) {
        console.log('   ❌ Erro:', update.error);
      }
    });
    
    alert(`✅ Verificados ${data.data.checked} pedidos!\n\nRecarregando página...`);
    setTimeout(() => location.reload(), 2000);
  } else {
    alert('❌ Erro: ' + data.message);
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao verificar pagamentos');
});
```

### Passo 3: Aguardar Processamento
O script vai:
1. Buscar todos os pedidos pendentes
2. Consultar o status no Mercado Pago
3. Atualizar automaticamente
4. Recarregar a página

### Passo 4: Verificar
Após recarregar, os pedidos devem aparecer na lista!

---

## 🐛 Se Ainda Não Funcionar

Se após executar o script os pedidos ainda não aparecerem:

### 1. Verificar se foram atualizados

Execute no console:
```javascript
fetch('https://painelsmm-two.vercel.app/api/payments/orders-debug', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
.then(r => r.json())
.then(data => {
  console.log('Pedidos após atualização:');
  data.debug.userOrders.orders.forEach(order => {
    console.log(`${order.id}: ${order.status}`);
  });
});
```

### 2. Verificar Logs da Vercel

Vá nos logs e procure por:
```
🔍 Verificando pagamentos pendentes...
📦 Encontrados X pedidos pendentes
💳 Pedido <id>: Payment <payment_id> = approved
✅ Status atualizado: completed
```

### 3. Problema no Frontend

Se os pedidos foram atualizados no banco mas não aparecem no frontend, o problema é no código React.

Execute no console:
```javascript
// Forçar reload dos pedidos
fetch('https://painelsmm-two.vercel.app/api/payments/orders', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
.then(r => r.json())
.then(data => {
  console.log('Pedidos retornados pela API:');
  console.log(data);
});
```

---

## 📋 Checklist

- [ ] Aguardar deploy (2 minutos)
- [ ] Fazer login no painel
- [ ] Abrir console (F12)
- [ ] Executar script de atualização
- [ ] Aguardar processamento
- [ ] Página recarrega automaticamente
- [ ] Verificar se pedidos aparecem
- [ ] Se não aparecer, executar debug

---

## 🎯 Próximo Teste

Depois de atualizar os pedidos antigos:

1. **Criar novo pedido**
2. **Pagar PIX**
3. **Aguardar 10 segundos**
4. **Atualizar página**
5. ✅ Deve aparecer como "completed" automaticamente

Se funcionar, o webhook está OK e o problema era só com os pedidos antigos!

---

**🚀 Execute o script AGORA e seus pedidos serão atualizados!**
