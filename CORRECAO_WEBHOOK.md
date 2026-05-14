# 🔧 Correção: Webhook não atualiza pedidos

## 🎯 Problema Identificado

Analisando os logs da Vercel, identifiquei que:

1. ✅ O webhook está sendo chamado corretamente
2. ✅ O pagamento foi aprovado (`"status": "approved"`)
3. ✅ O external_reference está correto
4. ❌ **MAS** a query retorna 0 rows: `"✅ [DB] Query executada com sucesso. Rows: 0"`
5. ❌ O pedido não aparece na lista: `"📦 [DEBUG] Pedidos recebidos: 0"`

**Causa raiz:** O pedido não está sendo salvo no banco de dados PostgreSQL da Vercel!

## 🚨 Possíveis Causas

### 1. Tabelas não existem no PostgreSQL
As tabelas podem não ter sido criadas no banco PostgreSQL da Vercel.

### 2. Erro ao inserir o pedido
O pedido pode estar falhando ao ser inserido, mas o erro não está sendo capturado.

### 3. UUID vs String
O PostgreSQL usa UUID, mas o código pode estar gerando strings.

## ✅ Solução Implementada

### 1. Auto-criação de Tabelas
Adicionei código para criar automaticamente as tabelas no PostgreSQL quando o servidor iniciar.

### 2. Logs Detalhados
Adicionei logs extensivos para rastrear:
- Criação do pedido
- Busca do pedido no webhook
- Listagem de todos os pedidos (para debug)

### 3. Validação de Inserção
Agora o código verifica se o pedido foi realmente criado após o INSERT.

## 🚀 Próximos Passos

### Passo 1: Fazer Deploy
```bash
git push
```

### Passo 2: Aguardar Deploy
Aguarde o deploy terminar na Vercel (1-2 minutos).

### Passo 3: Testar Novamente
1. Acesse: https://painelsmm-two.vercel.app
2. Faça login
3. Crie um novo pedido
4. Pague o PIX
5. Aguarde 10 segundos
6. Atualize a página

### Passo 4: Verificar Logs
Acesse os logs da Vercel e procure por:

**Logs esperados ao criar pedido:**
```
📦 Criando pedido no banco: <uuid>
👤 User ID: <uuid>
✅ Insert executado
🔍 Verificando se pedido foi criado. Rows: 1
✅ Pedido criado e confirmado: {...}
```

**Logs esperados no webhook:**
```
📥 Webhook recebido
💳 Buscando informações do pagamento: <id>
📋 Informações do pagamento: {"status": "approved", ...}
🔍 [WEBHOOK] Buscando pedido com ID: <uuid>
📊 [WEBHOOK] Resultado da busca: {"rowsFound": 1, ...}
✅ [WEBHOOK] Pedido encontrado: {...}
🔄 Atualizando status do pedido
✅ Status atualizado: completed
```

**Se o pedido NÃO for encontrado:**
```
❌ [WEBHOOK] Pedido não encontrado no banco de dados!
🔍 [WEBHOOK] Tentando buscar TODOS os pedidos para debug...
📦 [WEBHOOK] Últimos 10 pedidos no banco: [...]
```

## 🐛 Debug

### Se ainda não funcionar:

#### 1. Verificar se as tabelas foram criadas
Acesse os logs e procure por:
```
🔧 [DB] Inicializando tabelas do PostgreSQL...
✅ [DB] Tabelas PostgreSQL inicializadas
```

#### 2. Verificar se o pedido foi criado
Procure por:
```
✅ Pedido criado e confirmado: {...}
```

Se aparecer:
```
❌ ERRO: Pedido não foi criado no banco!
```

Significa que há um problema com o INSERT.

#### 3. Verificar UUID
O PostgreSQL usa UUID. Verifique se o `user_id` e `order_id` são UUIDs válidos.

#### 4. Verificar Vercel Postgres
Certifique-se de que o Vercel Postgres está configurado:
1. Dashboard da Vercel
2. Storage → Postgres
3. Verifique se o banco está ativo

## 📊 Comandos Úteis

### Ver logs em tempo real
```bash
vercel logs --follow
```

### Testar endpoint de health
```
https://painelsmm-two.vercel.app/api/health
```

### Testar webhook
```
https://painelsmm-two.vercel.app/api/payments/webhook-test
```

## 🔍 Análise dos Logs Atuais

Dos logs que você enviou:

```json
{
  "message": "📋 Informações do pagamento: {
    \"id\": 159292584982,
    \"status\": \"approved\",
    \"external_reference\": \"375ab306-a949-416a-9ad0-7b6c0dc98938\",
    \"transaction_amount\": 0.01
  }"
}
```

✅ Pagamento aprovado
✅ External reference correto: `375ab306-a949-416a-9ad0-7b6c0dc98938`

```json
{
  "message": "✅ [DB] Query executada com sucesso. Rows: 0"
}
```

❌ Pedido não encontrado no banco!

**Conclusão:** O pedido `375ab306-a949-416a-9ad0-7b6c0dc98938` não existe no banco de dados PostgreSQL.

## 💡 Solução Temporária

Se o problema persistir, você pode verificar manualmente os pagamentos pendentes:

### Via Console do Navegador:
```javascript
fetch('https://painelsmm-two.vercel.app/api/payments/check-pending', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

Isso vai buscar todos os pagamentos pendentes no Mercado Pago e atualizar o banco.

## 📝 Checklist

Após o deploy, verifique:

- [ ] Deploy concluído sem erros
- [ ] Logs mostram "Tabelas PostgreSQL inicializadas"
- [ ] Criar novo pedido
- [ ] Logs mostram "Pedido criado e confirmado"
- [ ] Pagar PIX
- [ ] Logs do webhook mostram "Pedido encontrado"
- [ ] Logs mostram "Status atualizado: completed"
- [ ] Pedido aparece na lista do frontend

## 🆘 Se Nada Funcionar

Se após todas essas correções o problema persistir:

1. **Verifique o Vercel Postgres:**
   - Acesse Dashboard → Storage → Postgres
   - Verifique se está ativo e conectado

2. **Execute o SQL manualmente:**
   - Use o Vercel Postgres Query Editor
   - Execute o conteúdo de `server/init-postgres.sql`

3. **Verifique as variáveis de ambiente:**
   - `POSTGRES_URL` deve estar configurado
   - Ou o Vercel Postgres deve estar vinculado ao projeto

4. **Contate o suporte da Vercel** se o problema for com o banco de dados.
