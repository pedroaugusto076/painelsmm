# 🔧 Configuração do Mercado Pago

## 1️⃣ Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/
2. Crie uma conta ou faça login
3. Acesse o painel de desenvolvedores: https://www.mercadopago.com.br/developers/panel

## 2️⃣ Obter Credenciais

### Para TESTES (Sandbox):
1. No painel, vá em **"Suas integrações"**
2. Crie uma nova aplicação ou selecione uma existente
3. Vá em **"Credenciais de teste"**
4. Copie o **Access Token de TEST**

### Para PRODUÇÃO:
1. No painel, vá em **"Suas integrações"**
2. Selecione sua aplicação
3. Vá em **"Credenciais de produção"**
4. Copie o **Access Token de PRODUCTION**

## 3️⃣ Configurar no Projeto

Abra o arquivo `painelsmm/server/.env` e adicione:

```env
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
```

**Para testes:**
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
```

**Para produção:**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
```

## 4️⃣ Configurar Webhook (Notificações)

1. No painel do Mercado Pago, vá em **"Webhooks"**
2. Adicione uma nova URL de notificação:
   - **URL**: `https://seu-dominio.com/api/payments/webhook`
   - **Eventos**: Selecione "Pagamentos"

**Para testes locais (usando ngrok):**
```bash
# Instalar ngrok: https://ngrok.com/
ngrok http 5000

# Copie a URL gerada (ex: https://abc123.ngrok.io)
# Configure no Mercado Pago: https://abc123.ngrok.io/api/payments/webhook
```

## 5️⃣ Executar SQL para Criar Tabela de Pedidos

Execute o arquivo `painelsmm/server/config/orders_table.sql` no pgAdmin:

```sql
-- Copie e cole o conteúdo do arquivo orders_table.sql no pgAdmin
```

## 6️⃣ Testar Pagamento

### Cartões de Teste (Sandbox):

**Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura
- Nome: Qualquer nome

**Recusado:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Validade: Qualquer data futura

**Pendente:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura

Mais cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

## 7️⃣ Fluxo de Pagamento

1. **Usuário seleciona pacote** → Frontend envia dados para `/api/payments/create`
2. **Backend cria preferência** → Mercado Pago retorna link de pagamento
3. **Usuário é redirecionado** → Checkout do Mercado Pago
4. **Usuário paga** → Mercado Pago processa pagamento
5. **Webhook notifica** → Backend atualiza status do pedido
6. **Usuário retorna** → Dashboard mostra pedido atualizado

## 8️⃣ Status dos Pedidos

- **pending**: Aguardando pagamento
- **processing**: Pagamento aprovado, processando serviço
- **completed**: Serviço entregue
- **cancelled**: Pagamento cancelado/recusado

## 9️⃣ URLs de Retorno

Após o pagamento, o usuário é redirecionado para:

- **Sucesso**: `http://localhost:3000/dashboard?payment=success`
- **Falha**: `http://localhost:3000/dashboard?payment=failure`
- **Pendente**: `http://localhost:3000/dashboard?payment=pending`

## 🔟 Produção

Antes de ir para produção:

1. ✅ Troque para credenciais de PRODUÇÃO
2. ✅ Configure webhook com URL real (HTTPS obrigatório)
3. ✅ Teste todos os fluxos de pagamento
4. ✅ Configure certificado SSL no servidor
5. ✅ Ative logs de auditoria

## 📚 Documentação Oficial

- Mercado Pago Developers: https://www.mercadopago.com.br/developers/pt
- SDK Node.js: https://github.com/mercadopago/sdk-nodejs
- Checkout Pro: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing

## 🆘 Suporte

- Fórum: https://www.mercadopago.com.br/developers/pt/support
- Status: https://status.mercadopago.com/
