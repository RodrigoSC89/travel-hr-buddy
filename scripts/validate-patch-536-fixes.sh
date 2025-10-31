#!/bin/bash

###############################################################################
# PATCH 536 - Validar Correções Aplicadas
# 
# Valida se as correções críticas do PATCH 536 foram aplicadas corretamente
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}✅ PATCH 536 - Validação de Correções${NC}"
echo "================================================================"
echo ""

REPORT_FILE="reports/patch-536-validation-$(date +%Y%m%d-%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << 'EOF'
# ✅ PATCH 536 - Validação de Correções

**Data:** $(date)  
**Status:** Validando correções aplicadas

---

## 1. Verificação de TypeScript Compilation

EOF

echo -e "${YELLOW}1️⃣ Verificando compilação TypeScript...${NC}"

if npm run type-check > /tmp/typecheck.log 2>&1; then
  echo -e "${GREEN}✅ TypeScript compilation OK${NC}"
  echo "✅ **TypeScript Compilation:** PASSED" >> "$REPORT_FILE"
else
  echo -e "${RED}❌ Erros de TypeScript detectados${NC}"
  echo "❌ **TypeScript Compilation:** FAILED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  tail -20 /tmp/typecheck.log >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 2. Verificação de @ts-nocheck Removidos

EOF

echo -e "${YELLOW}2️⃣ Verificando remoção de @ts-nocheck...${NC}"

# Verifica usePerformanceMonitoring.ts
if grep -q "@ts-nocheck" src/hooks/usePerformanceMonitoring.ts 2>/dev/null; then
  echo -e "${RED}❌ usePerformanceMonitoring.ts ainda tem @ts-nocheck${NC}"
  echo "❌ **usePerformanceMonitoring.ts:** Ainda tem @ts-nocheck" >> "$REPORT_FILE"
else
  echo -e "${GREEN}✅ usePerformanceMonitoring.ts sem @ts-nocheck${NC}"
  echo "✅ **usePerformanceMonitoring.ts:** @ts-nocheck removido" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 3. Verificação de Logger Import em App.tsx

EOF

echo -e "${YELLOW}3️⃣ Verificando import do logger...${NC}"

if grep -q "import.*logger.*from.*@/lib/logger" src/App.tsx; then
  echo -e "${GREEN}✅ Logger import presente em App.tsx${NC}"
  echo "✅ **App.tsx Logger Import:** Presente" >> "$REPORT_FILE"
else
  echo -e "${RED}❌ Logger import ausente em App.tsx${NC}"
  echo "❌ **App.tsx Logger Import:** AUSENTE" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 4. Verificação de console.log em App.tsx

EOF

echo -e "${YELLOW}4️⃣ Verificando console.log em App.tsx...${NC}"

CONSOLE_COUNT=$(grep -c "console\.\(log\|warn\|error\)" src/App.tsx 2>/dev/null || echo "0")

if [ "$CONSOLE_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ Nenhum console.log encontrado em App.tsx${NC}"
  echo "✅ **App.tsx console.log:** Nenhum encontrado (substituídos por logger)" >> "$REPORT_FILE"
else
  echo -e "${YELLOW}⚠️ Ainda existem $CONSOLE_COUNT console.log em App.tsx${NC}"
  echo "⚠️ **App.tsx console.log:** $CONSOLE_COUNT ocorrências restantes" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "**Localizações:**" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  grep -n "console\.\(log\|warn\|error\)" src/App.tsx >> "$REPORT_FILE" 2>/dev/null || true
  echo '```' >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 5. Verificação de Timeout de Segurança

EOF

echo -e "${YELLOW}5️⃣ Verificando timeout de segurança...${NC}"

if grep -q "INIT_TIMEOUT_MS" src/App.tsx; then
  echo -e "${GREEN}✅ Timeout de segurança implementado${NC}"
  echo "✅ **Timeout de Segurança:** Implementado" >> "$REPORT_FILE"
  
  # Extrai valor do timeout
  TIMEOUT_VALUE=$(grep "INIT_TIMEOUT_MS.*=" src/App.tsx | sed 's/.*=\s*\([0-9]*\).*/\1/')
  echo "   Valor configurado: ${TIMEOUT_VALUE}ms" >> "$REPORT_FILE"
else
  echo -e "${RED}❌ Timeout de segurança não encontrado${NC}"
  echo "❌ **Timeout de Segurança:** NÃO IMPLEMENTADO" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 6. Verificação de Performance Tracking

EOF

echo -e "${YELLOW}6️⃣ Verificando performance tracking...${NC}"

if grep -q "performance.mark('init-start')" src/App.tsx && grep -q "performance.measure" src/App.tsx; then
  echo -e "${GREEN}✅ Performance tracking implementado${NC}"
  echo "✅ **Performance Tracking:** Implementado com markers" >> "$REPORT_FILE"
else
  echo -e "${RED}❌ Performance tracking não encontrado${NC}"
  echo "❌ **Performance Tracking:** NÃO IMPLEMENTADO" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 7. Verificação de Error Handling em Preloads

EOF

echo -e "${YELLOW}7️⃣ Verificando error handling em preloads...${NC}"

CATCH_COUNT=$(grep -c "\.catch.*error.*logger" src/App.tsx 2>/dev/null || echo "0")

if [ "$CATCH_COUNT" -ge 4 ]; then
  echo -e "${GREEN}✅ Error handling robusto em preloads (${CATCH_COUNT} .catch blocks)${NC}"
  echo "✅ **Error Handling em Preloads:** $CATCH_COUNT .catch blocks implementados" >> "$REPORT_FILE"
else
  echo -e "${YELLOW}⚠️ Error handling parcial em preloads (${CATCH_COUNT} .catch blocks)${NC}"
  echo "⚠️ **Error Handling em Preloads:** $CATCH_COUNT .catch blocks (esperado >= 4)" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 8. Build Test

EOF

echo -e "${YELLOW}8️⃣ Testando build...${NC}"

if npm run build > /tmp/build.log 2>&1; then
  echo -e "${GREEN}✅ Build completado com sucesso${NC}"
  echo "✅ **Build Test:** PASSED" >> "$REPORT_FILE"
  
  # Extrai métricas do build
  BUILD_TIME=$(grep -o "built in [0-9.]*s" /tmp/build.log | head -1 || echo "N/A")
  DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
  
  echo "" >> "$REPORT_FILE"
  echo "**Build Metrics:**" >> "$REPORT_FILE"
  echo "- Build time: $BUILD_TIME" >> "$REPORT_FILE"
  echo "- Dist size: $DIST_SIZE" >> "$REPORT_FILE"
else
  echo -e "${RED}❌ Build falhou${NC}"
  echo "❌ **Build Test:** FAILED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  tail -50 /tmp/build.log >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

---

## 📊 Resumo da Validação

EOF

# Conta sucessos
SUCCESS_COUNT=0
TOTAL_CHECKS=8

grep -q "✅.*TypeScript Compilation.*PASSED" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*usePerformanceMonitoring.ts.*removido" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*Logger Import.*Presente" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*console.log.*Nenhum" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*Timeout.*Implementado" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*Performance Tracking.*Implementado" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*Error Handling" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
grep -q "✅.*Build Test.*PASSED" "$REPORT_FILE" && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL_CHECKS))

