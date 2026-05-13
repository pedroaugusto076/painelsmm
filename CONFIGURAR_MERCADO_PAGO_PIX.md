# 🔧 Configuração do Mercado Pago - Pagamento via PIX

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
-- A tabela já inclui os campos pix_qr_code e pix_qr_code_base64
```

## 6️⃣ Testar Pagamento PIX

### Ambiente de Testes (Sandbox):

No ambiente de testes, o PIX será gerado mas **não será possível pagar de verdade**. Para simular o pagamento:

1. Gere o PIX no sistema
2. Copie o `payment_id` retornado
3. Use a API de testes do Mercado Pago para aprovar manualmente:

```bash
curl -X PUT \
  'https://api.mercadopago.com/v1/payments/{payment_id}' \
  -H 'Authorization: Bearer SEU_ACCESS_TOKEN_TEST' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "approved"
  }'
```

Ou use o Postman/Insomnia para fazer essa requisição.

### Ambiente de Produção:

No ambiente de produção, o PIX funcionará normalmente:
1. Cliente escaneia o QR Code ou copia o código
2. Paga pelo app do banco
3. Mercado Pago detecta o pagamento
4. Webhook notifica seu sistema automaticamente
5. Status do pedido é atualizado para "processing"

## 7️⃣ Fluxo de Pagamento PIX

1. **Usuário seleciona pacote** → Frontend envia dados para `/api/payments/create`
2. **Backend gera PIX** → Mercado Pago retorna QR Code e código copia-e-cola
3. **Modal exibe PIX** → Usuário vê QR Code e pode copiar código
4. **Usuário paga** → Pelo app do banco
5. **Webhook notifica** → Backend recebe confirmação do pagamento
6. **Status atualizado** → Pedido muda para "processing"
7. **Serviço entregue** → Sistema processa e entrega o serviço

## 8️⃣ Status dos Pedidos

- **pending**: Aguardando pagamento PIX
- **processing**: PIX aprovado, processando serviço
- **completed**: Serviço entregue
- **cancelled**: Pagamento cancelado/expirado

## 9️⃣ Campos do PIX na Resposta

Quando o PIX é gerado, a API retorna:

```json
{
  "success": true,
  "data": {
    "orderId": "uuid-do-pedido",
    "paymentId": "123456789",
    "pixQrCode": "00020126580014br.gov.bcb.pix...",
    "pixQrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "expirationDate": "2024-01-20T10:30:00.000Z",
    "amount": 69.90,
    "status": "pending"
  }
}
```

- **pixQrCode**: Código para copiar e colar no app do banco
- **pixQrCodeBase64**: Imagem do QR Code em base64
- **expirationDate**: Data de expiração do PIX (geralmente 30 minutos)

## 🔟 Produção

Antes de ir para produção:

1. ✅ Troque para credenciais de PRODUÇÃO
2. ✅ Configure webhook com URL real (HTTPS obrigatório)
3. ✅ Teste pagamentos PIX reais com valores baixos
4. ✅ Configure certificado SSL no servidor
5. ✅ Ative logs de auditoria
6. ✅ Configure tempo de expiração do PIX (padrão: 30 min)

## 📱 Vantagens do PIX

- ✅ Pagamento instantâneo (confirmação em segundos)
- ✅ Disponível 24/7
- ✅ Sem taxas para o cliente
- ✅ Não precisa de cartão de crédito
- ✅ Mais seguro que boleto
- ✅ Confirmação automática via webhook

## 📚 Documentação Oficial

- Mercado Pago PIX: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix
- API de Pagamentos: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

## 🆘 Suporte

- Fórum: https://www.mercadopago.com.br/developers/pt/support
- Status: https://status.mercadopago.com/

## 🧪 Testando Localmente

1. Inicie o servidor backend:
```bash
cd painelsmm/server
npm run dev
```

2. Inicie o frontend:
```bash
cd painelsmm
npm run dev
```

3. Acesse: http://localhost:3000
4. Faça login e crie um pedido
5. O modal PIX será exibido com QR Code
6. Para simular pagamento em teste, use a API do Mercado Pago para aprovar manualmente

## ⚠️ Importante

- PIX expira em 30 minutos (configurável)
- Após expiração, gere um novo PIX
- Webhook deve responder com status 200 rapidamente
- Não processe lógica pesada no webhook (use filas)
