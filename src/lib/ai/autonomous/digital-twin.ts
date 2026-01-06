/**
 * Digital Twin Engine
 * Real-time vessel simulation and prediction
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

export interface VesselState {
  vesselId: string;
  vesselName: string;
  timestamp: Date;
  position: { lat: number; lng: number };
  heading: number;
  speed: number;
  fuelOnBoard: number;
  initialFuel: number;
  avgConsumption: number;
  equipment: EquipmentState[];
  crew: CrewState[];
  weather: WeatherData;
  compliance: ComplianceState;
}

export interface EquipmentState {
  id: string;
  name: string;
  type: string;
  health: number; // 0-100
  lastMaintenance: Date;
  nextMaintenance: Date;
  runningHours: number;
  temperature?: number;
  vibration?: number;
  status: 'operational' | 'degraded' | 'critical' | 'offline';
}

export interface CrewState {
  id: string;
  name: string;
  rank: string;
  fatigue: number; // 0-100
  stress: number; // 0-100
  hoursWorked: number;
  lastRest: Date;
  healthScore: number;
  status: 'on-duty' | 'off-duty' | 'rest' | 'leave';
}

export interface WeatherData {
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  visibility: number;
  temperature: number;
  humidity: number;
  pressure: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  timestamp: Date;
  windSpeed: number;
  waveHeight: number;
  condition: string;
}

export interface ComplianceState {
  overallScore: number;
  peotramScore: number;
  mlcScore: number;
  ispsScore: number;
  marpolScore: number;
  openItems: number;
  nextAudit: Date;
}

export interface VesselPrediction {
  predictedState: VesselState;
  risks: Risk[];
  recommendations: Recommendation[];
  confidence: number;
}

export interface Risk {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  description: string;
  mitigationAction: string;
}

export interface Recommendation {
  type: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  expectedBenefit: string;
  autonomyLevel: number;
}

export interface Anomaly {
  id: string;
  type: string;
  severity: 'warning' | 'critical';
  source: string;
  description: string;
  detectedAt: Date;
  recommendation: string;
}

/**
 * Digital Twin Engine
 * Creates and maintains a digital representation of the vessel
 */
export class VesselDigitalTwin {
  private state: VesselState | null = null;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private anomalyHistory: Anomaly[] = [];
  private predictionHistory: VesselPrediction[] = [];

  /**
   * Initialize digital twin with vessel data
   */
  async initialize(vesselId: string, vesselName: string): Promise<void> {
    // Initialize with default/mock state
    this.state = {
      vesselId,
      vesselName,
      timestamp: new Date(),
      position: { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
      heading: 45,
      speed: 12.5,
      fuelOnBoard: 850000, // liters
      initialFuel: 1000000,
      avgConsumption: 2500, // liters/hour
      equipment: this.initializeEquipment(),
      crew: this.initializeCrew(),
      weather: this.initializeWeather(),
      compliance: {
        overallScore: 94,
        peotramScore: 96,
        mlcScore: 92,
        ispsScore: 95,
        marpolScore: 93,
        openItems: 3,
        nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    };

    console.log(`[DigitalTwin] Initialized for ${vesselName}`);
    this.emit('initialized', this.state);
  }

  /**
   * Start real-time simulation
   */
  startSimulation(intervalMs: number = 5000): void {
    if (this.simulationInterval) {
      this.stopSimulation();
    }

    this.simulationInterval = setInterval(async () => {
      await this.simulationTick();
    }, intervalMs);

    console.log('[DigitalTwin] Simulation started');
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    console.log('[DigitalTwin] Simulation stopped');
  }

  /**
   * Single simulation tick
   */
  private async simulationTick(): Promise<void> {
    if (!this.state) return;

    // Update state based on physics
    this.state = this.applyPhysics(this.state);

    // Detect anomalies
    const anomalies = this.detectAnomalies();
    if (anomalies.length > 0) {
      this.anomalyHistory.push(...anomalies);
      this.emit('anomalies', anomalies);
    }

    // Generate prediction
    const prediction = this.predictNextHour();
    this.predictionHistory.push(prediction);

    // Emit state update
    this.emit('state-update', this.state);
  }

  /**
   * Apply physics to update state
   */
  private applyPhysics(state: VesselState): VesselState {
    const deltaHours = 5 / 3600; // 5 seconds in hours

    // Update position based on speed and heading
    const distanceNm = state.speed * deltaHours;
    const headingRad = (state.heading * Math.PI) / 180;
    
    const newLat = state.position.lat + (distanceNm / 60) * Math.cos(headingRad);
    const newLng = state.position.lng + (distanceNm / 60) * Math.sin(headingRad) / Math.cos(state.position.lat * Math.PI / 180);

    // Update fuel consumption
    const fuelConsumed = state.avgConsumption * deltaHours;
    const newFuel = Math.max(0, state.fuelOnBoard - fuelConsumed);

    // Update equipment health (gradual degradation)
    const updatedEquipment = state.equipment.map(eq => ({
      ...eq,
      health: Math.max(0, eq.health - Math.random() * 0.01),
      runningHours: eq.runningHours + deltaHours,
      temperature: eq.temperature ? eq.temperature + (Math.random() - 0.5) * 0.5 : undefined,
      vibration: eq.vibration ? eq.vibration + (Math.random() - 0.5) * 0.1 : undefined,
      status: this.getEquipmentStatus(eq.health)
    }));

    // Update crew fatigue (increases while on duty)
    const updatedCrew = state.crew.map(c => ({
      ...c,
      fatigue: Math.min(100, c.fatigue + (c.status === 'on-duty' ? 0.05 : -0.1)),
      stress: Math.min(100, c.stress + (Math.random() - 0.5) * 0.1),
      hoursWorked: c.status === 'on-duty' ? c.hoursWorked + deltaHours : c.hoursWorked
    }));

    return {
      ...state,
      timestamp: new Date(),
      position: { lat: newLat, lng: newLng },
      fuelOnBoard: newFuel,
      equipment: updatedEquipment,
      crew: updatedCrew
    };
  }

  /**
   * Get equipment status based on health
   */
  private getEquipmentStatus(health: number): EquipmentState['status'] {
    if (health > 80) return 'operational';
    if (health > 50) return 'degraded';
    if (health > 20) return 'critical';
    return 'offline';
  }

  /**
   * Detect anomalies in current state
   */
  private detectAnomalies(): Anomaly[] {
    if (!this.state) return [];
    
    const anomalies: Anomaly[] = [];

    // Check equipment health
    for (const eq of this.state.equipment) {
      if (eq.health < 60) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'equipment-degradation',
          severity: eq.health < 30 ? 'critical' : 'warning',
          source: eq.name,
          description: `${eq.name} com saúde em ${eq.health.toFixed(1)}%`,
          detectedAt: new Date(),
          recommendation: `Agendar manutenção preventiva para ${eq.name}`
        });
      }
    }

