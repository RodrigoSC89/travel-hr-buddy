# Health Monitor Module

> **Status**: 🚧 PATCH 623 Implementation | **Version**: 3.5.0 

## 📋 Objective

The Health Monitor module provides proactive system health monitoring with:
- Real-time service status checks
- Automated health verification every 5 minutes
- Visual dashboard with status indicators
- Toast and webhook notifications for failures
- Historical health logs

## 📁 File Structure

```
src/modules/health-monitor/
├── components/
│   ├── HealthMonitorDashboard.tsx  # Main dashboard
│   ├── ServiceStatusCard.tsx       # Individual service status
│   ├── HealthTimeline.tsx          # Historical view
│   └── AlertConfig.tsx             # Alert configuration
├── hooks/
│   ├── useHealthCheck.ts           # Health check logic
│   ├── useHealthHistory.ts         # Historical data
│   └── useAlerts.ts                # Alert management
├── services/
│   ├── health-service.ts           # Health check service
│   └── alert-service.ts            # Notification service
└── types/
    └── health.ts                   # Type definitions

src/pages/admin/
└── HealthMonitor.tsx               # Admin page route
```

## 🗄️ Database Tables (Supabase)

### `system_health_logs`
```sql
CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tenant_id UUID REFERENCES tenants(id)
);

CREATE INDEX idx_health_logs_service ON system_health_logs(service_name);
CREATE INDEX idx_health_logs_checked_at ON system_health_logs(checked_at DESC);
CREATE INDEX idx_health_logs_status ON system_health_logs(status);
```

### `health_alert_config`
```sql
CREATE TABLE health_alert_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  webhook_url TEXT,
  email_recipients TEXT[],
  slack_channel TEXT,
  threshold_failures INTEGER DEFAULT 2,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔌 Integrations

### Services Monitored

1. **Database (Supabase)**
   - Connection test
   - Query performance
   - Storage availability

2. **MQTT Broker**
   - Connection status
   - Message queue health
   - Latency check

3. **ONNX Runtime**
   - Model loading status
   - Inference performance
   - Memory usage

4. **LLM APIs**
   - OpenAI API status
   - Response time
   - Rate limit status

5. **System Resources**
   - CPU usage
   - Memory usage
   - Disk space

### External Notifications
- **Webhook**: Custom HTTP POST
- **Slack**: Via Slack webhook
- **Email**: Via SMTP or service provider

## 🎨 UI Components

### HealthMonitorDashboard
Main dashboard showing all services with:
- Color-coded status indicators (🟢 green, 🟡 yellow, 🔴 red)
- Real-time updates
- Last check timestamp
- Quick action buttons

### ServiceStatusCard
Individual service card with:
- Service name and icon
- Current status
- Response time
- Recent history (sparkline)
- Error details (if any)

### HealthTimeline
Historical view showing:
- Status over time
- Incident timeline
- Downtime statistics
- Performance trends

## ✅ Status

**Current Implementation**: PATCH 623 (Planned)

- [ ] Core health check service
- [ ] Database monitoring
- [ ] MQTT monitoring
- [ ] ONNX monitoring
- [ ] LLM API monitoring
- [ ] System resource monitoring
- [ ] Dashboard UI
- [ ] Alert configuration
- [ ] Webhook notifications
- [ ] Email notifications
- [ ] Slack integration
- [ ] Historical logging
- [ ] Scheduled checks (5 min intervals)

## 💡 Usage Examples

### Health Check Service

```typescript
// src/modules/health-monitor/services/health-service.ts
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  error?: string;
  metadata?: Record<string, any>;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('system_health_logs')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        service: 'database',
        status: 'down',
        responseTime,
        error: error.message
      };
    }
    
    return {
      service: 'database',
      status: responseTime < 100 ? 'healthy' : 'degraded',
      responseTime
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'down',
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}
```

### Using Health Checks in Components

```typescript
import { useHealthCheck } from '@/modules/health-monitor/hooks/useHealthCheck';

function HealthMonitorDashboard() {
  const { services, isChecking, runHealthCheck } = useHealthCheck();
  
  useEffect(() => {
    // Run initial check
    runHealthCheck();
    
    // Schedule periodic checks (5 minutes)
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <ServiceStatusCard key={service.name} service={service} />
      ))}
    </div>
  );
}
```

### Alert Configuration

```typescript
import { useAlerts } from '@/modules/health-monitor/hooks/useAlerts';

function AlertConfig() {
  const { updateAlertConfig } = useAlerts();
  
  const handleSave = async (config) => {
    await updateAlertConfig({
      service_name: 'database',
      enabled: true,
      webhook_url: 'https://hooks.slack.com/services/...',
      threshold_failures: 2
    });
  };
  
  return <AlertConfigForm onSave={handleSave} />;
}
```

## 🔐 Permissions

- Admin-only access to health monitor dashboard
- Health logs respect tenant boundaries
- Alert configuration per tenant

## 📈 Performance Considerations

- Health checks run asynchronously
- Results cached for 30 seconds
- Failed checks trigger immediate retry (max 3 attempts)
- Historical data aggregated daily after 30 days
- Automatic cleanup of logs older than 90 days

## 🧪 Testing

```bash
# Run health monitor tests
npm run test -- health-monitor

# Test specific service check
npm run test -- health-service.test.ts
```

## 📊 Monitoring Thresholds

| Service | Healthy | Degraded | Down |
|---------|---------|----------|------|
| Database | < 100ms | 100-500ms | > 500ms or error |
| MQTT | < 50ms | 50-200ms | > 200ms or error |
| ONNX | < 200ms | 200-1000ms | > 1000ms or error |
| LLM API | < 2s | 2-5s | > 5s or error |
| CPU | < 70% | 70-90% | > 90% |
| Memory | < 80% | 80-95% | > 95% |

## 🐛 Troubleshooting

**Issue**: Health checks failing
- Verify network connectivity
- Check service credentials
- Review firewall rules

**Issue**: Alerts not sending
- Verify webhook URL is accessible
- Check email configuration
- Ensure alert config is enabled

**Issue**: High false positive rate
- Adjust threshold_failures setting
- Increase response time thresholds
- Review network latency

## 📚 Related Documentation

- [System Architecture](../architecture.md)
- [Monitoring & Observability](../PATCH-67.5-MONITORING-OBSERVABILITY.md)
- [Database Schema](./INCIDENT_RESPONSE_SUPABASE_SCHEMA.md)

---

**Last Updated**: 2025-11-02 (PATCH 623)
**Maintainer**: Development Team
**Route**: `/admin/health-monitor`
