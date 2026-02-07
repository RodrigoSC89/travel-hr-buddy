/**
 * Operations Services Index
 * Centralized exports for voyage optimization, bunker, TCE, fleet intelligence
 */

export {
  TCECalculatorService,
  BunkerOptimizerService,
  FleetIntelligenceService,
  VoyageCopilotClient,
  tceCalculator,
  bunkerOptimizer,
  fleetIntelligence,
  voyageCopilot,
  type VoyagePlan,
  type TCECalculation,
  type BunkerPlan,
  type FleetBenchmark,
} from './voyage-optimizer.service';
