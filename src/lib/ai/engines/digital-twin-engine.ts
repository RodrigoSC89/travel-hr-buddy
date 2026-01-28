/**
 * Digital Twin Engine
 * Réplica virtual da embarcação para cenários what-if
 */

export interface VesselDigitalTwin {
  vessel_id: string;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  last_sync: string;
  state: VesselState;
  systems: SystemState[];
  crew_state: CrewState;
  cargo_state: CargoState;
  navigation_state: NavigationState;
  environmental_state: EnvironmentalState;
}

export interface VesselState {
  status: 'operational' | 'at_anchor' | 'in_port' | 'under_maintenance' | 'emergency';
  position: { lat: number; lng: number };
  heading: number;
  speed_knots: number;
  draft_meters: number;
  trim: number;
  list: number;
  displacement_tonnes: number;
}

export interface SystemState {
  system_id: string;
  system_name: string;
  category: 'propulsion' | 'electrical' | 'navigation' | 'safety' | 'hvac' | 'deck' | 'cargo';
  status: 'running' | 'standby' | 'maintenance' | 'fault' | 'offline';
  health_percentage: number;
  parameters: Record<string, number>;
  last_maintenance: string;
  next_maintenance: string;
  estimated_remaining_life_hours: number;
}

export interface CrewState {
  total_onboard: number;
  on_duty: number;
  resting: number;
  average_fatigue: number;
  critical_positions_filled: boolean;
  certifications_valid: boolean;
}

export interface CargoState {
  cargo_type: string;
  quantity_tonnes: number;
  cargo_temperature?: number;
  cargo_pressure?: number;
  tanks_status: TankStatus[];
  stability_status: 'safe' | 'marginal' | 'critical';
}

export interface TankStatus {
  tank_id: string;
  tank_name: string;
  capacity_m3: number;
  current_level_m3: number;
  percentage_full: number;
  content_type: string;
  temperature?: number;
}

export interface NavigationState {
  voyage_status: 'in_progress' | 'completed' | 'planned';
  origin_port: string;
  destination_port: string;
  eta: string;
  distance_remaining_nm: number;
  fuel_remaining_tonnes: number;
  fuel_consumption_rate: number;
}

export interface EnvironmentalState {
  weather: {
    wind_speed_knots: number;
    wind_direction: number;
    wave_height_meters: number;
    visibility_nm: number;
    temperature_celsius: number;
  };
  sea_state: number; // 0-9 Douglas scale
  current_speed_knots: number;
  current_direction: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  scenario_type: 'equipment_failure' | 'weather_change' | 'emergency' | 'optimization' | 'custom';
  parameters: ScenarioParameter[];
  duration_hours: number;
}

export interface ScenarioParameter {
  parameter_name: string;
  current_value: number;
  simulated_value: number;
  unit: string;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_name: string;
  simulation_time: string;
  duration_hours: number;
  initial_state: VesselDigitalTwin;
  final_state: VesselDigitalTwin;
  events: SimulationEvent[];
  impacts: SimulationImpact[];
  recommendations: SimulationRecommendation[];
  risk_assessment: RiskAssessment;
}

export interface SimulationEvent {
  timestamp_hours: number;
  event_type: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affected_systems: string[];
}

export interface SimulationImpact {
  category: 'safety' | 'operational' | 'financial' | 'environmental' | 'schedule';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  quantified_impact: string;
}

export interface SimulationRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  rationale: string;
  estimated_cost?: number;
  estimated_time?: string;
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'moderate' | 'high' | 'critical';
  safety_risk: number; // 0-100
  operational_risk: number;
  financial_risk: number;
  environmental_risk: number;
  risk_factors: { factor: string; contribution: number }[];
}

class DigitalTwinEngine {
  private twins: Map<string, VesselDigitalTwin> = new Map();

