# Performance Optimization - Quick Start

**PATCH 651.0** - Sistema de performance otimizado já está ativo! 🚀

## O Que Mudou?

### ✅ Query Client Otimizado
O React Query agora usa cache strategies inteligentes:
- **Static data** (organizações, vessels): 30 min cache
- **Dynamic data** (dashboard): 2 min cache
- **Realtime data** (alerts): 30 sec cache

**Você não precisa fazer nada** - já está funcionando automaticamente!

### ✅ Polling Centralizado
Todos os `setInterval` devem ser substituídos por `useOptimizedPolling`:

```tsx
// ❌ EVITAR (antigo)
useEffect(() => {
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);

// ✅ USAR (novo)
useOptimizedPolling({
  id: "my-component-data",
  callback: fetchData,
  interval: 30000,
  immediate: true,
});
```

**Benefícios**:
- 🚀 Auto-pausa quando página oculta (economia ~70% CPU/bateria)
- 🚀 Auto-pausa quando offline
- 🚀 Cleanup automático
- 🚀 Performance tracking

## Para Desenvolvedores

### 1. Usando React Query (Recomendado)

```tsx
import { useQuery } from "@tanstack/react-query";
import { queryKeys, CACHE_TIMES } from "@/lib/performance/query-config";

function MyComponent() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchStats,
    staleTime: CACHE_TIMES.dynamic, // 2 min cache
  });

  // Polling otimizado
  useOptimizedPolling({
    id: "my-stats",
    callback: () => refetch(),
    interval: 30000,
  });

  if (isLoading) return <Skeleton />;
  return <div>{data}</div>;
}
```

### 2. Query Keys Padronizadas

Use as query keys factories de `query-config.ts`:

```tsx
import { queryKeys } from "@/lib/performance/query-config";

// User queries
queryKeys.user.current()
queryKeys.user.profile(userId)

// Dashboard queries  
queryKeys.dashboard.stats()
queryKeys.dashboard.kpis()

// Vessel queries
queryKeys.vessels.detail(vesselId)
queryKeys.vessels.status(vesselId)
```

### 3. Cache Times Apropriados

```tsx
import { CACHE_TIMES } from "@/lib/performance/query-config";

// Dados estáticos (organizações, configurações)
staleTime: CACHE_TIMES.static // 30 min

// Dados semi-estáticos (vessels, equipes)
staleTime: CACHE_TIMES.semiStatic // 10 min

// Dados dinâmicos (dashboard, métricas)
staleTime: CACHE_TIMES.dynamic // 2 min

// Dados real-time (alertas, notificações)
staleTime: CACHE_TIMES.realtime // 30 sec

// Preferências do usuário
staleTime: CACHE_TIMES.preferences // 1 hour
```

## Debug & Monitoring

### Health Check Dashboard
Acesse `/health` para ver:
- Status dos módulos
- Integridade das rotas
- Dependências faltantes

### Console Debug
```js
// Ver status de health
window.__NAUTILUS_MODULE_HEALTH__

// Ver polling ativo
window.__NAUTILUS_POLLING__.getStats()

// Ver queries ativas (React Query DevTools)
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__
```

### Forçar Refresh Manual
```tsx
import { runPollNow } from "@/hooks/use-optimized-polling";

function MyComponent() {
  const handleRefresh = async () => {
    await runPollNow("my-component-data");
  };

  return <Button onClick={handleRefresh}>Refresh</Button>;
}
```

## Migração de Componentes Existentes

**Prioridade Alta** (componentes com polling frequente):
1. `src/components/dashboard/enhanced-unified-dashboard.tsx`
2. `src/components/analytics/real-time-analytics.tsx`
3. `src/components/communication/notification-center.tsx`
4. `src/components/ai/CollectiveDashboard.tsx`

**Ver Guias Completos**:
- `docs/MIGRATION-POLLING.md` - Guia de migração
- `docs/PATCH-651-EXAMPLE-MIGRATION.md` - Exemplo prático

## Intervalos Recomendados

| Tipo de Dados | Intervalo | Motivo |
|---------------|-----------|---------|
| Alertas críticos | 5-10s | Real-time necessário |
| Dashboard metrics | 15-30s | Balance UX/performance |
| Status updates | 30-60s | Dados menos voláteis |
| Background sync | 2-5 min | Baixa prioridade |

## Erros Comuns

### ❌ Polling sem ID único
```tsx
useOptimizedPolling({
  id: "data", // ❌ Muito genérico
  // ...
});
```

### ✅ Polling com ID único e descritivo
```tsx
useOptimizedPolling({
  id: "vessel-123-sensor-data", // ✅ Único e específico
  // ...
});
```

### ❌ Cache muito curto em dados estáticos
```tsx
useQuery({
  queryKey: ["organizations"],
  staleTime: 1000, // ❌ Refetch a cada 1 segundo
});
```

### ✅ Cache apropriado
```tsx
useQuery({
  queryKey: queryKeys.organizations.all,
  staleTime: CACHE_TIMES.semiStatic, // ✅ 10 minutos
});
```

## Checklist Rápido

Ao criar um novo componente com polling:

- [ ] Use `useQuery` para fetching (não useState + useEffect)
- [ ] Use query keys padronizadas de `queryKeys`
- [ ] Escolha `staleTime` apropriado de `CACHE_TIMES`
- [ ] Use `useOptimizedPolling` (não setInterval)
- [ ] ID único e descritivo para o poll
- [ ] Intervalo apropriado (veja tabela acima)
- [ ] Adicione Skeleton para loading
- [ ] Adicione Alert para erros
- [ ] Teste com página oculta
- [ ] Teste offline

## Performance Tips

1. **Evite polling se possível** - Use WebSockets para real-time
2. **Batch requests** - Combine múltiplas queries quando possível
3. **Lazy load** - Componentes pesados devem usar React.lazy()
4. **Memoize callbacks** - Use useCallback para evitar re-renders
5. **Virtualize listas** - Use react-window para listas grandes

## Suporte

- 📖 Documentação: `docs/PATCH-651-SYSTEM-STABILIZATION.md`
- 🔧 Exemplos: `docs/PATCH-651-EXAMPLE-MIGRATION.md`
- 🚀 Migração: `docs/MIGRATION-POLLING.md`
- 🏥 Health: Acesse `/health` no app

## Métricas de Sucesso

Após migração, você deve ver:
- ✅ 0% CPU quando página oculta
- ✅ 0 requests quando offline
- ✅ Menos re-renders
- ✅ Melhor UX (loading states)
- ✅ Menos erros no console
