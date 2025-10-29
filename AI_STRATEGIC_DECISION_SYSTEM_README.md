# AI Strategic Decision System - PATCHES 581-585

## Overview

A comprehensive AI-driven strategic decision-making system that provides predictive capabilities, scenario simulation, governance oversight, multi-agent consensus building, and executive reporting.

## Architecture

```
src/ai/
├── strategy/
│   └── predictive-engine.ts         # PATCH 581: Strategy generation
├── decision-simulator/
│   ├── index.ts                     # PATCH 582: Simulation core
│   └── SimulationVisualization.tsx  # PATCH 582: UI component
├── governance/
│   └── neural-governance.ts         # PATCH 583: Decision governance
├── agents/
│   └── consensus-builder.ts         # PATCH 584: Multi-agent consensus
├── reporting/
│   └── executive-summary.tsx        # PATCH 585: Summary generation
└── strategic-decision-system.ts     # Main export index
```

## Modules

### PATCH 581: Predictive Strategy Engine

**Purpose**: Generate AI-driven strategies based on signals from multiple sources with continuous learning.

**Key Features**:
- Receives signals from Situational Awareness, BI, sensors, and manual input
- Generates minimum 3 distinct strategies with success probabilities
- 6 strategy types: preventive, reactive, optimization, risk_mitigation, resource_allocation, emergency_response
- Continuous learning through feedback recording
- Comprehensive logging of all proposals

**Usage**:
```typescript
import { predictiveStrategyEngine } from "@/ai/strategy/predictive-engine";

// Initialize
await predictiveStrategyEngine.initialize();

// Receive signal
await predictiveStrategyEngine.receiveSignal({
  id: "signal_1",
  source: "bi_analytics",
  type: "performance_alert",
  data: { metric: "efficiency", value: 65 },
  priority: 75,
  timestamp: new Date()
});

// Generate strategies
const proposal = await predictiveStrategyEngine.generateStrategies("mission_123");
console.log(`Generated ${proposal.strategies.length} strategies`);
console.log(`Top strategy: ${proposal.topStrategy.name}`);

// Provide feedback for learning
await predictiveStrategyEngine.validateWithLearning(strategyId, {
  strategyId,
  feedback: "success",
  actualOutcome: { achieved: true, cost: 4500 },
  timestamp: new Date()
});
```

**Database Tables**:
- `ai_strategy_signals` - Received signals
- `ai_strategy_proposals` - Strategy proposals
- `ai_strategies` - Individual strategies
- `ai_strategy_feedback` - Learning feedback

### PATCH 582: Decision Simulator Core

**Purpose**: Simulate strategy impact before execution using Monte Carlo methods.

**Key Features**:
- Monte Carlo simulation with configurable iterations (default: 1000)
- Multiple scenario types: best case, expected, worst case, risk events, resource shortage
- Complete metrics: cost (min/max/avg/variance), risk (distribution), time (critical path), crew impact
- Confidence level calculation with warnings and recommendations
- Mission-based simulation archiving
- React UI component for visualization

**Usage**:
```typescript
import { decisionSimulatorCore } from "@/ai/decision-simulator";
import { SimulationVisualization } from "@/ai/decision-simulator/SimulationVisualization";

// Initialize
await decisionSimulatorCore.initialize();

// Run simulation
const simulation = await decisionSimulatorCore.simulateStrategy(
  strategy,
  {
    iterations: 1000,
    timeHorizon: 168, // 1 week
    uncertaintyFactor: 0.2,
    crewAvailability: 80
  },
  "mission_123"
);

// Access results
console.log(`Confidence: ${simulation.confidenceLevel}%`);
console.log(`Avg Cost: ${simulation.metrics.cost.average}`);
console.log(`Scenarios: ${simulation.scenarios.length}`);

// In React component
<SimulationVisualization simulation={simulation} />
```

**Database Tables**:
- `ai_simulations` - Simulation results and archives

### PATCH 583: Neural Governance Module

**Purpose**: Provide governance oversight for AI decisions with ethical and legal validation.

**Key Features**:
- 4 default policies: Safety, Financial, Ethical, Operational
- Automatic violation detection
- Risk categorization: low, medium, high, critical
- Veto system with override capability
- Complete audit trail
- Approval workflow for high-risk decisions

