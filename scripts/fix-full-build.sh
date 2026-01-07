#!/bin/bash
# Script de build com memória aumentada para projetos grandes

echo "🧠 Configurando memória do Node.js (8GB)..."
export NODE_OPTIONS="--max-old-space-size=8192"

echo "📦 Instalando dependências..."
npm ci --prefer-offline --no-audit

echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído!"
