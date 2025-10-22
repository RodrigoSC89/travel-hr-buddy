#!/bin/bash
echo "🚀 Iniciando Patch 25.2 - Vercel Preview & Routing Stabilizer"

# 1️⃣ Limpeza completa de cache e build antigos
echo "🧹 Limpando cache e builds antigos..."
rm -rf .vercel_cache dist node_modules/.vite .next .vite-cache
npm cache clean --force
echo "✅ Cache limpo."

# 2️⃣ Verifica variáveis de ambiente obrigatórias
echo "🔍 Verificando variáveis de ambiente..."
missing_vars=0

# Lista de variáveis essenciais para verificação
required_vars=(
  "VITE_APP_URL"
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_PUBLISHABLE_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️ Variável $var ausente!"
    missing_vars=1
  else
    echo "✓ $var configurada"
  fi
done

if [ $missing_vars -eq 1 ]; then
  echo ""
  echo "❌ Variáveis ausentes detectadas."
  echo "📝 Configure-as no painel da Vercel ou no arquivo .env e rode novamente."
  echo ""
  echo "Para configurar no Vercel:"
  echo "  1. Acesse https://vercel.com/seu-projeto/settings/environment-variables"
  echo "  2. Adicione as variáveis ausentes"
  echo "  3. Execute: vercel env pull"
  echo ""
  exit 1
fi

echo "✅ Todas as variáveis essenciais estão configuradas."

# 3️⃣ Instalação de dependências
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "❌ Falha na instalação de dependências"
  exit 1
fi
echo "✅ Dependências instaladas."

# 4️⃣ Build forçado para evitar cache Vercel
echo "🏗️ Iniciando build de produção..."
npm run build -- --force || vite build --mode production --force
if [ $? -ne 0 ]; then
  echo "❌ Falha no build"
  exit 1
fi
echo "✅ Build completo com sucesso."

# 5️⃣ Garante que o app seja tratado como SPA no Vercel
if [ ! -f "vercel.json" ]; then
  echo "🧾 Criando vercel.json..."
  cat <<EOF > vercel.json
{
  "version": 2,
  "builds": [{ "src": "index.html", "use": "@vercel/static" }],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_APP_URL": "@vite_app_url",
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@vite_supabase_publishable_key",
    "VITE_ENABLE_SAFE_LAZY_IMPORT": "true"
  }
}
EOF
  echo "✅ vercel.json criado."
else
  echo "✓ vercel.json já existe."
fi

# 6️⃣ Verificação de integridade do build
echo "🔍 Verificando integridade do build..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Build incompleto: index.html não encontrado"
  exit 1
fi

if [ ! -d "dist/assets" ]; then
  echo "❌ Build incompleto: pasta assets não encontrada"
  exit 1
fi

echo "✅ Build verificado com sucesso."

# 7️⃣ Estatísticas do build
echo ""
echo "📊 Estatísticas do Build:"
echo "  - Tamanho do dist: $(du -sh dist 2>/dev/null | cut -f1)"
echo "  - Arquivos gerados: $(find dist -type f 2>/dev/null | wc -l)"
echo ""

# 8️⃣ Deploy (opcional - apenas se vercel CLI estiver instalado)
if command -v vercel &> /dev/null; then
  echo "🚀 Vercel CLI detectado."
  read -p "Deseja fazer deploy agora? (s/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🚀 Iniciando deploy..."
    vercel build --prod --force
    vercel deploy --prod --force
    echo "✅ Deploy concluído."
  else
    echo "ℹ️ Deploy pulado. Para fazer deploy manualmente, execute:"
    echo "   vercel build --prod --force && vercel deploy --prod --force"
  fi
else
  echo "ℹ️ Vercel CLI não instalado. Para fazer deploy:"
  echo "   1. Instale: npm i -g vercel"
  echo "   2. Execute: vercel build --prod --force && vercel deploy --prod --force"
fi

echo ""
echo "✅ Patch 25.2 concluído com sucesso!"
echo ""
echo "📋 Resumo:"
echo "  ✓ Cache limpo"
echo "  ✓ Variáveis verificadas"
echo "  ✓ Dependências instaladas"
echo "  ✓ Build de produção completo"
echo "  ✓ Configuração SPA verificada"
echo ""
echo "🎯 Próximos passos:"
echo "  1. Verifique o build localmente: npm run preview"
echo "  2. Faça commit das mudanças: git add . && git commit -m 'PATCH_25.2: Vercel Preview & Routing Stabilizer'"
echo "  3. Push para deploy automático: git push"
echo ""
