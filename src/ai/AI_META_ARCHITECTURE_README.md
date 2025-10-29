# AI Meta-Architecture Modules (PATCHES 586-590)

## Overview

This package implements five advanced AI meta-modules that enable self-awareness, self-improvement, and autonomous operation of the AI system. These modules work together to create a sophisticated meta-cognitive layer above the base AI functionality.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Meta-Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐    ┌──────────────────┐                │
│  │   Multi-Level  │◄──►│   Reflective     │                │
│  │  Coordination  │    │      Core        │                │
│  └────────┬───────┘    └────────┬─────────┘                │
│           │                     │                            │
│           │    ┌────────────────▼──────┐                    │
│           │    │   Evolution Tracker   │                    │
│           │    └────────────┬──────────┘                    │
│           │                 │                                │
│           ▼                 ▼                                │
│  ┌────────────────┐    ┌──────────────────┐                │
│  │     Auto-      │◄──►│  Self-Diagnosis  │                │
│  │ Reconfiguration│    │   + Recovery     │                │
│  └────────────────┘    └──────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Modules

### PATCH 586: Multi-Level Coordination Engine

**Purpose:** Coordinates AI decisions across three hierarchical levels:
- **Strategic**: Long-term planning (weeks to months)
- **Operational**: Medium-term execution (days to weeks)  
- **Tactical**: Immediate actions (minutes to hours)

**Key Features:**
- Hierarchical decision-making with automatic fallback
- Conflict detection and resolution between levels
- Priority-based objective management
- Per-layer decision logging

**Usage:**
```typescript
import { multiLevelEngine } from "@/ai/meta-modules";

// Define contexts for each level
const strategicContext = {
  level: "strategic",
  objectives: [{ id: "1", description: "Complete mission", priority: 9, deadline: "2025-12-31", status: "pending" }],
  availableResources: ["strategic_planner"],
  constraints: { budget: 100000 },
  timeHorizon: 720, // hours
};

// Coordinate decisions across all levels
const result = await multiLevelEngine.coordinateDecisions(
  strategicContext,
  operationalContext,
  tacticalContext,
  ["Goal 1", "Goal 2"]
);

// Access decisions and conflicts
console.log(result.strategic);
console.log(result.conflicts);
```

**Acceptance Criteria:**
✅ System reacts to conflicts between levels (e.g., strategy vs operation)  
✅ Logs show hierarchy and resolution  
✅ Supports 3 distinct levels (strategic, operational, tactical)

---

### PATCH 587: IA Reflective Core

**Purpose:** Enables AI self-reflection based on previous decisions to improve future performance.

**Key Features:**
- Decision history storage and retrieval
- Pattern analysis (errors and successes)
- Dynamic confidence weight adaptation
- Automatic reflection per mission
- Alternative decision insights

**Usage:**
```typescript
import { reflectiveCore } from "@/ai/meta-modules";

// Record a decision
await reflectiveCore.recordDecision({
  missionId: "mission-1",
  decisionType: "route_planning",
  context: { weather: "clear" },
  chosenAction: "route_A",
  alternativeActions: ["route_B", "route_C"],
  outcome: "success",
  impactScore: 90,
  confidenceAtTime: 0.8,
  actualPerformance: 95,
});

// Execute reflection
const report = await reflectiveCore.reflectOnMission("mission-1");
console.log(report.insights);
console.log(report.overallLearning);

// Get updated strategy confidence
const confidence = reflectiveCore.getStrategyConfidence("route_planning");
```

**Acceptance Criteria:**
✅ Reflection executed automatically once per mission  
✅ Logs with insights on what could have been done differently  
✅ Confidence metrics adjusted dynamically

---

### PATCH 588: Evolution Tracker

**Purpose:** Tracks and documents AI behavior evolution over time.

**Key Features:**
- Internal AI version history management
- Performance metrics comparison across versions
- Cognitive progress visualization data
- Audit-ready data export

**Usage:**
```typescript
import { evolutionTracker } from "@/ai/meta-modules";

// Initialize tracker
await evolutionTracker.initialize();

// Create a new version
const version = await evolutionTracker.createVersion({
  versionNumber: "1.1.0",
  description: "Improved accuracy model",
  changes: ["Enhanced training data", "Better preprocessing"],
  parentVersionId: "v1.0.0",
});

// Record performance metrics
await evolutionTracker.recordMetrics(version.versionId, {
  accuracy: 92,
  precision: 90,
  recall: 94,
  f1Score: 92,
  responseTime: 150,
  decisionQuality: 88,
  errorRate: 0.05,
  confidenceCalibration: 85,
  resourceEfficiency: 80,
  sampleSize: 1000,
});

// Compare versions
const comparison = await evolutionTracker.compareVersions("v1.0.0", version.versionId);
console.log(comparison.recommendation);

// Export for audit
const auditData = evolutionTracker.exportAuditData();
```

