# AI Meta-Architecture Quick Reference

## 🎯 PATCHES 586-590: Quick Guide

### Module Index

| Patch | Module | Purpose | Key Method |
|-------|--------|---------|------------|
| 586 | Multi-Level Coordination | Hierarchical decision-making | `coordinateDecisions()` |
| 587 | Reflective Core | Self-learning from past decisions | `reflectOnMission()` |
| 588 | Evolution Tracker | Version history & improvement | `compareVersions()` |
| 589 | Auto-Reconfiguration | Dynamic system adjustment | `executeReconfiguration()` |
| 590 | Self-Diagnosis Loop | Health monitoring & recovery | `startDiagnosticLoop()` |

---

## 🚀 Quick Start

### Import Everything
```typescript
import {
  multiLevelEngine,
  reflectiveCore,
  evolutionTracker,
  autoReconfigEngine,
  selfDiagnosisLoop,
} from "@/ai/meta-modules";
```

### 1️⃣ Multi-Level Coordination (PATCH 586)

**3 Decision Levels:**
- 🎯 **Strategic**: Long-term (weeks-months)
- ⚙️ **Operational**: Medium-term (days-weeks)
- ⚡ **Tactical**: Immediate (minutes-hours)

```typescript
// Quick coordination
const result = await multiLevelEngine.coordinateDecisions(
  strategicContext, operationalContext, tacticalContext, goals
);

// Check for conflicts
if (result.conflicts.length > 0) {
  console.log("Conflicts resolved:", result.conflicts);
}
```

**Logs:** `getLogs(level?)` - Get decision logs by level

---

### 2️⃣ Reflective Core (PATCH 587)

**Learn from decisions:**
```typescript
// Record decision
await reflectiveCore.recordDecision({
  missionId: "mission-1",
  decisionType: "navigation",
  chosenAction: "route_A",
  alternativeActions: ["route_B"],
  outcome: "success", // or "failure", "partial"
  impactScore: 85,
  confidenceAtTime: 0.8,
  actualPerformance: 90,
  context: {},
});

// Reflect on mission (auto-triggered)
const report = await reflectiveCore.reflectOnMission("mission-1");

// Insights types:
// - error_pattern
// - success_pattern
// - missed_opportunity
```

**Get confidence:** `getStrategyConfidence(strategyName)`

---

### 3️⃣ Evolution Tracker (PATCH 588)

**Track AI improvements:**
```typescript
// Initialize
await evolutionTracker.initialize();

// Create version
const v2 = await evolutionTracker.createVersion({
  versionNumber: "2.0.0",
  description: "Enhanced model",
  changes: ["Better accuracy", "Faster response"],
  parentVersionId: v1.versionId,
});

// Record metrics
await evolutionTracker.recordMetrics(v2.versionId, {
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
const comparison = await evolutionTracker.compareVersions(v1, v2);
// Returns: recommendation, improvements, significant changes
```

**Export audit:** `exportAuditData()`

---

### 4️⃣ Auto-Reconfiguration (PATCH 589)

**Automatic adjustments:**

**Triggers:**
- `failure_threshold_exceeded` - Too many errors
- `performance_degradation` - Performance drops
- `resource_overload` - Resources maxed out
- `repeated_errors` - Same errors recurring

```typescript
// Initialize
await autoReconfigEngine.initialize();

// Monitor (run periodically)
const trigger = await autoReconfigEngine.monitorAndTrigger({
  errorRate: 0.20,           // 20% errors
  performanceScore: 65,       // Low score
  resourceUsage: 0.85,        // 85% usage
  responseTime: 2000,         // 2s response
  consecutiveFailures: 3,     // 3 failures
});

// Auto-execute if triggered
if (trigger) {
  const action = await autoReconfigEngine.executeReconfiguration(trigger);
  
  // Validate improvement
  const validation = await autoReconfigEngine.validatePerformance(
    action.actionId,
    beforeMetrics,
    afterMetrics
  );
  
  console.log(`Verdict: ${validation.verdict}`); // success/mixed/failure
}
```

**Configuration types:**
- `model_switch` - Change AI model
- `parameter_adjustment` - Tune parameters
- `strategy_change` - Switch strategy
- `resource_reallocation` - Adjust resources

---

### 5️⃣ Self-Diagnosis Loop (PATCH 590)

**Health monitoring:**
```typescript
// Register module
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

// Start monitoring (runs every 5 minutes)
await selfDiagnosisLoop.startDiagnosticLoop();

// Get health status
const summary = selfDiagnosisLoop.getModuleHealthSummary();
// Returns: moduleId, status, lastScan, anomalyCount

// Export logs
const logs = selfDiagnosisLoop.exportLogs();
console.log(logs.summary);
// { totalScans, anomaliesDetected, plansCreated, actionsExecuted, successRate }
```

