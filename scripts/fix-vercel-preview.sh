#!/bin/bash
echo "🚀 Corrigindo build e sincronizando variáveis do Vercel..."

# Limpa cache antigo
rm -rf .vercel .vite dist node_modules/.vite

# Reinstala dependências
npm install

# Corrige imports duplicados
find src -name "*.tsx" -exec sed -i 's@import(.*)@React.lazy(() => import(&))@g' {} \;

# Recria build completo
npm run build -- --force || vite build --mode production --force

# Reinicia servidor de preview
npm run dev -- --force --clearScreen=false
