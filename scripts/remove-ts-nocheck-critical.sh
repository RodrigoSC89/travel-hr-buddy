#!/bin/bash

###############################################################################
# PATCH 536 - Remove @ts-nocheck de Arquivos Críticos
# 
# Remove @ts-nocheck apenas de arquivos críticos para o funcionamento do sistema
# Prioriza: App.tsx, main.tsx, contexts, hooks, lib/monitoring
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 PATCH 536 - Removendo @ts-nocheck de Arquivos Críticos${NC}"
echo "================================================================"
echo ""

REMOVED_COUNT=0
FAILED_COUNT=0
REPORT_FILE="reports/ts-nocheck-removal-$(date +%Y%m%d-%H%M%S).log"

mkdir -p reports

# Lista de arquivos críticos (prioridade de correção)
CRITICAL_FILES=(
  "src/App.tsx"
  "src/main.tsx"
  "src/contexts/AuthContext.tsx"
  "src/contexts/TenantContext.tsx"
  "src/contexts/OrganizationContext.tsx"
  "src/lib/monitoring/init.ts"
  "src/lib/monitoring/performance-monitor.ts"
  "src/lib/logger.ts"
  "src/hooks/usePerformanceMonitoring.ts"
  "src/hooks/performance/usePerformanceLog.tsx"
)

echo "Arquivos críticos a processar: ${#CRITICAL_FILES[@]}"
echo ""

process_file() {
  local file=$1
  
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  Arquivo não encontrado: $file${NC}"
    return 1
  fi
  
  # Verifica se tem @ts-nocheck
  if ! grep -q "@ts-nocheck" "$file"; then
    echo -e "${GREEN}✅ $file - Já sem @ts-nocheck${NC}"
    return 0
  fi
  
  echo -e "${YELLOW}🔄 Processando: $file${NC}"
  
  # Backup
  cp "$file" "$file.backup-$(date +%Y%m%d-%H%M%S)"
  
  # Remove linhas com @ts-nocheck (comentários simples ou em bloco)
  sed -i.bak '/^\s*\/\/\s*@ts-nocheck/d' "$file"
  sed -i.bak '/^\s*\/\*.*@ts-nocheck.*\*\//d' "$file"
  
  # Tenta compilar
  echo "  Verificando tipos..."
  if npx tsc --noEmit --skipLibCheck "$file" 2>> "$REPORT_FILE"; then
    echo -e "${GREEN}  ✅ Tipos OK - @ts-nocheck removido com sucesso${NC}"
    rm -f "$file.bak"
    REMOVED_COUNT=$((REMOVED_COUNT + 1))
    echo "✅ SUCCESS: $file" >> "$REPORT_FILE"
    return 0
  else
    echo -e "${RED}  ❌ Erros de tipo detectados - restaurando backup${NC}"
    mv "$file.backup-$(date +%Y%m%d-%H%M%S)" "$file"
    rm -f "$file.bak"
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo "❌ FAILED: $file (erros de tipo)" >> "$REPORT_FILE"
    return 1
  fi
}

# Processa cada arquivo crítico
for file in "${CRITICAL_FILES[@]}"; do
  process_file "$file" || true
  echo ""
done

# Relatório final
echo "================================================================"
echo -e "${BLUE}📊 Relatório de Remoção de @ts-nocheck${NC}"
echo "================================================================"
echo ""
echo -e "${GREEN}✅ Removidos com sucesso: $REMOVED_COUNT${NC}"
echo -e "${RED}❌ Falhas (mantido @ts-nocheck): $FAILED_COUNT${NC}"
echo ""
echo "Detalhes salvos em: $REPORT_FILE"
echo ""

if [ $REMOVED_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Progresso: $(($REMOVED_COUNT * 100 / ${#CRITICAL_FILES[@]}))% dos arquivos críticos corrigidos${NC}"
  echo ""
  echo "Próximos passos:"
  echo "  1. Revisar erros em: $REPORT_FILE"
  echo "  2. Executar: npm run type-check"
  echo "  3. Executar: npm run build"
  echo "  4. Executar: ./scripts/validate-dashboard-preview.sh"
else
  echo -e "${RED}⚠️ Nenhum arquivo foi corrigido. Revisar logs em $REPORT_FILE${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Para remover @ts-nocheck de TODOS os arquivos (não recomendado sem revisão):${NC}"
echo "  find src -name '*.ts' -o -name '*.tsx' | xargs sed -i '/^\s*\/\/\s*@ts-nocheck/d'"
echo ""
