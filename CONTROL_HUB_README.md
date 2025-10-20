# Nautilus Control Hub

**Phase 4 - Centralized Control System for Embedded Maritime Operations**

## Overview

The Nautilus Control Hub is a centralized control system that provides real-time monitoring, intelligent synchronization with BridgeLink (shore-based system), and continuous operation even without internet connectivity. It's designed specifically for maritime environments where reliable connectivity cannot be guaranteed.

## Key Features

- **Real-time Monitoring**: Continuous status tracking of 5 operational modules
- **Offline Operation**: 100MB cache with store-and-forward capability
- **Intelligent Sync**: Automatic synchronization every 5 minutes with retry logic
- **Unified Dashboard**: Single pane of glass for all operations
- **Health Monitoring**: System-wide health assessment and alerting
- **BridgeLink Integration**: Seamless connection to shore-based systems

## Quick Start

### Installation

The Control Hub is already integrated into the Nautilus One system. Simply navigate to `/control-hub` in your browser.

### Initialization

```typescript
import { controlHub } from '@/modules/control_hub';

// Initialize the Control Hub
await controlHub.iniciar();

// Control Hub will automatically:
// - Start monitoring all modules
// - Begin auto-sync every 5 minutes
// - Initialize offline cache
```

### Basic Usage

```typescript
// Get current system state
const state = controlHub.getState();
console.log('System Health:', state.systemHealth);
console.log('Pending Records:', state.pendingRecords);

// Add data to offline cache
await controlHub.addToCache('mmi', {
  timestamp: new Date(),
  equipment: 'Motor Principal',
  status: 'operational'
});

// Trigger manual synchronization
const result = await controlHub.sincronizar();
console.log(`Synced ${result.recordsSent} records`);

// Check system health
const health = await controlHub.getHealth();
console.log('Status:', health.status); // "healthy" | "degraded" | "critical"
```

## Architecture

### Core Components

1. **Hub Core** (`hub_core.ts`)
   - Main orchestration engine
   - Coordinates all subsystems
   - Provides unified API

2. **Hub Monitor** (`hub_monitor.ts`)
   - Real-time status tracking
   - Performance monitoring
   - Error detection

3. **Hub Sync** (`hub_sync.ts`)
   - Automatic synchronization
   - Retry logic with exponential backoff
   - Batch processing

4. **Hub Cache** (`hub_cache.ts`)
   - 100MB localStorage cache
   - Automatic cleanup
   - Pending/synced tracking

5. **Hub Bridge** (`hub_bridge.ts`)
   - BridgeLink integration
   - Connection quality monitoring
   - Authentication handling

### Monitored Modules

The Control Hub monitors 5 critical operational modules:

| Module | Description | Check Interval |
|--------|-------------|----------------|
| MMI | Manutenção Inteligente (Intelligent Maintenance) | 30s |
| PEO-DP | Auditoria e Conformidade (Audit & Compliance) | 30s |
| DP Intelligence | Forecast & Analytics | 60s |
| BridgeLink | Conectividade (Shore Connectivity) | 15s |
| SGSO | Sistema de Gestão (Management System) | 60s |

## API Reference

### Control Hub Endpoints

#### GET /api/control-hub/status
Returns complete system status including all modules, cache stats, and connection quality.

**Response:**
```json
{
  "modules": { /* module states */ },
  "connectionQuality": "excellent",
  "cacheSize": 1024000,
  "cacheCapacity": 104857600,
  "pendingRecords": 5,
  "lastSync": "2025-10-20T21:00:00Z",
  "systemHealth": "healthy"
}
```

#### POST /api/control-hub/sync
Triggers manual synchronization of pending cache entries.

**Request Body:**
```json
{
  "records": [/* cache entries */]
}
```

**Response:**
```json
{
  "success": true,
  "recordsSent": 15,
  "recordsFailed": 0,
  "errors": []
}
```

#### GET /api/control-hub/health
Health check endpoint for monitoring systems.