**Usage**:
```typescript
import { neuralGovernance } from "@/ai/governance/neural-governance";

// Initialize
await neuralGovernance.initialize();

// Evaluate strategy
const evaluation = await neuralGovernance.evaluateStrategy(
  strategy,
  simulation
);

console.log(`Decision: ${evaluation.decision}`); // approved, vetoed, escalated, conditional
console.log(`Risk: ${evaluation.riskCategory}`);
console.log(`Violations: ${evaluation.violations.length}`);

// Approve if needed
if (evaluation.approvalRequired) {
  await neuralGovernance.approveStrategy(
    evaluation.id,
    "user_123",
    "Approved after review"
  );
}

// Get audit trail
const auditTrail = neuralGovernance.getAuditTrail(10); // Last 10 entries
```

**Database Tables**:
- `ai_governance_evaluations` - Strategy evaluations
- `ai_governance_vetoes` - Veto records
- `ai_governance_audit` - Complete audit trail

### PATCH 584: Strategic Consensus Builder

**Purpose**: Build consensus among multiple AI agents through weighted voting.

**Key Features**:
- 5 specialized agents: Operational, Safety, Financial, Strategic, Risk Management
- Weighted confidence voting model
- Disagreement detection and logging
- 5 fallback rules for deadlock resolution
- Consensus scoring with participation metrics
- Support level calculation (-100 to 100)

**Usage**:
```typescript
import { strategicConsensusBuilder } from "@/ai/agents/consensus-builder";

// Initialize (creates 5 agents automatically)
await strategicConsensusBuilder.initialize();

// Build consensus
const consensus = await strategicConsensusBuilder.buildConsensus(
  strategy,
  "mission_123"
);

console.log(`Status: ${consensus.status}`); // achieved, partial, failed, deadlock
console.log(`Consensus Score: ${consensus.consensusScore}%`);
console.log(`Support Level: ${consensus.supportLevel}`);
console.log(`Final Decision: ${consensus.finalDecision}`); // proceed, reject, modify, escalate
console.log(`Participating Agents: ${consensus.participatingAgents.length}`);

// Check disagreements
if (consensus.disagreements.length > 0) {
  console.log(`Disagreements: ${consensus.disagreements.length}`);
}

// Get all agents
const agents = strategicConsensusBuilder.getActiveAgents();
```

**Database Tables**:
- `ai_consensus_results` - Consensus outcomes
- `ai_agent_disagreements` - Agent disagreements log

### PATCH 585: Executive Summary Generator

**Purpose**: Generate comprehensive executive summaries with natural language insights.

**Key Features**:
- Consolidates data from all AI modules
- Natural language insights generation
- Strategic recommendations
- Key metrics dashboard
- PDF export (using jsPDF)
- JSON export
- Mission-based filtering

**Usage**:
```typescript
// In React component
import { ExecutiveSummaryGenerator } from "@/ai/reporting/executive-summary";

function DashboardPage() {
  return (
    <ExecutiveSummaryGenerator
      missionId="mission_123"
      startDate={new Date('2025-01-01')}
      endDate={new Date('2025-01-31')}
    />
  );
}
```

**Features**:
- Click "Generate Summary" to consolidate all AI decisions
- View insights, recommendations, and metrics in tabs
- Export to PDF for reports
- Export to JSON for data integration
- Summary includes:
  - Total strategies (approved/rejected/pending)
  - Average success probability and risk levels
  - Natural language insights
  - Strategic recommendations
  - Key performance metrics

**Database Tables**:
- `ai_executive_summaries` - Generated summaries

## Complete Workflow Example

