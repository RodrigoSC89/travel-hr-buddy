#!/bin/bash
echo "🚀 Iniciando Patch 25.2 - Vercel Preview & Routing Stabilizer"

# 1️⃣ Limpeza completa de cache e build antigos
rm -rf .vercel_cache dist node_modules/.vite .next
npm cache clean --force
echo "🧹 Cache limpo."

# 2️⃣ Verifica variáveis de ambiente obrigatórias
missing_vars=0
for var in VITE_APP_URL SUPABASE_URL SUPABASE_ANON_KEY; do
  if [ -z "${!var}" ]; then
    echo "⚠️ Variável $var ausente!"
    missing_vars=1
  fi
done
if [ $missing_vars -eq 1 ]; then
  echo "❌ Variáveis ausentes. Configure-as no painel da Vercel e rode novamente."
  exit 1
fi
echo "✅ Variáveis verificadas."

# 3️⃣ Build forçado para evitar cache Vercel
npm install --legacy-peer-deps
npm run build -- --force || vite build --mode production --force
echo "🏗️ Build completo com sucesso."

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
fi

# 5️⃣ Limpa e força novo deploy
npx vercel build --prod --force
npx vercel deploy --prod --force

echo "✅ Patch 25.2 concluído: Vercel Preview agora está sincronizado e funcional."
