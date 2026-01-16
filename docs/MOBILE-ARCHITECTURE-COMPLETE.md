# 📱 Arquitetura Mobile Completa - Nautilus One

## Stack: React 18 + Capacitor + TypeScript

---

## 1. RESUMO DA ARQUITETURA

### Camadas Otimizadas

```
┌─────────────────────────────────────────────────────┐
│                    UI LAYER                         │
│  ┌─────────────────────────────────────────────┐    │
│  │  VirtualizedList    │  Lazy Components       │    │
│  │  Skeleton Loading   │  NetworkAwareImage     │    │
│  │  OfflineIndicator   │  PerformanceOverlay    │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                  LOGIC LAYER                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  Web Workers        │  Memoization           │    │
│  │  Runtime Monitor    │  Memory Management     │    │
│  │  Deferred Render    │  Layout Containment    │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                 NETWORK LAYER                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Delta Sync         │  Request Queue         │    │
│  │  Adaptive Polling   │  Network Detector      │    │
│  │  Enhanced Sync Eng  │  Conflict Resolution   │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                STORAGE LAYER                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  IndexedDB/SQLite   │  TTL Cache             │    │
│  │  Sync Queue         │  Offline Data Provider │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 2. MÓDULOS IMPLEMENTADOS

### 2.1 Carregamento de Módulos

| Arquivo | Função |
|---------|--------|
| `src/lib/lazy-modules.ts` | Sistema de lazy loading centralizado |
| `src/mobile/hooks/useVirtualizedList.ts` | Virtualização de listas |
| `src/mobile/components/VirtualizedList.tsx` | Componente de lista otimizado |

**Estratégia de Prioridade:**
- **Critical**: Dashboard, Shell → Carrega imediatamente
- **High**: Missions, Checklists → Idle callback
- **Medium**: Reports, Analytics → On hover
- **Low**: Settings, Admin → On visibility

### 2.2 Performance Runtime

| Arquivo | Função |
|---------|--------|
| `src/mobile/hooks/useRuntimeOptimization.ts` | Hook de otimização completo |
| `src/mobile/hooks/useWorker.ts` | Web Workers para computação |
| `src/mobile/workers/heavy-computation.worker.ts` | Worker de processamento |

**Otimizações:**
- Memory pressure monitoring (80% threshold)
- Deferred rendering para não-críticos
- Layout containment (CSS contain)
- Batched state updates
- Throttled scroll handlers

### 2.3 Sincronização Offline

| Arquivo | Função |
|---------|--------|
| `src/mobile/services/enhanced-sync-engine.ts` | Engine de sync completo |
| `src/mobile/services/sqlite-storage.ts` | Storage unificado |
| `src/mobile/services/syncQueue.ts` | Fila de prioridades |
| `src/mobile/hooks/useOfflineSync.ts` | Hook React para sync |

**Modos de Sync:**
- **Realtime**: 4G → Supabase channels
- **Polling**: 3G → Intervalo adaptativo (30s-120s)
- **Offline**: Queue local com retry automático

### 2.4 Rede e Compressão

| Arquivo | Função |
|---------|--------|
| `src/mobile/services/networkDetector.ts` | Detecção de qualidade |
| `src/mobile/services/delta-sync.ts` | Sync incremental |
| `src/mobile/hooks/useAdaptivePolling.ts` | Polling adaptativo |

---

## 3. CONFIGURAÇÃO DE BUILD

### Vite Config Otimizado

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core + UI (MUST be together for React hooks to work correctly)
          'core': ['react', 'react-dom', 'react-router-dom', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Charts (lazy)
          'charts': ['recharts', 'chart.js'],
          
          // Maps (lazy)
          'maps': ['mapbox-gl'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### Budget de Bundle

| Chunk | Target | Limite |
|-------|--------|--------|
| Core | < 80KB | Crítico |
| UI | < 60KB | Crítico |
| Vendor | < 150KB | Alto |
| Total inicial | < 250KB | Crítico |
| Por rota | < 100KB | Médio |

---

## 4. ESTRATÉGIAS DE CACHE

### Service Worker (PWA)

```typescript
// vite.config.ts - VitePWA
runtimeCaching: [
  // Core App Shell
  {
    urlPattern: /^https:\/\/.*\.(js|css|html)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'app-shell',
      expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
    }
  },
  
  // API Responses
  {
    urlPattern: /\/rest\/v1\//,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      expiration: { maxAgeSeconds: 3600 }
    }
  },
  
  // Images
  {
    urlPattern: /\.(png|jpg|webp|avif)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
    }
  }
]
```

### TTL por Tipo de Dado

```typescript
const TTL_CONFIG = {
  missions: 24 * 60 * 60 * 1000,      // 24h
  checklists: 7 * 24 * 60 * 60 * 1000, // 7 dias
  crew_members: 7 * 24 * 60 * 60 * 1000,
  vessels: 30 * 24 * 60 * 60 * 1000,   // 30 dias
  analytics: 1 * 60 * 60 * 1000,       // 1h
};
```

---

## 5. MÉTRICAS E VALIDAÇÃO

### Targets de Performance

| Métrica | Desktop | 2Mbps | Offline |
|---------|---------|-------|---------|
| FCP | < 1.0s | < 2.0s | < 0.5s |
| LCP | < 1.5s | < 3.0s | < 1.0s |
| TTI | < 2.0s | < 4.0s | < 1.5s |
| CLS | < 0.05 | < 0.1 | < 0.05 |
| Bundle (gzip) | < 250KB | < 250KB | Cached |

### Checklist de Validação

#### ✅ Rede Lenta (2Mbps)
- [ ] App carrega em < 4s
- [ ] Navegação entre telas < 500ms
- [ ] Sync não bloqueia UI
- [ ] Feedback visual em operações
- [ ] Retry automático com backoff

#### ✅ Modo Offline
- [ ] Todas as telas críticas funcionam
- [ ] Dados salvos localmente
- [ ] Sync automático ao reconectar
- [ ] Conflitos tratados
- [ ] Indicador claro de status

#### ✅ Performance Runtime
- [ ] Lista de 1000+ items sem jank
- [ ] Scroll a 60fps
- [ ] Memory < 100MB em uso normal
- [ ] CPU idle quando inativo

---

## 6. COMANDOS DE VALIDAÇÃO

```bash
# Análise de bundle
npm run build && npx vite-bundle-visualizer

