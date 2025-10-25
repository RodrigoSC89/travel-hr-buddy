# Multi-Vessel System Implementation - Patches 166-170

## Overview

This implementation adds comprehensive multi-vessel support to the Nautilus One maritime management system, enabling coordinated operations across multiple vessels with AI-driven decision making, real-time communication, and intelligent mission coordination.

## Architecture

### PATCH 166.0: Multivessel Core
**Database Tables:**
- `missions` - Central mission coordination
- `mission_vessels` - Vessel assignments to missions
- `mission_logs` - Event logging per mission/vessel

**Core Module:** `src/lib/mission-engine.ts`
- Mission CRUD operations
- Vessel assignment management
- AI-assisted vessel suggestions
- Mission status tracking
- Comprehensive logging system

### PATCH 167.0: Distributed AI Engine
**Database Tables:**
- `vessel_ai_contexts` - Vessel-specific AI learning data
- `ai_decisions` - Decision tracking and audit trail

**Core Module:** `src/lib/distributed-ai-engine.ts`
- Vessel-specific AI contexts
- Local + global knowledge sync
- 12-hour automatic synchronization
- Confidence scoring
- Central AI fallback system
- Performance metrics

### PATCH 168.0: Nautilus Fleet Command Center
**Component:** `src/components/fleet/FleetCommandCenter.tsx`

**Features:**
- Real-time vessel monitoring dashboard
- Fleet statistics (total, active, maintenance, critical)
- Vessel status indicators with color coding
- Search and filter capabilities
- Auto-refresh (30-second intervals)
- Mission overview and management
- Per-vessel log viewer
- Responsive grid layout

### PATCH 169.0: Intervessel Sync Layer
**Database Tables:**
- `vessel_alerts` - Cross-vessel alert system
- `vessel_alert_notifications` - Alert delivery tracking
- `vessel_trust_relationships` - Secure log sharing
- `replicated_logs` - Inter-vessel log replication
- `sync_messages` - Message queue tracking

**Core Module:** `src/lib/intervessel-sync.ts`
- MQTT pub/sub communication
- HTTP fallback mechanism
- Alert broadcasting system
- Log replication between trusted vessels
- Fleet status synchronization
- Message queue management

### PATCH 170.0: Multi-Mission Coordination
**Database Tables:**
- `mission_coordination_plans` - AI-generated coordination plans
- `coordination_updates` - Real-time mission updates
- `mission_checkpoints` - Timeline tracking
- `mission_resources` - Resource management

**Core Module:** `src/lib/multi-mission-engine.ts`
- AI-driven coordination planning
- Vessel role assignment (primary, support, backup, observer)
- Timeline generation with checkpoints
- Risk assessment system
- Fallback plan generation
- SAR (Search and Rescue) operations
- Emergency evacuation protocols
- Resource tracking and management
- Progress monitoring

## Key Features

### 1. Mission Management
```typescript
import { MissionEngine } from '@/lib/mission-engine';

// Create a new mission
const mission = await MissionEngine.createMission({
  name: "SAR Operation Alpha",
  mission_type: "sar",
  priority: "critical",
  description: "Search and rescue in sector 7-G"
});

// Assign vessels to mission
await MissionEngine.assignVesselToMission(
  mission.id,
  vesselId,
  'primary'
);

// Log mission events
await MissionEngine.logMissionEvent(mission.id, {
  log_type: 'coordination',
  message: 'All vessels in position',
  metadata: { checkpoint: 'ready' }
});
```

### 2. Distributed AI
```typescript
import { DistributedAIEngine } from '@/lib/distributed-ai-engine';

// Initialize AI for a vessel
await DistributedAIEngine.initialize(vesselId);

// Run AI inference with vessel context
const decision = await DistributedAIEngine.runInference(vesselId, {
  prompt: "Analyze current weather conditions and recommend action",
  decision_type: "weather_assessment",
  context: { current_conditions: {...} }
});

// Sync AI contexts across fleet (runs automatically every 12 hours)
await DistributedAIEngine.syncAIContexts();
```

### 3. Intervessel Communication
```typescript
import { IntervesselSync } from '@/lib/intervessel-sync';

// Initialize sync for vessel
await IntervesselSync.initialize(vesselId);

// Send alert to fleet
await IntervesselSync.sendAlert({
  alert_type: 'weather',
  severity: 'warning',
  title: 'Rough Sea Conditions',
  message: 'Weather forecast indicates 4-meter waves',
  location: { lat: -22.9, lng: -43.1 }
});

// Replicate logs to trusted vessels
await IntervesselSync.replicateLog({
  log_type: 'maintenance',
  message: 'Engine maintenance completed',
  metadata: { component: 'main_engine' }
});

// Broadcast status update
await IntervesselSync.broadcastStatus({
  status: 'active',
  position: { lat: -22.9, lng: -43.1 },
  maintenance_status: 'ok'
});
```

