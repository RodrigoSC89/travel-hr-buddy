/**
 * MÓDULO 3: Simulador Monte Carlo Preditivo
 * 10,000+ simulações para análise de cenários e tomada de decisão
 */

export interface SimulationVariable {
  name: string;
  type: 'normal' | 'uniform' | 'triangular' | 'lognormal';
  params: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
    mode?: number;
  };
  unit: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  variables: SimulationVariable[];
  outputMetrics: string[];
  constraints?: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  }[];
}

export interface SimulationResult {
  scenarioId: string;
  iterations: number;
  executionTimeMs: number;
  metrics: {
    [key: string]: {
      mean: number;
      median: number;
      stdDev: number;
      min: number;
      max: number;
      p5: number;
      p10: number;
      p25: number;
      p75: number;
      p90: number;
      p95: number;
      histogram: { bin: number; count: number }[];
    };
  };
  convergenceAchieved: boolean;
  sensitivityAnalysis: {
    variable: string;
    correlation: number;
    elasticity: number;
  }[];
  riskMetrics: {
    valueAtRisk95: number;
    conditionalVaR: number;
    probabilityOfLoss: number;
    expectedShortfall: number;
  };
}

export interface ComparisonResult {
  baselineScenario: string;
  comparisonScenario: string;
  metricComparisons: {
    metric: string;
    baselineMean: number;
    comparisonMean: number;
    difference: number;
    percentChange: number;
    significanceLevel: number;
  }[];
  recommendation: string;
  confidence: number;
}

/**
 * Box-Muller transform for normal distribution
 */
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Triangular distribution random
 */
function triangularRandom(min: number, max: number, mode: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);
  
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Lognormal distribution random
 */
function lognormalRandom(mean: number, stdDev: number): number {
  const mu = Math.log(mean ** 2 / Math.sqrt(stdDev ** 2 + mean ** 2));
  const sigma = Math.sqrt(Math.log(1 + (stdDev ** 2 / mean ** 2)));
  return Math.exp(normalRandom(mu, sigma));
}

/**
 * Generate random value based on distribution type
 */
function generateRandomValue(variable: SimulationVariable): number {
  const { type, params } = variable;
  
  switch (type) {
    case 'normal':
      return normalRandom(params.mean || 0, params.stdDev || 1);
    case 'uniform':
      return (params.min || 0) + Math.random() * ((params.max || 1) - (params.min || 0));
    case 'triangular':
      return triangularRandom(
        params.min || 0,
        params.max || 1,
        params.mode || (params.min! + params.max!) / 2
      );
    case 'lognormal':
      return lognormalRandom(params.mean || 1, params.stdDev || 0.5);
    default:
      return params.mean || 0;
  }
}

/**
 * Calculate percentile of sorted array
 */
function percentile(sortedArr: number[], p: number): number {
  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return sortedArr[lower];
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Calculate statistics for an array
 */
function calculateStats(values: number[]): SimulationResult['metrics'][string] {
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Create histogram
  const binCount = 50;
  const min = sorted[0];
  const max = sorted[n - 1];
  const binWidth = (max - min) / binCount;
  const histogram: { bin: number; count: number }[] = [];
  
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && v < binEnd).length;
    histogram.push({ bin: binStart + binWidth / 2, count });
  }

  return {
    mean,
    median: percentile(sorted, 50),
    stdDev,
    min,
    max,
    p5: percentile(sorted, 5),
    p10: percentile(sorted, 10),
    p25: percentile(sorted, 25),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    histogram,
  };
}

/**
 * Calculate Pearson correlation
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}

/**
 * Maritime Monte Carlo Simulator
 */
export class MonteCarloSimulator {
  private defaultIterations: number;
  private convergenceThreshold: number;

  constructor(config?: { defaultIterations?: number; convergenceThreshold?: number }) {
    this.defaultIterations = config?.defaultIterations || 10000;
    this.convergenceThreshold = config?.convergenceThreshold || 0.001;
  }

