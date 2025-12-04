# 🚀 Performance Optimization for 2Mb Connections

> **Objetivo**: Garantir experiência fluída em conexões de ~2Mb (250KB/s)

---

## 📊 Budget de Performance

### Limites Críticos

| Recurso | Limite | Tempo @ 2Mb | Razão |
|---------|--------|-------------|-------|
| Initial JS | 300KB gzip | 1.2s | First paint rápido |
| Any Chunk | 500KB | 2s | Evita timeout |
| Total HTML | 50KB | 0.2s | DOM parsing |
| Critical CSS | 30KB | 0.12s | Render blocking |
| Hero Image | 100KB | 0.4s | Above the fold |
| Total Page | 1MB | 4s | Complete load |

### Métricas Target

```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
TTFB (Time to First Byte): < 600ms
TTI (Time to Interactive): < 3.5s
```

---

## 🔧 Otimizações Implementadas

### 1. Bundle Splitting

```javascript
// vite.config.ts - Chunks otimizados
manualChunks: {
  'core-react': ['react', 'react-dom'],
  'core-router': ['react-router-dom'],
  'core-query': ['@tanstack/react-query'],
  'ui-modals': ['@radix-ui/react-dialog', ...],
  'charts': ['recharts'],
  'map': ['mapbox-gl'],
  // ... módulos lazy
}
```

### 2. Lazy Loading

```typescript
// Carregar módulos pesados apenas quando necessário
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Com fallback
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 3. Compressão

```nginx
# nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

### 4. Cache Agressivo

```javascript
// Workbox config
runtimeCaching: [
  {
    urlPattern: /\.(?:js|css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-assets',
      expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 } // 7 dias
    }
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 } // 30 dias
    }
  }
]
```

---

## 📸 Otimização de Imagens

### Formatos Recomendados

| Formato | Uso | Economia |
|---------|-----|----------|
| WebP | Fotos, screenshots | 30-50% vs JPEG |
| AVIF | Fotos de alta qualidade | 50-70% vs JPEG |
| SVG | Ícones, logos | Escalável, pequeno |
| PNG | Transparência necessária | Usar com moderação |

### Conversão Automática

```bash
# Converter todas imagens para WebP
find src -name "*.png" -o -name "*.jpg" | while read img; do
  cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

### Lazy Loading de Imagens

```html
<!-- Usar loading="lazy" para imagens abaixo do fold -->
<img 
  src="image.webp" 
  loading="lazy" 
  decoding="async"
  alt="Description"
/>
```

---

## 📱 PWA para Offline

### Pre-cache Assets Críticos

```javascript
// sw.js
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/core-react.js',
  '/assets/core-router.js',
  '/assets/index.css',
];
```

### Fallback Offline

```javascript
// Página offline customizada
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
```

---

## 🧪 Scripts de Validação

### Bundle Budget Check

```bash
npm run bundle:check
# ou
./scripts/bundle-budget-check.sh
```

### Lighthouse CI

```bash
# Simula conexão 2Mb
npx lighthouse https://seu-site.com \
  --throttling.cpuSlowdownMultiplier=4 \
  --throttling.throughputKbps=2000 \
  --preset=perf
```

### Análise de Bundle

```bash
npm run analyze
# ou
./scripts/analyze-bundle.sh
```

---

## ✅ Checklist de Performance

### Build

- [ ] Bundle inicial < 300KB gzipped
- [ ] Nenhum chunk > 500KB
- [ ] Console.log removido em produção
- [ ] Source maps desabilitados

### Imagens

- [ ] Todas convertidas para WebP/AVIF
- [ ] SVGs otimizados (SVGO)
- [ ] Lazy loading implementado
- [ ] Responsive images (srcset)

### Rede

- [ ] Compressão Brotli/Gzip ativa
- [ ] Cache-Control: max-age=31536000
- [ ] Preconnect para origens críticas
- [ ] DNS prefetch configurado

### PWA

- [ ] Service Worker registrado
- [ ] Assets críticos pre-cacheados
- [ ] Fallback offline funcional
- [ ] Manifest.json válido

### Lighthouse

- [ ] Performance > 90
- [ ] uses-text-compression ✓
- [ ] uses-long-cache-ttl ✓
- [ ] efficient-animated-content ✓

---

## 📈 Monitoramento

### Web Vitals

```typescript
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP((metric) => sendToAnalytics('LCP', metric));
onFID((metric) => sendToAnalytics('FID', metric));
onCLS((metric) => sendToAnalytics('CLS', metric));
```

### Alertas de Regressão

```yaml
# lighthouserc.json
assertions:
  "first-contentful-paint": ["warn", { maxNumericValue: 2000 }]
  "largest-contentful-paint": ["error", { maxNumericValue: 2500 }]
  "total-blocking-time": ["warn", { maxNumericValue: 300 }]
```

---

## 🔗 Recursos

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring](https://developers.google.com/web/tools/lighthouse/scoring)
- [Workbox Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)

---

*Última atualização: Dezembro 2024*
