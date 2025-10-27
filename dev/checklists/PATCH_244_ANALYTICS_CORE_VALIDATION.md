# 🧪 PATCH 244 – Analytics Core with Real Data Validation

## Module Information
- **Module**: `analytics-core`
- **Patch**: 244
- **Priority**: HIGH
- **Status**: 🟡 PENDING VALIDATION

---

## 📋 Objectives

### 1. Data Ingestion
- [ ] Dados reais chegando ao Supabase via pipelines
- [ ] Múltiplas fontes de dados integradas
- [ ] Timestamps corretos para análise temporal
- [ ] Dados transformados e limpos

### 2. KPI Calculation
- [ ] KPIs calculados em tempo real ou near real-time
- [ ] Fórmulas de cálculo corretas e testadas
- [ ] Agregações performáticas (views ou funções)
- [ ] Comparação com períodos anteriores

### 3. Dashboard Visualization
- [ ] Widgets carregam dados reais
- [ ] Gráficos renderizam corretamente
- [ ] Heatmaps e séries temporais funcionais
- [ ] Filtros e drill-down operacionais

### 4. Performance
- [ ] Tempo de carregamento < 2s para 5K registros
- [ ] Queries otimizadas com índices
- [ ] Cache implementado onde necessário
- [ ] Paginação para grandes volumes

### 5. Responsiveness
- [ ] Dashboards funcionam em desktop
- [ ] Gráficos adaptam-se a mobile
- [ ] Touch interactions funcionais
- [ ] Layout responsivo em todas as resoluções

---

## 🗄️ Required Database Schema

### Table: `analytics_events`
```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_org ON public.analytics_events(organization_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_events_entity ON public.analytics_events(entity_type, entity_id);
```

### Table: `kpi_metrics`
```sql
CREATE TABLE IF NOT EXISTS public.kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  current_value DECIMAL(16,4) NOT NULL,
  previous_value DECIMAL(16,4),
  change_percentage DECIMAL(8,2),
  target_value DECIMAL(16,4),
  unit TEXT DEFAULT 'number',
  period_type TEXT CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculation_method TEXT,
  data_sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_metrics_org ON public.kpi_metrics(organization_id);
CREATE INDEX idx_kpi_metrics_name ON public.kpi_metrics(metric_name);
CREATE INDEX idx_kpi_metrics_period ON public.kpi_metrics(period_start, period_end);
CREATE INDEX idx_kpi_metrics_category ON public.kpi_metrics(metric_category);
```

### View: `daily_kpi_summary`
```sql
CREATE OR REPLACE VIEW public.daily_kpi_summary AS
SELECT 
  organization_id,
  metric_category,
  metric_name,
  DATE(period_start) as date,
  AVG(current_value) as avg_value,
  MAX(current_value) as max_value,
  MIN(current_value) as min_value,
  COUNT(*) as data_points
FROM public.kpi_metrics
WHERE period_type = 'daily'
GROUP BY organization_id, metric_category, metric_name, DATE(period_start);
```

### Table: `dashboard_widgets`
```sql
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dashboard_name TEXT NOT NULL,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('chart', 'kpi_card', 'table', 'heatmap', 'gauge', 'map')),
  widget_title TEXT NOT NULL,
  data_source TEXT NOT NULL,
  query_config JSONB NOT NULL,
  visualization_config JSONB NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 2,
  refresh_interval_seconds INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_dashboard_widgets_org ON public.dashboard_widgets(organization_id);
CREATE INDEX idx_dashboard_widgets_dashboard ON public.dashboard_widgets(dashboard_name);
```

### Function: `calculate_fleet_efficiency`
```sql
CREATE OR REPLACE FUNCTION public.calculate_fleet_efficiency(
  org_id UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  efficiency_score DECIMAL(5,2),
  fuel_efficiency DECIMAL(8,2),
  uptime_percentage DECIMAL(5,2),
  maintenance_cost DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vessel_id,
    v.name as vessel_name,
    COALESCE(AVG(ae.metrics->>'efficiency_score')::DECIMAL, 0) as efficiency_score,
    COALESCE(AVG(ae.metrics->>'fuel_efficiency')::DECIMAL, 0) as fuel_efficiency,
    COALESCE(AVG(ae.metrics->>'uptime')::DECIMAL, 0) as uptime_percentage,
    COALESCE(SUM((ae.metrics->>'maintenance_cost')::DECIMAL), 0) as maintenance_cost
  FROM public.vessels v
  LEFT JOIN public.analytics_events ae 
    ON ae.entity_id = v.id 
    AND ae.entity_type = 'vessel'
    AND ae.timestamp BETWEEN start_date AND end_date
  WHERE v.organization_id = org_id
  GROUP BY v.id, v.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
```

