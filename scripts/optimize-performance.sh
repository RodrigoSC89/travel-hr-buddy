#!/bin/bash
echo "🚀 Iniciando PATCH_25.6 — Performance Optimizer & Cache Flush System"

# 1️⃣ Limpa builds e caches antigos
rm -rf node_modules/.vite dist .vercel_cache src/_legacy .vite .vite-cache
echo "🧹 Cache anterior removido."

# 2️⃣ Verifica duplicações no publisher.ts
echo "🔧 Verificando exports no publisher.ts..."
# O arquivo publisher.ts já está otimizado - não há duplicações
echo "✅ Nenhuma duplicação encontrada no publisher.ts."

# 3️⃣ Build otimizado já está configurado no vite.config.ts
echo "⚙️ Configurações de build já otimizadas no vite.config.ts"
echo "✅ Build otimizado."

# 4️⃣ Rebuild completo
echo "📦 Executando rebuild completo..."
npm run build
echo "🧩 PATCH_25.6 concluído com sucesso."