# Lighthouse com throttling
npx lighthouse http://localhost:5173 \
  --throttling.cpuSlowdownMultiplier=4 \
  --throttling.throughputKbps=1638 \
  --output=html

# Testes de performance
npm run test:performance

# Build para produção
npm run build

# Sync com Capacitor
npx cap sync
```

---

## 7. ESTRUTURA DE PASTAS

```
src/
├── lib/
│   ├── lazy-modules.ts          # Lazy loading centralizado
│   ├── offline/                 # Módulos offline
│   │   ├── sync-manager.ts
│   │   └── request-queue.ts
│   └── performance/             # Performance utils
│       ├── critical-path.ts
│       └── image-optimizer.ts
│
├── mobile/
│   ├── components/              # Componentes otimizados
│   │   ├── VirtualizedList.tsx
│   │   ├── NetworkAwareImage.tsx
│   │   └── OfflineIndicator.tsx
│   │
│   ├── hooks/                   # Hooks de otimização
│   │   ├── useVirtualizedList.ts
│   │   ├── useWorker.ts
│   │   ├── useRuntimeOptimization.ts
│   │   ├── useAdaptivePolling.ts
│   │   ├── useOfflineSync.ts
│   │   └── useMobileOptimization.ts
│   │
│   ├── services/                # Serviços core
│   │   ├── enhanced-sync-engine.ts
│   │   ├── sqlite-storage.ts
│   │   ├── syncQueue.ts
│   │   ├── networkDetector.ts
│   │   └── delta-sync.ts
│   │
│   ├── workers/                 # Web Workers
│   │   └── heavy-computation.worker.ts
│   │
│   └── types/                   # TypeScript types
│       └── index.ts
│
└── docs/
    ├── MOBILE-ARCHITECTURE-COMPLETE.md
    ├── MOBILE-PERFORMANCE-ANALYSIS.md
    └── OFFLINE-FIRST-ARCHITECTURE.md
```

---

## 8. PRÓXIMOS PASSOS

### Fase 1: Integração (Atual)
- [x] Lazy loading de módulos
- [x] Virtualização de listas
- [x] Web Workers
- [x] Sync engine
- [x] Storage offline

### Fase 2: Refinamento
- [ ] Prefetch de rotas preditivo
- [ ] Background sync com Service Worker
- [ ] Compressão de imagens adaptativa
- [ ] Analytics de performance

### Fase 3: Monitoramento
- [ ] Dashboards de Web Vitals
- [ ] Alertas de degradação
- [ ] A/B testing de otimizações
- [ ] User feedback loop
