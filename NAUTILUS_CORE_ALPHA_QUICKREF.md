# Nautilus Core Alpha - Quick Reference

## 🚀 Quick Start

### BridgeLink Event System
```typescript
import { BridgeLink } from '@/core/BridgeLink';

// Listen to events
const unsubscribe = BridgeLink.on('mmi:job:created', (event) => {
  console.log(event.data);
});

// Emit events
BridgeLink.emit('mmi:job:created', 'MyModule', { jobId: 123 });

// Get statistics
const stats = BridgeLink.getStats();

// Get history
const history = BridgeLink.getHistory(10);

// Clear history
BridgeLink.clearHistory();
```

### Safe Lazy Import
```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

// Replace React.lazy with safeLazyImport
const MyPage = safeLazyImport(() => import('@/pages/MyPage'), 'MyPage');

// With custom retry count
const MyComponent = safeLazyImport(
  () => import('@/components/MyComponent'), 
  'MyComponent',
  5 // 5 retries instead of default 3
);
```

### NautilusAI
```typescript
import { NautilusAI } from '@/ai/nautilus-core';

// Analyze
const result = await NautilusAI.analyze('text to analyze');
// result: { analysis, confidence, suggestions, timestamp }

// Classify
const classification = await NautilusAI.classify('content');
// classification: { category, confidence, alternatives, timestamp }

// Predict
const prediction = await NautilusAI.predict([1, 2, 3, 4, 5]);
// prediction: { prediction, confidence, factors, timestamp }

// Load model
await NautilusAI.loadModel('model-name', '1.0.0');

// Get status
const status = NautilusAI.getModelStatus();
```

## 📍 Key Routes

- `/control-hub` - Central telemetry dashboard

## 🔧 Build Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Test specific file
npm run test -- tests/nautilus-core.test.ts

# Lint
npm run lint

# Lint fix
npm run lint:fix
```

## 📊 Event Types

| Event Type | Module | Description |
|------------|--------|-------------|
| `mmi:forecast:update` | MMI | Forecast data updated |
| `mmi:job:created` | MMI | New job created |
| `dp:incident:reported` | DP | Incident reported |
| `dp:intelligence:alert` | DP | Intelligence alert |
| `fmea:risk:identified` | FMEA | Risk identified |
| `asog:procedure:activated` | ASOG | Procedure activated |
| `wsog:checklist:completed` | WSOG | Checklist completed |
| `ai:analysis:complete` | AI | AI analysis completed |
| `system:module:loaded` | System | Module loaded |
| `telemetry:log` | System | Telemetry log entry |

## 🎯 Key Features

✅ Type-safe event system  
✅ Automatic retry on import failures  
✅ Real-time telemetry dashboard  
✅ AI core with analyze/classify/predict  
✅ Optimized build chunks  
✅ PWA support (10MB limit)  
✅ 100% browser-based (no backend required)  
✅ IMCA/ISM compliant  

## 📦 Generated Chunks

- `vendor-react` - React core (453KB)
- `module-bridgelink` - Event system (2KB)
- `module-controlhub` - Dashboard (12KB)
- `module-dp` - DP modules (22KB)
- `module-mmi` - MMI modules (32KB)
- `module-sgso` - SGSO modules (154KB)

## 🧪 Test Coverage

40 tests across 3 categories:
1. BridgeLink Event System (18 tests)
2. NautilusAI Core (15 tests)
3. Integration Tests (7 tests)

## 🔒 Security Notes

- All BridgeLink events are local (browser-only)
- No sensitive data transmission
- Audit trail for all events
- Controlled error logging
- IMCA M 117 compliant segregation

## 📝 Next Steps

1. Connect BridgeLink to backend MQTT (Q1 2025)
2. Integrate real LLM (ONNX/GGML) (Q2 2025)
3. Full audit trail + WSOG/FMEA integration (Q4 2025)
