# PATCHES 516-520 QUICK REFERENCE GUIDE

## Navigation Routes

| Patch | Route | Feature |
|-------|-------|---------|
| 516 | `/sensors-hub` | Advanced Sensor Monitoring |
| 517 | `/navigation-copilot` | AI-Assisted Navigation |
| 518 | `/satellite-live` | Real-time Satellite Tracking |
| 519 | `/joint-missions` | Multi-Entity Mission Coordination |
| 520 | `/interop-grid` | AI Interoperability Network |

## Quick Start

### 1. Run Database Migrations

```bash
# Execute migrations in Supabase
supabase migration up
```

Or manually run these files in order:
1. `supabase/migrations/20251029040000_patch_516_sensor_hub_v2.sql`
2. `supabase/migrations/20251029040100_patch_517_navigation_copilot_ai.sql`
3. `supabase/migrations/20251029040200_patch_518_satellite_live_integrator.sql`
4. `supabase/migrations/20251029040300_patch_519_joint_missions_v2.sql`
5. `supabase/migrations/20251029040400_patch_520_interop_grid_ai.sql`

### 2. Access the Features

Navigate to any of the routes listed above after the application is running.

## Database Tables Reference

### PATCH 516 - Sensor Hub
- **sensor_config** - Sensor configurations
- **sensor_readings** - Real-time sensor data
- **sensor_alerts** - Alert management

### PATCH 517 - Navigation Copilot
- **planned_routes** - Route planning data
- **navigation_ai_logs** - AI decision logs
- **navigation_weather_alerts** - Weather alerts
- **route_optimization_history** - Optimization tracking

### PATCH 518 - Satellite Live
- **satellite_live_tracking** - Satellite positions
- **satellite_coverage_zones** - Coverage areas
- **satellite_api_sync_logs** - API sync logs
- **satellite_orbital_elements** - TLE data

### PATCH 519 - Joint Missions
- **external_entities** - Partner entities
- **joint_missions** - Mission data
- **mission_participants** - Entity assignments
- **mission_status_updates** - Status updates
- **mission_chat** - Communication
- **mission_activity_log** - Activity logs

### PATCH 520 - Interop Grid
- **ai_instances** - AI system registry
- **ai_decision_events** - Decision events
- **ai_event_subscriptions** - Event filters
- **ai_event_consumption_log** - Consumption logs
- **ai_knowledge_graph** - Knowledge sharing
- **interop_grid_analytics** - Analytics
- **ai_decision_audit_trail** - Audit logs

## API Usage Examples

### Sensor Hub - Query Latest Readings

```typescript
const { data, error } = await supabase
  .from('sensor_readings')
  .select('*')
  .eq('sensor_id', 'ocean_temp_01')
  .order('timestamp', { ascending: false })
  .limit(10);
```

### Navigation Copilot - Create Route

```typescript
const { data, error } = await supabase
  .from('planned_routes')
  .insert({
    route_name: 'São Paulo to Rio',
    origin_lat: -23.5505,
    origin_lng: -46.6333,
    destination_lat: -22.9068,
    destination_lng: -43.1729,
    risk_score: 25.5,
    weather_risk_level: 'low'
  });
```

### Satellite Live - Get Active Satellites

```typescript
const { data, error } = await supabase
  .from('satellite_live_tracking')
  .select('*')
  .eq('status', 'active')
  .order('timestamp', { ascending: false });
```

### Joint Missions - Send Chat Message

```typescript
const { error } = await supabase
  .from('mission_chat')
  .insert({
    mission_id: 'mission-uuid',
    message: 'Status update: All systems operational',
    message_type: 'status',
    priority: 'normal'
  });
```

### Interop Grid - Publish AI Decision

