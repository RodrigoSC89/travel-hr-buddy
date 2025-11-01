/**
 * AI Strategic Decision System - Main Export Index
 * PATCHES 581-585
 * 
 * This module provides a comprehensive AI-driven strategic decision-making system
 * with predictive capabilities, simulation, governance, consensus mechanisms,
 * and executive reporting.
 */

// PATCH 581 - Predictive Strategy Engine
// Export types only to avoid static/dynamic import conflicts
export type {
  Signal,
  Strategy,
  StrategyProposal,
  FeedbackRecord,
  StrategyType,
  SignalSource,
  LearningFeedback
} from "./strategy/predictive-engine";

// PATCH 582 - Decision Simulator Core  
export type {
  SimulationResult,
  SimulationParameters,
  SimulationMetrics,
  SimulationScenario,
  SimulationOutcome,
  SimulationArchive,
  SimulationStatus
} from "./decision-simulator";

// Export UI component as it's not dynamically imported
export { SimulationVisualization } from "./decision-simulator/SimulationVisualization";

// PATCH 583 - Neural Governance Module
export type {
  GovernanceEvaluation,
  GovernancePolicy,
  GovernanceRule,
  GovernanceViolation,
  VetoRecord,
  AuditEntry,
  GovernanceDecision,
  RiskCategory,
  ViolationType
} from "./governance/neural-governance";

// PATCH 584 - Strategic Consensus Builder
export type {
  ConsensusResult,
  Agent,
  AgentVote,
  Disagreement,
  FallbackRule,
  AgentRole,
  VoteValue,
  ConsensusStatus
} from "./agents/consensus-builder";

// Runtime exports via lazy loading functions
export async function getPredictiveStrategyEngine() {
  const { predictiveStrategyEngine, PredictiveStrategyEngine } = await import("./strategy/predictive-engine");
  return { predictiveStrategyEngine, PredictiveStrategyEngine };
}

export async function getDecisionSimulatorCore() {
  const { decisionSimulatorCore, DecisionSimulatorCore } = await import("./decision-simulator");
  return { decisionSimulatorCore, DecisionSimulatorCore };
}

export async function getNeuralGovernance() {
  const { neuralGovernance, NeuralGovernance } = await import("./governance/neural-governance");
  return { neuralGovernance, NeuralGovernance };
}

export async function getStrategicConsensusBuilder() {
  const { strategicConsensusBuilder, StrategicConsensusBuilder } = await import("./agents/consensus-builder");
  return { strategicConsensusBuilder, StrategicConsensusBuilder };
}

// PATCH 585 - Executive Summary Generator
export {
  ExecutiveSummaryGenerator,
  type ExecutiveSummaryData
} from "./reporting/executive-summary";

/**
 * Convenience function to initialize all AI Strategic Decision modules
 * @throws {Error} If any module fails to initialize
 */
export async function initializeAIStrategicSystem(): Promise<void> {
  try {
    const [
      { predictiveStrategyEngine },
      { decisionSimulatorCore },
      { neuralGovernance },
      { strategicConsensusBuilder }
    ] = await Promise.all([
      getPredictiveStrategyEngine(),
      getDecisionSimulatorCore(),
      getNeuralGovernance(),
      getStrategicConsensusBuilder()
    ]);

    await Promise.all([
      predictiveStrategyEngine.initialize(),
      decisionSimulatorCore.initialize(),
      neuralGovernance.initialize(),
      strategicConsensusBuilder.initialize()
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize AI Strategic System: ${message}`);
  }
}

/**
 * Complete workflow example:
 * 
 * ```typescript
 * import { 
 *   initializeAIStrategicSystem,
 *   predictiveStrategyEngine,
 *   decisionSimulatorCore,
 *   neuralGovernance,
 *   strategicConsensusBuilder
 * } from "@/ai/strategic-decision-system";
 * 
 * // Initialize all modules
 * await initializeAIStrategicSystem();
 * 
 * // 1. Receive signal and generate strategies
 * await predictiveStrategyEngine.receiveSignal(signal);
 * const proposal = await predictiveStrategyEngine.generateStrategies(missionId);
 * 
 * // 2. Simulate top strategy
 * const simulation = await decisionSimulatorCore.simulateStrategy(
 *   proposal.topStrategy,
 *   { iterations: 1000 },
 *   missionId
 * );
 * 
 * // 3. Evaluate with governance
 * const evaluation = await neuralGovernance.evaluateStrategy(
 *   proposal.topStrategy,
 *   simulation
 * );
 * 
 * // 4. Build consensus among agents
 * const consensus = await strategicConsensusBuilder.buildConsensus(
 *   proposal.topStrategy,
 *   missionId
 * );
 * 
 * // 5. Generate executive summary (use React component)
 * // <ExecutiveSummaryGenerator missionId={missionId} />
 * ```
 */
