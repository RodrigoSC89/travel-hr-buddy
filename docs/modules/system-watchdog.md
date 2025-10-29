# System Watchdog Module

## Visão Geral

O System Watchdog é o módulo de monitoramento de saúde do sistema, fornecendo observabilidade completa, alertas proativos e diagnósticos automatizados para garantir a disponibilidade e performance do sistema.

**Categoria**: Operations / System  
**Rota**: `/system-watchdog`  
**Status**: Ativo  
**Versão**: 2.0

## Componentes Principais

### HealthDashboard
- Status geral do sistema
- Service health checks
- Performance metrics
- Alert summary
- Uptime statistics

### ServiceMonitor
- Monitoramento de serviços individuais
- API endpoint health
- Database connection status
- Third-party services
- Microservices health

### PerformanceMonitor
- Response time tracking
- Throughput metrics
- Resource utilization (CPU, memory, disk)
- Database performance
- Network latency

### AlertManager
- Real-time alerts
- Alert rules configuration
- Escalation policies
- Notification channels
- Alert history

### DiagnosticTools
- Automated diagnostics
- Log analysis
- Error pattern detection
- Performance profiling
- Troubleshooting guides

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE system_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  response_time INTEGER,
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value DECIMAL(15, 4),
  unit VARCHAR(20),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  service_name VARCHAR(100),
  threshold_value DECIMAL(15, 4),
  current_value DECIMAL(15, 4),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  triggered_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagnostic_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  findings TEXT NOT NULL,
  recommendations TEXT,
  automated BOOLEAN DEFAULT TRUE,
  executed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Health Checks
- **GET /api/system/health** - Overall system health
- **GET /api/system/health/:service** - Service health
- **POST /api/system/health/check** - Manual health check
- **GET /api/system/health/history** - Health history

### Performance Monitoring
- **GET /api/system/metrics** - Current metrics
- **GET /api/system/metrics/history** - Historical metrics
- **GET /api/system/performance** - Performance summary
- **WebSocket /ws/system/metrics** - Real-time metrics stream

### Alerts
- **GET /api/system/alerts** - Lista alertas
- **GET /api/system/alerts/active** - Alertas ativos
- **PUT /api/system/alerts/:id/acknowledge** - Acknowledges alert
- **PUT /api/system/alerts/:id/resolve** - Resolve alert
- **POST /api/system/alerts/rules** - Cria regra de alerta

### Diagnostics
- **POST /api/system/diagnose** - Executa diagnóstico
- **GET /api/system/diagnostics** - Histórico de diagnósticos
- **GET /api/system/logs** - System logs
- **POST /api/system/analyze-logs** - Análise de logs

## Monitoramento de Serviços

### Core Services
- Web Application
- API Gateway
- Database (Supabase)
- Authentication service
- File storage

### Third-party Services
- Email service (SMTP)
- SMS service
- Weather API
- Satellite API
- AI/ML services

### Infrastructure
- Server health
- Network connectivity
- CDN status
- Load balancer
- DNS resolution

## Métricas Monitoradas

### Application Metrics
- Request rate
- Response time
- Error rate
- Success rate
- Concurrent users

### System Metrics
- CPU utilization
- Memory usage
- Disk I/O
- Network bandwidth
- Database connections

### Business Metrics
- Active users
- Transactions per minute
- Module usage
- API calls
- Data throughput

## Alerting Rules

### Threshold-based Alerts
- Value exceeds threshold
- Value below threshold
- Rapid change detection
- Sustained deviation

### Pattern-based Alerts
- Error spike detection
- Unusual activity patterns
- Anomaly detection
- Trend-based alerts

### Service-based Alerts
- Service down
- Service degraded
- Slow response
- Connection failures

## Escalation Policies

### Level 1: Information
- Email notification
- Dashboard indicator
- Log entry
- Auto-resolution attempts

### Level 2: Warning
- Email + SMS
- Dashboard alert
- Slack notification
- Team lead notification

### Level 3: Critical
- Phone call
- PagerDuty
- Multiple channels
- Management escalation

## Automated Diagnostics

### Issue Detection
- Automatic problem identification
- Root cause analysis
- Impact assessment
- Related issues correlation

### Recommendations
- Suggested fixes
- Workarounds
- Escalation paths
- Documentation links

### Auto-remediation
- Automatic service restart
- Cache clearing
- Connection pool reset
- Database optimization

## Integrações

### All Modules
- Health status tracking
- Performance monitoring
- Error tracking
- Usage analytics

### Logs Center
- Centralized logging
- Log correlation
- Error aggregation
- Audit trails

### Admin Dashboard
- System overview
- Management reports
- SLA tracking
- Capacity planning

## SLA Monitoring

- **Uptime SLA**: Target 99.9%
- **Response Time SLA**: < 500ms (p95)
- **Error Rate SLA**: < 0.1%
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes

## Testes

Localização: 
- `tests/system-health.test.tsx`
- `tests/nautilus-core.test.ts`

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 2.0  
**Features**: Real-time monitoring, Auto-diagnostics, Alerting
