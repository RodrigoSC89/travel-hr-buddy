# AI Predictive & Tactical System (PATCHES 206-210)

## Overview

This implementation introduces a comprehensive AI system capable of predicting failures, making tactical operational decisions, auto-tuning system parameters, and continuously evolving based on feedback.

## Architecture

The system consists of 5 main components:

### 1. Predictive Engine (PATCH 206)
**File**: `src/ai/predictiveEngine.ts`

Forecasts failures, overloads, and demands based on historical data.

**Key Features**:
- Risk scoring (0-100) per module
- Forecast events: `incident`, `downtime`, `overload`, `normal`
- Risk levels: `low`, `medium`, `high`, `critical`
- Confidence scoring for predictions
- Automatic model training from:
  - System Watchdog logs
  - Usage statistics
  - Past incident patterns

**Usage**:
```typescript
import { predictiveEngine } from '@/ai';

// Train the model
await predictiveEngine.trainModel();

// Predict risk for a specific module
const risk = await predictiveEngine.predictModuleRisk('moduleX');
console.log(risk.riskScore); // 0-100
console.log(risk.forecastEvent); // 'incident' | 'downtime' | 'overload' | 'normal'

// Predict for all modules
const allRisks = await predictiveEngine.predictAllModules();
```

**Database Table**: `predictive_events`

### 2. Tactical AI Core (PATCH 207)
**Files**: 
- `src/ai/tacticalAI.ts`
- `src/ai/manual_override.ts`

Makes real-time operational decisions based on predictions and alerts.

**Key Features**:
- Automated actions:
  - Restart modules
  - Shift load to backups
  - Scale up/down resources
  - Enable fallback systems
  - Clear cache
  - Notify humans
- Rule-based decision system
- Priority levels: `low`, `medium`, `high`, `critical`
- Full audit trail
- Manual override capability

**Usage**:
```typescript
import { tacticalAI, manualOverrideSystem } from '@/ai';

// Start tactical AI
tacticalAI.start();

// Evaluate decisions for a module
const decisions = await tacticalAI.evaluateAndDecide('moduleX');

// Set manual override
await manualOverrideSystem.enableOverride('moduleX', 'Manual maintenance', userId, 60); // 60 min

// Get decision history
const history = await tacticalAI.getDecisionHistory('moduleX');
```

**Database Tables**: 
- `tactical_decisions`
- `manual_overrides`

### 3. Adaptive Metrics Engine (PATCH 208)
**File**: `src/ai/adaptiveMetrics.ts`

Auto-adjusts system parameters based on performance data.

**Key Features**:
- Auto-tuned parameters:
  - `latencyThreshold` (200-5000ms)
  - `retryAttempts` (1-10)
  - `timeoutDuration` (5000-120000ms)
  - `cacheExpiry` (60-3600s)
  - `maxConcurrency` (1-50)
- Baseline comparison (triggers at 15% delta)
- Performance impact tracking
- Historical metric storage

**Usage**:
```typescript
import { adaptiveMetricsEngine } from '@/ai';

// Start adaptive engine
adaptiveMetricsEngine.start();

// Get current parameters
const params = adaptiveMetricsEngine.getAllParameters();
console.log(params.latencyThreshold.currentValue);

// Record a metric
await adaptiveMetricsEngine.recordMetric('latencyThreshold', 1200, 0.85);

// Reset parameter to default
await adaptiveMetricsEngine.resetParameter('latencyThreshold');
```

**Database Tables**:
- `adaptive_parameters`
- `metric_history`
- `parameter_adjustments`

### 4. Evolution AI Connector (PATCH 209)
**File**: `src/ai/evoAIConnector.ts`

Creates a self-evolving feedback loop for continuous improvement.

**Key Features**:
- Syncs data from:
  - User feedback
  - Predictive engine results
  - Adaptive metrics adjustments
- Generates insights every 24 hours
- Produces:
  - `training_deltas.json`
  - `performance_score.json`
- Triggers LLM fine-tuning when pattern deviation > 25%

**Usage**:
```typescript
import { evoAIConnector } from '@/ai';

// Start evolution connector
evoAIConnector.start();

// Get latest evolution report
const report = await evoAIConnector.getLatestReport();
console.log(report.evolutionScore); // 0-100
console.log(report.performanceScore.trend); // 'improving' | 'stable' | 'degrading'
console.log(report.insights); // Array of feedback insights
```

**Database Tables**:
- `training_deltas`
- `performance_scores`
- `evolution_insights`
- `fine_tune_requests`

### 5. Cognitive Dashboard (PATCH 210)
**File**: `src/components/ai/CognitiveDashboard.tsx`

Visualizes AI engine activity and insights.

**Key Features**:
- 4 main sections:
  1. **Predictions**: Risk forecasts by module
  2. **Tactical Decisions**: Automated actions and outcomes
  3. **Self-Adjustments**: Parameter tuning history
  4. **Evolution Score**: System learning progress
- Filters:
  - By module
  - By time range (1h, 24h, 7d, 30d)
