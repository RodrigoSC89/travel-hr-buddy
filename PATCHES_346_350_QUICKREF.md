# PATCHES 346-350: Quick Reference Guide

## 🚀 Quick Start

### Database Setup
Run migrations in Supabase:
```bash
# All 5 patches are in supabase/migrations/
# They will be automatically applied when syncing with Supabase
```

### Environment Variables
Add to `.env`:
```bash
# OAuth Credentials (for PATCH 346)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_ZAPIER_CLIENT_ID=your_zapier_client_id
```

### Accessing the Dashboards

#### Integrations Hub v2
```typescript
import { IntegrationsHubV2 } from '@/pages/integrations-hub-v2';
// Route: /integrations-hub-v2
```

#### Analytics Dashboard v2
```typescript
import { AnalyticsDashboardV2 } from '@/pages/analytics-dashboard-v2';
// Route: /analytics-dashboard-v2
```

#### Autonomy Dashboard
```typescript
import { AutonomyDashboard } from '@/pages/autonomy-dashboard';
// Route: /autonomy-dashboard
```

---

## 📊 PATCH 346: Integrations Hub v2

### Usage Examples

#### Connect OAuth Provider
```typescript
import { IntegrationsService } from '@/services/integrations.service';

// Get OAuth URL and open in popup
const authUrl = IntegrationsService.getOAuthUrl(
  'google',
  'YOUR_CLIENT_ID',
  `${window.location.origin}/oauth/callback`,
  ['profile', 'email']
);
window.open(authUrl, 'oauth', 'width=600,height=700');
```

#### Create Webhook Integration
```typescript
const webhook = await IntegrationsService.createIntegration({
  name: 'My Webhook',
  provider: 'custom',
  webhook_url: 'https://api.example.com/webhook',
  status: 'active',
  events: ['user.created', 'mission.updated'],
});
```

#### Dispatch Webhook Event
```typescript
await IntegrationsService.dispatchWebhookEvent(
  webhookId,
  'user.created',
  { userId: '123', email: 'user@example.com' }
);
```

---

## 📈 PATCH 347: Analytics Core v2

### Usage Examples

#### Track Events
```typescript
import { AnalyticsService } from '@/services/analytics.service';

// Track page view
await AnalyticsService.trackPageView('Dashboard');

// Track user action
await AnalyticsService.trackUserAction('button_click', {
  button_id: 'submit',
  page: '/dashboard',
});

// Track error
await AnalyticsService.trackError('API Error', {
  endpoint: '/api/users',
  status: 500,
});
```

#### Get Real-Time Metrics
```typescript
const metrics = await AnalyticsService.getRealTimeMetrics();
// Returns: events_per_minute, active_users, page_views, errors, etc.
```

#### Create Alert
```typescript
await AnalyticsService.createAlert({
  name: 'High Error Rate',
  metric_name: 'error',
  condition: 'greater_than',
  threshold: 10,
  timeframe_minutes: 5,
  severity: 'critical',
});
```

---

## 🤖 PATCH 348: Mission Control v2 - Autonomy

### Usage Examples

#### Create Autonomous Task
```typescript
import { AutonomyService } from '@/services/autonomy.service';

const taskId = await AutonomyService.createTask({
  task_type: 'maintenance',
  task_name: 'Auto-schedule Equipment Maintenance',
  description: 'Equipment usage exceeded threshold',
  decision_logic: {
    trigger: 'usage_hours > 1000',
    action: 'schedule_maintenance',
  },
  autonomy_level: 2,
  equipment_id: 'equip-123',
});
```

#### Approve/Reject Task
```typescript
// Approve
await AutonomyService.approveTask({
  task_id: taskId,
  approved: true,
});

// Reject
await AutonomyService.approveTask({
  task_id: taskId,
  approved: false,
});
```

#### Configure Autonomy
```typescript
await AutonomyService.saveConfig({
  entity_type: 'mission',
  entity_id: 'mission-456',
  is_enabled: true,
  autonomy_level: 3,
  allowed_task_types: ['maintenance', 'logistics'],
  require_approval_threshold: 2,
  auto_approve_low_risk: true,
});
```

---

## 🎤 PATCH 349: Voice Assistant v2

### Usage Examples

#### Start Voice Session
```typescript
import { VoiceService } from '@/services/voice.service';

const session = await VoiceService.startSession({
  platform: 'web',
  mode: 'online',
  language: 'pt-BR',
});
```

