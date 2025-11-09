# ============================================
# NAUTILUS ONE - VALIDAÇÃO DE SEGURANÇA
# ============================================

Write-Host "`n🔍 NAUTILUS ONE - VALIDAÇÃO DE SEGURANÇA`n" -ForegroundColor Cyan

$passed = 0
$failed = 0
$warnings = 0

# CHECK 1: Migrations
Write-Host "[1/5] Verificando migrations..." -ForegroundColor Cyan
$rlsMigration = "supabase\migrations\20250107_emergency_rls_fix.sql"
$functionsMigration = "supabase\migrations\20250107_fix_sql_functions_search_path.sql"

if (Test-Path $rlsMigration) {
    Write-Host "  ✓ RLS Migration encontrada" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ RLS Migration faltando" -ForegroundColor Red
    $failed++
}

if (Test-Path $functionsMigration) {
    Write-Host "  ✓ Functions Migration encontrada" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ Functions Migration faltando" -ForegroundColor Red
    $failed++
}

# CHECK 2: Config.toml
Write-Host "`n[2/5] Verificando config.toml..." -ForegroundColor Cyan
$configPath = "supabase\config.toml"

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $funcs = @("generate-drill-evaluation", "generate-drill-scenario", "generate-report", 
                "generate-scheduled-tasks", "generate-training-explanation", "generate-training-quiz")
    
    foreach ($func in $funcs) {
        if ($config -match "\[functions\.$func\]") {
            Write-Host "  ✓ $func" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ✗ $func faltando" -ForegroundColor Red
            $failed++
        }
    }
} else {
    Write-Host "  ✗ config.toml não encontrado" -ForegroundColor Red
    $failed++
}

# CHECK 3: Políticas RLS
Write-Host "`n[3/5] Validando RLS policies..." -ForegroundColor Cyan
if (Test-Path $rlsMigration) {
    $rls = Get-Content $rlsMigration -Raw
    $policies = @("automated_reports", "automation_executions", "organization_billing", "organization_metrics")
    
    foreach ($table in $policies) {
        $count = ([regex]::Matches($rls, "ON public\.$table")).Count
        if ($count -ge 4) {
            Write-Host "  ✓ $table ($count policies)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ⚠️  $table (apenas $count policies)" -ForegroundColor Yellow
            $warnings++
        }
    }
}

# CHECK 4: Funções SQL
Write-Host "`n[4/5] Validando SQL functions..." -ForegroundColor Cyan
if (Test-Path $functionsMigration) {
    $funcsql = Get-Content $functionsMigration -Raw
    $searchPathCount = ([regex]::Matches($funcsql, "SET search_path = public")).Count
    Write-Host "  ✓ $searchPathCount funções com search_path" -ForegroundColor Green
    $passed++
}

# CHECK 5: Arquivos Edge Functions
Write-Host "`n[5/5] Verificando Edge Functions..." -ForegroundColor Cyan
$funcDir = "supabase\functions"
$funcsToCheck = @("generate-drill-evaluation", "generate-drill-scenario", "generate-report")

foreach ($func in $funcsToCheck) {
    $path = Join-Path $funcDir "$func\index.ts"
    if (Test-Path $path) {
        Write-Host "  ✓ $func/index.ts" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ⚠️  $func/index.ts não encontrado" -ForegroundColor Yellow
        $warnings++
    }
}

# RELATÓRIO
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Passou: $passed" -ForegroundColor Green
Write-Host "⚠️  Avisos: $warnings" -ForegroundColor Yellow
Write-Host "❌ Falhou: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n✅ SISTEMA PRONTO PARA DEPLOY!`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ CORREÇÕES NECESSÁRIAS!`n" -ForegroundColor Red
    exit 1
}


if (Test-Path $functionsMigration) {
    Write-Success "  ✓ Functions Migration encontrada: $functionsMigration"
    $script:PassedChecks += "Functions Migration exists"
} else {
    Write-Failure "  ✗ Functions Migration NÃO encontrada: $functionsMigration"
    $script:FailedChecks += "Functions Migration missing"
}

