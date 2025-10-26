# Patches 196-200: Quick Reference Card

## 🚀 Quick Start

```typescript
// 1. Initialize all systems
import { autonomyLayer } from '@/ai/autonomy-layer';
import { knowledgeSync } from '@/ai/sync/knowledgeSync';

autonomyLayer.start();
knowledgeSync.start(24); // Sync every 24 hours

// 2. Track events
import { learningCore } from '@/ai/learning-core';

await learningCore.trackInteraction('module-name', 'action', userId);
await learningCore.trackModuleError('module-name', 'error message');

// 3. Make decisions
import { missionCore } from '@/ai/mission-core';

const decision = await missionCore.makeDecision({
  current_state: { /* system state */ },
  incident_type: 'system-failure',
  severity: 'high',
  available_protocols: [],
  historical_data: []
});

// 4. Use tenant context
import { getCurrentTenantContext } from '@/lib/saas/withTenantContext';

const tenant = getCurrentTenantContext();
console.log(tenant?.tenantId);
```

## 📋 Module Reference

### Learning Core (`src/ai/learning-core.ts`)

**Purpose:** Track system usage for AI training

**Key Methods:**
- `trackInteraction(module, action, userId?, data?)` - Log user actions
- `trackSystemEvent(event, module, data, outcome?)` - Log system events
- `trackModuleError(module, error, stack?, userId?)` - Log errors
- `trackDecision(module, type, input, output, confidence?)` - Log AI decisions
- `generateTrainingData(startDate?, endDate?)` - Generate dataset
- `exportTrainingDataset(startDate?, endDate?, filename?)` - Export JSON
- `cleanOldEvents()` - Clean data beyond retention period
- `updateConfig(config)` - Update configuration

**Config:**
```typescript
{
  learning_enabled: boolean,
  retention_days: number
}
```

---

### SaaS Engine (`src/lib/saas/withTenantContext.ts`)

**Purpose:** Multitenancy with data isolation

**Key Functions:**
- `getCurrentTenantContext()` - Get current tenant
- `setTenantContext(tenantId)` - Set tenant (dev/test)
- `clearTenantContext()` - Clear tenant context
- `createTenantClient()` - Get tenant-aware Supabase client
- `verifyTenantAccess(userId, tenantId)` - Check access
- `getUserTenantRole(userId, tenantId)` - Get user role
- `getTenantModules(tenantId)` - Get enabled modules
- `isModuleEnabledForTenant(tenantId, module)` - Check module status
- `useTenantContext()` - React hook

**Tenant Context:**
```typescript
{
  tenantId: string,
  tenantName?: string,
  userId?: string,
  permissions?: string[]
}
```

---

### Autonomy Layer (`src/ai/autonomy-layer.ts`)

**Purpose:** Autonomous system responses

**Key Methods:**
- `start()` - Start autonomy layer
- `stop()` - Stop autonomy layer
- `handleEvent(event)` - Queue event for processing
- `addRule(rule)` - Add custom rule
- `removeRule(ruleId)` - Remove rule
- `setRuleEnabled(ruleId, enabled)` - Enable/disable rule
- `getRules()` - Get all rules
- `getRule(ruleId)` - Get specific rule

**Default Rules:**
1. `restart-on-crash` (Priority 10)
2. `notify-high-latency` (Priority 5)
3. `disable-faulty-feature` (Priority 8)
4. `route-fallback` (Priority 7)
5. `cache-flush` (Priority 3)

**Event Structure:**
```typescript
{
  type: 'module_crash' | 'high_latency' | 'api_failure' | 'error_threshold' | 'custom',
  module: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  data: Record<string, any>,
  timestamp: Date
}
```

---

### Rules Manager (`src/ai/engine/rules.ts`)

**Purpose:** Rule template management

**Key Methods:**
- `createRuleFromTemplate(templateId, ruleId, params, priority)` - Create rule
- `getTemplates()` - Get all templates
- `getTemplate(templateId)` - Get specific template
- `addTemplate(templateId, template)` - Add custom template
- `validateRule(rule)` - Validate rule config

**Templates:**
- `error-threshold` - Trigger on error count
- `latency-threshold` - Trigger on high latency
- `memory-threshold` - Trigger on memory usage
- `rate-limit` - Trigger on request rate

---

### Knowledge Sync (`src/ai/sync/knowledgeSync.ts`)

**Purpose:** Local-to-global AI knowledge sync

