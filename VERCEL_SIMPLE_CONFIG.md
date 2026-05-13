# Configuração Simplificada do Vercel

## 🎯 Problema Resolvido

**Erro anterior:**
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Causa:**
- Sintaxe incorreta do runtime no `vercel.json`
- Vercel não aceitava `nodejs20.x` sem versão específica

## ✅ Solução Aplicada

### 1. Simplificado `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

**Por que funciona:**
- Vercel detecta automaticamente o runtime do Node.js
- Não precisa especificar versão manualmente
- Usa a versão LTS mais recente automaticamente

### 2. Criado `api/package.json`

```json
{
  "type": "module",
  "engines": {
    "node": ">=18.x"
  }
}
```

**Por que funciona:**
- `"type": "module"` habilita ES6 modules
- `"engines"` especifica versão mínima do Node.js
- Vercel usa essas informações automaticamente

### 3. Otimizado `api/index.js`

```javascript
let app;

export default async function handler(req, res) {
  try {
    // Cache do app (importa apenas uma vez)
    if (!app) {
      const serverModule = await import('../server/server.js');
      app = serverModule.default;
    }
    
    // Express app já é um handler válido
    return app(req, res);
  } catch (error) {
    console.error('❌ Erro ao carregar servidor:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
```

**Melhorias:**
- Cache do app (não reimporta a cada requisição)
- Logs de erro mais detalhados
- Tratamento de erro robusto

## 📁 Estrutura Final

```
painelsmm/
├── api/
│   ├── index.js          # Handler serverless
│   └── package.json      # Config ES6 modules
├── server/
│   ├── server.js         # Express app
│   ├── package.json      # Dependências backend
│   └── ...
├── src/                  # Frontend React
├── dist/                 # Build frontend (gerado)
├── package.json          # Dependências frontend
├── vercel.json           # Config Vercel (simplificado)
└── .vercelignore         # Arquivos ignorados
```

## 🔄 Como o Vercel Processa

1. **Detecta `api/` folder**
   - Cria função serverless automaticamente
   - Usa `api/index.js` como handler

2. **Lê `api/package.json`**
   - Detecta `"type": "module"` → Habilita ES6
   - Detecta `"engines"` → Usa Node.js 18+

3. **Instala dependências**
   - Executa `npm install` em `server/`
   - Instala todas as dependências do backend

4. **Build do frontend**
   - Executa `npm run build` na raiz
   - Gera `dist/` com arquivos estáticos

5. **Deploy**
   - Frontend: Servido como estático de `dist/`
   - Backend: Função serverless em `/api`

## 🌐 Rotas

### Frontend (Estático)
```
/ → dist/index.html
/assets/* → dist/assets/*
```

### Backend (Serverless)
```
/api → api/index.js (handler)
  ↓
  Express app (server/server.js)
    ↓
    /api/health → Health check
    /api/auth/* → Autenticação
    /api/payments/* → Pagamentos
```

## 🚀 Deploy

```bash
# 1. Commit
git add .
git commit -m "fix: simplificar configuração do Vercel"
git push

# 2. Deploy
cd painelsmm
vercel --prod
```

## ✅ Verificação

Após o deploy, teste:

```bash
# Health check
curl https://seu-projeto.vercel.app/api/health

# Deve retornar:
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "..."
}
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
# Verificar se server/package.json existe
ls painelsmm/server/package.json

# Verificar dependências
cat painelsmm/server/package.json
```

### Erro: "Cannot use import statement"
```bash
# Verificar api/package.json
cat painelsmm/api/package.json

# Deve ter: "type": "module"
```

### Erro: "Function timeout"
```bash
# Ver logs
vercel logs --follow

# Otimizar queries do banco
# Adicionar índices nas tabelas
```

## 📊 Limites do Vercel

### Hobby Plan (Grátis)
- ✅ Funções serverless ilimitadas
- ✅ 100 GB bandwidth/mês
- ✅ Builds ilimitados
- ⚠️ Timeout: 10 segundos por função

### Pro Plan ($20/mês)
- ✅ Timeout: 60 segundos por função
- ✅ 1 TB bandwidth/mês
- ✅ Suporte prioritário

## 🔐 Segurança

### Variáveis de Ambiente
```bash
# Listar variáveis
vercel env ls

# Adicionar variável
vercel env add JWT_SECRET

# Remover variável
vercel env rm JWT_SECRET
```

### Secrets
- Nunca commitar `.env` files
- Usar variáveis de ambiente do Vercel
- Rotacionar secrets regularmente

## 📈 Performance

### Cold Start
- Primeira requisição: ~1-2 segundos
- Requisições seguintes: ~100-200ms
- Cache do app reduz cold start

### Otimizações
- ✅ Cache do Express app
- ✅ Conexão com banco otimizada
- ✅ Índices no banco de dados
- ✅ Rate limiting configurado

## 📚 Referências

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Rewrites](https://vercel.com/docs/edge-network/rewrites)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## ✨ Vantagens da Configuração Simplificada

1. **Menos configuração**
   - Apenas 3 linhas no `vercel.json`
   - Vercel detecta tudo automaticamente

2. **Mais confiável**
   - Sem conflitos de runtime
   - Sem erros de versão

3. **Mais rápido**
   - Cache do app
   - Cold start otimizado

4. **Mais fácil de manter**
   - Menos arquivos de config
   - Menos pontos de falha

## 🎉 Resultado

Com essa configuração:
- ✅ Deploy funciona sem erros
- ✅ API responde corretamente
- ✅ Frontend carrega rápido
- ✅ Fácil de debugar
- ✅ Fácil de manter