    // Check crew fatigue
    for (const crew of this.state.crew) {
      if (crew.fatigue > 80 || crew.stress > 75) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'crew-fatigue',
          severity: crew.fatigue > 90 ? 'critical' : 'warning',
          source: crew.name,
          description: `${crew.name} com fadiga em ${crew.fatigue.toFixed(1)}%`,
          detectedAt: new Date(),
          recommendation: 'Agendar descanso imediato'
        });
      }
    }

    // Check fuel level
    const fuelPercentage = (this.state.fuelOnBoard / this.state.initialFuel) * 100;
    if (fuelPercentage < 15) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'low-fuel',
        severity: fuelPercentage < 10 ? 'critical' : 'warning',
        source: 'Bunker',
        description: `Combustível em ${fuelPercentage.toFixed(1)}%`,
        detectedAt: new Date(),
        recommendation: 'Planejar abastecimento no próximo porto'
      });
    }

    return anomalies;
  }

  /**
   * Predict state 1 hour into the future
   */
  predictNextHour(): VesselPrediction {
    if (!this.state) {
      return {
        predictedState: this.state!,
        risks: [],
        recommendations: [],
        confidence: 0
      };
    }

    // Simulate 1 hour (720 ticks of 5 seconds)
    let simState = JSON.parse(JSON.stringify(this.state)) as VesselState;
    for (let i = 0; i < 720; i++) {
      simState = this.applyPhysics(simState);
    }

    // Identify risks
    const risks: Risk[] = [];
    
    // Equipment failure risk
    for (const eq of simState.equipment) {
      if (eq.health < 40) {
        risks.push({
          type: 'equipment-failure',
          severity: eq.health < 20 ? 'critical' : 'high',
          probability: (100 - eq.health) / 100,
          description: `Risco de falha em ${eq.name}`,
          mitigationAction: 'Manutenção preventiva recomendada'
        });
      }
    }

    // Crew fatigue risk
    for (const crew of simState.crew) {
      if (crew.fatigue > 85) {
        risks.push({
          type: 'crew-fatigue',
          severity: 'high',
          probability: 0.8,
          description: `${crew.name} em risco de exaustão`,
          mitigationAction: 'Substituir turno ou reduzir carga'
        });
      }
    }

    // Fuel risk
    const fuelDays = simState.fuelOnBoard / (simState.avgConsumption * 24);
    if (fuelDays < 3) {
      risks.push({
        type: 'fuel-shortage',
        severity: fuelDays < 1 ? 'critical' : 'high',
        probability: 0.9,
        description: `Combustível para apenas ${fuelDays.toFixed(1)} dias`,
        mitigationAction: 'Planejar reabastecimento urgente'
      });
    }

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    if (risks.some(r => r.type === 'equipment-failure')) {
      recommendations.push({
        type: 'maintenance',
        action: 'Agendar manutenção preventiva',
        priority: 'high',
        expectedBenefit: 'Evitar parada não programada',
        autonomyLevel: 2
      });
    }

    if (risks.some(r => r.type === 'crew-fatigue')) {
      recommendations.push({
        type: 'schedule',
        action: 'Reorganizar escala de trabalho',
        priority: 'high',
        expectedBenefit: 'Melhorar segurança e bem-estar',
        autonomyLevel: 1
      });
    }

    return {
      predictedState: simState,
      risks,
      recommendations,
      confidence: 0.85
    };
  }

  /**
   * Get current state
   */
  getState(): VesselState | null {
    return this.state;
  }

  /**
   * Get anomaly history
   */
  getAnomalies(): Anomaly[] {
    return this.anomalyHistory;
  }

  /**
   * Get latest prediction
   */
  getLatestPrediction(): VesselPrediction | null {
    return this.predictionHistory[this.predictionHistory.length - 1] || null;
  }

  /**
   * Event emitter
   */
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // Initialize mock data
  private initializeEquipment(): EquipmentState[] {
    return [
      { id: 'me-1', name: 'Motor Principal 1', type: 'engine', health: 92, lastMaintenance: new Date(Date.now() - 30*24*60*60*1000), nextMaintenance: new Date(Date.now() + 60*24*60*60*1000), runningHours: 12500, temperature: 85, vibration: 2.3, status: 'operational' },
      { id: 'me-2', name: 'Motor Principal 2', type: 'engine', health: 88, lastMaintenance: new Date(Date.now() - 45*24*60*60*1000), nextMaintenance: new Date(Date.now() + 45*24*60*60*1000), runningHours: 13200, temperature: 87, vibration: 2.5, status: 'operational' },
      { id: 'gen-1', name: 'Gerador 1', type: 'generator', health: 95, lastMaintenance: new Date(Date.now() - 20*24*60*60*1000), nextMaintenance: new Date(Date.now() + 70*24*60*60*1000), runningHours: 8500, temperature: 72, vibration: 1.8, status: 'operational' },
      { id: 'gen-2', name: 'Gerador 2', type: 'generator', health: 78, lastMaintenance: new Date(Date.now() - 60*24*60*60*1000), nextMaintenance: new Date(Date.now() + 30*24*60*60*1000), runningHours: 9800, temperature: 75, vibration: 2.1, status: 'degraded' },
      { id: 'pump-1', name: 'Bomba de Lastro', type: 'pump', health: 85, lastMaintenance: new Date(Date.now() - 25*24*60*60*1000), nextMaintenance: new Date(Date.now() + 65*24*60*60*1000), runningHours: 5200, status: 'operational' },
      { id: 'hvac', name: 'Sistema HVAC', type: 'hvac', health: 91, lastMaintenance: new Date(Date.now() - 15*24*60*60*1000), nextMaintenance: new Date(Date.now() + 75*24*60*60*1000), runningHours: 4800, status: 'operational' },
    ];
  }

  private initializeCrew(): CrewState[] {
    return [
      { id: 'c1', name: 'Cap. João Silva', rank: 'Master', fatigue: 25, stress: 20, hoursWorked: 6, lastRest: new Date(Date.now() - 6*60*60*1000), healthScore: 95, status: 'on-duty' },
      { id: 'c2', name: 'Of. Maria Santos', rank: 'Chief Officer', fatigue: 40, stress: 35, hoursWorked: 8, lastRest: new Date(Date.now() - 8*60*60*1000), healthScore: 88, status: 'on-duty' },
      { id: 'c3', name: 'Eng. Pedro Costa', rank: 'Chief Engineer', fatigue: 30, stress: 25, hoursWorked: 5, lastRest: new Date(Date.now() - 5*60*60*1000), healthScore: 92, status: 'on-duty' },
      { id: 'c4', name: 'Of. Ana Lima', rank: 'Second Officer', fatigue: 15, stress: 15, hoursWorked: 2, lastRest: new Date(Date.now() - 2*60*60*1000), healthScore: 96, status: 'on-duty' },
      { id: 'c5', name: 'Eng. Carlos Oliveira', rank: 'Second Engineer', fatigue: 55, stress: 45, hoursWorked: 10, lastRest: new Date(Date.now() - 10*60*60*1000), healthScore: 82, status: 'off-duty' },
      { id: 'c6', name: 'Mar. Roberto Alves', rank: 'AB', fatigue: 35, stress: 30, hoursWorked: 6, lastRest: new Date(Date.now() - 6*60*60*1000), healthScore: 90, status: 'on-duty' },
    ];
  }

  private initializeWeather(): WeatherData {
    return {
      windSpeed: 15,
      windDirection: 180,
      waveHeight: 1.5,
      visibility: 10,
      temperature: 26,
      humidity: 75,
      pressure: 1013,
      forecast: [
        { timestamp: new Date(Date.now() + 6*60*60*1000), windSpeed: 18, waveHeight: 1.8, condition: 'cloudy' },
        { timestamp: new Date(Date.now() + 12*60*60*1000), windSpeed: 22, waveHeight: 2.2, condition: 'rain' },
        { timestamp: new Date(Date.now() + 24*60*60*1000), windSpeed: 12, waveHeight: 1.2, condition: 'clear' },
      ]
    };
  }
}

// Singleton instance
export const vesselDigitalTwin = new VesselDigitalTwin();
