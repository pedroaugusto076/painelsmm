# Configuração do Webhook Mercado Pago

## Status Atual

✅ **Webhook criado**: `api/payments/webhook.js`
✅ **Endpoint de status criado**: `api/payments/status.js`
✅ **Frontend configurado**: Polling automático a cada 5 segundos
✅ **URL do webhook**: `https://painelsmm-two.vercel.app/api/payments/webhook`

## Como Funciona

### Fluxo de Pagamento

1. **Usuário cria pedido** → Frontend chama `/api/payments/create`
2. **Sistema gera PIX** → Mercado Pago retorna QR Code e código PIX
3. **Modal aparece** → Usuário vê QR Code e pode copiar código
4. **Polling inicia** → Frontend verifica status a cada 5 segundos
5. **Usuário paga** → Mercado Pago detecta pagamento
6. **Webhook recebe notificação** → `/api/payments/webhook` é chamado
7. **Status atualizado** → Pedido muda de `pending` para `completed`
8. **Frontend detecta** → Polling encontra status `completed`
9. **Modal de sucesso** → Usuário vê confirmação e é redirecionado

### Arquivos Envolvidos

- `api/payments/create.js` - Cria pagamento PIX
- `api/payments/webhook.js` - Recebe notificações do Mercado Pago
- `api/payments/status.js` - Endpoint para verificar status do pedido
- `src/components/Dashboard.tsx` - Interface e polling
- `src/services/api.ts` - Chamadas à API

## Configuração Necessária

### 1. Variáveis de Ambiente (Vercel)

Certifique-se de que estas variáveis estão configuradas no Vercel:

```
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
BACKEND_URL=https://painelsmm-two.vercel.app
SUPABASE_URL=https://xicorwjdvlpwjczvtizm.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui
JWT_SECRET=seu_secret_aqui
```

### 2. Configurar Webhook no Mercado Pago

**IMPORTANTE**: Você precisa configurar o webhook no painel do Mercado Pago!

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks** ou **Notificações**
4. Adicione a URL: `https://painelsmm-two.vercel.app/api/payments/webhook`
5. Selecione os eventos:
   - ✅ `payment` (pagamentos)
   - ✅ `merchant_order` (opcional)

### 3. Testar Webhook

Para testar se o webhook está funcionando:

1. Faça um pagamento de teste (R$ 0,01)
2. Verifique os logs no Vercel:
   ```
   https://vercel.com/pedroaugusto076s-projects/painelsmm/logs
   ```
3. Procure por logs com `[WEBHOOK]`
4. Deve aparecer:
   ```
   📥 [WEBHOOK] Recebido do Mercado Pago
   💳 [WEBHOOK] Payment ID: xxx
   💰 [WEBHOOK] Status do pagamento: approved
   ✅ [WEBHOOK] Pedido atualizado com sucesso!
   ```

## Troubleshooting

### Problema: Modal não aparece após pagamento

**Possíveis causas:**

1. **Webhook não configurado no Mercado Pago**
   - Solução: Configure conforme instruções acima

2. **Webhook não está recebendo notificações**
   - Verifique logs do Vercel
   - Teste a URL manualmente: `curl -X POST https://painelsmm-two.vercel.app/api/payments/webhook`

3. **Polling não está funcionando**
   - Abra o console do navegador (F12)
   - Procure por logs `[POLLING]`
   - Deve aparecer: `🔄 [POLLING] Iniciando verificação automática do pagamento...`

4. **Status não está sendo atualizado no banco**
   - Verifique se RLS está desabilitado nas tabelas do Supabase
   - Execute: `SELECT * FROM orders WHERE id = 'seu_order_id';`

### Problema: Erro "Order ID: undefined"

Isso significa que a resposta do servidor não contém `orderId`. Verifique:

1. O endpoint `/api/payments/create` está retornando `orderId` na resposta
2. A estrutura da resposta está correta:
   ```json
   {
     "success": true,
     "data": {
       "orderId": "uuid-aqui",
       "paymentId": 123456,
       "amount": 10.00,
       "pixQrCode": "codigo-pix",
       "pixQrCodeBase64": "base64-string"
     }
   }
   ```

### Problema: Webhook retorna erro 401 ou 500

1. Verifique se as variáveis de ambiente estão configuradas no Vercel
2. Verifique se o token do Mercado Pago é válido
3. Verifique os logs do Vercel para detalhes do erro

## Próximos Passos

1. ✅ Commit e push dos arquivos criados
2. ⏳ Deploy automático no Vercel
3. ⏳ Configurar webhook no painel do Mercado Pago
4. ⏳ Fazer pagamento de teste
5. ⏳ Verificar logs e confirmar funcionamento

## Comandos Git

```bash
git add api/payments/status.js api/payments/webhook.js src/services/api.ts WEBHOOK_SETUP.md
git commit -m "feat: adiciona endpoint de status e webhook para pagamentos PIX"
git push origin main
```

## Logs Úteis

### Frontend (Console do Navegador)
- `🚀 [DEBUG] Iniciando criação de pagamento...`
- `✅ [DEBUG] Resposta do servidor:`
- `💳 [DEBUG] PIX gerado com sucesso!`
- `🔄 [POLLING] Iniciando verificação automática do pagamento...`
- `🔍 [POLLING] Status do pedido:`
- `✅ [POLLING] Pagamento confirmado!`

### Backend (Vercel Logs)
- `📥 [WEBHOOK] Recebido do Mercado Pago:`
- `💳 [WEBHOOK] Payment ID:`
- `💰 [WEBHOOK] Status do pagamento:`
- `✅ [WEBHOOK] Pedido atualizado com sucesso!`