**Acceptance Criteria:**
✅ Learning timeline visible in dashboard data  
✅ Performance metrics per version  
✅ Data export for auditing

---

### PATCH 589: Auto-Reconfiguration Protocols

**Purpose:** Enables dynamic AI reconfiguration based on operational conditions.

**Key Features:**
- Trigger-based reconfiguration (failure, overload, repeated errors)
- Automatic model/configuration switching
- Complete before/after state logging
- Post-adjustment performance validation

**Usage:**
```typescript
import { autoReconfigEngine } from "@/ai/meta-modules";

// Initialize with default config
await autoReconfigEngine.initialize();

// Monitor and detect triggers
const trigger = await autoReconfigEngine.monitorAndTrigger({
  errorRate: 0.20,
  performanceScore: 65,
  resourceUsage: 0.85,
  responseTime: 2000,
  consecutiveFailures: 3,
});

// Execute reconfiguration if trigger detected
if (trigger) {
  const action = await autoReconfigEngine.executeReconfiguration(trigger);
  console.log(`Reconfigured: ${action.changes.length} changes`);
  
  // Validate performance
  const validation = await autoReconfigEngine.validatePerformance(
    action.actionId,
    beforeMetrics,
    afterMetrics
  );
  console.log(`Validation: ${validation.verdict}`);
}

// Export logs
const logs = autoReconfigEngine.exportLogs();
```

**Acceptance Criteria:**
✅ At least 2 automatic reconfigurations tested  
✅ Logs confirm before/after state  
✅ Post-adjustment performance validated

---

### PATCH 590: Self-Diagnosis + Recovery Loop

**Purpose:** Implements self-healing with diagnostic scanning and automatic recovery.

**Key Features:**
- Periodic AI module performance scanning
- Degradation and anomaly detection
- Automatic or proposed recovery actions
- Exportable self-correction logs

**Usage:**
```typescript
import { selfDiagnosisLoop } from "@/ai/meta-modules";

// Register modules for monitoring
selfDiagnosisLoop.registerModule({
  moduleId: "core-engine",
  moduleName: "Core AI Engine",
  type: "core",
  dependencies: [],
  healthThresholds: {
    minAccuracy: 85,
    maxLatency: 1000,
    maxErrorRate: 0.10,
    minAvailability: 95,
  },
});

// Start diagnostic loop
await selfDiagnosisLoop.startDiagnosticLoop();

// Get health summary
const summary = selfDiagnosisLoop.getModuleHealthSummary();

// Export logs
const logs = selfDiagnosisLoop.exportLogs();
console.log(`Detected ${logs.summary.anomaliesDetected} anomalies`);
console.log(`Success rate: ${logs.summary.successRate}%`);
```

**Acceptance Criteria:**
✅ Diagnosis detects simulated failures  
✅ System proposes or applies corrections  
✅ Self-correction logs are exportable

---

## Integration

All modules are designed to work together:

```typescript
import {
  multiLevelEngine,
  reflectiveCore,
  evolutionTracker,
  autoReconfigEngine,
  selfDiagnosisLoop,
} from "@/ai/meta-modules";

// 1. Coordination makes decisions
const decisions = await multiLevelEngine.coordinateDecisions(...);

// 2. Reflective core records and learns
await reflectiveCore.recordDecision({
  missionId: "mission-1",
  decisionType: "tactical",
  chosenAction: decisions.tactical.action,
  // ...
});

// 3. Evolution tracker monitors improvements
await evolutionTracker.recordMetrics(currentVersion, {
  accuracy: calculateAccuracy(),
  // ...
});

// 4. Auto-reconfig adjusts on issues
const trigger = await autoReconfigEngine.monitorAndTrigger(currentMetrics);

// 5. Self-diagnosis maintains health
const health = selfDiagnosisLoop.getModuleHealthSummary();
```

## Database Schema

All modules persist data to Supabase. Required tables:

- `coordination_log` - Multi-level coordination events
- `ai_decision_history` - Decision records for reflection
- `ai_reflection_reports` - Reflection analysis results
- `ai_versions` - AI version history
- `ai_performance_metrics` - Performance data per version
- `ai_configurations` - System configurations
- `ai_reconfig_triggers` - Reconfiguration trigger events
- `ai_diagnostic_scans` - Module health scans
- `ai_recovery_plans` - Recovery action plans

## Testing

Comprehensive test suite with 22 tests covering:
- ✅ Multi-level decision coordination
- ✅ Conflict detection and resolution
- ✅ Decision reflection and learning
- ✅ Version comparison and evolution
- ✅ Automatic reconfiguration
- ✅ Anomaly detection and recovery

Run tests:
```bash
npm test tests/patches-586-590.test.ts
```

## TypeScript Support

All modules are fully typed with comprehensive TypeScript interfaces. Enable strict type checking in your project for full benefits.

## License

Part of the Travel HR Buddy project.
