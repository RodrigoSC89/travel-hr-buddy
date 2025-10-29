# Mission Intelligence System (Patches 596-600)

## Overview

The Mission Intelligence System is a comprehensive AI-powered solution for mission monitoring, analysis, and optimization. It consists of five interconnected modules that work together to provide real-time awareness, pattern recognition, and intelligent decision support.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Global Mission Awareness Dashboard              │
│                    (PATCH 600)                          │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   Pattern      │  │   Mission    │  │    Signal      │
│   Engine       │  │   Replay     │  │   Collector    │
│  (PATCH 598)   │  │ (PATCH 599)  │  │  (PATCH 597)   │
└────────────────┘  └──────────────┘  └────────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                ┌──────────▼──────────┐
                │  Intelligence Core  │
                │    (PATCH 596)      │
                └─────────────────────┘
                           │
                ┌──────────▼──────────┐
                │  Supabase Database  │
                │   + localStorage    │
                └─────────────────────┘
```

## Modules

### PATCH 596 - Persistent Mission Intelligence Core

**Purpose**: Retain contextual information across multiple sessions/missions.

**Features**:
- Mission context persistence (Supabase + localStorage)
- Pattern recognition across sessions
- AI-driven decision suggestions
- Offline capability with local caching

**Key Functions**:
```typescript
// Initialize or restore mission
await intelligenceCore.initializeMission(missionId);

// Add decision
await intelligenceCore.addDecision(missionId, decision, outcome, confidence);

// Learn pattern
await intelligenceCore.learnPattern(missionId, pattern, frequency, successRate);

// Get AI suggestions
const suggestions = await intelligenceCore.getSuggestions(missionId);
```

**Database Tables**:
- `mission_intelligence`: Stores mission context, decisions, and learned patterns

### PATCH 597 - Situational Signal Collector

**Purpose**: Collect operational situational signals from various sources.

**Signal Types**:
- **Voice**: Communication transcripts, volume, clarity
- **Climate**: Temperature, humidity, pressure
- **Sensor**: Equipment readings, status data
- **Navigation**: GPS coordinates, speed, heading

**Key Functions**:
```typescript
// Collect signal
await signalCollector.collectSignal(missionId, {
  type: "voice",
  data: { transcript: "All clear", volume: 80, clarity: 0.9 }
});

// Get signal statistics
const stats = await signalCollector.getSignalStats(missionId);

// Real-time streaming
signalCollector.startStreaming(5000); // Poll every 5 seconds
signalCollector.onSignal("voice", (signal) => {
  console.log("New voice signal:", signal);
});
```

**Database Tables**:
- `situational_signals`: Stores raw and normalized signal data

### PATCH 598 - Global Pattern Recognition Engine

**Purpose**: Recognize patterns in mission operations, failures, and successes.

**Pattern Types**:
- **Failure**: Indicators of potential problems
- **Success**: Proven operational approaches
- **Anomaly**: Unusual behavior or missing data
- **Warning**: Early problem indicators

**Key Functions**:
```typescript
// Analyze mission for patterns
const patterns = await patternEngine.analyzeAndDetectPatterns(missionId);

// Get patterns with filters
const failurePatterns = await patternEngine.getPatterns("failure", "emergency", 0.7);

// Emit alert
const alert = await patternEngine.emitAlert(pattern);
```

**Database Tables**:
- `mission_patterns`: Stores detected patterns with confidence scores

### PATCH 599 - Mission Replay Annotator

**Purpose**: Replay missions with automatic AI annotations.

**Features**:
- Timeline with critical events
- AI-powered automatic comments
- PDF/JSON export capability
- Insight generation for training

**Key Functions**:
```typescript
// Record event
await replayAnnotator.recordEvent(missionId, "critical", {
  description: "Emergency situation",
  timestamp: new Date().toISOString()
});

// Build replay
const replay = await replayAnnotator.buildReplay(missionId);

