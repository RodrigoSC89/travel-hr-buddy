# Collective Intelligence System (PATCHES 216-220)

## Overview

The Collective Intelligence System is a comprehensive distributed AI framework that enables autonomous decision-making, system monitoring, continuous learning, and collaborative intelligence across all system modules.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Collective Dashboard                        │
│           (Unified Visualization & Control)                  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Context Mesh  │  │ Decision Core│  │ Conscious Core   │
│  (PATCH 216)  │  │ (PATCH 217)  │  │  (PATCH 218)     │
└───────────────┘  └──────────────┘  └──────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Collective Loop     │
                 │    (PATCH 219)       │
                 └──────────────────────┘
```

## Components

### PATCH 216: Context Mesh Core
**Location:** `src/core/context/contextMesh.ts`

A distributed context-sharing system that enables real-time state synchronization between modules.

**Features:**
- Pub/Sub event bus for real-time communication
- Support for 5 context types: mission, risk, AI, prediction, telemetry
- Automatic fallback to localStorage/IndexedDB when Supabase is unavailable
- Context history tracking and retrieval
- Module-to-module context synchronization

**Usage:**
```typescript
import { contextMesh } from '@/core/context/contextMesh';

// Initialize
await contextMesh.initialize();

// Publish context
await contextMesh.publish({
  moduleName: 'MyModule',
  contextType: 'mission',
  contextData: { status: 'active', progress: 0.75 },
  source: 'ModuleController'
});

// Subscribe to updates
const subscriptionId = contextMesh.subscribe({
  moduleName: 'MyModule',
  contextTypes: ['mission', 'risk'],
  handler: (message) => {
    console.log('Context update:', message);
  }
});

// Get history
const history = await contextMesh.getContextHistory('MyModule', 'mission', 50);
```

### PATCH 217: Distributed Decision Core
**Location:** `src/ai/distributedDecisionCore.ts`

Enables autonomous local decision-making with intelligent escalation for conflicts.

**Features:**
- 4 decision levels: local, escalated, delegated, collaborative
- Rule-based decision engine
- Parallel scenario simulations
- Timeout handling for collaborative decisions
- Automatic escalation when conflicts arise
- Decision audit logging to Supabase

**Usage:**
```typescript
import { distributedDecisionCore } from '@/ai/distributedDecisionCore';

// Initialize
await distributedDecisionCore.initialize();

// Register a decision rule
distributedDecisionCore.registerRule({
  id: 'high-risk-alert',
  name: 'High Risk Module Alert',
  moduleName: 'RiskMonitor',
  priority: 'high',
  condition: async (context) => {
    return context.contextData.riskLevel > 0.8;
  },
  action: async (context) => {
    return 'notify_human';
  },
  requiresEscalation: false,
  timeoutMs: 5000
});

// Make a decision
const decision = await distributedDecisionCore.makeDecision({
  moduleName: 'RiskMonitor',
  decisionType: 'risk_assessment',
  contextData: { riskLevel: 0.85, module: 'PaymentProcessor' }
});

// Get decision history
const history = await distributedDecisionCore.getDecisionHistory('RiskMonitor', 100);
```

### PATCH 218: Conscious Core
**Location:** `src/ai/consciousCore.ts`

A self-aware monitoring system that understands global state and anticipates issues.

**Features:**
- Continuous system health monitoring
- Loop detection and prevention
- Conflict detection between modules
- Failure pattern recognition
- Automatic correction attempts
- Escalation for unresolved issues

**Usage:**
```typescript
import { consciousCore } from '@/ai/consciousCore';

// Initialize and start monitoring
await consciousCore.initialize();
consciousCore.startMonitoring();

// Update module health
consciousCore.updateModuleHealth({
  moduleName: 'PaymentProcessor',
  status: 'healthy',
  lastCheck: new Date(),
  errorCount: 0,
  responseTime: 150
});

// Get system state
const state = await consciousCore.getSystemState();
console.log(`System health: ${state.overallHealth}`);
console.log(`Active modules: ${state.activeModules}/${state.totalModules}`);
console.log(`Critical issues: ${state.criticalIssues}`);

// Get active observations
const observations = consciousCore.getActiveObservations();
```

### PATCH 219: Collective Loop Engine
**Location:** `src/ai/feedback/collectiveLoop.ts`

Continuous feedback processing and learning system.

**Features:**
- 4 feedback types: human, AI, operational, system
- 6 feedback categories: accuracy, performance, suggestion, correction, rating, telemetry
- AI metrics tracking (precision, recall, F1 score, accuracy)
- Automatic learning adjustments
- Impact scoring
- Feedback aggregation and analysis

**Usage:**
```typescript
import { collectiveLoopEngine } from '@/ai/feedback/collectiveLoop';

// Initialize and start processing
await collectiveLoopEngine.initialize();
collectiveLoopEngine.startProcessing();

// Submit human feedback
await collectiveLoopEngine.submitHumanFeedback(
  'DocumentGenerator',
  'accuracy',
  4, // rating 1-5
  'Generated document was good but needed minor corrections',
  { documentType: 'contract', corrections: 2 }
);

// Submit AI feedback
await collectiveLoopEngine.submitAIFeedback(
  'TextClassifier',
  {
    precision: 0.92,
    recall: 0.88,
    f1Score: 0.90,
    accuracy: 0.89,
    latency: 150,
    successRate: 0.95
  }
);

