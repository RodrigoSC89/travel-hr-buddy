#!/bin/bash
echo "⚙️ Iniciando Validação Completa do Nautilus One (Lovable Preview + Build + Routes)"
echo "-------------------------------------------------------------"

# 1️⃣ Confirma PR e branch atual
echo "📦 Verificando branch..."
git branch

# 2️⃣ Atualiza dependências
echo "🔄 Atualizando dependências..."
npm install

# 3️⃣ Limpa caches antigos e build anterior
echo "🧹 Limpando cache anterior..."
rm -rf node_modules/.vite dist .vercel_cache

# 4️⃣ Compila o projeto com logs detalhados
echo "⚙️ Rodando build de teste (Vite + PWA)..."
npm run build --verbose || { echo "❌ Falha no build - verificar vite.config.ts ou paths"; exit 1; }

# 5️⃣ Testa o preview local do Lovable
echo "🌐 Iniciando preview local (modo dev)..."
npm run dev &
DEV_PID=$!
sleep 10

# 6️⃣ Validação automática via Playwright
echo "🔍 Executando testes de rotas com Playwright..."
npx playwright install --with-deps
cat <<'EOF' > tests/preview.spec.ts
import { test, expect } from '@playwright/test';

const routes = [
  '/dashboard',
  '/dp-intelligence',
  '/bridgelink',
  '/forecast-global',
  '/control-hub',
  '/fmea-expert',
  '/peo-dp',
  '/documentos-ia',
  '/assistente-ia',
  '/analytics-avancado'
];

for (const route of routes) {
  test(`Rota ${route} deve renderizar corretamente`, async ({ page }) => {
    await page.goto(`http://localhost:4173${route}`);
    await expect(page).toHaveTitle(/Nautilus|DP|Forecast/i);
  });
}
EOF

npx playwright test tests/preview.spec.ts || { echo "❌ Alguns módulos não renderizaram no preview"; exit 1; }

# 7️⃣ Fecha servidor local
kill $DEV_PID

# 8️⃣ Simula build do Vercel (com preview)
echo "🚀 Simulando build e deploy do Vercel localmente..."
npx vercel build --prod || { echo "❌ Erro na simulação de build do Vercel"; exit 1; }

# 9️⃣ Relatório final
echo "✅ Validação completa do Lovable Preview concluída com sucesso!"
echo "Todos os módulos renderizados e rotas confirmadas."
