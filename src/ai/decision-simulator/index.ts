/**
 * PATCH 582 - Decision Simulator Core
 * Simulate impact of strategies before execution
 * 
 * Features:
 * - Scenario simulation based on PATCH 581 strategies
 * - Metrics tracking: cost, risk, time, crew impact
 * - Simulation archiving per mission
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Strategy } from "@/ai/strategy/predictive-engine";

export type SimulationStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface SimulationParameters {
  iterations?: number; // Number of Monte Carlo iterations
  timeHorizon?: number; // Simulation time horizon in hours
  uncertaintyFactor?: number; // 0-1, how much uncertainty to introduce
  environmentalFactors?: Record<string, any>;
  crewAvailability?: number; // 0-100
  resourceConstraints?: Record<string, number>;
}

export interface SimulationMetrics {
  cost: {
    min: number;
    max: number;
    average: number;
    variance: number;
  };
  risk: {
    min: number;
    max: number;
    average: number;
    distribution: Record<string, number>; // risk level -> count
  };
  time: {
    min: number;
    max: number;
    average: number;
    criticalPath?: string[];
  };
  crewImpact: {
    min: number;
    max: number;
    average: number;
    affectedCrew?: number;
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-1
  outcomes: SimulationOutcome[];
  triggers?: string[];
}

export interface SimulationOutcome {
  id: string;
  scenarioId: string;
  description: string;
  probability: number;
  impact: {
    cost: number;
    risk: number;
    time: number;
    crewImpact: number;
  };
  mitigationActions?: string[];
}

export interface SimulationResult {
  id: string;
  strategyId: string;
  strategy: Strategy;
  status: SimulationStatus;
  parameters: SimulationParameters;
  scenarios: SimulationScenario[];
  metrics: SimulationMetrics;
  recommendations: string[];
  warnings: string[];
  confidenceLevel: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  missionId?: string;
  metadata?: Record<string, any>;
}

export interface SimulationArchive {
  missionId: string;
  simulations: SimulationResult[];
  summary: {
    totalSimulations: number;
    successRate: number;
    avgCost: number;
    avgRisk: number;
    avgTime: number;
  };
  createdAt: Date;
}

class DecisionSimulatorCore {
  private isInitialized = false;
  private activeSimulations: Map<string, SimulationResult> = new Map();
  private simulationQueue: string[] = [];
  private maxConcurrentSimulations = 3;

  /**
   * Initialize the decision simulator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[DecisionSimulator] Already initialized");
      return;
    }

    logger.info("[DecisionSimulator] Initializing decision simulator core...");
    this.isInitialized = true;
    logger.info("[DecisionSimulator] Initialization complete");
  }

  /**
   * Simulate a strategy's impact
   */
  async simulateStrategy(
    strategy: Strategy,
    parameters: SimulationParameters = {},
    missionId?: string
  ): Promise<SimulationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info("[DecisionSimulator] Starting simulation", {
      simulationId,
      strategyId: strategy.id,
      strategyType: strategy.type,
      missionId
    });

    // Apply default parameters
    const simParams: SimulationParameters = {
      iterations: parameters.iterations || 1000,
      timeHorizon: parameters.timeHorizon || 168, // 1 week default
      uncertaintyFactor: parameters.uncertaintyFactor || 0.2,
      environmentalFactors: parameters.environmentalFactors || {},
      crewAvailability: parameters.crewAvailability || 80,
      resourceConstraints: parameters.resourceConstraints || {}
    };

    // Create simulation result
    const result: SimulationResult = {
      id: simulationId,
      strategyId: strategy.id,
      strategy,
      status: "running",
      parameters: simParams,
      scenarios: [],
      metrics: {
        cost: { min: 0, max: 0, average: 0, variance: 0 },
        risk: { min: 0, max: 0, average: 0, distribution: {} },
        time: { min: 0, max: 0, average: 0 },
        crewImpact: { min: 0, max: 0, average: 0 }
      },
      recommendations: [],
      warnings: [],
      confidenceLevel: 0,
      startedAt: new Date(),
      missionId,
      metadata: {}
    };

    this.activeSimulations.set(simulationId, result);

    try {
      // Generate scenarios
      result.scenarios = await this.generateScenarios(strategy, simParams);

      // Run Monte Carlo simulation
      result.metrics = await this.runMonteCarloSimulation(strategy, result.scenarios, simParams);

      // Generate recommendations and warnings
      result.recommendations = this.generateRecommendations(result);
      result.warnings = this.generateWarnings(result);

      // Calculate confidence level
      result.confidenceLevel = this.calculateConfidenceLevel(result);

      // Mark as completed
      result.status = "completed";
      result.completedAt = new Date();
      result.duration = (result.completedAt.getTime() - result.startedAt.getTime()) / 1000;

      logger.info("[DecisionSimulator] Simulation completed", {
        simulationId,
        duration: result.duration,
        scenarios: result.scenarios.length,
        confidenceLevel: result.confidenceLevel
      });

      // Archive simulation
      await this.archiveSimulation(result);

    } catch (error) {
      logger.error("[DecisionSimulator] Simulation failed", error);
      result.status = "failed";
      result.completedAt = new Date();
      throw error;
    }

    return result;
  }

  /**
   * Simulate multiple strategies in parallel
   */
  async simulateMultipleStrategies(
    strategies: Strategy[],
    parameters: SimulationParameters = {},
    missionId?: string
  ): Promise<SimulationResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    logger.info("[DecisionSimulator] Simulating multiple strategies", {
      count: strategies.length,
      missionId
    });

    const results: SimulationResult[] = [];

    // Simulate in batches to respect concurrency limit
    for (let i = 0; i < strategies.length; i += this.maxConcurrentSimulations) {
      const batch = strategies.slice(i, i + this.maxConcurrentSimulations);
      const batchPromises = batch.map(strategy => 
        this.simulateStrategy(strategy, parameters, missionId)
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get simulation result by ID
   */
  getSimulation(simulationId: string): SimulationResult | undefined {
    return this.activeSimulations.get(simulationId);
  }

  /**
   * Cancel a running simulation
   */
  async cancelSimulation(simulationId: string): Promise<void> {
    const simulation = this.activeSimulations.get(simulationId);
    if (!simulation) {
      throw new Error(`Simulation ${simulationId} not found`);
    }

    if (simulation.status !== "running") {
      throw new Error(`Simulation ${simulationId} is not running`);
    }

    simulation.status = "cancelled";
    simulation.completedAt = new Date();

    logger.info("[DecisionSimulator] Simulation cancelled", { simulationId });
  }

  /**
   * Get simulations for a mission
   */
  async getSimulationsForMission(missionId: string): Promise<SimulationResult[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("ai_simulations")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error("[DecisionSimulator] Failed to fetch mission simulations", error);
      return [];
    }
  }

  /**
   * Get simulation archive for a mission
   */
  async getSimulationArchive(missionId: string): Promise<SimulationArchive | null> {
    try {
      const simulations = await this.getSimulationsForMission(missionId);

      if (simulations.length === 0) {
        return null;
      }

      const completedSimulations = simulations.filter(s => s.status === "completed");
      const totalCost = completedSimulations.reduce((sum, s) => sum + s.metrics.cost.average, 0);
      const totalRisk = completedSimulations.reduce((sum, s) => sum + s.metrics.risk.average, 0);
      const totalTime = completedSimulations.reduce((sum, s) => sum + s.metrics.time.average, 0);

      return {
        missionId,
        simulations,
        summary: {
          totalSimulations: simulations.length,
          successRate: completedSimulations.length / simulations.length,
          avgCost: totalCost / completedSimulations.length,
          avgRisk: totalRisk / completedSimulations.length,
          avgTime: totalTime / completedSimulations.length
        },
        createdAt: new Date()
      };
    } catch (error) {
      logger.error("[DecisionSimulator] Failed to get simulation archive", error);
      return null;
    }
  }

  // Private methods

  private async generateScenarios(
    strategy: Strategy,
    parameters: SimulationParameters
  ): Promise<SimulationScenario[]> {
    const scenarios: SimulationScenario[] = [];

    // Best case scenario
    scenarios.push(this.createBestCaseScenario(strategy, parameters));

    // Expected case scenario
    scenarios.push(this.createExpectedCaseScenario(strategy, parameters));

    // Worst case scenario
    scenarios.push(this.createWorstCaseScenario(strategy, parameters));

    // Add additional scenarios based on strategy type
    if (strategy.type === "risk_mitigation") {
      scenarios.push(this.createRiskEventScenario(strategy, parameters));
    }

    if (strategy.type === "resource_allocation") {
      scenarios.push(this.createResourceShortageScenario(strategy, parameters));
    }

    return scenarios;
  }

  private createBestCaseScenario(
    strategy: Strategy,
    parameters: SimulationParameters
  ): SimulationScenario {
    const scenarioId = `scenario_best_${Date.now()}`;
    
    return {
      id: scenarioId,
      name: "Best Case Scenario",
      description: "Optimal conditions with minimal disruptions",
      probability: 0.2,
      outcomes: [
        {
          id: `outcome_${scenarioId}_1`,
          scenarioId,
          description: "All actions complete on time and under budget",
          probability: 0.8,
          impact: {
            cost: strategy.estimatedImpact.cost! * 0.8,
            risk: strategy.estimatedImpact.risk * 0.5,
            time: strategy.estimatedImpact.time * 0.8,
            crewImpact: strategy.estimatedImpact.crewImpact * 0.6
          }
        }
      ],
      triggers: ["ideal_conditions", "full_resources", "high_crew_morale"]
    };
  }

  private createExpectedCaseScenario(
    strategy: Strategy,
    parameters: SimulationParameters
  ): SimulationScenario {
    const scenarioId = `scenario_expected_${Date.now()}`;
    
    return {
      id: scenarioId,
      name: "Expected Case Scenario",
      description: "Normal operational conditions",
      probability: 0.6,
      outcomes: [
        {
          id: `outcome_${scenarioId}_1`,
          scenarioId,
          description: "Actions complete as planned with minor adjustments",
          probability: 0.9,
          impact: {
            cost: strategy.estimatedImpact.cost!,
            risk: strategy.estimatedImpact.risk,
            time: strategy.estimatedImpact.time,
            crewImpact: strategy.estimatedImpact.crewImpact
          }
        }
      ],
      triggers: ["normal_conditions", "standard_resources"]
    };
  }

  private createWorstCaseScenario(
    strategy: Strategy,
    parameters: SimulationParameters
  ): SimulationScenario {
    const scenarioId = `scenario_worst_${Date.now()}`;
    
    return {
      id: scenarioId,
      name: "Worst Case Scenario",
      description: "Adverse conditions with multiple complications",
      probability: 0.15,
      outcomes: [
        {
          id: `outcome_${scenarioId}_1`,
          scenarioId,
          description: "Significant delays and cost overruns",
          probability: 0.6,
          impact: {
            cost: strategy.estimatedImpact.cost! * 1.5,
            risk: strategy.estimatedImpact.risk * 1.8,
            time: strategy.estimatedImpact.time * 2.0,
            crewImpact: strategy.estimatedImpact.crewImpact * 1.5
          },
          mitigationActions: [
            "Activate contingency plans",
            "Request additional resources",
            "Escalate to management"
          ]
        }
      ],
      triggers: ["adverse_weather", "equipment_failure", "resource_shortage"]
    };
  }

  private createRiskEventScenario(
    strategy: Strategy,
    parameters: SimulationParameters
  ): SimulationScenario {
    const scenarioId = `scenario_risk_${Date.now()}`;
    
    return {
      id: scenarioId,
      name: "Risk Event Scenario",
      description: "High-impact risk event occurs during execution",
      probability: 0.05,
      outcomes: [
        {
          id: `outcome_${scenarioId}_1`,
          scenarioId,
          description: "Critical risk event requires immediate response",
          probability: 0.3,
          impact: {
            cost: strategy.estimatedImpact.cost! * 2.0,
            risk: 95,
            time: strategy.estimatedImpact.time * 2.5,
            crewImpact: strategy.estimatedImpact.crewImpact * 2.0
          },
          mitigationActions: [
            "Execute emergency protocols",
            "Mobilize crisis team",
            "Notify stakeholders"
          ]
        }
      ],
      triggers: ["critical_failure", "safety_incident", "environmental_hazard"]
    };
  }

  private createResourceShortageScenario(
    strategy: Strategy,
    parameters: SimulationParameters
  ): SimulationScenario {
    const scenarioId = `scenario_shortage_${Date.now()}`;
    
    return {
      id: scenarioId,
      name: "Resource Shortage Scenario",
      description: "Key resources become unavailable",
      probability: 0.1,
      outcomes: [
        {
          id: `outcome_${scenarioId}_1`,
          scenarioId,
          description: "Must work with reduced resources",
          probability: 0.5,
          impact: {
            cost: strategy.estimatedImpact.cost! * 1.3,
            risk: strategy.estimatedImpact.risk * 1.4,
            time: strategy.estimatedImpact.time * 1.6,
            crewImpact: strategy.estimatedImpact.crewImpact * 1.3
          },
          mitigationActions: [
            "Source alternative resources",
            "Adjust execution timeline",
            "Reprioritize actions"
          ]
        }
      ],
      triggers: ["supply_chain_disruption", "crew_unavailability", "equipment_shortage"]
    };
  }

  private async runMonteCarloSimulation(
    strategy: Strategy,
    scenarios: SimulationScenario[],
    parameters: SimulationParameters
  ): Promise<SimulationMetrics> {
    const iterations = parameters.iterations || 1000;
    const results = {
      costs: [] as number[],
      risks: [] as number[],
      times: [] as number[],
      crewImpacts: [] as number[]
    };

    // Run Monte Carlo iterations
    for (let i = 0; i < iterations; i++) {
      // Randomly select scenario based on probability
      const scenario = this.selectScenarioByProbability(scenarios);
      const outcome = this.selectOutcomeByProbability(scenario.outcomes);

      // Add uncertainty variation
      const uncertaintyFactor = parameters.uncertaintyFactor || 0.2;
      const costVariation = 1 + (Math.random() - 0.5) * uncertaintyFactor;
      const timeVariation = 1 + (Math.random() - 0.5) * uncertaintyFactor;

      results.costs.push(outcome.impact.cost * costVariation);
      results.risks.push(outcome.impact.risk);
      results.times.push(outcome.impact.time * timeVariation);
      results.crewImpacts.push(outcome.impact.crewImpact);
    }

    // Calculate metrics
    return {
      cost: {
        min: Math.min(...results.costs),
        max: Math.max(...results.costs),
        average: results.costs.reduce((a, b) => a + b, 0) / results.costs.length,
        variance: this.calculateVariance(results.costs)
      },
      risk: {
        min: Math.min(...results.risks),
        max: Math.max(...results.risks),
        average: results.risks.reduce((a, b) => a + b, 0) / results.risks.length,
        distribution: this.calculateRiskDistribution(results.risks)
      },
      time: {
        min: Math.min(...results.times),
        max: Math.max(...results.times),
        average: results.times.reduce((a, b) => a + b, 0) / results.times.length,
        criticalPath: strategy.actions.map(a => a.action)
      },
      crewImpact: {
        min: Math.min(...results.crewImpacts),
        max: Math.max(...results.crewImpacts),
        average: results.crewImpacts.reduce((a, b) => a + b, 0) / results.crewImpacts.length,
        affectedCrew: Math.round(parameters.crewAvailability! * 0.7)
      }
    };
  }

  private selectScenarioByProbability(scenarios: SimulationScenario[]): SimulationScenario {
    const random = Math.random();
    let cumulative = 0;

    for (const scenario of scenarios) {
      cumulative += scenario.probability;
      if (random <= cumulative) {
        return scenario;
      }
    }

    return scenarios[scenarios.length - 1];
  }

  private selectOutcomeByProbability(outcomes: SimulationOutcome[]): SimulationOutcome {
    const random = Math.random();
    let cumulative = 0;

    for (const outcome of outcomes) {
      cumulative += outcome.probability;
      if (random <= cumulative) {
        return outcome;
      }
    }

    return outcomes[outcomes.length - 1];
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateRiskDistribution(risks: number[]): Record<string, number> {
    const distribution = {
      low: 0,      // 0-30
      medium: 0,   // 31-60
      high: 0,     // 61-85
      critical: 0  // 86-100
    };

    for (const risk of risks) {
      if (risk <= 30) distribution.low++;
      else if (risk <= 60) distribution.medium++;
      else if (risk <= 85) distribution.high++;
      else distribution.critical++;
    }

    return distribution;
  }

  private generateRecommendations(result: SimulationResult): string[] {
    const recommendations: string[] = [];

    // Cost recommendations
    if (result.metrics.cost.average > result.strategy.estimatedImpact.cost! * 1.2) {
      recommendations.push("Consider cost optimization measures - average cost exceeds estimate by 20%");
    }

    // Risk recommendations
    if (result.metrics.risk.average > 70) {
      recommendations.push("High average risk detected - implement additional mitigation measures");
    }

    // Time recommendations
    if (result.metrics.time.average > result.strategy.estimatedImpact.time * 1.5) {
      recommendations.push("Timeline may need extension - average duration significantly exceeds estimate");
    }

    // Crew impact recommendations
    if (result.metrics.crewImpact.average > 60) {
      recommendations.push("Consider crew rotation or support measures - high crew impact detected");
    }

    // Confidence recommendations
    if (result.confidenceLevel < 50) {
      recommendations.push("Low confidence in simulation - gather more data before execution");
    }

    return recommendations;
  }

  private generateWarnings(result: SimulationResult): string[] {
    const warnings: string[] = [];

    // Critical risk warning
    if (result.metrics.risk.max > 90) {
      warnings.push("CRITICAL: Maximum risk level exceeds 90 - review safety protocols");
    }

    // Cost overrun warning
    if (result.metrics.cost.max > result.strategy.estimatedImpact.cost! * 2) {
      warnings.push("WARNING: Worst-case cost is double the estimate - ensure budget flexibility");
    }

    // Time warning
    if (result.metrics.time.max > result.strategy.estimatedImpact.time * 2.5) {
      warnings.push("WARNING: Worst-case timeline exceeds estimate by 150%");
    }

    // Crew safety warning
    if (result.metrics.crewImpact.max > 80) {
      warnings.push("WARNING: Potential significant crew impact - prioritize crew welfare");
    }

    return warnings;
  }

  private calculateConfidenceLevel(result: SimulationResult): number {
    let confidence = 100;

    // Reduce confidence based on variance
    const costVariance = result.metrics.cost.variance / result.metrics.cost.average;
    if (costVariance > 0.3) confidence -= 20;
    else if (costVariance > 0.2) confidence -= 10;

    // Reduce confidence based on risk
    if (result.metrics.risk.average > 70) confidence -= 15;
    else if (result.metrics.risk.average > 50) confidence -= 10;

    // Reduce confidence based on warnings
    confidence -= result.warnings.length * 5;

    return Math.max(0, Math.min(100, confidence));
  }

  private async archiveSimulation(result: SimulationResult): Promise<void> {
    logger.info("[DecisionSimulator] Archiving simulation", {
      simulationId: result.id,
      missionId: result.missionId
    });

    try {
      await (supabase as any).from("ai_simulations").insert({
        simulation_id: result.id,
        strategy_id: result.strategyId,
        status: result.status,
        parameters: result.parameters,
        scenarios: result.scenarios,
        metrics: result.metrics,
        recommendations: result.recommendations,
        warnings: result.warnings,
        confidence_level: result.confidenceLevel,
        mission_id: result.missionId,
        started_at: result.startedAt.toISOString(),
        completed_at: result.completedAt?.toISOString(),
        duration: result.duration,
        metadata: result.metadata
      });
    } catch (error) {
      logger.error("[DecisionSimulator] Failed to archive simulation", error);
    }
  }
}

// Export singleton instance
export const decisionSimulatorCore = new DecisionSimulatorCore();

// Export class for testing
export { DecisionSimulatorCore };
