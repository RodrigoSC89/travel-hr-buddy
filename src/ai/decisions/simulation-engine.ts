/**
 * PATCH 613 - Autonomous Decision Simulator
 * Tactical decision simulation engine with scenario evaluation
 * Simulates impact and outcomes of different strategies
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { graphInferenceEngine, InferencePath } from '@/ai/inference/graph-engine';

// Scenario types
export type ScenarioType = 
  | 'sensor_failure' 
  | 'route_deviation' 
  | 'resource_shortage'
  | 'weather_emergency'
  | 'system_overload'
  | 'security_breach';

export interface Scenario {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  parameters: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DecisionStrategy {
  id: string;
  name: string;
  description: string;
  actions: string[];
  estimatedCost: number; // 0-100 scale
  estimatedTime: number; // minutes
  requiredResources: string[];
}

export interface SimulationResult {
  scenarioId: string;
  strategyId: string;
  strategyName: string;
  outcome: 'success' | 'partial' | 'failure';
  impactScore: number; // 0-100, higher is better
  confidence: number; // 0-1 scale
  risks: Array<{ description: string; probability: number; severity: string }>;
  benefits: Array<{ description: string; value: number }>;
  resourceConsumption: Record<string, number>;
  estimatedDuration: number; // minutes
  sideEffects: string[];
  reasoning: string[];
}

export interface SimulationReport {
  id: string;
  scenario: Scenario;
  strategies: DecisionStrategy[];
  results: SimulationResult[];
  recommendation: {
    strategyId: string;
    strategyName: string;
    reasoning: string;
    comparisonData: Array<{
      metric: string;
      values: Record<string, number>;
    }>;
  };
  timestamp: Date;
}

class AutonomousDecisionSimulator {
  private scenarios: Map<string, Scenario> = new Map();
  private strategies: Map<string, Map<string, DecisionStrategy>> = new Map();
  private isInitialized = false;

  /**
   * Initialize the decision simulator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[DecisionSimulator] Already initialized');
      return;
    }

    logger.info('[DecisionSimulator] Initializing autonomous decision simulator...');

    // Initialize graph engine first
    await graphInferenceEngine.initialize();

    // Load predefined scenarios
    this.loadScenarios();

    // Load strategies for each scenario
    this.loadStrategies();

    this.isInitialized = true;
    logger.info('[DecisionSimulator] Decision simulator initialized');
  }

  /**
   * Load predefined scenarios
   */
  private loadScenarios(): void {
    const scenarios: Scenario[] = [
      {
        id: 'scenario-sensor-failure',
        type: 'sensor_failure',
        name: 'Critical Sensor Failure',
        description: 'Primary navigation sensor has failed',
        parameters: {
          sensorType: 'navigation',
          location: 'bridge',
          failureType: 'hardware',
        },
        severity: 'high',
      },
      {
        id: 'scenario-route-deviation',
        type: 'route_deviation',
        name: 'Unplanned Route Deviation',
        description: 'Vessel deviating from planned route due to weather',
        parameters: {
          deviation: 15, // nautical miles
          reason: 'storm_avoidance',
          fuelImpact: 'moderate',
        },
        severity: 'medium',
      },
      {
        id: 'scenario-resource-shortage',
        type: 'resource_shortage',
        name: 'Critical Resource Shortage',
        description: 'Fuel reserves below safe threshold',
        parameters: {
          resourceType: 'fuel',
          currentLevel: 25, // percentage
          safeThreshold: 30,
          nextPort: 120, // nautical miles
        },
        severity: 'critical',
      },
      {
        id: 'scenario-weather-emergency',
        type: 'weather_emergency',
        name: 'Severe Weather Event',
        description: 'Tropical storm approaching operational area',
        parameters: {
          weatherType: 'tropical_storm',
          windSpeed: 85, // knots
          distance: 50, // nautical miles
          timeToImpact: 4, // hours
        },
        severity: 'critical',
      },
      {
        id: 'scenario-system-overload',
        type: 'system_overload',
        name: 'System Resource Overload',
        description: 'AI systems consuming excessive resources',
        parameters: {
          cpuUsage: 95,
          memoryUsage: 92,
          affectedSystems: ['navigation', 'monitoring'],
        },
        severity: 'high',
      },
    ];

    for (const scenario of scenarios) {
      this.scenarios.set(scenario.id, scenario);
    }

    logger.info(`[DecisionSimulator] Loaded ${scenarios.length} scenarios`);
  }

  /**
   * Load strategies for each scenario
   */
  private loadStrategies(): void {
    // Strategies for sensor failure
    this.strategies.set('scenario-sensor-failure', new Map([
      ['strategy-switch-backup', {
        id: 'strategy-switch-backup',
        name: 'Switch to Backup Sensor',
        description: 'Immediately switch to backup navigation sensor',
        actions: ['disable_primary', 'activate_backup', 'verify_calibration'],
        estimatedCost: 10,
        estimatedTime: 5,
        requiredResources: ['backup_sensor', 'technician'],
      }],
      ['strategy-manual-navigation', {
        id: 'strategy-manual-navigation',
        name: 'Manual Navigation Mode',
        description: 'Switch to manual navigation until repair',
        actions: ['disable_auto', 'alert_crew', 'increase_watch'],
        estimatedCost: 40,
        estimatedTime: 30,
        requiredResources: ['navigation_officer', 'bridge_crew'],
      }],
      ['strategy-emergency-repair', {
        id: 'strategy-emergency-repair',
        name: 'Emergency Sensor Repair',
        description: 'Attempt immediate repair of primary sensor',
        actions: ['diagnose_issue', 'deploy_technician', 'test_repair'],
        estimatedCost: 60,
        estimatedTime: 45,
        requiredResources: ['technician', 'spare_parts', 'diagnostic_tools'],
      }],
    ]));

    // Strategies for route deviation
    this.strategies.set('scenario-route-deviation', new Map([
      ['strategy-continue-deviation', {
        id: 'strategy-continue-deviation',
        name: 'Continue Current Deviation',
        description: 'Maintain current course until weather clears',
        actions: ['monitor_weather', 'calculate_fuel', 'notify_stakeholders'],
        estimatedCost: 30,
        estimatedTime: 120,
        requiredResources: ['fuel_reserve', 'weather_data'],
      }],
      ['strategy-return-route', {
        id: 'strategy-return-route',
        name: 'Return to Planned Route',
        description: 'Navigate back to original route immediately',
        actions: ['assess_conditions', 'plot_course', 'increase_speed'],
        estimatedCost: 50,
        estimatedTime: 60,
        requiredResources: ['fuel_reserve', 'navigation_data'],
      }],
    ]));

    // Strategies for resource shortage
    this.strategies.set('scenario-resource-shortage', new Map([
      ['strategy-emergency-refuel', {
        id: 'strategy-emergency-refuel',
        name: 'Emergency Refueling',
        description: 'Divert to nearest port for emergency refueling',
        actions: ['locate_port', 'request_priority', 'adjust_route'],
        estimatedCost: 80,
        estimatedTime: 180,
        requiredResources: ['emergency_funds', 'port_clearance'],
      }],
      ['strategy-reduce-consumption', {
        id: 'strategy-reduce-consumption',
        name: 'Reduce Consumption',
        description: 'Lower speed and optimize consumption to reach planned port',
        actions: ['reduce_speed', 'optimize_route', 'disable_non_essential'],
        estimatedCost: 20,
        estimatedTime: 300,
        requiredResources: ['time_buffer'],
      }],
    ]));

    logger.info('[DecisionSimulator] Loaded strategies for all scenarios');
  }

  /**
   * Simulate a scenario with all available strategies
   */
  async simulateScenario(scenarioId: string): Promise<SimulationReport> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    logger.info(`[DecisionSimulator] Simulating scenario: ${scenario.name}`);

    const strategies = Array.from(this.strategies.get(scenarioId)?.values() || []);
    const results: SimulationResult[] = [];

    // Simulate each strategy
    for (const strategy of strategies) {
      const result = await this.simulateStrategy(scenario, strategy);
      results.push(result);
    }

    // Compare and recommend
    const recommendation = this.generateRecommendation(strategies, results);

    const report: SimulationReport = {
      id: `sim-${Date.now()}`,
      scenario,
      strategies,
      results,
      recommendation,
      timestamp: new Date(),
    };

    // Log to database
    await this.logSimulation(report);

    logger.info(
      `[DecisionSimulator] Simulation complete. Recommended: ${recommendation.strategyName}`
    );

    return report;
  }

  /**
   * Simulate a single strategy
   */
  private async simulateStrategy(
    scenario: Scenario,
    strategy: DecisionStrategy
  ): Promise<SimulationResult> {
    logger.debug(`[DecisionSimulator] Simulating strategy: ${strategy.name}`);

    // Use graph engine to propagate decision
    const paths = graphInferenceEngine.propagateDecision(
      'agent-decision-core',
      { scenario, strategy }
    );

    // Calculate impact score based on multiple factors
    const impactScore = this.calculateImpactScore(scenario, strategy, paths);

    // Determine outcome
    let outcome: SimulationResult['outcome'] = 'success';
    if (impactScore < 40) {
      outcome = 'failure';
    } else if (impactScore < 70) {
      outcome = 'partial';
    }

    // Generate risks
    const risks = this.generateRisks(scenario, strategy);

    // Generate benefits
    const benefits = this.generateBenefits(scenario, strategy, impactScore);

    // Calculate resource consumption
    const resourceConsumption = this.calculateResourceConsumption(strategy);

    // Generate reasoning
    const reasoning = this.generateReasoning(scenario, strategy, paths, impactScore);

    return {
      scenarioId: scenario.id,
      strategyId: strategy.id,
      strategyName: strategy.name,
      outcome,
      impactScore,
      confidence: this.calculateConfidence(paths),
      risks,
      benefits,
      resourceConsumption,
      estimatedDuration: strategy.estimatedTime,
      sideEffects: this.identifySideEffects(strategy, paths),
      reasoning,
    };
  }

  /**
   * Calculate impact score for a strategy
   */
  private calculateImpactScore(
    scenario: Scenario,
    strategy: DecisionStrategy,
    paths: InferencePath[]
  ): number {
    let score = 50; // Base score

    // Adjust based on scenario severity
    const severityPenalty = {
      low: 0,
      medium: -10,
      high: -20,
      critical: -30,
    };
    score += severityPenalty[scenario.severity];

    // Adjust based on strategy cost
    score -= strategy.estimatedCost * 0.3;

    // Adjust based on path confidence
    const avgConfidence = paths.reduce((sum, p) => sum + p.confidence, 0) / paths.length;
    score += avgConfidence * 40;

    // Adjust based on bottlenecks
    const totalBottlenecks = paths.reduce((sum, p) => sum + p.bottlenecks.length, 0);
    score -= totalBottlenecks * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence based on inference paths
   */
  private calculateConfidence(paths: InferencePath[]): number {
    if (paths.length === 0) return 0.5;
    
    const avgConfidence = paths.reduce((sum, p) => sum + p.confidence, 0) / paths.length;
    const bottleneckPenalty = paths.some(p => p.bottlenecks.length > 0) ? 0.1 : 0;
    
    return Math.max(0, Math.min(1, avgConfidence - bottleneckPenalty));
  }

  /**
   * Generate risks for a strategy
   */
  private generateRisks(
    scenario: Scenario,
    strategy: DecisionStrategy
  ): SimulationResult['risks'] {
    const risks: SimulationResult['risks'] = [];

    // High cost strategies have financial risk
    if (strategy.estimatedCost > 50) {
      risks.push({
        description: 'High operational cost may impact budget',
        probability: 0.7,
        severity: 'medium',
      });
    }

    // Long duration strategies have timing risk
    if (strategy.estimatedTime > 60) {
      risks.push({
        description: 'Extended timeline may cause delays',
        probability: 0.6,
        severity: 'medium',
      });
    }

    // Scenario-specific risks
    if (scenario.severity === 'critical') {
      risks.push({
        description: 'Critical scenario may escalate if strategy fails',
        probability: 0.4,
        severity: 'high',
      });
    }

    return risks;
  }

  /**
   * Generate benefits for a strategy
   */
  private generateBenefits(
    scenario: Scenario,
    strategy: DecisionStrategy,
    impactScore: number
  ): SimulationResult['benefits'] {
    const benefits: SimulationResult['benefits'] = [];

    if (impactScore > 70) {
      benefits.push({
        description: 'High probability of successful resolution',
        value: impactScore,
      });
    }

    if (strategy.estimatedCost < 30) {
      benefits.push({
        description: 'Cost-effective solution',
        value: 100 - strategy.estimatedCost,
      });
    }

    if (strategy.estimatedTime < 30) {
      benefits.push({
        description: 'Quick resolution time',
        value: 90,
      });
    }

    return benefits;
  }

  /**
   * Calculate resource consumption
   */
  private calculateResourceConsumption(strategy: DecisionStrategy): Record<string, number> {
    const consumption: Record<string, number> = {};

    for (const resource of strategy.requiredResources) {
      // Simulate consumption (0-100 scale)
      consumption[resource] = Math.random() * 50 + 20;
    }

    return consumption;
  }

  /**
   * Generate reasoning for simulation
   */
  private generateReasoning(
    scenario: Scenario,
    strategy: DecisionStrategy,
    paths: InferencePath[],
    impactScore: number
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Scenario: ${scenario.name} (${scenario.severity} severity)`);
    reasoning.push(`Strategy: ${strategy.name} - ${strategy.description}`);
    reasoning.push(`Impact Score: ${impactScore.toFixed(1)}/100`);
    reasoning.push(`Analyzed ${paths.length} decision paths`);

    if (paths.length > 0) {
      const avgConfidence = paths.reduce((sum, p) => sum + p.confidence, 0) / paths.length;
      reasoning.push(`Average path confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    }

    reasoning.push(`Estimated completion time: ${strategy.estimatedTime} minutes`);
    reasoning.push(`Estimated cost impact: ${strategy.estimatedCost}/100`);

    return reasoning;
  }

  /**
   * Identify side effects
   */
  private identifySideEffects(strategy: DecisionStrategy, paths: InferencePath[]): string[] {
    const sideEffects: string[] = [];

    // Check for bottlenecks in paths
    const bottlenecks = new Set<string>();
    for (const path of paths) {
      for (const bottleneck of path.bottlenecks) {
        bottlenecks.add(bottleneck);
      }
    }

    if (bottlenecks.size > 0) {
      sideEffects.push(`May affect ${bottlenecks.size} dependent systems`);
    }

    // High resource usage
    if (strategy.requiredResources.length > 3) {
      sideEffects.push('High resource utilization during execution');
    }

    return sideEffects;
  }

  /**
   * Generate recommendation from results
   */
  private generateRecommendation(
    strategies: DecisionStrategy[],
    results: SimulationResult[]
  ): SimulationReport['recommendation'] {
    // Find best strategy by impact score
    const bestResult = results.reduce((best, current) =>
      current.impactScore > best.impactScore ? current : best
    );

    // Generate comparison data
    const comparisonData = [
      {
        metric: 'Impact Score',
        values: Object.fromEntries(
          results.map((r) => [r.strategyName, r.impactScore])
        ),
      },
      {
        metric: 'Confidence',
        values: Object.fromEntries(
          results.map((r) => [r.strategyName, r.confidence * 100])
        ),
      },
      {
        metric: 'Duration (min)',
        values: Object.fromEntries(
          results.map((r) => [r.strategyName, r.estimatedDuration])
        ),
      },
    ];

    return {
      strategyId: bestResult.strategyId,
      strategyName: bestResult.strategyName,
      reasoning: `Selected based on highest impact score (${bestResult.impactScore.toFixed(1)}) with ${(bestResult.confidence * 100).toFixed(1)}% confidence`,
      comparisonData,
    };
  }

  /**
   * Log simulation to database
   */
  private async logSimulation(report: SimulationReport): Promise<void> {
    try {
      const { error } = await supabase.from('decision_simulations').insert({
        simulation_id: report.id,
        scenario_id: report.scenario.id,
        scenario_name: report.scenario.name,
        strategies_evaluated: report.strategies.length,
        recommended_strategy: report.recommendation.strategyId,
        results: report.results,
        timestamp: report.timestamp.toISOString(),
      });

      if (error) {
        logger.error('[DecisionSimulator] Failed to log simulation', error);
      }
    } catch (error) {
      logger.error('[DecisionSimulator] Error logging simulation', error);
    }
  }

  /**
   * Export simulation report
   */
  exportReport(report: SimulationReport): string {
    const lines: string[] = [];

    lines.push('=== AUTONOMOUS DECISION SIMULATION REPORT ===\n');
    lines.push(`Report ID: ${report.id}`);
    lines.push(`Timestamp: ${report.timestamp.toISOString()}\n`);
    lines.push(`Scenario: ${report.scenario.name}`);
    lines.push(`Severity: ${report.scenario.severity}`);
    lines.push(`Description: ${report.scenario.description}\n`);
    lines.push(`Strategies Evaluated: ${report.strategies.length}\n`);

    lines.push('--- SIMULATION RESULTS ---\n');
    for (const result of report.results) {
      lines.push(`Strategy: ${result.strategyName}`);
      lines.push(`  Outcome: ${result.outcome}`);
      lines.push(`  Impact Score: ${result.impactScore.toFixed(1)}/100`);
      lines.push(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      lines.push(`  Duration: ${result.estimatedDuration} minutes`);
      lines.push(`  Risks: ${result.risks.length}`);
      lines.push(`  Benefits: ${result.benefits.length}\n`);
    }

    lines.push('--- RECOMMENDATION ---\n');
    lines.push(`Recommended Strategy: ${report.recommendation.strategyName}`);
    lines.push(`Reasoning: ${report.recommendation.reasoning}\n`);

    lines.push('--- COMPARISON DATA ---\n');
    for (const comparison of report.recommendation.comparisonData) {
      lines.push(`${comparison.metric}:`);
      for (const [strategy, value] of Object.entries(comparison.values)) {
        lines.push(`  ${strategy}: ${typeof value === 'number' ? value.toFixed(1) : value}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get all scenarios
   */
  getScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get strategies for a scenario
   */
  getStrategies(scenarioId: string): DecisionStrategy[] {
    return Array.from(this.strategies.get(scenarioId)?.values() || []);
  }
}

// Export singleton instance
export const autonomousDecisionSimulator = new AutonomousDecisionSimulator();
