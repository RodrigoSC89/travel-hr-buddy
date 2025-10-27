# 🟡 PATCH 243 – Conectar Dashboard a Dados Reais

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** ALTA 🟡  
**Módulo:** Dashboard / Data Layer

---

## 📋 Objetivo

Substituir todos os dados mockados por queries reais do Supabase, implementar React Query com caching adequado, e adicionar estados de loading/error em todos os componentes.

---

## 🎯 Resultados Esperados

- ✅ Zero dados mockados no sistema
- ✅ React Query configurado em todos os módulos
- ✅ Loading states visuais
- ✅ Error boundaries funcionando
- ✅ Cache strategy otimizada
- ✅ Automatic revalidation
- ✅ Optimistic updates onde aplicável

---

## 🔍 Análise: Onde Estão os Dados Mockados?

### 1. Dashboard Principal
```typescript
// ❌ ANTES (Mock Data)
const mockKPIs = {
  activeVessels: 24,
  crewMembers: 187,
  routesActive: 12,
  maintenancePending: 8
}

// ✅ DEPOIS (Real Data)
const { data: kpis, isLoading, error } = useQuery({
  queryKey: ['dashboard-kpis'],
  queryFn: async () => {
    const [vessels, crew, routes, maintenance] = await Promise.all([
      supabase.from('vessels').select('*', { count: 'exact', head: true }),
      supabase.from('crew_members').select('*', { count: 'exact', head: true }),
      supabase.from('routes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('maintenance_records').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ])
    
    return {
      activeVessels: vessels.count || 0,
      crewMembers: crew.count || 0,
      routesActive: routes.count || 0,
      maintenancePending: maintenance.count || 0
    }
  },
  staleTime: 1000 * 60 * 5 // 5 minutes
})
```

### 2. Fleet Data
```typescript
// ❌ ANTES
const mockFleet = [
  { id: '1', name: 'MV Atlantic', status: 'active' },
  { id: '2', name: 'MV Pacific', status: 'maintenance' }
]

// ✅ DEPOIS
const { data: fleet, isLoading } = useQuery({
  queryKey: ['fleet'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('vessels')
      .select(`
        *,
        current_route:routes(*)
      `)
      .order('name')
    
    if (error) throw error
    return data
  }
})
```

### 3. Weather Data
```typescript
// ❌ ANTES
const mockWeather = {
  temperature: 22,
  condition: 'Sunny',
  windSpeed: 15
}

// ✅ DEPOIS
const { data: weather } = useQuery({
  queryKey: ['weather', vesselId],
  queryFn: () => weatherService.getCurrent(vesselId),
  refetchInterval: 1000 * 60 * 15 // 15 minutes
})
```

---

## 🛠️ Implementação por Módulo

### Módulo 1: Dashboard Principal

**Arquivo:** `src/pages/Dashboard.tsx`

**Queries Necessárias:**
1. KPIs gerais
2. Recent activities
3. Alerts/notifications
4. System health

**Implementação:**
```typescript
// hooks/useDashboardData.ts
export function useDashboardData() {
  const kpis = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: fetchKPIs,
    staleTime: 1000 * 60 * 5
  })
  
  const recentActivity = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    staleTime: 1000 * 60
  })
  
  const alerts = useQuery({
    queryKey: ['active-alerts'],
    queryFn: () => supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('severity', { ascending: false }),
    refetchInterval: 1000 * 30 // 30 seconds
  })
  
  return {
    kpis,
    recentActivity,
    alerts,
    isLoading: kpis.isLoading || recentActivity.isLoading || alerts.isLoading,
    error: kpis.error || recentActivity.error || alerts.error
  }
}
```

**Componente:**
```typescript
export function Dashboard() {
  const { kpis, recentActivity, alerts, isLoading, error } = useDashboardData()
  
  if (isLoading) return <DashboardSkeleton />
  if (error) return <ErrorDisplay error={error} />
  
  return (
    <div className="dashboard">
      <KPICards data={kpis.data} />
      <RecentActivity data={recentActivity.data} />
      <AlertsPanel data={alerts.data} />
    </div>
  )
}
```

### Módulo 2: Fleet Management