  /**
   * Create or update digital twin from sensor data
   */
  syncTwin(
    vesselId: string,
    vesselName: string,
    imoNumber: string,
    vesselType: string,
    sensorData: Partial<VesselDigitalTwin>
  ): VesselDigitalTwin {
    const existingTwin = this.twins.get(vesselId);
    
    const twin: VesselDigitalTwin = {
      vessel_id: vesselId,
      vessel_name: vesselName,
      imo_number: imoNumber,
      vessel_type: vesselType,
      last_sync: new Date().toISOString(),
      state: sensorData.state || existingTwin?.state || this.getDefaultVesselState(),
      systems: sensorData.systems || existingTwin?.systems || this.getDefaultSystems(),
      crew_state: sensorData.crew_state || existingTwin?.crew_state || this.getDefaultCrewState(),
      cargo_state: sensorData.cargo_state || existingTwin?.cargo_state || this.getDefaultCargoState(),
      navigation_state: sensorData.navigation_state || existingTwin?.navigation_state || this.getDefaultNavigationState(),
      environmental_state: sensorData.environmental_state || existingTwin?.environmental_state || this.getDefaultEnvironmentalState()
    };

    this.twins.set(vesselId, twin);
    return twin;
  }

  /**
   * Get current twin state
   */
  getTwin(vesselId: string): VesselDigitalTwin | undefined {
    return this.twins.get(vesselId);
  }

  /**
   * Run what-if simulation
   */
  runSimulation(
    vesselId: string,
    scenario: SimulationScenario
  ): SimulationResult {
    const twin = this.twins.get(vesselId);
    if (!twin) {
      throw new Error(`Digital twin not found for vessel ${vesselId}`);
    }

    const initialState = JSON.parse(JSON.stringify(twin)) as VesselDigitalTwin;
    const simulatedState = JSON.parse(JSON.stringify(twin)) as VesselDigitalTwin;
    
    // Apply scenario parameters
    scenario.parameters.forEach(param => {
      this.applyParameter(simulatedState, param);
    });

    // Simulate time progression
    const events = this.simulateTimeProgression(simulatedState, scenario);
    
    // Calculate impacts
    const impacts = this.calculateImpacts(initialState, simulatedState, scenario);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(impacts, scenario);
    
    // Assess risks
    const riskAssessment = this.assessRisks(simulatedState, impacts);

    return {
      scenario_id: scenario.id,
      scenario_name: scenario.name,
      simulation_time: new Date().toISOString(),
      duration_hours: scenario.duration_hours,
      initial_state: initialState,
      final_state: simulatedState,
      events,
      impacts,
      recommendations,
      risk_assessment: riskAssessment
    };
  }

  /**
   * Predict system failures
   */
  predictFailures(vesselId: string, horizonDays: number = 30): {
    predictions: Array<{
      system: string;
      probability: number;
      estimated_failure_date: string;
      recommended_action: string;
    }>;
  } {
    const twin = this.twins.get(vesselId);
    if (!twin) {
      return { predictions: [] };
    }

    const predictions = twin.systems
      .filter(sys => sys.health_percentage < 80 || sys.estimated_remaining_life_hours < horizonDays * 24)
      .map(sys => {
        const failureProbability = this.calculateFailureProbability(sys, horizonDays);
        const estimatedDate = new Date(
          Date.now() + sys.estimated_remaining_life_hours * 60 * 60 * 1000
        );

        return {
          system: sys.system_name,
          probability: failureProbability,
          estimated_failure_date: estimatedDate.toISOString(),
          recommended_action: this.getMaintenanceRecommendation(sys)
        };
      })
      .sort((a, b) => b.probability - a.probability);

    return { predictions };
  }

  /**
   * Optimize vessel operations
   */
  optimizeOperations(vesselId: string): {
    current_efficiency: number;
    optimized_efficiency: number;
    recommendations: Array<{
      area: string;
      action: string;
      potential_savings: string;
      implementation_effort: 'low' | 'medium' | 'high';
    }>;
  } {
    const twin = this.twins.get(vesselId);
    if (!twin) {
      return { current_efficiency: 0, optimized_efficiency: 0, recommendations: [] };
    }

    const currentEfficiency = this.calculateOperationalEfficiency(twin);
    const recommendations = this.generateOptimizationRecommendations(twin);
    const potentialImprovement = recommendations.reduce(
      (sum, r) => sum + (r.area === 'fuel' ? 5 : 2), 0
    );

    return {
      current_efficiency: currentEfficiency,
      optimized_efficiency: Math.min(100, currentEfficiency + potentialImprovement),
      recommendations
    };
  }

  private getDefaultVesselState(): VesselState {
    return {
      status: 'operational',
      position: { lat: 0, lng: 0 },
      heading: 0,
      speed_knots: 0,
      draft_meters: 8,
      trim: 0,
      list: 0,
      displacement_tonnes: 10000
    };
  }

