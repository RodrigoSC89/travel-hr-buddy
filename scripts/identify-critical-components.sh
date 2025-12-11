#!/bin/bash

echo "🔍 Identificando Componentes Críticos para Acessibilidade"
echo "=========================================================="
echo ""

OUTPUT="reports/accessibility/critical-components-analysis.md"
mkdir -p reports/accessibility

cat > "$OUTPUT" << 'HEADER'
# 🎯 Análise de Componentes Críticos
## Nautilus One - Travel HR Buddy

**Data:** $(date +"%d/%m/%Y %H:%M:%S")
**Objetivo:** Identificar componentes mais usados que precisam de melhorias de acessibilidade

---

## 📊 TOP 20 COMPONENTES MAIS IMPORTADOS

HEADER

echo "1. Analisando imports de componentes..."
grep -r "from.*components" src/ --include="*.tsx" --include="*.jsx" | \
  grep -v ".test." | \
  grep -v "node_modules" | \
  sed 's/.*from.*"\(.*\)".*/\1/' | \
  sort | uniq -c | sort -rn | head -20 | \
  awk '{print "- **" $1 " imports:** `" $2 "`"}' >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION1'

---

## 🔴 COMPONENTES COM PROBLEMAS DE ACESSIBILIDADE

### Componentes com onClick sem teclado:

SECTION1

# Top arquivos com onClick sem keyboard
grep -r "onClick=" src/components --include="*.tsx" --include="*.jsx" -c | \
  sort -t: -k2 -rn | head -15 | \
  awk -F: '{print "- `" $1 "` - " $2 " ocorrências"}' >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION2'

### Componentes com imagens sem alt:

SECTION2

grep -r "<img" src/components --include="*.tsx" --include="*.jsx" -l | \
  while read file; do
    count=$(grep "<img" "$file" | grep -v "alt=" | wc -l)
    if [ $count -gt 0 ]; then
      echo "- \`$file\` - $count imagens sem alt"
    fi
  done | head -10 >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION3'

### Componentes sem ARIA labels:

SECTION3

# Buscar botões sem aria-label
grep -r "<button" src/components --include="*.tsx" --include="*.jsx" -l | \
  while read file; do
    count=$(grep "<button" "$file" | grep -v "aria-label" | wc -l)
    if [ $count -gt 5 ]; then
      echo "- \`$file\` - $count botões potencialmente sem labels"
    fi
  done | sort -t- -k2 -rn | head -10 >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION4'

---

## 🎯 COMPONENTES PRIORITÁRIOS PARA CORREÇÃO

### 1. Layout Components (CRÍTICO)
- **Header/AppBar** - Usado em todas as páginas
- **Navigation/Sidebar** - Usado em todas as páginas
- **Footer** - Ausente! Precisa ser implementado
- **Prioridade:** 🔴 ALTA

### 2. Form Components (CRÍTICO)
SECTION4

# Listar componentes de formulário
find src/components -name "*Form*.tsx" -o -name "*Input*.tsx" -o -name "*Select*.tsx" 2>/dev/null | \
  head -10 | \
  awk -F/ '{print "- `" $NF "`"}' >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION5'

### 3. Interactive Components (SÉRIO)
SECTION5

find src/components -name "*Button*.tsx" -o -name "*Modal*.tsx" -o -name "*Dialog*.tsx" -o -name "*Dropdown*.tsx" 2>/dev/null | \
  head -10 | \
  awk -F/ '{print "- `" $NF "`"}' >> "$OUTPUT"

cat >> "$OUTPUT" << 'SECTION6'

### 4. Data Display Components (MODERADO)
SECTION6

find src/components -name "*Table*.tsx" -o -name "*Card*.tsx" -o -name "*List*.tsx" 2>/dev/null | \
  head -10 | \
  awk -F/ '{print "- `" $NF "`"}' >> "$OUTPUT"

cat >> "$OUTPUT" << 'FOOTER'

---

## 📋 PLANO DE CORREÇÃO

### Fase 1: Layout & Navigation (Sprint Atual)
1. ✅ **SmartLayout.tsx** - Adicionar landmarks semânticos
2. ✅ **Header/AppBar** - ARIA labels e keyboard navigation
3. ✅ **Navigation/Sidebar** - Roles e keyboard shortcuts
4. ✅ **Criar Footer** - Elemento \<footer\> ausente

### Fase 2: Forms & Inputs (Sprint Atual)
1. ✅ **Input components** - Associar labels
2. ✅ **Form components** - Validação acessível
3. ✅ **Select/Dropdown** - Keyboard navigation
4. ✅ **Buttons** - ARIA labels

### Fase 3: Interactive Components (Próxima Sprint)
1. ⏳ **Modals/Dialogs** - Focus trap, Esc para fechar
2. ⏳ **Tooltips** - Acessíveis por teclado
3. ⏳ **Dropdowns** - ARIA expanded/selected
4. ⏳ **Tabs** - ARIA tablist/tab/tabpanel

### Fase 4: Data Display (Próxima Sprint)
1. ⏳ **Tables** - Caption, scope, headers
2. ⏳ **Cards** - Semântica apropriada
3. ⏳ **Lists** - Roles apropriados

---

**Gerado por:** DeepAgent - Abacus.AI
**Versão:** FASE 3.2.0

FOOTER

echo "✅ Análise concluída!"
echo "📄 Relatório: $OUTPUT"
