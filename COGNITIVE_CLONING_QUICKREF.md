# Cognitive Cloning Infrastructure - Quick Reference

## Quick Start

```typescript
// Import everything you need
import { 
  cognitiveCloneManager,
  adaptiveUIEngine,
  useAdaptiveUI,
  instanceController 
} from '@/core';

import { edgeAICore, analyzeRoute } from '@/ai';
```

---

## PATCH 221: Cognitive Clone Manager

### Create Snapshot
```typescript
const snapshot = await cognitiveCloneManager.createSnapshot(
  name, modules, llmContext, userId, description, tags
);
```

### Clone Instance
```typescript
const clone = await cognitiveCloneManager.cloneInstance(
  snapshotId, environment, userId, name
);
```

### Export/Import
```typescript
const exported = await cognitiveCloneManager.exportSnapshot(snapshotId);
const imported = await cognitiveCloneManager.importSnapshot(exported, userId);
```

### Restore
```typescript
const restored = await cognitiveCloneManager.restoreFromSnapshot(snapshotId);
```

---

## PATCH 222: Adaptive UI Engine

### React Hook
```typescript
const config = useAdaptiveUI();
if (config.mode === 'minimal') return <LightView />;
```

### Set Mission Context
```typescript
adaptiveUIEngine.setMissionContext({
  priority: 'critical',
  type: 'emergency'
});
```

### Force Mode
```typescript
adaptiveUIEngine.forceMode('minimal');
```

### Get Config
```typescript
const config = adaptiveUIEngine.getConfig();
// config.mode: 'full' | 'optimized' | 'minimal' | 'emergency'
// config.features: { enableAnimations, enableAutoRefresh, ... }
// config.components: { preferredWeight, lazyLoadThreshold, ... }
```

---

## PATCH 223: Edge AI Core

### Register Model
```typescript
await edgeAICore.registerModel({
  id: 'model-v1',
  name: 'Model Name',
  format: 'onnx-lite',
  size: 1024000,
  version: '1.0.0',
  task: 'classification'
});
```

### Run Inference
```typescript
const result = await edgeAICore.infer({
  modelId: 'model-v1',
  input: data,
  task: 'classification',
  options: { maxLatency: 1000, preferredBackend: 'webgpu' }
});
```

### Helper Functions
```typescript
const route = await analyzeRoute(routeData);
const failure = await detectFailure(systemData);
const classification = await classifyIncident(incidentData);
```

### Get Metrics
```typescript
const metrics = edgeAICore.getMetrics();
// metrics.averageLatency, successRate, totalInferences
```

---

## PATCH 224: Offline Deployment Kit

### Build Package
```typescript
import { offlineDeploymentBuilder } from '@/scripts/build/offlineDeploymentKit';

const result = await offlineDeploymentBuilder.build({
  format: 'zip',        // 'zip' | 'usb' | 'iso' | 'docker'
  includeAI: true,
  dbType: 'dexie',      // 'sqlite' | 'dexie' | 'pouchdb'
  includeModels: ['route-analyzer-v1'],
  targetPlatform: 'universal',
  compression: 'gzip',
  outputDir: './exports'
});
```

---

## PATCH 225: Mirror Instance Controller

### Initialize
```typescript
await instanceController.initialize();
```

### Register Instance
```typescript
const instance = await instanceController.registerInstance({
  id: 'unit-01',
  name: 'Field Unit',
  environment: 'production',
  status: 'online',
  metadata: { version: '1.0.0', uptime: 0 }
});
```

### List Instances
```typescript
const all = instanceController.listInstances();
const online = instanceController.listInstances({ status: 'online' });
```

### Sync Instances
```typescript
// Single sync
const result = await instanceController.syncInstance(
  sourceId, targetId,
  { operation: 'bidirectional', priority: 'high' }
);

// Sync all
const results = await instanceController.syncAll(sourceId);

// Force push/pull
await instanceController.forcePush(sourceId, targetId);
await instanceController.forcePull(sourceId, targetId);
```

### Process Heartbeat
```typescript
await instanceController.processHeartbeat({
  instanceId: 'unit-01',
  timestamp: Date.now(),
  status: 'online',
  metrics: { cpu: 45, memory: 60, disk: 30, network: { latency: 50, bandwidth: 10 } },
  activeModules: ['mmi', 'dp']
});
```

---

## Database Tables

### clone_registry
Stores snapshots and instances
```sql
SELECT * FROM clone_registry WHERE user_id = 'user123';
```

### edge_ai_log
AI inference performance logs
```sql
SELECT model_id, AVG(latency_ms) FROM edge_ai_log 
WHERE success = true GROUP BY model_id;
```

### clone_sync_log
Instance sync audit trail
```sql
SELECT * FROM clone_sync_log 
WHERE source_id = 'master' ORDER BY created_at DESC;
```

---

## Type Reference

