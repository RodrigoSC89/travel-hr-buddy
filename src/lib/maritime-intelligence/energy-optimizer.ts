/**
 * Otimizador de Performance Energética Contínua (OPEC)
 * Real-time engine optimization for fuel efficiency
 */

export interface EngineState {
  rpm: number; // 500-2500
  fuelPressure: number; // 0-400 bar
  fuelTemperature: number; // 40-80°C
  coolantTemperature: number; // 70-95°C
  scavengerAirPressure: number; // 2-4 bar
  turboLoad: number; // 0-100%
  propellerBladeAngle: number; // 0-90°
  exhaustTemperature: number; // 200-500°C
  powerOutput: number; // kW
  fuelConsumption: number; // tons/day
}

export interface OptimizationScenario {
  id: string;
  name: string;
  adjustments: Partial<EngineState>;
  predictedFuelConsumption: number;
  fuelSavings: number; // tons/day
  moneySavings: number; // $/day
  etaImpact: number; // hours
  emissionsReduction: number; // %
  engineStress: number; // 0-100%
  confidence: number;
  status: 'recommended' | 'conditional' | 'rejected';
  reason: string;
}

export interface OptimizationResult {
  timestamp: Date;
  currentState: EngineState;
  scenarios: OptimizationScenario[];
  recommendedScenario: OptimizationScenario | null;
  potentialSavings: {
    daily: number;
    monthly: number;
    annual: number;
  };
  analysisTime: number;
}

export interface OptimizationHistory {
  date: Date;
  implementedScenario?: string;
  actualSavings: number;
  fuelBefore: number;
  fuelAfter: number;
  verified: boolean;
}

export interface EnergyMetrics {
  currentEfficiency: number; // kWh/gram fuel
  targetEfficiency: number;
  efficiencyGap: number;
  fuelQualityIndex: number;
  maintenanceImpact: number;
  weatherImpact: number;
}

// Fuel price per ton (HFO average)
const FUEL_PRICE_PER_TON = 450; // USD

/**
 * Energy Performance Optimizer
 */
export class EnergyPerformanceOptimizer {
  private currentState: EngineState;
  private optimizationHistory: OptimizationHistory[] = [];
  private isOptimizing = false;

  constructor() {
    this.currentState = this.getDefaultState();
  }

  private getDefaultState(): EngineState {
    return {
      rpm: 2000,
      fuelPressure: 280,
      fuelTemperature: 65,
      coolantTemperature: 82,
      scavengerAirPressure: 3.2,
      turboLoad: 78,
      propellerBladeAngle: 42,
      exhaustTemperature: 380,
      powerOutput: 8200,
      fuelConsumption: 48
    };
  }

  /**
   * Update current engine state from sensors
   */
  updateState(state: Partial<EngineState>): void {
    this.currentState = { ...this.currentState, ...state };
  }

