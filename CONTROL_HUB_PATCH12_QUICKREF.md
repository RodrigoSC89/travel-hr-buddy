# ControlHub Patch 12 - Quick Reference

## 🚀 Quick Start

### Access ControlHub

Navigate to `/control-hub` in your application to view the observability dashboard.

## 📦 Components

### ControlHubPanel

Real-time metrics panel with MQTT updates.

```tsx
import ControlHubPanel from "@/components/control-hub/ControlHubPanel";

<ControlHubPanel />
```

**Displays:**
- Total Power (MW)
- Heading (degrees)
- Oceanic Forecast (meters)
- Active Thrusters count

### SystemAlerts

Real-time alert monitoring with severity indicators.

```tsx
import SystemAlerts from "@/components/control-hub/SystemAlerts";

<SystemAlerts />
```

**Features:**
- Shows last 5 alerts
- Color-coded severity (🔴 high, 🟢 normal)
- Auto-refresh via MQTT

### AIInsightReporter

AI-powered analysis and reporting.

```tsx
import AIInsightReporter from "@/components/control-hub/AIInsightReporter";

<AIInsightReporter />
```

**Features:**
- Performance analysis
- Anomaly detection
- PDF export capability

## 📡 MQTT Channels

### Subscribe to DP Telemetry

```typescript
import { subscribeDP } from "@/lib/mqtt/publisher";

const client = subscribeDP((data) => {
  console.log("DP Data:", data);
  // data.power, data.heading, data.thrusters
});

// Cleanup
useEffect(() => {
  return () => client.end();
}, []);
```

### Subscribe to Forecast Data

```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

const client = subscribeForecast((data) => {
  console.log("Forecast:", data);
  // data.value (wave height in meters)
});
```

### Subscribe to Alerts

```typescript
import { subscribeAlerts } from "@/lib/mqtt/publisher";

const client = subscribeAlerts((data) => {
  console.log("Alert:", data);
  // data.severity, data.message
});
```

## 🗄️ Supabase Edge Function

### Invoke Alerting Function

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke("alerting");

if (data) {
  console.log(`Found ${data.alerts_count} alerts`);
}
```

### Manual Trigger via HTTP

```bash
curl -X POST https://your-project.supabase.co/functions/v1/alerting \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📊 Data Models

### DP Telemetry Message

```typescript
interface DPData {
  power: number;      // MW
  heading: number;    // degrees (0-360)
  thrusters: number;  // count (0-6)
}
```

### Forecast Message

```typescript
interface ForecastData {
  value: number;      // meters (wave height)
}
```

### Alert Message

```typescript
interface AlertData {
  severity: "low" | "normal" | "high" | "critical";
  message: string;
  timestamp?: string;
  source?: string;
}
```

## 🔧 Configuration

### Environment Variables

```bash
# .env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

### Database Table

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT,
  metadata JSONB
);
```

## 🧪 Testing

### Test MQTT Connection

```typescript
import mqtt from "mqtt";

const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);

client.on("connect", () => {
  console.log("✅ MQTT Connected");
  client.end();
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});
```

### Publish Test Data

```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

// Publish DP data
publishEvent("nautilus/dp", {
  power: 25.5,
  heading: 180,
  thrusters: 4
});

// Publish alert
publishEvent("nautilus/alerts", {
  severity: "high",
  message: "Thruster 3 offline"
});
```

## 🎨 Styling

All components use Tailwind CSS and shadcn/ui components:

```tsx
// Example custom styling
<Card className="border-2 border-primary">
  <CardHeader>
    <CardTitle className="text-lg font-bold">
      Custom Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
</Card>
```

## 🐛 Troubleshooting

### MQTT Connection Fails

1. Check `VITE_MQTT_URL` is set correctly
2. Verify broker is accessible
3. Check browser console for errors
4. Test with public broker: `wss://broker.hivemq.com:8884/mqtt`

### No Data Displayed

1. Verify MQTT publishers are running
2. Check topic names match exactly
3. Open browser dev tools → Network → WS to see WebSocket traffic
4. Verify JSON structure matches expected format

### Alerts Table Not Found

```bash
# Create the table
psql -h your-db.supabase.co -U postgres -d postgres -f alerts.sql
```

## 📚 Common Patterns

### Loading State

```tsx
const [loading, setLoading] = useState(true);

if (loading) {
  return <div className="animate-spin h-6 w-6" />;
}
```

### Error Handling

```tsx
const [error, setError] = useState(null);

try {
  // Your code
} catch (err) {
  setError(err.message);
}

if (error) {
  return <div className="text-red-500">{error}</div>;
}
```

### Cleanup Pattern

```tsx
useEffect(() => {
  const client = subscribeDP(handleData);
  
  return () => {
    client.end();
  };
}, []);
```

## 🔗 Related Files

- `src/lib/mqtt/publisher.ts` - MQTT client library
- `src/components/control-hub/` - All ControlHub components
- `src/pages/ControlHub.tsx` - Main page
- `supabase/functions/alerting/` - Edge function

## 📞 Support

For questions or issues:
- Check logs in browser console
- Review MQTT connection status
- Verify Supabase function deployment
- Contact dev team if issues persist
