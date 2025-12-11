#!/bin/bash
# FASE B - Identificação de Componentes Similares
# Script para detectar duplicação e oportunidades de generalização

echo "=================================================="
echo "   NAUTILUS ONE - ANÁLISE DE COMPONENTES SIMILARES"
echo "   FASE B - Varredura Técnica Final"
echo "=================================================="
echo ""

REPORT_FILE="similar_components_report.txt"
REPORT_JSON="similar_components_report.json"

echo "Iniciando análise de componentes similares..."
echo ""

# Criar arquivo de relatório
echo "# ANÁLISE DE COMPONENTES SIMILARES - NAUTILUS ONE" > $REPORT_FILE
echo "# Data: $(date)" >> $REPORT_FILE
echo "# Repositório: /home/ubuntu/github_repos/travel-hr-buddy" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. IDENTIFICAR TODOS OS COMPONENTES
echo "[1/8] Coletando todos os componentes React..."
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) | sort > /tmp/all_components.txt
TOTAL_COMPONENTS=$(wc -l < /tmp/all_components.txt)

echo "Total de componentes encontrados: $TOTAL_COMPONENTS" >> $REPORT_FILE
echo "   ✓ Encontrados $TOTAL_COMPONENTS componentes"
echo "" >> $REPORT_FILE

# 2. IDENTIFICAR NOMES SIMILARES
echo "=================================================" >> $REPORT_FILE
echo "1. COMPONENTES COM NOMES SIMILARES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[2/8] Analisando nomes similares..."

# Extrair apenas os nomes dos arquivos e agrupar por similaridade
cat /tmp/all_components.txt | xargs -n1 basename | sed 's/\.[jt]sx$//' | sort > /tmp/component_names.txt

echo "[1.1] Componentes com sufixos de versão (-v2, -new, -old, etc):" >> $REPORT_FILE
grep -E "(-v[0-9]|-new|-old|-legacy|-updated|-improved|[0-9]$)" /tmp/component_names.txt | sort | uniq > /tmp/versioned_components.txt
VERSIONED_COUNT=$(wc -l < /tmp/versioned_components.txt)

if [ $VERSIONED_COUNT -gt 0 ]; then
  cat /tmp/versioned_components.txt | sed 's/^/  - /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  echo "  Total: $VERSIONED_COUNT componentes versionados" >> $REPORT_FILE
else
  echo "  Nenhum encontrado" >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE
echo "   ✓ Encontrados $VERSIONED_COUNT componentes versionados"

echo "[1.2] Componentes com prefixos similares:" >> $REPORT_FILE
# Agrupar por prefixo (primeiras palavras)
cat /tmp/component_names.txt | sed 's/[A-Z][a-z]*/&\n/g' | head -1 | sort | uniq -c | sort -rn | awk '$1 > 3' | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 3. ANÁLISE DE CÓDIGO DUPLICADO
echo "[3/8] Analisando código duplicado..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "2. ANÁLISE DE CÓDIGO DUPLICADO" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[2.1] Componentes com estrutura similar (mesmos imports):" >> $REPORT_FILE

# Criar assinaturas de imports para cada componente
for file in $(cat /tmp/all_components.txt | head -50); do  # Limitar para performance
  if [ -f "$file" ]; then
    IMPORT_SIG=$(grep "^import" "$file" 2>/dev/null | sort | md5sum | cut -d' ' -f1)
    echo "$IMPORT_SIG:$file" >> /tmp/import_signatures.txt
  fi
done

# Encontrar componentes com mesmos imports
cat /tmp/import_signatures.txt | cut -d: -f1 | sort | uniq -c | sort -rn | awk '$1 > 1' | while read count sig; do
  echo "Grupo com $count componentes com imports idênticos:" >> $REPORT_FILE
  grep "^$sig:" /tmp/import_signatures.txt | cut -d: -f2 | sed 's/^/  - /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
done

echo "   ✓ Análise de duplicação concluída"

# 4. IDENTIFICAR COMPONENTES GENERALIZÁVEIS
echo "[4/8] Identificando componentes generalizáveis..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "3. COMPONENTES GENERALIZÁVEIS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.1] Componentes de formulário (candidatos para FormBase):" >> $REPORT_FILE
grep -l "<form\|Form\|input\|Input" $(cat /tmp/all_components.txt) 2>/dev/null | head -20 | sed 's/^/  - /' >> $REPORT_FILE
FORM_COUNT=$(grep -l "<form\|Form\|input\|Input" $(cat /tmp/all_components.txt) 2>/dev/null | wc -l)
echo "  Total: $FORM_COUNT componentes de formulário" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.2] Componentes de tabela (candidatos para TableBase):" >> $REPORT_FILE
grep -l "<table\|Table\|DataGrid\|datagrid" $(cat /tmp/all_components.txt) 2>/dev/null | head -20 | sed 's/^/  - /' >> $REPORT_FILE
TABLE_COUNT=$(grep -l "<table\|Table\|DataGrid\|datagrid" $(cat /tmp/all_components.txt) 2>/dev/null | wc -l)
echo "  Total: $TABLE_COUNT componentes de tabela" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.3] Componentes de card (candidatos para CardBase):" >> $REPORT_FILE
grep -l "<Card\|card\|<div.*className.*card" $(cat /tmp/all_components.txt) 2>/dev/null | head -20 | sed 's/^/  - /' >> $REPORT_FILE
CARD_COUNT=$(grep -l "<Card\|card\|<div.*className.*card" $(cat /tmp/all_components.txt) 2>/dev/null | wc -l)
echo "  Total: $CARD_COUNT componentes de card" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.4] Componentes de modal (candidatos para ModalBase):" >> $REPORT_FILE
grep -l "<Modal\|modal\|Dialog\|dialog" $(cat /tmp/all_components.txt) 2>/dev/null | head -20 | sed 's/^/  - /' >> $REPORT_FILE
MODAL_COUNT=$(grep -l "<Modal\|modal\|Dialog\|dialog" $(cat /tmp/all_components.txt) 2>/dev/null | wc -l)
echo "  Total: $MODAL_COUNT componentes de modal" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Form: $FORM_COUNT | Table: $TABLE_COUNT | Card: $CARD_COUNT | Modal: $MODAL_COUNT"

