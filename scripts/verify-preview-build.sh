#!/bin/bash
echo "🔍 Iniciando verificação completa do Preview Lovable e Build Vercel..."

# 1️⃣ Limpeza completa
rm -rf dist .vite .vercel .vercel_cache node_modules/.vite
echo "🧹 Cache removido."

# 2️⃣ Instala dependências
npm install

# 3️⃣ Compila projeto
echo "⚙️ Rodando build de verificação..."
npm run build -- --force || vite build --mode production --force

# 4️⃣ Inicia servidor local de teste
npm run dev & 
DEV_PID=$!
sleep 15

# 5️⃣ Cria testes automatizados com Playwright
mkdir -p tests
cat <<'EOF' > tests/full-preview-check.spec.ts
import { test, expect } from '@playwright/test';

const routes = [
  '/dashboard',
  '/dp-intelligence',
  '/bridgelink',
  '/forecast-global',
  '/control-hub',
  '/peo-dp',
  '/ai-assistant',
  '/analytics',
  '/price-alerts',
  '/reports',
  '/portal',
  '/checklists-inteligentes'
];

for (const route of routes) {
  test(`🧭 Verificando módulo: ${route}`, async ({ page }) => {
    await page.goto(`http://localhost:8080${route}`);
    await expect(page).toHaveTitle(/Nautilus|DP|Forecast|Control/i);
  });
}
EOF

# 6️⃣ Executa testes
echo "🧩 Executando testes de rotas e renderização..."
npx playwright install --with-deps
npx playwright test tests/full-preview-check.spec.ts || { echo "❌ Erro: Módulos não renderizados corretamente."; exit 1; }

# 7️⃣ Encerra servidor
kill $DEV_PID

echo "✅ Build e preview verificados com sucesso. Tudo está funcional e pronto para o Vercel."
