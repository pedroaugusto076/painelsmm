#!/bin/bash

echo "🧪 Testando Sistema Localmente"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar sintaxe dos arquivos
echo "📝 Verificando sintaxe dos arquivos..."
echo ""

files=(
  "server/server.js"
  "server/config/database.js"
  "server/controllers/authController.js"
  "server/controllers/paymentController.js"
  "server/routes/authRoutes.js"
  "server/routes/payments.js"
  "server/middleware/auth.js"
)

all_ok=true

for file in "${files[@]}"; do
  if node --check "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $file"
  else
    echo -e "${RED}❌${NC} $file"
    all_ok=false
  fi
done

echo ""

if [ "$all_ok" = true ]; then
  echo -e "${GREEN}✅ Todos os arquivos estão sem erros de sintaxe!${NC}"
else
  echo -e "${RED}❌ Alguns arquivos têm erros de sintaxe${NC}"
  exit 1
fi

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""
echo "Para testar:"
echo "1. Abra http://localhost:3000 no navegador"
echo "2. Faça login ou cadastro"
echo "3. Tente criar um pedido"
echo "4. Verifique se o PIX é gerado"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor${NC}"
echo ""

# Iniciar servidor
cd server && npm start
