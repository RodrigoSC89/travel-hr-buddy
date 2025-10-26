# Patches 196-200: AI Learning & Multitenancy Implementation

This document provides comprehensive documentation for patches 196-200, which introduce advanced AI learning capabilities and multitenancy support.

## Overview

Five major patches have been implemented:
- **PATCH 196.0**: Learning Core (IA Aprendente)
- **PATCH 197.0**: SaaS Engine (Multitenant Engine)
- **PATCH 198.0**: Autonomy Layer (Resposta Autônoma)
- **PATCH 199.0**: Knowledge Sync (IA Local + Global)
- **PATCH 200.0**: Mission AI Core (IA Autônoma de Missão)

## PATCH 196.0 - Learning Core

### Purpose
Tracks system usage, logs, and decisions to train AI behavior over time.

### Files Created
- `src/ai/learning-core.ts`

### Key Features
- **Event Tracking**: Captures user interactions, system events, module errors, and AI decisions
- **Auto-buffering**: Batches events and flushes to Supabase every 30 seconds or when buffer is full
- **Pattern Analysis**: Analyzes usage patterns from collected events
- **Training Data Export**: Generates JSON datasets for LLM training
- **Data Retention**: Configurable retention policy (default 90 days)

### Configuration
```typescript
const config = {
  learning_enabled: true,
  retention_days: 90
};
```

### Usage Examples

#### Track User Interaction
```typescript
import { learningCore } from '@/ai/learning-core';

await learningCore.trackInteraction(
  'mmi-module',
  'create_order',
  userId,
  { order_type: 'maintenance', priority: 'high' }
);
```

#### Track Module Error
```typescript
await learningCore.trackModuleError(
  'autonomy-layer',
  'Failed to restart module',
  error.stack,
  userId
);
```

#### Generate Training Data
```typescript
const dataset = await learningCore.generateTrainingData(
  '2025-01-01',
  '2025-01-31'
);
```

#### Export Training Dataset
```typescript
await learningCore.exportTrainingDataset(
  startDate,
  endDate,
  'training-data-january.json'
);
```

## PATCH 197.0 - SaaS Engine

### Purpose
Implements secure multitenancy to isolate tenants (companies/organizations) in the system.

### Files Created
- `src/lib/saas/withTenantContext.ts`

### Key Features
- **Tenant Context Detection**: Extracts tenant from subdomain, header, or localStorage
- **Automatic Isolation**: Wraps Supabase queries with tenant_id filters
- **Access Verification**: Validates user access to tenant
- **Module Management**: Per-tenant module enable/disable
- **Middleware Support**: Request middleware for tenant injection

### Usage Examples

#### Get Current Tenant
```typescript
import { getCurrentTenantContext } from '@/lib/saas/withTenantContext';

const context = getCurrentTenantContext();
console.log(context?.tenantId);
```

#### Use Tenant-Aware Client
```typescript
import { createTenantClient } from '@/lib/saas/withTenantContext';

const client = createTenantClient();
const { data } = await client
  .from('orders')
  .select('*'); // Automatically filtered by tenant_id
```

#### Verify Tenant Access
```typescript
import { verifyTenantAccess } from '@/lib/saas/withTenantContext';

const hasAccess = await verifyTenantAccess(userId, tenantId);
if (!hasAccess) {
  throw new Error('Unauthorized');
}
```

#### React Hook
```typescript
import { useTenantContext } from '@/lib/saas/withTenantContext';

function MyComponent() {
  const { tenantId, isMultiTenant } = useTenantContext();
  
  return <div>Tenant: {tenantId}</div>;
}
```

## PATCH 198.0 - Autonomy Layer

### Purpose
Autonomous response system that acts on failures or events without human interaction.

### Files Created
- `src/ai/autonomy-layer.ts`
- `src/ai/engine/rules.ts`

### Key Features
- **5 Default Rules**: Restart on crash, notify on high latency, disable faulty feature, route fallback, cache flush
- **Priority System**: Rules execute based on priority (0-10)
- **Event Queue**: Processes events asynchronously
- **Human Review**: Escalates high-risk actions for human approval
- **Rule Templates**: Pre-built templates for common scenarios

### Default Rules

1. **Restart on Crash** (Priority 10): Automatically restart crashed modules
2. **Notify on High Latency** (Priority 5): Send alerts when latency > 5000ms
3. **Auto-disable Faulty Feature** (Priority 8): Disable features with >10 errors
4. **Route Fallback** (Priority 7): Switch to fallback on 3+ consecutive failures
5. **Cache Flush** (Priority 3): Flush stale cache data

