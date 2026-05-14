# Configuração do Webhook do Mercado Pago

## Problema
O pagamento PIX é gerado, mas quando pago não é confirmado automaticamente porque o Mercado Pago não consegue enviar notificações para `localhost`.

## Solução para Desenvolvimento Local

### 1. Instalar ngrok
```bash
# Baixe em: https://ngrok.com/download
# Ou use chocolatey:
choco install ngrok
```

### 2. Expor seu servidor local
```bash
# Inicie seu servidor normalmente na porta 5000
npm start

# Em outro terminal, execute:
ngrok http 5000
```

### 3. Copiar a URL pública
O ngrok vai gerar uma URL como: `https://abc123.ngrok.io`

### 4. Atualizar o .env
```env
BACKEND_URL=https://abc123.ngrok.io
```

### 5. Reiniciar o servidor
```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm start
```

## Solução para Produção

Se você já tem o app em produção (Vercel, Heroku, etc):

### 1. Atualizar BACKEND_URL no .env de produção
```env
BACKEND_URL=https://seu-dominio.vercel.app
```

### 2. Verificar se o webhook está registrado
Acesse: https://seu-dominio.vercel.app/api/payments/webhook-test

Deve retornar:
```json
{
  "success": true,
  "message": "Webhook endpoint está ativo"
}
```

## Verificar Pagamentos Pendentes Manualmente

Se você já tem pagamentos que foram pagos mas não confirmados:

### 1. Faça login no painel
### 2. Acesse no navegador:
```
http://localhost:5000/api/payments/check-pending
```

Ou use o Postman/Insomnia com:
- URL: `http://localhost:5000/api/payments/check-pending`
- Method: GET
- Headers: `Authorization: Bearer SEU_TOKEN_JWT`

Isso vai verificar todos os pagamentos pendentes no Mercado Pago e atualizar automaticamente.

## Testar o Webhook

### 1. Criar um pagamento PIX
### 2. Pagar o PIX
### 3. Verificar os logs do servidor

Você deve ver:
```
📥 Webhook recebido - Body completo: {...}
💳 Buscando informações do pagamento: 123456789
✅ Status atualizado: completed
```

## Configurar Webhook no Mercado Pago (Opcional)

Você também pode configurar o webhook diretamente no painel do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em "Webhooks"
4. Adicione a URL: `https://seu-dominio.com/api/payments/webhook`
5. Selecione o evento: "Pagamentos"

## Debug

Para verificar se o webhook está funcionando:

```bash
# Ver logs do servidor
npm start

# Testar endpoint
curl http://localhost:5000/api/payments/webhook-test
```
