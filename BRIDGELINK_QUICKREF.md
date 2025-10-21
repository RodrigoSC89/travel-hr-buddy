# BridgeLink Integration Core - Quick Reference

## 🚀 Quick Start

### Access URL
```
/bridgelink
```

### Key Files
```
src/pages/BridgeLink.tsx                        # Main page
src/components/bridgelink/BridgeLinkStatus.tsx  # Status monitor
src/components/bridgelink/BridgeLinkSync.tsx    # Sync component
src/components/bridgelink/BridgeLinkDashboard.tsx # Control panel
src/lib/mqtt/publisher.ts                       # MQTT utilities
```

## 📡 MQTT Functions

### Publish Event
```typescript
import { publishEvent } from "@/lib/mqtt/publisher";
publishEvent("nautilus/bridgelink/update", { data: "..." });
```

### Subscribe to Status
```typescript
import { subscribeBridgeStatus } from "@/lib/mqtt/publisher";
const client = subscribeBridgeStatus((data) => console.log(data));
// Cleanup: client.disconnect()
```

### Subscribe to Forecast
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";
const client = subscribeForecast((data) => console.log(data));
```

## 🎯 MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `nautilus/bridgelink/status` | Subscribe | Connection status |
| `nautilus/bridgelink/update` | Publish | General updates |
| `nautilus/bridgelink/manual-sync` | Publish | Manual sync trigger |
| `nautilus/forecast/telemetry` | Subscribe | Forecast data |
| `nautilus/alerts` | Subscribe | System alerts |

## 🔧 Environment Setup

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_anon_key
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

## 🎨 UI Components

### Status Card
- **Online/Offline** - Connection state
- **Latency** - Response time in ms
- **Last Sync** - Timestamp of last sync

### Sync Card
- **MQTT** - Active/Inactive
- **Supabase** - Connected/Disconnected
- **Status** - Current sync status

### Dashboard Card
- **Force Sync** - Manual sync trigger button
- **Event Log** - Recent events display

## 🔄 Component Lifecycle

```typescript
useEffect(() => {
  const client = subscribeBridgeStatus((data) => setStatus(data));
  return () => client.disconnect(); // Cleanup
}, []);
```

## 🏗️ Architecture

```
BridgeLink Page (safeLazyImport)
  ├── BridgeLinkStatus (MQTT monitoring)
  ├── BridgeLinkSync (Supabase ↔ MQTT)
  └── BridgeLinkDashboard (Manual controls)
```

## 📊 Data Flow

```
Supabase DB Change
  ↓
Supabase Real-time Channel
  ↓
publishEvent() to MQTT
  ↓
MQTT Broker
  ↓
Subscribed Modules
```

## ⚡ Key Features

✅ Real-time MQTT communication
✅ Supabase real-time sync
✅ Manual sync control
✅ Network resilience (auto-reconnect)
✅ SafeLazyImport pattern
✅ Diagnostic dashboard

## 🐛 Common Issues

### MQTT Not Connecting
```typescript
// Check in browser console:
// ✅ MQTT client connected
// ❌ MQTT connection error
```

### Supabase Not Syncing
- Verify table name: `telemetry`
- Check RLS policies
- Verify env variables

## 📦 Build & Deploy

```bash
# Build
npm run build

# Type check
npm run type-check

# Dev server
npm run dev
```

## 🎯 Usage Examples

### Monitor Connection Status
```typescript
const [status, setStatus] = useState({ online: false, latency: 0, lastSync: "—" });

useEffect(() => {
  const client = subscribeBridgeStatus(setStatus);
  return () => client.disconnect();
}, []);
```

### Trigger Manual Sync
```typescript
const triggerSync = () => {
  publishEvent("nautilus/bridgelink/manual-sync", {
    triggeredAt: new Date().toISOString()
  });
};
```

### Listen to Supabase Changes
```typescript
const channel = supabase
  .channel("nautilus-telemetry")
  .on("postgres_changes", { event: "*", schema: "public", table: "telemetry" }, 
    (payload) => publishEvent("nautilus/bridgelink/update", payload.new)
  )
  .subscribe();
```

## 📝 Component Props

### BridgeLinkStatus
- No props (self-contained)

### BridgeLinkSync
- No props (self-contained)

### BridgeLinkDashboard
- No props (self-contained)

## 🎨 Styling

Components use standard theme colors:
- `text-primary` - Icons and highlights
- `bg-background` - Page background
- `text-foreground` - Text color
- `bg-primary` - Button backgrounds
- `text-primary-foreground` - Button text

## 🔐 Security

- ✅ Uses environment variables for credentials
- ✅ Supabase RLS policies enforced
- ✅ MQTT over WSS (WebSocket Secure)
- ✅ No credentials in code

## 📈 Metrics

Components track:
- Connection status (online/offline)
- Latency (in milliseconds)
- Last sync timestamp
- Event count

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready
