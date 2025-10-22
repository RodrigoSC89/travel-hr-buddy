#!/usr/bin/env bash
set -e
echo "🧹 Limpando cache e preparando ambiente..."
rm -rf .vite .vercel node_modules/.vite dist || true
npm ci || npm install
export NODE_OPTIONS="--max-old-space-size=4096"
echo "🏗️ Rodando build..."
npm run build -- --force