  /**
   * Run optimization analysis
   */
  async optimize(options?: {
    maxEtaDelay?: number; // hours
    minPower?: number; // kW
    prioritize?: 'fuel' | 'emissions' | 'balanced';
  }): Promise<OptimizationResult> {
    this.isOptimizing = true;
    const startTime = Date.now();
    const maxEtaDelay = options?.maxEtaDelay ?? 6;
    const minPower = options?.minPower ?? 7000;
    const priority = options?.prioritize ?? 'balanced';

    const scenarios: OptimizationScenario[] = [];

    // Scenario A: Slight RPM reduction
    const scenarioA = this.evaluateScenario({
      id: 'scenario-a',
      name: 'Slight Speed Reduction',
      adjustments: {
        rpm: this.currentState.rpm - 50,
        turboLoad: this.currentState.turboLoad - 3
      }
    }, maxEtaDelay, minPower);
    scenarios.push(scenarioA);

    // Scenario B: Moderate RPM reduction
    const scenarioB = this.evaluateScenario({
      id: 'scenario-b',
      name: 'Moderate Speed Reduction',
      adjustments: {
        rpm: this.currentState.rpm - 100,
        turboLoad: this.currentState.turboLoad - 6,
        propellerBladeAngle: this.currentState.propellerBladeAngle - 3
      }
    }, maxEtaDelay, minPower);
    scenarios.push(scenarioB);

    // Scenario C: Aggressive optimization
    const scenarioC = this.evaluateScenario({
      id: 'scenario-c',
      name: 'Aggressive Optimization',
      adjustments: {
        rpm: this.currentState.rpm - 150,
        turboLoad: this.currentState.turboLoad - 10,
        propellerBladeAngle: this.currentState.propellerBladeAngle - 5,
        coolantTemperature: this.currentState.coolantTemperature - 3
      }
    }, maxEtaDelay, minPower);
    scenarios.push(scenarioC);

    // Scenario D: Fuel temperature optimization
    const scenarioD = this.evaluateScenario({
      id: 'scenario-d',
      name: 'Fuel Temperature Tuning',
      adjustments: {
        fuelTemperature: this.currentState.fuelTemperature + 5,
        fuelPressure: this.currentState.fuelPressure - 10
      }
    }, maxEtaDelay, minPower);
    scenarios.push(scenarioD);

    // Scenario E: Propeller optimization only
    const scenarioE = this.evaluateScenario({
      id: 'scenario-e',
      name: 'Propeller Blade Optimization',
      adjustments: {
        propellerBladeAngle: this.currentState.propellerBladeAngle + 2
      }
    }, maxEtaDelay, minPower);
    scenarios.push(scenarioE);

    // Sort by priority
    if (priority === 'fuel') {
      scenarios.sort((a, b) => b.fuelSavings - a.fuelSavings);
    } else if (priority === 'emissions') {
      scenarios.sort((a, b) => b.emissionsReduction - a.emissionsReduction);
    } else {
      // Balanced: weight fuel savings and emissions
      scenarios.sort((a, b) => (b.fuelSavings + b.emissionsReduction) - (a.fuelSavings + a.emissionsReduction));
    }

    // Find recommended scenario
    const recommended = scenarios.find(s => s.status === 'recommended') || null;

    this.isOptimizing = false;

    const bestSaving = recommended?.moneySavings ?? scenarios[0]?.moneySavings ?? 0;

    return {
      timestamp: new Date(),
      currentState: this.currentState,
      scenarios,
      recommendedScenario: recommended,
      potentialSavings: {
        daily: bestSaving,
        monthly: bestSaving * 30,
        annual: bestSaving * 365
      },
      analysisTime: Date.now() - startTime
    };
  }

  private evaluateScenario(
    config: { id: string; name: string; adjustments: Partial<EngineState> },
    maxEtaDelay: number,
    minPower: number
  ): OptimizationScenario {
    const newState = { ...this.currentState, ...config.adjustments };
    
    // Calculate fuel consumption based on engine model
    const rpmRatio = newState.rpm / this.currentState.rpm;
    const turboRatio = newState.turboLoad / this.currentState.turboLoad;
    
    // Fuel consumption roughly proportional to RPM^2.5 for marine engines
    const fuelReduction = 1 - Math.pow(rpmRatio, 2.5) * Math.pow(turboRatio, 0.5);
    const predictedFuelConsumption = this.currentState.fuelConsumption * (1 - fuelReduction * 0.8);
    const fuelSavings = this.currentState.fuelConsumption - predictedFuelConsumption;
    const moneySavings = fuelSavings * FUEL_PRICE_PER_TON;

    // ETA impact calculation (speed roughly proportional to RPM)
    const speedRatio = rpmRatio;
    const etaImpact = speedRatio < 1 ? ((1 / speedRatio) - 1) * 24 : 0; // hours per day

    // Emissions reduction
    const emissionsReduction = fuelReduction * 100;

    // Engine stress calculation
    const rpmFromOptimal = Math.abs(newState.rpm - 1800) / 700; // Optimal around 1800 RPM
    const tempStress = Math.max(0, (newState.coolantTemperature - 85) / 10);
    const engineStress = Math.min(100, (rpmFromOptimal + tempStress) * 50);

    // Power output estimation
    const estimatedPower = this.currentState.powerOutput * rpmRatio * turboRatio;

    // Determine status
    let status: OptimizationScenario['status'] = 'recommended';
    let reason = 'Safe to implement, meets all constraints';

    if (estimatedPower < minPower) {
      status = 'rejected';
      reason = `Power output ${estimatedPower.toFixed(0)} kW below minimum ${minPower} kW`;
    } else if (etaImpact > maxEtaDelay) {
      status = 'conditional';
      reason = `ETA delay ${etaImpact.toFixed(1)}h exceeds limit ${maxEtaDelay}h`;
    } else if (engineStress > 70) {
      status = 'conditional';
      reason = `Engine stress ${engineStress.toFixed(0)}% above optimal range`;
    }

    return {
      ...config,
      predictedFuelConsumption,
      fuelSavings,
      moneySavings,
      etaImpact,
      emissionsReduction,
      engineStress,
      confidence: 0.85,
      status,
      reason
    };
  }

