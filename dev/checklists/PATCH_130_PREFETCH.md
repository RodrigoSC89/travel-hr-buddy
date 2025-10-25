# PATCH 130 - NAVIGATION & PREFETCH

**Status:** ⚠️ PARTIAL  
**Data:** 2025-10-25  
**Fase:** 4 - UX/Interface

---

## 🧭 Navigation System

### React Router Implementation

#### AppRouter.tsx Structure
```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/maintenance" element={<MaintenanceDashboard />} />
    <Route path="/compliance" element={<ComplianceHub />} />
    {/* ... 18+ rotas adicionais */}
  </Routes>
</BrowserRouter>
```

#### ✅ Rotas Configuradas: 21
- Dashboard (/)
- Maintenance (/maintenance)
- Compliance (/compliance)
- DP Intelligence (/dp-intelligence)
- Control Hub (/control-hub)
- Forecast Global (/forecast-global)
- BridgeLink (/bridgelink)
- Maritime (/maritime)
- PEODP (/peo-dp)
- PEOTRAM (/peo-tram)
- ... +11 módulos

---

## 🔧 Navigation Hooks

### useNavigationManager (src/hooks/use-navigation-manager.ts)

#### Features
```typescript
{
  navigateTo(path, options)
  navigateBack()
  navigateHome()
}
```

#### Enhanced Options
- Toast feedback opcional
- Error handling
- Replace mode
- Custom messages

### useSidebarActions (src/hooks/use-sidebar-actions.ts)

#### Module Navigation
```typescript
{
  handleNavigation(path)
  handleModuleAccess(moduleKey)
}
```

#### 📍 Module Mapping (18 módulos)
```typescript
const moduleRoutes = {
  dashboard: '/dashboard',
  admin: '/admin',
  hr: '/hr',
  maritime: '/sistema-maritimo',
  'fleet-management': '/fleet-management',
  'crew-management': '/crew-management',
  // ... +12 módulos
}
```

---

## 🚀 Prefetch Strategy

### ❌ Status Atual: NÃO IMPLEMENTADO

#### Missing Features
- [ ] Route prefetching
- [ ] Resource hints (`<link rel="prefetch">`)
- [ ] Intersection Observer triggers
- [ ] Hover-based preloading
- [ ] Critical route preloading

---

## 💡 Prefetch Implementation Plan

### Level 1: Critical Routes (Alta Prioridade)
```typescript
// Prefetch no mount
useEffect(() => {
  const criticalRoutes = ['/dashboard', '/maintenance', '/compliance']
  criticalRoutes.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })
}, [])
```

### Level 2: Hover Prefetch (Média Prioridade)
```typescript
const PrefetchLink = ({ to, children }) => {
  const prefetch = () => {
    import(`@/pages/${to}`)
  }
  
  return (
    <Link to={to} onMouseEnter={prefetch}>
      {children}
    </Link>
  )
}
```

### Level 3: Intersection Observer (Baixa Prioridade)
```typescript
const usePrefetchOnVisible = (route) => {
  const ref = useRef()
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        import(`@/pages/${route}`)
      }
    })
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [route])
  
  return ref
}
```

---

## 📦 Vite Configuration

### Current Build Setup
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {} // ⚠️ Não configurado
      }
    }
  }
})
```

### ✅ Recommended Chunk Strategy
```typescript
manualChunks: {
  'vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui': ['@radix-ui/*', 'lucide-react'],
  'charts': ['recharts', 'chart.js'],
  'maps': ['mapbox-gl'],
  'forms': ['react-hook-form', 'zod']
}
```

---

## 🎯 Preload Strategy

### Resource Hints
```html
<!-- Critical CSS/JS -->
<link rel="preload" href="/assets/main.js" as="script">
<link rel="preload" href="/assets/main.css" as="style">

<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://vnbptmixvwropvanyhdb.supabase.co">

<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

---

## ⚡ Performance Optimization

### Code Splitting (✅ Implementado)
- React.lazy para todas as rotas
- Dynamic imports automáticos
- Chunk splitting por rota

### Bundle Analysis (❌ Pendente)
- [ ] Vite Bundle Analyzer
- [ ] Route size mapping
- [ ] Dependency tree analysis
- [ ] Unused code detection

---

## 🌐 Vercel Deployment

### Edge Network Benefits
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Compression (Brotli/Gzip)
- ⚠️ Edge caching (configurar)

### Vercel.json Configuration
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## ✅ Navigation UX

### Current Features
- [x] Client-side routing
- [x] Toast feedback
- [x] Error handling
- [x] Normalized paths
- [x] Module key mapping

### Missing Features
- [ ] Loading progress bar
- [ ] Route transition animations
- [ ] Breadcrumb navigation
- [ ] Back button management
- [ ] Navigation history

---

## 📊 Compliance Score: 45%

### Status Breakdown
- ✅ Routing: 100%
- ✅ Navigation hooks: 100%
- ⚠️ Code splitting: 100%
- ❌ Prefetch: 0%
- ❌ Preload: 0%
- ❌ Resource hints: 0%

---

## 🔍 Próximos Passos

### Fase 1: Prefetch Básico
1. [ ] Criar PrefetchLink component
2. [ ] Implementar hover prefetch
3. [ ] Adicionar critical route preload
4. [ ] Configurar resource hints

### Fase 2: Advanced Optimization
1. [ ] Intersection Observer prefetch
2. [ ] Manual chunks configuration
3. [ ] Bundle analyzer setup
4. [ ] Performance monitoring

### Fase 3: Vercel Integration
1. [ ] Edge caching headers
2. [ ] Static asset optimization
3. [ ] Image optimization
4. [ ] Analytics integration

---

**Assinado por:** Nautilus AI System  
**Patch Version:** 130.0  
**Build:** NEEDS_IMPLEMENTATION