// Get feedback summary
const summary = await collectiveLoopEngine.getFeedbackSummary('DocumentGenerator', 7);
console.log(`Total events: ${summary.totalEvents}`);
console.log(`Average rating: ${summary.averageRating}`);
console.log(`Learning applied: ${summary.learningAppliedCount}`);
```

### PATCH 220: Collective Dashboard
**Location:** `src/components/ai/CollectiveDashboard.tsx`

A comprehensive React dashboard for visualizing all collective intelligence data.

**Features:**
- System health overview with 4 key metrics
- Decision timeline showing all module decisions
- Conflict map with resolution tracking
- AI performance metrics with charts
- Collective feedback visualization
- Insights and suggestions from AI analysis
- PDF export capability

**Usage:**
```tsx
import { CollectiveDashboard } from '@/components/ai/CollectiveDashboard';

function App() {
  return (
    <div className="app">
      <CollectiveDashboard />
    </div>
  );
}
```

## Database Schema

All data is stored in Supabase with the following tables:

### context_history
Stores context messages from all modules.

### decision_log
Tracks all decisions made by modules.

### system_consciousness
Records system observations and auto-correction attempts.

### feedback_events
Stores feedback from all sources with learning results.

## Integration Example

Complete integration example showing all systems working together:

```typescript
import { 
  initializeCollectiveIntelligence,
  contextMesh,
  distributedDecisionCore,
  consciousCore,
  collectiveLoopEngine
} from '@/core';

async function setupCollectiveIntelligence() {
  // 1. Initialize all systems
  await initializeCollectiveIntelligence();

  // 2. Register decision rules
  distributedDecisionCore.registerRule({
    id: 'performance-degradation',
    name: 'Performance Degradation Handler',
    moduleName: 'APIGateway',
    priority: 'high',
    condition: async (ctx) => ctx.contextData.responseTime > 1000,
    action: async (ctx) => 'scale_up',
    requiresEscalation: false,
    timeoutMs: 3000
  });

  // 3. Subscribe to context updates
  contextMesh.subscribe({
    moduleName: 'MonitoringDashboard',
    contextTypes: ['telemetry', 'risk'],
    handler: (message) => {
      console.log('Context update:', message);
      
      // Trigger decision if needed
      if (message.contextType === 'risk' && message.contextData.level > 0.7) {
        distributedDecisionCore.makeDecision({
          moduleName: message.moduleName,
          decisionType: 'risk_mitigation',
          contextData: message.contextData
        });
      }
    }
  });

  // 4. Update module health periodically
  setInterval(() => {
    consciousCore.updateModuleHealth({
      moduleName: 'APIGateway',
      status: 'healthy',
      lastCheck: new Date(),
      errorCount: 0,
      responseTime: 120
    });
  }, 10000);

  console.log('✅ Collective Intelligence System initialized');
}

// Initialize on app startup
setupCollectiveIntelligence();
```

## API Endpoints

While the system works client-side, you can expose API endpoints for external access:

```typescript
// Example API routes (Next.js API routes)

// GET /api/collective/state
export async function GET() {
  const state = await consciousCore.getSystemState();
  return Response.json(state);
}

// GET /api/collective/decisions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module');
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const decisions = await distributedDecisionCore.getDecisionHistory(
    module || undefined,
    limit
  );
  return Response.json(decisions);
}

// POST /api/collective/feedback
export async function POST(request: Request) {
  const body = await request.json();
  
  await collectiveLoopEngine.submitHumanFeedback(
    body.module,
    body.category,
    body.rating,
    body.content,
    body.metadata
  );
  
  return Response.json({ success: true });
}
```

## Best Practices

1. **Initialize Early**: Call `initializeCollectiveIntelligence()` during app startup
2. **Update Health Regularly**: Keep module health updated for accurate monitoring
3. **Use Meaningful Context**: Provide detailed context data for better decision-making
4. **Register Rules Early**: Define decision rules during initialization
5. **Monitor Feedback**: Review feedback summaries to understand system learning
6. **Handle Escalations**: Respond to escalated decisions promptly
7. **Clean Up Old Data**: Use cleanup methods to prevent database bloat

## Performance Considerations

- Context mesh uses in-memory pub/sub for low latency
- Automatic fallback to localStorage prevents Supabase bottlenecks
- Decision simulations run in parallel for speed
- Feedback processing happens in batches
- Dashboard auto-refreshes every 10 seconds (configurable)

## Security

- All database operations use RLS (Row Level Security)
- Service role required for write operations
- Authenticated users can read all data
- Context messages can be encrypted (add encryption layer if needed)

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { contextMesh } from '@/core/context/contextMesh';

describe('Context Mesh', () => {
  it('should publish and receive context messages', async () => {
    await contextMesh.initialize();
    
    let received: any = null;
    
    contextMesh.subscribe({
      moduleName: 'TestModule',
      contextTypes: ['mission'],
      handler: (msg) => { received = msg; }
    });
    
    await contextMesh.publish({
      moduleName: 'TestModule',
      contextType: 'mission',
      contextData: { test: true },
      source: 'test'
    });
    
    expect(received).toBeTruthy();
    expect(received.contextData.test).toBe(true);
  });
});
```

## Troubleshooting

### Context mesh not receiving messages
- Check if `initialize()` was called
- Verify subscription is active
- Check browser console for errors

### Decisions not executing
- Verify rules are registered
- Check decision timeouts
- Review decision logs in Supabase

### Conscious core not detecting issues
- Ensure `startMonitoring()` was called
- Update module health regularly
- Check observation logs

### Feedback not processing
- Call `startProcessing()` on collective loop
- Verify feedback is being submitted
- Check Supabase connectivity

## Future Enhancements

- [ ] Add encryption for sensitive context data
- [ ] Implement distributed consensus for critical decisions
- [ ] Add ML model for better learning adjustments
- [ ] Create mobile-optimized dashboard
- [ ] Add real-time WebSocket updates
- [ ] Implement conflict resolution strategies
- [ ] Add A/B testing for decision rules

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check Supabase logs
4. Open a GitHub issue

## License

Part of the Travel HR Buddy project.
