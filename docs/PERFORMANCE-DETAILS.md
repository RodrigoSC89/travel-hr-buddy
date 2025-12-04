# Detalhes das Melhorias de Performance e Otimização

> **Versão**: 3.3.0 | **Data**: Dezembro 2024

---

## 1. Build e Bundle

### Orçamento Implementado

| Recurso | Limite | Script de Validação |
|---------|--------|---------------------|
| Página inicial (gzip) | < 250 KB | `scripts/ci-performance-gate.sh` |
| Chunk individual | < 400 KB | `scripts/bundle-budget-check.sh` |
| CSS total (gzip) | < 40 KB | `scripts/ci-performance-gate.sh` |
| Assets totais | < 2.5 MB | Automatizado no CI |

### Estratégia de Chunks (vite.config.ts)

```
Chunks Críticos (carregados sempre):
├── core-react      → React + ReactDOM
├── core-router     → React Router
├── core-query      → TanStack Query
└── core-supabase   → Supabase SDK

Chunks Lazy (sob demanda):
├── ui-modals       → Dialogs, Sheets, Drawers
├── ui-popovers     → Selects, Dropdowns, Tooltips
├── charts-recharts → Gráficos Recharts
├── charts-chartjs  → Chart.js
├── map             → Mapbox GL
├── editor          → TipTap
├── motion          → Framer Motion
├── ai-ml           → TensorFlow, ONNX
├── 3d_xr           → Three.js, React Three Fiber
└── pdf-gen         → jsPDF, html2canvas
```

### Tree Shaking Reforçado

- **Lodash**: Imports granulares (`import debounce from 'lodash/debounce'`)
- **Radix UI**: Componentes importados individualmente
- **Lucide**: Ícones específicos, não a biblioteca inteira
- **Date-fns**: Funções isoladas

### Scripts de Validação

```bash
# Análise de bundle
npm run analyze

# Gate de CI (falha se exceder limites)
./scripts/ci-performance-gate.sh

# Verificação de orçamento
./scripts/bundle-budget-check.sh
```

---

## 2. Assets e Fontes

### Otimização de Imagens

| Formato | Uso | Compressão |
|---------|-----|------------|
| WebP | Fotos, screenshots | 80-85% qualidade |
| AVIF | Imagens hero, banners | 75-80% qualidade |
| SVG | Ícones, logos | Minificado, sem metadata |

### Configuração de Fontes (index.html)

```html
<!-- Preconnect para fontes críticas -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Fonte com swap para evitar FOIT -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Cache Agressivo (PWA - vite.config.ts)

```javascript
// Fontes: CacheFirst, 1 ano
// Imagens: CacheFirst, 30 dias  
// JS/CSS: StaleWhileRevalidate, 7 dias
// APIs: NetworkFirst, 5-10 minutos
```

---

## 3. Carregamento e UX

### Lazy Loading Implementado

```typescript
// Componentes pesados
const MapView = lazy(() => import('@/components/map/MapView'));
const ChartDashboard = lazy(() => import('@/components/charts/Dashboard'));
const Editor = lazy(() => import('@/components/editor/RichTextEditor'));
const ThreeScene = lazy(() => import('@/components/3d/Scene'));

// Com Suspense e fallback
<Suspense fallback={<Skeleton className="h-64" />}>
  <MapView />
</Suspense>
```

### Virtualização de Listas

```typescript
// src/hooks/useVirtualizedList.ts
import { useVirtualizer } from '@tanstack/react-virtual';

// Para listas com 100+ itens
const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // altura estimada
  overscan: 5, // itens extras renderizados
});
```

### Resource Hints (index.html)

```html
<!-- Prefetch de rotas críticas -->
<link rel="prefetch" href="/dashboard">
<link rel="prefetch" href="/hr/crew-management">

<!-- Preload de dados críticos -->
<link rel="preload" href="/api/user/profile" as="fetch" crossorigin>
```

---

## 4. Dados e Rede

### React Query Otimizado (src/lib/query-client-config.ts)

```typescript
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache agressivo
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
      
      // Offline first
      networkMode: 'offlineFirst',
      
      // Retry inteligente
      retry: (failureCount, error) => {
        if (error.status >= 400 && error.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      
      // Reduzir refetches em conexões lentas
      refetchOnWindowFocus: !isSlowConnection(),
    },
  },
};
```

### Compressão e Paginação

```typescript
// Paginação server-side
const { data } = await supabase
  .from('crew_members')
  .select('id, name, role, status')
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('name');

