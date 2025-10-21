# Observability and Incident Response - Nautilus One

## Overview

This implementation provides a comprehensive observability and incident response system for Nautilus One, including:

- **Database Layer**: Incidents table with RLS policies
- **Edge Function**: `log-incident` for centralized logging
- **Real-time Alerts**: MQTT integration for instant notifications
- **AI Insight Reporter**: Unified API for incident reporting
- **Dashboard**: Admin UI for incident monitoring
- **CI/CD Integration**: GitHub Actions heartbeat monitoring

## Architecture

```
┌─────────────────┐
│  Application    │
│   Modules       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ AI Insight      │─────▶│ Supabase     │
│ Reporter        │      │ Edge Function│
└────────┬────────┘      └──────┬───────┘
         │                      │
         │                      ▼
         │              ┌──────────────┐
         │              │  Incidents   │
         │              │    Table     │
         │              └──────────────┘
         │
         ▼
┌─────────────────┐
│  MQTT Broker    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Real-time      │
│  Subscribers    │
└─────────────────┘
```

## Usage

### 1. Basic Usage

```typescript
import { AIInsightReporter } from "@/lib/ai/ai-insight-reporter";

const reporter = new AIInsightReporter();

// Report an info-level incident
await reporter.report({
  module: "DPIntelligence",
  severity: "info",
  message: "Module initialized successfully",
  metadata: { version: "1.0.0" }
});

// Report a warning
await reporter.report({
  module: "ControlHub",
  severity: "warning",
  message: "API response time exceeded threshold",
  metadata: { responseTime: 3500, threshold: 3000 }
});

// Report a critical incident
await reporter.report({
  module: "Forecast",
  severity: "critical",
  message: "Failed to generate forecast",
  metadata: { error: "Database connection timeout", component: "ForecastEngine" }
});
```

### 2. Integration Examples

#### In a React Component

```typescript
import { AIInsightReporter } from "@/lib/ai/ai-insight-reporter";

function MyComponent() {
  const reporter = new AIInsightReporter();

  const handleAction = async () => {
    try {
      // Your logic here
      await someOperation();
      
      // Log success
      await reporter.report({
        module: "MyComponent",
        severity: "info",
        message: "Operation completed successfully"
      });
    } catch (error) {
      // Log error
      await reporter.report({
        module: "MyComponent",
        severity: "critical",
        message: "Operation failed",
        metadata: { error: error.message }
      });
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

#### In a Service

```typescript
import { AIInsightReporter } from "@/lib/ai/ai-insight-reporter";

export class DataService {
  private reporter = new AIInsightReporter();

  async fetchData() {
    try {
      const response = await fetch("/api/data");
      
      if (!response.ok) {
        await this.reporter.report({
          module: "DataService",
          severity: "warning",
          message: `API returned ${response.status}`,
          metadata: { status: response.status, endpoint: "/api/data" }
        });
      }
      
      return await response.json();
    } catch (error) {
      await this.reporter.report({
        module: "DataService",
        severity: "critical",
        message: "Failed to fetch data",
        metadata: { error: error.message }
      });
      throw error;
    }
  }
}
```

### 3. Monitoring Incidents

Access the incident dashboard at:
```
/admin/incidents
```

The dashboard shows:
- Real-time incident feed
- Severity indicators (color-coded badges)
- Module information
- Timestamps
- Custom metadata

### 4. MQTT Integration

MQTT provides real-time notifications. Configure in `.env`:

```bash
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
# Optional authentication
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

Incidents are published to the `nautilus/alerts` topic with the following payload:

```json
{
  "module": "DPIntelligence",
  "severity": "critical",
  "message": "System alert",
  "metadata": {},
  "timestamp": "2025-10-21T04:00:00.000Z",
  "source": "AIInsightReporter"
}
```

### 5. Edge Function

The `log-incident` Edge Function can be called directly:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/log-incident" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "CI",
    "severity": "info",
    "message": "Deployment successful",
    "metadata": {"version": "1.2.3"}
  }'
```

## Database Schema

```sql
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  severity text not null check (severity in ('info','warning','critical')),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index incidents_created_at_idx on incidents (created_at desc);
create index incidents_severity_idx on incidents (severity);
create index incidents_module_idx on incidents (module);
```

## Environment Variables

### Supabase Secrets (Edge Functions)
Set via `supabase secrets set KEY=value`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Application Environment
Set in Vercel/deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MQTT_URL` (optional)
- `VITE_MQTT_USERNAME` (optional)
- `VITE_MQTT_PASSWORD` (optional)

### GitHub Actions
Set as repository secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deployment

```bash
# 1. Apply database migration
supabase db push

# 2. Deploy the Edge Function
supabase functions deploy log-incident

# 3. Configure secrets
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 4. Deploy application with environment variables
vercel --prod
```

## Testing

Run tests:
```bash
npm run test -- tests/ai-insight-reporter.test.ts
```

## Monitoring

- **Dashboard**: `/admin/incidents` - Real-time incident monitoring
- **GitHub Actions**: Automated heartbeat every 30 minutes
- **MQTT**: Subscribe to `nautilus/alerts` for real-time notifications

## Best Practices

1. **Use appropriate severity levels**:
   - `info`: Normal operations, successful completions
   - `warning`: Degraded performance, non-critical issues
   - `critical`: System failures, data loss, security issues

2. **Include relevant metadata**:
   ```typescript
   await reporter.report({
     module: "PaymentService",
     severity: "critical",
     message: "Payment processing failed",
     metadata: {
       userId: user.id,
       amount: payment.amount,
       error: error.message,
       timestamp: Date.now()
     }
   });
   ```

3. **Don't overlog**:
   - Use `info` sparingly for important milestones only
   - Aggregate similar events to avoid spam
   - Consider rate limiting for high-frequency events

4. **Monitor the dashboard**:
   - Check `/admin/incidents` regularly
   - Set up alerts for critical incidents
   - Review patterns to identify systemic issues

## Troubleshooting

### MQTT not connecting
- Check `VITE_MQTT_URL` is set correctly
- Verify network connectivity to broker
- Check authentication credentials if required
- The system will function without MQTT (graceful degradation)

### Edge Function errors
- Verify secrets are set: `supabase secrets list`
- Check function logs: `supabase functions logs log-incident`
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has correct permissions

### Dashboard not updating
- Verify Realtime is enabled in Supabase project
- Check browser console for connection errors
- Ensure RLS policies allow authenticated users to read

## Future Enhancements

- Email notifications for critical incidents
- Slack/Discord integration
- Incident aggregation and analytics
- Automated incident resolution workflows
- Machine learning for anomaly detection
