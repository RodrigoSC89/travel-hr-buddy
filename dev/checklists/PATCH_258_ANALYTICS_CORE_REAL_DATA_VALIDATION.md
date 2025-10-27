# 🧪 PATCH 258 – Analytics Core Real Data Validation

## 📋 Objective
Validar pipelines de dados analíticos reais e métricas em tempo real no Analytics Core.

---

## ✅ Validation Checklist

### 1️⃣ Real Data Display
- [ ] As métricas no dashboard refletem dados reais do Supabase (sem mocks)?
- [ ] Os valores são calculados dinamicamente?
- [ ] Os dados são atualizados automaticamente sem refresh manual?
- [ ] Todos os KPIs exibem valores corretos?

### 2️⃣ Event Capture & KPIs
- [ ] O sistema captura eventos do usuário em tempo real?
- [ ] Os eventos são persistidos na tabela `analytics_events`?
- [ ] KPIs são calculados corretamente a partir dos eventos?
- [ ] As métricas são agregadas por período (dia, semana, mês)?

### 3️⃣ Custom Query Builder
- [ ] É possível criar queries personalizadas via UI?
- [ ] As queries são salvas e reutilizáveis?
- [ ] O builder suporta filtros, agregações e joins?
- [ ] As queries executam sem timeout (<5s)?

### 4️⃣ RLS & Security
- [ ] Todas as queries respeitam RLS do Supabase?
- [ ] Usuários só veem dados permitidos por suas policies?
- [ ] Não há SQL injection possível no query builder?
- [ ] Logs de auditoria são criados para queries sensíveis?

### 5️⃣ Export Functionality
- [ ] O módulo exporta relatórios em PDF corretamente?
- [ ] A exportação para CSV funciona sem corrupção de dados?
- [ ] Os arquivos exportados preservam formatação?
- [ ] Grandes datasets (>10K registros) são exportados sem erro?

---

## 🗄️ Required Database Schema

### Table: `analytics_events`
```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_category TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  module_name TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_module ON public.analytics_events(module_name);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `analytics_kpis`
```sql
CREATE TABLE IF NOT EXISTS public.analytics_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  calculation_query TEXT NOT NULL,
  unit TEXT,
  category TEXT,
  refresh_interval_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  last_value DECIMAL(15,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analytics_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view KPIs"
  ON public.analytics_kpis FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Table: `analytics_dashboards`
```sql
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  layout JSONB DEFAULT '[]'::jsonb,
  widgets JSONB DEFAULT '[]'::jsonb,
  refresh_rate_seconds INTEGER DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public dashboards"
  ON public.analytics_dashboards FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can create dashboards"
  ON public.analytics_dashboards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
```

### Table: `analytics_queries`
```sql
CREATE TABLE IF NOT EXISTS public.analytics_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sql_query TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  is_shared BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analytics_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their queries"
  ON public.analytics_queries FOR SELECT
  USING (auth.uid() = created_by OR is_shared = true);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Analytics Core module exists at `src/modules/intelligence/analytics-core/`
- Routes configured in App.tsx
- Basic dashboard UI

### ⚠️ Partial
- Data may be mocked or static
- KPI calculations may not be dynamic
- Query builder may not be functional

### ❌ Missing
- Complete database schema for analytics
- Real-time event capture
- Custom query builder UI
- Export functionality (PDF/CSV)

---

## 🧪 Test Scenarios

### Scenario 1: Real-Time Event Capture
1. Navigate to any module
2. Perform actions (click, navigate, submit forms)
3. Check `analytics_events` table
4. **Expected**: Events are logged with correct properties

### Scenario 2: KPI Calculation
1. Navigate to `/analytics-core`
2. View dashboard with KPIs
3. Compare KPI values with raw data in Supabase
4. **Expected**: KPIs match calculated values

### Scenario 3: Custom Query Builder
1. Click "Create Custom Query"
2. Build query: SELECT COUNT(*) FROM analytics_events WHERE event_category = 'navigation'
3. Execute query
4. **Expected**: Query runs successfully, results displayed

### Scenario 4: RLS Validation
1. Login as User A
2. Create private dashboard
3. Login as User B
4. Try to view User A's private dashboard
5. **Expected**: Access denied

### Scenario 5: Export Report
1. Open dashboard with data
2. Click "Export to PDF"
3. **Expected**: PDF downloads with charts and tables
4. Click "Export to CSV"
5. **Expected**: CSV downloads with all data rows

---

## 📊 Performance Requirements

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Dashboard Load Time | <2s for 5K events | TBD | ⚠️ |
| KPI Calculation Time | <500ms | TBD | ⚠️ |
| Event Ingestion Rate | 1000 events/sec | TBD | ⚠️ |
| Query Execution | <5s for complex queries | TBD | ⚠️ |
| Export Speed (10K rows) | <10s | TBD | ⚠️ |

---

## 🚀 Next Steps

1. **Database Setup**
   - Create migration for all analytics tables
   - Add indexes for query performance
   - Configure RLS policies

2. **Event Tracking**
   - Implement global event listener
   - Add event capture hooks to key modules
   - Create event taxonomy

3. **Query Builder**
   - Design and implement query builder UI
   - Add SQL validation and sanitization
   - Create query template library

4. **Export Functionality**
   - Implement PDF export with charts
   - Add CSV export with proper formatting
   - Support Excel export (.xlsx)

5. **Testing**
   - Load test with 100K+ events
   - Validate RLS across different user roles
   - Test export with large datasets

---

**Status**: 🟡 Partial Implementation  
**Priority**: 🔴 High  
**Estimated Completion**: 8-10 hours
