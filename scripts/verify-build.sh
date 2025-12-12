#!/bin/bash

# Verificação de build para deploy no Vercel
# Este script garante que o build está pronto para produção

set -e  # Para em caso de erro

echo "🔍 Verificação de Build para Vercel"
echo "===================================="
echo ""

# 1. Verificar Node version
echo "1. Verificando Node version..."
NODE_VERSION=$(node -v)
echo "✅ Node version: $NODE_VERSION"
echo ""

# 2. Verificar npm version
echo "2. Verificando npm version..."
NPM_VERSION=$(npm -v)
echo "✅ npm version: $NPM_VERSION"
echo ""

# 3. Verificar se package.json existe
echo "3. Verificando package.json..."
if [ ! -f "package.json" ]; then
  echo "❌ ERRO: package.json não encontrado!"
  exit 1
fi
echo "✅ package.json encontrado"
echo ""

# 4. Limpar cache e node_modules
echo "4. Limpando cache..."
rm -rf node_modules/.vite .vite .vite-cache* dist
echo "✅ Cache limpo"
echo ""

# 5. Instalar dependências
echo "5. Instalando dependências..."
npm install --legacy-peer-deps
echo "✅ Dependências instaladas"
echo ""

# 6. Verificar TypeScript
echo "6. Verificando TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ TypeScript OK - Sem erros"
else
  echo "⚠️  Aviso: TypeScript tem erros"
fi
echo ""

# 7. Build de produção
echo "7. Executando build de produção..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
else
  echo "❌ ERRO: Build falhou!"
  exit 1
fi
echo ""

# 8. Verificar dist/
echo "8. Verificando dist/..."
if [ ! -d "dist" ]; then
  echo "❌ ERRO: Diretório dist/ não foi criado!"
  exit 1
fi
echo "✅ Diretório dist/ existe"
echo ""

# 9. Verificar index.html
echo "9. Verificando index.html..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ ERRO: dist/index.html não foi criado!"
  exit 1
fi
echo "✅ index.html existe"
echo ""

# 10. Verificar tamanho do bundle
echo "10. Verificando tamanho do bundle..."
BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo "📦 Tamanho total do dist/: $BUNDLE_SIZE"
echo ""

# 11. Listar arquivos principais
echo "11. Arquivos principais gerados:"
ls -lh dist/*.html 2>/dev/null || true
ls -lh dist/assets/*.js 2>/dev/null | head -10 || true
echo ""

# 12. Verificar se há erros no console
echo "12. Procurando por console.error no código..."
CONSOLE_ERRORS=$(grep -r "console\.error" dist/ 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_ERRORS" -gt "0" ]; then
  echo "⚠️  Aviso: $CONSOLE_ERRORS ocorrências de console.error encontradas"
else
  echo "✅ Sem console.error no build"
fi
echo ""

echo "===================================="
echo "✅ Verificação concluída com sucesso!"
echo "===================================="
echo ""
echo "Próximos passos:"
echo "1. Commit as alterações: git add . && git commit -m 'fix: Otimizar build para Vercel'"
echo "2. Push para o repositório: git push origin main"
echo "3. O Vercel irá fazer o deploy automaticamente"
echo ""
