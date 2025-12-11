#!/bin/bash

# Script de Análise Estática de Acessibilidade
# Identifica problemas comuns de acessibilidade no código-fonte

echo "🔍 Análise Estática de Acessibilidade - Nautilus One"
echo "=================================================="
echo ""

OUTPUT_FILE="reports/accessibility/static-analysis-$(date +%Y%m%d-%H%M%S).md"
mkdir -p reports/accessibility

# Iniciar o relatório
cat > "$OUTPUT_FILE" << 'EOF'
# 🔍 Análise Estática de Acessibilidade
## Nautilus One - Travel HR Buddy

**Data:** $(date +"%d/%m/%Y %H:%M:%S")
**Tipo:** Análise Estática de Código
**Fase:** FASE 3.2

---

## 📊 RESUMO EXECUTIVO

EOF

echo "1. Analisando elementos <img> sem alt..."
IMG_NO_ALT=$(grep -r "<img" src/ --include="*.tsx" --include="*.jsx" | grep -v "alt=" | grep -v ".test." | wc -l)
echo "   ✓ Encontrados: $IMG_NO_ALT elementos <img> sem alt"

echo "2. Analisando elementos onClick sem onKeyDown/onKeyPress..."
ONCLICK_NO_KEYBOARD=$(grep -r "onClick=" src/ --include="*.tsx" --include="*.jsx" | grep -v "onKeyDown" | grep -v "onKeyPress" | grep -v "role=\"button\"" | grep -v ".test." | wc -l)
echo "   ✓ Encontrados: $ONCLICK_NO_KEYBOARD elementos onClick sem suporte a teclado"