**Arquivo:** `src/modules/fleet/FleetDashboard.tsx`

**Queries:**
```typescript
// hooks/useFleetData.ts
export function useFleetData(filters?: FleetFilters) {
  return useQuery({
    queryKey: ['fleet', filters],
    queryFn: async () => {
      let query = supabase
        .from('vessels')
        .select(`
          *,
          current_route:routes(*),
          last_maintenance:maintenance_records(*)
            .order('completed_at', { ascending: false })
            .limit(1)
        `)
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useVesselLocation(vesselId: string) {
  return useQuery({
    queryKey: ['vessel-location', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessel_telemetry')
        .select('latitude, longitude, heading, speed')
        .eq('vessel_id', vesselId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      return data
    },
    refetchInterval: 1000 * 10 // 10 seconds for real-time tracking
  })
}
```

### Módulo 3: Routes & Navigation

**Arquivo:** `src/modules/routes/RoutesDashboard.tsx`

**Queries:**
```typescript
export function useRoutes(status?: 'active' | 'completed' | 'planned') {
  return useQuery({
    queryKey: ['routes', status],
    queryFn: async () => {
      let query = supabase
        .from('routes')
        .select(`
          *,
          vessel:vessels(*),
          waypoints(*)
        `)
        .order('departure_date', { ascending: false })
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}
```

### Módulo 4: Crew Management

**Arquivo:** `src/modules/crew/CrewDashboard.tsx`

**Queries:**
```typescript
export function useCrewMembers(vesselId?: string) {
  return useQuery({
    queryKey: ['crew', vesselId],
    queryFn: async () => {
      let query = supabase
        .from('crew_members')
        .select(`
          *,
          vessel:vessels(*),
          certifications:crew_certifications(*)
        `)
      
      if (vesselId) {
        query = query.eq('vessel_id', vesselId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}
```

### Módulo 5: Maintenance

**Arquivo:** `src/modules/maintenance/MaintenanceDashboard.tsx`

**Queries:**
```typescript
export function useMaintenanceRecords(vesselId?: string) {
  return useQuery({
    queryKey: ['maintenance', vesselId],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_records')
        .select(`
          *,
          vessel:vessels(*),
          technician:users(*)
        `)
        .order('scheduled_date', { ascending: true })
      
      if (vesselId) {
        query = query.eq('vessel_id', vesselId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}
```

---

## 🎨 Loading States

### Skeleton Components

```typescript
// components/ui/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

// components/ui/TableSkeleton.tsx
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Loading Indicators

```typescript
// components/ui/LoadingState.tsx
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
```

---

## 🚨 Error Handling

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

### Error Display

```typescript
// components/ErrorDisplay.tsx
export function ErrorDisplay({ error, onRetry }: { error: Error, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
```

---

## 📊 React Query Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// App.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## ✅ Checklist de Validação

### Dados Reais
- [ ] Zero mock data no dashboard
- [ ] Zero mock data em fleet
- [ ] Zero mock data em routes
- [ ] Zero mock data em crew
- [ ] Zero mock data em maintenance
- [ ] Todas as queries conectadas ao Supabase

### React Query
- [ ] QueryClient configurado
- [ ] Query keys organizadas
- [ ] Cache strategy definida
- [ ] Stale time apropriado
- [ ] Refetch intervals configurados
- [ ] DevTools instaladas

### Loading States
- [ ] Skeleton screens em todos os componentes
- [ ] Loading spinners onde apropriado
- [ ] Smooth transitions
- [ ] Suspense boundaries

### Error Handling
- [ ] Error boundaries implementadas
- [ ] Error displays visuais
- [ ] Retry mechanisms
- [ ] Fallback UI
- [ ] Toast notifications para errors

### Performance
- [ ] Queries otimizadas
- [ ] Paginação onde necessário
- [ ] Lazy loading de componentes
- [ ] Debouncing em search inputs

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| Mock Data | ~80% | 0% |
| Loading States | ~20% | 100% |
| Error Boundaries | 0 | Todas as rotas |
| Cache Hit Rate | 0% | >60% |
| Initial Load Time | Variável | <2s |

---

**STATUS:** 🟡 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 244 – Ativar Supabase Realtime e WebSocket