### Usage Examples

#### Start Autonomy Layer
```typescript
import { autonomyLayer } from '@/ai/autonomy-layer';

autonomyLayer.start();
```

#### Handle Event
```typescript
await autonomyLayer.handleEvent({
  type: 'module_crash',
  module: 'payment-processor',
  severity: 'high',
  data: { error: 'Connection timeout' },
  timestamp: new Date()
});
```

#### Add Custom Rule
```typescript
autonomyLayer.addRule({
  id: 'custom-rule',
  name: 'Custom Response',
  description: 'Custom autonomous action',
  priority: 6,
  enabled: true,
  condition: (event) => event.type === 'custom',
  action: async (event) => {
    // Custom action logic
    return {
      success: true,
      action: 'custom_action',
      description: 'Action completed'
    };
  }
});
```

#### Create Rule from Template
```typescript
import { rulesManager } from '@/ai/engine/rules';

const rule = rulesManager.createRuleFromTemplate(
  'error-threshold',
  'high-error-alert',
  { threshold: 10, action: 'notify' },
  8
);

autonomyLayer.addRule(rule);
```

## PATCH 199.0 - Knowledge Sync

### Purpose
Syncs knowledge between local edge AI and global cloud AI for adaptive performance.

### Files Created
- `src/ai/sync/knowledgeSync.ts`

### Key Features
- **Daily Snapshots**: Captures local usage data daily
- **Global Sync**: Aggregates data across all instances
- **Drift Detection**: Identifies significant behavior changes (>20%)
- **Safe Merging**: Only applies merges with >85% confidence
- **Performance Tracking**: Monitors sync operations

### Usage Examples

#### Start Knowledge Sync
```typescript
import { knowledgeSync } from '@/ai/sync/knowledgeSync';

// Sync every 24 hours
knowledgeSync.start(24);
```

#### Manual Sync
```typescript
const result = await knowledgeSync.triggerSync();
console.log(`Synced ${result.knowledge_synced} items`);
console.log(`Detected ${result.drifts_detected.length} drifts`);
```

#### Get Last Sync Time
```typescript
const lastSync = knowledgeSync.getLastSyncTime();
console.log('Last synced:', lastSync);
```

#### Adjust Confidence Threshold
```typescript
// Require 90% confidence for merges
knowledgeSync.setConfidenceThreshold(0.90);
```

## PATCH 200.0 - Mission AI Core

### Purpose
Mission-critical AI for decisions in offline or high-risk scenarios.

### Files Created
- `src/ai/mission-core.ts`

### Key Features
- **4 Emergency Protocols**: System failure, weather emergency, communication loss, medical emergency
- **Offline Storage**: Persists protocols and history to localStorage
- **Risk Scoring**: Calculates risk on 0-10 scale
- **Human Override**: Requires approval for high-risk actions (≥7/10)
- **Context-Based Decisions**: Uses historical data and current state

### Emergency Protocols

1. **System Failure**: Isolate component, activate backup, notify crew
2. **Weather Emergency**: Secure operations, update route, alert authorities
3. **Communication Loss**: Switch to offline mode, cache data, attempt reconnection
4. **Medical Emergency**: Alert medical team, contact shore support, prepare evacuation

### Usage Examples

#### Make Decision
```typescript
import { missionCore } from '@/ai/mission-core';

const decision = await missionCore.makeDecision({
  current_state: {
    modules_status: { 'nav-system': 'offline' },
    connectivity: 'offline',
    crew_status: 'alert',
    resources: { battery: 75, fuel: 60 }
  },
  incident_type: 'system-failure',
  severity: 'high',
  available_protocols: ['system-failure'],
  historical_data: []
});

console.log(`Action: ${decision.action}`);
console.log(`Risk: ${decision.risk_score}/10`);
console.log(`Reasoning: ${decision.reasoning}`);

if (decision.requires_human_override) {
  // Escalate to human
  console.log('Human approval required');
} else {
  // Execute automated steps
  decision.automated_steps.forEach(step => {
    console.log(`Execute: ${step}`);
  });
}
```