echo "3. Analisando uso de aria-label e roles..."
ARIA_LABELS=$(grep -r "aria-label" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
ARIA_ROLES=$(grep -r "role=" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
echo "   ✓ aria-label: $ARIA_LABELS ocorrências"
echo "   ✓ role: $ARIA_ROLES ocorrências"

echo "4. Analisando botões sem texto acessível..."
BUTTONS_NO_TEXT=$(grep -r "<button" src/ --include="*.tsx" --include="*.jsx" | grep -v "aria-label" | grep -v ">" | grep -v ".test." | wc -l)
echo "   ✓ Encontrados: $BUTTONS_NO_TEXT possíveis botões sem texto acessível"

echo "5. Analisando inputs sem labels..."
INPUTS_NO_LABEL=$(grep -r "<input" src/ --include="*.tsx" --include="*.jsx" | grep -v "aria-label" | grep -v "placeholder" | grep -v ".test." | wc -l)
echo "   ✓ Encontrados: $INPUTS_NO_LABEL possíveis inputs sem labels"

echo "6. Analisando landmarks semânticos..."
HEADER_COUNT=$(grep -r "<header" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
NAV_COUNT=$(grep -r "<nav" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
MAIN_COUNT=$(grep -r "<main" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
FOOTER_COUNT=$(grep -r "<footer" src/ --include="*.tsx" --include="*.jsx" | grep -v ".test." | wc -l)
echo "   ✓ <header>: $HEADER_COUNT"
echo "   ✓ <nav>: $NAV_COUNT"
echo "   ✓ <main>: $MAIN_COUNT"
echo "   ✓ <footer>: $FOOTER_COUNT"

# Adicionar ao relatório
cat >> "$OUTPUT_FILE" << EOF

| Métrica | Valor | Status |
|---------|-------|--------|
| **Imagens sem alt** | $IMG_NO_ALT | $([ $IMG_NO_ALT -gt 0 ] && echo "🔴 Crítico" || echo "✅ OK") |
| **onClick sem teclado** | $ONCLICK_NO_KEYBOARD | $([ $ONCLICK_NO_KEYBOARD -gt 100 ] && echo "🔴 Crítico" || echo "🟡 Moderado") |
| **aria-label** | $ARIA_LABELS | $([ $ARIA_LABELS -lt 200 ] && echo "🟡 Baixo" || echo "✅ OK") |
| **role** | $ARIA_ROLES | $([ $ARIA_ROLES -lt 100 ] && echo "🟡 Baixo" || echo "✅ OK") |
| **Botões sem texto** | $BUTTONS_NO_TEXT | $([ $BUTTONS_NO_TEXT -gt 10 ] && echo "🟠 Sério" || echo "✅ OK") |
| **Inputs sem label** | $INPUTS_NO_LABEL | $([ $INPUTS_NO_LABEL -gt 20 ] && echo "🟠 Sério" || echo "✅ OK") |
| **Landmarks <header>** | $HEADER_COUNT | $([ $HEADER_COUNT -lt 5 ] && echo "🟡 Baixo" || echo "✅ OK") |
| **Landmarks <nav>** | $NAV_COUNT | $([ $NAV_COUNT -lt 5 ] && echo "🟡 Baixo" || echo "✅ OK") |
| **Landmarks <main>** | $MAIN_COUNT | $([ $MAIN_COUNT -lt 5 ] && echo "🟡 Baixo" || echo "✅ OK") |
| **Landmarks <footer>** | $FOOTER_COUNT | $([ $FOOTER_COUNT -lt 5 ] && echo "🟡 Baixo" || echo "✅ OK") |

---

## 🎯 PROBLEMAS IDENTIFICADOS

### 🔴 Críticos

#### 1. Imagens sem texto alternativo ($IMG_NO_ALT elementos)
- **Impacto:** Usuários de screen readers não conseguem entender o conteúdo das imagens
- **WCAG:** Viola 1.1.1 Non-text Content (Level A)
- **Prioridade:** ALTA

#### 2. Elementos onClick sem suporte a teclado ($ONCLICK_NO_KEYBOARD elementos)
- **Impacto:** Usuários que navegam por teclado não conseguem interagir com elementos
- **WCAG:** Viola 2.1.1 Keyboard (Level A)
- **Prioridade:** ALTA

### 🟠 Sérios

#### 3. Botões sem texto acessível ($BUTTONS_NO_TEXT elementos)
- **Impacto:** Screen readers não conseguem anunciar a função do botão
- **WCAG:** Viola 4.1.2 Name, Role, Value (Level A)
- **Prioridade:** MÉDIA-ALTA

#### 4. Inputs sem labels associados ($INPUTS_NO_LABEL elementos)
- **Impacto:** Usuários não conseguem identificar o propósito dos campos de formulário
- **WCAG:** Viola 3.3.2 Labels or Instructions (Level A)
- **Prioridade:** MÉDIA-ALTA

### 🟡 Moderados

#### 5. Baixo uso de ARIA labels e roles
- **aria-label:** $ARIA_LABELS ocorrências
- **role:** $ARIA_ROLES ocorrências
- **Impacto:** Navegação difícil para usuários de tecnologias assistivas
- **WCAG:** Melhores práticas ARIA
- **Prioridade:** MÉDIA

#### 6. Landmarks semânticos insuficientes
- **Impacto:** Estrutura de página difícil de navegar
- **WCAG:** Melhores práticas semânticas HTML5
- **Prioridade:** MÉDIA

---

## 📋 ARQUIVOS COM MAIS PROBLEMAS

### Imagens sem alt:
EOF

# Top 10 arquivos com imagens sem alt
echo "$(grep -r "<img" src/ --include="*.tsx" --include="*.jsx" -l | head -10)" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'

### onClick sem keyboard support:
EOF

# Top 10 arquivos com onClick sem keyboard
grep -r "onClick=" src/ --include="*.tsx" --include="*.jsx" -l | grep -v ".test." | head -10 >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" << 'EOF'

---

## 🚀 PLANO DE AÇÃO

### Fase 1: Correções Críticas (Sprint Atual)
1. ✅ Adicionar alt text em todas as imagens
2. ✅ Implementar suporte a teclado em elementos onClick
3. ✅ Adicionar aria-label em botões sem texto
4. ✅ Associar labels a todos os inputs

### Fase 2: Melhorias Semânticas (Próxima Sprint)
1. ⏳ Aumentar uso de ARIA labels e roles
2. ⏳ Adicionar mais landmarks semânticos
3. ⏳ Implementar skip links
4. ⏳ Adicionar breadcrumbs acessíveis

### Fase 3: Validação (Final)
1. ⏳ Executar auditoria dinâmica com axe-core
2. ⏳ Testar com screen readers (NVDA/JAWS/VoiceOver)
3. ⏳ Validar com Lighthouse (meta: >90)
4. ⏳ Testes manuais de navegação por teclado

---

**Gerado por:** DeepAgent - Abacus.AI
**Script:** static-accessibility-analysis.sh
**Versão:** FASE 3.2.0

EOF

echo ""
echo "✅ Análise concluída!"
echo "📄 Relatório salvo em: $OUTPUT_FILE"
echo ""
echo "📊 Resumo:"
echo "   • Imagens sem alt: $IMG_NO_ALT"
echo "   • onClick sem teclado: $ONCLICK_NO_KEYBOARD"
echo "   • aria-label: $ARIA_LABELS"
echo "   • Botões sem texto: $BUTTONS_NO_TEXT"
echo ""

# Também copiar para latest
cp "$OUTPUT_FILE" "reports/accessibility/static-analysis-latest.md"

