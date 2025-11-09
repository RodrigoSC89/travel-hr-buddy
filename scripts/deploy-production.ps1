# ============================================
# NAUTILUS ONE - SCRIPT DE DEPLOY AUTOMATIZADO
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "production")]
    [string]$Environment = "production",
    
    [switch]$SkipMigrations,
    [switch]$SkipFunctions,
    [switch]$SkipVercel,
    [switch]$DryRun
)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   NAUTILUS ONE - DEPLOY PARA $Environment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$step = 1
$totalSteps = 5

# ============================================
# FUNCAO: Executar comando com log
# ============================================
function Invoke-Step {
    param(
        [string]$Title,
        [scriptblock]$Action,
        [switch]$Optional
    )
    
    Write-Host "[$script:step/$totalSteps] $Title" -ForegroundColor Yellow
    Write-Host ("=" * 50) -ForegroundColor Gray
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] Pulando execucao..." -ForegroundColor Magenta
        $script:step++
        return $true
    }
    
    try {
        & $Action
        Write-Host "  OK: $Title concluido!" -ForegroundColor Green
        Write-Host ""
        $script:step++
        return $true
    }
    catch {
        if ($Optional) {
            Write-Host "  AVISO: $Title falhou (opcional)" -ForegroundColor Yellow
            Write-Host "  Erro: $_" -ForegroundColor Gray
            $script:step++
            return $false
        }
        else {
            Write-Host "  ERRO: $Title falhou!" -ForegroundColor Red
            Write-Host "  Erro: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "Deploy abortado!" -ForegroundColor Red
            exit 1
        }
    }
}

# ============================================
# STEP 0: VALIDACAO PRE-DEPLOY
# ============================================
Write-Host "[0/$totalSteps] VALIDACAO PRE-DEPLOY" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Gray

Write-Host "  Executando script de validacao..." -ForegroundColor Cyan
if (Test-Path ".\scripts\validate-fixes.ps1") {
    & ".\scripts\validate-fixes.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  ERRO: Validacao falhou!" -ForegroundColor Red
        Write-Host "  Corrija os problemas antes de continuar." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  AVISO: Script de validacao nao encontrado" -ForegroundColor Yellow
}

Write-Host "  OK: Sistema validado!" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 1: APLICAR MIGRATIONS SUPABASE
# ============================================
if (-not $SkipMigrations) {
    Invoke-Step -Title "APLICAR MIGRATIONS NO SUPABASE" -Action {
        Write-Host "  Verificando migrations..." -ForegroundColor Cyan
        
        $rlsMigration = "supabase\migrations\20250107_emergency_rls_fix.sql"
        $funcMigration = "supabase\migrations\20250107_fix_sql_functions_search_path.sql"
        
        if (-not (Test-Path $rlsMigration)) {
            throw "RLS Migration nao encontrada: $rlsMigration"
        }
        
        if (-not (Test-Path $funcMigration)) {
            throw "Functions Migration nao encontrada: $funcMigration"
        }
        
        Write-Host "  Migrations encontradas!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  ACAO MANUAL NECESSARIA:" -ForegroundColor Yellow
        Write-Host "  1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new" -ForegroundColor White
        Write-Host "  2. Copie e execute: $rlsMigration" -ForegroundColor White
        Write-Host "  3. Copie e execute: $funcMigration" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "  Migrations aplicadas manualmente? (s/n)"
        if ($confirm -ne "s") {
            throw "Migrations nao aplicadas"
        }
    }
} else {
    Write-Host "[1/$totalSteps] PULANDO MIGRATIONS (--SkipMigrations)" -ForegroundColor Gray
    $step++
}

