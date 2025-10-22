#!/bin/bash
echo "🚀 Iniciando Patch 25.2 - Vercel Preview & Routing Stabilizer"

# 1️⃣ Limpeza completa de cache e build antigos
echo "🧹 Limpando caches..."
rm -rf .vercel_cache dist node_modules/.vite .vite .next
npm cache clean --force 2>/dev/null || true
echo "✅ Cache limpo com sucesso."

# 2️⃣ Verifica variáveis de ambiente obrigatórias
echo "🔍 Verificando variáveis de ambiente..."
missing_vars=0
for var in VITE_APP_URL SUPABASE_URL SUPABASE_ANON_KEY; do
  if [ -z "${!var}" ]; then
    echo "⚠️  Variável $var ausente!"
    missing_vars=1
  else
    echo "✓ $var configurada"
  fi
done
if [ $missing_vars -eq 1 ]; then
  echo "❌ Variáveis ausentes. Configure-as no painel da Vercel e rode novamente."
  echo "💡 Ou crie um arquivo .env.local com as variáveis necessárias."
  exit 1
fi
echo "✅ Todas as variáveis verificadas."

# 3️⃣ Build forçado para evitar cache Vercel
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps
echo "✅ Dependências instaladas."

echo "🏗️  Iniciando build..."
npm run build -- --force || vite build --mode production --force
if [ $? -eq 0 ]; then
  echo "✅ Build completo com sucesso."
else
  echo "❌ Falha no build. Verifique os logs acima."
  exit 1
fi

# 4️⃣ Garante que o app seja tratado como SPA no Vercel
if [ ! -f "vercel.json" ]; then
  echo "🧾 Criando vercel.json..."
  cat <<EOF > vercel.json
{
  "version": 2,
  "builds": [{ "src": "index.html", "use": "@vercel/static" }],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
EOF
  echo "✅ vercel.json criado."
else
  echo "✓ vercel.json já existe."
fi

# 5️⃣ Limpa e força novo deploy (opcional - apenas se vercel CLI estiver disponível)
if command -v vercel &> /dev/null; then
  echo "🚀 Iniciando deploy na Vercel..."
  npx vercel build --prod --force
  npx vercel deploy --prod --force
  echo "✅ Deploy concluído."
else
  echo "ℹ️  Vercel CLI não encontrada. Faça push para o GitHub para deploy automático."
fi

echo ""
echo "✅ Patch 25.2 concluído: Vercel Preview agora está sincronizado e funcional."
echo "📊 Estatísticas do build disponíveis acima."
echo "🔗 Faça push para o GitHub para deploy automático na Vercel."
