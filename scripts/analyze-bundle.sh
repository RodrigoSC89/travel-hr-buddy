#!/bin/bash
# Script de Análise de Bundle do Nautilus One
# FASE A - Varredura Técnica Final
# Criado: 11 de Dezembro de 2025

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/analysis-reports"
OUTPUT_FILE="$OUTPUT_DIR/bundle-analysis.json"

echo "📦 Análise de Bundle - Nautilus One"
echo "=================================="
echo ""

# Criar diretório de relatórios
mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_ROOT"

echo "📊 1. Verificando configuração do Vite..."
if [ -f "vite.config.ts" ]; then
    echo "   ✅ vite.config.ts encontrado"
    CHUNK_SIZE_LIMIT=$(grep -n "chunkSizeWarningLimit" vite.config.ts | head -1 || echo "Não configurado")
    echo "   Chunk size limit: $CHUNK_SIZE_LIMIT"
else
    echo "   ⚠️  vite.config.ts não encontrado"
fi

echo "📊 2. Analisando imports de bibliotecas grandes..."
echo "   Buscando imports de bibliotecas pesadas..."

# Lista de bibliotecas grandes conhecidas
LIBS=("@tensorflow" "mapbox-gl" "recharts" "chart.js" "moment" "lodash" "react-pdf" "pdfjs-dist" "three" "babylonjs")

for lib in "${LIBS[@]}"; do
    COUNT=$(grep -rn "from ['\"]$lib" src/ 2>/dev/null | wc -l || echo "0")
    if [ "$COUNT" -gt 0 ]; then
        echo "   📚 $lib: $COUNT imports"
        grep -rn "from ['\"]$lib" src/ 2>/dev/null | head -5 >> "$OUTPUT_DIR/heavy-imports.txt" || true
    fi
done

HEAVY_IMPORTS=$(cat "$OUTPUT_DIR/heavy-imports.txt" 2>/dev/null | wc -l || echo "0")
echo "   Total de imports pesados: $HEAVY_IMPORTS"

echo "📊 3. Verificando lazy loading implementado..."
LAZY_IMPORTS=$(grep -rn "React.lazy\|lazy(" src/ | wc -l)
DYNAMIC_IMPORTS=$(grep -rn "import(" src/ | wc -l)
echo "   React.lazy: $LAZY_IMPORTS"
echo "   Dynamic imports: $DYNAMIC_IMPORTS"
TOTAL_LAZY=$((LAZY_IMPORTS + DYNAMIC_IMPORTS))
echo "   Total lazy loading: $TOTAL_LAZY"

echo "📊 4. Analisando configuração de code splitting..."
if [ -f "vite.config.ts" ]; then
    MANUAL_CHUNKS=$(grep -n "manualChunks" vite.config.ts | wc -l)
    echo "   Manual chunks configurados: $MANUAL_CHUNKS"
fi

