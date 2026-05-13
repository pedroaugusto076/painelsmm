# Configuração do Vercel

## 📝 Arquivo vercel.json

O arquivo `vercel.json` foi configurado para usar apenas `functions` (não `builds`) conforme recomendação do Vercel.

```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.js"
    }
  ]
}
```

### Por que essa configuração?

1. **`functions` ao invés de `builds`**
   - Vercel recomenda usar `functions` para novos projetos
   - Suporta mais recursos (memória, timeout, etc.)
   - Mais confiável e moderno

2. **`runtime: "nodejs20.x"`**
   - Usa Node.js 20 (versão LTS mais recente)
   - Suporta ES6 modules nativamente

3. **`maxDuration: 30`**
   - Timeout de 30 segundos para funções serverless
   - Suficiente para operações de pagamento e banco de dados

4. **`rewrites` ao invés de `routes`**
   - Mais moderno e recomendado
   - Funciona melhor com Next.js e outras frameworks

## 🏗️ Estrutura do Projeto

```
painelsmm/
├── api/
│   └── index.js              # Handler serverless (ponto de entrada)
├── server/
│   ├── server.js             # Express app
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── src/                      # Frontend React
├── dist/                     # Build do frontend (gerado)
├── package.json              # Dependências do frontend
├── vercel.json               # Configuração do Vercel
└── .vercelignore             # Arquivos ignorados no deploy
```

## 🔄 Fluxo de Deploy

1. **Build do Frontend**
   ```bash
   npm run build
   # Gera: dist/
   ```

2. **Deploy da API**
   - Vercel detecta `api/index.js`
   - Cria função serverless automaticamente
   - Instala dependências do `server/package.json`

3. **Deploy do Frontend**
   - Vercel serve arquivos estáticos de `dist/`
   - Configurado automaticamente pelo Vite

## 🌐 Rotas

### Frontend (Estático)
- `/` → `dist/index.html`
- `/assets/*` → `dist/assets/*`

### API (Serverless)
- `/api/*` → `api/index.js` (handler)
  - `/api/health` → Health check
  - `/api/auth/*` → Autenticação
  - `/api/payments/*` → Pagamentos

## 🔧 Variáveis de Ambiente

### No Vercel Dashboard
Configurar em: **Settings → Environment Variables**

```env
# Obrigatórias
JWT_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
POSTGRES_URL=...

# Opcionais (com valores padrão)
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Localmente
Arquivo: `server/.env`

```env
# Todas as variáveis para desenvolvimento local
```

## 📦 Dependências

### Frontend (`package.json`)
- React, Vite, TailwindCSS
- Lucide Icons
- Motion

### Backend (`server/package.json`)
- Express, CORS, Helmet
- JWT, Bcrypt
- Mercado Pago SDK
- Vercel Postgres
- Nodemailer/Resend

## 🚀 Comandos Úteis

### Deploy
```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod

# Ver logs
vercel logs

# Ver logs em tempo real
vercel logs --follow
```

### Desenvolvimento Local
```bash
# Frontend
npm run dev

# Backend
cd server && npm start

# Ambos (em terminais separados)
```

## 🐛 Troubleshooting

### Erro: "Conflicting functions and builds"
✅ **Resolvido** - Removido `builds` do `vercel.json`

### Erro: "Cannot find module"
- Verificar se `server/package.json` tem todas as dependências
- Verificar se `npm install` foi executado no build

### Erro: "Function timeout"
- Aumentar `maxDuration` no `vercel.json`
- Otimizar queries do banco de dados

### Erro: "Module not found: Can't resolve"
- Verificar imports no código
- Verificar se arquivos existem

## 📊 Limites do Vercel (Hobby Plan)

- **Funções Serverless**: 10 segundos de timeout (configuramos 30s, mas pode ser limitado)
- **Bandwidth**: 100 GB/mês
- **Invocações**: 100 GB-Hrs/mês
- **Builds**: 6000 minutos/mês

Para produção, considere upgrade para Pro Plan.

## 🔐 Segurança

### Headers de Segurança (Helmet)
Configurado no `server/server.js`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### Rate Limiting
Configurado no `server/server.js`:
- 100 requisições por 15 minutos (geral)
- 5 tentativas de login por 15 minutos

### CORS
Configurado para aceitar apenas `FRONTEND_URL`

## 📈 Monitoramento

### Vercel Analytics
- Ativar em: **Settings → Analytics**
- Ver métricas de performance
- Ver erros em tempo real

### Logs
```bash
# Ver últimos logs
vercel logs

# Filtrar por função
vercel logs --function=api/index.js

# Tempo real
vercel logs --follow
```

## 🔄 CI/CD

### Automático
- Push para `main` → Deploy automático
- Pull Request → Preview deploy

### Manual
```bash
vercel --prod
```

## 📚 Referências

- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
- [Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