  /**
   * Implement a scenario
   */
  implementScenario(scenarioId: string): { success: boolean; message: string } {
    // In real system, this would send commands to engine control
    const history: OptimizationHistory = {
      date: new Date(),
      implementedScenario: scenarioId,
      actualSavings: 0,
      fuelBefore: this.currentState.fuelConsumption,
      fuelAfter: this.currentState.fuelConsumption,
      verified: false
    };

    this.optimizationHistory.push(history);

    return {
      success: true,
      message: `Scenario ${scenarioId} queued for implementation. Monitor for 4 hours to verify predictions.`
    };
  }

  /**
   * Get energy metrics
   */
  getEnergyMetrics(): EnergyMetrics {
    const efficiency = (this.currentState.powerOutput * 1000) / (this.currentState.fuelConsumption * 1000 / 24);
    const targetEfficiency = 0.45; // kWh per gram

    return {
      currentEfficiency: efficiency / 1000,
      targetEfficiency,
      efficiencyGap: ((targetEfficiency - efficiency / 1000) / targetEfficiency) * 100,
      fuelQualityIndex: 92,
      maintenanceImpact: 3,
      weatherImpact: 5
    };
  }

  /**
   * Get optimization history
   */
  getHistory(): OptimizationHistory[] {
    return this.optimizationHistory;
  }

  /**
   * Get current engine state
   */
  getCurrentState(): EngineState {
    return { ...this.currentState };
  }

  /**
   * Calculate annual savings potential
   */
  getAnnualSavingsPotential(): {
    conservative: number;
    moderate: number;
    aggressive: number;
  } {
    const baseFuel = this.currentState.fuelConsumption;
    
    return {
      conservative: baseFuel * 0.03 * FUEL_PRICE_PER_TON * 365, // 3% savings
      moderate: baseFuel * 0.05 * FUEL_PRICE_PER_TON * 365,     // 5% savings
      aggressive: baseFuel * 0.07 * FUEL_PRICE_PER_TON * 365    // 7% savings
    };
  }

  /**
   * Get real-time optimization status
   */
  getOptimizationStatus(): {
    isOptimizing: boolean;
    lastOptimization: Date | null;
    implementedCount: number;
    totalSavings: number;
  } {
    const verified = this.optimizationHistory.filter(h => h.verified);
    const totalSavings = verified.reduce((sum, h) => sum + h.actualSavings, 0);

    return {
      isOptimizing: this.isOptimizing,
      lastOptimization: this.optimizationHistory.length > 0 
        ? this.optimizationHistory[this.optimizationHistory.length - 1].date 
        : null,
      implementedCount: this.optimizationHistory.length,
      totalSavings
    };
  }
}

// Export singleton
export const energyOptimizer = new EnergyPerformanceOptimizer();
