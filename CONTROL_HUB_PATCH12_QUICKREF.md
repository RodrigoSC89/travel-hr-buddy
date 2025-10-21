# ControlHub Patch 12 - Quick Reference Guide

## 🚀 Overview
The ControlHub Patch 12 introduces MQTT-based observability with real-time monitoring, AI insights, and unified alerting system.

## 📋 Quick Start

### Access the ControlHub
Navigate to: `http://localhost:5173/control-hub`

### Component Structure
```
ControlHub (Page)
├── SystemAlerts (Real-time alerts)
├── ControlHubPanel (Operational metrics)
└── AIInsightReporter (AI analysis)
```

## 🔌 MQTT Integration

### Subscribe to Channels
```typescript
import { subscribeForecast, subscribeDP, subscribeAlerts } from '@/lib/mqtt/publisher';

// DP Intelligence
const dpClient = subscribeDP((data) => {
  console.log('DP:', data);
  // data: { thrusters, power, heading }
});

// Forecast
const forecastClient = subscribeForecast((data) => {
  console.log('Forecast:', data);
  // data: { value }
});

// Alerts
const alertClient = subscribeAlerts((data) => {
  console.log('Alert:', data);
  // data: { severity, message }
});

// Cleanup
dpClient.end();
forecastClient.end();
alertClient.end();
```

### MQTT Channels
- **nautilus/dp** - DP Intelligence data
- **nautilus/forecast** - Meteo-oceanic forecasts
- **nautilus/alerts** - System alerts

## 📊 Data Formats

### DP Intelligence
```json
{
  "thrusters": 4,
  "power": 12.5,
  "heading": 180.0
}
```

### Forecast
```json
{
  "value": 2.5
}
```

### Alert
```json
{
  "severity": "high",
  "message": "Thruster 2 offline",
  "timestamp": "2025-10-21T13:47:56Z"
}
```

## 🛠️ Configuration

### Environment Variables
```bash
VITE_MQTT_URL=ws://localhost:8883
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Supabase Table
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

### Publish Test Data
```bash
# DP Intelligence
mosquitto_pub -h localhost -p 1883 -t "nautilus/dp" \
  -m '{"thrusters":4,"power":12.5,"heading":180}'

# Forecast
mosquitto_pub -h localhost -p 1883 -t "nautilus/forecast" \
  -m '{"value":2.5}'

# Alert
mosquitto_pub -h localhost -p 1883 -t "nautilus/alerts" \
  -m '{"severity":"high","message":"Test alert"}'
```

## 📁 File Locations

| Component | Path |
|-----------|------|
| ControlHub Page | `src/pages/ControlHub.tsx` |
| ControlHub Panel | `src/components/control-hub/ControlHubPanel.tsx` |
| System Alerts | `src/components/control-hub/SystemAlerts.tsx` |
| AI Reporter | `src/components/control-hub/AIInsightReporter.tsx` |
| MQTT Publisher | `src/lib/mqtt/publisher.ts` |
| Alerting Function | `supabase/functions/alerting/index.ts` |

## 🚦 Status Indicators

### ControlHub Panel
- 🟢 Green metrics: Normal operation
- 🟡 Yellow metrics: Warning threshold
- 🔴 Red metrics: Critical threshold

### System Alerts
- 🔴 AlertTriangle: High severity
- 🟢 CheckCircle2: Normal/Info

## 🔧 Customization

### Add New Metric
```tsx
// In ControlHubPanel.tsx
<Metric 
  label="New Metric" 
  value={`${data.newField}`} 
  icon={<YourIcon />} 
/>
```

### Modify Alert Display
```tsx
// In SystemAlerts.tsx
{alerts.map((a, i) => (
  <li key={i} className="flex items-center gap-2">
    {/* Custom icon logic */}
    <span>{a.message}</span>
  </li>
))}
```

## 📚 API Reference

### MQTT Publisher Functions

#### `subscribeForecast(callback)`
Subscribe to forecast updates.
- **Channel**: `nautilus/forecast`
- **Callback**: `(data: { value: number }) => void`
- **Returns**: MQTT Client

#### `subscribeDP(callback)`
Subscribe to DP intelligence.
- **Channel**: `nautilus/dp`
- **Callback**: `(data: { thrusters, power, heading }) => void`
- **Returns**: MQTT Client

#### `subscribeAlerts(callback)`
Subscribe to system alerts.
- **Channel**: `nautilus/alerts`
- **Callback**: `(data: { severity, message }) => void`
- **Returns**: MQTT Client

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MQTT not connecting | Check `VITE_MQTT_URL` in `.env` |
| No alerts showing | Verify Supabase table and edge function |
| Components not loading | Check browser console for errors |
| Build fails | Run `npm install` and `npm run build` |

## ✅ Deployment Checklist

- [ ] Configure MQTT broker
- [ ] Set environment variables
- [ ] Create Supabase alerts table
- [ ] Deploy alerting edge function
- [ ] Test MQTT connections
- [ ] Verify real-time updates
- [ ] Configure data producers

---

**Version**: Patch 12  
**Last Updated**: 2025-10-21  
**Status**: ✅ Production Ready
