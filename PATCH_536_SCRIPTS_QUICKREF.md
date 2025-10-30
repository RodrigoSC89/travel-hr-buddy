# PATCH 536 – Quick Reference Scripts
## Scripts Úteis para Diagnóstico e Otimização

---

## 📊 SCRIPTS DE ANÁLISE

### 1. Contar Arquivos com @ts-nocheck

```bash
# Total de arquivos com @ts-nocheck
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l

# Listar todos os arquivos
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | sort

# Por categoria
echo "AI Modules:"
find src/ai -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l

echo "Components:"
find src/components -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l

echo "Services:"
find src/services -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l
```

### 2. Análise de Bundle Size

```bash
# Build com análise
npm run build

# Ver tamanho dos chunks
ls -lh dist/assets/*.js | sort -k5 -h

# Top 10 maiores arquivos
ls -lh dist/assets/*.js | sort -k5 -hr | head -10
```

### 3. Verificar useEffect com Problemas

```bash
# useEffect com setInterval sem clearInterval
grep -r "useEffect" src --include="*.tsx" -A 10 | \
  grep -B 5 "setInterval" | \
  grep -v "clearInterval" | \
  head -20

# useEffect com setTimeout sem clearTimeout
grep -r "useEffect" src --include="*.tsx" -A 10 | \
  grep -B 5 "setTimeout" | \
  grep -v "clearTimeout" | \
  head -20
```

### 4. Análise de ESLint

```bash
# Contar warnings por tipo
npm run lint 2>&1 | grep "warning" | \
  awk '{print $4}' | sort | uniq -c | sort -nr

# Arquivos com mais problemas
npm run lint 2>&1 | grep -E "^/" | \
  cut -d: -f1 | sort | uniq -c | sort -nr | head -10

# Total de problemas
npm run lint 2>&1 | tail -1
```

---

## 🔧 SCRIPTS DE CORREÇÃO

### 1. Fix ESLint Automático

```bash
# Fix tudo que pode ser auto-corrigido
npm run lint:fix

# Fix apenas um diretório
npx eslint src/services --fix
npx eslint src/components --fix
```

### 2. Remover @ts-nocheck de um Arquivo

```bash
# Remover de um arquivo específico
sed -i '/@ts-nocheck/d' src/services/example.ts

# Remover de todos os arquivos em um diretório
find src/services -name "*.ts" -exec sed -i '/@ts-nocheck/d' {} \;

# ATENÇÃO: Sempre verificar se o código continua compilando depois!
npm run type-check
```

### 3. Build com Diagnósticos

```bash
# Build com informações detalhadas de performance
npm run build -- --mode=production

# Type check com estatísticas estendidas
tsc --noEmit --extendedDiagnostics

# Build com profile (para análise de performance)
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

---

## 🎯 SCRIPTS DE VALIDAÇÃO

### 1. Verificação Completa

```bash
#!/bin/bash
echo "=== Verificação Completa do Sistema ==="
echo ""

echo "1. Type Check..."
npm run type-check
if [ $? -eq 0 ]; then
  echo "✅ Type check passou"
else
  echo "❌ Type check falhou"
  exit 1
fi

echo ""
echo "2. Build..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build passou"
else
  echo "❌ Build falhou"
  exit 1
fi

echo ""
echo "3. Tests..."
npm run test:unit
if [ $? -eq 0 ]; then
  echo "✅ Tests passaram"
else
  echo "⚠️ Tests com problemas (verificar)"
fi

echo ""
echo "4. Lint..."
npm run lint 2>&1 | tail -5

echo ""
echo "=== Verificação Completa ==="
```

### 2. Check Performance

```bash
#!/bin/bash
echo "=== Performance Check ==="
echo ""

# Build time
echo "Build time:"
time npm run build 2>&1 | grep "built in"

