# Observability & Incident Response - Quick Reference

## Quick Start

### 1. Report an Incident

```typescript
import { AIInsightReporter } from "@/lib/ai/ai-insight-reporter";

const reporter = new AIInsightReporter();

await reporter.report({
  module: "YourModule",
  severity: "critical",  // or "warning" or "info"
  message: "Something went wrong",
  metadata: { /* optional context */ }
});
```

### 2. View Incidents Dashboard

Navigate to `/admin/incidents` in your app to see real-time incident monitoring.

## Key Components

### AI Insight Reporter
**Location**: `src/lib/ai/insight-reporter.ts`

**Methods**:
- `report(event)` - Report a new incident
- `reportAnomaly(event)` - Deprecated, use `report()` instead

**Event Structure**:
```typescript
{
  module: string;           // e.g., "DPIntelligence", "ControlHub"
  severity: "info" | "warning" | "critical";
  message: string;          // Human-readable description
  metadata?: Record<string, unknown>;  // Optional context
}
```

### Incidents Table
**Location**: `supabase/migrations/20251021100000_create_incidents_table.sql`

**Schema**:
- `id` - UUID primary key
- `module` - Origin module name
- `severity` - info, warning, or critical
- `message` - Incident description
- `metadata` - JSONB for additional context
- `timestamp` - When incident occurred
- `created_at` - When record was created

**Indexes**:
- `created_at` (DESC) - For recent incidents
- `severity` - For filtering by severity
- `module` - For filtering by module

### Log Incident Function
**Location**: `supabase/functions/log_incident/index.ts`

**Endpoint**: Edge function called via Supabase Functions
**Method**: POST
**Validation**:
- Requires: `module`, `severity`, `message`
- Optional: `metadata`, `timestamp`

### MQTT Client
**Location**: `src/lib/mqtt/secure-client.ts`

**Function**: `initSecureMQTT()`
**Returns**: MqttClient or mock client (if disabled)
**Topic**: `nautilus/alerts`

### Incident Dashboard
**Location**: `src/pages/admin/incidents.tsx`
**Route**: `/admin/incidents`

**Features**:
- Real-time updates via Supabase Realtime
- Color-coded severity badges
- Expandable metadata view
- Shows last 50 incidents

## Environment Variables

### Required (App)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Optional (MQTT)
```bash
VITE_MQTT_URL=wss://your-broker:8884/mqtt
VITE_MQTT_USERNAME=your_username  # optional
VITE_MQTT_PASSWORD=your_password  # optional
```

### Required (Supabase Secrets)
```bash
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Common Use Cases

### Log a Critical System Error
```typescript
await reporter.report({
  module: "DatabaseService",
  severity: "critical",
  message: "Database connection lost",
  metadata: { 
    error: "Connection timeout",
    lastPing: new Date().toISOString()
  }
});
```

### Log a Warning
```typescript
await reporter.report({
  module: "APIService",
  severity: "warning",
  message: "API rate limit approaching",
  metadata: { 
    currentRate: 950,
    maxRate: 1000,
    endpoint: "/api/users"
  }
});
```

### Log an Info Event
```typescript
await reporter.report({
  module: "Scheduler",
  severity: "info",
  message: "Daily backup completed successfully",
  metadata: { 
    backupSize: "2.5GB",
    duration: "15 minutes"
  }
});
```

## Deployment Checklist

- [ ] Apply database migration: `supabase db push`
- [ ] Deploy edge function: `supabase functions deploy log-incident`
- [ ] Set Supabase secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Configure app environment variables
- [ ] (Optional) Configure MQTT broker URL and credentials
- [ ] Deploy app: `vercel --prod`
- [ ] Test incident reporting
- [ ] Verify dashboard at `/admin/incidents`

## Troubleshooting

### MQTT Not Working
- Check if `VITE_MQTT_URL` is set
- Verify broker URL format: `wss://broker:port/mqtt`
- Check username/password if required
- System will work without MQTT (graceful degradation)

### Incidents Not Showing in Dashboard
- Verify RLS policies are enabled
- Check if user is authenticated
- Confirm edge function is deployed
- Check browser console for errors

### Edge Function Errors
- Verify Supabase secrets are set
- Check function logs: `supabase functions logs log-incident`
- Ensure incidents table exists

## Monitoring

### Cron Job Health Check
A cron job runs every 30 minutes to ensure the observability pipeline is functional.

**Configuration**: `supabase/config.toml`
```toml
[[edge_runtime.cron]]
name = "nautilus-observability-heartbeat"
function_name = "log-incident"
schedule = "*/30 * * * *"
```

## Support

For issues or questions, refer to:
- `IMPLEMENTATION_SUMMARY_OBSERVABILITY.md` - Full implementation details
- Supabase documentation: https://supabase.com/docs
- MQTT.js documentation: https://github.com/mqttjs/MQTT.js