```typescript
const { error } = await supabase
  .from('ai_decision_events')
  .insert({
    event_id: 'evt_12345',
    source_ai_instance: 'ai-instance-uuid',
    event_type: 'decision',
    decision_category: 'optimization',
    confidence_score: 0.95,
    priority: 'high',
    context: { timestamp: new Date().toISOString() },
    decision_data: { action: 'optimize', params: {} }
  });
```

## Real-time Subscriptions

### Listen to Sensor Readings

```typescript
const channel = supabase
  .channel('sensor-readings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sensor_readings'
  }, (payload) => {
    console.log('New reading:', payload.new);
  })
  .subscribe();
```

### Listen to Mission Chat

```typescript
const channel = supabase
  .channel('mission-chat')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'mission_chat',
    filter: `mission_id=eq.${missionId}`
  }, (payload) => {
    console.log('Chat update:', payload);
  })
  .subscribe();
```

## Features by Patch

### PATCH 516 Features
- ✅ Real-time sensor monitoring
- ✅ Type filtering (oceanic, structural, AI, navigation)
- ✅ Anomaly detection
- ✅ Alert management
- ✅ KPI dashboard

### PATCH 517 Features
- ✅ AI route calculation
- ✅ Risk assessment
- ✅ Weather integration
- ✅ Fuel efficiency optimization
- ✅ Route history

### PATCH 518 Features
- ✅ Real-time satellite tracking
- ✅ Orbit filtering (LEO/MEO/GEO/HEO)
- ✅ Coverage zones
- ✅ API sync logging
- ✅ TLE data storage

### PATCH 519 Features
- ✅ Multi-entity coordination
- ✅ Real-time chat
- ✅ WebSocket sync
- ✅ Entity management
- ✅ Activity logging

### PATCH 520 Features
- ✅ AI instance registry
- ✅ Decision event Pub/Sub
- ✅ Knowledge graph
- ✅ Real-time sync
- ✅ Analytics dashboard

## Common Tasks

### Add a New Sensor

```sql
INSERT INTO sensor_config (sensor_id, sensor_name, sensor_type, unit, anomaly_threshold)
VALUES ('new_sensor_01', 'New Sensor', 'oceanic', 'm', 100);
```

### Register an AI Instance

```sql
INSERT INTO ai_instances (instance_name, instance_type, version, capabilities)
VALUES ('my-ai-01', 'navigation', '1.0.0', '["routing", "optimization"]'::jsonb);
```

### Create a Joint Mission

```sql
INSERT INTO joint_missions (mission_name, mission_type, status, priority)
VALUES ('Search and Rescue', 'emergency', 'planning', 'critical');
```

## Troubleshooting

### Issue: Real-time updates not working
**Solution:** Check Supabase Realtime is enabled for your tables

### Issue: No sensor data appearing
**Solution:** Ensure migrations ran successfully and sample data is seeded

### Issue: Satellite API not syncing
**Solution:** Configure external API credentials and test connectivity

### Issue: Mission chat not showing
**Solution:** Verify WebSocket connection and RLS policies

### Issue: AI events not propagating
**Solution:** Check ai_instances are registered and subscriptions are active

## Performance Tips

1. **Sensor Data**: Use appropriate polling intervals (default: 2 seconds)
2. **Satellite Updates**: Configure sync frequency based on requirements
3. **Mission Chat**: Limit message history queries with pagination
4. **AI Events**: Implement event filtering to reduce noise
5. **Database**: Use indexes for frequently queried fields

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Public read access for monitoring
- Authenticated write access required
- Audit trails for critical operations
- Consider API key encryption for external services

## Next Steps

1. Run database migrations
2. Test each feature individually
3. Configure external APIs (satellite tracking)
4. Set up monitoring and alerts
5. Review and adjust real-time polling intervals
6. Implement rate limiting where needed
7. Add custom analytics dashboards

## Support

For issues or questions:
1. Check the full implementation document: `PATCHES_516_520_IMPLEMENTATION.md`
2. Review database migration files for schema details
3. Inspect page source code for component details
4. Test with sample data before production deployment
