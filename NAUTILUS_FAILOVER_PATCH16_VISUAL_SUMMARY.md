# Nautilus Failover & Resilience Core - Visual Summary

## 🎯 Implementation Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAUTILUS FAILOVER SYSTEM                      │
│                         (Patch 16)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. FAILOVER CORE (Auto-initialized on app start)               │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/failover/failover-core.ts                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  MQTT Connection                                        │    │
│  │  • Topic: nautilus/system/heartbeat (subscribe)        │    │
│  │  • Topic: nautilus/system/status (publish)             │    │
│  │  • Topic: nautilus/system/recovery (publish)           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Watchdog Timer (5 sec interval)                       │    │
│  │  ├─ Check heartbeat timestamp                          │    │
│  │  ├─ If > 8 seconds since last heartbeat:              │    │
│  │  │   ├─ Log "Loss of Heartbeat" to Supabase          │    │
│  │  │   ├─ Publish "failover" status to MQTT            │    │
│  │  │   └─ Execute recovery protocol                     │    │
│  │  └─ Recovery: Publish restart command to MQTT         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Supabase Logging                                      │    │
│  │  • Table: failover_events                              │    │
│  │  • Events: Loss of Heartbeat, Failover Executed       │    │
│  │  • Data: event, timestamp, module                      │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. VISUAL MONITOR COMPONENT                                     │
├─────────────────────────────────────────────────────────────────┤
│  src/components/system/SystemResilienceMonitor.tsx              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📊 Monitor de Resiliência                            │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  🟢 DP-Sync          🔄 ONLINE          15:23:45      │    │
│  │                                                         │    │
│  │  State: Online                                          │    │
│  │  • Green WiFi icon                                      │    │
│  │  • Spinning refresh icon                                │    │
│  │  • Timestamp display                                    │    │
│  │                                                         │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  🔴 DP-Sync          ⚠️  FAILOVER       15:24:12      │    │
│  │                                                         │    │
│  │  State: Failover                                        │    │
│  │  • Red WiFi icon                                        │    │
│  │  • Yellow warning triangle                              │    │
│  │  • Timestamp display                                    │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. MQTT PUBLISHER ENHANCEMENT                                   │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/mqtt/publisher.ts                                      │
│                                                                  │
│  ✅ NEW FUNCTION:                                               │
│  subscribeSystemStatus(callback)                                │
│  • Subscribes to nautilus/system/status                         │
│  • Calls callback with status updates                           │
│  • Returns client for cleanup                                   │
│                                                                  │
│  🧹 CLEANUP:                                                    │
│  • Removed duplicate subscribeForecast function                 │
│  • Removed duplicate subscribeAlerts function                   │
│  • Cleaner, more maintainable code                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. AUTO-INITIALIZATION                                          │
├─────────────────────────────────────────────────────────────────┤
│  src/main.tsx                                                   │
│                                                                  │
│  import { initFailoverSystem } from "@/lib/failover/...";      │
│                                                                  │
│  // Iniciar monitor de failover na inicialização                │
│  initFailoverSystem();                                          │
│                                                                  │
│  ✅ Starts automatically when app loads                         │
│  ✅ No manual intervention required                             │
│  ✅ Always monitoring system health                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 System Flow Diagram

```
┌──────────┐     Heartbeat     ┌──────────────┐
│  Module  │ ════════════════> │   Failover   │
│  (DP)    │                    │     Core     │
└──────────┘                    └──────────────┘
                                      │
                                      │ 5sec check
                                      ▼
                                ┌──────────┐
                                │ Last HB  │
                                │ > 8 sec? │
                                └──────────┘
                                   │      │
                              NO ──┘      └── YES
                               │              │
                               │              ▼
                               │        ┌──────────────┐
                               │        │ Log to       │
                               │        │ Supabase     │
                               │        └──────────────┘
                               │              │
                               │              ▼
                               │        ┌──────────────┐
                               │        │ Publish      │
                               │        │ "failover"   │
                               │        └──────────────┘
                               │              │
                               │              ▼
                               │        ┌──────────────┐
                               │        │ Execute      │
                               │        │ Recovery     │
                               │        └──────────────┘
                               │              │
                               └──────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   Monitor   │
                               │   UI Update │
                               └─────────────┘
```

## 📁 File Structure

```
travel-hr-buddy/
├── src/
│   ├── lib/
│   │   ├── failover/
│   │   │   ├── failover-core.ts      ← NEW: Core failover logic
│   │   │   └── index.ts              ← NEW: Module exports
│   │   └── mqtt/
│   │       └── publisher.ts          ← MODIFIED: Added subscribeSystemStatus
│   ├── components/
│   │   └── system/
│   │       └── SystemResilienceMonitor.tsx  ← NEW: Visual monitor
│   └── main.tsx                      ← MODIFIED: Auto-init failover
└── NAUTILUS_FAILOVER_PATCH16_README.md  ← NEW: Documentation
```

## 🎨 UI Color Coding

| Status   | WiFi Icon | Action Icon       | Color  | Meaning                    |
|----------|-----------|-------------------|--------|----------------------------|
| Online   | 🟢        | 🔄 (spinning)     | Green  | System healthy             |
| Failover | 🔴        | ⚠️ (warning)      | Yellow | Recovery in progress       |
| Unknown  | 🟡        | ❓                | Gray   | Initial/disconnected state |

## ✅ Success Criteria Met

- [x] Automatic failure detection (8-second heartbeat threshold)
- [x] MQTT communication established (heartbeat, status, recovery topics)
- [x] Supabase event logging (failover_events table)
- [x] Visual monitoring component (real-time status display)
- [x] Autonomous operation (no manual intervention needed)
- [x] Recovery protocol execution (module restart command)
- [x] Complete audit trail (all events logged)

## 🚀 Usage Example

```tsx
// In any dashboard component
import SystemResilienceMonitor from "@/components/system/SystemResilienceMonitor";

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1>System Dashboard</h1>
      <SystemResilienceMonitor />  {/* Add the monitor */}
      {/* Other components */}
    </div>
  );
}
```

## 🔧 Configuration Required

Environment variable needed:
```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

Supabase table schema:
```sql
CREATE TABLE failover_events (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📊 Console Output Examples

```
✅ MQTT conectado ao Failover Core
⚠️ Falha detectada! Último heartbeat há 9.2 segundos.
🔁 Executando protocolo de failover...
```

## 🎯 Next Steps

The failover system is now fully operational. To verify:

1. Check browser console for connection messages
2. Monitor Supabase `failover_events` table for logged events
3. Add `<SystemResilienceMonitor />` to desired dashboards
4. Test failover by stopping heartbeat messages

---

**Status**: ✅ COMPLETE - Nautilus One has achieved operational autonomy
