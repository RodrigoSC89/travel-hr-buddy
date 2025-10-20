# Nautilus Control Hub - Quick Reference

## Quick Start

```typescript
import { controlHub } from '@/modules/control_hub';

// Initialize
await controlHub.iniciar();

// Get status
const state = controlHub.getState();

// Sync data
await controlHub.sincronizar();

// Stop
controlHub.parar();
```

## Core Operations

### Initialize System
```typescript
await controlHub.iniciar();
```

### Get System State
```typescript
const state = controlHub.getState();
// Returns: { isOnline, pendingRecords, lastSync, cacheSize, modules }
```

### Manual Sync
```typescript
const result = await controlHub.forceSyncronizar();
// Returns: { success, recordsSent, errors, timestamp }
```

### Check Health
```typescript
const health = await controlHub.getHealth();
// Returns: { status: 'healthy'|'degraded'|'critical', uptime, modules, cache, connectivity }
```

### Save Offline Data
```typescript
controlHub.salvarOffline({ data: 'value' }, 'moduleName');
```

## Cache Operations

```typescript
import { hubCache } from '@/modules/control_hub';

// Save data
hubCache.salvar({ data: 'value' }, 'mmi');

// Get pending
const pending = hubCache.getPending();

// Get stats
const stats = hubCache.getStats();

// Clear cache
hubCache.clear();
```

## Monitoring

```typescript
import { hubMonitor } from '@/modules/control_hub';

// Get all statuses
const statuses = hubMonitor.getAllStatuses();

// Check health
const health = hubMonitor.checkSystemHealth();

// Register error
hubMonitor.registerError('mmi', 'Error message');

// Reset module
hubMonitor.resetModule('mmi');
```

## Synchronization

```typescript
import { hubSync } from '@/modules/control_hub';

// Manual sync
const result = await hubSync.sincronizar();

// Start auto-sync (every 5 min)
hubSync.startAutoSync();

// Stop auto-sync
hubSync.stopAutoSync();

// Get sync info
const info = hubSync.getLastSyncInfo();
```

## BridgeLink

```typescript
import { hubBridge } from '@/modules/control_hub';

// Check connection
const conn = await hubBridge.checkConnection();

// Get status
const status = hubBridge.getStatus();

// Send data
const result = await hubBridge.sendData(data);

// Send with retry
const result = await hubBridge.sendWithRetry(data);
```

## API Endpoints

### Status
```bash
GET /api/control-hub/status
# Returns full system status
```

### Sync
```bash
POST /api/control-hub/sync
# Triggers manual synchronization
```

### Health Check
```bash
GET /api/control-hub/health
# Returns 200 (healthy) or 503 (unhealthy)
```

## UI Access

Navigate to: `/control-hub`

Features:
- System health overview
- Module status cards
- Connectivity display
- Cache metrics
- Manual sync button
- Auto-refresh (30s)

## Configuration

Edit `src/modules/control_hub/hub_config.json`:

```json
{
  "syncInterval": 300,          // seconds
  "cacheSizeLimit": 104857600,  // bytes (100MB)
  "retryAttempts": 3,
  "healthCheckInterval": 60,    // seconds
  "connectionTimeout": 30000,   // milliseconds
  "featureFlags": {
    "offlineCache": true,
    "realtimeSync": true,
    "autoRecovery": true,
    "encryptedLogs": true
  }
}
```

## Module Status Values

- `OK`: Normal operation
- `Online`: Connected
- `Offline`: Disconnected
- `Em verificação`: Under verification
- `Auditoria OK`: Audit passed
- `Desvio detectado`: Deviation detected
- `Error`: Error state

## Connection Quality

- `excellent`: < 100ms latency
- `good`: < 250ms latency
- `fair`: < 500ms latency
- `poor`: >= 500ms latency
- `offline`: No connection

## Common Tasks

### View Dashboard in Console
```typescript
controlHub.exibirDashboard();
```

### Get Cache Stats
```typescript
const stats = controlHub.getCacheStats();
console.log(`Usage: ${stats.usagePercent}%`);
console.log(`Pending: ${stats.pending}`);
```

### Clear All Data
```typescript
controlHub.clearCache();
```

### Check if Initialized
```typescript
if (controlHub.isInitialized()) {
  // System is running
}
```

## Testing

```bash
# Run Control Hub tests
npm test -- control-hub.test.tsx

# Run all tests
npm test
```

## Performance Targets

- Initial load: < 500ms ✅
- Dashboard render: < 100ms ✅
- Status refresh: < 200ms ✅
- Sync operation: < 2000ms ✅
- Cache operations: < 50ms ✅

## Troubleshooting

### Cache Full
System auto-cleans 25% of oldest synchronized entries.

### Sync Fails
3 retry attempts with exponential backoff (2s, 4s, 8s).

### Module Offline
Check BridgeLink connection:
```typescript
const conn = await hubBridge.checkConnection();
console.log('Connected:', conn.isConnected);
```

## Support

Refer to `CONTROL_HUB_README.md` for detailed documentation.
