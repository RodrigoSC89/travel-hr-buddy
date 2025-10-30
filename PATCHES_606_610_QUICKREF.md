# PATCHES 606-610: Quick Reference Guide

## 🚀 Quick Import

```typescript
import {
  // Visual Awareness
  visualAwarenessEngine,
  
  // Anomaly Detection
  anomalyDetector,
  
  // Voice Commands
  voiceCommandCore,
  
  // Tactical Fallback
  tacticalFallback,
  
  // Voice Feedback
  voiceFeedbackReporter,
  
  // Initialize all
  initializeAIVoiceSystems
} from '@/patches-606-610';
```

---

## 📦 Module Locations

| Patch | Module | Path |
|-------|--------|------|
| 606 | Visual Awareness | `/src/ai/visual/awareness-engine.ts` |
| 607 | Anomaly Detector | `/src/ai/anomaly/pattern-detector.ts` |
| 608 | Voice Commands | `/src/assistants/voice/distributed-commands.ts` |
| 609 | Tactical Fallback | `/src/assistants/voice/tactical-fallback.ts` |
| 610 | Voice Feedback | `/src/assistants/voice/voice-feedback.ts` |

---

## ⚡ One-Liner Commands

### Initialize All Systems
```typescript
const systems = await initializeAIVoiceSystems();
```

### Visual Alert
```typescript
const alerts = await visualAwarenessEngine.analyzeContext({ source: 'dashboard', dashboardMetrics: { cpu: 95 }, timestamp: new Date().toISOString() });
```

### Detect Anomaly
```typescript
const anomalies = await anomalyDetector.detectAnomalies({ name: 'cpu', value: 95, timestamp: new Date().toISOString(), source: 'monitor' });
```

### Voice Command
```typescript
const result = await voiceCommandCore.processCommand("open dashboard");
```

### Emergency Command
```typescript
const execution = await tacticalFallback.processTacticalCommand("emergency stop");
```

### Voice Feedback
```typescript
await voiceFeedbackReporter.provideFeedback('confirmation', { action: 'Save' }, { immediate: true });
```

---

## 📊 Key Metrics

### Visual Awareness
```typescript
const metrics = visualAwarenessEngine.getPerformanceMetrics();
// metrics.fps, metrics.alertsGenerated, metrics.patternsDetected
```

### Anomaly Detection
```typescript
const stats = anomalyDetector.getPerformanceStats();
// stats.accuracy, stats.precision, stats.totalDetections
```

### Voice Feedback
```typescript
const metrics = voiceFeedbackReporter.getMetrics();
// metrics.avgClarity, metrics.successRate, metrics.totalFeedbacks
```

---

## 🎯 Common Use Cases

### 1. Monitor Dashboard + Alert User
```typescript
// Analyze visual context
const alerts = await visualAwarenessEngine.analyzeContext({
  source: 'dashboard',
  dashboardMetrics: { cpuUsage: 95, memoryUsage: 87 },
  timestamp: new Date().toISOString()
});

// Notify via voice if critical
if (alerts.some(a => a.type === 'critical')) {
  await voiceFeedbackReporter.provideFeedback(
    'warning',
    { warning: 'Critical system alert', recommendation: 'Check immediately' },
    { voiceProfile: 'urgent', immediate: true }
  );
}
```

### 2. Train Anomaly Detector
```typescript
// Collect normal samples
const normalCPU = [45, 48, 50, 47, 52, 49, 51, 48, 46, 50];

// Train
await anomalyDetector.trainOnNormalBehavior('cpu_usage', normalCPU);

// Detect
const anomalies = await anomalyDetector.detectAnomalies({
  name: 'cpu_usage',
  value: 95,
  timestamp: new Date().toISOString(),
  source: 'system'
});
```

### 3. Register Custom Voice Command
```typescript
voiceCommandCore.registerModule({
  moduleId: 'custom',
  moduleName: 'Custom Module',
  supportedIntents: ['action'],
  priority: 7,
  enabled: true,
  commands: [{
    name: 'custom_action',
    intent: 'action',
    patterns: ['do custom action', 'run custom'],
    parameters: [],
    requiredParams: [],
    handler: 'handleCustomAction',
    examples: ['Do custom action'],
    offlineSupported: true
  }]
});
```

### 4. Emergency Shutdown Sequence
```typescript
// Issue emergency command
const execution = await tacticalFallback.processTacticalCommand("emergency stop");

// Confirm via voice
await voiceFeedbackReporter.provideFeedback(
  'confirmation',
  { action: 'Emergency stop', status: 'executed' },
  { voiceProfile: 'urgent', immediate: true }
);
```

### 5. Status Check Workflow
```typescript
// Voice command
const result = await voiceCommandCore.processCommand("system status");

// Get metrics
const visualMetrics = visualAwarenessEngine.getPerformanceMetrics();
const anomalyStats = anomalyDetector.getPerformanceStats();

// Provide summary
await voiceFeedbackReporter.provideFeedback(
  'summary',
  {
    status: 'operational',
    visualFPS: visualMetrics.fps.toFixed(1),
    anomalyAccuracy: (anomalyStats.accuracy * 100).toFixed(1)
  },
  { voiceProfile: 'professional' }
);
```

---

## 🔧 Configuration Examples