echo "📊 5. Identificando assets não otimizados..."
echo "   Buscando imagens grandes..."
IMAGES=$(find public src -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" 2>/dev/null | wc -l || echo "0")
echo "   Total de imagens: $IMAGES"

# Buscar imagens grandes (>500KB)
if [ "$IMAGES" -gt 0 ]; then
    find public src -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" 2>/dev/null | 
      xargs du -h 2>/dev/null | 
      awk '$1 ~ /M|[5-9][0-9][0-9]K/ {print}' > "$OUTPUT_DIR/large-images.txt" || true
    LARGE_IMAGES=$(cat "$OUTPUT_DIR/large-images.txt" 2>/dev/null | wc -l || echo "0")
    echo "   Imagens grandes (>500KB): $LARGE_IMAGES"
fi

echo "📊 6. Verificando fontes customizadas..."
FONTS=$(find public src -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" -o -name "*.otf" 2>/dev/null | wc -l || echo "0")
echo "   Arquivos de fonte: $FONTS"

echo "📊 7. Analisando configuração de compressão..."
if [ -f "vite.config.ts" ]; then
    COMPRESSION=$(grep -n "compression\|gzip\|brotli" vite.config.ts | wc -l)
    if [ "$COMPRESSION" -gt 0 ]; then
        echo "   ✅ Compressão configurada"
    else
        echo "   ⚠️  Compressão não encontrada na configuração"
    fi
fi

echo "📊 8. Verificando lazy-loaders customizados..."
LAZY_LOADERS=$(find src/lib src/components -name "*lazy*.ts" -o -name "*lazy*.tsx" 2>/dev/null | wc -l || echo "0")
echo "   Lazy loaders customizados: $LAZY_LOADERS"

echo "📊 9. Analisando tree-shaking opportunities..."
NAMED_IMPORTS=$(grep -rn "import {" src/ | wc -l)
DEFAULT_IMPORTS=$(grep -rn "import [A-Z]" src/ | wc -l)
WILDCARD_IMPORTS=$(grep -rn "import \* as" src/ | wc -l)
echo "   Named imports (bom): $NAMED_IMPORTS"
echo "   Default imports: $DEFAULT_IMPORTS"
echo "   Wildcard imports (ruim): $WILDCARD_IMPORTS"

if [ "$NAMED_IMPORTS" -gt 0 ]; then
    TREESHAKE_SCORE=$((NAMED_IMPORTS * 100 / (NAMED_IMPORTS + WILDCARD_IMPORTS + 1)))
    echo "   Tree-shake score: $TREESHAKE_SCORE%"
else
    TREESHAKE_SCORE=0
fi

echo "📊 10. Verificando Critical Rendering Path..."
BLOCKING_SCRIPTS=$(grep -rn "<script" index.html public/*.html 2>/dev/null | grep -v "defer\|async" | wc -l || echo "0")
BLOCKING_STYLES=$(grep -rn "<link rel=\"stylesheet\"" index.html public/*.html 2>/dev/null | grep -v "media" | wc -l || echo "0")
echo "   Scripts bloqueantes: $BLOCKING_SCRIPTS"
echo "   Estilos bloqueantes: $BLOCKING_STYLES"

echo ""
echo "✅ Análise de bundle concluída!"
echo "📁 Relatório salvo em: $OUTPUT_DIR/bundle-analysis.json"
echo ""
echo "📋 Oportunidades de otimização:"
if [ "$HEAVY_IMPORTS" -gt 10 ]; then
    echo "   ⚠️  Muitos imports de bibliotecas pesadas sem lazy loading"
fi
if [ "$WILDCARD_IMPORTS" -gt 50 ]; then
    echo "   ⚠️  Muitos wildcard imports prejudicando tree-shaking"
fi
if [ "$LARGE_IMAGES" -gt 0 ]; then
    echo "   ⚠️  Imagens grandes detectadas - otimizar"
fi
if [ "$BLOCKING_SCRIPTS" -gt 0 ]; then
    echo "   ⚠️  Scripts bloqueantes no HTML"
fi
echo ""

# Gerar JSON de saída
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "analysis": {
    "heavy_imports": $HEAVY_IMPORTS,
    "lazy_imports": $LAZY_IMPORTS,
    "dynamic_imports": $DYNAMIC_IMPORTS,
    "total_lazy": $TOTAL_LAZY,
    "images": $IMAGES,
    "large_images": $LARGE_IMAGES,
    "fonts": $FONTS,
    "lazy_loaders": $LAZY_LOADERS,
    "named_imports": $NAMED_IMPORTS,
    "default_imports": $DEFAULT_IMPORTS,
    "wildcard_imports": $WILDCARD_IMPORTS,
    "treeshake_score": $TREESHAKE_SCORE,
    "blocking_scripts": $BLOCKING_SCRIPTS,
    "blocking_styles": $BLOCKING_STYLES
  },
  "files": {
    "heavy_imports": "$OUTPUT_DIR/heavy-imports.txt",
    "large_images": "$OUTPUT_DIR/large-images.txt"
  },
  "recommendations": [
    "Implementar lazy loading para bibliotecas pesadas",
    "Otimizar imagens grandes",
    "Reduzir wildcard imports",
    "Adicionar defer/async aos scripts",
    "Configurar compressão Gzip/Brotli"
  ]
}
EOF

echo "📊 Análise completa exportada para JSON"
