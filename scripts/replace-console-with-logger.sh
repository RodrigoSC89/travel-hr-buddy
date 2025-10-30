#!/bin/bash

###############################################################################
# PATCH 536 - Substituir console.log por logger
# 
# Substitui console.log/warn/error por logger.info/warn/error
# Adiciona import do logger automaticamente
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 PATCH 536 - Substituindo console.log por logger${NC}"
echo "================================================================"
echo ""

REPLACED_COUNT=0
FILES_MODIFIED=0
REPORT_FILE="reports/console-to-logger-$(date +%Y%m%d-%H%M%S).log"

mkdir -p reports

echo "Procurando arquivos com console.log/warn/error..." > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Encontra todos os arquivos TS/TSX com console.log
FILES=$(grep -rl "console\.\(log\|warn\|error\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}✅ Nenhum console.log encontrado!${NC}"
  exit 0
fi

FILE_COUNT=$(echo "$FILES" | wc -l)
echo "Arquivos a processar: $FILE_COUNT"
echo ""

process_file() {
  local file=$1
  
  echo -e "${YELLOW}🔄 Processando: $file${NC}"
  echo "Processing: $file" >> "$REPORT_FILE"
  
  # Backup
  cp "$file" "$file.backup-$(date +%Y%m%d-%H%M%S)"
  
  # Conta ocorrências antes
  BEFORE_COUNT=$(grep -c "console\.\(log\|warn\|error\)" "$file" || echo "0")
  
  # Adiciona import do logger se não existir
  if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
    # Encontra a última linha de import
    LAST_IMPORT=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
    
    if [ -n "$LAST_IMPORT" ]; then
      # Adiciona import após último import existente
      sed -i "${LAST_IMPORT}a import { logger } from \"@/lib/logger\";" "$file"
      echo "  ✅ Import do logger adicionado" >> "$REPORT_FILE"
    else
      # Adiciona no topo do arquivo
      sed -i "1i import { logger } from \"@/lib/logger\";" "$file"
      echo "  ✅ Import do logger adicionado no topo" >> "$REPORT_FILE"
    fi
  fi
  
  # Substitui console.log por logger.info
  sed -i 's/console\.log(/logger.info(/g' "$file"
  
  # Substitui console.warn por logger.warn
  sed -i 's/console\.warn(/logger.warn(/g' "$file"
  
  # Substitui console.error por logger.error
  sed -i 's/console\.error(/logger.error(/g' "$file"
  
  # Conta ocorrências depois
  AFTER_COUNT=$(grep -c "console\.\(log\|warn\|error\)" "$file" || echo "0")
  
  REPLACED_IN_FILE=$((BEFORE_COUNT - AFTER_COUNT))
  REPLACED_COUNT=$((REPLACED_COUNT + REPLACED_IN_FILE))
  
  if [ $REPLACED_IN_FILE -gt 0 ]; then
    echo -e "${GREEN}  ✅ $REPLACED_IN_FILE ocorrências substituídas${NC}"
    echo "  Replaced: $REPLACED_IN_FILE occurrences" >> "$REPORT_FILE"
    FILES_MODIFIED=$((FILES_MODIFIED + 1))
  else
    echo -e "${YELLOW}  ⚠️ Nenhuma substituição feita${NC}"
    echo "  No replacements made" >> "$REPORT_FILE"
  fi
  
  # Remove backup se substituição foi bem-sucedida
  rm -f "$file.backup-$(date +%Y%m%d-%H%M%S)"
  
  echo "" >> "$REPORT_FILE"
}

# Processa cada arquivo
for file in $FILES; do
  process_file "$file"
done

# Relatório final
echo ""
echo "================================================================"
echo -e "${BLUE}📊 Relatório de Substituição console → logger${NC}"
echo "================================================================"
echo ""
echo -e "${GREEN}✅ Total de substituições: $REPLACED_COUNT${NC}"
echo -e "${GREEN}✅ Arquivos modificados: $FILES_MODIFIED / $FILE_COUNT${NC}"
echo ""
echo "Detalhes salvos em: $REPORT_FILE"
echo ""

if [ $FILES_MODIFIED -gt 0 ]; then
  echo "Próximos passos:"
  echo "  1. Revisar mudanças: git diff src/"
  echo "  2. Testar build: npm run build"
  echo "  3. Testar preview: npm run preview"
  echo "  4. Commit changes: git add src/ && git commit -m 'PATCH 536: Replace console with logger'"
  echo ""
  
  # Verificação final
  REMAINING=$(grep -r "console\.\(log\|warn\|error\)" src/ --include="*.ts" --include="*.tsx" | wc -l)
  
  if [ $REMAINING -eq 0 ]; then
    echo -e "${GREEN}🎉 Sucesso! Nenhum console.log restante em src/${NC}"
  else
    echo -e "${YELLOW}⚠️ Atenção: Ainda restam $REMAINING ocorrências de console.log/warn/error${NC}"
    echo "  Execute novamente o script ou revise manualmente"
  fi
else
  echo -e "${RED}⚠️ Nenhum arquivo foi modificado. Revisar logs em $REPORT_FILE${NC}"
fi

echo ""