// Export
const json = await replayAnnotator.exportToJSON(replay);
const text = await replayAnnotator.exportToText(replay);
```

**Database Tables**:
- `mission_replay_events`: Stores events with AI annotations and insights

### PATCH 600 - Global Mission Awareness Dashboard

**Purpose**: Visual interface for global mission awareness.

**Features**:
- Real-time mission status tracking
- Pattern visualization
- Alert management
- Regional comparison
- Mission drill-down
- WebSocket live updates

**Views**:
- **Missions**: All missions with status and details
- **Patterns**: Detected patterns across all missions
- **Alerts**: Active alerts with severity levels
- **Regions**: Regional statistics and comparisons

**Usage**:
```typescript
import GlobalMissionAwarenessDashboard from '@/pages/dashboard/global-mission-awareness';

// Use in your router
<Route path="/dashboard/missions" element={<GlobalMissionAwarenessDashboard />} />
```

## Quick Start

### 1. Install and Setup

The system is automatically available after installation. Ensure Supabase is configured with the migration:

```bash
# Migration is at: supabase/migrations/20251029200000_create_mission_intelligence_tables.sql
```

### 2. Basic Usage

```typescript
import { 
  intelligenceCore, 
  signalCollector, 
  patternEngine,
  replayAnnotator 
} from '@/ai/mission-intelligence-system';

// Initialize mission
const context = await intelligenceCore.initializeMission('mission-001');

// Collect signal
await signalCollector.collectSignal('mission-001', {
  type: 'voice',
  data: { transcript: 'All systems go', volume: 80, clarity: 0.9 }
});

// Record decision
await intelligenceCore.addDecision('mission-001', 'Deploy team', 'success', 0.9);

// Analyze patterns
const patterns = await patternEngine.analyzeAndDetectPatterns('mission-001');

// Record event
await replayAnnotator.recordEvent('mission-001', 'success', {
  description: 'Mission completed'
});
```

### 3. Complete Workflow Example

```typescript
import { runCompleteWorkflow } from '@/ai/mission-intelligence-system';

// Run complete workflow for a mission
const results = await runCompleteWorkflow('mission-demo-001');
console.log('Mission analysis complete:', results);
```

### 4. Health Check

```typescript
import { systemHealthCheck } from '@/ai/mission-intelligence-system';

// Check system health
const health = await systemHealthCheck();
```

## Integration Examples

### Example 1: Real-time Mission Monitoring

```typescript
// Initialize mission
await intelligenceCore.initializeMission('mission-001');

// Start collecting signals in real-time
signalCollector.startStreaming(5000);

// Subscribe to voice signals
signalCollector.onSignal('voice', async (signal) => {
  console.log('Voice signal received:', signal.normalized_data.value);
  
  // Record as replay event
  await replayAnnotator.recordEvent('mission-001', 'info', {
    description: `Voice: ${signal.normalized_data.value}`,
    timestamp: signal.timestamp
  });
});
```

### Example 2: Pattern-Based Alerts

```typescript
// Analyze mission periodically
setInterval(async () => {
  const patterns = await patternEngine.analyzeAndDetectPatterns('mission-001');
  
  for (const pattern of patterns) {
    if (pattern.confidence_score > 0.8) {
      const alert = await patternEngine.emitAlert(pattern);
      
      // Send notification
      if (alert.severity === 'critical') {
        notifyTeam(alert);
      }
    }
  }
}, 60000); // Every minute
```

### Example 3: Mission Replay for Training

```typescript
// After mission completion
const replay = await replayAnnotator.buildReplay('mission-001');

