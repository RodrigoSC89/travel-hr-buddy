#!/bin/bash

# PATCH 854.0 - Clean React Cache Script
# This script removes all cached files that could cause React initialization issues

echo "🧹 Limpando cache do React e Vite..."

# Remove all Vite cache directories
rm -rf .vite-cache-v*
rm -rf .vite
rm -rf dist

# Remove node_modules/.vite
rm -rf node_modules/.vite

# Clear browser cache files
rm -rf .cache

echo "✅ Cache limpo com sucesso!"
echo ""
echo "📦 Próximos passos:"
echo "1. Execute: npm install --legacy-peer-deps"
echo "2. Execute: npm run dev"
echo ""
