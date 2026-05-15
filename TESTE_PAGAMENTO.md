# 🧪 Como Testar o Fluxo de Pagamento

## ✅ O que foi corrigido

1. **Endpoint de status criado** (`/api/payments/status`)
   - Permite que o frontend verifique o status do pedido
   - Polling automático a cada 5 segundos

2. **Webhook configurado** (`/api/payments/webhook`)
   - Recebe notificações do Mercado Pago quando o pagamento é aprovado
   - Atualiza automaticamente o status do pedido no banco

3. **Frontend atualizado**
   - Polling funcional
   - Modal de sucesso aparece quando pagamento é confirmado
   - Redirecionamento automático para "Meus Pedidos"

## 🚀 Passo a Passo para Testar

### 1. Aguardar Deploy (2-3 minutos)

Acesse: https://vercel.com/pedroaugusto076s-projects/painelsmm

Aguarde até ver: ✅ **Ready**

### 2. Configurar Webhook no Mercado Pago

**CRÍTICO**: Sem isso, o pagamento não será detectado automaticamente!

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks** ou **Notificações**
4. Clique em **Configurar notificações** ou **Adicionar URL**
5. Cole a URL: `https://painelsmm-two.vercel.app/api/payments/webhook`
6. Selecione o evento: **Pagamentos** (`payment`)
7. Salve

### 3. Fazer Pagamento de Teste

1. Acesse: https://painelsmm-two.vercel.app
2. Faça login com: `userpedro111@gmail.com` / `Admin@2024`
3. Selecione um serviço (ex: Seguidores)
4. Escolha o pacote de **R$ 0,01** (100 seguidores)
5. Preencha:
   - Instagram: `@teste`
   - URL do Post: (deixe vazio ou coloque qualquer URL)
6. Clique em **Comprar Agora**

### 4. Verificar Modal do PIX

Deve aparecer um modal com:
- ✅ Título: "PIX Gerado com Sucesso!"
- ✅ Valor: R$ 0,01
- ✅ QR Code (imagem)
- ✅ Código PIX (texto para copiar)
- ✅ Instruções de pagamento

**Abra o Console do Navegador (F12)** e verifique os logs:
```
🚀 [DEBUG] Iniciando criação de pagamento...
✅ [DEBUG] Resposta do servidor: {...}
💳 [DEBUG] PIX gerado com sucesso!
📝 [DEBUG] Order ID: uuid-aqui
💰 [DEBUG] Payment ID: 123456
🔄 [POLLING] Iniciando verificação automática do pagamento...
```

### 5. Pagar o PIX

**Opção A: Pagamento Real (Recomendado para teste completo)**
1. Abra o app do seu banco
2. Escolha PIX
3. Escaneie o QR Code OU copie e cole o código
4. Confirme o pagamento de R$ 0,01

**Opção B: Simular Pagamento (Apenas para teste do webhook)**
Se você tiver acesso ao painel de testes do Mercado Pago, pode simular a aprovação.

### 6. Aguardar Confirmação (5-30 segundos)

**O que deve acontecer:**

1. **Mercado Pago detecta o pagamento** (instantâneo)
2. **Webhook é chamado** (1-5 segundos)
3. **Status atualizado no banco** (instantâneo)
4. **Polling detecta mudança** (até 5 segundos)
5. **Modal do PIX fecha automaticamente**
6. **Modal de sucesso aparece** com:
   - ✅ Ícone verde animado
   - ✅ "🎉 Pagamento Confirmado!"
   - ✅ Mensagem de sucesso
   - ✅ Botão "Ver Meus Pedidos"

**Console do navegador deve mostrar:**
```
🔍 [POLLING] Status do pedido: completed
✅ [POLLING] Pagamento confirmado!
```

### 7. Verificar Pedido

1. Clique em **"Ver Meus Pedidos"** (ou vá na aba "Meus Pedidos")
2. Deve aparecer o pedido com:
   - Status: **Concluído** (verde)
   - Pagamento: **Pago**
   - Serviço: Seguidores
   - Quantidade: 100
   - Valor: R$ 0,01

## 🔍 Como Verificar se Está Funcionando

### Verificar Logs do Vercel

1. Acesse: https://vercel.com/pedroaugusto076s-projects/painelsmm/logs
2. Filtre por: últimos 30 minutos
3. Procure por:

**Criação do pagamento:**
```
POST /api/payments/create → 201
```

**Webhook recebido:**
```
POST /api/payments/webhook → 200
📥 [WEBHOOK] Recebido do Mercado Pago
💳 [WEBHOOK] Payment ID: xxx
💰 [WEBHOOK] Status do pagamento: approved
✅ [WEBHOOK] Pedido atualizado com sucesso!
```

**Polling verificando status:**
```
GET /api/payments/status?orderId=xxx → 200
```

### Verificar Banco de Dados (Supabase)

1. Acesse: https://supabase.com/dashboard/project/xicorwjdvlpwjczvtizm
2. Vá em **Table Editor** → **orders**
3. Procure pelo pedido mais recente
4. Verifique:
   - `status` = `'completed'`
   - `payment_status` = `'paid'`
   - `updated_at` = timestamp recente

## ❌ Problemas Comuns

### Modal não aparece após pagamento

**Causa 1: Webhook não configurado**
- Solução: Configure o webhook no Mercado Pago (passo 2)

**Causa 2: Webhook não está sendo chamado**
- Verifique logs do Vercel
- Teste manualmente: `curl -X POST https://painelsmm-two.vercel.app/api/payments/webhook`

**Causa 3: Polling não está funcionando**
- Abra console do navegador (F12)
- Procure por erros
- Verifique se aparecem logs `[POLLING]`

### Erro "Cannot read properties of undefined (reading 'toFixed')"

Isso significa que `pixData.amount` está undefined. Verifique:
- A resposta do `/api/payments/create` contém `amount`
- O valor está sendo passado corretamente

### Modal do PIX não mostra QR Code

Verifique se a resposta contém:
- `pixQrCodeBase64` (para a imagem)
- `pixQrCode` (para o código de texto)

## 📊 Checklist de Teste

- [ ] Deploy concluído no Vercel
- [ ] Webhook configurado no Mercado Pago
- [ ] Login funcionando
- [ ] Seleção de serviço funcionando
- [ ] Modal do PIX aparece com QR Code
- [ ] Console mostra logs de polling
- [ ] Pagamento realizado
- [ ] Modal de sucesso aparece (5-30 segundos)
- [ ] Pedido aparece em "Meus Pedidos" com status "Concluído"
- [ ] Logs do Vercel mostram webhook recebido

## 🎯 Resultado Esperado

**Fluxo completo (do início ao fim):**

1. Usuário cria pedido → Modal PIX aparece (2-3 segundos)
2. Usuário paga → Mercado Pago detecta (instantâneo)
3. Webhook atualiza banco → Status muda para "completed" (1-5 segundos)
4. Polling detecta mudança → Modal PIX fecha (até 5 segundos)
5. Modal de sucesso aparece → Usuário clica "Ver Meus Pedidos"
6. Pedido aparece como "Concluído" → ✅ Sucesso!

**Tempo total esperado:** 10-45 segundos do pagamento até a confirmação

## 📞 Suporte

Se algo não funcionar:

1. Verifique os logs do Vercel
2. Verifique o console do navegador (F12)
3. Verifique se o webhook está configurado no Mercado Pago
4. Verifique se as variáveis de ambiente estão corretas no Vercel
5. Verifique se RLS está desabilitado nas tabelas do Supabase