---

## 🔒 Required RLS Policies

### analytics_events
```sql
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's analytics"
  ON public.analytics_events FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "System can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true); -- Permitir inserção de eventos de sistema
```

### kpi_metrics
```sql
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's KPIs"
  ON public.kpi_metrics FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));
```

---

## ✅ Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Dados reais nos dashboards | ⏳ | Sem mock data predominante |
| KPIs calculados corretamente | ⏳ | Validar fórmulas e agregações |
| Tempo de carregamento < 2s | ⏳ | Para até 5K registros |
| Gráficos renderizam corretamente | ⏳ | Charts, heatmaps, gauges |
| Dashboards responsivos | ⏳ | Desktop e mobile |
| Filtros funcionais | ⏳ | Data range, categorias, drill-down |

---

## 🧪 Test Scenarios

### Scenario 1: KPI Calculation
1. Inserir eventos de eficiência de frota
2. Executar função `calculate_fleet_efficiency`
3. Verificar valores calculados
4. Comparar com cálculo manual

### Scenario 2: Dashboard Loading
1. Abrir dashboard principal
2. Medir tempo de carregamento inicial
3. Verificar se todos os widgets carregam
4. Validar dados exibidos vs. banco

### Scenario 3: Time Series Analysis
1. Filtrar dados por período (últimos 30 dias)
2. Visualizar gráfico de linha temporal
3. Identificar tendências e anomalias
4. Exportar dados para CSV

### Scenario 4: Performance with Large Dataset
1. Inserir 10K eventos analíticos
2. Abrir dashboard com múltiplos widgets
3. Medir tempo de carregamento
4. Verificar se paginação funciona

---

## 📁 Current Implementation Status

### ⚠️ To Implement
- Tabelas de analytics e KPIs
- Pipelines de ingestão de dados
- Funções de cálculo de métricas
- Dashboards interativos
- Sistema de widgets configuráveis
- Cache e otimização de queries

### 🛠️ Required Components
```
src/modules/analytics/
├── dashboards/
│   ├── OperationalDashboard.tsx
│   ├── FleetDashboard.tsx
│   └── FinancialDashboard.tsx
├── widgets/
│   ├── KPICard.tsx
│   ├── TimeSeriesChart.tsx
│   ├── Heatmap.tsx
│   └── GaugeWidget.tsx
├── services/
│   ├── analytics-service.ts
│   └── kpi-service.ts
└── hooks/
    ├── use-kpi-metrics.ts
    └── use-analytics-data.ts
```

---

## 🚀 Next Steps

1. **Criar schema completo** de analytics
2. **Implementar data ingestion** pipelines
3. **Criar funções de KPI** calculation
4. **Desenvolver widgets** reutilizáveis
5. **Implementar caching** com React Query
6. **Adicionar índices** para performance
7. **Testar com dados reais** em volume
8. **Otimizar queries** lentas

---

## 🎯 KPI Metrics Examples

```javascript
const kpiExamples = [
  {
    name: "fleet_utilization",
    category: "operations",
    current_value: 87.5,
    target_value: 90.0,
    unit: "percentage",
    trend: "up"
  },
  {
    name: "avg_fuel_efficiency",
    category: "sustainability",
    current_value: 12.3,
    target_value: 13.0,
    unit: "nautical_miles_per_ton",
    trend: "stable"
  },
  {
    name: "maintenance_cost_per_vessel",
    category: "financial",
    current_value: 45000,
    target_value: 40000,
    unit: "currency",
    trend: "down"
  }
];
```

---

## 📊 Dashboard Layout Example

```javascript
const dashboardConfig = {
  name: "Operational Dashboard",
  widgets: [
    {
      type: "kpi_card",
      title: "Fleet Utilization",
      position: { x: 0, y: 0, w: 3, h: 2 }
    },
    {
      type: "chart",
      title: "Fuel Consumption Trend",
      chartType: "line",
      position: { x: 3, y: 0, w: 9, h: 4 }
    },
    {
      type: "heatmap",
      title: "Vessel Activity by Hour",
      position: { x: 0, y: 2, w: 6, h: 4 }
    }
  ]
};
```

---

**Status**: 🟡 Aguardando implementação de analytics infrastructure  
**Last Updated**: 2025-10-27  
**Validation Owner**: AI System
