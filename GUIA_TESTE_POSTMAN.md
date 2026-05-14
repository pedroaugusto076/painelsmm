# 🧪 Guia de Teste - Postman

## 📥 Importar Collection

1. Abra o Postman
2. Clique em **"Import"**
3. Selecione o arquivo `Postman_Collection.json`
4. A collection **"PainelSMM API"** será importada

## 🔐 Fluxo de Teste Completo

### Passo 1: Registrar Usuário (opcional)

Se você ainda não tem uma conta:

```
POST {{baseUrl}}/api/auth/register

Body:
{
  "name": "Teste Usuario",
  "email": "teste@exemplo.com",
  "password": "senha123"
}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso"
}
```

### Passo 2: Fazer Login

```
POST {{baseUrl}}/api/auth/login

Body:
{
  "email": "teste@exemplo.com",
  "password": "senha123"
}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "00a16301-3d25-4925-8cec-ea1782823f25",
      "name": "Teste Usuario",
      "email": "teste@exemplo.com"
    }
  }
}
```

**✨ O token é salvo automaticamente na variável `{{token}}`**

### Passo 3: Listar Pedidos

```
GET {{baseUrl}}/api/payments/orders
Authorization: Bearer {{token}}
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "3a295977-0d71-4d02-89f3-81456aebf102",
        "service_type": "followers",
        "package_id": "100",
        "quantity": 100,
        "price": 0.01,
        "instagram_username": "dadawda",
        "status": "pending",
        "payment_status": "pending",
        "payment_id": "158504358599",
        "created_at": "2026-05-14T...",
        "updated_at": "2026-05-14T..."
      }
    ]
  }
}
```

### Passo 4: Criar Novo Pagamento

```
POST {{baseUrl}}/api/payments/create
Authorization: Bearer {{token}}

Body:
{
  "serviceType": "followers",
  "packageId": "100",
  "quantity": 100,
  "price": 0.01,
  "instagramUsername": "teste_usuario"
}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "PIX gerado com sucesso",
  "data": {
    "orderId": "abc-123-def",
    "paymentId": "158506486473",
    "pixQrCode": "00020126580014br.gov.bcb.pix...",
    "pixQrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "expirationDate": "2026-05-14T23:59:59.000Z",
    "amount": 0.01,
    "status": "pending"
  }
}
```

### Passo 5: Verificar Status do Pagamento

```
GET {{baseUrl}}/api/payments/status/abc-123-def
Authorization: Bearer {{token}}
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "abc-123-def",
      "service_type": "followers",
      "quantity": 100,
      "price": 0.01,
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2026-05-14T...",
      "updated_at": "2026-05-14T..."
    }
  }
}
```

### Passo 6: Simular Webhook do Mercado Pago

```
POST {{baseUrl}}/api/payments/webhook

Body:
{
  "type": "payment",
  "action": "payment.updated",
  "data.id": "158504358599"
}
```

**Response esperada:**
```
OK
```

### Passo 7: Verificar Pagamentos Pendentes Manualmente

```
GET {{baseUrl}}/api/payments/check-pending
Authorization: Bearer {{token}}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "Verificados 2 pedidos",
  "data": {
    "checked": 2,
    "updates": [
      {
        "orderId": "abc-123-def",
        "status": "completed",
        "smmmidiaOrderId": "12345"
      }
    ]
  }
}
```

## 🔧 Rotas Públicas (sem autenticação)

### Health Check
```
GET {{baseUrl}}/api/health
```

### Webhook Test
```
GET {{baseUrl}}/api/payments/webhook-test
```

## ❌ Erros Comuns

### 1. "Token de autenticação não fornecido"
**Causa:** Você não enviou o token no header  
**Solução:** Adicione o header `Authorization: Bearer {{token}}`

### 2. "Token inválido ou expirado"
**Causa:** O token expirou (7 dias)  
**Solução:** Faça login novamente para obter um novo token

### 3. "Pedido não encontrado"
**Causa:** O orderId não existe ou pertence a outro usuário  
**Solução:** Verifique o ID correto em `/api/payments/orders`

### 4. "Não foi possível carregar seus pedidos"
**Causa:** Erro no banco de dados  
**Solução:** Verificar logs no Vercel

## 📊 Variáveis da Collection

A collection usa estas variáveis:

- `{{baseUrl}}` = `https://painelsmm-two.vercel.app`
- `{{token}}` = Token JWT (salvo automaticamente após login)

Para editar:
1. Clique na collection
2. Vá em **"Variables"**
3. Edite os valores

## 🎯 Ordem Recomendada de Testes

1. ✅ Health Check (verificar se API está online)
2. ✅ Webhook Test (verificar se endpoint existe)
3. ✅ Register (criar conta)
4. ✅ Login (obter token)
5. ✅ List Orders (verificar se lista pedidos)
6. ✅ Create Payment (criar novo pedido)
7. ✅ Get Payment Status (verificar status)
8. ✅ Webhook POST (simular pagamento)
9. ✅ Check Pending (forçar verificação)
10. ✅ List Orders novamente (ver pedido atualizado)

## 🔍 Debug

Se algo não funcionar:

1. **Verificar logs no Vercel:**
   https://vercel.com/pedroaugusto076s-projects/painelsmm/logs

2. **Verificar response do Postman:**
   - Status code
   - Body da resposta
   - Headers

3. **Verificar se o token está correto:**
   - Vá em Variables
   - Verifique se `{{token}}` tem valor

4. **Testar no navegador:**
   - Abra o frontend: https://painelsmm-two.vercel.app
   - Faça login
   - Abra DevTools (F12)
   - Vá em Network
   - Veja as requisições

## 📝 Exemplo de Teste Manual (sem Postman)

### Windows PowerShell:
```powershell
# Login
$response = Invoke-RestMethod -Uri "https://painelsmm-two.vercel.app/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"teste@exemplo.com","password":"senha123"}'

$token = $response.data.token

# Listar pedidos
Invoke-RestMethod -Uri "https://painelsmm-two.vercel.app/api/payments/orders" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

### Linux/Mac (curl):
```bash
# Login
TOKEN=$(curl -s -X POST https://painelsmm-two.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}' \
  | jq -r '.data.token')

# Listar pedidos
curl -X GET https://painelsmm-two.vercel.app/api/payments/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

**Última atualização:** 2026-05-14  
**Status:** ✅ Pronto para testar
