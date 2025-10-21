# AI Insight Reporter & Observability - Nautilus One v3.6

## 📋 Overview

This implementation adds comprehensive observability and incident response capabilities to the Nautilus One platform. The system analyzes logs, detects anomalies, and sends real-time alerts via Supabase Functions and MQTT messaging.

## 🎯 Features

### 1. AI Insight Reporter (`src/lib/ai/insight-reporter.ts`)
- Detects and reports anomalies in real-time
- Supports three severity levels: `info`, `warning`, `critical`
- Stores incidents in Supabase database
- Broadcasts alerts via MQTT for instant notifications
- Includes optional metadata for detailed incident analysis

### 2. Secure MQTT Client (`src/lib/mqtt/secure-client.ts`)
- Wrapper around the existing MQTT client
- Ensures secure connections with TLS support
- Handles automatic connection management
- Provides singleton instance for consistent messaging

### 3. Supabase Edge Function (`supabase/functions/log_incident/index.ts`)
- Serverless function for incident persistence
- Stores incidents in the `incidents` table
- Validates and sanitizes incident data
- Returns standardized responses

### 4. Incident Dashboard (`src/components/system/incident-dashboard.tsx`)
- Real-time incident monitoring interface
- WebSocket connection for live updates
- Visual severity indicators (badges)
- Clean, accessible UI using shadcn/ui components

### 5. GitHub Actions Workflow (`.github/workflows/incident-observability.yml`)
- Automated observability checks every 30 minutes
- Sends telemetry to Supabase Edge Functions
- Publishes status updates via MQTT
- Can be triggered manually via workflow_dispatch

## 🚀 Quick Start

### Basic Usage

```typescript
import { AIInsightReporter } from "@/lib/ai/insight-reporter";

const reporter = new AIInsightReporter();

// Report an info-level anomaly
await reporter.reportAnomaly({
  module: "UserService",
  severity: "info",
  message: "User registration completed",
});

// Report a warning with metadata
await reporter.reportAnomaly({
  module: "APIGateway",
  severity: "warning",
  message: "API rate limit approaching",
  metadata: {
    currentRate: 950,
    limit: 1000,
  },
});

// Report a critical incident
await reporter.reportAnomaly({
  module: "PaymentProcessor",
  severity: "critical",
  message: "Payment gateway unavailable",
  metadata: {
    errorCode: "CONN_TIMEOUT",
    retryAttempts: 3,
  },
});
```

### Using the Incident Dashboard

```tsx
import { IncidentDashboard } from "@/components/system/incident-dashboard";

function MonitoringPage() {
  return (
    <div>
      <h1>System Monitoring</h1>
      <IncidentDashboard />
    </div>
  );
}
```

### Direct MQTT Communication

```typescript
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const mqtt = initSecureMQTT();

// Publish a message
mqtt.publish("nautilus/alerts", JSON.stringify({
  severity: "info",
  message: "System check completed",
}));

// Subscribe to alerts
mqtt.subscribe("nautilus/alerts", (message) => {
  const alert = JSON.parse(message);
  console.log("Received alert:", alert);
});
```

## 🧪 Testing

All components are thoroughly tested:

```bash
# Run all tests
npm test

# Run specific test suites
npm test src/tests/ai-insight-reporter.test.ts
npm test src/tests/secure-mqtt-client.test.ts
npm test src/tests/components/incident-dashboard.test.tsx
```

### Test Coverage
- **AI Insight Reporter**: 7 tests covering all severity levels and metadata handling
- **Secure MQTT Client**: 9 tests for connection management and API methods
- **Incident Dashboard**: 5 tests for rendering and WebSocket lifecycle

## 📊 Database Schema

The system requires an `incidents` table in Supabase:

```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX idx_incidents_module ON incidents(module);
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_WS_URL=wss://your_supabase_url/realtime/v1/websocket
```

### GitHub Secrets

For the CI/CD workflow, add these secrets to your repository:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations

## 📈 Monitoring & Alerts

### MQTT Topics

- `nautilus/alerts`: General system alerts
- `nautilus/incidents`: Critical incidents requiring immediate attention

### Alert Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| `info` | Informational events | No immediate action |
| `warning` | Potential issues | Monitor closely |
| `critical` | System failures | Immediate action required |

## 🔄 Integration Example

Complete integration with error handling:

```typescript
import { AIInsightReporter } from "@/lib/ai/insight-reporter";

class UserService {
  private reporter = new AIInsightReporter();

  async registerUser(userData: UserData) {
    try {
      const user = await this.createUser(userData);
      
      // Log successful registration
      await this.reporter.reportAnomaly({
        module: "UserService",
        severity: "info",
        message: "New user registered",
        metadata: { userId: user.id },
      });
      
      return user;
    } catch (error) {
      // Report critical error
      await this.reporter.reportAnomaly({
        module: "UserService",
        severity: "critical",
        message: "User registration failed",
        metadata: {
          error: error.message,
          userData: { email: userData.email }, // Don't log sensitive data
        },
      });
      
      throw error;
    }
  }
}
```

## 🛠️ Troubleshooting

### MQTT Connection Issues

If MQTT connection fails:

1. Check broker URL configuration
2. Verify network connectivity
3. Check WebSocket support in your environment
4. Review browser console for connection errors

### Supabase Function Errors

If incident logging fails:

1. Verify Supabase credentials
2. Check if `incidents` table exists
3. Ensure proper Row Level Security (RLS) policies
4. Review Supabase function logs

### WebSocket Issues

If the dashboard doesn't update:

1. Verify `VITE_SUPABASE_WS_URL` is correct
2. Check browser WebSocket support
3. Review network/firewall settings
4. Test WebSocket connection manually

## 📚 Architecture

```
┌─────────────────────┐
│  Application Code   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AIInsightReporter   │
└──────────┬──────────┘
           │
           ├──────────────────┐
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ Supabase Edge    │  │ MQTT Publisher   │
│ Function         │  │                  │
│ (log_incident)   │  │ (nautilus/alerts)│
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌──────────────────┐
│ PostgreSQL DB    │
│ (incidents table)│
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Incident         │
│ Dashboard        │
│ (React UI)       │
└──────────────────┘
```

## 🎯 Best Practices

1. **Use appropriate severity levels**: Reserve `critical` for actual emergencies
2. **Include relevant metadata**: Help with debugging and analysis
3. **Avoid sensitive data**: Don't log passwords, tokens, or PII
4. **Monitor incident volume**: Set up alerts for unusual patterns
5. **Regular cleanup**: Archive old incidents to maintain performance

## 📝 License

This feature is part of the Nautilus One platform. See the main repository LICENSE for details.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- All tests pass
- New features include tests
- Documentation is updated
- Code follows existing patterns

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the main project documentation
- Review existing test files for usage examples