if (replay) {
  // Export for training
  const textExport = await replayAnnotator.exportToText(replay);
  
  // Save to file or send via email
  saveTrainingMaterial(textExport);
  
  // Analyze insights
  console.log('Mission Insights:', replay.ai_insights);
}
```

## Database Schema

### mission_intelligence
```sql
- id: UUID (PK)
- mission_id: TEXT (Unique)
- context: JSONB
- decisions: JSONB[]
- patterns_learned: JSONB[]
- session_count: INTEGER
- last_session_at: TIMESTAMPTZ
```

### situational_signals
```sql
- id: UUID (PK)
- mission_id: TEXT
- signal_type: TEXT (voice|climate|sensor|navigation)
- raw_data: JSONB
- normalized_data: JSONB
- timestamp: TIMESTAMPTZ
- metadata: JSONB
```

### mission_patterns
```sql
- id: UUID (PK)
- pattern_type: TEXT (failure|success|anomaly|warning)
- pattern_data: JSONB
- mission_types: TEXT[]
- occurrences: INTEGER
- confidence_score: NUMERIC(3,2)
- preventive_actions: JSONB[]
```

### mission_replay_events
```sql
- id: UUID (PK)
- mission_id: TEXT
- event_type: TEXT (critical|warning|info|success)
- event_data: JSONB
- ai_annotation: TEXT
- ai_insights: JSONB[]
- timestamp: TIMESTAMPTZ
```

### global_mission_status
```sql
- id: UUID (PK)
- mission_id: TEXT (Unique)
- mission_name: TEXT
- status: TEXT (active|completed|failed|paused)
- mission_type: TEXT
- region: TEXT
- location_data: JSONB
- metrics: JSONB
- alerts: JSONB[]
```

## API Reference

### Intelligence Core
- `initializeMission(missionId)`: Initialize or restore mission
- `addDecision(missionId, decision, outcome, confidence)`: Record decision
- `learnPattern(missionId, pattern, frequency, successRate)`: Learn pattern
- `getSuggestions(missionId)`: Get AI suggestions

### Signal Collector
- `collectSignal(missionId, rawSignal)`: Collect and store signal
- `getSignals(missionId, signalType?, limit?)`: Fetch signals
- `getSignalStats(missionId)`: Get statistics
- `startStreaming(intervalMs)`: Start real-time streaming
- `onSignal(signalType, callback)`: Subscribe to signals

### Pattern Engine
- `analyzeAndDetectPatterns(missionId)`: Analyze and detect patterns
- `getPatterns(patternType?, missionType?, minConfidence?)`: Fetch patterns
- `emitAlert(pattern)`: Generate alert from pattern

### Replay Annotator
- `recordEvent(missionId, eventType, eventData)`: Record event
- `buildReplay(missionId, startTime?, endTime?)`: Build replay
- `exportToJSON(replay)`: Export as JSON
- `exportToText(replay)`: Export as text
- `getRecentEvents(missionId, limit?)`: Get recent events

## Performance Considerations

- **Caching**: Intelligence core uses localStorage for offline access
- **Streaming**: Signal collector supports configurable polling intervals
- **Pagination**: All data fetching supports limits and pagination
- **Real-time**: Dashboard uses Supabase WebSocket for live updates
- **Indexes**: Database tables have proper indexes for performance

## Security

- **RLS Policies**: All tables have Row Level Security enabled
- **Authentication**: Requires authenticated Supabase user
- **Validation**: Input validation on all data entry points
- **Sanitization**: AI-generated content is sanitized

## Testing

Run tests:
```bash
npm run test __tests__/patches-596-600.test.ts
```

Run demonstrations:
```typescript
import { 
  demonstrateIntelligenceCore,
  demonstrateSituationalCollector,
  demonstratePatternEngine,
  demonstrateReplayAnnotator
} from '@/ai/mission-intelligence-system';

// Run individual demos
await demonstrateIntelligenceCore();
await demonstrateSituationalCollector();
await demonstratePatternEngine();
await demonstrateReplayAnnotator();
```

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify Supabase connection and migrations
3. Ensure proper authentication
4. Review database RLS policies

## Future Enhancements

- Machine learning model integration
- Advanced visualization with 3D maps
- Mobile app integration
- Multi-language support
- Voice command interface
- Predictive analytics
- Automated response recommendations

## License

Part of the Travel HR Buddy system.
