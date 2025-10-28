# PATCHES 381-385: Quick Reference Guide

## 🚀 Quick Start

### Import Services
```typescript
import { VoiceService } from '@/services/voice.service';
import { SatelliteService } from '@/services/satellite.service';
import { MissionControlService } from '@/services/mission-control.service';
import { FinanceHubService } from '@/services/finance-hub.service';
import { IntegrationsService } from '@/services/integrations.service';
```

---

## 🎤 PATCH 381: Voice Assistant

### Start Voice Session
```typescript
const session = await VoiceService.startSession({
  platform: 'web',
  language: 'pt-BR',
  mode: 'online'
});
```

### Enable Wake Word
```typescript
VoiceService.startWakeWordDetection('nautilus', (detected) => {
  if (detected) {
    console.log('Wake word detected!');
  }
});
```

### Speak with Natural Voice
```typescript
await VoiceService.speakWithNaturalVoice(
  'Olá! Como posso ajudar?',
  { rate: 1.0, pitch: 1.0, volume: 1.0 }
);
```

### Get Interaction History
```typescript
const logs = await VoiceService.getInteractionHistory(sessionId, 50);
```

---

## 🛰️ PATCH 382: Satellite Tracker

### Fetch TLE Data
```typescript
const tle = await SatelliteService.fetchTLEFromCelestrak('ISS');
if (tle) {
  await SatelliteService.updateSatelliteFromTLE(satelliteId, tle);
}
```

### Get Real-time Position
```typescript
const position = await SatelliteService.fetchSatellitePositionFromN2YO(
  '25544', // ISS NORAD ID
  40.7128, // latitude
  -74.0060, // longitude
  0, // altitude
  apiKey
);
```

### Export Satellite Data
```typescript
const csv = await SatelliteService.exportToCSV({
  satellite_type: ['communication'],
  status: ['active']
});
```

### Generate Report
```typescript
const report = await SatelliteService.generateSatelliteReport(satelliteId);
```

---

## 🎯 PATCH 383: Mission Control

### Create Mission
```typescript
const mission = await MissionControlService.createMission({
  name: 'Operation Alpha',
  description: 'Strategic deployment',
  mission_type: 'tactical',
  priority: 'high',
  objectives: [
    { objective: 'Deploy agents', priority: 1 }
  ]
});
```

### Allocate Resources
```typescript
await MissionControlService.allocateResource(missionId, {
  resource_id: 'vehicle-001',
  resource_type: 'vehicle',
  resource_name: 'Patrol Boat',
  quantity: 1
});
```

### Assign Agent
```typescript
await MissionControlService.assignAgentToMission(
  missionId,
  agentId,
  'Field Operator'
);
```

### Get Real-time Status
```typescript
const status = await MissionControlService.getMissionStatus(missionId);
console.log(`Progress: ${status.progress_percentage}%`);
```

### Subscribe to Updates
```typescript
const subscription = MissionControlService.subscribeToMissionUpdates(
  missionId,
  (payload) => {
    console.log('Mission updated:', payload);
  }
);
```

### Export Report
```typescript
const csv = await MissionControlService.exportMissionReportToCSV(missionId);
```

---

## 💰 PATCH 384: Finance Hub

### Create Transaction
```typescript
const transaction = await FinanceHubService.createTransaction({
  type: 'expense',
  category_id: categoryId,
  amount: 1500.00,
  currency: 'USD',
  description: 'Office supplies',
  date: new Date().toISOString(),
  payment_method: 'credit_card'
});
```

### Create Budget
```typescript
const budget = await FinanceHubService.createBudget({
  name: 'Marketing Q1 2024',
  category_id: categoryId,
  amount: 50000,
  period: 'quarterly',
  start_date: '2024-01-01',
  end_date: '2024-03-31',
  alert_threshold: 80
});
```

### Generate Monthly Report
```typescript
const report = await FinanceHubService.generateMonthlyReport(10, 2024);
console.log(`Net Profit: $${report.net_profit}`);
```

### Export Transactions
```typescript
const csv = await FinanceHubService.exportTransactionsToCSV({
  type: ['expense'],
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

### Check Permissions
```typescript
const canCreate = await FinanceHubService.checkPermission(
  userId,
  'create',
  'transaction'
);
```

---

## 🔗 PATCH 385: Integrations Hub

### Initiate OAuth Flow
```typescript
// Google
const googleUrl = await IntegrationsService.initiateGoogleOAuth(redirectUri);
window.location.href = googleUrl;

