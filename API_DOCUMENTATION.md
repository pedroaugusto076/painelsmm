# 📡 API Pública - Documentação

## 🎯 Visão Geral

API REST para integração com painéis SMM. Compatível com o formato da API SMMMIDIA.

**Base URL**: `https://painelsmm-two.vercel.app/api/v1`

## 🔑 Autenticação

Todas as requisições requerem uma **API Key** válida.

```json
{
  "key": "sua-api-key-aqui"
}
```

### Obter API Key

1. Faça login no painel: https://painelsmm-two.vercel.app
2. Vá em **Configurações** → **API**
3. Gere uma nova API Key

## 📋 Endpoints

### Endpoint Único

Todas as ações são feitas através de um único endpoint:

**Base URL**: `https://painelsmm-two.vercel.app/api/v1`

**Endpoint**: `POST /api/v1`

### 1. Listar Serviços

Lista todos os serviços disponíveis com preços e limites.

**Request:**
```json
{
  "key": "sua-api-key",
  "action": "services"
}
```

**Response:**
```json
[
  {
    "service": "1",
    "name": "Instagram Seguidores Brasil",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.15",
    "min": "100",
    "max": "10000",
    "description": "Seguidores brasileiros reais e ativos"
  },
  {
    "service": "2",
    "name": "Instagram Curtidas Brasil",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.12",
    "min": "100",
    "max": "10000",
    "description": "Curtidas de perfis brasileiros"
  }
]
```

### 2. Criar Pedido

Cria um novo pedido de serviço.

**Request:**
```json
{
  "key": "sua-api-key",
  "action": "add",
  "service": "1",
  "link": "https://instagram.com/usuario",
  "quantity": 1000
}
```

**Parâmetros:**
- `key` (string, obrigatório): Sua API key
- `action` (string, obrigatório): Deve ser "add"
- `service` (string, obrigatório): ID do serviço (veja endpoint /services)
- `link` (string, obrigatório): Link do perfil ou post do Instagram
- `quantity` (number, obrigatório): Quantidade desejada
- `comments` (array, opcional): Lista de comentários (apenas para serviço de comentários)

**Response (Sucesso):**
```json
{
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}
```

**Response (Erro):**
```json
{
  "error": "Invalid service ID"
}
```

### 3. Verificar Status do Pedido

Verifica o status de um pedido existente.

**Request:**
```json
{
  "key": "sua-api-key",
  "action": "status",
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}
```

**Response:**
```json
{
  "charge": "150.00",
  "start_count": "0",
  "status": "In progress",
  "remains": "500",
  "currency": "BRL"
}
```

**Status possíveis:**
- `Pending` - Aguardando processamento
- `In progress` - Em andamento
- `Completed` - Concluído
- `Canceled` - Cancelado

### 4. Verificar Saldo

Verifica o saldo disponível na conta.

**Request:**
```json
{
  "key": "sua-api-key",
  "action": "balance"
}
```

**Response:**
```json
{
  "balance": "999999.99",
  "currency": "BRL"
}
```

## 🔧 Exemplos de Uso

### cURL

```bash
# Listar serviços
curl -X POST https://painelsmm-two.vercel.app/api/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "key": "sua-api-key",
    "action": "services"
  }'

# Criar pedido
curl -X POST https://painelsmm-two.vercel.app/api/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "key": "sua-api-key",
    "action": "add",
    "service": "1",
    "link": "https://instagram.com/usuario",
    "quantity": 1000
  }'

# Verificar status
curl -X POST https://painelsmm-two.vercel.app/api/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "key": "sua-api-key",
    "action": "status",
    "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
  }'
```

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

const API_URL = 'https://painelsmm-two.vercel.app/api/v1';
const API_KEY = 'sua-api-key';

// Listar serviços
async function listServices() {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      action: 'services'
    })
  });
  
  return await response.json();
}

// Criar pedido
async function createOrder(serviceId, link, quantity) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      action: 'add',
      service: serviceId,
      link: link,
      quantity: quantity
    })
  });
  
  return await response.json();
}

