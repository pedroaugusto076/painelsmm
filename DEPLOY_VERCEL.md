# Deploy no Vercel - Instruções

## Arquivos Modificados

✅ `vercel.json` - Configuração corrigida para rotas serverless
✅ `api/index.js` - Handler melhorado com logs
✅ `server/server.js` - Logs adicionados para debug
✅ `server/controllers/paymentController.js` - Webhook corrigido
✅ `server/routes/payments.js` - Rota de teste adicionada

## Passos para Deploy

### 1. Fazer commit e push das alterações

```bash
cd painelsmm
git add .
git commit -m "fix: corrigir webhook do Mercado Pago e rotas da API"
git push origin main
```

### 2. Verificar variáveis de ambiente no Vercel

Acesse: https://vercel.com/pedroaugusto076s-projects/painelsmm/settings/environment-variables

Certifique-se de que estas variáveis estão configuradas:

#### Obrigatórias:
```env
# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d

# Node
NODE_ENV=production

# URLs
FRONTEND_URL=https://painelsmm-two.vercel.app
BACKEND_URL=https://painelsmm-two.vercel.app

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
MERCADOPAGO_WEBHOOK_SECRET=759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7

# SMMMIDIA
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=f1aba6dc3fde9dbb2f6600840a865c13
SMMMIDIA_SERVICE_ID=1353

# Email (Resend)
RESEND_API_KEY=re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc
EMAIL_FROM=testsmm <onboarding@resend.dev>

# Database (Vercel Postgres)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

### 3. Aguardar o deploy automático

O Vercel vai detectar o push e fazer o deploy automaticamente.

### 4. Testar as rotas

#### a) Health Check
```bash
curl https://painelsmm-two.vercel.app/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2026-05-13T...",
  "env": "production"
}
```

#### b) Webhook Test
```bash
curl https://painelsmm-two.vercel.app/api/payments/webhook-test
```

Resposta esperada:
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

#### c) Webhook POST (simular Mercado Pago)
```bash
curl -X POST https://painelsmm-two.vercel.app/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","action":"payment.updated","data.id":"123456789"}'
```

Resposta esperada:
```
OK
```

### 5. Verificar logs no Vercel

Acesse: https://vercel.com/pedroaugusto076s-projects/painelsmm/logs

Procure por:
- ✅ `📥 GET /api/health` - Requisições chegando
- ✅ `📥 GET /api/payments/webhook-test` - Rota de teste funcionando
- ✅ `📥 POST /api/payments/webhook` - Webhook recebendo dados
- ✅ `🚀 [API] Servidor inicializado com sucesso!` - API inicializando

### 6. Testar fluxo completo de pagamento

1. Acesse o frontend: https://painelsmm-two.vercel.app
2. Faça login
3. Crie um pedido de teste (valor mínimo)
4. Copie o QR Code PIX
5. Pague usando o app do banco
6. Aguarde 5-10 segundos
7. Verifique se o status mudou para "Processando" ou "Concluído"

### 7. Monitorar webhook

Após fazer um pagamento, verifique os logs:

```
📥 Webhook recebido - Body completo: { "type": "payment", "data.id": "158400862671" }
💳 Buscando informações do pagamento: 158400862671
📋 Informações do pagamento: { "status": "approved", ... }
🚀 Pagamento aprovado! Enviando para SMMMIDIA...
✅ Pedido enviado para SMMMIDIA! Order ID: 12345
✅ Pedido concluído: abc-123-def
```

## Troubleshooting

### Problema: "Rota não encontrada"

**Causa**: Vercel não está roteando corretamente para `/api/index.js`

**Solução**:
1. Verificar se `vercel.json` está correto
2. Fazer redeploy: `vercel --prod`
3. Verificar logs de build no Vercel

### Problema: Webhook não está sendo chamado

**Causa**: `notification_url` não está configurado ou Mercado Pago não consegue acessar

**Solução**:
1. Verificar se `BACKEND_URL` está configurado no Vercel
2. Verificar logs de criação de pagamento: deve mostrar `🔔 Notification URL configurada: ...`
3. Configurar webhook manualmente no painel do Mercado Pago:
   - URL: `https://painelsmm-two.vercel.app/api/payments/webhook`
   - Eventos: `payment.created`, `payment.updated`

### Problema: Pagamento não é processado

**Causa**: Webhook recebe notificação mas não processa

**Solução**:
1. Verificar logs do webhook no Vercel
2. Executar verificação manual:
   ```bash
   curl -X GET https://painelsmm-two.vercel.app/api/payments/check-pending \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

### Problema: Erro de banco de dados

**Causa**: Vercel Postgres não está configurado

**Solução**:
1. Criar banco Vercel Postgres no painel
2. Copiar variáveis de ambiente para o projeto
3. Criar tabelas manualmente se necessário

## Estrutura de Rotas no Vercel

```
https://painelsmm-two.vercel.app/
├── api/
│   ├── health              → GET  - Health check
│   ├── auth/
│   │   ├── register        → POST - Registrar usuário
│   │   ├── login           → POST - Login
│   │   └── ...
│   └── payments/
│       ├── create          → POST - Criar pagamento
│       ├── webhook         → POST - Webhook Mercado Pago
│       ├── webhook-test    → GET  - Testar webhook
│       ├── check-pending   → GET  - Verificar pendentes
│       ├── status/:id      → GET  - Status do pedido
│       └── orders          → GET  - Listar pedidos
└── (frontend React)
```

## Comandos Úteis

### Fazer deploy manual
```bash
vercel --prod
```

### Ver logs em tempo real
```bash
vercel logs painelsmm --follow
```

### Listar deployments
```bash
vercel ls painelsmm
```

### Rollback para deployment anterior
```bash
vercel rollback painelsmm
```

## Checklist Final

- [ ] Código commitado e pushed
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy concluído com sucesso
- [ ] `/api/health` retorna 200
- [ ] `/api/payments/webhook-test` retorna 200
- [ ] Pagamento de teste funciona
- [ ] Webhook processa pagamento
- [ ] Pedido é enviado para SMMMIDIA
- [ ] Status é atualizado no frontend

## Suporte

Se ainda houver problemas:

1. Verificar logs no Vercel Dashboard
2. Testar rotas individualmente
3. Verificar variáveis de ambiente
4. Executar `/api/payments/check-pending` manualmente
5. Verificar configuração do webhook no Mercado Pago