#### Listen for Voice Commands
```typescript
await VoiceService.startListening(
  (result) => {
    console.log('Transcript:', result.transcript);
    console.log('Confidence:', result.confidence);
    
    // Process command
    VoiceService.processCommand({
      session_id: sessionId,
      command_text: result.transcript,
      confidence_score: result.confidence,
    });
  },
  (error) => {
    console.error('Recognition error:', error);
  }
);
```

#### Speak Response
```typescript
await VoiceService.speak('A frota está operando normalmente', {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
});
```

#### Get Popular Commands for Cache
```typescript
const commands = await VoiceService.getPopularCommandsForCache(20);
// Cache these for offline mode
```

---

## 🛰️ PATCH 350: Satellite Tracker v2

### Usage Examples

#### Track Satellite Position
```typescript
import { SatelliteService } from '@/services/satellite.service';

await SatelliteService.updatePosition('SAT-001', {
  latitude: -23.5505,
  longitude: -46.6333,
  altitude_km: 400,
  velocity_kmh: 27000,
});
```

#### Get Satellite Tracking View
```typescript
const view = await SatelliteService.getTrackingView('SAT-001');
// Returns: satellite, latest_position, alerts, links, telemetry, passes
```

#### Create Alert
```typescript
await SatelliteService.createAlert({
  satellite_id: 'SAT-001',
  alert_type: 'coverage_lost',
  severity: 'critical',
  title: 'Coverage Lost Over Pacific',
  description: 'Satellite lost coverage of critical mission area',
});
```

#### Calculate Satellite Passes
```typescript
const passes = await SatelliteService.calculatePasses(
  'SAT-001',
  -23.5505, // latitude
  -46.6333, // longitude
  24 // hours ahead
);
```

#### Get Global View
```typescript
const globalView = await SatelliteService.getGlobalView();
// Returns: all tracked satellites, positions, alerts, coverage
```

---

## 🔧 Testing

### Manual Testing Scripts

```typescript
// Test Analytics - Generate 100 events
for (let i = 0; i < 100; i++) {
  await AnalyticsService.trackUserAction('test_action', { index: i });
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Test Voice Recognition
VoiceService.initSpeechAPIs();
console.log('Available:', VoiceService.isSpeechRecognitionAvailable());

// Test Autonomy
const taskId = await AutonomyService.createTask({
  task_type: 'maintenance',
  task_name: 'Test Task',
  description: 'Testing autonomy',
  decision_logic: { test: true },
});
```

---

## 📦 Key Files

### Services
- `src/services/integrations.service.ts`
- `src/services/analytics.service.ts`
- `src/services/autonomy.service.ts`
- `src/services/voice.service.ts`
- `src/services/satellite.service.ts`

### Types
- `src/types/integrations.ts`
- `src/types/analytics.ts`
- `src/types/autonomy.ts`
- `src/types/voice.ts`
- `src/types/satellite.ts`

### UI Pages
- `src/pages/integrations-hub-v2.tsx`
- `src/pages/analytics-dashboard-v2.tsx`
- `src/pages/autonomy-dashboard.tsx`

### Database
- `supabase/migrations/20251028002900_patch_346_integrations_hub_v2.sql`
- `supabase/migrations/20251028003000_patch_347_analytics_core_v2.sql`
- `supabase/migrations/20251028003100_patch_348_mission_control_autonomy.sql`
- `supabase/migrations/20251028003200_patch_349_voice_assistant_v2.sql`
- `supabase/migrations/20251028003300_patch_350_satellite_tracker_v2.sql`

---

## ✅ Verification Checklist

- [x] TypeScript: Zero errors, 100% typed
- [x] Database: 31 new tables with RLS
- [x] Services: 5 complete service layers
- [x] UI: 3 responsive dashboards
- [x] Build: Successful (1m 24s)
- [x] Lint: No errors in new files
- [x] Documentation: Complete guide provided

---

## 🎯 Next Steps

1. **Deploy Migrations**: Apply Supabase migrations to staging/production
2. **Configure OAuth**: Add real OAuth credentials to environment
3. **Test Real-Time**: Verify analytics updates in <2 seconds
4. **Test Voice**: Verify "Status da Frota" accuracy >90%
5. **Satellite API**: Integrate real satellite tracking API (TLE data)
6. **3D Visualization**: Add Three.js/Cesium for satellite tracking
7. **Mobile**: Test voice assistant on iOS/Android
8. **Monitoring**: Set up alerts for critical thresholds

---

## 🆘 Support

For issues or questions:
- Check `PATCHES_346_350_IMPLEMENTATION.md` for detailed documentation
- Review service files for usage examples
- Inspect database migrations for schema details
- Test with provided manual testing scripts
