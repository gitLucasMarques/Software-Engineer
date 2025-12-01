# Script de teste para verificar Carrinho e Pagamento (PowerShell)
# Execute com: .\backend\scripts\test-cart-payment.ps1 -Token "seu-token-jwt"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🧪 Testando Módulos de Carrinho e Pagamento" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# URL base da API
$BaseUrl = "http://localhost:5000/api"

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data,
        [string]$Description
    )
    
    Write-Host "📍 Testando: $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Endpoint"
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ([string]::IsNullOrEmpty($Data)) {
            $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers -Body $Data
        }
        
        Write-Host "✅ Sucesso" -ForegroundColor Green
        if ($response.status) {
            Write-Host "   Status: $($response.status)"
        }
        if ($response.data.message) {
            Write-Host "   Mensagem: $($response.data.message)"
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "   HTTP Status: $statusCode" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Testes do Carrinho
Write-Host "🛒 TESTES DO CARRINHO" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Method "GET" -Endpoint "/cart" -Data "" -Description "Buscar carrinho"

# Para adicionar item, você precisa de um productId válido
# Descomente e ajuste conforme necessário:
# $ProductId = "64a1b2c3d4e5f6789abc"
# $addItemData = @{productId=$ProductId; quantity=1} | ConvertTo-Json
# Test-Endpoint -Method "POST" -Endpoint "/cart/items" -Data $addItemData -Description "Adicionar item"

Write-Host ""
Write-Host "💳 TESTES DE PAGAMENTO" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
Write-Host ""

# Para criar pagamento, você precisa de um orderId válido
# Descomente e ajuste conforme necessário:
# $OrderId = "64a1b2c3d4e5f6789def"
# $paymentData = @{orderId=$OrderId} | ConvertTo-Json
# Test-Endpoint -Method "POST" -Endpoint "/payments/mercadopago/create" -Data $paymentData -Description "Criar pagamento MercadoPago"

Write-Host ""
Write-Host "📊 VERIFICAÇÃO DE SERVIÇOS" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Servidor backend está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor backend não está respondendo" -ForegroundColor Red
}

# Verificar variáveis de ambiente
Write-Host ""
Write-Host "🔧 Verificação de Configuração" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"
if (Test-Path $envPath) {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "MERCADOPAGO_ACCESS_TOKEN=(?!your-).+") {
        Write-Host "✅ MERCADOPAGO_ACCESS_TOKEN configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado ou usando valor padrão" -ForegroundColor Yellow
    }
    
    if ($envContent -match "FRONTEND_URL=http") {
        Write-Host "✅ FRONTEND_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ FRONTEND_URL não configurado" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Testes concluídos!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Para mais informações, consulte: CART_PAYMENT_FIXES.md" -ForegroundColor Cyan
