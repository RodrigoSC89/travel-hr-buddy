# Quick Start Guide: Interoperability System (PATCHES 226-230)

## 5-Minute Quick Start

### 1. Import the Modules

```typescript
import * as protocolAdapter from '@/core/interop/protocolAdapter';
import * as agentSwarm from '@/ai/agentSwarmBridge';
import * as jointTasking from '@/modules/missions/jointTasking';
import * as trustChecker from '@/security/trustComplianceChecker';
```

### 2. Process External Message (Protocol Adapter)

```typescript
// Example: Process JSON-RPC message
const message = {
  protocol: 'json-rpc' as const,
  direction: 'inbound' as const,
  sourceSystem: 'external-api',
  payload: {
    jsonrpc: '2.0',
    method: 'getStatus',
    params: { vesselId: 'V001' },
    id: 1
  }
};

const result = await protocolAdapter.processMessage(message);
console.log('✅ Message processed:', result);
```

### 3. Register and Use AI Agent (Agent Swarm)

```typescript
// Register an AI agent
await agentSwarm.registerAgent({
  id: 'gpt-agent-1',
  type: 'llm',
  name: 'GPT Analysis Agent',
  capabilities: ['text-analysis', 'data-processing'],
  status: 'active'
});

// Create and execute tasks
const tasks = [{
  id: 'analyze-1',
  type: 'text-analysis',
  payload: { text: 'Sample data to analyze...' },
  requiredCapabilities: ['text-analysis'],
  priority: 1,
  status: 'pending' as const
}];

const consolidated = await agentSwarm.orchestrateSwarm(tasks);
console.log('✅ Tasks completed:', consolidated.successful);
```

### 4. Create and Manage Mission (Joint Tasking)

```typescript
// Create a mission
const { success, missionId } = await jointTasking.createMission({
  name: 'Maritime Surveillance Alpha',
  type: 'surveillance',
  status: 'planning',
  priority: 'high',
  tasks: [],
  externalEntities: [{
    id: 'vessel-1',
    type: 'vessel',
    name: 'Patrol Boat Alpha',
    protocol: 'ais',
    capabilities: ['surveillance'],
    status: 'available'
  }],
  internalSystems: ['radar-1', 'comms-1']
});

console.log('✅ Mission created:', missionId);
```

### 5. Check Trust & Security (Trust Checker)

```typescript
// Evaluate trust before accepting external input
const evaluation = await trustChecker.evaluateTrust(
  'external-partner-1',
  'json-rpc',
  { jsonrpc: '2.0', method: 'getData', id: 1 }
);

if (evaluation.trustScore > 70) {
  console.log('✅ Trusted source - proceed');
} else {
  console.warn('⚠️  Low trust score:', evaluation.trustScore);
  console.log('Alerts:', evaluation.alerts);
}
```

### 6. Display Dashboard (React Component)

```tsx
import InteropDashboard from '@/components/InteropDashboard';

function App() {
  return (
    <div className="container mx-auto p-6">
      <InteropDashboard />
    </div>
  );
}
```

## Common Use Cases

### Use Case 1: Receive and Process External API Call

```typescript
async function handleExternalAPI(request: any) {
  // Step 1: Check trust
  const trust = await trustChecker.evaluateTrust(
    request.sourceSystem,
    'json-rpc',
    request.payload,
    request.ip
  );
  
  if (trust.trustScore < 50) {
    return { error: 'Insufficient trust level' };
  }
  
  // Step 2: Process message
  const result = await protocolAdapter.processMessage({
    protocol: 'json-rpc',
    direction: 'inbound',
    sourceSystem: request.sourceSystem,
    payload: request.payload,
    trustScore: trust.trustScore
  });
  
  return result;
}
```

### Use Case 2: Coordinate Multi-Agent Task

