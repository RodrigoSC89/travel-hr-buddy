# PATCHES 236-240: Quick Reference

## 🎯 Quick Start

### AI Performance Monitoring
```tsx
// Import and use Performance Monitor
import { PerformanceMonitor } from '@/components/ai/PerformanceMonitor';
<PerformanceMonitor />

// Import and use Behavioral Evolution Dashboard
import { BehavioralEvolutionDashboard } from '@/components/ai/evolution/BehavioralEvolutionDashboard';
<BehavioralEvolutionDashboard />
```

### XR Copilot (Experimental)
```tsx
import { XRCopilot } from '@/experimental/xr/XRCopilot';
import { XRProvider } from '@/xr/core/XRContext';

<XRProvider>
  <XRCopilot experimentalMode={true} />
</XRProvider>
```

## 📁 File Structure

```
src/
├── components/ai/
│   ├── PerformanceMonitor.tsx          # AI performance dashboard
│   └── evolution/
│       └── BehavioralEvolutionDashboard.tsx  # Evolution tracking
├── ai/
│   ├── multimodal/
│   │   ├── intentEngine.ts             # Voice+gesture+text intent
│   │   └── contextualAdapter.ts        # Context-aware responses
│   └── vision/
│       └── copilotVision.ts            # OCR + object detection
├── xr/
│   ├── core/
│   │   ├── XRContext.tsx               # WebXR state management
│   │   └── XRRoot.tsx                  # 3D canvas with XR
│   └── simulation/
│       └── Scenario3D.tsx              # 3D ship/drone simulation
└── experimental/xr/
    ├── XRCopilot.tsx                   # Main copilot component
    ├── inputs/
    │   └── GestureProcessor.ts         # MediaPipe hand tracking
    └── outputs/
        └── VoiceFeedback.ts            # Speech synthesis

supabase/migrations/
└── 20251027000000_create_ia_performance_monitoring.sql
```

## 🗄️ Database Tables

### Query Examples

```sql
-- Get performance metrics by module
SELECT module_name, 
       AVG(precision_score) as avg_precision,
       AVG(recall_score) as avg_recall,
       AVG(response_time_ms) as avg_response_time
FROM ia_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY module_name;

-- Get crew suggestion acceptance rate
SELECT module_name,
       COUNT(*) as total_suggestions,
       SUM(CASE WHEN accepted_by_crew THEN 1 ELSE 0 END) as accepted,
       ROUND(100.0 * SUM(CASE WHEN accepted_by_crew THEN 1 ELSE 0 END) / COUNT(*), 2) as acceptance_rate
FROM ia_suggestions_log
GROUP BY module_name;

-- Get active watchdog alerts
SELECT * FROM watchdog_behavior_alerts
WHERE resolved = false
ORDER BY severity DESC, created_at DESC;
```

## 🔌 API Usage

### Intent Engine
```typescript
import { intentEngine } from '@/ai/multimodal/intentEngine';

// Voice command
await intentEngine.processVoiceCommand(
  (transcript) => console.log(transcript)
);

// Text query
const intent = await intentEngine.processTextQuery('Show dashboard');

// Gesture input
const gestureIntent = await intentEngine.processGesture({
  type: 'pointing',
  confidence: 0.9,
  data: { /* gesture data */ }
});
```

### Copilot Vision
```typescript
import { copilotVision } from '@/ai/vision/copilotVision';

// Analyze image
const context = await copilotVision.analyzeVisualInput(imageElement);

// Continuous video analysis
const stop = await copilotVision.startContinuousAnalysis(
  videoElement,
  (context) => {
    console.log('Objects:', context.detectedObjects);
    console.log('Text:', context.extractedText);
  },
  2000
);

// Stop analysis
stop();
```

### Gesture Processor
```typescript
import { gestureProcessor } from '@/experimental/xr/inputs/GestureProcessor';

await gestureProcessor.startRecognition(
  videoElement,
  (gesture) => {
    console.log('Gesture:', gesture.type);
    console.log('Confidence:', gesture.confidence);
  }
);

gestureProcessor.stopRecognition();
```

### Voice Feedback
```typescript
import { voiceFeedback } from '@/experimental/xr/outputs/VoiceFeedback';

// Basic speech
await voiceFeedback.speak('Hello, how can I help?');

// With emotion
await voiceFeedback.speakWithEmotion('Critical alert!', 'critical');

// With overlay
await voiceFeedback.speakWithOverlay('Processing complete', {
  backgroundColor: 'rgba(34, 197, 94, 0.9)',
  duration: 3000
});

// Control
voiceFeedback.stop();
voiceFeedback.pause();
voiceFeedback.resume();
```

