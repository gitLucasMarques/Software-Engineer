#!/bin/bash

set -e

echo "========================================="
echo "TESTE COMPLETO DO FLUXO DE E-COMMERCE"
echo "========================================="
echo ""

# 1. Login
echo "1️⃣  Fazendo login..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"teste123"}' | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Erro no login"
  exit 1
fi
echo "✅ Login OK - Token: ${TOKEN:0:30}..."
echo ""

# 2. Buscar produtos
echo "2️⃣  Buscando produtos..."
PRODUCT_ID=$(curl -s 'http://localhost:5000/api/products?limit=1' | jq -r '.data.products[0]._id')
PRODUCT_NAME=$(curl -s 'http://localhost:5000/api/products?limit=1' | jq -r '.data.products[0].name')
PRODUCT_PRICE=$(curl -s 'http://localhost:5000/api/products?limit=1' | jq -r '.data.products[0].price')
echo "✅ Produto encontrado: $PRODUCT_NAME (ID: $PRODUCT_ID) - R$ $PRODUCT_PRICE"
echo ""

# 3. Adicionar ao carrinho
echo "3️⃣  Adicionando ao carrinho..."
ADD_RESULT=$(curl -s -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}")
echo "$ADD_RESULT" | jq '.status, .message'
echo ""

# 4. Ver carrinho
echo "4️⃣  Verificando carrinho..."
CART=$(curl -s http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN")
CART_ITEMS=$(echo "$CART" | jq '.data.cart.items | length')
CART_TOTAL=$(echo "$CART" | jq '.data.cart.totalAmount')
echo "✅ Carrinho: $CART_ITEMS itens - Total: R$ $CART_TOTAL"
echo ""

# 5. Criar pedido
echo "5️⃣  Criando pedido..."
ORDER_RESULT=$(curl -s -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "shippingAddress": {
      "fullName": "Usuario Teste",
      "email": "teste@teste.com",
      "phone": "(11) 98765-4321",
      "address": "Rua Teste 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    }
  }')
ORDER_STATUS=$(echo "$ORDER_RESULT" | jq -r '.status')
ORDER_ID=$(echo "$ORDER_RESULT" | jq -r '.data.order._id')

if [ "$ORDER_STATUS" != "success" ]; then
  echo "❌ Erro ao criar pedido:"
  echo "$ORDER_RESULT" | jq '.message'
  exit 1
fi
echo "✅ Pedido criado: $ORDER_ID"
echo ""

# 6. Criar pagamento PIX
echo "6️⃣  Gerando pagamento PIX..."
PIX_RESULT=$(curl -s -X POST http://localhost:5000/api/payments/pix/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"orderId\":\"$ORDER_ID\"}")
PIX_STATUS=$(echo "$PIX_RESULT" | jq -r '.status')

if [ "$PIX_STATUS" != "success" ]; then
  echo "❌ Erro ao gerar PIX:"
  echo "$PIX_RESULT" | jq '.message'
  exit 1
fi
echo "✅ PIX gerado com sucesso"
PIX_CODE=$(echo "$PIX_RESULT" | jq -r '.data.pixData.pixCode')
echo "   Código PIX: ${PIX_CODE:0:50}..."
echo ""

# 7. Simular aprovação do pagamento
echo "7️⃣  Simulando aprovação do pagamento..."
APPROVAL_RESULT=$(curl -s -X POST "http://localhost:5000/api/payments/simulate-approval/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")
APPROVAL_STATUS=$(echo "$APPROVAL_RESULT" | jq -r '.status')

if [ "$APPROVAL_STATUS" != "success" ]; then
  echo "❌ Erro ao simular aprovação:"
  echo "$APPROVAL_RESULT" | jq '.message'
  exit 1
fi
echo "✅ Pagamento aprovado com sucesso!"
echo ""

# 8. Verificar carrinho foi limpo
echo "8️⃣  Verificando se carrinho foi limpo..."
CART_AFTER=$(curl -s http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN")
CART_ITEMS_AFTER=$(echo "$CART_AFTER" | jq '.data.cart.items | length')

if [ "$CART_ITEMS_AFTER" == "0" ]; then
  echo "✅ Carrinho limpo corretamente!"
else
  echo "❌ ERRO: Carrinho não foi limpo! Ainda tem $CART_ITEMS_AFTER itens"
  exit 1
fi
echo ""

# 9. Verificar pedido
echo "9️⃣  Verificando status do pedido..."
ORDER_CHECK=$(curl -s "http://localhost:5000/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")
ORDER_PAYMENT_STATUS=$(echo "$ORDER_CHECK" | jq -r '.data.order.paymentStatus')
ORDER_ORDER_STATUS=$(echo "$ORDER_CHECK" | jq -r '.data.order.status')

echo "   Payment Status: $ORDER_PAYMENT_STATUS"
echo "   Order Status: $ORDER_ORDER_STATUS"

if [ "$ORDER_PAYMENT_STATUS" == "paid" ] && [ "$ORDER_ORDER_STATUS" == "processing" ]; then
  echo "✅ Pedido atualizado corretamente!"
else
  echo "❌ ERRO: Status do pedido incorreto!"
  exit 1
fi
echo ""

echo "========================================="
echo "✅ TODOS OS TESTES PASSARAM COM SUCESSO!"
echo "========================================="