  private getDefaultSystems(): SystemState[] {
    return [
      {
        system_id: 'ME1',
        system_name: 'Main Engine',
        category: 'propulsion',
        status: 'running',
        health_percentage: 95,
        parameters: { rpm: 100, temperature: 85, pressure: 6.5 },
        last_maintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_maintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_remaining_life_hours: 5000
      },
      {
        system_id: 'GEN1',
        system_name: 'Generator 1',
        category: 'electrical',
        status: 'running',
        health_percentage: 88,
        parameters: { load: 75, voltage: 440, frequency: 60 },
        last_maintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        next_maintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_remaining_life_hours: 4000
      },
      {
        system_id: 'NAV1',
        system_name: 'GPS/ECDIS',
        category: 'navigation',
        status: 'running',
        health_percentage: 100,
        parameters: { satellites: 12, accuracy: 2 },
        last_maintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        next_maintenance: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_remaining_life_hours: 20000
      }
    ];
  }

  private getDefaultCrewState(): CrewState {
    return {
      total_onboard: 20,
      on_duty: 8,
      resting: 12,
      average_fatigue: 25,
      critical_positions_filled: true,
      certifications_valid: true
    };
  }

  private getDefaultCargoState(): CargoState {
    return {
      cargo_type: 'Container',
      quantity_tonnes: 5000,
      tanks_status: [],
      stability_status: 'safe'
    };
  }

  private getDefaultNavigationState(): NavigationState {
    return {
      voyage_status: 'in_progress',
      origin_port: 'Santos',
      destination_port: 'Rotterdam',
      eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      distance_remaining_nm: 5500,
      fuel_remaining_tonnes: 800,
      fuel_consumption_rate: 35
    };
  }

  private getDefaultEnvironmentalState(): EnvironmentalState {
    return {
      weather: {
        wind_speed_knots: 15,
        wind_direction: 270,
        wave_height_meters: 2,
        visibility_nm: 10,
        temperature_celsius: 22
      },
      sea_state: 4,
      current_speed_knots: 1,
      current_direction: 180
    };
  }

  private applyParameter(state: VesselDigitalTwin, param: ScenarioParameter): void {
    // Apply parameter changes based on name
    switch (param.parameter_name.toLowerCase()) {
      case 'speed':
        state.state.speed_knots = param.simulated_value;
        break;
      case 'wind_speed':
        state.environmental_state.weather.wind_speed_knots = param.simulated_value;
        break;
      case 'wave_height':
        state.environmental_state.weather.wave_height_meters = param.simulated_value;
        break;
      case 'engine_health':
        const engine = state.systems.find(s => s.category === 'propulsion');
        if (engine) engine.health_percentage = param.simulated_value;
        break;
      case 'crew_fatigue':
        state.crew_state.average_fatigue = param.simulated_value;
        break;
    }
  }

  private simulateTimeProgression(
    state: VesselDigitalTwin,
    scenario: SimulationScenario
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    const hoursPerStep = scenario.duration_hours / 24; // 24 steps

    for (let hour = 0; hour <= scenario.duration_hours; hour += hoursPerStep) {
      // Simulate system degradation
      state.systems.forEach(sys => {
        sys.estimated_remaining_life_hours -= hoursPerStep;
        if (sys.health_percentage > 50) {
          sys.health_percentage -= 0.1;
        }

        // Check for failures
        if (sys.health_percentage < 30 && sys.status !== 'fault') {
          sys.status = 'fault';
          events.push({
            timestamp_hours: hour,
            event_type: 'system_failure',
            description: `${sys.system_name} entrou em falha`,
            severity: 'critical',
            affected_systems: [sys.system_id]
          });
        }
      });

      // Simulate environmental changes
      if (scenario.scenario_type === 'weather_change') {
        state.environmental_state.weather.wave_height_meters *= 1.1;
        if (state.environmental_state.weather.wave_height_meters > 6) {
          events.push({
            timestamp_hours: hour,
            event_type: 'weather_deterioration',
            description: 'Condições meteorológicas severas',
            severity: 'warning',
            affected_systems: []
          });
        }
      }

      // Simulate crew fatigue
      if (state.crew_state.average_fatigue < 80) {
        state.crew_state.average_fatigue += 1;
      }
    }

    return events;
  }

