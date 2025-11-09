# ============================================
# NAUTILUS ONE - VALIDACAO POS-DEPLOY
# ============================================

Write-Host ""
Write-Host "NAUTILUS ONE - VALIDACAO POS-DEPLOY" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$warnings = 0

# Configuracao
$SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co"
$VERCEL_URL = Read-Host "URL do Vercel (ex: https://nautilus-one.vercel.app)"

# ============================================
# CHECK 1: VERCEL
# ============================================
Write-Host "[1/6] Verificando Vercel..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $VERCEL_URL -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK: Homepage carregou (200)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ERRO: Status $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ERRO: Nao conseguiu acessar Vercel" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Gray
    $failed++
}

# ============================================
# CHECK 2: EDGE FUNCTIONS (PING)
# ============================================
Write-Host ""
Write-Host "[2/6] Verificando Edge Functions..." -ForegroundColor Cyan

$functionsToTest = @(
    "generate-drill-evaluation",
    "generate-report"
)

foreach ($func in $functionsToTest) {
    $url = "$SUPABASE_URL/functions/v1/$func"
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
        
        if ($response.StatusCode -in @(200, 400, 401)) {
            Write-Host "  OK: $func respondeu (status: $($response.StatusCode))" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  AVISO: $func status $($response.StatusCode)" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "  ERRO: $func nao respondeu" -ForegroundColor Red
        $failed++
    }
}

# ============================================
# CHECK 3: SUPABASE API
# ============================================
Write-Host ""
Write-Host "[3/6] Verificando Supabase API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/" -Method GET -TimeoutSec 5 -SkipHttpErrorCheck
    
    if ($response.StatusCode -in @(200, 400, 401)) {
        Write-Host "  OK: Supabase API respondeu" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ERRO: Supabase API status $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ERRO: Supabase API nao respondeu" -ForegroundColor Red
    $failed++
}

# ============================================
# CHECK 4: CONFIG TOML
# ============================================
Write-Host ""
Write-Host "[4/6] Verificando config.toml..." -ForegroundColor Cyan

if (Test-Path "supabase\config.toml") {
    $config = Get-Content "supabase\config.toml" -Raw
    
    $funcs = @("generate-drill-evaluation", "generate-drill-scenario", "generate-report")
    $found = 0
    
    foreach ($func in $funcs) {
        if ($config -match "\[functions\.$func\]") {
            $found++
        }
    }
    
    if ($found -eq 3) {
        Write-Host "  OK: 3/3 functions configuradas" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  AVISO: Apenas $found/3 functions configuradas" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  ERRO: config.toml nao encontrado" -ForegroundColor Red
    $failed++
}

# ============================================
# CHECK 5: MIGRATIONS
# ============================================
Write-Host ""
Write-Host "[5/6] Verificando migrations aplicadas..." -ForegroundColor Cyan

Write-Host "  MANUAL: Verificar no Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  1. Database → Policies → automated_reports (deve ter 4 policies)" -ForegroundColor White
Write-Host "  2. Database → Policies → organization_billing (deve ter 4 policies)" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "  Migrations aplicadas corretamente? (s/n)"
if ($confirm -eq "s") {
    Write-Host "  OK: Migrations confirmadas" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ERRO: Migrations nao aplicadas" -ForegroundColor Red
    $failed++
}

# ============================================
# CHECK 6: TESTE FUNCIONAL
# ============================================
Write-Host ""
Write-Host "[6/6] Teste funcional manual..." -ForegroundColor Cyan

Write-Host "  Testes a realizar:" -ForegroundColor Yellow
Write-Host "  [ ] Login funciona" -ForegroundColor White
Write-Host "  [ ] Dashboard carrega" -ForegroundColor White
Write-Host "  [ ] Reports funcionam" -ForegroundColor White
Write-Host "  [ ] Billing protegido (apenas admins veem)" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "  Todos os testes passaram? (s/n)"
if ($confirm -eq "s") {
    Write-Host "  OK: Testes funcionais OK" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ERRO: Testes funcionais falharam" -ForegroundColor Red
    $failed++
}

# ============================================
# RELATORIO
# ============================================
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "RELATORIO FINAL" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Passou: $passed" -ForegroundColor Green
Write-Host "Avisos: $warnings" -ForegroundColor Yellow
Write-Host "Falhou: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "DEPLOY VALIDADO COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Monitorar logs do Supabase" -ForegroundColor White
    Write-Host "  2. Monitorar logs do Vercel" -ForegroundColor White
    Write-Host "  3. Configurar alertas (Sentry, etc)" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "PROBLEMAS ENCONTRADOS!" -ForegroundColor Red
    Write-Host "Verifique os erros acima e corrija." -ForegroundColor Red
    Write-Host ""
    exit 1
}