// Slack
const slackUrl = await IntegrationsService.initiateSlackOAuth(redirectUri);
window.location.href = slackUrl;

// Notion
const notionUrl = await IntegrationsService.initiateNotionOAuth(redirectUri);
window.location.href = notionUrl;
```

### Handle OAuth Callback
```typescript
const connection = await IntegrationsService.handleOAuthCallback(
  'google',
  authCode,
  redirectUri
);
```

### Configure Webhook
```typescript
const webhook = await IntegrationsService.configureWebhook(
  {
    name: 'Mission Updates',
    provider: 'custom',
    webhook_url: 'https://api.example.com/webhooks/missions'
  },
  ['mission.created', 'mission.completed'],
  { 'Authorization': 'Bearer token123' }
);
```

### Test Webhook
```typescript
const success = await IntegrationsService.testWebhook(webhookId);
```

### Install Plugin
```typescript
const plugin = await IntegrationsService.installPlugin({
  name: 'weather-integration',
  display_name: 'Weather Integration',
  provider: 'custom',
  category: 'data',
  version: '1.0.0'
});
```

### Configure Plugin
```typescript
await IntegrationsService.configurePlugin(pluginId, {
  api_key: 'your-api-key',
  refresh_interval: 3600,
  enabled_features: ['forecasts', 'alerts']
});
```

### Get Integration Status
```typescript
const status = await IntegrationsService.getIntegrationStatusPanel();
console.log(`Health: ${status.health_status}`);
```

---

## 📊 Common Patterns

### Error Handling
```typescript
try {
  const result = await SomeService.someMethod();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user feedback
}
```

### Pagination
```typescript
const transactions = await FinanceHubService.getTransactions({
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('missions')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'missions' },
    (payload) => console.log(payload)
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Export Data
```typescript
// Generate CSV
const csv = await Service.exportToCSV(filters);

// Download
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'export.csv';
a.click();
```

---

## 🔒 Security Best Practices

### Voice Assistant
- Always request microphone permissions
- Log all interactions for audit
- Validate voice commands before execution

### Satellite Tracker
- Store API keys in environment variables
- Rate limit API calls
- Validate TLE data before saving

### Mission Control
- Check user permissions before operations
- Log all mission modifications
- Validate agent assignments

### Finance Hub
- Always check permissions before CRUD operations
- Encrypt sensitive financial data
- Audit all transactions

### Integrations Hub
- Store OAuth tokens encrypted
- Validate webhook signatures
- Sandbox plugin execution

---

## 🐛 Troubleshooting

### Voice Assistant
**Issue:** Wake word not detecting
- Check microphone permissions
- Verify continuous listening is enabled
- Test with louder/clearer pronunciation

### Satellite Tracker
**Issue:** TLE fetch failing
- Verify internet connection
- Check satellite name spelling
- Try alternative API (N2YO)

### Mission Control
**Issue:** Real-time updates not working
- Check Supabase connection
- Verify RLS policies
- Ensure subscription is active

### Finance Hub
**Issue:** Budget not updating
- Verify category_id matches
- Check transaction status is 'completed'
- Ensure date is within budget period

### Integrations Hub
**Issue:** OAuth flow failing
- Check client ID/secret
- Verify redirect URI matches
- Check OAuth scopes

---

## 📚 Resources

- Full Documentation: `PATCHES_381_385_IMPLEMENTATION.md`
- Database Schema: `supabase/migrations/20241028_patches_381_385.sql`
- Final Verification: `PATCHES_381_385_FINAL_VERIFICATION.md`
- Type Definitions: `src/types/`

---

## 💡 Tips

1. **Always check for null/undefined** before using service responses
2. **Use TypeScript types** for better IDE support and type safety
3. **Handle errors gracefully** with try-catch blocks
4. **Log important operations** for debugging and auditing
5. **Test with real data** before production deployment
6. **Monitor API rate limits** for external services
7. **Keep OAuth tokens secure** and refresh them regularly
8. **Validate user input** before sending to services
9. **Use pagination** for large datasets
10. **Subscribe to real-time updates** for better UX

---

*Quick Reference v1.0.0 - October 28, 2024*
