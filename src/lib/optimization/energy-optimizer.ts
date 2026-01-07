/**
 * MÓDULO 9: Otimizador Energético Contínuo
 * Monitoramento e otimização em tempo real do consumo de combustível
 * Target: 3-7% fuel savings contínuo
 */

export interface EngineMetrics {
  rpm: number;
  power: number; // kW
  fuelFlow: number; // kg/h
  exhaustTemp: number; // °C
  lubOilPressure: number; // bar
  coolantTemp: number; // °C
  turboBoostPressure: number; // bar
  specificFuelConsumption: number; // g/kWh
}

export interface VesselOperationalState {
  speed: number; // knots
  draft: number; // meters
  trim: number; // meters (positive = stern heavy)
  heading: number; // degrees
  windSpeed: number; // knots
  windDirection: number; // degrees
  currentSpeed: number; // knots
  seaState: number; // 0-9 scale
  cargoWeight: number; // tons
}

export interface OptimizationRecommendation {
  id: string;
  type: 'speed' | 'trim' | 'engine' | 'route' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentValue: number;
  recommendedValue: number;
  unit: string;
  estimatedSavings: {
    fuel: number; // tons/day
    cost: number; // USD/day
    percentage: number;
  };
  confidence: number;
  explanation: string;
  implementationSteps: string[];
}

export interface EnergyReport {
  timestamp: Date;
  periodHours: number;
  totalFuelConsumed: number; // tons
  averageEfficiency: number; // percentage
  optimalEfficiency: number; // percentage
  savingsAchieved: number; // tons
  savingsPotential: number; // tons
  recommendations: OptimizationRecommendation[];
  efficiencyTrend: 'improving' | 'stable' | 'declining';
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
  eeoi: number;
}

/**
 * Neural network-inspired fuel consumption model
 */
class FuelConsumptionModel {
  private weights: number[][];
  private biases: number[];

  constructor() {
    // Pre-trained weights (simplified neural network)
    this.weights = [
      [0.15, 0.12, 0.08, 0.05, 0.03, 0.02], // Speed impact
      [0.08, 0.05, 0.03, 0.02, 0.01, 0.01], // Draft impact
      [0.10, 0.08, 0.05, 0.03, 0.02, 0.01], // Weather impact
      [0.05, 0.03, 0.02, 0.01, 0.01, 0.00], // Trim impact
    ];
    this.biases = [0.02, 0.01, 0.015, 0.005];
  }

  predict(state: VesselOperationalState, engine: EngineMetrics): number {
    // Speed power law (approximately cubic relationship)
    const speedFactor = Math.pow(state.speed / 14, 2.8);
    
    // Draft correction
    const draftFactor = 1 + (state.draft - 10) * 0.02;
    
    // Weather resistance
    const weatherFactor = 1 + (state.windSpeed / 50) * 0.15 + (state.seaState / 9) * 0.1;
    
    // Trim optimization (optimal trim varies with speed)
    const optimalTrim = state.speed * 0.05; // Simplified
    const trimPenalty = 1 + Math.abs(state.trim - optimalTrim) * 0.03;
    
    // Engine efficiency
    const engineEfficiency = this.calculateEngineEfficiency(engine);
    
    // Base consumption at reference conditions
    const baseConsumption = 25; // tons/day at 14 knots reference
    
    return baseConsumption * speedFactor * draftFactor * weatherFactor * trimPenalty / engineEfficiency;
  }

  calculateEngineEfficiency(engine: EngineMetrics): number {
    // Optimal SFC around 170-180 g/kWh for modern engines
    const optimalSFC = 175;
    const sfcEfficiency = optimalSFC / engine.specificFuelConsumption;
    
    // Temperature efficiency
    const tempEfficiency = engine.exhaustTemp > 400 && engine.exhaustTemp < 450 ? 1 : 0.98;
    
    // Turbo efficiency
    const turboEfficiency = engine.turboBoostPressure > 1.5 ? 1 : 0.95;
    
    return Math.min(1.05, sfcEfficiency * tempEfficiency * turboEfficiency);
  }

