# 🔧 Solução: Pagamento PIX não está sendo confirmado

## 📋 Problema
O PIX é gerado e pago, mas não aparece como confirmado no painel.

## 🎯 Causa
O Mercado Pago não consegue enviar a notificação de pagamento porque a variável `BACKEND_URL` não está configurada na Vercel.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Configurar Variável na Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione** o projeto `painelsmm-two`
3. **Clique em:** Settings → Environment Variables
4. **Adicione:**
   ```
   Nome: BACKEND_URL
   Valor: https://painelsmm-two.vercel.app
   ```
5. **Marque:** Production, Preview e Development
6. **Clique em:** Save

### Passo 2: Fazer Redeploy

**Opção A - Via Dashboard:**
1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**

**Opção B - Via Git (Recomendado):**
```bash
cd c:\Users\userp\Documents\smm\painelsmm
git add .
git commit -m "fix: adicionar BACKEND_URL para webhook"
git push
```

### Passo 3: Testar

Após o deploy terminar, acesse:
```
https://painelsmm-two.vercel.app/api/payments/webhook-test
```

✅ **Deve retornar:**
```json
{
  "success": true,
  "message": "Webhook endpoint está ativo",
  "env": {
    "hasAccessToken": true,
    "backendUrl": "https://painelsmm-two.vercel.app"
  }
}
```

---

## 🔄 Verificar Pagamentos Já Pagos

Se você já tem pagamentos que foram pagos mas não confirmados:

### Via Console do Navegador:

1. **Abra** o painel: https://painelsmm-two.vercel.app
2. **Faça login**
3. **Pressione F12** (abrir DevTools)
4. **Vá na aba Console**
5. **Cole e execute:**

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
  alert('Verificação concluída! Veja o console para detalhes.');
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao verificar pagamentos');
});
```

Isso vai verificar todos os pagamentos pendentes no Mercado Pago e atualizar automaticamente.

---

## 🎯 Configurar Webhook no Mercado Pago (IMPORTANTE)

Para garantir que funcione sempre:

1. **Acesse:** https://www.mercadopago.com.br/developers/panel/app
2. **Selecione** sua aplicação
3. **Vá em:** Webhooks (ou Notificações)
4. **Clique em:** Adicionar URL
5. **Cole:**
   ```
   https://painelsmm-two.vercel.app/api/payments/webhook
   ```
6. **Selecione:** Pagamentos (payments)
7. **Salve**

---

## 🧪 Testar Novo Pagamento

Depois de configurar tudo:

1. ✅ Crie um novo pedido
2. ✅ Gere o PIX
3. ✅ Pague o PIX
4. ✅ Aguarde 5-10 segundos
5. ✅ Atualize a página
6. ✅ O pedido deve aparecer como "Concluído"

---

## 🐛 Debug

Se ainda não funcionar, verifique os logs:

### Logs da Vercel:
1. Dashboard → Deployments
2. Clique no último deploy
3. Vá em **Functions**
4. Procure por logs quando você pagar o PIX

### Logs esperados:
```
📥 Webhook recebido - Body completo: {...}
💳 Buscando informações do pagamento: 123456789
📋 Informações do pagamento: {...}
✅ Status atualizado: completed
```

### Se não aparecer nenhum log:
- ❌ O webhook não está sendo chamado
- ✅ Configure o webhook diretamente no painel do Mercado Pago (passo acima)

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs da Vercel
2. Teste o endpoint: `/api/payments/webhook-test`
3. Verifique se `BACKEND_URL` está configurado
4. Teste um novo pagamento

---

## ✨ Resumo

**O que fazer AGORA:**
1. ✅ Adicionar `BACKEND_URL=https://painelsmm-two.vercel.app` na Vercel
2. ✅ Fazer redeploy
3. ✅ Configurar webhook no painel do Mercado Pago
4. ✅ Testar com um novo pagamento
5. ✅ (Opcional) Verificar pagamentos antigos com o script do console

**Tempo estimado:** 5-10 minutos
