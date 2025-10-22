#!/usr/bin/env bash
set -e
rm -rf node_modules .vite .vercel dist || true
npm install
npm run build --if-present
npm run test --if-present
echo "✅ Build e testes concluídos com sucesso."