```typescript
async function analyzeDataWithAgents(data: any[]) {
  // Register agents if not already registered
  const agents = [
    { id: 'agent-1', type: 'analyzer', name: 'Data Analyzer', capabilities: ['data-analysis'] },
    { id: 'agent-2', type: 'llm', name: 'Text Processor', capabilities: ['text-processing'] }
  ];
  
  for (const agent of agents) {
    await agentSwarm.registerAgent({ ...agent, status: 'active' });
  }
  
  // Create tasks
  const tasks = data.map((item, i) => ({
    id: `task-${i}`,
    type: 'data-analysis',
    payload: item,
    requiredCapabilities: ['data-analysis'],
    priority: 1,
    status: 'pending' as const
  }));
  
  // Execute in parallel
  const result = await agentSwarm.orchestrateSwarm(tasks);
  return result.consolidatedData;
}
```

### Use Case 3: Create Joint Mission with External Sync

```typescript
async function setupJointOperation() {
  // Create mission
  const { missionId } = await jointTasking.createMission({
    name: 'Joint Rescue Operation',
    type: 'rescue',
    status: 'planning',
    priority: 'critical',
    tasks: [],
    externalEntities: [
      {
        id: 'vessel-rescue-1',
        type: 'vessel',
        name: 'Rescue Boat 1',
        protocol: 'ais',
        capabilities: ['rescue', 'medical'],
        status: 'available'
      },
      {
        id: 'aircraft-1',
        type: 'aircraft',
        name: 'Helicopter Alpha',
        protocol: 'nato-stanag',
        capabilities: ['rescue', 'air-support'],
        status: 'available'
      }
    ],
    internalSystems: ['emergency-dispatch', 'medical-center'],
    commander: 'Cmdr. Johnson'
  });
  
  // Get mission and divide into tasks
  const mission = await jointTasking.getMission(missionId!);
  if (mission) {
    const tasks = jointTasking.divideMission(mission, 'capability');
    
    // Map tasks to entities
    const mapping = jointTasking.mapTasksToEntities(tasks, mission.externalEntities);
    
    // Sync with external systems
    const syncResult = await jointTasking.syncMissionStatus(mission);
    console.log('Sync result:', syncResult);
  }
}
```

## Environment Setup

### Prerequisites

```bash
# Install dependencies (if not already installed)
npm install

# Ensure database migrations are applied
# (migrations are in supabase/migrations/20251026220000_patch_226_230_interop_system.sql)
```

### Environment Variables

No additional environment variables required - uses existing Supabase configuration.

## Testing Your Implementation

```bash
# Run all tests
npm run test -- --run tests/patches-226-230.test.ts

# Type check
npm run type-check

# Build
npm run build
```

## Next Steps

1. **Customize Trust Thresholds**: Adjust trust scoring logic in `trustComplianceChecker.ts`
2. **Add Custom Protocols**: Extend `protocolAdapter.ts` with your own protocol parsers
3. **Register Your Agents**: Add your AI agents to the swarm
4. **Create Missions**: Start creating and tracking joint missions
5. **Monitor Dashboard**: Use the InteropDashboard to monitor operations

## Troubleshooting

### "No capable agents available"
- Register agents with matching capabilities
- Check agent status with `agentSwarm.getActiveAgents()`

### "Message rejected: validation failed"
- Verify payload matches protocol schema
- Check validation errors in console logs

### "Low trust score"
- Add trusted sources to whitelist: `trustChecker.addToWhitelist('source-name')`
- Review trust evaluation details in database

## Best Practices

1. ✅ Always check trust before processing external messages
2. ✅ Register agents at application startup
3. ✅ Use appropriate mission priorities
4. ✅ Monitor trust_events table for security issues
5. ✅ Keep whitelist/blacklist updated
6. ✅ Handle task failures gracefully
7. ✅ Use proper error handling for async operations

## Resources

- Full Documentation: `PATCHES_226_230_INTEROP_SYSTEM.md`
- Tests: `tests/patches-226-230.test.ts`
- Database Schema: `supabase/migrations/20251026220000_patch_226_230_interop_system.sql`

## Support

For questions or issues:
1. Check the full documentation
2. Review test examples
3. Check database logs in Supabase
4. Contact the development team
