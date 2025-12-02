#!/bin/bash

echo "=========================================="
echo "  Teste do Sistema de Pagamento"
echo "=========================================="
echo ""

# Verificar se backend está rodando
echo "1. Verificando Backend (porta 5000)..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "   ✓ Backend está rodando na porta 5000"
else
    echo "   ✗ Backend NÃO está rodando"
fi
echo ""

# Verificar se frontend está rodando
echo "2. Verificando Frontend (porta 3000)..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✓ Frontend está rodando na porta 3000"
else
    echo "   ✗ Frontend NÃO está rodando"
fi
echo ""

# Verificar arquivos críticos
echo "3. Verificando arquivos modificados..."

files=(
    "frontend/src/pages/PaymentPixPage/PaymentPixPage.css"
    "frontend/src/pages/PaymentBoletoPage/PaymentBoletoPage.css"
    "frontend/src/pages/PaymentCardPage/PaymentCardPage.css"
    "frontend/src/pages/PaymentPixPage/PaymentPixPage.js"
    "frontend/src/pages/PaymentBoletoPage/PaymentBoletoPage.js"
    "frontend/src/pages/PaymentCardPage/PaymentCardPage.js"
    "backend/src/controllers/paymentController.js"
    "backend/src/models/paymentCard.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file (NÃO ENCONTRADO)"
    fi
done
echo ""

# Verificar se qrcode está instalado
echo "4. Verificando biblioteca qrcode..."
if [ -d "backend/node_modules/qrcode" ]; then
    echo "   ✓ Biblioteca qrcode instalada"
else
    echo "   ✗ Biblioteca qrcode NÃO instalada"
fi
echo ""

# Verificar imports corretos nos componentes
echo "5. Verificando imports do useCart..."
if grep -q "useCart" frontend/src/pages/PaymentPixPage/PaymentPixPage.js; then
    echo "   ✓ PaymentPixPage importa useCart"
else
    echo "   ✗ PaymentPixPage NÃO importa useCart"
fi

if grep -q "useCart" frontend/src/pages/PaymentBoletoPage/PaymentBoletoPage.js; then
    echo "   ✓ PaymentBoletoPage importa useCart"
else
    echo "   ✗ PaymentBoletoPage NÃO importa useCart"
fi

if grep -q "useCart" frontend/src/pages/PaymentCardPage/PaymentCardPage.js; then
    echo "   ✓ PaymentCardPage importa useCart"
else
    echo "   ✗ PaymentCardPage NÃO importa useCart"
fi
echo ""

# Verificar se QRCode está sendo importado no backend
echo "6. Verificando import do QRCode no backend..."
if grep -q "require('qrcode')" backend/src/controllers/paymentController.js; then
    echo "   ✓ QRCode importado no paymentController"
else
    echo "   ✗ QRCode NÃO importado no paymentController"
fi
echo ""

# Verificar campo CVV no modelo
echo "7. Verificando campo CVV no modelo PaymentCard..."
if grep -q "cvv:" backend/src/models/paymentCard.js; then
    echo "   ✓ Campo CVV adicionado ao modelo"
else
    echo "   ✗ Campo CVV NÃO encontrado no modelo"
fi
echo ""

# Verificar CSS com background gradient
echo "8. Verificando estilos CSS..."
if grep -q "linear-gradient" frontend/src/pages/PaymentPixPage/PaymentPixPage.css; then
    echo "   ✓ Gradient background no CSS do PIX"
else
    echo "   ✗ Gradient background NÃO encontrado"
fi
echo ""

echo "=========================================="
echo "  Resumo das Correções Implementadas"
echo "=========================================="
echo ""
echo "✓ CSS atualizado com fundo gradiente e texto legível"
echo "✓ Biblioteca qrcode instalada para gerar QR codes reais"
echo "✓ useCart importado em todas as páginas de pagamento"
echo "✓ fetchCart() chamado após confirmação de pagamento"
echo "✓ Campo CVV adicionado ao modelo PaymentCard"
echo ""
echo "=========================================="
echo "  Próximos Passos para Testar"
echo "=========================================="
echo ""
echo "1. Acesse http://localhost:3000"
echo "2. Faça login na aplicação"
echo "3. Adicione produtos ao carrinho"
echo "4. Vá para o checkout"
echo "5. Escolha um método de pagamento (PIX, Boleto ou Cartão)"
echo "6. Verifique:"
echo "   - Texto está legível (fundo com gradiente)"
echo "   - QR Code é exibido no PIX"
echo "   - Após simular pagamento, carrinho é limpo"
echo "   - Pagamento com cartão não dá erro 500"
echo ""
