# Nautilus Failover Core - Quick Reference Card

## 🎯 What is it?
Autonomous system monitoring with automatic failure detection and recovery.

## 📁 Key Files

### Core
- `src/lib/failover/failover-core.ts` - Main logic
- `src/lib/failover/index.ts` - Exports

### UI
- `src/components/system/SystemResilienceMonitor.tsx` - Visual monitor

### Modified
- `src/lib/mqtt/publisher.ts` - Added subscribeSystemStatus()
- `src/main.tsx` - Auto-init on startup

## 🔌 MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `nautilus/system/heartbeat` | Subscribe | Monitor module health |
| `nautilus/system/status` | Publish | Broadcast system status |
| `nautilus/system/recovery` | Publish | Send recovery commands |

## 🗄️ Supabase

**Table**: `failover_events`

**Columns**:
- `event` (TEXT) - Event type
- `timestamp` (TIMESTAMPTZ) - When it happened
- `module` (TEXT) - Which module

**Events**:
- "Loss of Heartbeat"
- "Failover Executed"

## ⚙️ Configuration

**Environment**:
```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

**No code changes needed** - auto-initializes!

## 📊 Visual States

### Online
```
┌────────────────────────────────────┐
│ ⚡ Monitor de Resiliência          │
├────────────────────────────────────┤
│ 🟢 DP-Sync  🔄 ONLINE   15:23:45  │
└────────────────────────────────────┘
```

### Failover
```
┌────────────────────────────────────┐
│ ⚡ Monitor de Resiliência          │
├────────────────────────────────────┤
│ 🔴 DP-Sync  ⚠️ FAILOVER 15:24:12  │
└────────────────────────────────────┘
```

## 🚀 Usage

### Auto-Mode (Default)
Just start your app - failover monitoring runs automatically!

### Add Monitor to UI
```tsx
import SystemResilienceMonitor from 
  "@/components/system/SystemResilienceMonitor";

<SystemResilienceMonitor />
```

## ⏱️ Timing

| Setting | Value |
|---------|-------|
| Watchdog Check | Every 5 seconds |
| Failure Threshold | 8 seconds |
| Recovery Trigger | Immediate |

## 🔍 Console Messages

```
✅ MQTT conectado ao Failover Core
⚠️ Falha detectada! Último heartbeat há 9.2 segundos.
🔁 Executando protocolo de failover...
```

## 📚 Documentation

1. **README**: `NAUTILUS_FAILOVER_PATCH16_README.md`
2. **Visual Guide**: `NAUTILUS_FAILOVER_PATCH16_VISUAL_SUMMARY.md`
3. **Complete Summary**: `PATCH_16_IMPLEMENTATION_COMPLETE.md`

## ✅ Status

**Build**: ✅ Passing  
**Tests**: ✅ Type-safe  
**Docs**: ✅ Complete  
**Ready**: ✅ Production

## 🎯 Quick Test

1. Start app
2. Check console for "✅ MQTT conectado"
3. Open Supabase `failover_events` table
4. Add `<SystemResilienceMonitor />` to any page
5. Watch real-time status!

---

**Total Autonomy Achieved** 🎉
