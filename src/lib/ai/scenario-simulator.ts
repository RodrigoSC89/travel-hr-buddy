/**
 * Scenario Simulator with Monte Carlo Analysis
 * Predictive scenario simulation for risk and cost forecasting
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

export interface ScenarioVariable {
  name: string;
  currentValue: number;
  proposedValue: number;
  unit: string;
  distribution: 'normal' | 'lognormal' | 'uniform' | 'triangular';
  stdDev?: number;
  min?: number;
  max?: number;
}

export interface ScenarioInput {
  name: string;
  description: string;
  durationMonths: number;
  variables: ScenarioVariable[];
  constraints?: ScenarioConstraint[];
}

export interface ScenarioConstraint {
  type: 'min' | 'max' | 'range';
  variable: string;
  value: number | [number, number];
}

export interface SimulationResult {
  mean: number;
  stdDev: number;
  percentiles: { p10: number; p50: number; p90: number };
  min: number;
  max: number;
  distribution: number[];
}

export interface RiskAssessment {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigation: string;
}

export interface ScenarioOutput {
  scenarioId: string;
  scenarioName: string;
  simulationCount: number;
  executionTime: number;
  fuelCost: SimulationResult;
  operationalCost: SimulationResult;
  revenue: SimulationResult;
  eta: SimulationResult;
  risks: RiskAssessment[];
  recommendations: ScenarioRecommendation[];
  comparison: {
    baseline: ScenarioMetrics;
    scenario: ScenarioMetrics;
    delta: ScenarioMetrics;
    deltaPercent: ScenarioMetrics;
  };
  confidence: number;
}

export interface ScenarioMetrics {
  fuelCost: number;
  operationalCost: number;
  revenue: number;
  eta: number;
  riskScore: number;
}

export interface ScenarioRecommendation {
  type: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  expectedBenefit: string;
  roi: number;
}

/**
 * Monte Carlo Scenario Simulator
 */
export class ScenarioSimulator {
  private simulationCount: number = 10000;
  private baselineMetrics: ScenarioMetrics;

  constructor(baseline?: ScenarioMetrics) {
    this.baselineMetrics = baseline || {
      fuelCost: 450000,
      operationalCost: 180000,
      revenue: 850000,
      eta: 14,
      riskScore: 25
    };
  }

  /**
   * Run Monte Carlo simulation for a scenario
   */
  async simulate(input: ScenarioInput): Promise<ScenarioOutput> {
    const startTime = Date.now();
    
    // Run simulations
    const fuelResults: number[] = [];
    const opCostResults: number[] = [];
    const revenueResults: number[] = [];
    const etaResults: number[] = [];

    for (let i = 0; i < this.simulationCount; i++) {
      const iteration = this.runIteration(input);
      fuelResults.push(iteration.fuelCost);
      opCostResults.push(iteration.operationalCost);
      revenueResults.push(iteration.revenue);
      etaResults.push(iteration.eta);
    }

    // Calculate statistics
    const fuelCost = this.calculateStats(fuelResults);
    const operationalCost = this.calculateStats(opCostResults);
    const revenue = this.calculateStats(revenueResults);
    const eta = this.calculateStats(etaResults);

    // Assess risks
    const risks = this.assessRisks(input, fuelCost, operationalCost, eta);

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, fuelCost, risks);

    // Calculate comparison
    const scenarioMetrics: ScenarioMetrics = {
      fuelCost: fuelCost.mean,
      operationalCost: operationalCost.mean,
      revenue: revenue.mean,
      eta: eta.mean,
      riskScore: this.calculateRiskScore(risks)
    };

    const delta: ScenarioMetrics = {
      fuelCost: scenarioMetrics.fuelCost - this.baselineMetrics.fuelCost,
      operationalCost: scenarioMetrics.operationalCost - this.baselineMetrics.operationalCost,
      revenue: scenarioMetrics.revenue - this.baselineMetrics.revenue,
      eta: scenarioMetrics.eta - this.baselineMetrics.eta,
      riskScore: scenarioMetrics.riskScore - this.baselineMetrics.riskScore
    };

    const deltaPercent: ScenarioMetrics = {
      fuelCost: (delta.fuelCost / this.baselineMetrics.fuelCost) * 100,
      operationalCost: (delta.operationalCost / this.baselineMetrics.operationalCost) * 100,
      revenue: (delta.revenue / this.baselineMetrics.revenue) * 100,
      eta: (delta.eta / this.baselineMetrics.eta) * 100,
      riskScore: (delta.riskScore / Math.max(this.baselineMetrics.riskScore, 1)) * 100
    };

    const executionTime = Date.now() - startTime;

