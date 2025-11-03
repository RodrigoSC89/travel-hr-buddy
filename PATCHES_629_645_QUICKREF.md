# PATCHES 629-645 Quick Reference

## Quick Links

### Admin Pages
- **Feature Flags**: `/admin/feature-toggles`
- **Weather Dashboard**: `/admin/dashboard/weather`
- **Event Timeline**: `/admin/event-timeline`
- **Org 360°**: `/admin/org-360`
- **Usage Metrics**: `/admin/usage-metrics`

## Quick Code Snippets

### Feature Flags
```typescript
const isEnabled = useFeatureFlag('feature_name');
```

### Weather Data
```typescript
const weather = await fetchWeather(lat, lon);
```

### Telemetry
```typescript
const { trackFeatureUse } = useTelemetry();
trackFeatureUse('feature', { data });
```

### Offline Cache
```typescript
await offlineCache.saveDocument(id, title, content);
const doc = await offlineCache.getDocument(id);
```

### AI Plugins
```typescript
const result = await pluginRegistry.runPlugin('plugin-name', input);
```

### ChatOps
```typescript
const response = await chatOps.execute('/command');
```

### Validation
```typescript
const { data } = usePatchValidation(patchId);
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `feature_flags` | Feature toggle management |
| `external_weather_data` | Weather API data storage |
| `system_logs` | Event timeline data |
| `telemetry_events` | User interaction tracking |

## Environment Variables

```env
VITE_OPENWEATHER_API_KEY=your_key_here
```

## Common Tasks

### Enable a Feature Flag
1. Go to `/admin/feature-toggles`
2. Find the feature
3. Toggle the switch
4. Changes apply immediately

### View System Events
1. Go to `/admin/event-timeline`
2. Filter by event type
3. Click event for details

### Check Weather Conditions
1. Go to `/admin/dashboard/weather`
2. View maritime locations
3. Check severity levels

### Monitor Usage
1. Go to `/admin/usage-metrics`
2. View module access
3. Export to CSV

## Key Metrics

- **System Health**: 95%+ target
- **User Engagement**: Track daily active users
- **AI Usage**: Monitor request volume and success rate
- **Risks**: Critical risks should be < 5

## Status Indicators

| Color | Status | Action |
|-------|--------|--------|
| 🟢 Green | Safe/Healthy | Normal operation |
| 🟡 Yellow | Caution/Warning | Monitor closely |
| 🔴 Red | Danger/Critical | Immediate action |

## Support Contacts

- Technical Issues: Development Team
- Feature Requests: Product Team
- Security Concerns: Security Team

---

**Quick Tip**: Use feature flags to safely test new features in production!
