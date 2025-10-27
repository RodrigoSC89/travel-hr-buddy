# 🟢 PATCH 247 – Analytics Core com Pipelines Reais

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** MÉDIA 🟢  
**Módulo:** Analytics / Data Pipeline

---

## 📋 Objetivo

Transformar o sistema analítico de mockado para real, com pipelines de processamento de dados, dashboards em tempo real e custom query builder.

---

## 🎯 Resultados Esperados

- ✅ Dados do contexto real processados
- ✅ Pipeline de processamento automatizado
- ✅ Dashboards em tempo real
- ✅ Custom query builder visual
- ✅ Data warehouse estruturado
- ✅ ETL jobs configurados
- ✅ Aggregations e métricas calculadas
- ✅ Export de relatórios customizados

---

## 🗄️ Estrutura de Dados

```sql
-- analytics_events (raw events)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  properties JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_processed ON analytics_events(processed);

-- analytics_metrics (aggregated metrics)
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  dimension TEXT,
  value DECIMAL(16,4) NOT NULL,
  labels JSONB,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);

-- analytics_dashboards (custom dashboards)
CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  widgets JSONB NOT NULL,
  filters JSONB,
  refresh_interval INTEGER DEFAULT 300, -- seconds
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- analytics_queries (saved queries)
CREATE TABLE analytics_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  query_definition JSONB NOT NULL,
  result_schema JSONB,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🛠️ Data Pipeline Implementation

### 1. Event Collection Service

**Arquivo:** `src/services/analytics/eventCollector.ts`

```typescript
export class EventCollector {
  async track(event: AnalyticsEvent) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event.type,
        event_name: event.name,
        source: event.source || 'web',
        user_id: event.userId,
        session_id: event.sessionId,
        properties: event.properties,
        timestamp: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to track event:', error)
    }
    
    return data
  }
  
  // Batch insert for performance
  async trackBatch(events: AnalyticsEvent[]) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(events.map(e => ({
        event_type: e.type,
        event_name: e.name,
        source: e.source || 'web',
        user_id: e.userId,
        session_id: e.sessionId,
        properties: e.properties,
        timestamp: new Date().toISOString()
      })))
    
    if (error) {
      console.error('Failed to track batch:', error)
    }
    
    return data
  }
}

// Usage hook
export function useAnalytics() {
  const collector = useRef(new EventCollector())
  
  const track = useCallback((eventName: string, properties?: any) => {
    collector.current.track({
      type: 'user_action',
      name: eventName,
      properties,
      userId: user?.id,
      sessionId: sessionStorage.getItem('sessionId')
    })
  }, [user])
  
  return { track }
}
```

### 2. ETL Pipeline

**Arquivo:** `src/services/analytics/etlPipeline.ts`

```typescript
export class ETLPipeline {
  async processEvents() {
    // Extract: Get unprocessed events
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('processed', false)
      .order('timestamp', { ascending: true })
      .limit(1000)
    
    if (!events || events.length === 0) return
    
    // Transform: Aggregate and calculate metrics
    const metrics = this.transformEvents(events)
    
    // Load: Insert metrics
    await this.loadMetrics(metrics)
    
    // Mark events as processed
    await supabase
      .from('analytics_events')
      .update({ processed: true })
      .in('id', events.map(e => e.id))
  }
  
