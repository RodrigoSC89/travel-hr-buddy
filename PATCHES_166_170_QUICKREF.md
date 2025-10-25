# Multi-Vessel System Quick Reference

## Quick Start

### 1. Create a Mission
```typescript
import { MissionEngine } from '@/lib/mission-engine';

const mission = await MissionEngine.createMission({
  name: "Patrol Mission Alpha",
  mission_type: "patrol",
  priority: "normal",
  description: "Routine patrol of sector 4"
});
```

### 2. Assign Vessels
```typescript
// Get suggestions
const suggestions = await MissionEngine.suggestVesselAssignment('patrol', 'normal');

// Assign top vessel
await MissionEngine.assignVesselToMission(
  mission.id,
  suggestions[0].vessel.id,
  'primary'
);
```

### 3. Initialize AI
```typescript
import { DistributedAIEngine } from '@/lib/distributed-ai-engine';

await DistributedAIEngine.initialize(vesselId);

const decision = await DistributedAIEngine.runInference(vesselId, {
  prompt: "What's the optimal patrol route?",
  decision_type: "route_planning"
});
```

### 4. Send Alerts
```typescript
import { IntervesselSync } from '@/lib/intervessel-sync';

await IntervesselSync.initialize(vesselId);

await IntervesselSync.sendAlert({
  alert_type: 'weather',
  severity: 'warning',
  title: 'Storm Warning',
  message: 'Storm approaching from northwest'
});
```

### 5. Create Coordinated Mission
```typescript
import { MultiMissionEngine } from '@/lib/multi-mission-engine';

const result = await MultiMissionEngine.createCoordinatedMission({
  name: "SAR Operation",
  mission_type: "sar",
  priority: "critical",
  target_location: { lat: -23.5, lng: -46.6 }
});
```

## Mission Types

- `sar` - Search and Rescue
- `evacuation` - Emergency Evacuation
- `transport` - Cargo/Personnel Transport
- `patrol` - Patrol Operations
- `training` - Training Exercises
- `emergency` - Emergency Response
- `custom` - Custom Operations

## Priority Levels

- `low` - Low priority
- `normal` - Normal priority
- `high` - High priority
- `critical` - Critical/Emergency

## Vessel Roles

- `primary` - Lead vessel
- `support` - Supporting vessel
- `backup` - Backup/Reserve
- `observer` - Observation only

## Alert Types

- `weather` - Weather-related alerts
- `navigation` - Navigation hazards
- `emergency` - Emergency situations
- `maintenance` - Maintenance issues
- `security` - Security threats
- `custom` - Custom alerts

## Alert Severity

- `info` - Informational
- `warning` - Warning level
- `critical` - Critical/Urgent

## Trust Levels

- `full` - Complete access
- `partial` - Limited access
- `read-only` - View only

## Common Patterns

### Complete Mission Workflow
```typescript
// 1. Create mission
const mission = await MissionEngine.createMission({...});

// 2. Get suggestions
const suggestions = await MissionEngine.suggestVesselAssignment(
  mission.mission_type,
  mission.priority
);

// 3. Assign vessels
for (const suggestion of suggestions) {
  await MissionEngine.assignVesselToMission(
    mission.id,
    suggestion.vessel.id,
    suggestion.role
  );
}

// 4. Update status
await MissionEngine.updateMissionStatus(mission.id, 'active');

// 5. Log events
await MissionEngine.logMissionEvent(mission.id, {
  log_type: 'status_change',
  message: 'Mission started'
});
```

### AI Decision Making
```typescript
// Initialize AI for vessel
await DistributedAIEngine.initialize(vesselId);

// Get vessel context
const context = await DistributedAIEngine.getVesselContext(vesselId);

// Run inference
const decision = await DistributedAIEngine.runInference(vesselId, {
  prompt: "Analyze situation and recommend action",
  context: { weather: {...}, position: {...} },
  decision_type: "tactical_decision"
});

// Log decision
console.log('AI Decision:', decision.reasoning);
console.log('Confidence:', decision.confidence);
```

### Alert Management
```typescript
// Initialize sync
await IntervesselSync.initialize(vesselId);

// Send alert
await IntervesselSync.sendAlert({
  alert_type: 'emergency',
  severity: 'critical',
  title: 'Man Overboard',
  message: 'Emergency: crew member overboard',
  location: { lat: -22.9, lng: -43.1 }
});

// Get unread alerts
const alerts = await IntervesselSync.getAlerts({
  severity: 'critical',
  unread_only: true
});

// Process alerts
for (const alert of alerts) {
  console.log(`Alert from ${alert.source_vessel_name}:`, alert.message);
}
```

### Trust and Log Replication
```typescript
// Establish trust
await IntervesselSync.establishTrust(
  trustedVesselId,
  'partial'
);

// Replicate log to trusted vessels
await IntervesselSync.replicateLog({
  log_type: 'maintenance',
  message: 'Engine oil change completed',
  metadata: { component: 'main_engine', hours: 500 }
});

// Get replicated logs from other vessels
const logs = await IntervesselSync.getReplicatedLogs(50);
```

