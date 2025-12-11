#!/bin/bash
# Script de Análise de Rotas do Nautilus One
# FASE A - Varredura Técnica Final
# Criado: 11 de Dezembro de 2025

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/analysis-reports"
OUTPUT_FILE="$OUTPUT_DIR/routes-analysis.json"

echo "🔍 Análise de Rotas - Nautilus One"
echo "================================="
echo ""

# Criar diretório de relatórios
mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_ROOT"

echo "📊 1. Analisando rotas em App.tsx..."
ROUTES_IN_APP=$(grep -rn "<Route" src/App.tsx | wc -l)
echo "   Rotas encontradas em App.tsx: $ROUTES_IN_APP"

echo "📊 2. Analisando registry.ts..."
MODULES_IN_REGISTRY=$(grep -rn "route:" src/modules/registry.ts | wc -l)
echo "   Módulos registrados: $MODULES_IN_REGISTRY"

echo "📊 3. Identificando componentes de página..."
PAGE_COMPONENTS=$(find src/pages -name "*.tsx" -o -name "*.ts" | wc -l)
echo "   Componentes de página encontrados: $PAGE_COMPONENTS"

echo "📊 4. Identificando páginas órfãs (não conectadas a rotas)..."
echo "   Analisando imports em App.tsx e routers..."

# Criar lista de páginas
find src/pages -name "*.tsx" | sed 's|src/pages/||' | sed 's|\.tsx||' > "$OUTPUT_DIR/all-pages.txt"

# Buscar páginas importadas
grep -rh "from.*pages" src/App.tsx src/routers 2>/dev/null | 
  sed 's/.*pages\///' | 
  sed "s/[\"';].*\$//" | 
  sort -u > "$OUTPUT_DIR/imported-pages.txt" || true

echo "📊 5. Verificando error boundaries..."
ERROR_BOUNDARIES=$(grep -rn "ErrorBoundary" src/App.tsx src/routers | wc -l)
echo "   Error boundaries encontrados: $ERROR_BOUNDARIES"

echo "📊 6. Verificando fallbacks..."
FALLBACKS=$(grep -rn "fallback" src/App.tsx src/routers | wc -l)
NOT_FOUND=$(grep -rn "NotFound\|404" src/App.tsx src/routers | wc -l)
echo "   Fallbacks encontrados: $FALLBACKS"
echo "   NotFound/404 handlers: $NOT_FOUND"

echo "📊 7. Analisando lazy loading..."
LAZY_ROUTES=$(grep -rn "React.lazy\|lazy(" src/App.tsx src/routers | wc -l)
echo "   Rotas com lazy loading: $LAZY_ROUTES"

echo "📊 8. Buscando rotas quebradas (TODO, FIXME, BUG)..."
BROKEN_ROUTES=$(grep -rn "TODO\|FIXME\|BUG" src/App.tsx src/routers src/modules/registry.ts | wc -l)
echo "   Comentários indicando problemas: $BROKEN_ROUTES"

echo "📊 9. Verificando redirecionamentos..."
REDIRECTS=$(grep -rn "Redirect\|Navigate" src/App.tsx src/routers | wc -l)
echo "   Redirecionamentos encontrados: $REDIRECTS"

echo "📊 10. Analisando rotas dinâmicas..."
DYNAMIC_ROUTES=$(grep -rn "/:" src/App.tsx src/routers src/modules/registry.ts | wc -l)
echo "   Rotas dinâmicas encontradas: $DYNAMIC_ROUTES"

echo ""
echo "✅ Análise de rotas concluída!"
echo "📁 Relatório salvo em: $OUTPUT_DIR/routes-analysis.json"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revisar páginas órfãs em $OUTPUT_DIR/all-pages.txt"
echo "   2. Verificar rotas sem error boundaries"
echo "   3. Analisar comentários TODO/FIXME"
echo ""

# Gerar JSON de saída
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "analysis": {
    "routes_in_app": $ROUTES_IN_APP,
    "modules_in_registry": $MODULES_IN_REGISTRY,
    "page_components": $PAGE_COMPONENTS,
    "error_boundaries": $ERROR_BOUNDARIES,
    "fallbacks": $FALLBACKS,
    "not_found_handlers": $NOT_FOUND,
    "lazy_routes": $LAZY_ROUTES,
    "broken_routes_markers": $BROKEN_ROUTES,
    "redirects": $REDIRECTS,
    "dynamic_routes": $DYNAMIC_ROUTES
  },
  "files": {
    "all_pages": "$OUTPUT_DIR/all-pages.txt",
    "imported_pages": "$OUTPUT_DIR/imported-pages.txt"
  }
}
EOF

echo "📊 Análise completa exportada para JSON"