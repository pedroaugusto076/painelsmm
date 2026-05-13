# 🔧 Troubleshooting - Guia Rápido

## 🚨 Erros Comuns e Soluções

### 1. Erro: "Cannot find module 'express'"

**Causa:** Dependências do servidor não foram instaladas

**Solução:**
```bash
cd painelsmm/server
npm install
git add package-lock.json
git commit -m "fix: adicionar package-lock.json do servidor"
git push
vercel --prod
```

### 2. Erro: "Build failed with exit code 1"

**Causa:** Erro de compilação no Vite

**Solução:**
```bash
# Testar build localmente
cd painelsmm
npm run build

# Ver erro específico
# Corrigir o erro
# Commit e push
git add .
git commit -m "fix: corrigir erro de build"
git push
vercel --prod
```

### 3. Erro: "Module not found: Can't resolve"

**Causa:** Import incorreto ou arquivo faltando

**Solução:**
```bash
# Verificar imports
grep -r "import.*from" painelsmm/src/

# Verificar se arquivos existem
ls painelsmm/src/components/
ls painelsmm/src/services/

# Corrigir imports
# Commit e push
```

### 4. Erro: "JavaScript heap out of memory"

**Causa:** Build muito grande

**Solução:**
```bash
# Aumentar memória do Node.js
# Adicionar no package.json:
"scripts": {
  "build": "NODE_OPTIONS=--max-old-space-size=4096 npm install --prefix server && vite build"
}

# Ou simplificar o build
"scripts": {
  "build": "vite build"
}
```

### 5. Erro: "Cannot use import statement outside a module"

**Causa:** Configuração de módulos ES6 incorreta

**Solução:**
✅ **JÁ CORRIGIDO** - Verificar se `api/package.json` tem:
```json
{
  "type": "module"
}
```

### 6. Erro: "Function timeout"

**Causa:** Função serverless demorou mais de 10 segundos

**Solução:**
```bash
# Ver logs
vercel logs --follow

# Otimizar queries do banco
# Adicionar índices
# Reduzir processamento
```

### 7. Erro: "Database connection failed"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verificar variáveis
vercel env ls

# Adicionar POSTGRES_URL
# Vercel Dashboard → Storage → Create Database
```

### 8. Erro: "CORS policy"

**Causa:** FRONTEND_URL não configurado

**Solução:**
```bash
# Adicionar variável de ambiente
FRONTEND_URL=https://seu-projeto.vercel.app

# Redeployar
vercel --prod
```

## 🔍 Comandos de Debug

### Ver Logs
```bash
# Últimos logs
vercel logs

# Logs em tempo real
vercel logs --follow

# Logs de uma função específica
vercel logs --function=api

# Logs das últimas 2 horas
vercel logs --since=2h
```

### Ver Variáveis
```bash
# Listar todas
vercel env ls

# Ver valor de uma variável
vercel env pull
cat .env.local
```

### Ver Configuração
```bash
# Ver vercel.json
cat painelsmm/vercel.json

# Ver package.json
cat painelsmm/package.json
cat painelsmm/server/package.json
```

### Testar Localmente
```bash
# Build
cd painelsmm
npm run build

# Preview
npm run preview

# Servidor
cd server
npm start
```

## 🧪 Testes Rápidos

### 1. Testar API
```bash
curl https://seu-projeto.vercel.app/api/health
```

**Esperado:**
```json
{
  "success": true,
  "message": "API está funcionando"
}
```

### 2. Testar Frontend
```bash
curl -I https://seu-projeto.vercel.app
```

**Esperado:**
```
HTTP/2 200
content-type: text/html
```

### 3. Testar Autenticação
```bash
curl -X POST https://seu-projeto.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@example.com","password":"12345678","confirmPassword":"12345678"}'
```

### 4. Testar Banco de Dados
```bash
# Fazer login no site
# Criar um pedido
# Verificar se aparece em "Meus Pedidos"
```

## 🔄 Forçar Redeploy

### Limpar Cache
```bash
# Redeploy sem cache
vercel --prod --force
```

### Remover Deployment Antigo
```bash
# Listar deployments
vercel ls

# Remover deployment específico
vercel rm <deployment-url>
```

## 📊 Verificar Status

### Status do Vercel
https://www.vercel-status.com/

### Status do Projeto
```bash
vercel inspect <deployment-url>
```

## 🆘 Último Recurso

### 1. Criar Novo Projeto
```bash
# Remover projeto atual
vercel rm seu-projeto

# Criar novo
vercel --prod
```

### 2. Usar Vercel Dashboard
1. Ir para: https://vercel.com/dashboard
2. Clicar no projeto
3. Settings → General → Delete Project
4. Criar novo projeto via GitHub

### 3. Contatar Suporte
- Email: support@vercel.com
- Discord: https://vercel.com/discord
- Twitter: @vercel

## 📚 Recursos Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Status](https://www.vercel-status.com/)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

## ✅ Checklist de Verificação

Antes de pedir ajuda, verificar:

- [ ] Logs do Vercel (`vercel logs`)
- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado
- [ ] Tabelas criadas no banco
- [ ] vercel.json está correto
- [ ] package.json tem scripts corretos
- [ ] Dependências instaladas (`npm install`)
- [ ] Git está atualizado (`git push`)

## 🎯 Solução Mais Comum

**90% dos problemas são:**
1. Variáveis de ambiente não configuradas
2. Banco de dados não criado
3. Dependências faltando

**Solução:**
1. Configurar todas as variáveis no Vercel Dashboard
2. Criar banco Postgres no Vercel
3. Executar SQL de criação de tabelas
4. Redeployar: `vercel --prod`

---

**Dica:** Sempre teste localmente antes de fazer deploy!
