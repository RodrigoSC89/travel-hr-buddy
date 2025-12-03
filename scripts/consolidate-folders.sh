#!/bin/bash

# Script de Consolidação de Pastas Duplicadas
# Consolida pastas que existem tanto na raiz quanto em src/

echo "🔄 Iniciando consolidação de pastas..."

# Verificar pastas duplicadas
check_duplicate() {
    if [ -d "$1" ] && [ -d "src/$1" ]; then
        echo "⚠️  Pasta duplicada encontrada: $1 e src/$1"
        return 0
    fi
    return 1
}

# Listar duplicatas
echo ""
echo "📋 Verificando pastas duplicadas..."
echo ""

DUPLICATES=0

if check_duplicate "modules"; then
    echo "   modules/ - Considere mover conteúdo para src/modules/"
    ((DUPLICATES++))
fi

if check_duplicate "pages"; then
    echo "   pages/ - Considere mover conteúdo para src/pages/"
    ((DUPLICATES++))
fi

if check_duplicate "core"; then
    echo "   core/ - Considere mover conteúdo para src/core/"
    ((DUPLICATES++))
fi

if check_duplicate "tests"; then
    echo "   tests/ - Considere mover conteúdo para src/tests/"
    ((DUPLICATES++))
fi

echo ""
if [ $DUPLICATES -eq 0 ]; then
    echo "✅ Nenhuma pasta duplicada encontrada!"
else
    echo "⚠️  $DUPLICATES pastas duplicadas encontradas."
    echo ""
    echo "Para consolidar manualmente:"
    echo "  1. Compare o conteúdo das pastas"
    echo "  2. Mova arquivos únicos para src/"
    echo "  3. Atualize imports se necessário"
    echo "  4. Remova pasta da raiz"
fi

echo ""
echo "📊 Estrutura atual:"
echo ""
echo "Pastas na raiz:"
ls -d */ 2>/dev/null | head -20

echo ""
echo "Pastas em src/:"
ls -d src/*/ 2>/dev/null | head -20
