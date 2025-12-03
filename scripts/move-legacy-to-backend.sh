#!/bin/bash
# Script para mover arquivos Python legados para backend/

echo "🔄 Movendo arquivos Python para backend/..."

# Criar estrutura backend
mkdir -p backend/core
mkdir -p backend/modules
mkdir -p backend/pages

# Mover core Python
if [ -d "core" ] && [ -f "core/__init__.py" ]; then
    echo "  📁 Movendo core/ Python..."
    cp -r core/* backend/core/ 2>/dev/null || true
fi

# Mover arquivos Python de modules
if [ -d "modules" ]; then
    echo "  📁 Movendo modules/*.py..."
    cp modules/*.py backend/modules/ 2>/dev/null || true
    cp modules/requirements.txt backend/modules/ 2>/dev/null || true
fi

# Mover pages/api se existir
if [ -d "pages/api" ]; then
    echo "  📁 Movendo pages/api/..."
    cp -r pages/api/* backend/pages/ 2>/dev/null || true
fi

echo "✅ Arquivos Python movidos para backend/"
echo ""
echo "📝 Próximos passos manuais:"
echo "   1. Verificar se backend/ tem todos os arquivos necessários"
echo "   2. Remover core/, modules/*.py, pages/api/ da raiz"
echo "   3. Atualizar imports se necessário"