# ============================================
# CHECK 2: Verificar config.toml
# ============================================
Write-Info "`n[2/5] Verificando Edge Functions no config.toml..."

$configPath = "supabase\config.toml"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    
    $requiredFunctions = @(
        "generate-drill-evaluation",
        "generate-drill-scenario",
        "generate-report",
        "generate-scheduled-tasks",
        "generate-training-explanation",
        "generate-training-quiz"
    )
    
    $missingFunctions = @()
    foreach ($func in $requiredFunctions) {
        if ($configContent -match "\[functions\.$func\]") {
            Write-Success "  ✓ $func configurada"
            $script:PassedChecks += "Edge Function: $func"
        } else {
            Write-Failure "  ✗ $func NÃO configurada"
            $missingFunctions += $func
            $script:FailedChecks += "Edge Function missing: $func"
        }
    }
    
    if ($missingFunctions.Count -eq 0) {
        Write-Success "`n  ✅ Todas as 6 Edge Functions configuradas!"
    } else {
        Write-Failure "`n  ❌ $($missingFunctions.Count) Edge Functions faltando!"
    }
} else {
    Write-Failure "  ✗ config.toml não encontrado!"
    $script:FailedChecks += "config.toml missing"
}

# ============================================
# CHECK 3: Verificar estrutura das migrations
# ============================================
Write-Info "`n[3/5] Validando conteúdo das migrations..."

