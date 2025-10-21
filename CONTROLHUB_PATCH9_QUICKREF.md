# ControlHub Patch 9 - Quick Reference

## Quick Start

### Environment Setup

```bash
# .env file
VITE_MQTT_URL=ws://localhost:1883
VITE_MQTT_USERNAME=optional
VITE_MQTT_PASSWORD=optional
```

### Component Usage

```typescript
import { safeLazyImport } from "@/utils/safeLazyImport";

// Safe lazy loading with automatic retry
const BridgeA11y = safeLazyImport(
  () => import("@/components/controlhub/BridgeA11y"),
  "BridgeA11y"
);

// Use in JSX
<BridgeA11y />
```

## Components at a Glance

### BridgeA11y

```typescript
// MQTT status monitor
<BridgeA11y />
```

**Status Indicators:**
- 🟢 Conectado
- 🔴 Desconectado
- 🟡 Conectando...
- ⚪ Não Configurado

**MQTT Topics:**
- Subscribe: `nautilus/bridge/sync`

### ControlPanel

```typescript
// Alerts dashboard
<ControlPanel />
```

**Features:**
- Fetches from `/api/alerts`
- Responsive grid (1 col mobile, 2 cols desktop)
- MQTT acknowledgment on `nautilus/alerts/ack`

**Alert Format:**
```typescript
{
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
}
```

### IncidentReporter

```typescript
// AI insights display
<IncidentReporter />
```

**Features:**
- Fetches from `/api/ai-insights`
- Severity badges
- Formatted timestamps

**Report Format:**
```typescript
{
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

## MQTT Integration

### Publish Event

```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

publishEvent("nautilus/alerts/ack", { 
  id: "alert-123",
  timestamp: new Date().toISOString()
});
```

### MQTT Topics

| Topic | Type | Purpose |
|-------|------|---------|
| `nautilus/bridge/sync` | Subscribe | Display sync |
| `nautilus/alerts/ack` | Publish | Alert ack |

## API Endpoints

### GET /api/alerts

**Response:**
```json
[{
  "id": "alert-001",
  "title": "Alert Title",
  "severity": "warning",
  "message": "Alert message",
  "timestamp": "2025-10-21T14:30:00Z"
}]
```

### GET /api/ai-insights

**Response:**
```json
[{
  "id": "report-001",
  "title": "Report Title",
  "summary": "Report summary...",
  "timestamp": "2025-10-21T14:00:00Z",
  "severity": "high"
}]
```

## Common Issues

### MQTT Not Connecting

1. Check `VITE_MQTT_URL` in `.env`
2. Verify broker is running
3. Check firewall/network

### Lazy Load Failure

- Clear browser cache
- Component auto-retries 3 times
- Check network tab for 404s

### API Errors

- Check browser console
- Verify endpoints exist
- Components handle errors gracefully

## Build Commands

```bash
# Type check
npm run type-check

# Lint and fix
npm run lint:fix

# Build
npm run build

# Dev server
npm run dev
```

## Accessibility Quick Check

✅ All interactive elements keyboard accessible
✅ Proper ARIA labels on dynamic content
✅ Live regions for status updates
✅ Semantic HTML structure
✅ Icons marked as decorative

## Testing Checklist

- [ ] MQTT connects successfully
- [ ] Alerts display and acknowledge
- [ ] Reports load and format correctly
- [ ] Responsive on mobile/desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

## Production Config

```env
# Production MQTT (use WSS!)
VITE_MQTT_URL=wss://mqtt.domain.com:8883
VITE_MQTT_USERNAME=prod_user
VITE_MQTT_PASSWORD=secure_password
```

## Performance

- Module size: 16.88 kB (5.52 kB gzipped)
- Build time: ~60s
- Initial render: <100ms per component

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile: iOS 14+, Android 10+

## Code Snippets

### Safe Lazy Import with Error Handling

```typescript
const Component = safeLazyImport(
  () => import("@/components/MyComponent"),
  "MyComponent"
);

// Component includes:
// - Automatic retry (3 attempts)
// - Exponential backoff
// - Error fallback UI
// - Built-in Suspense
```

### Custom MQTT Handler

```typescript
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const client = initSecureMQTT();

client.on("connect", () => {
  console.log("Connected");
});

client.subscribe("my/topic");

client.on("message", (topic, message) => {
  console.log(topic, message.toString());
});
```

### Alert Acknowledgment Flow

```typescript
const handleAcknowledge = (alert: Alert) => {
  // 1. Publish to MQTT
  publishEvent("nautilus/alerts/ack", {
    id: alert.id,
    timestamp: new Date().toISOString()
  });
  
  // 2. Update local state
  setAlerts(prev => prev.filter(a => a.id !== alert.id));
};
```

## File Locations

```
src/
├── components/controlhub/
│   ├── BridgeA11y.tsx
│   ├── ControlPanel.tsx
│   └── IncidentReporter.tsx
├── lib/mqtt/
│   ├── secure-client.ts
│   └── publisher.ts
└── pages/
    └── ControlHub.tsx
```

## WCAG 2.1 AA Compliance

All components meet Level AA:
- Keyboard accessible
- Screen reader compatible
- Color contrast compliant
- Focus indicators visible
- Live regions for updates

## Resources

- [Full Implementation Guide](CONTROLHUB_PATCH9_IMPLEMENTATION.md)
- [Visual Summary](CONTROLHUB_PATCH9_VISUAL_SUMMARY.md)
- [MQTT.js Docs](https://github.com/mqttjs/MQTT.js)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version:** 2.0.0 (Patch 9)  
**Quick Reference Last Updated:** October 21, 2025
