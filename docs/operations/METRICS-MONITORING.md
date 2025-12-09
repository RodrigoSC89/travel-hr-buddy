# 📊 Métricas e Observabilidade - Nautilus One

> **Última Atualização:** 2025-12-09  
> **Status:** Configurado para integração  

---

## 📋 Métricas Essenciais

### 1. Uso por Módulo

```sql
-- Query para analytics de uso por módulo
SELECT 
  module_accessed,
  COUNT(*) as total_accesses,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', timestamp) as date
FROM access_logs
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY module_accessed, DATE_TRUNC('day', timestamp)
ORDER BY date DESC, total_accesses DESC;
```

**Métricas Coletadas:**
- Acessos totais por módulo
- Usuários únicos por módulo
- Tempo médio de sessão
- Taxa de retenção

### 2. Falhas de Edge Functions

```sql
-- Query para monitorar falhas de edge functions
SELECT 
  function_name,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  AVG(execution_time_ms) as avg_time_ms,
  DATE_TRUNC('hour', created_at) as hour
FROM edge_function_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY function_name, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC, errors DESC;
```

**Alertas Configurados:**
- Taxa de erro > 5%
- Tempo de resposta > 5s
- Função indisponível por > 1 min

### 3. Latência por Endpoint

```sql
-- Query para latência de API
SELECT 
  endpoint,
  method,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99,
  AVG(response_time_ms) as avg_ms
FROM api_gateway_requests
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint, method
ORDER BY p95 DESC;
```

---

## 📈 Dashboard Templates

### Dashboard Principal - Grafana

```yaml
# grafana-dashboard-main.yaml
apiVersion: 1
providers:
  - name: 'Nautilus One'
    orgId: 1
    folder: 'Nautilus'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards

panels:
  - title: "Requests/Minute"
    type: graph
    datasource: prometheus
    targets:
      - expr: rate(http_requests_total[1m])
        legendFormat: "{{method}} {{endpoint}}"
    
  - title: "Error Rate"
    type: stat
    datasource: prometheus
    targets:
      - expr: sum(rate(http_requests_total{status="5xx"}[5m])) / sum(rate(http_requests_total[5m])) * 100
        
  - title: "Active Users"
    type: gauge
    datasource: postgres
    targets:
      - rawSql: |
          SELECT COUNT(DISTINCT user_id) 
          FROM access_logs 
          WHERE timestamp > NOW() - INTERVAL '15 minutes'
          
  - title: "Module Usage"
    type: piechart
    datasource: postgres
    targets:
      - rawSql: |
          SELECT module_accessed, COUNT(*) as count
          FROM access_logs
          WHERE timestamp > NOW() - INTERVAL '24 hours'
          GROUP BY module_accessed
          ORDER BY count DESC
          LIMIT 10
```

### Dashboard de Performance

```yaml
# grafana-dashboard-performance.yaml
panels:
  - title: "Core Web Vitals"
    type: timeseries
    targets:
      - expr: web_vitals_lcp_seconds
        legendFormat: "LCP"
      - expr: web_vitals_fid_seconds
        legendFormat: "FID"
      - expr: web_vitals_cls
        legendFormat: "CLS"
        
  - title: "Bundle Size Trend"
    type: graph
    targets:
      - expr: build_bundle_size_bytes
        legendFormat: "Total Bundle"
        
  - title: "Memory Usage"
    type: gauge
    targets:
      - expr: browser_memory_used_bytes
```

---

## 🔔 Alertas Configurados

### Logtail/Betterstack

```json
{
  "alerts": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 5%",
      "window": "5m",
      "severity": "critical",
      "channels": ["slack", "email"]
    },
    {
      "name": "Slow Response Time",
      "condition": "p95_latency > 3000ms",
      "window": "10m", 
      "severity": "warning",
      "channels": ["slack"]
    },
    {
      "name": "Database Connection Errors",
      "condition": "db_connection_errors > 0",
      "window": "1m",
      "severity": "critical",
      "channels": ["pagerduty"]
    },
    {
      "name": "Edge Function Timeout",
      "condition": "function_timeout_count > 5",
      "window": "5m",
      "severity": "warning",
      "channels": ["slack"]
    }
  ]
}
```

---

## 📊 Métricas de Negócio

### KPIs Operacionais

| Métrica | Descrição | Meta | Query |
|---------|-----------|------|-------|
| DAU | Usuários ativos diários | >100 | `COUNT(DISTINCT user_id) WHERE date = today` |
| MAU | Usuários ativos mensais | >500 | `COUNT(DISTINCT user_id) WHERE date > today - 30` |
| Session Duration | Tempo médio de sessão | >10min | `AVG(session_end - session_start)` |
| Bounce Rate | Taxa de rejeição | <40% | Single page visits / Total visits |
| Feature Adoption | Adoção de features | >60% | Active features / Total features |

### Métricas de Sistema

| Métrica | Target | Alerta |
|---------|--------|--------|
| Uptime | 99.9% | <99.5% |
| Response Time (p95) | <500ms | >1000ms |
| Error Rate | <1% | >3% |
| CPU Usage | <70% | >85% |
| Memory Usage | <80% | >90% |

---

## 🔧 Implementação

### Web Vitals Reporter

```typescript
// src/lib/monitoring/web-vitals-reporter.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

const reportWebVitals = (metric: any) => {
  // Report to analytics
  console.log(metric);
  
  // Send to Supabase
  supabase.functions.invoke('report-web-vitals', {
    body: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    }
  });
};

export const initWebVitals = () => {
  onCLS(reportWebVitals);
  onFID(reportWebVitals);
  onLCP(reportWebVitals);
  onFCP(reportWebVitals);
  onTTFB(reportWebVitals);
};
```

### Error Tracking

```typescript
// src/lib/monitoring/error-tracker.ts
import * as Sentry from '@sentry/react';

export const initErrorTracking = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};
```

---

## 📋 Checklist de Observabilidade

- [x] Web Vitals configurado
- [x] Error tracking (Sentry ready)
- [x] Access logs no Supabase
- [x] Edge function logs
- [ ] Grafana dashboards (templates prontos)
- [ ] Logtail integração
- [ ] PagerDuty alertas
- [ ] Uptime monitoring

---

*Documentação de métricas e observabilidade.*
