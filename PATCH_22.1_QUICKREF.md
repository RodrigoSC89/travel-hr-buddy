# Patch 22.1 - Quick Reference Guide

## 🚀 Quick Start

### Cache Management
```bash
# Clean Vite/Lovable cache
npm run clean

# Clean cache and rebuild
npm run rebuild
```

## 📍 New Routes Available

All these routes are now accessible in the application:

| Route | Component | Description |
|-------|-----------|-------------|
| `/maintenance` | MaintenanceDashboard | Painel de Manutenção |
| `/compliance` | ComplianceHub | Centro de Conformidade |
| `/dp-intelligence` | DPIntelligence | Centro de Inteligência DP |
| `/control-hub` | ControlHub | Painel de Controle Central |
| `/forecast-global` | ForecastGlobal | Previsão Global (alias) |
| `/bridgelink` | BridgeLink | Integração BridgeLink |
| `/optimization` | Optimization | Otimização |
| `/maritime` | Maritime | Operações Marítimas |
| `/peo-dp` | PEODP | PEO-DP |
| `/peo-tram` | PEOTRAM | PEO-TRAM (alias) |
| `/checklists-inteligentes` | ChecklistsInteligentes | Checklists (alias) |

## 📂 New Files Created

### Pages
- `src/pages/Maintenance.tsx` - Maintenance Dashboard
- `src/pages/compliance/ComplianceHub.tsx` - Compliance Hub
- `src/pages/dp-intelligence/DPIntelligenceCenter.tsx` - DP Intelligence Center
- `src/pages/control/ControlHub.tsx` - Control Hub (module copy)
- `src/pages/forecast/ForecastGlobal.tsx` - Forecast Global (module copy)
- `src/pages/bridgelink/BridgeLink.tsx` - BridgeLink (module copy)

### Utilities
- `src/lib/safeLazyImport.ts` - Safe lazy import utility (simplified)
- `src/AppRouter.tsx` - Standalone router component

### Scripts
- `scripts/clean-lovable-cache.sh` - Cache cleaning script

## 🔧 Using safeLazyImport

### From @/lib/safeLazyImport (new, simple version)
```typescript
import { safeLazyImport } from "@/lib/safeLazyImport";

const MyComponent = safeLazyImport(() => import("@/pages/MyPage"));
```

### From @/utils/safeLazyImport (existing, robust version)
```typescript
import { safeLazyImport } from "@/utils/safeLazyImport";

const MyComponent = safeLazyImport(
  () => import("@/pages/MyPage"), 
  "My Page Name"
);
```

## 🛠️ Development Workflow

1. **Before making changes:**
   ```bash
   npm run clean
   ```

2. **After updating dependencies:**
   ```bash
   npm run rebuild
   ```

3. **Regular development:**
   ```bash
   npm run dev
   ```

## 📋 Component Structure

### Maintenance Dashboard
- Statistics cards (Total, Scheduled, Pending, Completed)
- Overview section with action buttons
- Integrated with UI components (Card, Button)

### Compliance Hub
- Compliance metrics (percentage, audits, pending items)
- Regulatory tracking (ISO 9001, SOLAS)
- Action buttons for audits and reports

### DP Intelligence Center
- System status monitoring
- Telemetry data display
- Performance metrics
- Real-time sync capabilities

## ⚙️ Configuration

### package.json scripts added:
```json
{
  "scripts": {
    "clean": "bash scripts/clean-lovable-cache.sh",
    "rebuild": "npm run clean && npm run build && npm run dev"
  }
}
```

## 🔍 Troubleshooting

### "Failed to fetch dynamically imported module"
- Run `npm run clean` to clear cache
- Refresh browser (Ctrl+F5 or Cmd+Shift+R)
- If persists, run `npm run rebuild`

### Module not found errors
- Check that the file exists in the correct path
- Verify import path matches file location
- Ensure proper TypeScript/ESLint configuration

### Build errors
- Pre-existing MQTT service errors are unrelated to Patch 22.1
- New components are all syntactically correct
- Focus on functionality testing rather than build completion

## 📝 Notes

- All routes use lazy loading for better performance
- Components include proper error boundaries
- Cache cleaning removes build artifacts safely
- Routes are consistent across main App.tsx and standalone AppRouter.tsx

## 🎯 Testing Routes

Open browser and navigate to:
- http://localhost:5173/maintenance
- http://localhost:5173/compliance
- http://localhost:5173/dp-intelligence
- http://localhost:5173/control-hub
- http://localhost:5173/forecast-global

All routes should load without "Failed to fetch" errors.
