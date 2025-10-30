#!/bin/bash
echo "⚙️ Iniciando Validação Completa do Nautilus One (Lovable Preview + Build + Routes)"
echo "-------------------------------------------------------------"

# 1️⃣ Confirma PR e branch atual
echo "📦 Verificando branch..."
git branch

# 2️⃣ Atualiza dependências
echo "🔄 Atualizando dependências..."
npm ci || npm install

# 3️⃣ Limpa caches antigos e build anterior
echo "🧹 Limpando cache anterior..."
rm -rf node_modules/.vite dist .vercel_cache

# 4️⃣ Compila o projeto com logs detalhados
echo "⚙️ Rodando build de teste (Vite + PWA)..."
npm run build --verbose || { echo "❌ Falha no build - verificar vite.config.ts ou paths"; exit 1; }

# 5️⃣ Inicia o servidor local do Vite em background
echo "🌐 Iniciando preview local (porta 4173)..."
npm run preview -- --port 4173 &
DEV_PID=$!

# Aguarda servidor iniciar
echo "⏳ Aguardando inicialização do servidor..."
sleep 15

# 6️⃣ Instala Playwright e suas dependências
echo "🔍 Instalando Playwright..."
npx playwright install --with-deps

# 7️⃣ Cria script de teste de rotas
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
    await page.goto(`http://localhost:4173${route}`);
    await expect(page.locator('main, header, h1')).toBeVisible({ timeout: 10000 });
  });
}
EOF

# 8️⃣ Executa os testes de rotas
echo "🧭 Executando testes de rotas com Playwright..."
npx playwright test tests/preview.spec.ts || { echo "❌ Alguns módulos não renderizaram no preview"; kill $DEV_PID; exit 1; }

# 9️⃣ Fecha servidor local
echo "🧹 Encerrando servidor local..."
kill $DEV_PID

# 🔟 Simula build do Vercel local (opcional)
if command -v vercel >/dev/null 2>&1; then
  echo "🚀 Simulando build e deploy do Vercel localmente..."
  npx vercel build --prod || { echo "❌ Erro na simulação de build do Vercel"; exit 1; }
else
  echo "⚠️ CLI do Vercel não instalada — pulando simulação local"
fi

# 11️⃣ Relatório final
echo "✅ Validação completa do Lovable Preview concluída com sucesso!"
echo "Todos os módulos renderizados e rotas confirmadas."