# 5. ANÁLISE DE PROPS E INTERFACE
echo "[5/8] Analisando interfaces e props..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "4. ANÁLISE DE PROPS E INTERFACES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[4.1] Componentes com interfaces complexas (>10 props):" >> $REPORT_FILE
for file in $(cat /tmp/all_components.txt | head -100); do
  if [ -f "$file" ]; then
    PROP_COUNT=$(grep -c "^  [a-z].*:" "$file" 2>/dev/null || echo "0")
    if [ $PROP_COUNT -gt 10 ]; then
      echo "  - $file ($PROP_COUNT props)" >> $REPORT_FILE
    fi
  fi
done
echo "" >> $REPORT_FILE

echo "   ✓ Interfaces analisadas"

# 6. PADRÕES DE REUTILIZAÇÃO
echo "[6/8] Identificando padrões de reutilização..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "5. PADRÕES DE REUTILIZAÇÃO" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.1] Hooks customizados mais utilizados:" >> $REPORT_FILE
for file in $(cat /tmp/all_components.txt); do
  if [ -f "$file" ]; then
    grep -oh "use[A-Z][a-zA-Z]*" "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.2] Componentes base mais importados:" >> $REPORT_FILE
for file in $(cat /tmp/all_components.txt); do
  if [ -f "$file" ]; then
    grep "from.*components" "$file" 2>/dev/null | grep -o "import.*from" | sed 's/import {//;s/} from//' 
  fi
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Padrões identificados"

# 7. MÉTRICAS DE COMPLEXIDADE
echo "[7/8] Calculando métricas de complexidade..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "6. MÉTRICAS DE COMPLEXIDADE" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Componente                                    | Linhas | JSX | Hooks | Complexidade" >> $REPORT_FILE
echo "----------------------------------------------|--------|-----|-------|-------------" >> $REPORT_FILE

for file in $(cat /tmp/all_components.txt | head -50); do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    JSX_LINES=$(grep -c "<.*>" "$file" 2>/dev/null || echo "0")
    HOOK_COUNT=$(grep -c "use[A-Z]" "$file" 2>/dev/null || echo "0")
    COMPLEXITY=$((LINES / 10 + JSX_LINES / 5 + HOOK_COUNT))
    FILENAME=$(basename "$file")
    printf "%-45s | %6s | %3s | %5s | %11s\n" "$FILENAME" "$LINES" "$JSX_LINES" "$HOOK_COUNT" "$COMPLEXITY" >> $REPORT_FILE
  fi
done

echo "" >> $REPORT_FILE
echo "   ✓ Métricas calculadas"

# 8. GERAR RELATÓRIO JSON
echo "[8/8] Gerando relatório JSON estruturado..."

cat > $REPORT_JSON <<EOF
{
  "analysis_date": "$(date -Iseconds)",
  "repository": "/home/ubuntu/github_repos/travel-hr-buddy",
  "summary": {
    "total_components": $TOTAL_COMPONENTS,
    "versioned_components": $VERSIONED_COUNT,
    "form_components": $FORM_COUNT,
    "table_components": $TABLE_COUNT,
    "card_components": $CARD_COUNT,
    "modal_components": $MODAL_COUNT
  },
  "generalization_opportunities": {
    "form_base": $FORM_COUNT,
    "table_base": $TABLE_COUNT,
    "card_base": $CARD_COUNT,
    "modal_base": $MODAL_COUNT
  }
}
EOF

echo "   ✓ Relatório JSON gerado"

# SUMÁRIO FINAL
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "7. SUMÁRIO E RECOMENDAÇÕES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Total de componentes analisados: $TOTAL_COMPONENTS" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "OPORTUNIDADES DE CONSOLIDAÇÃO:" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Alta Prioridade:" >> $REPORT_FILE
echo "  - Remover $VERSIONED_COUNT componentes versionados" >> $REPORT_FILE
echo "  - Criar FormBase genérico ($FORM_COUNT candidatos)" >> $REPORT_FILE
echo "  - Criar TableBase genérico ($TABLE_COUNT candidatos)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Média Prioridade:" >> $REPORT_FILE
echo "  - Criar CardBase genérico ($CARD_COUNT candidatos)" >> $REPORT_FILE
echo "  - Criar ModalBase genérico ($MODAL_COUNT candidatos)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Baixa Prioridade:" >> $REPORT_FILE
echo "  - Refatorar componentes com alta complexidade" >> $REPORT_FILE
echo "  - Consolidar hooks customizados duplicados" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo ""
echo "=================================================="
echo "   ANÁLISE CONCLUÍDA!"
echo "=================================================="
echo ""
echo "Relatórios gerados:"
echo "  - $REPORT_FILE (texto)"
echo "  - $REPORT_JSON (JSON estruturado)"
echo ""
echo "Componentes analisados: $TOTAL_COMPONENTS"
echo "Oportunidades de generalização:"
echo "  - Forms:  $FORM_COUNT"
echo "  - Tables: $TABLE_COUNT"
echo "  - Cards:  $CARD_COUNT"
echo "  - Modals: $MODAL_COUNT"
echo ""

# Limpar arquivos temporários
rm -f /tmp/all_components.txt /tmp/component_names.txt /tmp/versioned_components.txt /tmp/import_signatures.txt