### Cognitive Clone Manager
```typescript
type ModuleState = { moduleId, moduleName, config, state, version }
type LLMContext = { conversationHistory, systemPrompt, temperature, maxTokens, model }
type CognitiveSnapshot = { id, name, modules, llmContext, metadata, ... }
type CloneInstance = { id, snapshotId, name, environment, status, ... }
```

### Adaptive UI Engine
```typescript
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'console'
type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline'
type UIMode = 'full' | 'optimized' | 'minimal' | 'emergency'
type ComponentWeight = 'light' | 'medium' | 'heavy'
```

### Edge AI Core
```typescript
type AIBackend = 'webgpu' | 'webgl' | 'wasm' | 'cpu'
type ModelFormat = 'ggml' | 'onnx-lite' | 'tflite' | 'custom'
type InferenceTask = 'classification' | 'route-analysis' | 'failure-detection' | 'quick-response'
```

### Mirror Instance Controller
```typescript
type SyncOperation = 'push' | 'pull' | 'bidirectional'
type InstanceStatus = 'online' | 'offline' | 'syncing' | 'error'
type SyncPriority = 'low' | 'normal' | 'high' | 'critical'
```

---

## Common Patterns

### Full Workflow
```typescript
// 1. Create snapshot of current state
const snapshot = await cognitiveCloneManager.createSnapshot(
  'Production v2.0', modules, llmContext, userId
);

// 2. Create field clone
const clone = await cognitiveCloneManager.cloneInstance(
  snapshot.id, 'remote', userId, 'Field Unit'
);

// 3. Register as mirror instance
const instance = await instanceController.registerInstance({
  id: clone.id,
  name: clone.name,
  environment: 'field',
  status: 'online',
  metadata: { version: '2.0.0', uptime: 0, cloneOf: snapshot.id }
});

// 4. Configure adaptive UI for field conditions
adaptiveUIEngine.setMissionContext({
  priority: 'high',
  type: 'operational'
});

// 5. Register AI models for offline use
await edgeAICore.registerModel({
  id: 'route-analyzer-v1',
  name: 'Route Analyzer',
  format: 'onnx-lite',
  size: 5242880,
  version: '1.0.0',
  task: 'route-analysis'
});

// 6. Sync periodically
setInterval(async () => {
  await instanceController.syncInstance(
    'master', clone.id,
    { operation: 'bidirectional', priority: 'normal' }
  );
}, 300000); // Every 5 minutes
```

### React Component Example
```typescript
function FieldOperationsView() {
  const uiConfig = useAdaptiveUI();
  const [syncStatus, setSyncStatus] = useState(null);
  
  useEffect(() => {
    const status = instanceController.getSyncStatus('field-unit-01');
    setSyncStatus(status);
  }, []);
  
  return (
    <div>
      {uiConfig.mode === 'minimal' ? (
        <MinimalDashboard />
      ) : (
        <FullDashboard animations={uiConfig.features.enableAnimations} />
      )}
      
      <SyncIndicator 
        lastSync={syncStatus?.lastSync}
        progress={syncStatus?.syncProgress}
      />
    </div>
  );
}
```

---

## Performance Tips

1. **Snapshots**: Keep < 10MB for fast operations
2. **AI Models**: Use int8 quantization for 4x smaller size
3. **Sync**: Batch operations, sync every 5-30 min
4. **Heartbeats**: Default 30s interval is optimal
5. **Network Polling**: 30s interval balances accuracy/overhead

---

## Troubleshooting Commands

```typescript
// Check system status
const backends = edgeAICore.getBackendCapabilities();
const aiMetrics = edgeAICore.getMetrics();
const uiConfig = adaptiveUIEngine.getConfig();
const instances = instanceController.listInstances();

// Force offline mode
adaptiveUIEngine.forceMode('minimal');

// Clear and re-sync
await instanceController.syncAll('master', { 
  operation: 'push', 
  priority: 'high' 
});

// Check sync logs
// Query: SELECT * FROM clone_sync_log ORDER BY created_at DESC LIMIT 10;
```

---

## Key Files

- `src/core/clones/cognitiveClone.ts` - Clone Manager
- `src/core/adaptiveUI.ts` - Adaptive UI Engine
- `src/ai/edge/edgeAICore.ts` - Edge AI Core
- `scripts/build/offlineDeploymentKit.ts` - Deployment Builder
- `src/core/mirrors/instanceController.ts` - Instance Controller
- `tests/cognitive-cloning.test.ts` - Test Suite
- `supabase/migrations/20251026_cognitive_cloning_infrastructure.sql` - DB Schema

---

## Resources

- Full Guide: `COGNITIVE_CLONING_IMPLEMENTATION_GUIDE.md`
- Test Examples: `tests/cognitive-cloning.test.ts`
- API Exports: `src/core/index.ts`, `src/ai/index.ts`
