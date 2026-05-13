# 🚀 Painel SMM - Sistema Completo

Sistema profissional de painel SMM com pagamento via PIX usando Mercado Pago.

## ✨ Características

### 🎨 Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS com paleta violet moderna
- Autenticação completa (Login/Registro/Recuperação)
- Dashboard responsivo com sidebar
- Modal PIX com QR Code
- Gestão de pedidos em tempo real

### ⚙️ Backend
- Node.js + Express
- Banco de dados adaptável:
  - 💻 **Local**: SQLite (desenvolvimento)
  - 🌐 **Vercel**: Postgres (produção)
- Autenticação JWT
- Rate limiting (30 tentativas/30min)
- Integração Mercado Pago PIX
- Webhooks automáticos
- Segurança robusta (bcrypt, helmet, cors)

### 📦 Serviços SMM
- 📱 Seguidores Instagram
- ❤️ Curtidas
- 💬 Comentários
- 👁️ Visualizações

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### 2. Configurar Variáveis

Edite `server/.env`:

```env
# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# URLs
PORT=5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Email (Resend)
RESEND_API_KEY=re_sua_chave
EMAIL_FROM="Seu Nome <noreply@seudominio.com>"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-seu_token_teste
```

### 3. Iniciar Servidores

```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd ..
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura

```
painelsmm/
├── server/                          # Backend
│   ├── config/
│   │   ├── database.js             # Banco (SQLite/Postgres)
│   │   ├── email.js                # Resend
│   │   └── init-vercel-postgres.sql # SQL Vercel
│   ├── controllers/
│   │   ├── authController.js       # Autenticação
│   │   └── paymentController.js    # Pagamentos PIX
│   ├── middleware/
│   │   ├── auth.js                 # JWT
│   │   └── validation.js           # Validações
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── payments.js
│   └── server.js                   # Servidor principal
│
├── src/                             # Frontend
│   ├── components/
│   │   └── Dashboard.tsx           # Dashboard
│   ├── services/
│   │   └── api.ts                  # Cliente API
│   ├── App.tsx
│   └── main.tsx
│
├── vercel.json                      # Config Vercel
├── DEPLOY_VERCEL.md                # Guia deploy
└── CONFIGURAR_MERCADO_PAGO_PIX.md  # Guia PIX
```

## 🌐 Deploy na Vercel

### Passo a Passo:

1. **Criar banco Vercel Postgres**
   - Dashboard → Storage → Create Database → Postgres

2. **Inicializar tabelas**
   - Query Editor → Executar `server/config/init-vercel-postgres.sql`

3. **Configurar variáveis**
   - Project Settings → Environment Variables
   - Adicionar: JWT_SECRET, FRONTEND_URL, BACKEND_URL, etc.

4. **Deploy**
   ```bash
   vercel --prod
   ```

📖 **Guia completo**: `DEPLOY_VERCEL.md`

## 💳 Configurar Mercado Pago

1. Criar conta: https://www.mercadopago.com.br/
2. Obter Access Token: https://www.mercadopago.com.br/developers/panel
3. Adicionar no `.env`: `MERCADOPAGO_ACCESS_TOKEN=...`
4. Configurar webhook: `https://seu-dominio.com/api/payments/webhook`

📖 **Guia completo**: `CONFIGURAR_MERCADO_PAGO_PIX.md`

## 🔌 API

### Autenticação

**POST** `/api/auth/register`
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**GET** `/api/auth/profile`
- Headers: `Authorization: Bearer <token>`

### Pagamentos

**POST** `/api/payments/create`
```json
{
  "serviceType": "followers",
  "packageId": "1000",
  "quantity": 1000,
  "price": 69.90,
  "instagramUsername": "usuario"
}
```

**GET** `/api/payments/orders`
- Headers: `Authorization: Bearer <token>`

## 🔒 Segurança

- ✅ Senhas criptografadas (bcrypt 12 rounds)
- ✅ JWT com expiração
- ✅ Rate limiting por IP e usuário
- ✅ Validação de entrada
- ✅ Proteção contra SQL injection
- ✅ CORS configurado
- ✅ Helmet.js

## 💾 Banco de Dados

### Local (SQLite)
- Arquivo: `server/database.sqlite`
- Criado automaticamente
- Backup: `cp server/database.sqlite backup.sqlite`

### Vercel (Postgres)
- Gerenciado pela Vercel
- Backup automático
- Escalável

## 🧪 Testar

```bash
# Criar conta
1. Acesse http://localhost:3000
2. Clique em "Cadastrar"
3. Preencha os dados

# Fazer pedido
1. Faça login
2. Selecione serviço
3. Escolha pacote
4. Clique em "Finalizar Pedido"

# Pagar com PIX
1. Modal exibe QR Code
2. Escaneie ou copie código
3. Pague no app do banco
4. Confirmação automática
```

## 📊 Monitoramento

### Local
- Logs no terminal
- DB Browser for SQLite: https://sqlitebrowser.org/

### Vercel
- Dashboard → Logs
- Storage → Query Editor
- Metrics e Analytics

## 🆘 Problemas Comuns

**Erro: "Cannot find module"**
```bash
npm install
```

**Banco não conecta na Vercel**
- Verifique variáveis de ambiente
- Execute SQL de inicialização
- Veja logs na Vercel Dashboard

**PIX não gera**
- Verifique MERCADOPAGO_ACCESS_TOKEN
- Use token de TEST para desenvolvimento

## 📚 Documentação

- [Deploy Vercel](DEPLOY_VERCEL.md)
- [Configurar PIX](CONFIGURAR_MERCADO_PAGO_PIX.md)
- [Vercel Docs](https://vercel.com/docs)
- [Mercado Pago Docs](https://www.mercadopago.com.br/developers/pt)

## 🎯 Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Node.js + Express
- SQLite / PostgreSQL
- JWT
- Bcrypt
- Mercado Pago SDK
- Resend

## 📝 Licença

MIT

---

**Desenvolvido com ❤️ para facilitar vendas de serviços SMM**
