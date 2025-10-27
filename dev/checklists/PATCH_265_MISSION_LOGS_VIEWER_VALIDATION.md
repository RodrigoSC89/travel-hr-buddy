# 🧪 PATCH 265 – Mission Logs Viewer Validation

## 📋 Objective
Validar visualização de logs operacionais com filtros avançados e exportação.

---

## ✅ Validation Checklist

### 1️⃣ Log Display
- [ ] Logs aparecem corretamente em lista?
- [ ] Atualização em tempo real funciona?
- [ ] Paginação funciona para grandes volumes?
- [ ] Performance é adequada com 1000+ logs?
- [ ] Logs são ordenados corretamente (mais recentes primeiro)?

### 2️⃣ Filtering System
- [ ] Filtro por tipo de log funciona?
- [ ] Filtro por severidade funciona?
- [ ] Filtro por data/hora funciona?
- [ ] Filtro por usuário funciona?
- [ ] Filtro por módulo funciona?
- [ ] Múltiplos filtros podem ser combinados?

### 3️⃣ Search Functionality
- [ ] Busca por texto funciona?
- [ ] Busca é case-insensitive?
- [ ] Busca em tempo real (debounced)?
- [ ] Destaque de termos buscados?
- [ ] Busca avançada com operadores?

### 4️⃣ Export Features
- [ ] Exportação JSON funciona?
- [ ] Exportação CSV funciona?
- [ ] Exportação PDF funciona?
- [ ] Filtros aplicados são respeitados na exportação?
- [ ] Grandes volumes são exportados sem crash?

### 5️⃣ Timeline View
- [ ] Timeline interativo exibe eventos?
- [ ] Detalhes completos são mostrados ao clicar?
- [ ] Zoom in/out funciona?
- [ ] Navegação temporal é fluída?
- [ ] Eventos relacionados são agrupados?

---

## 🗄️ Required Database Schema

### Table: `mission_logs`
```sql
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  log_type TEXT CHECK (log_type IN ('info', 'warning', 'error', 'success', 'action', 'system')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  module_name TEXT,
  action TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  related_entity_type TEXT,
  related_entity_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_mission_logs_mission ON public.mission_logs(mission_id);
CREATE INDEX idx_mission_logs_type ON public.mission_logs(log_type);
CREATE INDEX idx_mission_logs_severity ON public.mission_logs(severity);
CREATE INDEX idx_mission_logs_created ON public.mission_logs(created_at DESC);
CREATE INDEX idx_mission_logs_user ON public.mission_logs(user_id);
CREATE INDEX idx_mission_logs_module ON public.mission_logs(module_name);

-- Full-text search index
CREATE INDEX idx_mission_logs_search ON public.mission_logs 
  USING gin(to_tsvector('english', coalesce(action, '') || ' ' || coalesce(description, '')));

ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for visible missions"
  ON public.mission_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = mission_logs.mission_id
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "System can create logs"
  ON public.mission_logs FOR INSERT
  WITH CHECK (true);
```

### Table: `system_audit_logs`
```sql
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT CHECK (log_type IN ('auth', 'data', 'security', 'system', 'api', 'integration')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  event_name TEXT NOT NULL,
  event_description TEXT,
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_logs_type ON public.system_audit_logs(log_type);
CREATE INDEX idx_audit_logs_severity ON public.system_audit_logs(severity);
CREATE INDEX idx_audit_logs_created ON public.system_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.system_audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON public.system_audit_logs(table_name);

-- Full-text search index
CREATE INDEX idx_audit_logs_search ON public.system_audit_logs 
  USING gin(to_tsvector('english', coalesce(event_name, '') || ' ' || coalesce(event_description, '')));

ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all audit logs"
  ON public.system_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'security_officer')
    )
  );

CREATE POLICY "Users can view their own audit logs"
  ON public.system_audit_logs FOR SELECT
  USING (auth.uid() = user_id);
```

### View: `log_statistics`
```sql
CREATE OR REPLACE VIEW public.log_statistics AS
SELECT 
  DATE(created_at) as log_date,
  log_type,
  severity,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(execution_time_ms) as avg_execution_time
FROM public.system_audit_logs
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY DATE(created_at), log_type, severity
ORDER BY log_date DESC, count DESC;
```