- Real-time updates (30s refresh)
- Color-coded risk indicators

**Usage**:
```tsx
import { CognitiveDashboard } from '@/components/ai/CognitiveDashboard';

function App() {
  return <CognitiveDashboard />;
}
```

## System Initialization

Use the AI System initializer to start all engines:

```typescript
import { aiSystem } from '@/ai/aiSystem';

// Initialize with all engines enabled
await aiSystem.initialize();

// Initialize with custom config
await aiSystem.initialize({
  enablePredictive: true,
  enableTactical: true,
  enableAdaptive: false, // Disable adaptive engine
  enableEvolution: true,
  enableWatchdog: true,
});

// Check system status
const status = aiSystem.getStatus();
console.log(status);

// Manually trigger predictions
await aiSystem.runPredictions();

// Evaluate specific module
await aiSystem.evaluateModule('moduleX');

// Shutdown system
aiSystem.shutdown();
```

## Database Schema

Run the migration to create all required tables:

```bash
# Apply migration
supabase db push supabase/migrations/20251026190000_create_ai_predictive_system.sql
```

### Tables Created:
1. `predictive_events` - Prediction results
2. `tactical_decisions` - Tactical AI decisions
3. `manual_overrides` - Human overrides
4. `adaptive_parameters` - Current parameter values
5. `metric_history` - Historical metrics
6. `parameter_adjustments` - Adjustment history
7. `training_deltas` - Training data changes
8. `performance_scores` - System performance
9. `evolution_insights` - AI-generated insights
10. `fine_tune_requests` - LLM fine-tuning requests
11. `ai_model_config` - Model configurations

All tables have:
- RLS enabled
- Read access for authenticated users
- Full access for service role
- Proper indexes for performance

## Integration with System Watchdog

The AI system integrates seamlessly with the existing System Watchdog:

```typescript
import { systemWatchdog } from '@/ai/watchdog';
import { predictiveEngine, tacticalAI } from '@/ai';

// Watchdog detects errors → Predictive engine analyzes → Tactical AI acts

// The flow is automatic once initialized via aiSystem.initialize()
```

## Metrics & Monitoring

### Performance Metrics

Track AI system performance:

```typescript
// Get statistics from each engine
const watchdogStats = systemWatchdog.getStats();
const tacticalStats = tacticalAI.getStats();
const adaptiveStats = adaptiveMetricsEngine.getStats();
const evolutionStats = evoAIConnector.getStats();

console.log({
  watchdog: {
    isActive: watchdogStats.isActive,
    totalErrors: watchdogStats.totalErrors,
    criticalErrors: watchdogStats.criticalErrors,
  },
  tactical: {
    isActive: tacticalStats.isActive,
    queueLength: tacticalStats.queueLength,
    totalRules: tacticalStats.totalRules,
  },
  adaptive: {
    isActive: adaptiveStats.isActive,
    totalAdjustments: adaptiveStats.totalAdjustments,
    avgDeltaFromDefault: adaptiveStats.avgDeltaFromDefault,
  },
  evolution: {
    isActive: evolutionStats.isActive,
    batchIntervalHours: evolutionStats.batchIntervalHours,
  },
});
```

## Best Practices

1. **Initialize Early**: Start AI system during app initialization
2. **Monitor Logs**: Watch for `[PredictiveEngine]`, `[TacticalAI]`, `[AdaptiveMetrics]`, `[EvoAI]` log prefixes
3. **Use Manual Overrides**: Disable AI decisions during planned maintenance
4. **Review Insights**: Check evolution insights regularly for system improvements
5. **Clear Cache**: Use `predictiveEngine.clearCache()` after major system changes

## Troubleshooting

### Predictions Not Updating
```typescript
// Clear cache and retrain
predictiveEngine.clearCache();
await predictiveEngine.trainModel();
```

### Tactical Decisions Not Executing
```typescript
// Check if manual override is active
const isOverridden = await manualOverrideSystem.isOverrideActive('moduleX');
if (isOverridden) {
  await manualOverrideSystem.disableOverride('moduleX', userId);
}
```

### Parameters Not Adjusting
```typescript
// Check if adaptive engine is running
const stats = adaptiveMetricsEngine.getStats();
console.log('Active:', stats.isActive);

// Record more metrics to trigger adjustments
await adaptiveMetricsEngine.recordMetric('latencyThreshold', value, performanceScore);
```

## API Reference

See individual module files for complete API documentation:
- `src/ai/predictiveEngine.ts`
- `src/ai/tacticalAI.ts`
- `src/ai/manual_override.ts`
- `src/ai/adaptiveMetrics.ts`
- `src/ai/evoAIConnector.ts`
- `src/ai/aiSystem.ts`

## Future Enhancements

Potential improvements:
1. Machine learning model integration (TensorFlow.js)
2. Custom rule builder UI
3. A/B testing for AI decisions
4. Multi-tenant isolation
5. Real-time dashboards with WebSockets
6. Slack/Teams integration for alerts
7. Advanced analytics and reporting

## License

Same as parent project.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