**Response (200 if healthy, 503 if critical):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T21:00:00Z",
  "modules": {
    "mmi": "operational",
    "peo-dp": "operational",
    /* ... */
  },
  "uptime": 3600000
}
```

### BridgeLink Endpoints

#### GET /api/bridgelink/ping
Check connection to BridgeLink.

#### POST /api/bridgelink/sync
Sync data with BridgeLink shore system.

#### POST /api/bridgelink/auth
Authenticate with BridgeLink.

## Configuration

Edit `src/modules/control_hub/hub_config.json` to customize:

```json
{
  "modules": {
    "mmi": {
      "name": "MMI (Manutenção Inteligente)",
      "endpoint": "/api/mmi/status",
      "priority": 1,
      "checkInterval": 30000
    }
    /* ... other modules */
  },
  "cache": {
    "maxSize": 104857600,  // 100MB
    "storageKey": "nautilus_control_hub_cache",
    "cleanupThreshold": 0.9
  },
  "sync": {
    "autoSyncInterval": 300000,  // 5 minutes
    "retryAttempts": 3,
    "retryDelay": 5000,
    "batchSize": 100
  },
  "bridgelink": {
    "endpoint": "/api/bridgelink/sync",
    "timeout": 30000,
    "authRequired": true
  }
}
```

## Dashboard Usage

Access the Control Hub dashboard at `/control-hub`.

### Dashboard Features

- **System Status Alert**: Visual indicator of overall system health
- **Connection Quality**: Real-time BridgeLink connection status
- **Module Cards**: Individual status for each monitored module
- **Cache Statistics**: Usage, capacity, and pending records
- **Sync Controls**: Last sync time and manual sync button
- **Auto-refresh**: Dashboard updates every 30 seconds

### Status Indicators

**System Health:**
- 🟢 **Healthy**: All modules operational
- 🟡 **Degraded**: Some modules offline or degraded
- 🔴 **Critical**: Multiple errors or system failure

**Module Status:**
- **Operational**: Normal operation (< 5s response)
- **Degraded**: Performance issues (> 5s response)
- **Offline**: No connection
- **Error**: 3+ consecutive failures

**Connection Quality:**
- 🟢 **Excellent**: < 200ms latency
- 🔵 **Good**: 200-500ms latency
- 🟡 **Poor**: > 500ms latency
- ⚫ **Offline**: No connection

## Offline Operation

### How It Works

1. **Normal Operation**: Data flows directly to BridgeLink
2. **Connection Lost**: Data is automatically queued in local cache
3. **Store-and-Forward**: Cache grows up to 100MB capacity
4. **Connection Restored**: Automatic sync of pending entries
5. **Cleanup**: Old synchronized entries removed at 90% capacity

### Cache Management

```typescript
// Get cache statistics
const stats = controlHub.getCacheStats();
console.log('Total entries:', stats.total);
console.log('Pending sync:', stats.pending);
console.log('Usage:', stats.usagePercent + '%');

// Clear synchronized entries
controlHub.clearSynchronizedCache();
```

## Error Handling

The Control Hub implements multiple layers of error handling:

1. **Retry Logic**: 3 attempts with exponential backoff
2. **Graceful Degradation**: System continues with reduced functionality
3. **Error Tracking**: All errors logged and counted per module
4. **Auto-recovery**: Automatic reconnection and resynchronization

### Common Issues

**Module shows "Error" status:**
- Check module endpoint availability
- Verify network connectivity
- Review module logs for specific errors

**Sync failing:**
- Check BridgeLink connection
- Verify authentication token
- Check cache size (may be full)

**High cache usage:**
- Trigger manual sync
- Check BridgeLink connectivity
- Consider clearing old synchronized entries

## Performance

The Control Hub is optimized for maritime environments:

- **Initial Load**: < 500ms
- **Dashboard Render**: < 100ms
- **Status Refresh**: < 200ms
- **Sync Operation**: < 2s
- **Cache Operations**: < 50ms

## Testing

Run the Control Hub test suite:

```bash
npm test src/tests/control-hub.test.ts
```

**Test Coverage:**
- Cache operations (7 tests)
- Configuration validation (4 tests)
- Module integration (2 tests)

All 13 tests passing ✅

## Best Practices

1. **Regular Monitoring**: Check dashboard at least once per shift
2. **Manual Sync**: Trigger before critical operations
3. **Cache Management**: Monitor usage, clear when > 80%
4. **Connection Quality**: Ensure "Good" or better for real-time ops
5. **Error Response**: Investigate any module errors immediately

## Troubleshooting

### Dashboard not loading
- Clear browser cache
- Check JavaScript console for errors
- Verify Control Hub is initialized

### Modules showing offline
- Check module endpoints are accessible
- Verify network connectivity
- Review module-specific logs

### Sync not working
- Check BridgeLink connection quality
- Verify authentication token
- Check for pending errors in sync logs

### Cache full
- Trigger manual sync to clear pending
- Clear synchronized entries
- Check BridgeLink connectivity

## Security

The Control Hub implements several security measures:

- **Token Authentication**: BridgeLink requires valid token
- **Encrypted Logs**: Support for encrypted error logs (configurable)
- **Input Validation**: All API endpoints validate inputs
- **Timeout Protection**: 30s timeout on all external calls

## Support

For issues or questions:
1. Check this documentation
2. Review inline code comments
3. Check test files for usage examples
4. Contact Nautilus One support team

## Version History

**v1.0.0** (Phase 4 Implementation)
- Initial release
- 5 module monitoring
- 100MB offline cache
- BridgeLink integration
- Complete dashboard
- 13 test suite

## License

Part of the Nautilus One system. All rights reserved.

---

**Built with ❤️ for maritime operations**
