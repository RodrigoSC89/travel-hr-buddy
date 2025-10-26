# Cognitive Cloning Infrastructure - Implementation Guide

## Overview

This implementation adds enterprise-grade infrastructure for distributed Nautilus operations, including:

- **Cognitive Clone Manager** (PATCH 221): System for creating, managing, and deploying cognitive snapshots
- **Adaptive UI Engine** (PATCH 222): Context-aware UI reconfiguration based on device, network, and mission parameters
- **Edge AI Core** (PATCH 223): Local AI inference with multi-backend support
- **Offline Deployment Kit** (PATCH 224): Tools for packaging autonomous Nautilus instances
- **Mirror Instance Controller** (PATCH 225): Orchestration and synchronization of distributed instances

---

## PATCH 221: Cognitive Clone Manager

### Purpose
Create functional copies of Nautilus with replicated AI and limited context for distributed operations.

### Location
`src/core/clones/cognitiveClone.ts`

### Key Features

1. **Snapshot Creation**: Capture complete system state including modules and LLM context
2. **Clone Management**: Create, export, import, and restore clones
3. **Offline Support**: localStorage persistence for offline operations
4. **Data Integrity**: Checksum validation for imports/exports

### Usage Examples

```typescript
import { cognitiveCloneManager } from '@/core/clones/cognitiveClone';

// Create a snapshot
const snapshot = await cognitiveCloneManager.createSnapshot(
  'Production Snapshot',
  modules,
  llmContext,
  userId,
  'Snapshot before major update',
  ['production', 'v2.0']
);

// Clone an instance
const clone = await cognitiveCloneManager.cloneInstance(
  snapshot.id,
  'remote',
  userId,
  'Field Operations Clone'
);

// Export for offline use
const exportData = await cognitiveCloneManager.exportSnapshot(snapshot.id);

// Import from export
const imported = await cognitiveCloneManager.importSnapshot(exportData, userId);

// Restore from snapshot
const restored = await cognitiveCloneManager.restoreFromSnapshot(snapshot.id);
```

### Database Schema

```sql
CREATE TABLE clone_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## PATCH 222: Adaptive UI Engine

### Purpose
Automatically adapt UI based on device type, network quality, and operational context.

### Location
`src/core/adaptiveUI.ts`

### Key Features

1. **Device Detection**: Automatically detects mobile, tablet, desktop, or console
2. **Network Monitoring**: Real-time network quality assessment
3. **Mission Context**: Adjusts UI based on operational priority
4. **Feature Toggles**: Dynamically enable/disable features based on context
5. **React Integration**: Hook-based API for React components

### Usage Examples

```typescript
import { adaptiveUIEngine, useAdaptiveUI } from '@/core/adaptiveUI';

// In a React component
function AdaptiveComponent() {
  const config = useAdaptiveUI();
  
  if (config.mode === 'minimal') {
    return <LightweightView />;
  }
  
  return (
    <div>
      {config.features.enableAnimations && <AnimatedHeader />}
      {config.features.enableRichContent && <RichContent />}
    </div>
  );
}

// Set mission context
adaptiveUIEngine.setMissionContext({
  priority: 'critical',
  type: 'emergency',
  timeConstraint: 'urgent'
});

// Force a specific mode
adaptiveUIEngine.forceMode('minimal');

// Get current configuration
const config = adaptiveUIEngine.getConfig();
```

### UI Modes

- **Full**: All features enabled (desktop + excellent network)
- **Optimized**: Balanced features (tablet + good network)
- **Minimal**: Essential only (mobile or poor network)
- **Emergency**: Critical operations only (emergency missions)

---

## PATCH 223: Edge AI Core

### Purpose
Execute AI inference locally without cloud dependency using embedded models.

### Location
`src/ai/edge/edgeAICore.ts`

### Key Features

1. **Multi-Backend Support**: WebGPU → WebGL → WASM → CPU fallback
2. **Model Formats**: Support for ggml, onnx-lite, tflite
3. **Performance Tracking**: Latency and success rate monitoring
4. **Offline Operation**: No internet required after model loading

### Usage Examples

```typescript
import { edgeAICore, analyzeRoute, detectFailure } from '@/ai/edge/edgeAICore';