**Key Methods:**
- `start(intervalHours)` - Start auto-sync
- `stop()` - Stop auto-sync
- `triggerSync()` - Manual sync
- `getLastSyncTime()` - Get last sync timestamp
- `setConfidenceThreshold(threshold)` - Set merge threshold

**Sync Process:**
1. Create local snapshots
2. Sync to global knowledge
3. Detect behavior drift
4. Apply safe merges (>85% confidence)

**Drift Detection:**
- Compares local vs global metrics
- Flags changes >20%
- Significance: low, medium, high

---

### Mission AI Core (`src/ai/mission-core.ts`)

**Purpose:** Mission-critical autonomous decisions

**Key Methods:**
- `makeDecision(context)` - Make autonomous decision
- `recordIncident(incident)` - Log incident
- `recordWeatherPattern(pattern)` - Log weather
- `getProtocol(protocolId)` - Get protocol
- `getAllProtocols()` - Get all protocols
- `getIncidentHistory()` - Get incidents
- `getWeatherPatterns()` - Get weather data
- `isOffline()` - Check offline mode
- `setRiskThreshold(threshold)` - Set risk limit

**Emergency Protocols:**
1. `system-failure` - Critical system failure
2. `weather-emergency` - Severe weather
3. `comm-loss` - Communication loss
4. `medical-emergency` - Crew medical emergency

**Decision Output:**
```typescript
{
  action: 'suggest' | 'act' | 'escalate',
  protocol?: EmergencyProtocol,
  reasoning: string,
  confidence: number,
  risk_score: number, // 0-10
  requires_human_override: boolean,
  automated_steps: string[],
  manual_steps: string[]
}
```

---

## 🗄️ Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `learning_events` | AI training events | event_type, module_name, event_data |
| `tenants` | Organizations | name, slug, subdomain, status |
| `tenant_users` | User-tenant mapping | tenant_id, user_id, role |
| `tenant_modules` | Module configs | tenant_id, module_name, enabled |
| `local_knowledge` | Local snapshots | module_name, usage_data, metrics |
| `global_knowledge` | Aggregated data | module_name, confidence_score |

---

## 🔐 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Tenant isolation in place
- ✅ Permission checks implemented
- ✅ Human override for high-risk actions
- ✅ Audit trail via learning events
- ✅ No sensitive data in localStorage

---

## 🎯 Common Use Cases

### 1. Track User Activity
```typescript
await learningCore.trackInteraction(
  'orders-module',
  'create_order',
  userId,
  { order_type: 'maintenance' }
);
```

### 2. Handle Module Crash
```typescript
await autonomyLayer.handleEvent({
  type: 'module_crash',
  module: 'payment-processor',
  severity: 'high',
  data: { error: 'Connection timeout' },
  timestamp: new Date()
});
```

### 3. Emergency Decision
```typescript
const decision = await missionCore.makeDecision({
  current_state: {
    modules_status: { 'nav-system': 'offline' },
    connectivity: 'offline',
    crew_status: 'alert'
  },
  incident_type: 'system-failure',
  severity: 'high',
  available_protocols: [],
  historical_data: []
});

if (decision.action === 'act') {
  // Execute automated steps
} else if (decision.requires_human_override) {
  // Request human review
}
```

### 4. Export Training Data
```typescript
const json = await learningCore.exportTrainingDataset(
  '2025-01-01',
  '2025-01-31',
  'january-training.json'
);
```

### 5. Multi-tenant Query
```typescript
import { createTenantClient } from '@/lib/saas/withTenantContext';

const client = createTenantClient();
const { data } = await client
  .from('orders')
  .select('*'); // Automatically filtered by tenant_id
```

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Events not logging | Check `learning_enabled` config |
| Tenant not detected | Verify subdomain or localStorage |
| Autonomy not working | Check rule conditions match events |
| Sync failing | Verify Supabase connection |
| High risk score | Adjust `riskThreshold` in mission core |

---

## 📚 Documentation Links

- **Full Guide:** `PATCHES_196_200_IMPLEMENTATION.md`
- **Summary:** `PATCHES_196_200_SUMMARY.md`
- **Migration:** `supabase/migrations/20250126_patches_196_200.sql`
- **This Card:** `PATCHES_196_200_QUICKREF.md`

---

**Version:** 1.0  
**Date:** 2025-01-26  
**Status:** Production Ready ✅
