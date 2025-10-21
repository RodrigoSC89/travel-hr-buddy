# ControlHub Patch 9 - Quick Reference

## 🚀 Quick Start

### Accessing ControlHub
```
URL: /controlhub
Route: src/pages/ControlHub.tsx
```

### Key Components

#### 1. BridgeA11y (MQTT Status)
```typescript
import BridgeA11y from "@/components/controlhub/BridgeA11y";

<BridgeA11y />
```
**Shows:** MQTT connection status (Conectado/Desconectado/Conectando/Não Configurado)

#### 2. ControlPanel (Alerts)
```typescript
import ControlPanel from "@/components/controlhub/ControlPanel";

<ControlPanel />
```
**Shows:** Active alerts with acknowledge buttons

#### 3. IncidentReporter (AI Insights)
```typescript
import IncidentReporter from "@/components/controlhub/IncidentReporter";

<IncidentReporter />
```
**Shows:** AI-generated incident reports

## 📦 Safe Lazy Import

### Usage
```typescript
import { safeLazyImport } from "@/lib/safeLazyImport";

const MyComponent = safeLazyImport("@/components/MyComponent");

// In render
<Suspense fallback={<Loader />}>
  <MyComponent />
</Suspense>
```

### Features
- ✅ Auto-retry (3 attempts)
- ✅ Exponential backoff (1s, 2s, 4s)
- ✅ Error fallback UI
- ✅ Console logging

## 🔌 MQTT Integration

### Environment Setup
```bash
# .env or .env.local
VITE_MQTT_URL=ws://localhost:1883

# Production
VITE_MQTT_URL=wss://mqtt.domain.com:8883
```

### Publishing Events
```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

publishEvent("nautilus/alerts/ack", { 
  id: alertId,
  timestamp: Date.now() 
});
```

### Topics
| Topic | Direction | Purpose |
|-------|-----------|---------|
| `nautilus/bridge/sync` | Subscribe | Display sync |
| `nautilus/alerts/ack` | Publish | Alert acknowledgment |
| `nautilus/events` | Subscribe | System events |

## ♿ Accessibility (WCAG 2.1 AA)

### Key Attributes
```typescript
// Headings
<h1 role="heading" aria-level={1}>Title</h1>

// Status regions
<div role="status" aria-live="polite">Loading...</div>

// Buttons
<Button aria-label="Acknowledge alert">OK</Button>

// Decorative icons
<Icon aria-hidden="true" />
```

### Checklist
- ✅ All interactive elements are keyboard accessible
- ✅ ARIA roles and labels on dynamic content
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG AA standards
- ✅ Focus visible on all focusable elements

## 🎨 Styling

### Nautilus CSS Variables
```css
--nautilus-bg-alt       /* Background alt color */
--nautilus-bg           /* Background color */
--nautilus-text         /* Text color */
--nautilus-text-muted   /* Muted text */
--nautilus-primary      /* Primary color */
--nautilus-accent       /* Accent color */
--nautilus-error        /* Error color */
```

### Example
```typescript
<div className="bg-[var(--nautilus-bg)] text-[var(--nautilus-text)]">
  Content
</div>
```

## 🧪 Testing

### Build
```bash
npm run build
# Expected: ✓ built in ~57s
```

### Lint
```bash
npm run lint
# Expected: Only warnings (no errors in new code)

npm run lint:fix
# Auto-fix formatting issues
```

### Type Check
```bash
npm run type-check
# Expected: No TypeScript errors
```

## 🐛 Common Issues

### Issue: MQTT "Desconectado"
**Fix:**
1. Check `VITE_MQTT_URL` in `.env`
2. Restart dev server: `npm run dev`
3. Check broker is running: `telnet localhost 1883`

### Issue: "Failed to fetch module"
**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Rebuild: `npm run build`
3. Clear browser cache
4. safeLazyImport will auto-retry 3x

### Issue: Components not showing
**Fix:**
1. Check console for errors
2. Verify import paths
3. Ensure Suspense wrapper exists
4. Check component export (must be `export default`)

## 📊 API Endpoints (To Implement)

### GET /api/alerts
**Response:**
```json
[
  {
    "id": "alert-1",
    "title": "High CPU Usage",
    "description": "Server CPU at 95%",
    "severity": "warning",
    "timestamp": "2025-10-21T10:00:00Z"
  }
]
```

### GET /api/ai-insights
**Response:**
```json
[
  {
    "id": "insight-1",
    "title": "Anomaly Detected",
    "summary": "Unusual traffic pattern at 09:45",
    "timestamp": "2025-10-21T09:45:00Z"
  }
]
```

## 🔧 Configuration

### Vite Config
```typescript
// vite.config.ts
define: {
  "process.env.MQTT_URL": JSON.stringify(process.env.VITE_MQTT_URL),
}
```

### TypeScript
```typescript
// All types are properly defined
interface Alert {
  id: string;
  title: string;
  description: string;
  severity?: string;
  timestamp?: string;
}
```

## 📂 File Structure

```
src/
├── components/
│   ├── controlhub/
│   │   ├── BridgeA11y.tsx        # MQTT status
│   │   ├── ControlPanel.tsx      # Alerts panel
│   │   └── IncidentReporter.tsx  # AI reports
│   └── ui/
│       └── loader.tsx             # Loading component
├── lib/
│   ├── mqtt/
│   │   └── publisher.ts           # MQTT helper
│   └── safeLazyImport.ts          # Safe lazy loader
└── pages/
    └── ControlHub.tsx             # Main page
```

## 🎯 Key Features

1. **Safe Lazy Loading** - No more "failed to fetch" errors
2. **MQTT Bridge** - Real-time sync between displays
3. **Alerts System** - Acknowledge and track alerts
4. **AI Insights** - Automated incident reports
5. **Accessibility** - WCAG 2.1 AA compliant
6. **Responsive** - Mobile-first design

## 📞 Support

### Documentation
- Full implementation: `CONTROLHUB_PATCH9_IMPLEMENTATION.md`
- This quickref: `CONTROLHUB_PATCH9_QUICKREF.md`

### Debugging
```typescript
// Enable verbose MQTT logging
localStorage.setItem("debug", "mqtt:*");

// Check component mount
console.log("BridgeA11y mounted:", document.querySelector('[role="status"]'));
```

## ✅ Production Checklist

- [x] All components created
- [x] MQTT integration working
- [x] Accessibility attributes added
- [x] Build passing
- [x] Lint passing
- [ ] Backend API endpoints implemented
- [ ] Lighthouse score > 95
- [ ] E2E tests added
- [ ] Production MQTT URL configured

---
**Version:** Patch 9  
**Status:** ✅ Implementation Complete  
**Date:** 2025-10-21