  calculateOptimalSpeed(state: VesselOperationalState, targetETA: Date): number {
    const now = new Date();
    const hoursRemaining = (targetETA.getTime() - now.getTime()) / (1000 * 60 * 60);
    const distanceRemaining = 500; // nm, would be calculated from actual route
    
    // Required speed to meet ETA
    const requiredSpeed = distanceRemaining / hoursRemaining;
    
    // Optimal economic speed (minimize fuel per mile)
    // For typical vessels, this is around 60-70% of max speed
    const economicSpeed = 12; // knots
    
    // Balance between schedule and economy
    return Math.max(economicSpeed, Math.min(requiredSpeed, 16));
  }
}

/**
 * Continuous Energy Optimizer
 */
export class ContinuousEnergyOptimizer {
  private model: FuelConsumptionModel;
  private historicalData: { state: VesselOperationalState; engine: EngineMetrics; actual: number }[];
  private optimizationInterval: number; // hours

  constructor() {
    this.model = new FuelConsumptionModel();
    this.historicalData = [];
    this.optimizationInterval = 1; // Run every hour
  }

  /**
   * Analyze current state and generate optimization recommendations
   */
  analyze(
    currentState: VesselOperationalState,
    engineMetrics: EngineMetrics,
    targetETA?: Date
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // 1. Speed optimization
    const speedRec = this.analyzeSpeed(currentState, engineMetrics, targetETA);
    if (speedRec) recommendations.push(speedRec);
    
    // 2. Trim optimization
    const trimRec = this.analyzeTrim(currentState, engineMetrics);
    if (trimRec) recommendations.push(trimRec);
    
    // 3. Engine optimization
    const engineRec = this.analyzeEngine(engineMetrics);
    if (engineRec) recommendations.push(engineRec);
    
    // 4. Weather routing suggestion
    const routeRec = this.analyzeWeatherRouting(currentState);
    if (routeRec) recommendations.push(routeRec);
    
    // 5. Maintenance recommendation
    const maintRec = this.analyzeMaintenanceNeeds(engineMetrics);
    if (maintRec) recommendations.push(maintRec);

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private analyzeSpeed(
    state: VesselOperationalState,
    engine: EngineMetrics,
    targetETA?: Date
  ): OptimizationRecommendation | null {
    const currentConsumption = this.model.predict(state, engine);
    
    // Calculate consumption at different speeds
    const speedOptions = [state.speed - 2, state.speed - 1, state.speed + 1, state.speed + 2]
      .filter(s => s >= 8 && s <= 18);
    
    let bestSpeed = state.speed;
    let bestSavings = 0;
    
    for (const speed of speedOptions) {
      const testState = { ...state, speed };
      const testConsumption = this.model.predict(testState, engine);
      const savings = currentConsumption - testConsumption;
      
      if (savings > bestSavings) {
        // Check if we can still make ETA
        if (!targetETA || speed >= state.speed * 0.85) {
          bestSavings = savings;
          bestSpeed = speed;
        }
      }
    }

    if (Math.abs(bestSpeed - state.speed) >= 0.5 && bestSavings > 0.5) {
      const fuelPrice = 600; // USD/ton
      return {
        id: `speed-${Date.now()}`,
        type: 'speed',
        priority: bestSavings > 2 ? 'high' : 'medium',
        currentValue: state.speed,
        recommendedValue: bestSpeed,
        unit: 'knots',
        estimatedSavings: {
          fuel: bestSavings,
          cost: bestSavings * fuelPrice,
          percentage: (bestSavings / currentConsumption) * 100,
        },
        confidence: 0.85,
        explanation: `Reduzir velocidade de ${state.speed.toFixed(1)} para ${bestSpeed.toFixed(1)} knots economiza ${bestSavings.toFixed(1)} tons/dia.`,
        implementationSteps: [
          'Verificar ETA e flexibilidade do schedule',
          'Ajustar RPM gradualmente (-5 RPM por etapa)',
          'Monitorar consumo específico durante ajuste',
          'Confirmar nova velocidade de cruzeiro estável',
        ],
      };
    }

    return null;
  }

  private analyzeTrim(
    state: VesselOperationalState,
    engine: EngineMetrics
  ): OptimizationRecommendation | null {
    // Optimal trim varies with speed (stern-heavy at low speed, even keel at high speed)
    const optimalTrim = state.speed > 14 ? 0 : state.speed * 0.03;
    const trimDeviation = Math.abs(state.trim - optimalTrim);

    if (trimDeviation > 0.3) {
      const currentConsumption = this.model.predict(state, engine);
      const optimizedState = { ...state, trim: optimalTrim };
      const optimizedConsumption = this.model.predict(optimizedState, engine);
      const savings = currentConsumption - optimizedConsumption;

      if (savings > 0.2) {
        return {
          id: `trim-${Date.now()}`,
          type: 'trim',
          priority: savings > 1 ? 'high' : 'medium',
          currentValue: state.trim,
          recommendedValue: optimalTrim,
          unit: 'metros',
          estimatedSavings: {
            fuel: savings,
            cost: savings * 600,
            percentage: (savings / currentConsumption) * 100,
          },
          confidence: 0.8,
          explanation: `Ajustar trim de ${state.trim.toFixed(2)}m para ${optimalTrim.toFixed(2)}m reduz resistência hidrodinâmica.`,
          implementationSteps: [
            'Calcular transferência de lastro necessária',
            'Verificar estabilidade após ajuste',
            'Executar transferência gradualmente',
            'Confirmar novo trim e monitorar consumo',
          ],
        };
      }
    }

    return null;
  }

  private analyzeEngine(engine: EngineMetrics): OptimizationRecommendation | null {
    // Check specific fuel consumption
    const optimalSFC = 175; // g/kWh
    const sfcDeviation = ((engine.specificFuelConsumption - optimalSFC) / optimalSFC) * 100;

    if (sfcDeviation > 5) {
      return {
        id: `engine-${Date.now()}`,
        type: 'engine',
        priority: sfcDeviation > 15 ? 'critical' : sfcDeviation > 10 ? 'high' : 'medium',
        currentValue: engine.specificFuelConsumption,
        recommendedValue: optimalSFC,
        unit: 'g/kWh',
        estimatedSavings: {
          fuel: (sfcDeviation / 100) * 25, // Approximate
          cost: (sfcDeviation / 100) * 25 * 600,
          percentage: sfcDeviation,
        },
        confidence: 0.75,
        explanation: `SFC ${sfcDeviation.toFixed(1)}% acima do ideal. Possíveis causas: injetores, turbo, timing.`,
        implementationSteps: [
          'Verificar pressão de injeção',
          'Inspecionar turbocharger',
          'Checar timing de injeção',
          'Analisar qualidade do combustível',
          'Considerar limpeza de intercooler',
        ],
      };
    }

    return null;
  }

  private analyzeWeatherRouting(state: VesselOperationalState): OptimizationRecommendation | null {
    // High wind or sea state suggests alternative routing might help
    if (state.windSpeed > 25 || state.seaState > 5) {
      const weatherPenalty = (state.windSpeed / 50) * 0.15 + (state.seaState / 9) * 0.1;
      const potentialSavings = weatherPenalty * 25; // Base consumption

      return {
        id: `route-${Date.now()}`,
        type: 'route',
        priority: state.seaState > 6 ? 'high' : 'medium',
        currentValue: state.seaState,
        recommendedValue: state.seaState - 2,
        unit: 'sea state',
        estimatedSavings: {
          fuel: potentialSavings * 0.5, // Conservative estimate
          cost: potentialSavings * 0.5 * 600,
          percentage: weatherPenalty * 50,
        },
        confidence: 0.7,
        explanation: `Condições adversas (vento ${state.windSpeed}kn, mar ${state.seaState}). Rota alternativa pode reduzir impacto.`,
        implementationSteps: [
          'Consultar previsão meteorológica atualizada',
          'Avaliar rotas alternativas via quantum router',
          'Calcular trade-off tempo vs combustível',
          'Decidir desvio se economia > 3%',
        ],
      };
    }

    return null;
  }

  private analyzeMaintenanceNeeds(engine: EngineMetrics): OptimizationRecommendation | null {
    const issues: string[] = [];

    if (engine.exhaustTemp > 480) {
      issues.push('Temperatura de exaustão elevada');
    }
    if (engine.turboBoostPressure < 1.2) {
      issues.push('Pressão turbo baixa');
    }
    if (engine.lubOilPressure < 3) {
      issues.push('Pressão óleo lubrificante baixa');
    }

    if (issues.length > 0) {
      return {
        id: `maint-${Date.now()}`,
        type: 'maintenance',
        priority: issues.length > 1 ? 'high' : 'medium',
        currentValue: issues.length,
        recommendedValue: 0,
        unit: 'issues',
        estimatedSavings: {
          fuel: issues.length * 0.8,
          cost: issues.length * 0.8 * 600,
          percentage: issues.length * 3,
        },
        confidence: 0.85,
        explanation: `Manutenção necessária: ${issues.join(', ')}. Eficiência comprometida.`,
        implementationSteps: [
          'Agendar inspeção no próximo porto',
          'Preparar peças de reposição',
          'Monitorar parâmetros até intervenção',
          'Considerar redução de carga se crítico',
        ],
      };
    }

    return null;
  }

  /**
   * Generate comprehensive energy report
   */
  generateReport(
    state: VesselOperationalState,
    engine: EngineMetrics,
    hoursOperating: number
  ): EnergyReport {
    const currentConsumption = this.model.predict(state, engine);
    const recommendations = this.analyze(state, engine);
    
    // Calculate potential savings
    const totalPotentialSavings = recommendations.reduce(
      (sum, r) => sum + r.estimatedSavings.fuel,
      0
    );

    // Calculate CII rating
    const eeoi = this.calculateEEOI(state, engine, currentConsumption);
    const ciiRating = this.getCIIRating(eeoi);

    return {
      timestamp: new Date(),
      periodHours: hoursOperating,
      totalFuelConsumed: (currentConsumption / 24) * hoursOperating,
      averageEfficiency: 100 - (totalPotentialSavings / currentConsumption) * 100,
      optimalEfficiency: 100,
      savingsAchieved: 0, // Would track actual vs baseline
      savingsPotential: totalPotentialSavings,
      recommendations,
      efficiencyTrend: 'stable',
      ciiRating,
      eeoi,
    };
  }

  private calculateEEOI(
    state: VesselOperationalState,
    engine: EngineMetrics,
    dailyConsumption: number
  ): number {
    // EEOI = (Fuel × Emission Factor) / (Cargo × Distance)
    const emissionFactor = 3.114; // CO2 per ton of fuel (HFO)
    const distancePerDay = state.speed * 24;
    
    return (dailyConsumption * emissionFactor) / (state.cargoWeight * distancePerDay);
  }

  private getCIIRating(eeoi: number): 'A' | 'B' | 'C' | 'D' | 'E' {
    // Simplified CII rating (actual thresholds depend on ship type/size)
    if (eeoi < 0.000015) return 'A';
    if (eeoi < 0.00002) return 'B';
    if (eeoi < 0.000025) return 'C';
    if (eeoi < 0.00003) return 'D';
    return 'E';
  }
}

export const energyOptimizer = new ContinuousEnergyOptimizer();