  /**
   * Run Monte Carlo simulation for a scenario
   */
  simulate(
    scenario: ScenarioConfig,
    modelFunction: (inputs: Record<string, number>) => Record<string, number>,
    iterations: number = this.defaultIterations
  ): SimulationResult {
    const startTime = performance.now();
    
    const inputSamples: Record<string, number[]> = {};
    const outputSamples: Record<string, number[]> = {};
    
    // Initialize arrays
    for (const variable of scenario.variables) {
      inputSamples[variable.name] = [];
    }
    for (const metric of scenario.outputMetrics) {
      outputSamples[metric] = [];
    }

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      // Generate random inputs
      const inputs: Record<string, number> = {};
      for (const variable of scenario.variables) {
        const value = generateRandomValue(variable);
        inputs[variable.name] = value;
        inputSamples[variable.name].push(value);
      }
      
      // Run model
      const outputs = modelFunction(inputs);
      
      // Check constraints
      let passesConstraints = true;
      if (scenario.constraints) {
        for (const constraint of scenario.constraints) {
          const value = outputs[constraint.metric];
          switch (constraint.operator) {
            case 'gt': passesConstraints = value > constraint.value; break;
            case 'lt': passesConstraints = value < constraint.value; break;
            case 'gte': passesConstraints = value >= constraint.value; break;
            case 'lte': passesConstraints = value <= constraint.value; break;
            case 'eq': passesConstraints = Math.abs(value - constraint.value) < 0.0001; break;
          }
          if (!passesConstraints) break;
        }
      }
      
      // Store outputs
      for (const metric of scenario.outputMetrics) {
        outputSamples[metric].push(outputs[metric] || 0);
      }
    }

    // Calculate metrics for each output
    const metrics: SimulationResult['metrics'] = {};
    for (const metric of scenario.outputMetrics) {
      metrics[metric] = calculateStats(outputSamples[metric]);
    }

    // Sensitivity analysis (correlation with primary output)
    const primaryOutput = scenario.outputMetrics[0];
    const sensitivityAnalysis = scenario.variables.map(variable => {
      const correlation = pearsonCorrelation(
        inputSamples[variable.name],
        outputSamples[primaryOutput]
      );
      
      // Elasticity: % change in output / % change in input
      const inputMean = inputSamples[variable.name].reduce((a, b) => a + b, 0) / iterations;
      const outputMean = metrics[primaryOutput].mean;
      const elasticity = (correlation * metrics[primaryOutput].stdDev * inputMean) / 
                        (calculateStats(inputSamples[variable.name]).stdDev * outputMean);
      
      return {
        variable: variable.name,
        correlation: isNaN(correlation) ? 0 : correlation,
        elasticity: isNaN(elasticity) ? 0 : elasticity,
      };
    }).sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    // Risk metrics for primary output
    const primaryStats = metrics[primaryOutput];
    const sortedPrimary = [...outputSamples[primaryOutput]].sort((a, b) => a - b);
    const lossThreshold = 0; // Assume losses are negative values
    const losses = sortedPrimary.filter(v => v < lossThreshold);
    
    const riskMetrics = {
      valueAtRisk95: primaryStats.p5,
      conditionalVaR: losses.length > 0 
        ? losses.reduce((a, b) => a + b, 0) / losses.length 
        : 0,
      probabilityOfLoss: losses.length / iterations,
      expectedShortfall: losses.length > 0
        ? losses.slice(0, Math.ceil(losses.length * 0.05)).reduce((a, b) => a + b, 0) / 
          Math.ceil(losses.length * 0.05)
        : 0,
    };

    // Check convergence
    const convergenceAchieved = this.checkConvergence(outputSamples[primaryOutput]);

