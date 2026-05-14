# Script para testar rotas da API
# Uso: .\test-routes.ps1 [URL_BASE]

param(
    [string]$BaseUrl = "https://painelsmm-two.vercel.app"
)

Write-Host "🧪 Testando rotas da API" -ForegroundColor Cyan
Write-Host "📍 URL Base: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

function Test-Route {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Data = "",
        [string]$Description
    )
    
    Write-Host "Testando: " -NoNewline -ForegroundColor Yellow
    Write-Host $Description
    Write-Host "  $Method $BaseUrl$Path"
    
    try {
        $uri = "$BaseUrl$Path"
        
        if ($Data) {
            $response = Invoke-WebRequest -Uri $uri -Method $Method `
                -ContentType "application/json" `
                -Body $Data `
                -UseBasicParsing `
                -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $uri -Method $Method `
                -UseBasicParsing `
                -ErrorAction Stop
        }
        
        $statusCode = $response.StatusCode
        $body = $response.Content
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "  ✅ Status: $statusCode" -ForegroundColor Green
            $preview = $body.Substring(0, [Math]::Min(200, $body.Length))
            Write-Host "  📦 Response: $preview"
        } else {
            Write-Host "  ❌ Status: $statusCode" -ForegroundColor Red
            Write-Host "  📦 Response: $body"
        }
    } catch {
        Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  📦 Status Code: $statusCode" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# 1. Health Check
Test-Route -Method "GET" -Path "/api/health" -Description "Health Check"

# 2. Webhook Test
Test-Route -Method "GET" -Path "/api/payments/webhook-test" -Description "Webhook Test Endpoint"

# 3. Webhook POST (simular Mercado Pago)
$webhookData = @{
    type = "payment"
    action = "payment.updated"
    "data.id" = "123456789"
} | ConvertTo-Json

Test-Route -Method "POST" -Path "/api/payments/webhook" -Data $webhookData -Description "Webhook POST (simulação)"

# 4. Webhook POST com query params
Write-Host "Testando: " -NoNewline -ForegroundColor Yellow
Write-Host "Webhook com query params"
Write-Host "  POST $BaseUrl/api/payments/webhook?type=payment&data.id=123456789"

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/payments/webhook?type=payment&data.id=123456789" `
        -Method POST `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  📦 Response: $($response.Content)"
} catch {
    Write-Host "  ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Resumo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Resumo dos Testes" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se todos os testes passaram (✅), a API está funcionando!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "1. Fazer um pagamento de teste no frontend"
Write-Host "2. Verificar logs no Vercel: https://vercel.com/pedroaugusto076s-projects/painelsmm/logs"
Write-Host "3. Monitorar processamento do webhook"
Write-Host ""
