# 🚀 Como Configurar Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE
O erro "A server e... is not valid JSON" acontece porque as variáveis de ambiente não estão configuradas no Vercel.

## 📋 Passo a Passo

### 1. Acesse o Painel do Vercel
- Vá para: https://vercel.com/dashboard
- Faça login com sua conta
- Selecione o projeto **painelsmm-two**

### 2. Vá para Settings
- Clique em **Settings** no menu superior
- No menu lateral, clique em **Environment Variables**

### 3. Adicione TODAS as Variáveis Abaixo

Clique em **Add New** para cada variável:

#### JWT Configuration
```
Name: JWT_SECRET
Value: 15ddc9697b23f353fe51eea8f2e152d53a851e93ab033d0468e12fa529cc8eb2295337fcdee8f8c401cf2454f1a1952d01ff90bb7db98e43331f34ddebe980e2
Environment: Production, Preview, Development
```

```
Name: JWT_EXPIRES_IN
Value: 7d
Environment: Production, Preview, Development
```

#### Backend URL
```
Name: BACKEND_URL
Value: https://painelsmm-two.vercel.app
Environment: Production, Preview, Development
```

#### Supabase Configuration
```
Name: SUPABASE_URL
Value: https://xicorwjdvlpwjczvtizm.supabase.co
Environment: Production, Preview, Development
```

```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpY29yd2pkdmxwd2pjenZ0aXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg0MDMsImV4cCI6MjA5NDI2NDQwM30.XDK7aF-196C9G6lRZlVw60GE0kblIzH8ZzKawrpyCII
Environment: Production, Preview, Development
```

#### Mercado Pago Configuration
```
Name: MERCADOPAGO_ACCESS_TOKEN
Value: APP_USR-2012553697035421-051314-3b9a376f5972269a3392a373b6f602e7-251660323
Environment: Production, Preview, Development
```

```
Name: MERCADOPAGO_WEBHOOK_SECRET
Value: 759ac5eced580306f89ef0545dc2c0d8905dfac38454971a234918c3a7c65ac7
Environment: Production, Preview, Development
```

#### SMMMIDIA API Configuration
```
Name: SMMMIDIA_API_URL
Value: https://smmmidia.com/api/v2
Environment: Production, Preview, Development
```

```
Name: SMMMIDIA_API_KEY
Value: f1aba6dc3fde9dbb2f6600840a865c13
Environment: Production, Preview, Development
```

```
Name: SMMMIDIA_SERVICE_ID
Value: 1353
Environment: Production, Preview, Development
```

### 4. Redeploy o Projeto

Depois de adicionar TODAS as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos 3 pontinhos (...) do último deployment
3. Clique em **Redeploy**
4. Aguarde o deploy terminar (1-2 minutos)

### 5. Teste o Sistema

Depois do redeploy:
- Acesse: https://painelsmm-two.vercel.app
- Faça login
- Tente adicionar saldo
- Deve funcionar sem erros!

## 🔍 Como Verificar se Funcionou

Se as variáveis estiverem configuradas corretamente, você verá:
- ✅ Login funcionando
- ✅ Adicionar saldo funcionando (gera QR Code PIX)
- ✅ Comprar com saldo funcionando

Se ainda der erro, verifique:
- ❌ Todas as variáveis foram adicionadas?
- ❌ Você fez o Redeploy depois de adicionar?
- ❌ Alguma variável tem espaço no início ou fim?

## 📞 Suporte

Se continuar com problemas, verifique os logs:
1. Vá para **Deployments**
2. Clique no último deployment
3. Clique em **View Function Logs**
4. Procure por erros em vermelho
