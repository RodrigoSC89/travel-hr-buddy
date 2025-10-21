#!/bin/bash
echo "🧹 Limpando cache do Lovable + Vite..."
rm -rf node_modules/.vite dist .vercel_cache
echo "✅ Cache limpo com sucesso!"