  private transformEvents(events: AnalyticsEvent[]): Metric[] {
    const metrics: Metric[] = []
    
    // Group by hour
    const groupedByHour = this.groupByTimeWindow(events, 'hour')
    
    for (const [period, periodEvents] of Object.entries(groupedByHour)) {
      // Count events by type
      const eventCounts = periodEvents.reduce((acc, e) => {
        acc[e.event_name] = (acc[e.event_name] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Create metrics
      for (const [eventName, count] of Object.entries(eventCounts)) {
        metrics.push({
          metric_name: `event_count_${eventName}`,
          metric_type: 'counter',
          value: count,
          period_start: period,
          period_end: this.addHours(period, 1)
        })
      }
      
      // Calculate unique users
      const uniqueUsers = new Set(periodEvents.map(e => e.user_id)).size
      metrics.push({
        metric_name: 'unique_users',
        metric_type: 'gauge',
        value: uniqueUsers,
        period_start: period,
        period_end: this.addHours(period, 1)
      })
    }
    
    return metrics
  }
  
  private async loadMetrics(metrics: Metric[]) {
    await supabase.from('analytics_metrics').insert(metrics)
  }
}

// Run as Edge Function or Cron Job
export async function runETLJob() {
  const pipeline = new ETLPipeline()
  await pipeline.processEvents()
}
```

### 3. Query Builder

**Arquivo:** `src/modules/analytics/components/QueryBuilder.tsx`

```typescript
export function QueryBuilder() {
  const [query, setQuery] = useState<QueryDefinition>({
    source: 'analytics_events',
    select: ['*'],
    where: [],
    groupBy: [],
    orderBy: [],
    limit: 100
  })
  
  const [results, setResults] = useState<any[]>([])
  
  const executeQuery = async () => {
    let supabaseQuery = supabase.from(query.source).select(query.select.join(','))
    
    // Apply filters
    query.where.forEach(condition => {
      supabaseQuery = supabaseQuery[condition.operator](
        condition.field,
        condition.value
      )
    })
    
    // Apply grouping
    if (query.groupBy.length > 0) {
      // Note: Supabase doesn't support GROUP BY directly
      // Would need to use RPC function or do client-side grouping
    }
    
    // Apply ordering
    query.orderBy.forEach(order => {
      supabaseQuery = supabaseQuery.order(order.field, {
        ascending: order.direction === 'asc'
      })
    })
    
    // Apply limit
    supabaseQuery = supabaseQuery.limit(query.limit)
    
    const { data, error } = await supabaseQuery
    
    if (error) {
      toast.error('Query failed: ' + error.message)
      return
    }
    
    setResults(data || [])
  }
  
  return (
    <div className="query-builder space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Query Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Data Source</Label>
            <Select
              value={query.source}
              onChange={(value) => setQuery({ ...query, source: value })}
            >
              <option value="analytics_events">Events</option>
              <option value="analytics_metrics">Metrics</option>
            </Select>
          </div>
          
          <div>
            <Label>Select Fields</Label>
            <MultiSelect
              value={query.select}
              onChange={(select) => setQuery({ ...query, select })}
              options={getFieldsForSource(query.source)}
            />
          </div>
          
          <div>
            <Label>Where Conditions</Label>
            <WhereBuilder
              conditions={query.where}
              onChange={(where) => setQuery({ ...query, where })}
            />
          </div>
          
          <div>
            <Label>Group By</Label>
            <MultiSelect
              value={query.groupBy}
              onChange={(groupBy) => setQuery({ ...query, groupBy })}
              options={getFieldsForSource(query.source)}
            />
          </div>
          
          <Button onClick={executeQuery}>
            <Play className="mr-2 h-4 w-4" />
            Execute Query
          </Button>
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={results} />
            <ExportButton data={results} format="csv" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 4. Real-time Analytics Dashboard

**Arquivo:** `src/modules/analytics/components/AnalyticsDashboard.tsx`

```typescript
export function AnalyticsDashboard() {
  const { data: metrics, refetch } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: async () => {
      const last24Hours = subHours(new Date(), 24)
      
      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .gte('period_start', last24Hours.toISOString())
        .order('period_start', { ascending: true })
      
      if (error) throw error
      return data
    },
    refetchInterval: 60000 // Refresh every minute
  })
  
  const eventCounts = useMemo(() => {
    return metrics
      ?.filter(m => m.metric_name.startsWith('event_count_'))
      .reduce((acc, m) => {
        const eventName = m.metric_name.replace('event_count_', '')
        acc[eventName] = (acc[eventName] || 0) + m.value
        return acc
      }, {} as Record<string, number>)
  }, [metrics])
  
  const activeUsers = useMemo(() => {
    const latest = metrics
      ?.filter(m => m.metric_name === 'unique_users')
      .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())[0]
    
    return latest?.value || 0
  }, [metrics])
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Active Users"
          value={activeUsers}
          icon={Users}
        />
        <KPICard
          title="Total Events"
          value={Object.values(eventCounts || {}).reduce((a, b) => a + b, 0)}
          icon={Activity}
        />
        <KPICard
          title="Event Types"
          value={Object.keys(eventCounts || {}).length}
          icon={List}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Events Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <EventsChart metrics={metrics} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Event Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={eventCounts} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. Custom Dashboard Builder

**Arquivo:** `src/modules/analytics/components/DashboardBuilder.tsx`

```typescript
export function DashboardBuilder() {
  const [dashboard, setDashboard] = useState<Dashboard>({
    name: '',
    layout: { cols: 12, rows: [] },
    widgets: []
  })
  
  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type}`,
      config: getDefaultConfig(type),
      position: { x: 0, y: 0, w: 4, h: 4 }
    }
    
    setDashboard({
      ...dashboard,
      widgets: [...dashboard.widgets, newWidget]
    })
  }
  
  const saveDashboard = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert({
          name: dashboard.name,
          layout: dashboard.layout,
          widgets: dashboard.widgets,
          created_by: user.id
        })
      
      if (error) throw error
      return data
    }
  })
  
  return (
    <div className="dashboard-builder">
      <div className="toolbar">
        <Input
          placeholder="Dashboard Name"
          value={dashboard.name}
          onChange={(e) => setDashboard({ ...dashboard, name: e.target.value })}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addWidget('chart')}>
              Chart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addWidget('table')}>
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addWidget('metric')}>
              Metric
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button onClick={() => saveDashboard.mutate()}>
          Save Dashboard
        </Button>
      </div>
      
      <GridLayout
        layout={dashboard.layout}
        onChange={(layout) => setDashboard({ ...dashboard, layout })}
      >
        {dashboard.widgets.map(widget => (
          <WidgetRenderer
            key={widget.id}
            widget={widget}
            onUpdate={(updated) => {
              setDashboard({
                ...dashboard,
                widgets: dashboard.widgets.map(w => 
                  w.id === widget.id ? updated : w
                )
              })
            }}
            onDelete={() => {
              setDashboard({
                ...dashboard,
                widgets: dashboard.widgets.filter(w => w.id !== widget.id)
              })
            }}
          />
        ))}
      </GridLayout>
    </div>
  )
}
```

---

## ✅ Checklist de Validação

### Data Collection
- [ ] Event tracking funcional
- [ ] Batch inserts working
- [ ] Properties captured correctly

### Pipeline
- [ ] ETL pipeline executando
- [ ] Metrics sendo calculadas
- [ ] Aggregations corretas

### Query Builder
- [ ] Interface intuitiva
- [ ] Queries executam corretamente
- [ ] Results exportáveis

### Dashboards
- [ ] Real-time updates
- [ ] Custom dashboards salvam
- [ ] Widgets configuráveis
- [ ] Layout drag-and-drop

### Performance
- [ ] Queries otimizadas
- [ ] Indexes criados
- [ ] Cache strategy

---

**STATUS:** 🟢 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 248 – Testes Automatizados