**Anomaly types:**
- `performance` - Poor performance
- `accuracy` - Low accuracy
- `availability` - Service down
- `resource` - Resource issues
- `latency` - High latency

**Recovery actions:**
- `restart` - Restart module
- `reconfigure` - Adjust config
- `fallback` - Switch to backup
- `isolate` - Isolate module
- `alert` - Notify operators

---

## 📊 Status & Metrics

### Module Health Status
```typescript
// Multi-level coordination
multiLevelEngine.getLogs();          // All decision logs
multiLevelEngine.getConflicts();     // Conflict resolutions

// Reflective core
reflectiveCore.getInsights();        // Learning insights
reflectiveCore.exportLearningData(); // Full learning export

// Evolution tracker
evolutionTracker.getEvolutionTimeline();       // Timeline data
evolutionTracker.getCognitiveCapabilitiesSummary(); // Capabilities

// Auto-reconfig
autoReconfigEngine.getCurrentConfiguration();  // Active config
autoReconfigEngine.exportLogs();               // All reconfig logs

// Self-diagnosis
selfDiagnosisLoop.getModuleHealthSummary();    // Health status
selfDiagnosisLoop.exportLogs();                // Diagnostic logs
```

---

## 🎯 Common Workflows

### 1. Decision → Learning → Evolution
```typescript
// Make decision
const decision = await multiLevelEngine.makeTacticalDecision(context);

// Record for learning
await reflectiveCore.recordDecision({
  missionId: "mission-1",
  decisionType: "tactical",
  chosenAction: decision.action,
  outcome: "success",
  actualPerformance: 90,
  // ...
});

// Track in evolution
await evolutionTracker.recordMetrics(currentVersion, metrics);
```

### 2. Monitor → Detect → Reconfig → Validate
```typescript
// Monitor system
const trigger = await autoReconfigEngine.monitorAndTrigger(metrics);

// Reconfig if needed
if (trigger) {
  const action = await autoReconfigEngine.executeReconfiguration(trigger);
  const validation = await autoReconfigEngine.validatePerformance(
    action.actionId, before, after
  );
}
```

### 3. Scan → Diagnose → Recover
```typescript
// Continuous monitoring
await selfDiagnosisLoop.startDiagnosticLoop();

// Check health periodically
const health = selfDiagnosisLoop.getModuleHealthSummary();
health.forEach(module => {
  if (module.status !== "healthy") {
    console.warn(`${module.moduleName}: ${module.status}`);
  }
});
```

---

## 🔍 Debugging

**Enable detailed logging:**
```typescript
// Check decision logs
const logs = multiLevelEngine.getLogs("tactical");
logs.forEach(log => console.log(log.details));

// Review reflection insights
const insights = reflectiveCore.getInsights("mission-1");
insights.forEach(insight => {
  console.log(`${insight.insightType}: ${insight.description}`);
});

// Check reconfiguration history
const reconfigs = autoReconfigEngine.getActions();
reconfigs.forEach(action => {
  console.log(`${action.status}: ${action.changes.length} changes`);
});
```

---

## 📦 Export Data

All modules support data export for analysis:

```typescript
// Coordination
multiLevelEngine.exportHierarchy();

// Reflection
reflectiveCore.exportLearningData();

// Evolution
evolutionTracker.exportAuditData();

// Reconfiguration
autoReconfigEngine.exportLogs();

// Diagnosis
selfDiagnosisLoop.exportLogs();
```

---

## ✅ Acceptance Criteria Status

| Patch | Criteria | Status |
|-------|----------|--------|
| 586 | Conflict resolution ✓ | ✅ |
| 586 | Hierarchical logs ✓ | ✅ |
| 586 | 3 levels support ✓ | ✅ |
| 587 | Auto-reflection ✓ | ✅ |
| 587 | Insight generation ✓ | ✅ |
| 587 | Confidence adjustment ✓ | ✅ |
| 588 | Timeline visible ✓ | ✅ |
| 588 | Metrics per version ✓ | ✅ |
| 588 | Audit export ✓ | ✅ |
| 589 | 2+ reconfigs tested ✓ | ✅ |
| 589 | Before/after logs ✓ | ✅ |
| 589 | Performance validation ✓ | ✅ |
| 590 | Failure detection ✓ | ✅ |
| 590 | Auto-correction ✓ | ✅ |
| 590 | Exportable logs ✓ | ✅ |

---

## 🧪 Testing

Run all tests:
```bash
npm test tests/patches-586-590.test.ts
```

22 tests covering all modules ✅

---

## 📚 Full Documentation

See [AI_META_ARCHITECTURE_README.md](./AI_META_ARCHITECTURE_README.md) for detailed documentation.