### Contextual Adapter
```typescript
import { contextualAdapter } from '@/ai/multimodal/contextualAdapter';

const response = await contextualAdapter.adaptResponse(
  intent,
  {
    visual: visualContext,
    gestural: gestureData,
    currentEnvironment: 'xr',
    history: recentActions
  }
);

console.log('Response:', response.content);
console.log('Modality:', response.modality);
console.log('Urgency:', response.urgency);
```

## 🎨 Component Props

### PerformanceMonitor
```typescript
// No props - fully self-contained
<PerformanceMonitor />
```

### BehavioralEvolutionDashboard
```typescript
// No props - fully self-contained
<BehavioralEvolutionDashboard />
```

### XRCopilot
```typescript
interface XRCopilotProps {
  experimentalMode?: boolean;  // Show experimental badge
}

<XRCopilot experimentalMode={true} />
```

### XRRoot
```typescript
interface XRRootProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showControls?: boolean;
}

<XRRoot showControls={true}>
  <Scenario3D />
</XRRoot>
```

### Scenario3D
```typescript
interface Scenario3DProps {
  onAIAction?: (action: AIAction) => void;
  autoSimulate?: boolean;
}

<Scenario3D 
  autoSimulate={true}
  onAIAction={(action) => console.log(action)}
/>
```

## 🔧 Configuration

### Environment Variables
```bash
# No new environment variables required
# Uses existing Supabase configuration
```

### Feature Flags
```typescript
// Enable/disable experimental features
const EXPERIMENTAL_XR_ENABLED = true;
const EXPERIMENTAL_GESTURE_ENABLED = true;
const EXPERIMENTAL_VISION_ENABLED = true;
```

## 📊 Monitoring

### Performance Metrics
```typescript
// All modules automatically log to ia_performance_log
{
  module_name: 'multimodal_intent_engine',
  operation_type: 'intent_classification',
  precision_score: 0.95,
  recall_score: 0.92,
  response_time_ms: 150,
  decision_accepted: true
}
```

### Suggestion Tracking
```typescript
// Logged to ia_suggestions_log
{
  module_name: 'copilot_vision',
  suggestion_type: 'object_identification',
  suggestion_content: 'Detected vessel ahead',
  confidence_score: 0.88,
  accepted_by_crew: true
}
```

### Watchdog Alerts
```typescript
// Logged to watchdog_behavior_alerts
{
  alert_type: 'behavioral_mutation',
  severity: 'high',
  module_name: 'tactical_ai',
  behavior_mutation: 'Decision pattern deviated from norm',
  resolved: false
}
```

## 🚨 Common Issues & Solutions

### Issue: Camera not starting
```typescript
// Solution: Check browser permissions
navigator.permissions.query({ name: 'camera' }).then(result => {
  console.log('Camera permission:', result.state);
});
```

### Issue: Gesture recognition not working
```typescript
// Solution: Ensure MediaPipe assets are accessible
// Check browser console for CDN loading errors
// Verify camera feed is active
```

### Issue: Voice recognition not responding
```typescript
// Solution: Check Web Speech API support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('Speech recognition supported');
} else {
  console.log('Speech recognition not supported');
}
```

### Issue: 3D scene not rendering
```typescript
// Solution: Check Three.js compatibility
import * as THREE from 'three';
console.log('Three.js version:', THREE.REVISION);
// Ensure WebGL is available
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL available:', !!gl);
```

## 🔗 Related Documentation

- Full implementation details: `PATCHES_236_240_IMPLEMENTATION.md`
- AI Engine guide: `AI_ENGINE_IMPLEMENTATION_GUIDE.md`
- System Watchdog: `SYSTEM_WATCHDOG_UI_GUIDE.md`
- WebXR specification: https://immersiveweb.dev/
- MediaPipe Hands: https://google.github.io/mediapipe/solutions/hands
- TensorFlow.js: https://www.tensorflow.org/js
- Tesseract.js: https://tesseract.projectnaptha.com/

## ⚡ Performance Tips

1. **Vision Analysis**: Use 2-3 second intervals, not real-time
2. **Gesture Recognition**: Requires 30fps camera feed
3. **3D Rendering**: Enable hardware acceleration
4. **Database Logs**: Batch inserts for high frequency
5. **Model Loading**: Cache TensorFlow models after first load

## 🎯 Next Steps

1. Test camera access on target devices
2. Configure performance monitoring dashboards
3. Set up System Watchdog integration
4. Train team on XR Copilot usage
5. Monitor performance metrics
6. Collect user feedback
7. Iterate on gesture recognition accuracy