### 4. Multi-Mission Coordination
```typescript
import { MultiMissionEngine } from '@/lib/multi-mission-engine';

// Create coordinated mission with AI planning
const result = await MultiMissionEngine.createCoordinatedMission({
  name: "SAR Operation Delta",
  mission_type: "sar",
  priority: "critical",
  target_location: { lat: -23.5, lng: -46.6 },
  required_capabilities: ['rescue_equipment', 'medical_support']
});

// Execute SAR operation
const sar = await MultiMissionEngine.executeSAROperation({
  target_location: { lat: -23.5, lng: -46.6 },
  search_radius_km: 50,
  priority: "critical"
});

// Execute emergency evacuation
const evacuation = await MultiMissionEngine.executeEvacuation({
  location: { lat: -23.5, lng: -46.6 },
  personnel_count: 15,
  medical_needs: true
});

// Update coordination status
await MultiMissionEngine.updateCoordinationStatus(
  missionId,
  vesselId,
  {
    update_type: 'checkpoint',
    vessel_id: vesselId,
    data: { checkpoint: 'on-scene', status: 'ready' },
    timestamp: new Date().toISOString()
  }
);
```

## Database Schema

### Missions
- `id`: UUID (PK)
- `name`: Text
- `mission_type`: Enum (sar, evacuation, transport, patrol, training, emergency, custom)
- `status`: Enum (planned, active, completed, cancelled, failed)
- `priority`: Enum (low, normal, high, critical)
- `coordination_data`: JSONB
- `ai_recommendations`: JSONB

### Vessel AI Contexts
- `id`: UUID (PK)
- `vessel_id`: UUID (FK to vessels)
- `context_id`: Text (unique)
- `local_data`: JSONB (vessel-specific knowledge)
- `global_data`: JSONB (fleet-wide knowledge)
- `last_sync`: Timestamptz
- `model_version`: Text
- `interaction_count`: Integer

### Vessel Alerts
- `id`: UUID (PK)
- `source_vessel_id`: UUID (FK to vessels)
- `alert_type`: Enum (weather, navigation, emergency, maintenance, security, custom)
- `severity`: Enum (info, warning, critical)
- `title`: Text
- `message`: Text
- `location`: JSONB
- `expires_at`: Timestamptz

### Mission Coordination Plans
- `id`: UUID (PK)
- `mission_id`: UUID (FK to missions)
- `plan_data`: JSONB (complete coordination plan)
- `ai_confidence`: Numeric(3,2)
- `status`: Enum (active, revised, cancelled, completed)

## API Endpoints

All operations use Supabase client with Row Level Security (RLS) policies.

### Mission Operations
- `MissionEngine.getMissions(filters?)` - List missions
- `MissionEngine.getMissionById(id)` - Get mission details
- `MissionEngine.createMission(data)` - Create new mission
- `MissionEngine.updateMissionStatus(id, status)` - Update status
- `MissionEngine.assignVesselToMission(missionId, vesselId, role)` - Assign vessel
- `MissionEngine.logMissionEvent(missionId, log)` - Log event

### AI Operations
- `DistributedAIEngine.getVesselContext(vesselId)` - Get AI context
- `DistributedAIEngine.runInference(vesselId, request)` - Run AI
- `DistributedAIEngine.syncAIContexts()` - Sync all contexts

### Communication Operations
- `IntervesselSync.initialize(vesselId)` - Initialize sync
- `IntervesselSync.sendAlert(alert)` - Send alert
- `IntervesselSync.getAlerts(filters?)` - Get alerts
- `IntervesselSync.replicateLog(log)` - Replicate log
- `IntervesselSync.establishTrust(vesselId, level)` - Create trust

### Coordination Operations
- `MultiMissionEngine.createCoordinatedMission(data)` - Create mission
- `MultiMissionEngine.getCoordinationPlan(missionId)` - Get plan
- `MultiMissionEngine.updateCoordinationStatus(missionId, vesselId, update)` - Update
- `MultiMissionEngine.executeSAROperation(params)` - SAR operation
- `MultiMissionEngine.executeEvacuation(params)` - Evacuation

## UI Components

