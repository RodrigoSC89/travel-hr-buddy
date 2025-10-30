#!/bin/bash

###############################################################################
# PATCH 536 - Diagnosticar Preview Freeze
# 
# Identifica causa raiz do travamento do Lovable Preview
# Analisa: imports circulares, loops em useEffect, memory leaks
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 PATCH 536 - Diagnóstico de Preview Freeze${NC}"
echo "================================================================"
echo ""

REPORT_FILE="reports/preview-freeze-diagnosis-$(date +%Y%m%d-%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << 'EOF'
# 🔍 Diagnóstico de Preview Freeze - Nautilus One

**Data:** $(date)  
**Status:** Investigação em andamento

---

## 1. Verificação de Imports Circulares

EOF

echo -e "${YELLOW}1️⃣ Verificando imports circulares...${NC}"
echo ""

# Usa madge para detectar dependências circulares (se instalado)
if command -v npx &> /dev/null; then
  echo "Executando análise de dependências circulares..."
  npx madge --circular --extensions ts,tsx src/ >> "$REPORT_FILE" 2>&1 || echo "⚠️ Nenhum circular encontrado ou madge não instalado" >> "$REPORT_FILE"
else
  echo "⚠️ npx não disponível, pulando análise de imports circulares" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 2. Análise de useEffect Problemáticos

### useEffect sem dependências (pode causar loops)
EOF

echo -e "${YELLOW}2️⃣ Procurando useEffect sem dependências...${NC}"

# Busca useEffect com array de dependências vazio mas que usa variáveis externas
grep -rn "useEffect" src/ --include="*.tsx" --include="*.ts" -A 5 | \
  grep -B 2 "\[\]" | \
  head -20 >> "$REPORT_FILE" 2>&1 || echo "Nenhum padrão suspeito encontrado" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

### useEffect com dependências que causam re-renders
EOF

# Busca useEffect que atualiza state dentro de si mesmo
grep -rn "useState" src/App.tsx -A 30 | \
  grep -A 20 "useEffect" >> "$REPORT_FILE" 2>&1 || echo "N/A" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 3. Análise de Inicialização (src/App.tsx)

### Problemas Identificados em App.tsx
EOF

echo -e "${YELLOW}3️⃣ Analisando inicialização do App.tsx...${NC}"

# Extrai seção crítica de inicialização
sed -n '/useEffect.*isInitialized/,/^\s*}/p' src/App.tsx >> "$REPORT_FILE" 2>&1 || echo "Padrão não encontrado" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 4. Análise de Memory Leaks

### Componentes sem cleanup em useEffect
EOF

echo -e "${YELLOW}4️⃣ Procurando useEffect sem cleanup...${NC}"

# Busca useEffect que usa subscriptions mas não retorna cleanup
grep -rn "useEffect" src/ --include="*.tsx" -A 10 | \
  grep -B 5 "subscribe\|addEventListener\|setInterval" | \
  grep -v "return.*unsubscribe\|removeEventListener\|clearInterval" | \
  head -20 >> "$REPORT_FILE" 2>&1 || echo "Nenhum padrão problemático evidente" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 5. Análise de Bundle Size e Lazy Loading

EOF

echo -e "${YELLOW}5️⃣ Verificando lazy loading...${NC}"

# Conta quantos lazy imports existem vs imports diretos
LAZY_COUNT=$(grep -r "safeLazyImport\|lazyWithPreload" src/App.tsx | wc -l)
DIRECT_COUNT=$(grep -r "^import.*from.*pages" src/App.tsx | wc -l)

cat >> "$REPORT_FILE" << EOF

**Imports lazy:** $LAZY_COUNT  
**Imports diretos:** $DIRECT_COUNT  
**Proporção:** $(echo "scale=2; $LAZY_COUNT * 100 / ($LAZY_COUNT + $DIRECT_COUNT)" | bc)% lazy

EOF

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 6. Verificação de ErrorBoundary

EOF

echo -e "${YELLOW}6️⃣ Verificando ErrorBoundary...${NC}"

if grep -q "ErrorBoundary" src/App.tsx; then
  echo "✅ ErrorBoundary presente em App.tsx" >> "$REPORT_FILE"
else
  echo "❌ **CRÍTICO:** ErrorBoundary NÃO encontrado em App.tsx" >> "$REPORT_FILE"
  echo "   Erros fatais podem não estar sendo capturados!" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 7. Análise de Performance Markers

EOF

echo -e "${YELLOW}7️⃣ Verificando performance monitoring...${NC}"

if grep -q "performanceMonitor\|webVitalsService" src/App.tsx; then
  echo "✅ Performance monitoring detectado" >> "$REPORT_FILE"
  
  # Extrai configuração de monitoring
  grep -A 10 "performanceMonitor\|webVitalsService" src/App.tsx >> "$REPORT_FILE" 2>&1
else
  echo "⚠️ Performance monitoring não detectado claramente" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

---

## 🎯 Recomendações de Correção

### Prioridade 1 - Crítico
1. **Adicionar ErrorBoundary global** - Capturar erros fatais silenciosos
2. **Adicionar timeout em inicializações** - Prevenir travamentos indefinidos
3. **Implementar circuit breaker** - Abortar inicialização se > 5s

### Prioridade 2 - Alto
1. **Adicionar performance.mark()** - Identificar bottlenecks na inicialização
2. **Implementar lazy loading agressivo** - Reduzir bundle inicial
3. **Adicionar console.time() temporário** - Debug de timing

### Prioridade 3 - Médio
1. **Revisar dependências de useEffect** - Garantir arrays completos
2. **Adicionar cleanup em todos os useEffect** - Prevenir memory leaks
3. **Implementar loading states** - Feedback visual de progresso

---

## 📊 Próximos Passos

1. **Executar build com profiling:**
   ```bash
   npm run build -- --profile
   ```

2. **Testar preview local com timeout:**
   ```bash
   timeout 30s npm run preview
   ```

3. **Adicionar debugging temporário em App.tsx:**
   ```typescript
   console.time('App-Init');
   console.log('Step 1: Starting initialization');
   // ... código de inicialização
   console.timeEnd('App-Init');
   ```

4. **Testar em modo dev primeiro:**
   ```bash
   npm run dev
   # Se funcionar, problema está no build preview
   # Se não funcionar, problema está no código
   ```

---

**Relatório gerado por:** PATCH 536 Diagnostic Tool  
**Ação requerida:** Revisar e implementar correções recomendadas
EOF

# Exibe relatório no terminal
echo ""
echo "================================================================"
echo -e "${BLUE}📋 Diagnóstico Completo${NC}"
echo "================================================================"
echo ""
cat "$REPORT_FILE"
echo ""
echo -e "${GREEN}✅ Relatório salvo em: $REPORT_FILE${NC}"
echo ""
echo "Para aplicar correções, execute:"
echo "  1. Revisar relatório: cat $REPORT_FILE"
echo "  2. Aplicar correções sugeridas manualmente"
echo "  3. Executar novamente: ./scripts/validate-dashboard-preview.sh"
echo ""
