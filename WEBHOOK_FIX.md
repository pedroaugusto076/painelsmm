# Correção do Webhook do Mercado Pago

## Problemas Identificados nos Logs

### 1. Webhook recebendo dados undefined
```json
{
  "type": undefined,
  "action": undefined,
  "paymentId": undefined
}
```

**Causa**: O Mercado Pago pode enviar dados via query params (`?type=payment&data.id=123`) ou no body, mas o código só verificava o body.

### 2. Estrutura de dados incorreta
O código esperava `req.body.data.id`, mas o Mercado Pago envia `req.body['data.id']` (com ponto no nome da propriedade).

### 3. Falta de logs detalhados
Não havia logs suficientes para debugar o processamento do webhook.

## Correções Implementadas

### 1. Suporte a múltiplos formatos de webhook
```javascript
// Agora aceita dados via query params OU body
const type = req.body.type || req.query.type;
const dataId = req.body['data.id'] || req.query['data.id'] || req.body.data?.id;
const action = req.body.action || req.query.action;
```

### 2. Logs detalhados
```javascript
// Log completo do body e query params
console.log('📥 Webhook recebido - Body completo:', JSON.stringify(req.body, null, 2));
console.log('📥 Webhook recebido - Query params:', JSON.stringify(req.query, null, 2));

// Log das informações do pagamento
console.log('📋 Informações do pagamento:', JSON.stringify({
  id: paymentInfo.id,
  status: paymentInfo.status,
  external_reference: paymentInfo.external_reference,
  transaction_amount: paymentInfo.transaction_amount
}, null, 2));
```

### 3. Melhor tratamento de erros
```javascript
try {
  // Enviar pedido para SMMMIDIA
  const smmmidiaResult = await smmmidiaService.createOrder(...);
  // ...
} catch (smmmidiaError) {
  console.error('❌ Exceção ao enviar para SMMMIDIA:', smmmidiaError);
  // Marcar como erro no banco
}
```

### 4. Configuração correta do notification_url
```javascript
// Usar BACKEND_URL ou VERCEL_URL
const backendUrl = process.env.BACKEND_URL || process.env.VERCEL_URL;
if (backendUrl) {
  const webhookUrl = backendUrl.startsWith('http') 
    ? `${backendUrl}/api/payments/webhook`
    : `https://${backendUrl}/api/payments/webhook`;
  
  body.notification_url = webhookUrl;
}
```

### 5. Rota de teste do webhook
Nova rota GET `/api/payments/webhook-test` para verificar se o endpoint está ativo.

## Variáveis de Ambiente Necessárias no Vercel

Certifique-se de que estas variáveis estão configuradas no Vercel:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...

# Backend URL (URL do seu projeto Vercel)
BACKEND_URL=https://painelsmm-two.vercel.app

# SMMMIDIA
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=...
SMMMIDIA_SERVICE_ID=1353

# Database (Vercel Postgres)
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
```

## Como Testar

### 1. Testar o endpoint do webhook
```bash
curl https://painelsmm-two.vercel.app/api/payments/webhook-test
```

Deve retornar:
```json
{
  "success": true,
  "message": "Webhook endpoint está ativo",
  "timestamp": "2026-05-13T...",
  "env": {
    "hasAccessToken": true,
    "backendUrl": "https://painelsmm-two.vercel.app"
  }
}
```

### 2. Simular um webhook do Mercado Pago
```bash
curl -X POST https://painelsmm-two.vercel.app/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data.id": "123456789"
  }'
```

### 3. Verificar pagamentos pendentes manualmente
Se algum pagamento não foi processado pelo webhook, você pode forçar a verificação:

```bash
curl -X GET https://painelsmm-two.vercel.app/api/payments/check-pending \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

Esta rota:
- Busca todos os pedidos com status `pending` ou `processing`
- Consulta o status no Mercado Pago
- Atualiza o banco de dados
- Envia para SMMMIDIA se aprovado

## Fluxo Correto do Pagamento

1. **Usuário cria pagamento** → POST `/api/payments/create`
   - Cria pedido no banco com status `pending`
   - Gera PIX no Mercado Pago
   - Retorna QR Code para o usuário

2. **Usuário paga o PIX**
   - Mercado Pago detecta o pagamento
   - Envia webhook para `/api/payments/webhook`

3. **Webhook processa o pagamento**
   - Recebe notificação (via body ou query params)
   - Busca informações do pagamento no Mercado Pago
   - Atualiza status no banco: `pending` → `processing`
   - Se aprovado, envia para SMMMIDIA
   - Atualiza status: `processing` → `completed`

4. **Frontend verifica status** → GET `/api/payments/status/:orderId`
   - Polling a cada 5 segundos
   - Mostra status atualizado para o usuário

## Monitoramento

### Logs importantes no Vercel:

✅ **Webhook funcionando:**
```
📥 Webhook recebido - Body completo: { "type": "payment", "data.id": "123" }
💳 Buscando informações do pagamento: 123
📋 Informações do pagamento: { "status": "approved", ... }
🚀 Pagamento aprovado! Enviando para SMMMIDIA...
✅ Pedido enviado para SMMMIDIA! Order ID: 456
✅ Pedido concluído: abc-123
```

❌ **Problemas comuns:**
```
⚠️ Webhook sem payment ID, ignorando
❌ Pedido não encontrado: abc-123
❌ Erro ao enviar para SMMMIDIA: ...
```

## Próximos Passos

1. ✅ Fazer deploy das correções
2. ✅ Verificar variáveis de ambiente no Vercel
3. ✅ Testar endpoint do webhook
4. ✅ Fazer um pagamento de teste
5. ✅ Monitorar logs no Vercel Dashboard
6. ⚠️ Se ainda houver problemas, executar `/api/payments/check-pending` manualmente

## Configuração do Webhook no Mercado Pago

Se necessário, configure o webhook manualmente no painel do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Adicione a URL: `https://painelsmm-two.vercel.app/api/payments/webhook`
3. Selecione eventos: `payment.created`, `payment.updated`
4. Salve e teste

**Nota**: O Mercado Pago também envia webhooks automaticamente quando você usa `notification_url` na criação do pagamento (que agora está configurado corretamente).