```typescript
import { 
  initializeAIStrategicSystem,
  predictiveStrategyEngine,
  decisionSimulatorCore,
  neuralGovernance,
  strategicConsensusBuilder
} from "@/ai/strategic-decision-system";

async function completeDecisionWorkflow(missionId: string) {
  // 1. Initialize all systems
  await initializeAIStrategicSystem();

  // 2. Receive signal from BI system
  await predictiveStrategyEngine.receiveSignal({
    id: `signal_${Date.now()}`,
    source: "bi_analytics",
    type: "optimization_needed",
    data: { area: "resource_allocation", urgency: "medium" },
    priority: 70,
    timestamp: new Date()
  });

  // 3. Generate strategies
  const proposal = await predictiveStrategyEngine.generateStrategies(missionId);
  console.log(`✓ Generated ${proposal.strategies.length} strategies`);

  // 4. Simulate top strategy
  const simulation = await decisionSimulatorCore.simulateStrategy(
    proposal.topStrategy,
    { iterations: 1000, uncertaintyFactor: 0.2 },
    missionId
  );
  console.log(`✓ Simulation complete - Confidence: ${simulation.confidenceLevel}%`);

  // 5. Governance evaluation
  const evaluation = await neuralGovernance.evaluateStrategy(
    proposal.topStrategy,
    simulation
  );
  console.log(`✓ Governance decision: ${evaluation.decision}`);

  // 6. Build agent consensus
  const consensus = await strategicConsensusBuilder.buildConsensus(
    proposal.topStrategy,
    missionId
  );
  console.log(`✓ Consensus achieved: ${consensus.finalDecision}`);

  // 7. Check if approved to proceed
  if (
    evaluation.decision === "approved" &&
    consensus.finalDecision === "proceed"
  ) {
    console.log("✓ Strategy approved for execution");
    return {
      approved: true,
      strategy: proposal.topStrategy,
      simulation,
      evaluation,
      consensus
    };
  } else {
    console.log("✗ Strategy requires review or modification");
    return {
      approved: false,
      strategy: proposal.topStrategy,
      evaluation,
      consensus
    };
  }
}

// Execute workflow
const result = await completeDecisionWorkflow("mission_001");
```

## Database Schema Requirements

Create the following tables in Supabase:

```sql
-- PATCH 581 Tables
CREATE TABLE ai_strategy_signals (
  id BIGSERIAL PRIMARY KEY,
  signal_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  priority INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_strategy_proposals (
  id BIGSERIAL PRIMARY KEY,
  proposal_id TEXT UNIQUE NOT NULL,
  strategies JSONB NOT NULL,
  top_strategy_id TEXT,
  analysis_context JSONB,
  mission_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_strategies (
  id BIGSERIAL PRIMARY KEY,
  strategy_id TEXT UNIQUE NOT NULL,
  proposal_id TEXT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  success_probability DECIMAL,
  confidence_score INTEGER,
  estimated_impact JSONB,
  prerequisites TEXT[],
  actions JSONB,
  signals TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_strategy_feedback (
  id BIGSERIAL PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  feedback TEXT NOT NULL,
  actual_outcome JSONB,
  comments TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 582 Tables
CREATE TABLE ai_simulations (
  id BIGSERIAL PRIMARY KEY,
  simulation_id TEXT UNIQUE NOT NULL,
  strategy_id TEXT NOT NULL,
  status TEXT NOT NULL,
  parameters JSONB,
  scenarios JSONB,
  metrics JSONB,
  recommendations TEXT[],
  warnings TEXT[],
  confidence_level INTEGER,
  mission_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 583 Tables
CREATE TABLE ai_governance_evaluations (
  id BIGSERIAL PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL,
  strategy_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  risk_category TEXT NOT NULL,
  violations JSONB,
  recommendations TEXT[],
  approval_required BOOLEAN,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_governance_vetoes (
  id BIGSERIAL PRIMARY KEY,
  veto_id TEXT UNIQUE NOT NULL,
  strategy_id TEXT NOT NULL,
  evaluation_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  violations JSONB,
  vetoed_by TEXT NOT NULL,
  can_override BOOLEAN,
  override_requirements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_governance_audit (
  id BIGSERIAL PRIMARY KEY,
  audit_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT,
  decision TEXT NOT NULL,
  details JSONB,
  metadata JSONB
);

-- PATCH 584 Tables
CREATE TABLE ai_consensus_results (
  id BIGSERIAL PRIMARY KEY,
  consensus_id TEXT UNIQUE NOT NULL,
  strategy_id TEXT NOT NULL,
  status TEXT NOT NULL,
  participating_agents TEXT[],
  votes JSONB,
  consensus_score INTEGER,
  participation_rate INTEGER,
  support_level INTEGER,
  disagreements JSONB,
  final_decision TEXT NOT NULL,
  fallback_applied BOOLEAN,
  fallback_rule TEXT,
  recommendations TEXT[],
  mission_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_agent_disagreements (
  id BIGSERIAL PRIMARY KEY,
  disagreement_id TEXT UNIQUE NOT NULL,
  consensus_id TEXT NOT NULL,
  agents_involved TEXT[],
  issue TEXT NOT NULL,
  positions JSONB,
  severity TEXT NOT NULL,
  resolved BOOLEAN,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 585 Tables
CREATE TABLE ai_executive_summaries (
  id BIGSERIAL PRIMARY KEY,
  summary_id TEXT UNIQUE NOT NULL,
  mission_id TEXT,
  period_from TIMESTAMPTZ,
  period_to TIMESTAMPTZ,
  summary JSONB,
  insights TEXT[],
  recommendations TEXT[],
  key_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_strategies_proposal ON ai_strategies(proposal_id);
CREATE INDEX idx_strategies_type ON ai_strategies(type);
CREATE INDEX idx_simulations_mission ON ai_simulations(mission_id);
CREATE INDEX idx_simulations_strategy ON ai_simulations(strategy_id);
CREATE INDEX idx_evaluations_strategy ON ai_governance_evaluations(strategy_id);
CREATE INDEX idx_consensus_mission ON ai_consensus_results(mission_id);
CREATE INDEX idx_audit_entity ON ai_governance_audit(entity_type, entity_id);
```

