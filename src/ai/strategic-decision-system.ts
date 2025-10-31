/**
 * AI Strategic Decision System - Main Export Index
 * PATCHES 581-585
 * 
 * This module provides a comprehensive AI-driven strategic decision-making system
 * with predictive capabilities, simulation, governance, consensus mechanisms,
 * and executive reporting.
 */

// PATCH 581 - Predictive Strategy Engine
export {
  predictiveStrategyEngine,
  PredictiveStrategyEngine,
  type Signal,
  type Strategy,
  type StrategyProposal,
  type FeedbackRecord,
  type StrategyType,
  type SignalSource,
  type LearningFeedback
} from "./strategy/predictive-engine";

// PATCH 582 - Decision Simulator Core
export {
  decisionSimulatorCore,
  DecisionSimulatorCore,
  type SimulationResult,
  type SimulationParameters,
  type SimulationMetrics,
  type SimulationScenario,
  type SimulationOutcome,
  type SimulationArchive,
  type SimulationStatus
} from "./decision-simulator";

export { SimulationVisualization } from "./decision-simulator/SimulationVisualization";

// PATCH 583 - Neural Governance Module
export {
  neuralGovernance,
  NeuralGovernance,
  type GovernanceEvaluation,
  type GovernancePolicy,
  type GovernanceRule,
  type GovernanceViolation,
  type VetoRecord,
  type AuditEntry,
  type GovernanceDecision,
  type RiskCategory,
  type ViolationType
} from "./governance/neural-governance";

// PATCH 584 - Strategic Consensus Builder
export {
  strategicConsensusBuilder,
  StrategicConsensusBuilder,
  type ConsensusResult,
  type Agent,
  type AgentVote,
  type Disagreement,
  type FallbackRule,
  type AgentRole,
  type VoteValue,
  type ConsensusStatus
} from "./agents/consensus-builder";

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
    const { predictiveStrategyEngine } = await import("./strategy/predictive-engine");
    const { decisionSimulatorCore } = await import("./decision-simulator");
    const { neuralGovernance } = await import("./governance/neural-governance");
    const { strategicConsensusBuilder } = await import("./agents/consensus-builder");

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