// Register a model
await edgeAICore.registerModel({
  id: 'route-analyzer-v1',
  name: 'Route Analyzer',
  format: 'onnx-lite',
  size: 5242880,
  version: '1.0.0',
  task: 'route-analysis',
  quantization: 'int8'
});

// Run inference
const result = await edgeAICore.infer({
  modelId: 'route-analyzer-v1',
  input: routeData,
  task: 'route-analysis',
  options: {
    maxLatency: 1000,
    preferredBackend: 'webgpu',
    fallbackEnabled: true
  }
});

// Helper functions for common tasks
const routeAnalysis = await analyzeRoute(routeData);
const failureDetection = await detectFailure(systemData);
const classification = await classifyIncident(incidentData);

// Get performance metrics
const metrics = edgeAICore.getMetrics();
console.log(`Average latency: ${metrics.averageLatency}ms`);
console.log(`Success rate: ${metrics.successRate * 100}%`);
```

### Database Schema

```sql
CREATE TABLE edge_ai_log (
  id SERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  task TEXT NOT NULL,
  backend TEXT NOT NULL,
  latency_ms REAL NOT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## PATCH 224: Offline Deployment Kit Builder

### Purpose
Generate self-contained offline packages for autonomous Nautilus deployments.

### Location
`scripts/build/offlineDeploymentKit.ts`

### Key Features

1. **Multiple Formats**: .zip, .usb, .iso, Docker
2. **Complete Packages**: Includes Vite build, local DB, and AI models
3. **Manifest Generation**: Checksums and system requirements
4. **Database Options**: SQLite, Dexie, or PouchDB

### Usage Examples

```typescript
import { offlineDeploymentBuilder } from '@/scripts/build/offlineDeploymentKit';

// Build a ZIP package
const result = await offlineDeploymentBuilder.build({
  format: 'zip',
  includeAI: true,
  dbType: 'dexie',
  includeModels: ['route-analyzer-v1', 'failure-detector-v1'],
  targetPlatform: 'universal',
  compression: 'gzip',
  outputDir: './exports'
});

console.log(`Package created: ${result.outputPath}`);
console.log(`Size: ${result.size} bytes`);
console.log(`Build time: ${result.duration}ms`);

// Build Docker container
await offlineDeploymentBuilder.build({
  format: 'docker',
  includeAI: true,
  dbType: 'sqlite'
});
```

### Package Contents

- Vite production build (optimized assets)
- Local database with schema and seed data
- AI models (optional)
- Configuration files
- Installation instructions
- Manifest with checksums

---

## PATCH 225: Mirror Instance Controller

### Purpose
Orchestrate multiple distributed Nautilus clones with synchronization and monitoring.

### Location
`src/core/mirrors/instanceController.ts`

### Key Features

1. **Instance Management**: Register, track, and remove instances
2. **Synchronization**: Push, pull, or bidirectional sync operations
3. **Heartbeat Monitoring**: Automatic detection of offline instances
4. **Telemetry Collection**: Aggregated metrics from all instances
5. **Priority-based Sync**: Control sync order based on priority

### Usage Examples

```typescript
import { instanceController } from '@/core/mirrors/instanceController';

// Initialize the controller
await instanceController.initialize();

// Register a new instance
const instance = await instanceController.registerInstance({
  id: 'field-unit-01',
  name: 'Field Unit Alpha',
  environment: 'production',
  status: 'online',
  location: {
    lat: -23.5505,
    lon: -46.6333,
    description: 'São Paulo Operations'
  },
  metadata: {
    version: '1.0.0',
    uptime: 0
  }
});

// List all instances
const instances = instanceController.listInstances({ status: 'online' });

// Sync specific instances
const syncResult = await instanceController.syncInstance(
  'master-unit',
  'field-unit-01',
  {
    operation: 'bidirectional',
    priority: 'high',
    selective: {
      modules: ['mmi', 'dp'],
      dataSince: Date.now() - 86400000 // Last 24 hours
    },
    options: {
      compress: true,
      encrypt: true,
      retryOnFailure: true,
      maxRetries: 3
    }
  }
);

// Sync all instances
const results = await instanceController.syncAll('master-unit', {
  operation: 'push',
  priority: 'normal'
});

// Process heartbeat
await instanceController.processHeartbeat({
  instanceId: 'field-unit-01',
  timestamp: Date.now(),
  status: 'online',
  metrics: {
    cpu: 45,
    memory: 60,
    disk: 30,
    network: { latency: 50, bandwidth: 10 }
  },
  activeModules: ['mmi', 'dp', 'wsog']
});

// Get sync status
const status = instanceController.getSyncStatus('field-unit-01');
```

### Database Schema

```sql
CREATE TABLE clone_sync_log (
  id SERIAL PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  items_synced INTEGER DEFAULT 0,
  bytes_transferred BIGINT DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Testing

Comprehensive test suite included in `tests/cognitive-cloning.test.ts`:

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/cognitive-cloning.test.ts

# Watch mode
npm run test:watch
```

### Test Coverage

- Snapshot creation and management
- Clone lifecycle (create, export, import)
- Adaptive UI configuration detection
- Edge AI backend detection and inference
- Instance registration and synchronization
- Heartbeat monitoring

---

## Database Migration

Run the Supabase migration to create required tables:

```bash
# Using Supabase CLI
supabase migration up

# Or apply directly
psql -f supabase/migrations/20251026_cognitive_cloning_infrastructure.sql
```

This creates three tables:
1. `clone_registry` - Cognitive snapshots and instances
2. `edge_ai_log` - AI inference performance tracking
3. `clone_sync_log` - Instance synchronization audit trail

All tables include Row-Level Security (RLS) policies.

---

## Integration

Import and use the new features in your application:

```typescript
// In your main app initialization
import { 
  cognitiveCloneManager,
  adaptiveUIEngine,
  instanceController 
} from '@/core';

import { edgeAICore } from '@/ai';

// Initialize systems
await instanceController.initialize();

// Register AI models
await edgeAICore.registerModel({...});

// Set up adaptive UI
adaptiveUIEngine.setMissionContext({
  priority: 'high',
  type: 'operational'
});
```

---

## Performance Considerations

1. **Snapshot Size**: Keep LLM context history reasonable (< 100 messages)
2. **AI Model Size**: Use quantized models (int8) for better performance
3. **Sync Frequency**: Don't sync too frequently (recommended: 5-30 minutes)
4. **Heartbeat Interval**: Default 30s is optimal for most cases
5. **Network Checks**: Poll every 30s to balance accuracy and overhead

---

## Security Notes

1. **Snapshot Encryption**: Consider encrypting sensitive snapshot data
2. **Sync Authentication**: Ensure proper auth tokens for sync operations
3. **RLS Policies**: All tables have user-scoped RLS policies
4. **Checksum Validation**: Always validate checksums on import
5. **Network Security**: Use HTTPS/WSS for sync communications

---

## Future Enhancements

- [ ] Snapshot compression with brotli/gzip
- [ ] Differential sync (only changed data)
- [ ] Model quantization pipeline
- [ ] WebGPU shader compilation caching
- [ ] P2P sync between instances
- [ ] Encrypted snapshot storage
- [ ] Snapshot versioning and rollback
- [ ] Advanced telemetry dashboards

---

## Troubleshooting

### Snapshot Creation Fails
- Check Supabase connection
- Verify user authentication
- Ensure localStorage quota available

### AI Inference Slow
- Check backend availability (WebGPU/WebGL)
- Try smaller models or lower quantization
- Monitor network latency

### Sync Failures
- Verify both instances are online
- Check network connectivity
- Review sync operation priority queue
- Examine clone_sync_log for errors

### Adaptive UI Not Changing
- Force a specific mode to test
- Check mission context settings
- Verify network detection working

---

## Support

For issues or questions:
- Review test files for usage examples
- Check console logs for detailed error messages
- Examine Supabase logs for database issues
- Review performance metrics from Edge AI Core

---

## License

Part of the Nautilus Travel HR Buddy system.
