# Nautilus Failover & Resilience Core (Patch 16)

## Overview

The Nautilus Failover Core provides autonomous system monitoring with automatic failure detection and recovery capabilities. The system uses MQTT for real-time communication and Supabase for event logging.

## Components

### 1. Failover Core (`src/lib/failover/failover-core.ts`)

The core failover module that:
- Monitors MQTT heartbeat on `nautilus/system/heartbeat` topic
- Detects failures after 8 seconds of no heartbeat
- Automatically logs events to Supabase `failover_events` table
- Publishes system status to `nautilus/system/status` topic
- Executes recovery protocol when failures are detected

**Key Features:**
- **Automatic Initialization**: Starts automatically when the app loads
- **Heartbeat Monitoring**: 5-second watchdog interval
- **Failure Threshold**: 8 seconds without heartbeat triggers failover
- **Event Logging**: All events stored in Supabase for audit trail
- **Recovery Protocol**: Publishes recovery actions to MQTT

### 2. System Resilience Monitor (`src/components/system/SystemResilienceMonitor.tsx`)

A visual monitoring component that displays:
- Real-time system status (online/failover)
- Module name and state
- Color-coded indicators (green for online, red for offline)
- Failover state with warning icon
- Timestamp of last status update

**Usage Example:**
```tsx
import SystemResilienceMonitor from "@/components/system/SystemResilienceMonitor";

function Dashboard() {
  return (
    <div>
      <SystemResilienceMonitor />
      {/* Other dashboard components */}
    </div>
  );
}
```

### 3. MQTT Publisher Extension (`src/lib/mqtt/publisher.ts`)

Added `subscribeSystemStatus` function for monitoring system status:

```typescript
export const subscribeSystemStatus = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
  client.subscribe("nautilus/system/status");
  client.on("message", (_, msg) => callback(JSON.parse(msg.toString())));
  return client;
};
```

## MQTT Topics

### Subscribed Topics
- `nautilus/system/heartbeat` - Heartbeat messages from modules
- `nautilus/system/status` - System status updates

### Published Topics
- `nautilus/system/status` - Current system status (online/failover)
- `nautilus/system/recovery` - Recovery action commands

## Supabase Schema

The failover system expects a `failover_events` table with the following structure:

```sql
CREATE TABLE failover_events (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Event Types

1. **Loss of Heartbeat**: Triggered when no heartbeat received for 8+ seconds
2. **Failover Executed**: Logged when recovery protocol is activated

## Configuration

Requires the following environment variable:
- `VITE_MQTT_URL` - MQTT broker URL (e.g., "wss://broker.hivemq.com:8884/mqtt")

## Automatic Initialization

The failover system is automatically initialized in `src/main.tsx`:

```typescript
import { initFailoverSystem } from "@/lib/failover/failover-core";

// Iniciar monitor de failover na inicialização
initFailoverSystem();
```

This ensures the failover monitoring starts as soon as the application loads.

## Expected Results

✅ Automatic detection of communication failures or frozen modules  
✅ Failover execution and module restart without manual intervention  
✅ Supabase logging of all events in `failover_events` table  
✅ Real-time visual status monitoring (online/failover)  
✅ Lovable Preview displays the Resilience module active  

## Integration Example

To add the monitor to an existing dashboard:

```tsx
import SystemResilienceMonitor from "@/components/system/SystemResilienceMonitor";

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <SystemResilienceMonitor />
      {/* Other dashboard components */}
    </div>
  );
}
```

## Monitoring Console Output

When the system is running, you'll see:
- ✅ MQTT conectado ao Failover Core (on successful connection)
- ⚠️ Falha detectada! Último heartbeat há X segundos (when failure detected)
- 🔁 Executando protocolo de failover... (when recovery starts)
- ❌ Falha ao executar recuperação (if recovery fails)

## Notes

- The `@ts-nocheck` directive is used as specified in the original requirements
- The system operates autonomously without user interaction
- All events are logged to provide a complete audit trail
- The visual monitor can be integrated into any dashboard or page