### Fleet Command Center
Located at: `src/components/fleet/FleetCommandCenter.tsx`

**Features:**
- Real-time dashboard with auto-refresh
- Fleet statistics cards
- Vessel grid with status indicators
- Search and filter controls
- Mission overview tab
- Global map placeholder (Mapbox ready)
- Per-vessel log viewer

**Usage:**
```tsx
import { FleetCommandCenter } from '@/components/fleet/FleetCommandCenter';

function App() {
  return <FleetCommandCenter />;
}
```

## Security

### Row Level Security (RLS)
All tables have RLS policies that:
- Allow authenticated users to read all records
- Allow authenticated users to create records
- Allow authenticated users to update their own records
- Prevent unauthorized access

### Trust Relationships
Vessels can establish trust relationships with different levels:
- `full`: Complete access to all logs and data
- `partial`: Limited access to specific log types
- `read-only`: View-only access to shared data

### Message Authentication
All sync messages include:
- Source vessel verification
- Timestamp validation
- Optional signature field for cryptographic verification

## Performance

### Optimizations
- Database indexes on all foreign keys and frequently queried fields
- Caching of AI contexts in memory
- Auto-refresh with configurable intervals
- MQTT for real-time communication
- HTTP fallback for reliability
- Batch operations for bulk updates

### Scalability
- Supports unlimited vessels
- Efficient querying with pagination
- Optimized joins with proper indexes
- JSONB fields for flexible data storage
- Async operations for non-blocking execution

## Testing

### Unit Tests
Create tests for core modules:
```typescript
import { MissionEngine } from '@/lib/mission-engine';

describe('MissionEngine', () => {
  it('should create a mission', async () => {
    const mission = await MissionEngine.createMission({
      name: 'Test Mission',
      mission_type: 'patrol',
      priority: 'normal'
    });
    expect(mission).toBeDefined();
    expect(mission?.name).toBe('Test Mission');
  });
});
```

### Integration Tests
Test full workflows:
1. Create mission
2. Assign vessels
3. Generate coordination plan
4. Execute mission
5. Log events
6. Complete mission

## Monitoring

### Metrics Available
- Fleet size and status distribution
- Active missions count
- AI decision statistics
- Alert counts by severity
- Communication latency
- Mission completion rates
- Resource utilization

### Database Functions
```sql
-- Get AI performance metrics
SELECT * FROM get_ai_performance_metrics(vessel_id, days);

-- Get fleet communication stats
SELECT * FROM get_fleet_communication_stats(days);

-- Get mission progress
SELECT * FROM get_mission_progress(mission_id);

-- Get resource availability
SELECT * FROM get_resource_availability(mission_id);

-- Get coordination stats
SELECT * FROM get_coordination_stats(mission_id);
```

## Future Enhancements

### Planned Features
1. **Mapbox Integration**: Interactive global map with vessel positions
2. **Real-time Weather Integration**: Live weather data and alerts
3. **Advanced AI Models**: Specialized models for different mission types
4. **Mobile App**: React Native app for on-vessel use
5. **Satellite Communication**: Integration with satellite systems
6. **Predictive Maintenance**: AI-driven maintenance scheduling
7. **Route Optimization**: AI-optimized routing for fuel efficiency
8. **Crew Management**: Crew scheduling and certification tracking

### Technical Improvements
1. WebSocket support for real-time updates
2. Offline-first architecture with sync
3. Enhanced encryption for sensitive data
4. Multi-language support
5. Advanced analytics dashboard
6. Custom alert rules engine
7. Integration with external systems (AIS, GMDSS)
8. Automated testing suite

## Troubleshooting

### Common Issues

**MQTT Connection Failed**
```typescript
// Check MQTT status
const status = MQTTClient.getStatus();
console.log('MQTT Status:', status);

// Falls back to HTTP automatically
```

**AI Context Not Found**
```typescript
// Initialize context if missing
await DistributedAIEngine.createVesselContext(vesselId);
```

**Mission Assignment Failed**
```typescript
// Check vessel availability
const vessels = await MissionEngine.getAvailableVessels();
console.log('Available vessels:', vessels);
```

### Debug Mode
Enable detailed logging:
```typescript
import { logger } from '@/lib/logger';
logger.setLevel('debug');
```

## Contributing

When adding new features:
1. Follow the existing architecture patterns
2. Add comprehensive TypeScript types
3. Include database migrations
4. Update RLS policies
5. Add tests
6. Update this documentation

## License

Part of the Nautilus One maritime management system.

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check database function comments
4. Review migration files for schema details