  private calculateImpacts(
    initial: VesselDigitalTwin,
    final: VesselDigitalTwin,
    scenario: SimulationScenario
  ): SimulationImpact[] {
    const impacts: SimulationImpact[] = [];

    // Safety impact
    const safetyDegradation = initial.systems
      .filter(s => s.category === 'safety')
      .reduce((sum, s) => {
        const finalSys = final.systems.find(f => f.system_id === s.system_id);
        return sum + (s.health_percentage - (finalSys?.health_percentage || 0));
      }, 0);

    if (safetyDegradation > 10) {
      impacts.push({
        category: 'safety',
        description: 'Degradação de sistemas de segurança',
        severity: safetyDegradation > 30 ? 'critical' : 'high',
        quantified_impact: `${safetyDegradation.toFixed(0)}% de degradação`
      });
    }

    // Operational impact
    const fuelConsumed = scenario.duration_hours * final.navigation_state.fuel_consumption_rate / 24;
    impacts.push({
      category: 'operational',
      description: 'Consumo de combustível durante o período',
      severity: 'low',
      quantified_impact: `${fuelConsumed.toFixed(0)} toneladas`
    });

    // Financial impact
    const estimatedCost = fuelConsumed * 500; // $500/ton average
    impacts.push({
      category: 'financial',
      description: 'Custo estimado de combustível',
      severity: estimatedCost > 50000 ? 'high' : 'medium',
      quantified_impact: `USD ${estimatedCost.toLocaleString()}`
    });

    // Schedule impact
    if (scenario.scenario_type === 'weather_change' || scenario.scenario_type === 'equipment_failure') {
      const delayHours = scenario.duration_hours * 0.1;
      if (delayHours > 2) {
        impacts.push({
          category: 'schedule',
          description: 'Possível atraso na chegada',
          severity: delayHours > 12 ? 'high' : 'medium',
          quantified_impact: `${delayHours.toFixed(0)} horas de atraso`
        });
      }
    }

    return impacts;
  }

  private generateRecommendations(
    impacts: SimulationImpact[],
    scenario: SimulationScenario
  ): SimulationRecommendation[] {
    const recommendations: SimulationRecommendation[] = [];

    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    const highImpacts = impacts.filter(i => i.severity === 'high');

    if (criticalImpacts.length > 0) {
      recommendations.push({
        priority: 'urgent',
        action: 'Ativar procedimentos de emergência',
        rationale: 'Impactos críticos identificados na simulação',
        estimated_time: 'Imediato'
      });
    }

    if (scenario.scenario_type === 'equipment_failure') {
      recommendations.push({
        priority: 'high',
        action: 'Antecipar manutenção preventiva',
        rationale: 'Reduzir risco de falha durante operação',
        estimated_cost: 15000,
        estimated_time: '24-48 horas'
      });
    }

    if (scenario.scenario_type === 'weather_change') {
      recommendations.push({
        priority: 'high',
        action: 'Considerar rota alternativa',
        rationale: 'Evitar condições meteorológicas adversas',
        estimated_time: '2-4 horas para replanejar'
      });
    }

    if (highImpacts.some(i => i.category === 'financial')) {
      recommendations.push({
        priority: 'medium',
        action: 'Otimizar velocidade para economia de combustível',
        rationale: 'Reduzir custos operacionais',
        estimated_cost: 0,
        estimated_time: 'Contínuo'
      });
    }

    return recommendations;
  }

