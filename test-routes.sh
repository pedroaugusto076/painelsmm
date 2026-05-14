#!/bin/bash

# Script para testar rotas da API
# Uso: ./test-routes.sh [URL_BASE]

# URL base (padrão: produção)
BASE_URL="${1:-https://painelsmm-two.vercel.app}"

echo "🧪 Testando rotas da API"
echo "📍 URL Base: $BASE_URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar rota
test_route() {
  local method=$1
  local path=$2
  local data=$3
  local description=$4
  
  echo -e "${YELLOW}Testando:${NC} $description"
  echo "  $method $BASE_URL$path"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}✅ Status: $http_code${NC}"
    echo "  📦 Response: $body" | head -c 200
    echo ""
  else
    echo -e "  ${RED}❌ Status: $http_code${NC}"
    echo "  📦 Response: $body"
  fi
  
  echo ""
}

# 1. Health Check
test_route "GET" "/api/health" "" "Health Check"

# 2. Webhook Test
test_route "GET" "/api/payments/webhook-test" "" "Webhook Test Endpoint"

# 3. Webhook POST (simular Mercado Pago)
test_route "POST" "/api/payments/webhook" \
  '{"type":"payment","action":"payment.updated","data.id":"123456789"}' \
  "Webhook POST (simulação)"

# 4. Webhook POST com query params (formato alternativo do MP)
echo -e "${YELLOW}Testando:${NC} Webhook com query params"
echo "  POST $BASE_URL/api/payments/webhook?type=payment&data.id=123456789"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/payments/webhook?type=payment&data.id=123456789")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
  echo -e "  ${GREEN}✅ Status: $http_code${NC}"
  echo "  📦 Response: $body"
else
  echo -e "  ${RED}❌ Status: $http_code${NC}"
  echo "  📦 Response: $body"
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo dos Testes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se todos os testes passaram (✅), a API está funcionando!"
echo ""
echo "Próximos passos:"
echo "1. Fazer um pagamento de teste no frontend"
echo "2. Verificar logs no Vercel: https://vercel.com/pedroaugusto076s-projects/painelsmm/logs"
echo "3. Monitorar processamento do webhook"
echo ""