### Function: `search_logs`
```sql
CREATE OR REPLACE FUNCTION public.search_logs(
  search_query TEXT,
  log_types TEXT[] DEFAULT NULL,
  severities TEXT[] DEFAULT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  log_type TEXT,
  severity TEXT,
  action TEXT,
  description TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.log_type,
    ml.severity,
    ml.action,
    ml.description,
    ml.user_name,
    ml.created_at,
    ts_rank(
      to_tsvector('english', coalesce(ml.action, '') || ' ' || coalesce(ml.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.mission_logs ml
  WHERE 
    (search_query IS NULL OR 
     to_tsvector('english', coalesce(ml.action, '') || ' ' || coalesce(ml.description, '')) @@ plainto_tsquery('english', search_query))
    AND (log_types IS NULL OR ml.log_type = ANY(log_types))
    AND (severities IS NULL OR ml.severity = ANY(severities))
    AND (start_date IS NULL OR ml.created_at >= start_date)
    AND (end_date IS NULL OR ml.created_at <= end_date)
  ORDER BY rank DESC, ml.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Basic log display may exist

### ⚠️ Partial
- Filtering may be limited
- Real-time updates may not work

### ❌ Missing
- Advanced filtering system
- Real-time WebSocket updates
- Export functionality
- Timeline view
- Full-text search

---

## 🧪 Test Scenarios

### Scenario 1: View Logs
1. Navigate to Mission Logs Viewer
2. **Expected**:
   - Logs displayed in reverse chronological order
   - Each log shows: timestamp, type, severity, action, user
   - Pagination controls visible
   - Real-time updates when new log arrives

### Scenario 2: Filter by Severity
1. Select filter: Severity = "critical"
2. **Expected**:
   - Only critical logs shown
   - Count updated
   - Other logs hidden
   - Filter badge shown

### Scenario 3: Filter by Date Range
1. Select "Last 7 days"
2. **Expected**:
   - Only logs from last 7 days shown
   - Count reflects filtered data
   - Date range indicator shown

### Scenario 4: Combine Filters
1. Filter: Type = "error", Severity = "high", Module = "fuel-optimizer"
2. **Expected**:
   - All filters applied simultaneously
   - Results match all criteria
   - Clear active filters UI

### Scenario 5: Search Logs
1. Enter search term: "fuel calculation"
2. **Expected**:
   - Results filtered by search term
   - Matched terms highlighted
   - Search updates as user types (debounced)

### Scenario 6: Export to JSON
1. Apply filters: Severity = "high", Last 30 days
2. Click "Export JSON"
3. **Expected**:
   - JSON file downloaded
   - Contains only filtered logs
   - Properly formatted
   - Includes metadata

### Scenario 7: Export to CSV
1. Select multiple filters
2. Click "Export CSV"
3. **Expected**:
   - CSV file downloaded
   - Headers included
   - Data properly escaped
   - Opens correctly in Excel/Sheets

### Scenario 8: Export to PDF
1. Filter logs
2. Click "Export PDF"
3. **Expected**:
   - PDF generated with:
     - Title and date range
     - Applied filters shown
     - Logs in table format
     - Page numbers

### Scenario 9: Timeline View
1. Switch to "Timeline" tab
2. **Expected**:
   - Events displayed chronologically
   - Interactive timeline with zoom
   - Click event shows details
   - Related events grouped

### Scenario 10: Real-time Updates
1. Open logs viewer in one browser
2. Trigger action in another browser (create mission)
3. **Expected**:
   - New log appears automatically in first browser
   - No page refresh needed
   - Smooth animation

---

## 📊 Log Types & Severities

| Log Type | Description | Common Severity |
|----------|-------------|-----------------|
| **info** | General information | Low |
| **warning** | Warning messages | Medium |
| **error** | Error events | High |
| **success** | Successful operations | Low |
| **action** | User actions | Low-Medium |
| **system** | System events | Low-High |

---

## ⚡ Performance Requirements

| Metric | Target | Acceptable | Status |
|--------|--------|------------|--------|
| Initial Load (100 logs) | <500ms | <1s | ⚠️ |
| Filter Application | <200ms | <500ms | ⚠️ |
| Search Response | <300ms | <700ms | ⚠️ |
| Real-time Update Latency | <1s | <2s | ⚠️ |
| Export 1000 logs | <3s | <5s | ⚠️ |

---

## 🚀 Next Steps

1. **UI Development**
   - Create log viewer component
   - Build filter panel
   - Add search bar
   - Implement pagination

2. **Real-time Integration**
   - Set up Supabase Realtime
   - Subscribe to log inserts
   - Handle connection states
   - Optimize update frequency

3. **Search & Filter**
   - Implement full-text search
   - Add advanced filter options
   - Support filter combinations
   - Add saved filter presets

4. **Export System**
   - JSON export with pretty print
   - CSV export with proper escaping
   - PDF generation with jsPDF
   - Support large exports

5. **Timeline View**
   - Create interactive timeline
   - Implement zoom/pan
   - Add event grouping
   - Show relationships

6. **Testing**
   - Test with large datasets (10k+ logs)
   - Validate all filter combinations
   - Test export formats
   - Verify real-time updates

---

**Status**: 🟡 Partial Implementation  
**Priority**: 🟠 Medium-High  
**Estimated Completion**: 8-10 hours