# Verificar RLS Migration
if (Test-Path $rlsMigration) {
    $rlsContent = Get-Content $rlsMigration -Raw
    
    $expectedPolicies = @(
        "automated_reports_select",
        "automated_reports_insert",
        "automated_reports_update",
        "automated_reports_delete",
        "automation_executions_select",
        "automation_executions_insert",
        "automation_executions_update",
        "automation_executions_delete",
        "organization_billing_select",
        "organization_billing_insert",
        "organization_billing_update",
        "organization_billing_delete",
        "organization_metrics_select",
        "organization_metrics_insert",
        "organization_metrics_update",
        "organization_metrics_delete"
    )
    
    $foundPolicies = 0
    foreach ($policy in $expectedPolicies) {
        if ($rlsContent -match "CREATE POLICY `"$policy`"") {
            $foundPolicies++
        }
    }
    
    if ($foundPolicies -eq 16) {
        Write-Success "  ✓ Todas as 16 RLS policies encontradas na migration"
        $script:PassedChecks += "RLS policies complete"
    } else {
        Write-Warning "  ⚠️  Apenas $foundPolicies de 16 policies encontradas"
        $script:WarningChecks += "RLS policies incomplete ($foundPolicies/16)"
    }
}

# Verificar Functions Migration
if (Test-Path $functionsMigration) {
    $functionsContent = Get-Content $functionsMigration -Raw
    
    $expectedFunctions = @(
        "cleanup_old_logs",
        "create_default_branding",
        "create_session_token",
        "detect_reservation_conflicts",
        "generate_crew_ai_recommendations",
        "get_active_sessions",
        "get_reservation_stats",
        "handle_new_user",
        "jobs_trend_by_month",
        "match_mmi_jobs",
        "revoke_session_token",
        "update_audit_non_conformities_count",
        "update_channel_stats",
        "update_context_snapshot_timestamp",
        "update_conversation_last_message",
        "update_crew_updated_at",
        "update_maritime_certificate_status",
        "update_updated_at_column",
        "validate_email_format"
    )
    
    $foundFunctions = 0
    $functionsWithSearchPath = 0
    foreach ($func in $expectedFunctions) {
        if ($functionsContent -match "FUNCTION public\.$func") {
            $foundFunctions++
            if ($functionsContent -match "FUNCTION public\.$func[\s\S]*?SET search_path = public") {
                $functionsWithSearchPath++
            }
        }
    }
    
    Write-Success "  ✓ $foundFunctions de 19 funções encontradas"
    Write-Success "  ✓ $functionsWithSearchPath funções com SET search_path = public"
    
    if ($foundFunctions -eq 19 -and $functionsWithSearchPath -eq 19) {
        Write-Success "  ✅ Todas as funções SQL corrigidas!"
        $script:PassedChecks += "SQL functions complete"
    } else {
        Write-Warning "  ⚠️  Algumas funções podem estar faltando"
        $script:WarningChecks += "SQL functions incomplete"
    }
}

# ============================================
# CHECK 4: Verificar se Edge Functions existem
# ============================================
Write-Info "`n[4/5] Verificando se Edge Functions existem no filesystem..."

$functionsDir = "supabase\functions"
$requiredFunctionFolders = @(
    "generate-drill-evaluation",
    "generate-drill-scenario",
    "generate-report",
    "generate-scheduled-tasks",
    "generate-training-explanation",
    "generate-training-quiz"
)

if (Test-Path $functionsDir) {
    foreach ($func in $requiredFunctionFolders) {
        $funcPath = Join-Path $functionsDir $func
        $indexPath = Join-Path $funcPath "index.ts"
        
        if (Test-Path $indexPath) {
            Write-Success "  ✓ $func/index.ts existe"
            $script:PassedChecks += "Function file exists: $func"
        } else {
            Write-Warning "  ⚠️  $func/index.ts NÃO encontrado"
            $script:WarningChecks += "Function file missing: $func"
        }
    }
} else {
    Write-Failure "  ✗ Diretório supabase/functions não encontrado!"
    $script:FailedChecks += "Functions directory missing"
}

# ============================================
# CHECK 5: Verificar variáveis de ambiente
# ============================================
Write-Info "`n[5/5] Verificando arquivos de configuração..."

$envFiles = @(".env", ".env.local", ".env.production")
$foundEnvFile = $false

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Success "  ✓ $envFile encontrado"
        $foundEnvFile = $true
        
        $envContent = Get-Content $envFile -Raw
        
        # Verificar variáveis críticas
        $criticalVars = @(
            "VITE_SUPABASE_URL",
            "VITE_SUPABASE_ANON_KEY",
            "VITE_SUPABASE_PROJECT_ID"
        )
        
        foreach ($var in $criticalVars) {
            if ($envContent -match $var) {
                Write-Success "    ✓ $var definida"
            } else {
                Write-Warning "    ⚠️  $var não definida"
            }
        }
    }
}

if (-not $foundEnvFile) {
    Write-Warning "  ⚠️  Nenhum arquivo .env encontrado"
    $script:WarningChecks += "No .env file found"
}

# ============================================
# RELATÓRIO FINAL
# ============================================
Write-Host "`n" -NoNewline
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO DE VALIDAÇÃO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Success "`n✅ Checks Passaram: $($script:PassedChecks.Count)"
if ($script:PassedChecks.Count -gt 0 -and $Verbose) {
    foreach ($check in $script:PassedChecks) {
        Write-Host "   • $check" -ForegroundColor Gray
    }
}

if ($script:WarningChecks.Count -gt 0) {
    Write-Warning "`n⚠️  Avisos: $($script:WarningChecks.Count)"
    foreach ($check in $script:WarningChecks) {
        Write-Warning "   • $check"
    }
}

if ($script:FailedChecks.Count -gt 0) {
    Write-Failure "`n❌ Checks Falharam: $($script:FailedChecks.Count)"
    foreach ($check in $script:FailedChecks) {
        Write-Failure "   • $check"
    }
}

# ============================================
# STATUS FINAL
# ============================================
Write-Host "`n" -NoNewline
if ($script:FailedChecks.Count -eq 0) {
    Write-Success "✅ SISTEMA PRONTO PARA APLICAR MIGRATIONS!"
    Write-Info "`nPróximos passos:"
    Write-Host "1. Aplicar migrations via Supabase Dashboard" -ForegroundColor White
    Write-Host "2. Executar: .\scripts\deploy-production.ps1" -ForegroundColor White
    Write-Host "3. Verificar: .\scripts\validate-production.ps1" -ForegroundColor White
    exit 0
} else {
    Write-Failure "❌ CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY!"
    Write-Info "`nResolva os problemas acima antes de prosseguir."
    exit 1
}
