#!/bin/bash
echo "⚙️ Iniciando Validação Completa do Nautilus One (Lovable Preview + Build + Routes)"
echo "-------------------------------------------------------------"

echo "📦 Verificando branch..."
git branch

echo "🔄 Atualizando dependências..."
npm ci || npm install

echo "🧹 Limpando cache anterior..."
rm -rf node_modules/.vite dist .vercel_cache

echo "⚙️ Rodando build de teste..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build --verbose || { echo "❌ Falha no build - verificar vite.config.ts ou paths"; exit 1; }

echo "🌐 Iniciando preview local (porta 5173)..."
npm run preview -- --port 5173 &
DEV_PID=$!
sleep 15

echo "🔍 Instalando Playwright..."
npx playwright install --with-deps

cat <<'EOF' > tests/preview.spec.ts
import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/dashboard',
  '/dp-intelligence',
  '/bridgelink',
  '/forecast',
  '/control-hub',
  '/peo-dp',
  '/peotram',
  '/checklists',
  '/analytics',
  '/intelligent-documents',
  '/ai-assistant'
];

for (const route of routes) {
  test(`Rota ${route} deve renderizar corretamente`, async ({ page }) => {
    await page.goto(`http://localhost:5173${route}`);
    await expect(page.locator('main, header, h1')).toBeVisible({ timeout: 10000 });
  });
}
EOF

echo "🧭 Executando testes de rotas com Playwright..."
npx playwright test tests/preview.spec.ts || { echo "❌ Alguns módulos falharam no preview"; kill $DEV_PID; exit 1; }

echo "🧹 Encerrando servidor local..."
kill $DEV_PID

if command -v vercel >/dev/null 2>&1; then
  echo "🚀 Simulando build e deploy do Vercel localmente..."
  npx vercel build --prod || { echo "❌ Erro na simulação de build do Vercel"; exit 1; }
else
  echo "⚠️ CLI do Vercel não instalada — pulando simulação local"
fi

echo "✅ Validação completa do Lovable Preview concluída com sucesso!"