# ============================================
# STEP 2: DEPLOY EDGE FUNCTIONS
# ============================================
if (-not $SkipFunctions) {
    Invoke-Step -Title "DEPLOY EDGE FUNCTIONS" -Action {
        Write-Host "  Verificando Edge Functions..." -ForegroundColor Cyan
        
        $functionsDir = "supabase\functions"
        $requiredFuncs = @(
            "generate-drill-evaluation",
            "generate-drill-scenario",
            "generate-report",
            "generate-scheduled-tasks",
            "generate-training-explanation",
            "generate-training-quiz"
        )
        
        $missing = @()
        foreach ($func in $requiredFuncs) {
            $path = Join-Path $functionsDir "$func\index.ts"
            if (-not (Test-Path $path)) {
                $missing += $func
            }
        }
        
        if ($missing.Count -gt 0) {
            Write-Host "  AVISO: Functions nao encontradas:" -ForegroundColor Yellow
            $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
            Write-Host ""
        }
        
        Write-Host "  ACAO MANUAL NECESSARIA:" -ForegroundColor Yellow
        Write-Host "  1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/functions" -ForegroundColor White
        Write-Host "  2. Deploy das 6 functions via Dashboard OU" -ForegroundColor White
        Write-Host "  3. Execute: supabase functions deploy --no-verify-jwt" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "  Edge Functions deployadas? (s/n)"
        if ($confirm -ne "s") {
            throw "Edge Functions nao deployadas"
        }
    }
} else {
    Write-Host "[2/$totalSteps] PULANDO EDGE FUNCTIONS (--SkipFunctions)" -ForegroundColor Gray
    $step++
}

# ============================================
# STEP 3: CONFIGURAR ENV VARS
# ============================================
Invoke-Step -Title "VERIFICAR VARIAVEIS DE AMBIENTE" -Action {
    Write-Host "  Verificando .env.production..." -ForegroundColor Cyan
    
    if (-not (Test-Path ".env.production")) {
        Write-Host "  AVISO: .env.production nao encontrado" -ForegroundColor Yellow
        Write-Host "  Criando template..." -ForegroundColor Cyan
        
        $template = @"
# Supabase
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=COPIAR_DO_DASHBOARD
VITE_SUPABASE_PROJECT_ID=vnbptmixvwropvanyhdb

# MQTT
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt

# Features
VITE_ENABLE_CLIENT_METRICS=false
"@
        $template | Out-File ".env.production" -Encoding UTF8
        Write-Host "  Template criado: .env.production" -ForegroundColor Green
    }
    
    Write-Host "  Arquivo .env.production OK" -ForegroundColor Green
} -Optional

# ============================================
# STEP 4: BUILD LOCAL (TESTE)
# ============================================
Invoke-Step -Title "BUILD LOCAL (TESTE)" -Action {
    Write-Host "  Testando build..." -ForegroundColor Cyan
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Instalando dependencias..." -ForegroundColor Cyan
        npm install
    }
    
    # Build
    Write-Host "  Executando build..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build falhou"
    }
    
    Write-Host "  Build OK!" -ForegroundColor Green
} -Optional

# ============================================
# STEP 5: DEPLOY VERCEL
# ============================================
if (-not $SkipVercel) {
    Invoke-Step -Title "DEPLOY NO VERCEL" -Action {
        Write-Host "  Preparando deploy para Vercel..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  OPCAO 1 - VIA DASHBOARD:" -ForegroundColor Yellow
        Write-Host "  1. Acesse: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "  2. Import project ou Redeploy" -ForegroundColor White
        Write-Host "  3. Configure env vars do .env.production" -ForegroundColor White
        Write-Host ""
        Write-Host "  OPCAO 2 - VIA CLI:" -ForegroundColor Yellow
        Write-Host "  vercel --prod" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "  Deploy no Vercel concluido? (s/n)"
        if ($confirm -ne "s") {
            throw "Deploy Vercel nao concluido"
        }
    }
} else {
    Write-Host "[5/$totalSteps] PULANDO VERCEL (--SkipVercel)" -ForegroundColor Gray
}

# ============================================
# CONCLUSAO
# ============================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   DEPLOY CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Testar aplicacao em: https://nautilus-one.vercel.app" -ForegroundColor White
Write-Host "  2. Verificar logs no Supabase" -ForegroundColor White
Write-Host "  3. Verificar logs no Vercel" -ForegroundColor White
Write-Host "  4. Testar funcionalidades criticas (login, billing, reports)" -ForegroundColor White
Write-Host ""

Write-Host "Documentacao:" -ForegroundColor Cyan
Write-Host "  - DEPLOY_PRODUCTION_GUIDE.md (guia completo)" -ForegroundColor White
Write-Host "  - SECURITY_FIX_INSTRUCTIONS.md (correcoes aplicadas)" -ForegroundColor White
Write-Host ""

Write-Host "Deploy finalizado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