// Campos selecionados (não SELECT *)
```

### Background Tab Handling

```typescript
// src/hooks/useVisibilityAwarePolling.ts
const useVisibilityAwarePolling = (callback, interval) => {
  useEffect(() => {
    let timeoutId;
    
    const poll = () => {
      if (document.visibilityState === 'visible') {
        callback();
        timeoutId = setTimeout(poll, interval);
      } else {
        // Aumenta intervalo quando em background
        timeoutId = setTimeout(poll, interval * 5);
      }
    };
    
    poll();
    return () => clearTimeout(timeoutId);
  }, [callback, interval]);
};
```

---

## 5. PWA e Offline

### Service Worker (vite.config.ts)

```javascript
workbox: {
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
  runtimeCaching: [
    // Fontes: CacheFirst, 1 ano
    {
      urlPattern: /fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: { maxAgeSeconds: 365 * 24 * 60 * 60 }
    },
    
    // APIs: NetworkFirst, timeout rápido
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: { 
        networkTimeoutSeconds: 8,
        maxAgeSeconds: 5 * 60 
      }
    },
    
    // Supabase: NetworkFirst
    {
      urlPattern: /supabase\.co\/rest/,
      handler: 'NetworkFirst',
      options: { 
        networkTimeoutSeconds: 6,
        maxAgeSeconds: 10 * 60 
      }
    }
  ],
  
  skipWaiting: true,
  clientsClaim: true
}
```

### Feedback em Redes Lentas

```typescript
// src/hooks/useNetworkAwareLoading.ts
const { isSlowConnection, effectiveType, isOnline } = useNetworkState();

if (isSlowConnection) {
  // Mostrar indicador de rede lenta
  // Reduzir qualidade de imagens
  // Desabilitar prefetch
}

if (!isOnline) {
  toast.warning('Você está offline. Dados podem estar desatualizados.');
}
```

---

## 6. Observabilidade e Gates

### Web Vitals (src/lib/web-vitals-reporter.ts)

```typescript
// Métricas coletadas
onCLS(handleVital);  // Cumulative Layout Shift
onLCP(handleVital);  // Largest Contentful Paint
onINP(handleVital);  // Interaction to Next Paint
onTTFB(handleVital); // Time to First Byte
onFCP(handleVital);  // First Contentful Paint

// Thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
};
```

### Lighthouse CI (lighthouserc-2mb.json)

```json
{
  "settings": {
    "throttling": {
      "rttMs": 150,
      "throughputKbps": 2048,  // 2Mb
      "cpuSlowdownMultiplier": 2
    }
  },
  "assertions": {
    "first-contentful-paint": ["error", { "maxNumericValue": 3500 }],
    "largest-contentful-paint": ["error", { "maxNumericValue": 4500 }],
    "total-blocking-time": ["error", { "maxNumericValue": 500 }],
    "uses-text-compression": ["error", { "minScore": 1 }]
  }
}
```

### Gates de CI

```bash
# Pipeline de validação
npm run lint              # ESLint
npm run type-check        # TypeScript
npm run test              # Vitest
./scripts/ci-performance-gate.sh  # Bundle budget
npx lhci autorun          # Lighthouse

# Relatório semanal
node scripts/weekly-report.cjs
```

---

## 7. Arquivos Implementados

| Arquivo | Propósito |
|---------|-----------|
| `src/lib/llm-optimizer.ts` | Cache, retry, seleção de modelo para LLMs |
| `src/lib/query-client-config.ts` | React Query otimizado |
| `src/lib/pii-sanitizer.ts` | Sanitização de PII |
| `src/lib/web-vitals-reporter.ts` | Coleta de Core Web Vitals |
| `src/hooks/useNetworkAwareLoading.ts` | Hooks adaptativos à rede |
| `scripts/ci-performance-gate.sh` | Gate de CI para bundle |
| `scripts/validate-api-keys.cjs` | Validação de ambiente |
| `scripts/weekly-report.cjs` | Relatório de qualidade |
| `lighthouserc-2mb.json` | Lighthouse para 2Mb |

---

## 8. Comandos Úteis

```bash
# Build e análise
npm run build
npm run analyze

# Validação de performance
./scripts/ci-performance-gate.sh
./scripts/bundle-budget-check.sh

# Lighthouse
npx lhci autorun --config=lighthouserc.json
npx lhci autorun --config=lighthouserc-2mb.json

# Testes
npm run test
npm run test:coverage

# Relatórios
node scripts/weekly-report.cjs
node scripts/validate-api-keys.cjs

# Housekeeping
node scripts/clean-console-logs.cjs --dry-run
```

---

## 9. Métricas Target

| Métrica | Target (Desktop) | Target (2Mb) |
|---------|------------------|--------------|
| FCP | < 1.5s | < 3.5s |
| LCP | < 2.0s | < 4.5s |
| CLS | < 0.1 | < 0.1 |
| INP | < 200ms | < 300ms |
| TTFB | < 600ms | < 1.5s |
| TTI | < 3s | < 6s |

---

*Documento atualizado - Nautilus One v3.3.0*
