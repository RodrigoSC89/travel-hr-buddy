#!/bin/bash
# Script de Análise de Código Morto do Nautilus One
# FASE A - Varredura Técnica Final
# Criado: 11 de Dezembro de 2025

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/analysis-reports"
OUTPUT_FILE="$OUTPUT_DIR/dead-code-analysis.json"

echo "💀 Análise de Código Morto - Nautilus One"
echo "========================================"
echo ""

# Criar diretório de relatórios
mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_ROOT"

echo "📊 1. Instalando dependências de análise (se necessário)..."
if ! command -v ts-prune &> /dev/null; then
    echo "   ts-prune não encontrado. Instalando..."
    npm install -g ts-prune 2>/dev/null || echo "   ⚠️  Instale manualmente: npm install -g ts-prune"
fi

echo "📊 2. Executando ts-prune para identificar exports não utilizados..."
if command -v ts-prune &> /dev/null; then
    ts-prune --error --project tsconfig.json > "$OUTPUT_DIR/ts-prune-output.txt" 2>&1 || true
    UNUSED_EXPORTS=$(cat "$OUTPUT_DIR/ts-prune-output.txt" | wc -l)
    echo "   Exports não utilizados: $UNUSED_EXPORTS"
else
    echo "   ⚠️  ts-prune não disponível. Pulando análise automática."
    UNUSED_EXPORTS=0
fi

echo "📊 3. Identificando arquivos TypeScript/TSX..."
TOTAL_TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
echo "   Total de arquivos TS/TSX: $TOTAL_TS_FILES"

echo "📊 4. Analisando imports não utilizados..."
echo "   Buscando imports sem uso..."

# Buscar imports suspeitos (linha única, não destructured)
grep -rn "^import.*from" src/ | grep -v "type" | wc -l > "$OUTPUT_DIR/total-imports.txt" || echo "0" > "$OUTPUT_DIR/total-imports.txt"
TOTAL_IMPORTS=$(cat "$OUTPUT_DIR/total-imports.txt")
echo "   Total de imports encontrados: $TOTAL_IMPORTS"

echo "📊 5. Identificando componentes potencialmente órfãos..."
echo "   Buscando arquivos que não são importados..."

# Criar lista de todos os componentes
find src/components src/modules -name "*.tsx" | sed 's|^src/||' > "$OUTPUT_DIR/all-components.txt"

# Buscar componentes importados
grep -rh "from.*components\|from.*modules" src/ 2>/dev/null | 
  sed "s/.*from [\"']//g" | 
  sed "s/[\"'].*\$//" | 
  grep -v "^@" | 
  sort -u > "$OUTPUT_DIR/imported-components.txt" || true

ALL_COMPONENTS=$(cat "$OUTPUT_DIR/all-components.txt" | wc -l)
IMPORTED_COMPONENTS=$(cat "$OUTPUT_DIR/imported-components.txt" | wc -l)
ORPHAN_COMPONENTS=$((ALL_COMPONENTS - IMPORTED_COMPONENTS))

echo "   Total de componentes: $ALL_COMPONENTS"
echo "   Componentes importados: $IMPORTED_COMPONENTS"
echo "   Componentes potencialmente órfãos: $ORPHAN_COMPONENTS"

echo "📊 6. Analisando funções utilitárias não utilizadas..."
UTIL_FILES=$(find src/utils src/lib -name "*.ts" | wc -l)
echo "   Arquivos utilitários encontrados: $UTIL_FILES"

echo "📊 7. Identificando hooks customizados não utilizados..."
HOOK_FILES=$(find src/hooks -name "use*.ts" -o -name "use*.tsx" | wc -l)
echo "   Hooks customizados encontrados: $HOOK_FILES"

echo "📊 8. Buscando arquivos de teste órfãos..."
TEST_FILES=$(find src tests -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | wc -l)
echo "   Arquivos de teste encontrados: $TEST_FILES"

echo "📊 9. Identificando arquivos completamente órfãos..."
echo "   Buscando arquivos que nunca são importados..."

# Criar lista de todos os arquivos TS/TSX
find src -name "*.ts" -o -name "*.tsx" | sed 's|^src/||' | grep -v "App.tsx" | grep -v "main.tsx" > "$OUTPUT_DIR/all-source-files.txt"

# Esta é uma análise aproximada
TOTAL_SOURCE_FILES=$(cat "$OUTPUT_DIR/all-source-files.txt" | wc -l)
echo "   Total de arquivos fonte: $TOTAL_SOURCE_FILES"

echo "📊 10. Calculando porcentagem de código potencialmente morto..."
if [ $TOTAL_TS_FILES -gt 0 ]; then
    DEAD_CODE_PERCENTAGE=$((ORPHAN_COMPONENTS * 100 / ALL_COMPONENTS))
    echo "   Código morto estimado: ~$DEAD_CODE_PERCENTAGE%"
else
    DEAD_CODE_PERCENTAGE=0
fi

echo ""
echo "✅ Análise de código morto concluída!"
echo "📁 Relatório salvo em: $OUTPUT_DIR/dead-code-analysis.json"
echo ""
echo "📋 Categorização sugerida:"
echo "   🗑️  DELETÁVEL: Componentes órfãos sem comentários TODO"
echo "   📦 ARQUIVÁVEL: Componentes com comentários 'future' ou 'WIP'"
echo "   ❓ INCERTO: Componentes com dependências complexas"
echo ""

# Gerar JSON de saída
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "analysis": {
    "total_ts_files": $TOTAL_TS_FILES,
    "total_imports": $TOTAL_IMPORTS,
    "unused_exports": $UNUSED_EXPORTS,
    "all_components": $ALL_COMPONENTS,
    "imported_components": $IMPORTED_COMPONENTS,
    "orphan_components": $ORPHAN_COMPONENTS,
    "util_files": $UTIL_FILES,
    "hook_files": $HOOK_FILES,
    "test_files": $TEST_FILES,
    "total_source_files": $TOTAL_SOURCE_FILES,
    "dead_code_percentage": $DEAD_CODE_PERCENTAGE
  },
  "files": {
    "all_components": "$OUTPUT_DIR/all-components.txt",
    "imported_components": "$OUTPUT_DIR/imported-components.txt",
    "all_source_files": "$OUTPUT_DIR/all-source-files.txt",
    "ts_prune_output": "$OUTPUT_DIR/ts-prune-output.txt"
  }
}
EOF

echo "📊 Análise completa exportada para JSON"