# AI Predictive System - Quick Reference

## 🚀 Quick Start

```typescript
import { aiSystem } from '@/ai/aiSystem';

// Start everything
await aiSystem.initialize();
```

## 📊 Component Reference

| Component | File | Purpose |
|-----------|------|---------|
| Predictive Engine | `predictiveEngine.ts` | Forecast failures & overloads |
| Tactical AI | `tacticalAI.ts` | Automated operational decisions |
| Manual Override | `manual_override.ts` | Human control over AI |
| Adaptive Metrics | `adaptiveMetrics.ts` | Auto-tune system parameters |
| Evolution Connector | `evoAIConnector.ts` | Self-improving feedback loop |
| Cognitive Dashboard | `CognitiveDashboard.tsx` | Visual monitoring UI |

## 🎯 Common Tasks

### Get Risk Prediction
```typescript
import { predictiveEngine } from '@/ai';

const risk = await predictiveEngine.predictModuleRisk('payments');
console.log(`Risk: ${risk.riskScore}/100`); // 0-100
console.log(`Forecast: ${risk.forecastEvent}`); // incident/downtime/overload
```

### Enable Manual Override
```typescript
import { manualOverrideSystem } from '@/ai';

// Override for 60 minutes
await manualOverrideSystem.enableOverride(
  'payments',
  'Scheduled maintenance',
  userId,
  60
);
```

### Check System Status
```typescript
import { aiSystem } from '@/ai/aiSystem';

const status = aiSystem.getStatus();
console.log(status.watchdog);  // Watchdog stats
console.log(status.tactical);  // Decision stats
console.log(status.adaptive);  // Parameter stats
```

### View Evolution Report
```typescript
import { evoAIConnector } from '@/ai';

const report = await evoAIConnector.getLatestReport();
console.log(`Evolution Score: ${report.evolutionScore}/100`);
console.log(`Trend: ${report.performanceScore.trend}`); // improving/stable/degrading
```

## 🔧 Configuration

### Selective Engine Initialization
```typescript
await aiSystem.initialize({
  enablePredictive: true,
  enableTactical: true,
  enableAdaptive: false,  // Disable this one
  enableEvolution: true,
  enableWatchdog: true,
});
```

### Adaptive Parameter Tuning
```typescript
import { adaptiveMetricsEngine } from '@/ai';

// Get current value
const latency = adaptiveMetricsEngine.getParameter('latencyThreshold');
console.log(`Current: ${latency.currentValue}ms`);

// Reset to default
await adaptiveMetricsEngine.resetParameter('latencyThreshold');
```

## 📈 Monitoring

### Watch Logs
```bash
# Filter AI logs
grep "\[PredictiveEngine\]" logs.txt
grep "\[TacticalAI\]" logs.txt
grep "\[AdaptiveMetrics\]" logs.txt
grep "\[EvoAI\]" logs.txt
```

### Health Check
```typescript
// Manual health check
const stats = {
  watchdog: systemWatchdog.getStats(),
  tactical: tacticalAI.getStats(),
  adaptive: adaptiveMetricsEngine.getStats(),
  evolution: evoAIConnector.getStats(),
};
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `predictive_events` | Prediction history |
| `tactical_decisions` | AI decisions & outcomes |
| `manual_overrides` | Human overrides |
| `adaptive_parameters` | Current parameter values |
| `metric_history` | Historical metrics |
| `parameter_adjustments` | Adjustment log |
| `training_deltas` | Training changes |
| `performance_scores` | System performance |
| `evolution_insights` | AI insights |
| `fine_tune_requests` | LLM fine-tune queue |
| `ai_model_config` | Model configurations |

## 🎨 Dashboard Usage

```tsx
import { CognitiveDashboard } from '@/components/ai/CognitiveDashboard';

function App() {
  return <CognitiveDashboard />;
}
```

**Tabs**:
1. **Predictions** - Risk forecasts per module
2. **Decisions** - Tactical actions taken
3. **Adjustments** - Parameter changes
4. **Evolution** - Learning progress

**Filters**:
- Module: All / Specific module
- Time: 1h / 24h / 7d / 30d

## 🛠️ Troubleshooting

### Predictions Not Updating
```typescript
predictiveEngine.clearCache();
await predictiveEngine.trainModel();
```

### Decisions Not Executing
```typescript
// Check override
const override = await manualOverrideSystem.isOverrideActive('module');
if (override) {
  await manualOverrideSystem.disableOverride('module', userId);
}
```

### Parameters Stuck
```typescript
// Force adjustment evaluation
adaptiveMetricsEngine.stop();
adaptiveMetricsEngine.start();
```

## 🔐 Security

- ✅ All tables have RLS enabled
- ✅ Service role required for writes
- ✅ Authenticated users have read access
- ✅ No sensitive data in logs

## 📝 Risk Levels

| Level | Score | Actions |
|-------|-------|---------|
| **Critical** | 75-100 | Immediate intervention |
| **High** | 50-74 | Proactive measures |
| **Medium** | 25-49 | Monitoring |
| **Low** | 0-24 | Normal operation |

## 🎯 Decision Actions

| Action | Description |
|--------|-------------|
| `restart_module` | Restart failing module |
| `shift_load` | Move traffic to backup |
| `scale_up` | Increase resources |
| `scale_down` | Decrease resources |
| `enable_fallback` | Activate fallback mode |
| `disable_feature` | Turn off problematic feature |
| `clear_cache` | Clear module cache |
| `notify_human` | Alert operator |

## 📚 Further Reading

- Full documentation: `AI_PREDICTIVE_SYSTEM_README.md`
- Database schema: `supabase/migrations/20251026190000_create_ai_predictive_system.sql`
- Source code: `src/ai/` directory

## 🆘 Support

For issues:
1. Check logs for `[AISystem]`, `[PredictiveEngine]`, `[TacticalAI]` prefixes
2. Verify database tables exist
3. Check system status with `aiSystem.getStatus()`
4. Review dashboard for visual diagnostics

## 📊 Performance Tips

1. **Cache Management**: Clear prediction cache after major changes
2. **Training Frequency**: Retrain model daily or after significant events
3. **Manual Overrides**: Use during maintenance windows
4. **Health Monitoring**: Review evolution insights weekly
5. **Parameter Tuning**: Let adaptive engine run for 24h before manual adjustments

## 🔄 Lifecycle

```typescript
// Startup
await aiSystem.initialize();

// Runtime
const status = aiSystem.getStatus();
await aiSystem.runPredictions();
await aiSystem.evaluateModule('moduleX');

// Shutdown
aiSystem.shutdown();
```

## 🎉 Success Metrics

Monitor these indicators:
- Evolution Score > 80
- Critical Errors < 5
- Decision Success Rate > 90%
- Prediction Confidence > 0.7
- Trend: "improving" or "stable"