#### Record Incident
```typescript
await missionCore.recordIncident({
  id: 'inc-001',
  incident_type: 'system-failure',
  timestamp: new Date().toISOString(),
  severity: 'high',
  resolution: 'Backup system activated',
  outcome: 'resolved',
  lessons_learned: [
    'Primary system timeout detection improved',
    'Backup activation successful'
  ],
  metadata: { module: 'nav-system' }
});
```

#### Record Weather Pattern
```typescript
missionCore.recordWeatherPattern({
  id: 'weather-001',
  location: 'North Atlantic',
  timestamp: new Date().toISOString(),
  conditions: {
    temperature: 15,
    wind_speed: 45,
    visibility: 2000,
    sea_state: 'rough'
  },
  risk_assessment: 'caution'
});
```

## Database Setup

### Required Supabase Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- See supabase/migrations/20250126_patches_196_200.sql
```

### Row Level Security (RLS)

For production deployment, implement RLS policies:

```sql
-- Tenant isolation for tenant_users
CREATE POLICY "Users can only access their own tenant"
  ON tenant_users
  FOR ALL
  USING (auth.uid() = user_id);

-- Tenant isolation for tenant_modules
CREATE POLICY "Modules filtered by tenant"
  ON tenant_modules
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Learning events filtered by tenant
CREATE POLICY "Learning events filtered by tenant"
  ON learning_events
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL
  );
```

## Integration Guide

### 1. Initialize All Systems
```typescript
import { learningCore } from '@/ai/learning-core';
import { autonomyLayer } from '@/ai/autonomy-layer';
import { knowledgeSync } from '@/ai/sync/knowledgeSync';
import { missionCore } from '@/ai/mission-core';

// Start systems
autonomyLayer.start();
knowledgeSync.start(24); // Sync every 24 hours

// Learning core starts automatically with default config
```

### 2. Track Events
```typescript
// Track interactions
await learningCore.trackInteraction(
  'module-name',
  'user-action',
  userId,
  { additional: 'data' }
);

// Track errors
await learningCore.trackModuleError(
  'module-name',
  errorMessage,
  errorStack
);
```

### 3. Handle Autonomous Events
```typescript
// Module crash detected
await autonomyLayer.handleEvent({
  type: 'module_crash',
  module: 'payment-processor',
  severity: 'high',
  data: { error: 'Connection timeout' },
  timestamp: new Date()
});
```

### 4. Make Mission-Critical Decisions
```typescript
const decision = await missionCore.makeDecision({
  current_state: systemState,
  incident_type: 'system-failure',
  severity: 'high',
  available_protocols: [],
  historical_data: []
});
```

## Testing

### Unit Tests
```typescript
describe('LearningCore', () => {
  it('should track interactions', async () => {
    await learningCore.trackInteraction('test-module', 'test-action');
    // Verify event logged
  });
});
```

### Integration Tests
```typescript
describe('Autonomy Layer Integration', () => {
  it('should restart module on crash', async () => {
    await autonomyLayer.handleEvent({
      type: 'module_crash',
      module: 'test-module',
      severity: 'high',
      data: {},
      timestamp: new Date()
    });
    // Verify module restart triggered
  });
});
```

## Performance Considerations

- **Learning Core**: Events are buffered and flushed in batches
- **Autonomy Layer**: Events are queued and processed asynchronously
- **Knowledge Sync**: Runs on configurable interval (default 24h)
- **Mission Core**: Offline-first design for reliability

## Security Considerations

- **Tenant Isolation**: All tenant data filtered by tenant_id
- **RLS Policies**: Implement RLS in Supabase for production
- **Human Override**: High-risk actions require manual approval
- **Audit Trail**: All decisions logged via learning core

## Monitoring

Monitor system health through:
- Learning events in `learning_events` table
- System logs via logger integration
- Knowledge sync results
- Autonomy layer actions
- Mission core decisions

## Troubleshooting

### Learning Core not logging events
- Check `learning_enabled` config flag
- Verify Supabase connection
- Check browser console for errors

### Tenant context not detected
- Verify subdomain setup
- Check localStorage fallback
- Ensure tenant exists in database

### Autonomy Layer not responding
- Verify `autonomyLayer.start()` called
- Check rule conditions match events
- Review priority settings

### Knowledge Sync failing
- Check Supabase connection
- Verify table permissions
- Review sync interval settings

## Future Enhancements

- UI dashboard for system monitoring
- Advanced analytics and reporting
- Machine learning model integration
- Real-time collaboration features
- Mobile app support