// Verificar status
async function checkStatus(orderId) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      action: 'status',
      order: orderId
    })
  });
  
  return await response.json();
}

// Uso
(async () => {
  // Listar serviços
  const services = await listServices();
  console.log('Serviços:', services);
  
  // Criar pedido
  const order = await createOrder('1', 'https://instagram.com/usuario', 1000);
  console.log('Pedido criado:', order);
  
  // Verificar status
  const status = await checkStatus(order.order);
  console.log('Status:', status);
})();
```

### PHP

```php
<?php

$API_URL = 'https://painelsmm-two.vercel.app/api/v1';
$API_KEY = 'sua-api-key';

// Listar serviços
function listServices($apiUrl, $apiKey) {
    $data = [
        'key' => $apiKey,
        'action' => 'services'
    ];
    
    $ch = curl_init($apiUrl . '/services');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Criar pedido
function createOrder($apiUrl, $apiKey, $serviceId, $link, $quantity) {
    $data = [
        'key' => $apiKey,
        'action' => 'add',
        'service' => $serviceId,
        'link' => $link,
        'quantity' => $quantity
    ];
    
    $ch = curl_init($apiUrl . '/order');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Uso
$services = listServices($API_URL, $API_KEY);
print_r($services);

$order = createOrder($API_URL, $API_KEY, '1', 'https://instagram.com/usuario', 1000);
print_r($order);

?>
```

### Python

```python
import requests
import json

API_URL = 'https://painelsmm-two.vercel.app/api/v1'
API_KEY = 'sua-api-key'

# Listar serviços
def list_services():
    response = requests.post(
        f'{API_URL}/services',
        json={
            'key': API_KEY,
            'action': 'services'
        }
    )
    return response.json()

# Criar pedido
def create_order(service_id, link, quantity):
    response = requests.post(
        f'{API_URL}/order',
        json={
            'key': API_KEY,
            'action': 'add',
            'service': service_id,
            'link': link,
            'quantity': quantity
        }
    )
    return response.json()

# Verificar status
def check_status(order_id):
    response = requests.post(
        f'{API_URL}/status',
        json={
            'key': API_KEY,
            'action': 'status',
            'order': order_id
        }
    )
    return response.json()

# Uso
services = list_services()
print('Serviços:', services)

order = create_order('1', 'https://instagram.com/usuario', 1000)
print('Pedido:', order)

status = check_status(order['order'])
print('Status:', status)
```

## ⚠️ Códigos de Erro

| Código | Mensagem | Descrição |
|--------|----------|-----------|
| 401 | API key is required | API key não fornecida |
| 401 | Invalid API key | API key inválida |
| 400 | Invalid action | Ação não reconhecida |
| 400 | Service ID is required | ID do serviço não fornecido |
| 400 | Invalid service ID | ID do serviço inválido |
| 400 | Link is required | Link não fornecido |
| 400 | Invalid Instagram link format | Formato do link inválido |
| 404 | Order not found | Pedido não encontrado |
| 405 | Method not allowed | Método HTTP incorreto (use POST) |
| 500 | Internal server error | Erro interno do servidor |

## 🔒 Segurança

- ✅ Todas as requisições devem usar HTTPS
- ✅ API key deve ser mantida em segredo
- ✅ Não compartilhe sua API key publicamente
- ✅ Rate limiting: 100 requisições por minuto

## 📊 Limites

- **Requisições**: 100 por minuto
- **Pedidos simultâneos**: 10
- **Quantidade mínima**: Varia por serviço (veja /services)
- **Quantidade máxima**: Varia por serviço (veja /services)

## 🆘 Suporte

- **Email**: suporte@painelsmm.com
- **Documentação**: https://painelsmm-two.vercel.app/docs
- **Status da API**: https://status.painelsmm.com

## 📝 Changelog

### v1.0.0 (2026-05-15)
- ✅ Lançamento inicial
- ✅ Endpoints: services, order, status, balance
- ✅ Suporte para Instagram
- ✅ Formato compatível com SMMMIDIA