## Testing

Run tests with:
```bash
npm run test src/tests/ai-strategic-system.test.ts
```

Test coverage includes:
- Signal reception and processing
- Strategy generation (minimum 3 strategies)
- Continuous learning with feedback
- Simulation with different parameters
- Metrics calculation and validation
- Governance evaluation and policy enforcement
- Veto system and audit trail
- Multi-agent consensus building
- Disagreement logging
- Fallback rule application
- End-to-end workflow integration

## Logging

All modules use structured logging via `@/lib/logger`:

```typescript
import { logger } from "@/lib/logger";

logger.info("[ModuleName] Operation description", { contextData });
logger.warn("[ModuleName] Warning message", { details });
logger.error("[ModuleName] Error occurred", error);
```

Logs are visible in:
- Development: Browser console
- Production: Sentry (if configured)
- Database: Module-specific tables

## Configuration

Default configuration values can be adjusted:

```typescript
// Simulation
const defaultParams = {
  iterations: 1000,        // Monte Carlo iterations
  timeHorizon: 168,        // Hours (1 week)
  uncertaintyFactor: 0.2,  // 20% uncertainty
  crewAvailability: 80     // 80% crew available
};

// Consensus Builder
const maxConcurrentSimulations = 3;  // Parallel simulations
const minAgentsRequired = 3;          // Minimum agents for consensus

// Governance
const cacheTimeout = 5 * 60 * 1000;  // 5 minutes
```

## Integration Points

The system integrates with:

1. **Situational Awareness System**: Receives alerts and signals
2. **BI Analytics**: Receives performance and optimization signals
3. **Sensor Networks**: Receives environmental and operational data
4. **Manual Input**: Accepts user-generated signals
5. **Database (Supabase)**: Persists all data and logs
6. **UI Components**: React components for visualization
7. **Export Systems**: PDF and JSON generation

## Performance Considerations

- Simulations run asynchronously to avoid blocking
- Maximum 3 concurrent simulations by default
- Evaluation and consensus building are cached
- Database queries use proper indexes
- Monte Carlo iterations configurable for performance tuning

## Security

- All decisions require governance approval
- High-risk strategies automatically escalated
- Complete audit trail for compliance
- Veto system prevents unsafe operations
- Policy enforcement at multiple levels

## Future Enhancements

- Machine learning model integration for improved predictions
- Real-time strategy adaptation based on execution feedback
- Advanced visualization with interactive charts
- Mobile app integration
- Multi-language support for summaries
- Advanced analytics dashboard
- API endpoints for external system integration

## Support

For issues or questions:
1. Check the comprehensive test suite for usage examples
2. Review the inline documentation in each module
3. Examine the database schema for data structures
4. Refer to integration tests for end-to-end workflows

## License

This module is part of the Travel HR Buddy system and follows the same license terms.
