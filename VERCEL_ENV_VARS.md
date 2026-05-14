# 🔐 Variáveis de Ambiente para Configurar na Vercel

## ⚠️ IMPORTANTE
Configure estas variáveis no dashboard da Vercel antes de fazer deploy!

**Dashboard:** https://vercel.com/dashboard
**Projeto:** painelsmm-two
**Caminho:** Settings → Environment Variables

---

## 📋 Variáveis Obrigatórias

### 1. Backend e Frontend URLs
```
BACKEND_URL=https://painelsmm-two.vercel.app
FRONTEND_URL=https://painelsmm-two.vercel.app
```

### 2. JWT Configuration
```
JWT_SECRET=15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
JWT_EXPIRES_IN=7d
```

### 3. Mercado Pago
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
MERCADOPAGO_WEBHOOK_SECRET=759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7
```

### 4. Email (Resend)
```
RESEND_API_KEY=re_YTNSuv2R_BsVZpUMzMdYyb7LaoFTuh1dc
EMAIL_FROM=testsmm <onboarding@resend.dev>
```

### 5. SMMMIDIA API
```
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=f1aba6dc3fde9dbb2f6600840a865c13
SMMMIDIA_SERVICE_ID=1353
```

### 6. Server Configuration
```
PORT=5000
NODE_ENV=production
```

---

## 🎯 Como Configurar

### Passo 1: Acessar Dashboard
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **painelsmm-two**
3. Clique em **Settings**
4. Vá em **Environment Variables**

### Passo 2: Adicionar Cada Variável
Para cada variável acima:
1. Clique em **Add New**
2. Cole o **Nome** (ex: `BACKEND_URL`)
3. Cole o **Valor** (ex: `https://painelsmm-two.vercel.app`)
4. Marque: **Production**, **Preview**, **Development**
5. Clique em **Save**

### Passo 3: Redeploy
Após adicionar todas as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**

---

## ✅ Verificar Configuração

Após o deploy, teste:

### 1. Health Check
```
https://painelsmm-two.vercel.app/api/health
```

Deve retornar:
```json
{
  "success": true,
  "message": "API está funcionando",
  "env": "production"
}
```

### 2. Webhook Test
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

---

## 🚨 Troubleshooting

### Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"
- ✅ Verifique se adicionou a variável na Vercel
- ✅ Verifique se marcou "Production"
- ✅ Faça redeploy após adicionar

### Erro: "Webhook não está sendo chamado"
- ✅ Verifique se `BACKEND_URL` está configurado
- ✅ Configure o webhook no painel do Mercado Pago
- ✅ URL: `https://painelsmm-two.vercel.app/api/payments/webhook`

### Erro de CORS
- ✅ Verifique se `FRONTEND_URL` está configurado
- ✅ Deve ser: `https://painelsmm-two.vercel.app`

---

## 📝 Notas

- ⚠️ **Nunca** commite o arquivo `.env` no git
- ✅ As variáveis da Vercel são **separadas** do `.env` local
- ✅ Cada ambiente (Production/Preview/Development) pode ter valores diferentes
- ✅ Após mudar variáveis, sempre faça **redeploy**