cat >> "$REPORT_FILE" << EOF

**Taxa de Sucesso:** $SUCCESS_COUNT/$TOTAL_CHECKS ($PERCENTAGE%)

EOF

if [ $PERCENTAGE -eq 100 ]; then
  cat >> "$REPORT_FILE" << 'EOF'

### 🎉 Status: TODAS AS CORREÇÕES VALIDADAS

✅ Todas as correções críticas do PATCH 536 foram aplicadas e validadas com sucesso!

**Próximos Passos:**
1. Deploy para preview environment
2. Testes manuais de navegação
3. Validação de métricas de performance em produção
4. Continuar remoção de @ts-nocheck em arquivos não-críticos

EOF
elif [ $PERCENTAGE -ge 75 ]; then
  cat >> "$REPORT_FILE" << 'EOF'

### ✅ Status: CORREÇÕES PRINCIPAIS VALIDADAS

✅ A maioria das correções críticas foi aplicada com sucesso.

**Ações Pendentes:**
- Revisar checks que falharam acima
- Aplicar correções adicionais conforme necessário
- Re-executar validação após correções

EOF
else
  cat >> "$REPORT_FILE" << 'EOF'

### ⚠️ Status: CORREÇÕES INCOMPLETAS

⚠️ Várias correções críticas ainda não foram aplicadas ou validadas.

**Ação Requerida:**
- Revisar relatório completo de diagnóstico
- Aplicar correções manualmente
- Re-executar validação após correções

EOF
fi

cat >> "$REPORT_FILE" << 'EOF'

---

**Relatório gerado por:** PATCH 536 Validation Script  
**Próxima ação:** Revisar itens marcados com ❌ ou ⚠️  
EOF

# Exibe relatório no terminal
echo ""
echo "================================================================"
echo -e "${BLUE}📋 Resumo da Validação${NC}"
echo "================================================================"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
  echo -e "${GREEN}🎉 TODAS AS CORREÇÕES VALIDADAS ($SUCCESS_COUNT/$TOTAL_CHECKS)${NC}"
elif [ $PERCENTAGE -ge 75 ]; then
  echo -e "${GREEN}✅ CORREÇÕES PRINCIPAIS VALIDADAS ($SUCCESS_COUNT/$TOTAL_CHECKS)${NC}"
else
  echo -e "${YELLOW}⚠️ CORREÇÕES INCOMPLETAS ($SUCCESS_COUNT/$TOTAL_CHECKS)${NC}"
fi

echo ""
echo "Relatório completo salvo em: $REPORT_FILE"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
  echo -e "${GREEN}Próximos passos:${NC}"
  echo "  1. Deploy para preview: npm run preview"
  echo "  2. Testes manuais de navegação"
  echo "  3. Validação de performance"
else
  echo -e "${YELLOW}Ações necessárias:${NC}"
  echo "  1. Revisar relatório: cat $REPORT_FILE"
  echo "  2. Aplicar correções pendentes"
  echo "  3. Re-executar validação: ./scripts/validate-patch-536-fixes.sh"
fi

echo ""