# Bundle sizes
echo ""
echo "Top 5 maiores bundles:"
ls -lh dist/assets/*.js | sort -k5 -hr | head -5

# Total size
echo ""
echo "Tamanho total do dist:"
du -sh dist/
```

### 3. Check Memory Leaks

```bash
# Executar com Node memory profiling
node --expose-gc --max-old-space-size=4096 \
  node_modules/.bin/vite build --mode production

# Ou com heap dump
node --heap-prof node_modules/.bin/vite build
```

---

## 🚀 SCRIPTS DE OTIMIZAÇÃO

### 1. Lazy Loading Setup

```typescript
// Criar arquivo: src/lib/lazy-loaders.ts

import { lazy } from "react";

// Mapbox Lazy Loading
export const lazyMapbox = () => import("mapbox-gl");

// TensorFlow Lazy Loading
export const lazyTensorflow = () => import("@tensorflow/tfjs");

// MQTT Lazy Loading
export const lazyMqtt = () => import("mqtt");

// Three.js Lazy Loading
export const lazyThree = () => import("three");

// Uso:
// const mapboxgl = await lazyMapbox();
```

### 2. Code Splitting Config

```typescript
// Adicionar ao vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-tensorflow': ['@tensorflow/tfjs'],
          'vendor-mapbox': ['mapbox-gl'],
          'vendor-mqtt': ['mqtt'],
          'vendor-three': ['three'],
          
          // Chart libraries
          'vendor-charts': ['chart.js', 'recharts'],
          
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // 1MB
  }
});
```

### 3. Remover Unused Dependencies

```bash
# Instalar ferramenta
npm install -g depcheck

# Verificar dependências não usadas
depcheck

# Remover dependências específicas
npm uninstall <package-name>
```

---

## 📈 SCRIPTS DE MONITORAMENTO

### 1. Performance Metrics

```bash
# Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse
lhci autorun --collect.url=http://localhost:5173

# Chrome DevTools Performance
# Abrir no navegador e usar DevTools > Performance
```

### 2. Bundle Analysis

```bash
# Instalar analyzer
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.ts:
# import { visualizer } from 'rollup-plugin-visualizer';
# plugins: [visualizer({ open: true })]

# Build com análise
npm run build
# Abrirá stats.html automaticamente
```

### 3. Type Coverage

```bash
# Instalar
npm install -g type-coverage

# Rodar análise
type-coverage --detail

# Ver arquivos com pior cobertura
type-coverage --detail | sort -k2 -n | head -20
```

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### 1. VSCode Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "wix.vscode-import-cost",
    "VisualStudioExptTeam.vscodeintellicode"
  ]
}
```

### 2. Package Scripts Úteis

```json
// package.json - adicionar:
{
  "scripts": {
    "analyze": "npm run build && open dist/stats.html",
    "profile": "tsc --noEmit --extendedDiagnostics",
    "check:deps": "depcheck",
    "check:size": "npm run build && du -sh dist/",
    "check:all": "npm run type-check && npm run lint && npm run test:unit"
  }
}
```

---

## 📝 CHECKLIST RÁPIDO

### Antes de Fazer Deploy

```bash
# 1. Verificar tipos
npm run type-check

# 2. Run linter
npm run lint

# 3. Run tests
npm run test:unit

# 4. Build production
npm run build

# 5. Verificar bundle size
ls -lh dist/assets/*.js | sort -k5 -hr | head -5

# 6. Test preview local
npm run preview
# Abrir http://localhost:4173 e testar navegação
```

### Depois de Mudanças Grandes

```bash
# 1. Clean build
npm run clean
npm install

# 2. Full check
npm run type-check
npm run build
npm run test:unit

# 3. Verificar @ts-nocheck não aumentou
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@ts-nocheck" | wc -l
```

---

## 🆘 TROUBLESHOOTING

### Build Falha

```bash
# Limpar cache e rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Type Check Falha

```bash
# Ver todos os erros
tsc --noEmit --pretty

# Ver apenas arquivos com erro
tsc --noEmit 2>&1 | grep "error TS"
```

### Memory Issues no Build

```bash
# Aumentar memória disponível
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

### ESLint Muito Lento

```bash
# Lint apenas changed files
npx eslint $(git diff --name-only --diff-filter=d | grep -E '\.(ts|tsx)$')
```

---

**Última Atualização:** 2025-10-30
**Versão:** PATCH 536 v1.0
