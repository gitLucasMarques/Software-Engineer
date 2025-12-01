#!/bin/bash

# Script de teste para verificar Carrinho e Pagamento
# Execute com: bash backend/scripts/test-cart-payment.sh

echo "🧪 Testando Módulos de Carrinho e Pagamento"
echo "============================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base da API
BASE_URL="http://localhost:5000/api"

# Token de autenticação (você precisa substituir por um token válido)
TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Token não fornecido${NC}"
    echo "Uso: bash test-cart-payment.sh <seu-token-jwt>"
    echo ""
    echo "Para obter um token:"
    echo "1. Faça login: POST /api/auth/login"
    echo "2. Use o token retornado"
    exit 1
fi

echo -e "${YELLOW}🔑 Token configurado${NC}"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}📍 Testando: $description${NC}"
    echo "   $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Sucesso ($http_code)${NC}"
        echo "   Resposta: $(echo $body | jq -r '.status // "N/A"') - $(echo $body | jq -r '.data.message // .message // "OK"')"
    else
        echo -e "${RED}❌ Erro ($http_code)${NC}"
        echo "   Resposta: $(echo $body | jq -r '.message // "Erro desconhecido"')"
    fi
    echo ""
}

# Testes do Carrinho
echo "🛒 TESTES DO CARRINHO"
echo "--------------------"
echo ""

test_endpoint "GET" "/cart" "" "Buscar carrinho"

# Para adicionar item, você precisa de um productId válido
# Descomente e ajuste conforme necessário:
# PRODUCT_ID="64a1b2c3d4e5f6789abc"
# test_endpoint "POST" "/cart/items" "{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}" "Adicionar item"

echo ""
echo "💳 TESTES DE PAGAMENTO"
echo "---------------------"
echo ""

# Para criar pagamento, você precisa de um orderId válido
# Descomente e ajuste conforme necessário:
# ORDER_ID="64a1b2c3d4e5f6789def"
# test_endpoint "POST" "/payments/mercadopago/create" "{\"orderId\":\"$ORDER_ID\"}" "Criar pagamento MercadoPago"

echo ""
echo "📊 VERIFICAÇÃO DE SERVIÇOS"
echo "-------------------------"
echo ""

# Verificar se o servidor está rodando
if curl -s "$BASE_URL/../health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor backend está rodando${NC}"
else
    echo -e "${RED}❌ Servidor backend não está respondendo${NC}"
fi

# Verificar variáveis de ambiente
echo ""
echo "🔧 Verificação de Configuração"
echo "------------------------------"
echo ""

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    if grep -q "MERCADOPAGO_ACCESS_TOKEN=" backend/.env && ! grep -q "MERCADOPAGO_ACCESS_TOKEN=your-" backend/.env; then
        echo -e "${GREEN}✅ MERCADOPAGO_ACCESS_TOKEN configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado ou usando valor padrão${NC}"
    fi
    
    if grep -q "FRONTEND_URL=http" backend/.env; then
        echo -e "${GREEN}✅ FRONTEND_URL configurado${NC}"
    else
        echo -e "${RED}❌ FRONTEND_URL não configurado${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
fi

echo ""
echo "✨ Testes concluídos!"
echo ""
echo "📖 Para mais informações, consulte: CART_PAYMENT_FIXES.md"
