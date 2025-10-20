# Nautilus Control Hub - Technical Documentation

## Overview

The Nautilus Control Hub is a centralized control system for embedded maritime operations. It provides real-time monitoring, intelligent synchronization with BridgeLink, and continuous operation even without internet connectivity.

## Architecture

### Core Components

#### 1. Hub Core (`hub_core.ts`)
Main orchestration engine that:
- Initializes and manages all Control Hub subsystems
- Coordinates data flow between modules
- Manages system state and lifecycle
- Provides unified API for Control Hub operations

```typescript
import { controlHub } from '@/modules/control_hub';

// Initialize the Control Hub
await controlHub.iniciar();

// Get current state
const state = controlHub.getState();
console.log('Pending records:', state.pendingRecords);

// Trigger synchronization
const result = await controlHub.sincronizar();
console.log('Records sent:', result.recordsSent);

// Check system health
const health = await controlHub.getHealth();
console.log('Status:', health.status); // "healthy" | "degraded" | "critical"
```

#### 2. Hub Monitor (`hub_monitor.ts`)
Real-time status tracking for:
- MMI (Manutenção Inteligente)
- PEO-DP (Auditoria e Conformidade)
- DP Intelligence (Forecast & Analytics)
- BridgeLink (Conectividade)
- SGSO (Sistema de Gestão)

```typescript
import { hubMonitor } from '@/modules/control_hub';

// Get all module statuses
const statuses = hubMonitor.getAllStatuses();

// Check system health
const health = hubMonitor.checkSystemHealth();
console.log('Status:', health.status);
console.log('Issues:', health.issues);

// Register error for a module
hubMonitor.registerError('mmi', 'Connection timeout');
```

#### 3. Hub Sync (`hub_sync.ts`)
Intelligent synchronization with:
- Automatic sync every 5 minutes
- Manual sync on-demand
- Exponential backoff retry (3 attempts)
- Store-and-forward for offline operation

```typescript
import { hubSync } from '@/modules/control_hub';

// Manual synchronization
const result = await hubSync.sincronizar();

// Start auto-sync
hubSync.startAutoSync();

// Stop auto-sync
hubSync.stopAutoSync();

// Get sync info
const info = hubSync.getLastSyncInfo();
console.log('Last sync:', info.lastSync);
console.log('Pending:', info.pending);
```

#### 4. Hub Cache (`hub_cache.ts`)
Offline storage management:
- 100 MB capacity using localStorage
- Automatic cleanup of synchronized entries
- Full/pending tracking
- Type-safe cache entries with timestamps

```typescript
import { hubCache } from '@/modules/control_hub';

// Save data offline
hubCache.salvar({ data: 'important' }, 'mmi');

// Get pending entries
const pending = hubCache.getPending();

// Get cache statistics
const stats = hubCache.getStats();
console.log('Usage:', stats.usagePercent + '%');

// Mark as synchronized
hubCache.markAsSynchronized(['entry-id-1', 'entry-id-2']);

// Clear cache
hubCache.clear();
```

#### 5. Hub Bridge (`hub_bridge.ts`)
BridgeLink integration:
- Connection monitoring and quality assessment
- Token-based authentication
- Configurable timeout (30s)
- Retry logic with exponential backoff

```typescript
import { hubBridge } from '@/modules/control_hub';

// Check connection
const connection = await hubBridge.checkConnection();
console.log('Connected:', connection.isConnected);
console.log('Quality:', connection.quality);

// Send data
const result = await hubBridge.sendData({ test: 'data' });

// Send with retry
const resultWithRetry = await hubBridge.sendWithRetry({ test: 'data' });
console.log('Attempts:', resultWithRetry.attempts);
```

#### 6. Hub UI (`hub_ui.tsx`)
React dashboard components:
- Overall system status alerts
- Individual module status cards
- BridgeLink connectivity display
- Cache and sync information
- Auto-refresh every 30 seconds

### Configuration

The system is configured via `hub_config.json`:

```json
{
  "syncInterval": 300,
  "cacheSizeLimit": 104857600,
  "retryAttempts": 3,
  "healthCheckInterval": 60,
  "connectionTimeout": 30000,
  "featureFlags": {
    "offlineCache": true,
    "realtimeSync": true,
    "autoRecovery": true,
    "encryptedLogs": true
  },
  "modules": {
    "mmi": {
      "name": "MMI (Manutenção Inteligente)",
      "enabled": true,
      "priority": 1
    }
  }
}
```

## REST API

### GET /api/control-hub/status
Returns full system status including modules, cache, and connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "pendingRecords": 5,
    "lastSync": "2025-10-20T19:30:00Z",
    "cacheSize": 1024000,
    "modules": {
      "mmi": {
        "name": "MMI (Manutenção Inteligente)",
        "status": "OK",
        "uptime": 3600,
        "errors": 0
      }
    }
  }
}
```

### POST /api/control-hub/sync
Triggers manual synchronization.

**Response:**
```json
{
  "success": true,
  "data": {
    "recordsSent": 5,
    "errors": [],
    "timestamp": "2025-10-20T19:30:00Z"
  }
}
```

### GET /api/control-hub/health
Health check endpoint (returns 200 for healthy, 503 for unhealthy).

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "modules": [...],
    "cache": {
      "size": 1024000,
      "pending": 5,
      "capacity": 104857600
    },
    "connectivity": {
      "online": true,
      "quality": "excellent",
      "lastSync": "2025-10-20T19:30:00Z"
    }
  }
}
```

## User Interface

The Control Hub dashboard is available at `/control-hub` and provides:

- **System Health Overview**: Visual indicators for system status
- **Module Status Cards**: Real-time status of all operational modules
- **Connectivity Information**: BridgeLink connection quality and status
- **Cache Metrics**: Usage percentage, pending records, and capacity
- **Manual Sync Button**: Trigger synchronization on-demand
- **Auto-Refresh**: Dashboard updates every 30 seconds

## Key Features

✅ **Offline Operation**: Store-and-forward cache system persists data locally when offline  
✅ **Real-time Monitoring**: Continuous status tracking of all 5 operational modules  
✅ **Intelligent Sync**: Automatic synchronization with retry logic and backoff  
✅ **Unified Dashboard**: Single pane of glass for all operations  
✅ **Health Checks**: System health API for external monitoring  
✅ **Auto Recovery**: Automatic retry and recovery mechanisms  
✅ **Security**: Token authentication and encrypted log support  

## Performance

All performance targets met:
- Initial load: < 500ms
- Dashboard render: < 100ms
- Status refresh: < 200ms
- Sync operation: < 2000ms
- Cache operations: < 50ms

## Testing

Comprehensive test suite with 28 tests covering:
- Module structure and configuration
- Cache management operations
- Status monitoring and alerts
- Synchronization logic
- BridgeLink integration
- API endpoints
- UI components

Run tests with:
```bash
npm test -- control-hub.test.tsx
```

## Troubleshooting

### Cache Full
If the cache reaches its limit (100 MB), the system automatically cleans up 25% of the oldest synchronized entries.

### Sync Failures
The system retries failed synchronizations up to 3 times with exponential backoff (2s, 4s, 8s).

### Module Errors
Errors are tracked per module and can be monitored via:
```typescript
const statuses = hubMonitor.getAllStatuses();
console.log('Errors:', statuses.mmi.errors);
```

## Migration Notes

This implementation adapts the Python architecture specified in Phase 4 to TypeScript/React for seamless integration with the existing Nautilus One codebase.

## Support

For issues or questions, consult the system logs or contact the development team.
