#!/bin/bash

# Script de Limpeza de Documentação
# Move arquivos MD antigos da raiz para archive/legacy-docs/

echo "🧹 Iniciando limpeza de documentação..."

# Criar estrutura de pastas
mkdir -p archive/legacy-docs/{ai,api,features,deployment,patches,misc}

# Mover arquivos de IA
echo "📦 Movendo documentação de IA..."
mv AI_*.md archive/legacy-docs/ai/ 2>/dev/null || true

# Mover arquivos de API
echo "📦 Movendo documentação de API..."
mv API_*.md archive/legacy-docs/api/ 2>/dev/null || true

# Mover arquivos de deploy
echo "📦 Movendo documentação de deploy..."
mv DEPLOY*.md archive/legacy-docs/deployment/ 2>/dev/null || true
mv DEPLOYMENT*.md archive/legacy-docs/deployment/ 2>/dev/null || true

# Mover arquivos de patches
echo "📦 Movendo notas de patches..."
mv PATCH*.md archive/legacy-docs/patches/ 2>/dev/null || true
mv *_PATCH_*.md archive/legacy-docs/patches/ 2>/dev/null || true

# Mover arquivos de features
echo "📦 Movendo documentação de features..."
mv ASSISTANT_*.md archive/legacy-docs/features/ 2>/dev/null || true
mv AUDIT_*.md archive/legacy-docs/features/ 2>/dev/null || true
mv DOCUMENT_*.md archive/legacy-docs/features/ 2>/dev/null || true
mv COLLABORATION_*.md archive/legacy-docs/features/ 2>/dev/null || true
mv COMPLIANCE_*.md archive/legacy-docs/features/ 2>/dev/null || true
mv DASHBOARD_*.md archive/legacy-docs/features/ 2>/dev/null || true

# Mover resto para misc
echo "📦 Movendo documentação restante..."
mv *_IMPLEMENTATION*.md archive/legacy-docs/misc/ 2>/dev/null || true
mv *_QUICKREF*.md archive/legacy-docs/misc/ 2>/dev/null || true
mv *_VISUAL*.md archive/legacy-docs/misc/ 2>/dev/null || true
mv *_SUMMARY*.md archive/legacy-docs/misc/ 2>/dev/null || true
mv *_GUIDE*.md archive/legacy-docs/misc/ 2>/dev/null || true
mv *_README*.md archive/legacy-docs/misc/ 2>/dev/null || true

# Manter apenas os essenciais na raiz
echo "📌 Mantendo arquivos essenciais na raiz..."
[ -f archive/legacy-docs/misc/README.md ] && mv archive/legacy-docs/misc/README.md ./
[ -f archive/legacy-docs/misc/CHANGELOG.md ] && mv archive/legacy-docs/misc/CHANGELOG.md ./
[ -f archive/legacy-docs/misc/CONTRIBUTING.md ] && mv archive/legacy-docs/misc/CONTRIBUTING.md ./

# Contar arquivos movidos
MOVED_COUNT=$(find archive/legacy-docs -name "*.md" | wc -l)

echo ""
echo "✅ Limpeza concluída!"
echo "📊 $MOVED_COUNT arquivos movidos para archive/legacy-docs/"
echo ""
echo "📖 Documentação atual está em: docs/"
echo "📦 Documentação antiga está em: archive/legacy-docs/"