### SAR Operation
```typescript
const sar = await MultiMissionEngine.executeSAROperation({
  target_location: { lat: -23.5, lng: -46.6 },
  search_radius_km: 50,
  priority: 'critical'
});

console.log('SAR Mission:', sar.mission);
console.log('Coordination Plan:', sar.plan);
console.log('Assigned Vessels:', sar.plan.vessels);
```

### Emergency Evacuation
```typescript
const evacuation = await MultiMissionEngine.executeEvacuation({
  location: { lat: -23.5, lng: -46.6 },
  personnel_count: 15,
  medical_needs: true
});

console.log('Evacuation Mission:', evacuation.mission);
console.log('Timeline:', evacuation.plan.timeline);
console.log('Risk Assessment:', evacuation.plan.risk_assessment);
```

## Database Queries

### Get Mission Progress
```sql
SELECT * FROM get_mission_progress('mission-id-here');
```

### Get AI Performance
```sql
SELECT * FROM get_ai_performance_metrics('vessel-id-here', 7);
```

### Get Fleet Stats
```sql
SELECT * FROM get_fleet_communication_stats(7);
```

### Get Coordination Stats
```sql
SELECT * FROM get_coordination_stats('mission-id-here');
```

### Get Resource Availability
```sql
SELECT * FROM get_resource_availability('mission-id-here', 'fuel');
```

## React Component Usage

### Fleet Command Center
```tsx
import { FleetCommandCenter } from '@/components/fleet/FleetCommandCenter';

function FleetPage() {
  return (
    <div className="container">
      <FleetCommandCenter />
    </div>
  );
}
```

## Status Checks

### Check MQTT Status
```typescript
const mqttStatus = MQTTClient.getStatus();
console.log('Connected:', mqttStatus.connected);
console.log('Topics:', mqttStatus.topics);
```

### Check Sync Status
```typescript
const syncStatus = IntervesselSync.getStatus();
console.log('Initialized:', syncStatus.initialized);
console.log('MQTT Connected:', syncStatus.mqttConnected);
```

### Check AI Sync Status
```typescript
const aiStatus = DistributedAIEngine.getSyncStatus();
console.log('Last Sync:', aiStatus.lastSync);
console.log('Next Sync:', aiStatus.nextSync);
console.log('Cache Size:', aiStatus.cacheSize);
```

## Error Handling

### Graceful Degradation
```typescript
try {
  const decision = await DistributedAIEngine.runInference(vesselId, {...});
} catch (error) {
  // AI will automatically fallback to central AI
  console.error('AI inference failed, using fallback:', error);
}
```

### MQTT Fallback
```typescript
// Automatically falls back to HTTP if MQTT fails
await IntervesselSync.sendAlert({...});
// Alert will be sent via HTTP if MQTT unavailable
```

## Performance Tips

1. **Use Auto-Refresh Wisely**: Default 30 seconds is optimal
2. **Cache AI Contexts**: Contexts are cached automatically
3. **Batch Operations**: Use bulk operations when possible
4. **Index Queries**: All key fields are indexed
5. **JSONB for Flexibility**: Use JSONB for dynamic data
6. **Pagination**: Use limit and offset for large datasets

## Security Best Practices

1. **Use RLS Policies**: All tables have RLS enabled
2. **Verify Trust Relationships**: Check trust before sharing logs
3. **Validate Alert Sources**: Verify alert authenticity
4. **Encrypt Sensitive Data**: Use JSONB encryption for sensitive fields
5. **Audit AI Decisions**: All decisions are logged for audit

## Monitoring Checklist

- [ ] Fleet size and status
- [ ] Active missions count
- [ ] Critical alerts count
- [ ] AI sync status
- [ ] MQTT connection status
- [ ] Average response times
- [ ] Resource utilization
- [ ] Mission completion rates

## Common SQL Queries

### Get All Active Missions
```sql
SELECT * FROM missions WHERE status = 'active';
```

### Get Vessel's Missions
```sql
SELECT m.* FROM missions m
JOIN mission_vessels mv ON mv.mission_id = m.id
WHERE mv.vessel_id = 'vessel-id-here';
```

### Get Recent Alerts
```sql
SELECT * FROM vessel_alerts
WHERE created_at >= now() - interval '24 hours'
ORDER BY created_at DESC;
```

### Get Trusted Vessels
```sql
SELECT * FROM vessel_trust_relationships
WHERE vessel_id = 'vessel-id-here'
AND (expires_at IS NULL OR expires_at > now());
```

## Environment Variables

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_MQTT_URL=mqtt://broker.example.com:1883
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Migration Files

Located in `supabase/migrations/`:
- `20251025200000_patch_166_multivessel_core.sql`
- `20251025200100_patch_167_distributed_ai_engine.sql`
- `20251025200200_patch_169_intervessel_sync.sql`
- `20251025200300_patch_170_multi_mission_coordination.sql`

## Core Modules

Located in `src/lib/`:
- `mission-engine.ts` - Mission management
- `distributed-ai-engine.ts` - AI decision making
- `intervessel-sync.ts` - Inter-vessel communication
- `multi-mission-engine.ts` - Multi-mission coordination

## UI Components

Located in `src/components/fleet/`:
- `FleetCommandCenter.tsx` - Main fleet dashboard

## Support

For detailed documentation, see `PATCHES_166_170_MULTIVESSEL_SYSTEM.md`
