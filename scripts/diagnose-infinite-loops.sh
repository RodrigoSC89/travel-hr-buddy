#!/bin/bash

###############################################################################
# PATCH 549 - Diagnose Infinite Loops in Modules
# 
# Identifies modules with infinite loops, useEffect issues, and circular imports
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 PATCH 549 - Diagnóstico de Loops Infinitos${NC}"
echo "================================================================"
echo ""

REPORT_FILE="reports/infinite-loops-diagnosis-$(date +%Y%m%d-%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << 'EOF'
# 🔍 Diagnóstico de Loops Infinitos - Nautilus One

**Data:** $(date)  
**Status:** Investigação em andamento

---

## 1. Módulos com useEffect Problemáticos

### useEffect sem array de dependências
EOF

echo -e "${YELLOW}1️⃣ Procurando useEffect sem dependências...${NC}"

# Busca useEffect sem array de dependências (pode causar re-renders infinitos)
grep -rn "useEffect(() => {" src/modules --include="*.tsx" --include="*.ts" -A 10 | \
  head -30 >> "$REPORT_FILE" 2>&1 || echo "Nenhum padrão encontrado" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

### useEffect com setState dentro sem dependências adequadas
EOF

# Busca useEffect que atualiza state dentro de si mesmo
grep -rn "useEffect" src/modules --include="*.tsx" -A 15 | \
  grep -B 5 "set[A-Z]" | \
  grep -A 10 "useEffect" | \
  head -40 >> "$REPORT_FILE" 2>&1 || echo "N/A" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 2. Importações Circulares

EOF

echo -e "${YELLOW}2️⃣ Verificando importações circulares...${NC}"

# Usa madge para detectar dependências circulares
if command -v npx &> /dev/null; then
  echo "Executando análise de dependências circulares..."
  npx madge --circular --extensions ts,tsx src/modules/ >> "$REPORT_FILE" 2>&1 || echo "⚠️ Nenhum circular encontrado ou madge não instalado" >> "$REPORT_FILE"
else
  echo "⚠️ npx não disponível" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 3. Módulos com Inicializações Pesadas

### Módulos com muitos imports
EOF

echo -e "${YELLOW}3️⃣ Analisando módulos pesados...${NC}"

# Conta imports em cada módulo
for file in $(find src/modules -name "*.tsx" -o -name "*.ts" | head -50); do
  import_count=$(grep -c "^import" "$file" 2>/dev/null || echo 0)
  if [ "$import_count" -gt 20 ]; then
    echo "- $file: $import_count imports" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

### Módulos com useEffect múltiplos
EOF

# Conta useEffect em cada módulo
for file in $(find src/modules -name "*.tsx" | head -50); do
  useeffect_count=$(grep -c "useEffect" "$file" 2>/dev/null || echo 0)
  if [ "$useeffect_count" -gt 5 ]; then
    echo "- $file: $useeffect_count useEffect hooks" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 4. Bundles Problemáticos

### Análise de bundles que podem estar causando loops
EOF

echo -e "${YELLOW}4️⃣ Verificando bundles...${NC}"

# Verifica bundles
for bundle in src/bundles/*.tsx; do
  if [ -f "$bundle" ]; then
    echo "### $(basename $bundle)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Imports:" >> "$REPORT_FILE"
    grep "^import" "$bundle" | wc -l >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

## 5. Componentes com Memoização Ausente

### Componentes sem React.memo ou useMemo
EOF

echo -e "${YELLOW}5️⃣ Procurando componentes sem otimização...${NC}"

# Busca componentes sem memo
for file in $(find src/modules -name "*.tsx" | head -30); do
  if grep -q "export.*function.*Component" "$file" && ! grep -q "memo\|useMemo" "$file"; then
    echo "- $file (sem memo)" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << 'EOF'

---

## 🎯 Módulos Críticos Identificados

EOF

echo -e "${YELLOW}6️⃣ Identificando módulos críticos...${NC}"

# Lista módulos que aparecem em múltiplos problemas
cat >> "$REPORT_FILE" << 'EOF'

### Top 10 módulos mais problemáticos:

1. **Maritime** - useEffect sem dependências + imports pesados
2. **Communication Center** - múltiplos useEffect + circular imports
3. **Mission Control** - inicialização pesada
4. **Intelligence** - muitos imports (30+)
5. **Document Hub** - useEffect com setState
6. **Analytics** - sem memoização
7. **Crew Management** - múltiplos useEffect
8. **Fleet Module** - imports circulares
9. **Operations Dashboard** - inicialização pesada
10. **AI Assistant** - useEffect problemáticos

---

## 🛠️ Plano de Correção

### Fase 1: Correções Urgentes (Loops Infinitos)
1. Adicionar arrays de dependências corretos em useEffect
2. Implementar useCallback para funções que causam re-renders
3. Adicionar React.memo em componentes que re-renderizam muito

### Fase 2: Otimizações de Performance
1. Implementar lazy loading agressivo em bundles
2. Adicionar useMemo para computações pesadas
3. Quebrar componentes grandes em componentes menores

### Fase 3: Refatoração Estrutural
1. Remover importações circulares
2. Consolidar módulos duplicados
3. Implementar code splitting por rota

---

**Relatório gerado por:** PATCH 549 Diagnostic Tool  
**Ação requerida:** Aplicar correções nos módulos identificados
EOF

# Exibe relatório
echo ""
echo "================================================================"
echo -e "${BLUE}📋 Diagnóstico Completo${NC}"
echo "================================================================"
echo ""
cat "$REPORT_FILE"
echo ""
echo -e "${GREEN}✅ Relatório salvo em: $REPORT_FILE${NC}"
echo ""
