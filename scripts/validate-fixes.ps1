# NAUTILUS ONE - VALIDACAO DE SEGURANCA

Write-Host ""
Write-Host "NAUTILUS ONE - VALIDACAO DE SEGURANCA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# CHECK 1
Write-Host "[1/4] Verificando migrations..." -ForegroundColor Cyan
if (Test-Path "supabase\migrations\20250107_emergency_rls_fix.sql") {
    Write-Host "  OK: RLS Migration" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ERRO: RLS Migration faltando" -ForegroundColor Red
    $failed++
}

if (Test-Path "supabase\migrations\20250107_fix_sql_functions_search_path.sql") {
    Write-Host "  OK: Functions Migration" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ERRO: Functions Migration faltando" -ForegroundColor Red
    $failed++
}

# CHECK 2
Write-Host ""
Write-Host "[2/4] Verificando config.toml..." -ForegroundColor Cyan
if (Test-Path "supabase\config.toml") {
    $config = Get-Content "supabase\config.toml" -Raw
    $funcs = @("generate-drill-evaluation", "generate-drill-scenario", "generate-report")
    
    foreach ($func in $funcs) {
        if ($config -match "\[functions\.$func\]") {
            Write-Host "  OK: $func" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ERRO: $func faltando" -ForegroundColor Red
            $failed++
        }
    }
} else {
    Write-Host "  ERRO: config.toml nao encontrado" -ForegroundColor Red
    $failed++
}

# CHECK 3
Write-Host ""
Write-Host "[3/4] Contando RLS policies..." -ForegroundColor Cyan
$rls = Get-Content "supabase\migrations\20250107_emergency_rls_fix.sql" -Raw
$count = ([regex]::Matches($rls, "CREATE POLICY")).Count
Write-Host "  OK: $count policies encontradas" -ForegroundColor Green
$passed++

# CHECK 4
Write-Host ""
Write-Host "[4/4] Contando SQL functions..." -ForegroundColor Cyan
$sql = Get-Content "supabase\migrations\20250107_fix_sql_functions_search_path.sql" -Raw
$count = ([regex]::Matches($sql, "SET search_path")).Count
Write-Host "  OK: $count funcoes com search_path" -ForegroundColor Green
$passed++

# RELATORIO
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "RELATORIO FINAL" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Passou: $passed" -ForegroundColor Green
Write-Host "Falhou: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "SISTEMA PRONTO PARA DEPLOY!" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "CORRECOES NECESSARIAS!" -ForegroundColor Red
    Write-Host ""
    exit 1
}
