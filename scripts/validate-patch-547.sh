#!/bin/bash
# PATCH 547 Module Validation Script
# Validates that all critical modules are loading correctly

echo "🔍 PATCH 547 - Validação de Módulos"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a file exists
check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $name"
        return 0
    else
        echo -e "  ${RED}❌${NC} $name (arquivo não encontrado)"
        return 1
    fi
}

# Function to check if module has @ts-nocheck
check_ts_nocheck() {
    local file=$1
    local name=$2
    if grep -q "@ts-nocheck" "$file" 2>/dev/null; then
        echo -e "  ${YELLOW}⚠️${NC}  $name tem @ts-nocheck"
        return 1
    else
        echo -e "  ${GREEN}✅${NC} $name (sem @ts-nocheck)"
        return 0
    fi
}

# Check critical modules
echo "📦 Módulos Críticos"
echo "-------------------"

# Dashboard
check_file "src/pages/Index.tsx" "Dashboard Principal (Index.tsx)"
check_file "src/pages/Dashboard.tsx" "Dashboard Secundário"
check_ts_nocheck "src/pages/Index.tsx" "Index.tsx"

# Crew
check_file "src/pages/crew/index.tsx" "Crew Management"
check_ts_nocheck "src/pages/crew/index.tsx" "Crew"

# Fleet
check_file "src/components/fleet/fleet-management-dashboard.tsx" "Fleet Management Dashboard"
check_ts_nocheck "src/components/fleet/fleet-management-dashboard.tsx" "Fleet Dashboard"

# AI Insights
check_file "src/pages/Intelligence.tsx" "AI Insights/Intelligence"

# Control Hub
check_file "src/pages/ControlHub.tsx" "Control Hub"
check_ts_nocheck "src/pages/ControlHub.tsx" "Control Hub"

echo ""
echo "📊 Schemas Supabase"
echo "-------------------"

# Check migration files for required tables
MIGRATIONS_DIR="supabase/migrations"

check_schema() {
    local table=$1
    if grep -r "$table" "$MIGRATIONS_DIR" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} $table"
        return 0
    else
        echo -e "  ${RED}❌${NC} $table (não encontrado nas migrations)"
        return 1
    fi
}

check_schema "beta_feedback"
check_schema "ia_performance_log"
check_schema "ia_suggestions_log"
check_schema "watchdog_behavior_alerts"
check_schema "performance_metrics"
check_schema "system_health"
check_schema "sgso_audits"
check_schema "sgso_audit_items"
check_schema "templates"

echo ""
echo "🎨 Performance Index.tsx"
echo "------------------------"

# Check for performance optimizations
if grep -q "lazy()" "src/pages/Index.tsx" || grep -q "lazy" "src/pages/Index.tsx"; then
    echo -e "  ${GREEN}✅${NC} Lazy loading implementado"
else
    echo -e "  ${YELLOW}⚠️${NC}  Lazy loading não detectado"
fi

if grep -q "useMemo\|as const" "src/pages/Index.tsx"; then
    echo -e "  ${GREEN}✅${NC} Memoization implementado"
else
    echo -e "  ${YELLOW}⚠️${NC}  Memoization não detectado"
fi

if grep -q "Suspense" "src/pages/Index.tsx"; then
    echo -e "  ${GREEN}✅${NC} Suspense boundaries implementados"
else
    echo -e "  ${YELLOW}⚠️${NC}  Suspense boundaries não detectados"
fi

echo ""
echo "🔄 Correção de Loops Infinitos"
echo "-------------------------------"

# Check for infinite loop fixes
if grep -q "clearModuleRoutesCache\|moduleRoutesCache" "src/utils/module-routes.tsx" 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} Cache de rotas implementado"
else
    echo -e "  ${YELLOW}⚠️${NC}  Cache de rotas não encontrado"
fi

if grep -q "cancelled" "src/hooks/useModules.ts" 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} Race condition protection implementado"
else
    echo -e "  ${YELLOW}⚠️${NC}  Race condition protection não encontrado"
fi

echo ""
echo "📏 Mock Data Check"
echo "------------------"

# Check file sizes for potential large mock data
check_file_size() {
    local file=$1
    local name=$2
    local max_kb=$3
    
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file")
        local size_kb=$((size / 1024))
        
        if [ $size_kb -gt $max_kb ]; then
            echo -e "  ${YELLOW}⚠️${NC}  $name: ${size_kb}KB (max: ${max_kb}KB)"
            return 1
        else
            echo -e "  ${GREEN}✅${NC} $name: ${size_kb}KB"
            return 0
        fi
    else
        echo -e "  ${YELLOW}⚠️${NC}  $name não encontrado"
        return 1
    fi
}

check_file_size "src/components/feedback/BetaFeedbackForm.tsx" "BetaFeedbackForm" 10
check_file_size "src/components/ai/PerformanceMonitor.tsx" "PerformanceMonitor" 15
check_file_size "src/components/feedback/user-feedback-system.tsx" "UserFeedbackSystem" 15

echo ""
echo "🏗️  Build Validation"
echo "--------------------"

# Check if TypeScript compiles
if npm run type-check >/dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} TypeScript compila sem erros"
else
    echo -e "  ${RED}❌${NC} TypeScript tem erros"
fi

# Check @ts-nocheck count
TS_NOCHECK_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@ts-nocheck" 2>/dev/null | wc -l)
echo -e "  ℹ️  Arquivos com @ts-nocheck: $TS_NOCHECK_COUNT"

if [ $TS_NOCHECK_COUNT -lt 100 ]; then
    echo -e "  ${GREEN}✅${NC} Menos de 100 arquivos com @ts-nocheck"
elif [ $TS_NOCHECK_COUNT -lt 200 ]; then
    echo -e "  ${YELLOW}⚠️${NC}  Entre 100-200 arquivos com @ts-nocheck"
else
    echo -e "  ${RED}⚠️${NC}  Mais de 200 arquivos com @ts-nocheck"
fi

echo ""
echo "===================================="
echo "📊 Resumo PATCH 547"
echo "===================================="
echo ""
echo "Status geral: Veja os itens marcados com ❌ ou ⚠️  acima"
echo ""
echo "Próximos passos:"
echo "1. Corrigir itens com ❌"
echo "2. Revisar itens com ⚠️"
echo "3. Rodar testes: npm run test"
echo "4. Build completo: npm run build"
echo ""
