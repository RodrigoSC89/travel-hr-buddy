# PATCH_25.7 — Quick Reference

## 🚀 Quick Start

```bash
# 1. Run setup script
npm run diagnostics:setup

# 2. Apply Supabase migration
# Copy contents of supabase/migrations/system_logs_schema.sql
# Execute in Supabase SQL editor

# 3. Set environment variables
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_KEY=your_key
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt

# 4. Build and run
npm run build
npm run dev
```

## 📦 Files Modified

- `src/main.tsx` - Added `initLogSync()` call
- `package.json` - Added `diagnostics:setup` script

## 📦 Files Created

- `src/lib/monitoring/logsync.ts` - Core logging module
- `src/components/SystemHealthPanel.tsx` - Visual panel
- `scripts/setup-realtime-diagnostics.sh` - Setup script
- `supabase/migrations/system_logs_schema.sql` - Database schema

## 🔧 Key Functions

### initLogSync()
Initializes the logging system. Automatically called in `main.tsx`.

```typescript
import { initLogSync } from "@/lib/monitoring/logsync";
initLogSync();
```

### SystemHealthPanel Component
Displays real-time logs from MQTT.

```tsx
import SystemHealthPanel from "@/components/SystemHealthPanel";

<SystemHealthPanel />
```

## 📊 Database Schema

```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ,
  type TEXT NOT NULL,
  message TEXT,
  context JSONB
);
```

## 🎯 Log Types

- `startup` - System initialized
- `runtime_error` - JavaScript error
- `promise_rejection` - Unhandled promise

## 📡 MQTT

**Topic**: `system/logs`

**Payload**:
```json
{
  "type": "runtime_error",
  "message": "Error message",
  "context": { "file": "app.tsx", "line": 42 }
}
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Required |
| `VITE_SUPABASE_KEY` | Supabase anon key | Required |
| `VITE_MQTT_URL` | MQTT broker URL | `wss://broker.hivemq.com:8884/mqtt` |

## 🧪 Testing

```javascript
// Browser console - trigger test error
throw new Error("Test error for diagnostics");

// Check logs
// 1. Browser console: [runtime_error] Test error
// 2. Supabase: SELECT * FROM system_logs;
// 3. SystemHealthPanel: Should display the error
```

## 📝 Common Tasks

### Add Custom Log
```typescript
import { createClient } from "@supabase/supabase-js";
import mqtt from "mqtt";

const supabase = createClient(url, key);
const mqttClient = mqtt.connect(broker);

// Send custom log
await supabase.from("system_logs").insert({
  type: "custom_event",
  message: "Something happened",
  context: JSON.stringify({ custom: "data" })
});

mqttClient.publish("system/logs", JSON.stringify({
  type: "custom_event",
  message: "Something happened",
  context: { custom: "data" }
}));
```

### Query Logs
```sql
-- Recent errors
SELECT * FROM system_logs 
WHERE type = 'runtime_error' 
ORDER BY created_at DESC 
LIMIT 10;

-- Errors in last hour
SELECT * FROM system_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Error count by type
SELECT type, COUNT(*) 
FROM system_logs 
GROUP BY type;
```

### Clean Old Logs
```sql
-- Delete logs older than 30 days
DELETE FROM system_logs 
WHERE created_at < NOW() - INTERVAL '30 days';
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Logs not in Supabase | Check env vars, verify RLS policies |
| MQTT not connecting | Verify broker URL, check firewall |
| Panel not updating | Check MQTT subscription, verify topic |
| Build errors | Run `npm install`, check TypeScript |

## 📚 Related Documentation

- [Full README](./PATCH_25.7_README.md)
- [Visual Summary](./PATCH_25.7_VISUAL_SUMMARY.md)
- [Supabase Docs](https://supabase.com/docs)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)

## ✅ Checklist

- [ ] Run `npm run diagnostics:setup`
- [ ] Apply Supabase migration
- [ ] Set environment variables
- [ ] Test error capture
- [ ] Verify MQTT connection
- [ ] Add SystemHealthPanel to admin page
- [ ] Set up log retention policy
- [ ] Configure alerts (optional)

---

**Last Updated**: 2025-10-22
**Status**: ✅ Production Ready
**Version**: PATCH_25.7
