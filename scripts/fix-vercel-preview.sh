#!/usr/bin/env bash
set -e

echo "🧹 Limpando caches antigos..."
rm -rf .vite .vercel node_modules/.vite dist || true

echo "🔎 Verificando variáveis de ambiente..."
REQUIRED_VARS=("VITE_APP_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY" "VITE_MQTT_URL")
MISSING=()
for V in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!V}" ]; then
    MISSING+=("$V")
  fi
done
if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Faltam variáveis: ${MISSING[*]}"
  exit 1
fi

echo "⚙️ Reinstalando dependências..."
npm ci || npm install

echo "🏗️ Rodando build forçado..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build -- --force || npx vite build --mode production --force

echo "🚀 Preview pronto. Execute: npm run dev"
