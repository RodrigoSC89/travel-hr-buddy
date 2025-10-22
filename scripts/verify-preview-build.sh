#!/bin/bash
set -e  # Exit on error

echo "🔍 Iniciando verificação completa do Preview Lovable e Build Vercel..."

# 1️⃣ Limpeza completa
echo "🧹 Removendo cache e arquivos temporários..."
rm -rf dist .vite .vercel .vercel_cache node_modules/.vite

# 2️⃣ Instala dependências
echo "📦 Instalando dependências..."
npm install

# 3️⃣ Compila projeto
echo "⚙️ Rodando build de verificação..."
npm run build

# 4️⃣ Verifica TypeScript
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

# 5️⃣ Inicia servidor local de teste
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev &
DEV_PID=$!

# Função de limpeza para garantir que o servidor seja encerrado
cleanup() {
  echo "🧹 Encerrando servidor..."
  kill $DEV_PID 2>/dev/null || true
  wait $DEV_PID 2>/dev/null || true
}
trap cleanup EXIT

# Aguarda o servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 20

# Verifica se o servidor está rodando
if ! curl -s http://localhost:8080 > /dev/null; then
  echo "❌ Erro: Servidor não está respondendo na porta 8080"
  exit 1
fi

# 6️⃣ Instala Playwright browsers se necessário
echo "🎭 Verificando instalação do Playwright..."
npx playwright install --with-deps chromium

# 7️⃣ Executa testes
echo "🧩 Executando testes de rotas e renderização..."
npx playwright test tests/full-preview-check.spec.ts --project=chromium

echo ""
echo "✅ Build e preview verificados com sucesso!"
echo "✅ Todos os módulos estão funcionais e prontos para o Vercel."
echo "✅ TypeScript Safe Mode: OK"
echo "✅ Rotas renderizando sem erro: OK"
echo "✅ Tela branca: Eliminada"