  private assessRisks(
    state: VesselDigitalTwin,
    impacts: SimulationImpact[]
  ): RiskAssessment {
    const safetyImpact = impacts.find(i => i.category === 'safety');
    const operationalImpact = impacts.find(i => i.category === 'operational');
    const financialImpact = impacts.find(i => i.category === 'financial');
    const environmentalImpact = impacts.find(i => i.category === 'environmental');

    const severityScore = (severity: string | undefined): number => {
      switch (severity) {
        case 'critical': return 100;
        case 'high': return 75;
        case 'medium': return 50;
        case 'low': return 25;
        default: return 0;
      }
    };

    const safetyRisk = severityScore(safetyImpact?.severity);
    const operationalRisk = severityScore(operationalImpact?.severity);
    const financialRisk = severityScore(financialImpact?.severity);
    const environmentalRisk = severityScore(environmentalImpact?.severity);

    const overallRisk = (safetyRisk * 0.4 + operationalRisk * 0.3 + financialRisk * 0.2 + environmentalRisk * 0.1);

    let riskLevel: RiskAssessment['overall_risk_level'];
    if (overallRisk >= 75) riskLevel = 'critical';
    else if (overallRisk >= 50) riskLevel = 'high';
    else if (overallRisk >= 25) riskLevel = 'moderate';
    else riskLevel = 'low';

    return {
      overall_risk_level: riskLevel,
      safety_risk: safetyRisk,
      operational_risk: operationalRisk,
      financial_risk: financialRisk,
      environmental_risk: environmentalRisk,
      risk_factors: [
        { factor: 'Segurança', contribution: safetyRisk * 0.4 },
        { factor: 'Operacional', contribution: operationalRisk * 0.3 },
        { factor: 'Financeiro', contribution: financialRisk * 0.2 },
        { factor: 'Ambiental', contribution: environmentalRisk * 0.1 }
      ].filter(f => f.contribution > 0)
    };
  }

  private calculateFailureProbability(system: SystemState, horizonDays: number): number {
    const hoursRemaining = system.estimated_remaining_life_hours;
    const horizonHours = horizonDays * 24;
    
    if (hoursRemaining <= 0) return 1;
    if (hoursRemaining > horizonHours * 2) return 0.05;
    
    // Weibull-inspired probability
    const ratio = horizonHours / hoursRemaining;
    const healthFactor = (100 - system.health_percentage) / 100;
    
    return Math.min(0.95, ratio * 0.3 + healthFactor * 0.5);
  }

  private getMaintenanceRecommendation(system: SystemState): string {
    if (system.health_percentage < 50) {
      return 'Manutenção corretiva urgente necessária';
    }
    if (system.health_percentage < 70) {
      return 'Agendar manutenção preventiva em 7 dias';
    }
    if (system.estimated_remaining_life_hours < 500) {
      return 'Planejar substituição de componentes críticos';
    }
    return 'Monitoramento contínuo recomendado';
  }

  private calculateOperationalEfficiency(twin: VesselDigitalTwin): number {
    let efficiency = 100;

    // System health impact
    const avgHealth = twin.systems.reduce((sum, s) => sum + s.health_percentage, 0) / twin.systems.length;
    efficiency -= (100 - avgHealth) * 0.3;

    // Crew fatigue impact
    efficiency -= twin.crew_state.average_fatigue * 0.2;

    // Environmental impact
    if (twin.environmental_state.sea_state > 5) {
      efficiency -= (twin.environmental_state.sea_state - 5) * 5;
    }

    return Math.max(0, Math.round(efficiency));
  }

  private generateOptimizationRecommendations(twin: VesselDigitalTwin): Array<{
    area: string;
    action: string;
    potential_savings: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];

    // Fuel optimization
    if (twin.state.speed_knots > 12) {
      recommendations.push({
        area: 'fuel',
        action: 'Reduzir velocidade em 1-2 nós',
        potential_savings: '5-10% de economia de combustível',
        implementation_effort: 'low' as const
      });
    }

    // Maintenance optimization
    const systemsNeedingMaintenance = twin.systems.filter(s => s.health_percentage < 80);
    if (systemsNeedingMaintenance.length > 0) {
      recommendations.push({
        area: 'maintenance',
        action: `Antecipar manutenção de ${systemsNeedingMaintenance.length} sistema(s)`,
        potential_savings: 'Evitar falhas não programadas',
        implementation_effort: 'medium' as const
      });
    }

    // Crew optimization
    if (twin.crew_state.average_fatigue > 40) {
      recommendations.push({
        area: 'crew',
        action: 'Revisar escala de trabalho da tripulação',
        potential_savings: 'Melhor performance e segurança',
        implementation_effort: 'medium' as const
      });
    }

    // Route optimization
    if (twin.environmental_state.weather.wave_height_meters > 3) {
      recommendations.push({
        area: 'route',
        action: 'Avaliar rota alternativa para condições melhores',
        potential_savings: 'Redução de consumo e desgaste',
        implementation_effort: 'high' as const
      });
    }

    return recommendations;
  }
}

export const digitalTwinEngine = new DigitalTwinEngine();