### Visual Awareness Patterns
```typescript
visualAwarenessEngine.setPattern({
  id: 'custom-pattern',
  name: 'Custom Alert Pattern',
  type: 'metric_spike',
  threshold: 0.9,
  enabled: true,
  alertLevel: 'warning'
});
```

### Anomaly Detector Sensitivity
```typescript
const detector = new AnomalyPatternDetector({
  sensitivityLevel: 'high',
  minSamplesForTraining: 30,
  outlierThreshold: 2.5,
  confidenceThreshold: 0.8
});
```

### Voice Feedback Template
```typescript
voiceFeedbackReporter.addTemplate({
  type: 'completion',
  template: 'Process {processName} finished in {duration} seconds with {result}.',
  voiceProfile: 'professional',
  variables: ['processName', 'duration', 'result']
});
```

### TTS Configuration
```typescript
voiceFeedbackReporter.configureTTS({
  rate: 1.0,
  pitch: 1.0,
  volume: 0.9,
  language: 'en-US'
});
```

---

## 🎭 Voice Profiles

| Profile | Rate | Pitch | Volume | Use Case |
|---------|------|-------|--------|----------|
| professional | 1.0 | 1.0 | 0.9 | Standard operations |
| casual | 1.1 | 1.1 | 0.9 | Friendly interactions |
| urgent | 1.2 | 1.2 | 1.0 | Critical alerts |
| technical | 0.9 | 0.95 | 0.85 | Detailed information |

---

## 🚨 Emergency Commands

| Command | Trigger | Confirmation | Offline |
|---------|---------|--------------|---------|
| Emergency Stop | "emergency stop" | Yes | Yes |
| System Restart | "restart system" | Yes | Yes |
| Alert Broadcast | "broadcast alert" | No | Yes |
| Manual Override | "manual override" | Yes | Yes |
| Status Check | "check status" | No | Yes |
| Backup Activate | "activate backup" | No | Yes |
| Safe Mode | "safe mode" | No | Yes |
| System Recovery | "recover system" | Yes | Yes |

---

## 📋 Pre-registered Modules

| Module | Commands | Intents | Example |
|--------|----------|---------|---------|
| Dashboard | 2 | navigation, action | "open dashboard" |
| Navigation | 1 | navigation | "go to reports" |
| Reports | 1 | report | "generate report" |
| AI Assistant | 1 | query | "ask question" |
| System | 2 | query, emergency | "check system" |
| Monitoring | 1 | query | "show metrics" |

---

## 🐛 Quick Troubleshooting

### No Visual Alerts
- Check `visualAwarenessEngine.isInitialized`
- Verify pattern thresholds
- Ensure valid context data

### Anomaly Not Detected
- Need ≥50 training samples
- Check sensitivity level
- Verify metric values

### Voice Command Failed
- Check module registration
- Verify command patterns
- Test offline mode

### No Voice Output
- Verify browser TTS support
- Check audio permissions
- Test with `voiceFeedbackReporter.stopSpeaking()` first

### Tactical Command Not Working
- Confirm watchdog connection
- Check offline mode status
- Verify command triggers

---

## 📝 Logging Queries

### Get Recent Visual Alerts
```typescript
const alerts = visualAwarenessEngine.getRecentAlerts(10);
```

### Get Anomaly Detections by Severity
```typescript
const critical = anomalyDetector.getDetectionsBySeverity('critical');
```

### Get Voice Command History
```typescript
const history = voiceCommandCore.getExecutionHistory(20);
```

### Get Tactical Executions
```typescript
const executions = tacticalFallback.getExecutionHistory(10);
```

### Get Voice Feedback by Type
```typescript
const confirmations = voiceFeedbackReporter.getFeedbackByType('confirmation');
```

---

## 🔑 Key Interfaces

### VisualAlert
```typescript
{ id, type, source, pattern, description, confidence, timestamp, actionable, recommendations }
```

### AnomalyDetection
```typescript
{ id, type, severity, metric, value, expectedRange, deviation, confidence, description, recommendations }
```

### CommandResult
```typescript
{ commandId, status, result, error?, executionTime, timestamp }
```

### FallbackExecution
```typescript
{ commandId, commandType, trigger, status, result, timestamp, executionTime, watchdogNotified }
```

### VoiceFeedback
```typescript
{ id, type, message, context, voiceProfile, priority, timestamp, spoken, clarity }
```

---

## ✅ Acceptance Criteria Checklist

- [x] **606**: Visual alerts, contextual, >20 FPS
- [x] **607**: >85% accuracy, categorized, exportable
- [x] **608**: ≥5 modules, logged, fallback available
- [x] **609**: UI-independent, logged, watchdog integrated
- [x] **610**: >95% clarity, contextual, logged

---

## 🎓 Best Practices

1. ✅ Initialize systems at app startup
2. ✅ Use appropriate voice profiles for context
3. ✅ Train anomaly detector regularly
4. ✅ Monitor performance metrics
5. ✅ Review logs periodically
6. ✅ Test offline functionality
7. ✅ Handle errors gracefully

---

## 📞 Quick Help

**Error?** → Check console logs
**Slow?** → Check performance metrics
**Offline?** → Verify offline mode status
**Silent?** → Check TTS configuration

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