    return {
      scenarioId: scenario.id,
      iterations,
      executionTimeMs: performance.now() - startTime,
      metrics,
      convergenceAchieved,
      sensitivityAnalysis,
      riskMetrics,
    };
  }

  /**
   * Compare two scenarios
   */
  compareScenarios(
    baseline: SimulationResult,
    comparison: SimulationResult,
    primaryMetric: string
  ): ComparisonResult {
    const metricComparisons = Object.keys(baseline.metrics).map(metric => {
      const baselineMean = baseline.metrics[metric].mean;
      const comparisonMean = comparison.metrics[metric].mean;
      const difference = comparisonMean - baselineMean;
      const percentChange = (difference / baselineMean) * 100;
      
      // Simple significance test (t-test approximation)
      const pooledStdErr = Math.sqrt(
        (baseline.metrics[metric].stdDev ** 2 + comparison.metrics[metric].stdDev ** 2) / 
        (baseline.iterations + comparison.iterations)
      );
      const tStat = difference / pooledStdErr;
      const significanceLevel = 1 - this.normalCDF(Math.abs(tStat));
      
      return {
        metric,
        baselineMean,
        comparisonMean,
        difference,
        percentChange,
        significanceLevel,
      };
    });

    const primaryComparison = metricComparisons.find(m => m.metric === primaryMetric);
    const isImprovement = primaryComparison && primaryComparison.difference > 0;
    const isSignificant = primaryComparison && primaryComparison.significanceLevel < 0.05;

    let recommendation: string;
    if (isImprovement && isSignificant) {
      recommendation = `Cenário de comparação mostra melhoria significativa de ${primaryComparison!.percentChange.toFixed(1)}% em ${primaryMetric}. Recomenda-se adotar.`;
    } else if (isImprovement && !isSignificant) {
      recommendation = `Cenário de comparação mostra melhoria marginal (${primaryComparison!.percentChange.toFixed(1)}%), mas não é estatisticamente significativo. Avaliar custos de implementação.`;
    } else if (!isImprovement && isSignificant) {
      recommendation = `Cenário de comparação é significativamente pior em ${primaryComparison!.percentChange.toFixed(1)}%. Não recomendado.`;
    } else {
      recommendation = `Diferença não significativa entre cenários. Manter baseline.`;
    }

    return {
      baselineScenario: baseline.scenarioId,
      comparisonScenario: comparison.scenarioId,
      metricComparisons,
      recommendation,
      confidence: isSignificant ? 0.95 : 0.5,
    };
  }

  private checkConvergence(samples: number[]): boolean {
    if (samples.length < 1000) return false;
    
    // Check if running mean has stabilized
    const n = samples.length;
    const halfMean = samples.slice(0, n / 2).reduce((a, b) => a + b, 0) / (n / 2);
    const fullMean = samples.reduce((a, b) => a + b, 0) / n;
    
    return Math.abs(fullMean - halfMean) / fullMean < this.convergenceThreshold;
  }

  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
  }
}

// Maritime-specific scenario templates
export const MARITIME_SCENARIOS = {
  fuelCostAnalysis: (baseConsumption: number, basePrice: number): ScenarioConfig => ({
    id: 'fuel-cost',
    name: 'Análise de Custo de Combustível',
    description: 'Simula variações de preço e consumo de combustível',
    variables: [
      {
        name: 'fuelPrice',
        type: 'lognormal',
        params: { mean: basePrice, stdDev: basePrice * 0.2 },
        unit: 'USD/ton',
      },
      {
        name: 'consumption',
        type: 'normal',
        params: { mean: baseConsumption, stdDev: baseConsumption * 0.1 },
        unit: 'tons/day',
      },
      {
        name: 'voyageDays',
        type: 'triangular',
        params: { min: 10, max: 25, mode: 15 },
        unit: 'days',
      },
    ],
    outputMetrics: ['totalCost', 'costPerMile', 'fuelEfficiency'],
  }),

  revenueForcast: (baseRevenue: number, baseRate: number): ScenarioConfig => ({
    id: 'revenue-forecast',
    name: 'Previsão de Receita',
    description: 'Projeta receita considerando variações de demanda e taxas',
    variables: [
      {
        name: 'freightRate',
        type: 'normal',
        params: { mean: baseRate, stdDev: baseRate * 0.15 },
        unit: 'USD/TEU',
      },
      {
        name: 'utilization',
        type: 'triangular',
        params: { min: 0.6, max: 0.98, mode: 0.85 },
        unit: '%',
      },
      {
        name: 'demandGrowth',
        type: 'normal',
        params: { mean: 0.03, stdDev: 0.02 },
        unit: '%',
      },
    ],
    outputMetrics: ['totalRevenue', 'profitMargin', 'revenuePerDay'],
  }),

  maintenanceRisk: (fleetAge: number): ScenarioConfig => ({
    id: 'maintenance-risk',
    name: 'Risco de Manutenção',
    description: 'Simula custos e riscos de manutenção baseado na idade da frota',
    variables: [
      {
        name: 'failureRate',
        type: 'lognormal',
        params: { mean: 0.02 * fleetAge, stdDev: 0.01 * fleetAge },
        unit: 'failures/year',
      },
      {
        name: 'repairCost',
        type: 'lognormal',
        params: { mean: 50000, stdDev: 30000 },
        unit: 'USD',
      },
      {
        name: 'downtimeDays',
        type: 'triangular',
        params: { min: 2, max: 30, mode: 7 },
        unit: 'days',
      },
    ],
    outputMetrics: ['annualMaintenanceCost', 'expectedDowntime', 'costOfDowntime'],
  }),
};

export const monteCarloSimulator = new MonteCarloSimulator();