    return {
      scenarioId: crypto.randomUUID(),
      scenarioName: input.name,
      simulationCount: this.simulationCount,
      executionTime,
      fuelCost,
      operationalCost,
      revenue,
      eta,
      risks,
      recommendations,
      comparison: {
        baseline: this.baselineMetrics,
        scenario: scenarioMetrics,
        delta,
        deltaPercent
      },
      confidence: this.calculateConfidence(fuelCost, operationalCost)
    };
  }

  /**
   * Run single simulation iteration
   */
  private runIteration(input: ScenarioInput): ScenarioMetrics {
    // Base values
    let fuelCost = this.baselineMetrics.fuelCost;
    let operationalCost = this.baselineMetrics.operationalCost;
    let revenue = this.baselineMetrics.revenue;
    let eta = this.baselineMetrics.eta;

    // Apply variable effects with randomness
    for (const variable of input.variables) {
      const randomValue = this.generateRandomValue(variable);
      const impactFactor = randomValue / variable.currentValue;

      switch (variable.name.toLowerCase()) {
        case 'engine_rpm':
        case 'rpm':
          fuelCost *= Math.pow(impactFactor, 1.3); // Fuel increases faster than RPM
          eta /= impactFactor; // ETA decreases with speed
          break;
        case 'speed':
        case 'velocidade':
          fuelCost *= Math.pow(impactFactor, 2.5); // Fuel consumption is exponential
          eta /= impactFactor;
          break;
        case 'crew_size':
        case 'tripulacao':
          operationalCost *= impactFactor;
          break;
        case 'fuel_price':
        case 'preco_combustivel':
          fuelCost *= impactFactor;
          break;
        case 'charter_rate':
        case 'frete':
          revenue *= impactFactor;
          break;
        case 'maintenance_delay':
        case 'atraso_manutencao':
          eta += randomValue * (impactFactor - 1) * 2;
          operationalCost *= 1 + (impactFactor - 1) * 0.5;
          break;
      }
    }

    // Add market volatility
    const marketNoise = this.normalRandom(1, 0.05);
    fuelCost *= marketNoise;
    revenue *= this.normalRandom(1, 0.08);

    // Weather impact
    const weatherFactor = this.normalRandom(1, 0.1);
    eta *= weatherFactor;
    fuelCost *= Math.pow(weatherFactor, 0.5);

    return {
      fuelCost: Math.max(0, fuelCost),
      operationalCost: Math.max(0, operationalCost),
      revenue: Math.max(0, revenue),
      eta: Math.max(1, eta),
      riskScore: 0 // Calculated later
    };
  }

  /**
   * Generate random value based on distribution
   */
  private generateRandomValue(variable: ScenarioVariable): number {
    const proposed = variable.proposedValue;
    const stdDev = variable.stdDev || proposed * 0.1;

    switch (variable.distribution) {
      case 'normal':
        return this.normalRandom(proposed, stdDev);
      case 'lognormal':
        return this.lognormalRandom(proposed, stdDev);
      case 'uniform':
        const min = variable.min || proposed * 0.8;
        const max = variable.max || proposed * 1.2;
        return min + Math.random() * (max - min);
      case 'triangular':
        const a = variable.min || proposed * 0.8;
        const b = variable.max || proposed * 1.2;
        const c = proposed;
        return this.triangularRandom(a, b, c);
      default:
        return proposed;
    }
  }

  /**
   * Normal distribution random
   */
  private normalRandom(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }

  /**
   * Lognormal distribution random
   */
  private lognormalRandom(mean: number, stdDev: number): number {
    const mu = Math.log(mean * mean / Math.sqrt(stdDev * stdDev + mean * mean));
    const sigma = Math.sqrt(Math.log(1 + (stdDev * stdDev) / (mean * mean)));
    return Math.exp(this.normalRandom(mu, sigma));
  }

  /**
   * Triangular distribution random
   */
  private triangularRandom(a: number, b: number, c: number): number {
    const u = Math.random();
    const fc = (c - a) / (b - a);
    if (u < fc) {
      return a + Math.sqrt(u * (b - a) * (c - a));
    }
    return b - Math.sqrt((1 - u) * (b - a) * (b - c));
  }

  /**
   * Calculate statistics from results
   */
  private calculateStats(values: number[]): SimulationResult {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      percentiles: {
        p10: sorted[Math.floor(n * 0.1)],
        p50: sorted[Math.floor(n * 0.5)],
        p90: sorted[Math.floor(n * 0.9)]
      },
      min: sorted[0],
      max: sorted[n - 1],
      distribution: this.createHistogram(sorted, 20)
    };
  }

  /**
   * Create histogram for distribution visualization
   */
  private createHistogram(sorted: number[], bins: number): number[] {
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const binWidth = (max - min) / bins;
    const histogram = new Array(bins).fill(0);

    for (const value of sorted) {
      const binIndex = Math.min(bins - 1, Math.floor((value - min) / binWidth));
      histogram[binIndex]++;
    }

    return histogram.map(count => count / sorted.length);
  }

  /**
   * Assess risks based on simulation results
   */
  private assessRisks(
    input: ScenarioInput,
    fuelCost: SimulationResult,
    opCost: SimulationResult,
    eta: SimulationResult
  ): RiskAssessment[] {
    const risks: RiskAssessment[] = [];

    // Cost overrun risk
    const costOverrunProb = (fuelCost.percentiles.p90 - fuelCost.mean) / fuelCost.mean;
    if (costOverrunProb > 0.15) {
      risks.push({
        type: 'cost-overrun',
        severity: costOverrunProb > 0.25 ? 'high' : 'medium',
        probability: Math.min(0.95, costOverrunProb * 3),
        impact: `Custo pode exceder previsão em até ${(costOverrunProb * 100).toFixed(0)}%`,
        mitigation: 'Negociar contratos de combustível fixo ou hedge'
      });
    }

    // ETA delay risk
    const etaVariance = eta.stdDev / eta.mean;
    if (etaVariance > 0.1) {
      risks.push({
        type: 'eta-delay',
        severity: etaVariance > 0.2 ? 'high' : 'medium',
        probability: Math.min(0.9, etaVariance * 4),
        impact: `ETA pode variar em ±${(etaVariance * 100).toFixed(0)}%`,
        mitigation: 'Considerar rotas alternativas ou buffer de tempo'
      });
    }

    // High speed risk (if applicable)
    const speedVariable = input.variables.find(v => 
      v.name.toLowerCase().includes('speed') || v.name.toLowerCase().includes('rpm')
    );
    if (speedVariable && speedVariable.proposedValue > speedVariable.currentValue * 1.1) {
      risks.push({
        type: 'equipment-stress',
        severity: 'medium',
        probability: 0.35,
        impact: 'Aumento de velocidade pode acelerar desgaste do motor',
        mitigation: 'Monitorar vibração e temperatura do motor de perto'
      });
    }

    // Fuel shortage risk
    if (fuelCost.percentiles.p90 > this.baselineMetrics.fuelCost * 1.3) {
      risks.push({
        type: 'fuel-budget',
        severity: 'high',
        probability: 0.45,
        impact: 'Orçamento de combustível pode ser insuficiente',
        mitigation: 'Reservar 20% adicional ou otimizar rota'
      });
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    input: ScenarioInput,
    fuelCost: SimulationResult,
    risks: RiskAssessment[]
  ): ScenarioRecommendation[] {
    const recommendations: ScenarioRecommendation[] = [];

    // Fuel optimization
    if (fuelCost.mean > this.baselineMetrics.fuelCost * 1.05) {
      recommendations.push({
        type: 'fuel',
        action: 'Otimizar velocidade para reduzir consumo',
        priority: 'high',
        expectedBenefit: 'Economia de 8-15% em combustível',
        roi: 2.5
      });
    }

    // Route optimization
    if (risks.some(r => r.type === 'eta-delay')) {
      recommendations.push({
        type: 'route',
        action: 'Avaliar rotas alternativas com menor variabilidade',
        priority: 'medium',
        expectedBenefit: 'Redução de 20% na variância de ETA',
        roi: 1.8
      });
    }

    // Risk mitigation
    if (risks.some(r => r.severity === 'high')) {
      recommendations.push({
        type: 'risk',
        action: 'Implementar hedge de combustível',
        priority: 'high',
        expectedBenefit: 'Proteção contra volatilidade de preços',
        roi: 3.2
      });
    }

    // Crew optimization
    const crewVariable = input.variables.find(v => 
      v.name.toLowerCase().includes('crew') || v.name.toLowerCase().includes('tripulacao')
    );
    if (crewVariable && crewVariable.proposedValue !== crewVariable.currentValue) {
      recommendations.push({
        type: 'crew',
        action: 'Revisar escala de trabalho para eficiência',
        priority: 'medium',
        expectedBenefit: 'Economia de 5-10% em custos operacionais',
        roi: 1.5
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(risks: RiskAssessment[]): number {
    return risks.reduce((score, risk) => {
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 }[risk.severity];
      return score + severityWeight * risk.probability * 10;
    }, 0);
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(fuel: SimulationResult, opCost: SimulationResult): number {
    const fuelCV = fuel.stdDev / fuel.mean;
    const opCostCV = opCost.stdDev / opCost.mean;
    const avgCV = (fuelCV + opCostCV) / 2;
    return Math.max(0.5, Math.min(0.98, 1 - avgCV));
  }

  /**
   * Update baseline metrics
   */
  setBaseline(metrics: ScenarioMetrics): void {
    this.baselineMetrics = metrics;
  }

  /**
   * Set simulation count
   */
  setSimulationCount(count: number): void {
    this.simulationCount = Math.max(1000, Math.min(100000, count));
  }
}

// Singleton instance
export const scenarioSimulator = new ScenarioSimulator();
