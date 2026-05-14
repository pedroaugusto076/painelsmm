# 🚀 PainelSMM - Painel de Gerenciamento de Redes Sociais

Sistema completo para venda de serviços de redes sociais (seguidores, curtidas, comentários, visualizações) com integração ao Mercado Pago e SMMMIDIA.

## 📋 Funcionalidades

- ✅ Autenticação completa (Login, Registro, Recuperação de senha)
- ✅ Pagamento via PIX (Mercado Pago)
- ✅ Integração com SMMMIDIA para processamento de pedidos
- ✅ Dashboard de pedidos
- ✅ Sistema de notificações por email
- ✅ Rate limiting e segurança

## 🛠️ Tecnologias

### Frontend
- React + TypeScript
- Vite
- TailwindCSS

### Backend
- Node.js + Express
- SQLite (desenvolvimento) / PostgreSQL (produção)
- Mercado Pago SDK
- JWT Authentication
- Resend (emails)

## 🚀 Deploy em Produção (Vercel)

### 1. Configurar Variáveis de Ambiente

Acesse o dashboard da Vercel e configure as variáveis de ambiente conforme o arquivo `VERCEL_ENV_VARS.md`.

**Variáveis principais:**
- `BACKEND_URL` - URL do backend em produção
- `FRONTEND_URL` - URL do frontend em produção
- `MERCADOPAGO_ACCESS_TOKEN` - Token do Mercado Pago
- `JWT_SECRET` - Secret para JWT
- E outras... (veja `VERCEL_ENV_VARS.md`)

### 2. Deploy

```bash
# Fazer commit das alterações
git add .
git commit -m "feat: configurar para produção"
git push

# A Vercel fará o deploy automaticamente
```

### 3. Configurar Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Adicione: `https://painelsmm-two.vercel.app/api/payments/webhook`
5. Selecione evento: **Pagamentos**

### 4. Testar

- Health Check: `https://painelsmm-two.vercel.app/api/health`
- Webhook Test: `https://painelsmm-two.vercel.app/api/payments/webhook-test`

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd painelsmm

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server
npm install
cd ..
```

### Configurar Variáveis de Ambiente

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (server/.env)
```env
# JWT
JWT_SECRET=seu-secret-aqui
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-token-aqui

# Email
RESEND_API_KEY=seu-key-aqui
EMAIL_FROM=seu-email@example.com

# SMMMIDIA
SMMMIDIA_API_URL=https://smmmidia.com/api/v2
SMMMIDIA_API_KEY=seu-key-aqui
SMMMIDIA_SERVICE_ID=1353
```

### Executar

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm run dev
```

Acesse: http://localhost:5173

## 📁 Estrutura do Projeto

```
painelsmm/
├── api/                    # Vercel serverless functions
│   └── index.js           # Entry point para Vercel
├── server/                # Backend Express
│   ├── config/           # Configurações (DB, email)
│   ├── controllers/      # Lógica de negócio
│   ├── middleware/       # Auth, validação
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços externos (SMMMIDIA)
│   └── server.js        # App Express
├── src/                  # Frontend React
│   ├── components/      # Componentes React
│   ├── services/        # API client
│   ├── App.tsx         # App principal
│   └── main.tsx        # Entry point
├── public/              # Assets estáticos
├── .env                # Variáveis frontend (não commitar)
├── .env.example        # Exemplo de variáveis
└── vercel.json         # Configuração Vercel
```

## 🔧 Scripts Úteis

### Backend

```bash
# Verificar pagamentos pendentes
cd server
npm run check-payments
```

### Frontend

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🐛 Troubleshooting

### Pagamento não é confirmado após pagar PIX

**Causa:** Webhook não está configurado corretamente.

**Solução:**
1. Verifique se `BACKEND_URL` está configurado na Vercel
2. Configure o webhook no painel do Mercado Pago
3. Veja instruções completas em `SOLUCAO_WEBHOOK.md`

### Erro de CORS

**Causa:** Frontend e backend em domínios diferentes.

**Solução:**
1. Verifique se `FRONTEND_URL` está configurado corretamente
2. Em produção, ambos devem usar o mesmo domínio da Vercel

### Erro ao conectar com banco de dados

**Causa:** Variáveis de ambiente do PostgreSQL não configuradas.

**Solução:**
1. Configure as variáveis do Vercel Postgres
2. Ou use SQLite em desenvolvimento

## 📚 Documentação Adicional

- `SOLUCAO_WEBHOOK.md` - Guia completo para configurar webhook
- `VERCEL_ENV_VARS.md` - Lista de variáveis de ambiente
- `server/scripts/check-payments.js` - Script para verificar pagamentos

## 📄 Licença

ISC

## 👥 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.
