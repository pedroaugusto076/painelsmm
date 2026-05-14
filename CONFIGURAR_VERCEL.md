# Configurar Webhook do Mercado Pago na Vercel

## Problema Identificado
O webhook não está funcionando porque a variável `BACKEND_URL` não está configurada na Vercel.

## Solução - Configurar Variáveis de Ambiente na Vercel

### 1. Acessar o Dashboard da Vercel
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **painelsmm-two**
3. Vá em **Settings** → **Environment Variables**

### 2. Adicionar a Variável BACKEND_URL
Adicione a seguinte variável:

```
Nome: BACKEND_URL
Valor: https://painelsmm-two.vercel.app
Ambiente: Production, Preview, Development (marcar todos)
```

### 3. Verificar Outras Variáveis Necessárias
Certifique-se de que estas variáveis também estão configuradas:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
JWT_SECRET=15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
FRONTEND_URL=https://painelsmm-two.vercel.app
```

### 4. Fazer Redeploy
Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**

Ou simplesmente faça um novo commit:
```bash
git add .
git commit -m "fix: configurar webhook do mercado pago"
git push
```

### 5. Testar o Webhook
Após o deploy, teste se o webhook está ativo:

```
https://painelsmm-two.vercel.app/api/payments/webhook-test
```

Deve retornar:
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

## Verificar Pagamentos Já Pagos

Se você já tem pagamentos que foram pagos mas não foram confirmados:

### Opção 1: Via API (Recomendado)
1. Faça login no painel
2. Abra o Console do navegador (F12)
3. Execute:

```javascript
fetch('https://painelsmm-two.vercel.app/api/payments/check-pending', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
```

### Opção 2: Criar uma Página de Admin
Você pode adicionar um botão no painel para verificar pagamentos pendentes.

## Configurar Webhook Diretamente no Mercado Pago (Opcional mas Recomendado)

Para garantir que o webhook sempre funcione:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks** ou **Notificações**
4. Adicione a URL: `https://painelsmm-two.vercel.app/api/payments/webhook`
5. Selecione o evento: **Pagamentos** (payments)
6. Salve

## Próximos Passos

Depois de configurar:

1. ✅ Adicionar `BACKEND_URL` na Vercel
2. ✅ Fazer redeploy
3. ✅ Testar o endpoint do webhook
4. ✅ Fazer um novo pagamento PIX de teste
5. ✅ Verificar se é confirmado automaticamente
6. ✅ (Opcional) Verificar pagamentos antigos com `/check-pending`

## Debug

Se ainda não funcionar, verifique os logs da Vercel:

1. Vá em **Deployments**
2. Clique no último deploy
3. Vá em **Functions**
4. Procure por logs do webhook quando você pagar o PIX

Você deve ver:
```
📥 Webhook recebido - Body completo: {...}
💳 Buscando informações do pagamento: 123456789
✅ Status atualizado: completed
```
