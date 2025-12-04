# Arquitetura Offline-First para 2 Mbps

## Análise de Pontos Críticos

### 🔴 Gargalos Identificados

| Área | Problema | Impacto | Prioridade |
|------|----------|---------|------------|
| **Bundle Size** | Chunks pesados (charts, maps, 3D) | +500KB download | Alta |
| **Imagens** | Formatos não otimizados | +200KB por imagem | Alta |
| **Fontes** | 3 famílias de fontes (Inter, Playfair, JetBrains) | +300KB | Média |
| **API Calls** | Múltiplas requisições paralelas | Congestão de rede | Alta |
| **Cache** | Estratégia não agressiva o suficiente | Redownloads | Média |

### 🟢 Já Otimizado

- ✅ Lazy loading de rotas (React.lazy)
- ✅ Code splitting por módulo
- ✅ PWA com Service Worker
- ✅ React Query com cache
- ✅ Preconnect para fontes

---

## Plano de Otimização Técnica

### Fase 1: Bundle Crítico (Impacto Imediato)

#### 1.1 Redução de Payload Inicial

```typescript
// vite.config.ts - Chunks otimizados
manualChunks: {
  // Core: < 100KB gzipped
  'core': ['react', 'react-dom', 'react-router-dom'],
  
  // Lazy: Carregado sob demanda
  'charts': ['recharts', 'chart.js'],
  'maps': ['mapbox-gl'],
  '3d': ['three', '@react-three/fiber'],
  'editor': ['@tiptap/react'],
}
```

#### 1.2 Imports Granulares

```typescript
// ❌ Evitar
import { debounce, throttle, cloneDeep } from 'lodash';

// ✅ Preferir
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

#### 1.3 Minificação Agressiva

```bash
# Terser já configurado com:
# - drop_console em produção
# - pure_funcs para remover console.log
# - Remoção de comentários
```

---

### Fase 2: Assets e Fontes

#### 2.1 Otimização de Imagens

```html
<!-- Usar picture com formatos modernos -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" loading="lazy" alt="...">
</picture>
```

#### 2.2 Subsetting de Fontes

```css
/* Carregar apenas pesos necessários */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
  unicode-range: U+0000-00FF; /* Latin básico */
}
```

#### 2.3 Preload Crítico

```html
<!-- index.html -->
<link rel="preload" as="font" href="/fonts/inter-var.woff2" 
      type="font/woff2" crossorigin>
<link rel="preload" as="style" href="/critical.css">
```

---

### Fase 3: Estratégias de Cache

#### 3.1 Service Worker Otimizado

```javascript
// vite.config.ts - PWA
workbox: {
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  runtimeCaching: [
    // Fontes: 1 ano
    {
      urlPattern: /fonts\.(googleapis|gstatic)\.com/,
      handler: 'CacheFirst',
      options: { maxAgeSeconds: 365 * 24 * 60 * 60 }
    },
    // API: 5 minutos com fallback
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: { 
        networkTimeoutSeconds: 5,
        maxAgeSeconds: 5 * 60
      }
    },
    // Supabase: 10 minutos
    {
      urlPattern: /supabase\.co\/rest/,
      handler: 'StaleWhileRevalidate',
      options: { maxAgeSeconds: 10 * 60 }
    }
  ]
}
```

#### 3.2 React Query para 2Mb

```typescript
// src/lib/query-client-config.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutos
      gcTime: 30 * 60 * 1000,      // 30 minutos
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    }
  }
});
```

---

### Fase 4: Arquitetura Offline-First

#### 4.1 Sincronização de Dados

```typescript
// src/lib/offline/sync-manager.ts
// Fila de mutações pendentes
await queueMutation({
  type: 'create',
  table: 'crew_members',
  data: newCrewMember,
  maxRetries: 3,
});

// Sincroniza quando online
window.addEventListener('online', async () => {
  await syncPendingMutations(async (mutation) => {
    const response = await supabase
      .from(mutation.table)
      [mutation.type](mutation.data);
    return !response.error;
  });
});
```

#### 4.2 Fila de Requisições

```typescript
// src/lib/offline/request-queue.ts
// Priorização de requisições
await requestQueue.enqueue(url, options, RequestPriority.HIGH);

// Ajuste automático de concorrência
requestQueue.adjustConcurrency('2g'); // Max 2 paralelas
```

#### 4.3 Cache Local com IndexedDB

```typescript
// Armazenar dados críticos
await cacheData('crew_members', crewData, 30 * 60 * 1000); // 30 min

// Recuperar do cache
const cached = await getCachedData<CrewMember[]>('crew_members');
if (cached) return cached; // Fallback offline
```

---

### Fase 5: Feedback de Rede

#### 5.1 Componente de Status

```typescript
// src/components/OfflineBanner.tsx
const { isOnline, effectiveType, downlink } = useNetworkState();

if (!isOnline) {
  return <Banner type="warning">Offline - Dados locais</Banner>;
}

if (effectiveType === '2g') {
  return <Banner type="info">Conexão lenta - Modo economia</Banner>;
}
```

#### 5.2 Adaptação de Qualidade

```typescript
// Reduzir qualidade em conexões lentas
const imageQuality = getAdaptiveQuality(); // 'low' | 'medium' | 'high'

<Image 
  src={getOptimizedImageUrl(url, { quality: imageQuality })}
  loading="lazy"
/>
```

---

## Checklist de Validação

### ✅ Conexões de até 2 Mbps

| Critério | Target | Como Validar |
|----------|--------|--------------|
| FCP | < 3.5s | Lighthouse throttled |
| LCP | < 4.5s | Lighthouse throttled |
| TTI | < 6s | Lighthouse throttled |
| Bundle inicial | < 250KB gzip | `scripts/ci-performance-gate.sh` |
| Chunk máximo | < 400KB | Build analysis |
| Imagens | WebP/AVIF | Audit manual |

### ✅ Ambientes Offline

| Critério | Status | Como Validar |
|----------|--------|--------------|
| Dashboard acessível | ✅ | Desconectar rede |
| Dados cacheados | ✅ | IndexedDB inspection |
| Mutações em fila | ✅ | Criar item offline |
| Sincronização | ✅ | Reconectar e verificar |
| Feedback visual | ✅ | Banner de offline |

---

## Comandos de Teste

```bash
# 1. Build e análise
npm run build
npm run analyze

# 2. Lighthouse com throttling de 2Mb
npx lhci autorun --config=lighthouserc-2mb.json

# 3. Gate de CI
./scripts/ci-performance-gate.sh

# 4. Relatório semanal
node scripts/weekly-report.cjs

# 5. Simular offline no DevTools
# Network > Offline ✓
# Verificar funcionalidade
```

---

## Arquivos Implementados

| Arquivo | Função |
|---------|--------|
| `src/lib/offline/sync-manager.ts` | Gerenciamento de sync offline |
| `src/lib/offline/request-queue.ts` | Fila de requisições priorizada |
| `src/lib/performance/critical-path.ts` | Otimização do caminho crítico |
| `src/lib/performance/image-optimizer.ts` | Otimização de imagens |
| `lighthouserc-2mb.json` | Lighthouse para 2Mb |
| `scripts/ci-performance-gate.sh` | Gate de CI |

---

*Documento técnico - Nautilus One v3.3.0*
