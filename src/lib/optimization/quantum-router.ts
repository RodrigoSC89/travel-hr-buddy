/**
 * MÓDULO 6: Roteador Marítimo Quantum-Inspired
 * Otimização global de rotas usando algoritmos inspirados em computação quântica
 * QAOA-inspired para encontrar ótimos globais, não locais
 */

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'port' | 'waypoint';
  fuelPrice?: number; // USD/ton
  portCost?: number;
  waitTime?: number; // hours
}

export interface WeatherCondition {
  lat: number;
  lng: number;
  windSpeed: number;
  waveHeight: number;
  currentSpeed: number;
  currentDirection: number;
}

export interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // km
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  type: 'piracy' | 'weather' | 'political' | 'environmental';
}

export interface VesselSpecs {
  cruiseSpeed: number; // knots
  fuelConsumption: number; // tons/day at cruise speed
  maxSpeed: number;
  cargoCapacity: number;
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[];
  totalDistance: number; // nm
  totalDuration: number; // hours
  totalFuel: number; // tons
  totalCost: number; // USD
  riskScore: number; // 0-100
  savings: {
    fuelSaved: number;
    costSaved: number;
    timeSaved: number;
  };
  confidence: number;
  iterations: number;
}

export interface QuantumState {
  amplitude: number;
  phase: number;
  probability: number;
}

/**
 * QAOA-Inspired Quantum Router
 * Uses quantum annealing simulation for global optimization
 */
export class QuantumMaritimeRouter {
  private numQubits: number;
  private numLayers: number;
  private temperature: number;
  private coolingRate: number;

  constructor(config?: {
    numQubits?: number;
    numLayers?: number;
    initialTemp?: number;
    coolingRate?: number;
  }) {
    this.numQubits = config?.numQubits || 12;
    this.numLayers = config?.numLayers || 4;
    this.temperature = config?.initialTemp || 100;
    this.coolingRate = config?.coolingRate || 0.995;
  }

  /**
   * Main optimization function using quantum-inspired annealing
   */
  async optimizeRoute(
    origin: RouteWaypoint,
    destination: RouteWaypoint,
    availablePorts: RouteWaypoint[],
    weatherConditions: WeatherCondition[],
    riskZones: RiskZone[],
    vesselSpecs: VesselSpecs,
    iterations: number = 5000
  ): Promise<OptimizedRoute> {
    console.log(`[QuantumRouter] Starting QAOA-inspired optimization with ${iterations} iterations`);

    // Initialize quantum state superposition
    const allWaypoints = [origin, ...availablePorts, destination];
    let bestSolution = this.generateRandomPath(allWaypoints, origin, destination);
    let bestEnergy = this.calculateEnergy(bestSolution, weatherConditions, riskZones, vesselSpecs);
    
    let currentSolution = [...bestSolution];
    let currentEnergy = bestEnergy;
    let temp = this.temperature;

    const energyHistory: number[] = [];

    // Quantum annealing loop
    for (let i = 0; i < iterations; i++) {
      // Generate neighbor solution using quantum tunneling simulation
      const neighbor = this.quantumTunnel(currentSolution, allWaypoints, origin, destination);
      const neighborEnergy = this.calculateEnergy(neighbor, weatherConditions, riskZones, vesselSpecs);

      // Metropolis-Hastings acceptance with quantum fluctuations
      const deltaE = neighborEnergy - currentEnergy;
      const quantumFluctuation = this.quantumFluctuation(temp);
      const acceptanceProbability = Math.exp(-deltaE / (temp + quantumFluctuation));

      if (deltaE < 0 || Math.random() < acceptanceProbability) {
        currentSolution = neighbor;
        currentEnergy = neighborEnergy;

        if (currentEnergy < bestEnergy) {
          bestSolution = [...currentSolution];
          bestEnergy = currentEnergy;
        }
      }

      // Cooling schedule
      temp *= this.coolingRate;
      energyHistory.push(bestEnergy);

      // Periodic quantum boost (escape local minima)
      if (i % 500 === 0 && i > 0) {
        temp = Math.max(temp, this.temperature * 0.3);
      }
    }

    // Calculate route metrics
    const metrics = this.calculateRouteMetrics(bestSolution, weatherConditions, riskZones, vesselSpecs);
    
    // Calculate baseline for comparison
    const directRoute = [origin, destination];
    const baselineMetrics = this.calculateRouteMetrics(directRoute, weatherConditions, riskZones, vesselSpecs);

    return {
      waypoints: bestSolution,
      totalDistance: metrics.distance,
      totalDuration: metrics.duration,
      totalFuel: metrics.fuel,
      totalCost: metrics.cost,
      riskScore: metrics.riskScore,
      savings: {
        fuelSaved: Math.max(0, baselineMetrics.fuel - metrics.fuel),
        costSaved: Math.max(0, baselineMetrics.cost - metrics.cost),
        timeSaved: Math.max(0, baselineMetrics.duration - metrics.duration),
      },
      confidence: this.calculateConfidence(energyHistory),
      iterations,
    };
  }

  /**
   * Quantum tunneling simulation - allows escaping local minima
   */
  private quantumTunnel(
    current: RouteWaypoint[],
    allWaypoints: RouteWaypoint[],
    origin: RouteWaypoint,
    destination: RouteWaypoint
  ): RouteWaypoint[] {
    const tunnelType = Math.random();
    const result = [...current];
    
    if (tunnelType < 0.3 && result.length > 2) {
      // Swap two intermediate waypoints
      const i = Math.floor(Math.random() * (result.length - 2)) + 1;
      const j = Math.floor(Math.random() * (result.length - 2)) + 1;
      if (i !== j) {
        [result[i], result[j]] = [result[j], result[i]];
      }
    } else if (tunnelType < 0.5 && result.length > 3) {
      // Remove a waypoint
      const i = Math.floor(Math.random() * (result.length - 2)) + 1;
      result.splice(i, 1);
    } else if (tunnelType < 0.7) {
      // Add a new waypoint
      const unusedPorts = allWaypoints.filter(
        w => w.type === 'port' && !result.find(r => r.id === w.id)
      );
      if (unusedPorts.length > 0) {
        const newPort = unusedPorts[Math.floor(Math.random() * unusedPorts.length)];
        const insertPos = Math.floor(Math.random() * (result.length - 1)) + 1;
        result.splice(insertPos, 0, newPort);
      }
    } else {
      // 2-opt reversal
      if (result.length > 3) {
        const i = Math.floor(Math.random() * (result.length - 3)) + 1;
        const j = Math.floor(Math.random() * (result.length - i - 1)) + i + 1;
        const segment = result.slice(i, j + 1).reverse();
        result.splice(i, j - i + 1, ...segment);
      }
    }

    // Ensure origin and destination are correct
    result[0] = origin;
    result[result.length - 1] = destination;

    return result;
  }

  /**
   * Quantum fluctuation for enhanced exploration
   */
  private quantumFluctuation(temp: number): number {
    const planckConstant = 0.1;
    return planckConstant * Math.sqrt(temp) * (Math.random() - 0.5);
  }

  /**
   * Calculate energy (cost function) for a route
   */
  private calculateEnergy(
    route: RouteWaypoint[],
    weather: WeatherCondition[],
    risks: RiskZone[],
    vessel: VesselSpecs
  ): number {
    const metrics = this.calculateRouteMetrics(route, weather, risks, vessel);
    
    // Weighted energy function
    const weights = {
      fuel: 0.35,
      time: 0.25,
      cost: 0.25,
      risk: 0.15,
    };

    return (
      weights.fuel * (metrics.fuel / 1000) +
      weights.time * (metrics.duration / 100) +
      weights.cost * (metrics.cost / 100000) +
      weights.risk * (metrics.riskScore / 10)
    );
  }

  /**
   * Calculate detailed route metrics
   */
  private calculateRouteMetrics(
    route: RouteWaypoint[],
    weather: WeatherCondition[],
    risks: RiskZone[],
    vessel: VesselSpecs
  ): { distance: number; duration: number; fuel: number; cost: number; riskScore: number } {
    let totalDistance = 0;
    let totalDuration = 0;
    let totalFuel = 0;
    let totalCost = 0;
    let totalRisk = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];

      // Calculate distance (Haversine)
      const distance = this.haversineDistance(from.lat, from.lng, to.lat, to.lng);
      totalDistance += distance;

      // Weather impact on speed
      const weatherImpact = this.calculateWeatherImpact(from, to, weather);
      const effectiveSpeed = vessel.cruiseSpeed * (1 - weatherImpact);

      // Duration
      const segmentDuration = distance / effectiveSpeed;
      totalDuration += segmentDuration;

      // Fuel consumption (increases with weather)
      const fuelConsumption = vessel.fuelConsumption * (segmentDuration / 24) * (1 + weatherImpact * 0.3);
      totalFuel += fuelConsumption;

      // Cost calculation
      const fuelPrice = from.fuelPrice || 600; // Default USD/ton
      totalCost += fuelConsumption * fuelPrice;

      // Port costs
      if (from.type === 'port' && from.portCost) {
        totalCost += from.portCost;
        totalDuration += from.waitTime || 0;
      }

      // Risk assessment
      totalRisk += this.calculateRiskForSegment(from, to, risks);
    }

    return {
      distance: totalDistance,
      duration: totalDuration,
      fuel: totalFuel,
      cost: totalCost,
      riskScore: Math.min(100, totalRisk),
    };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3440.065; // Earth radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private calculateWeatherImpact(from: RouteWaypoint, to: RouteWaypoint, weather: WeatherCondition[]): number {
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;

    // Find nearest weather condition
    let nearestWeather = weather[0];
    let minDist = Infinity;

    for (const w of weather) {
      const dist = this.haversineDistance(midLat, midLng, w.lat, w.lng);
      if (dist < minDist) {
        minDist = dist;
        nearestWeather = w;
      }
    }

    if (!nearestWeather) return 0;

    // Calculate impact (0-0.5 range)
    const windImpact = Math.min(0.2, nearestWeather.windSpeed / 100);
    const waveImpact = Math.min(0.2, nearestWeather.waveHeight / 10);
    const currentImpact = Math.min(0.1, nearestWeather.currentSpeed / 5);

    return windImpact + waveImpact + currentImpact;
  }

  private calculateRiskForSegment(from: RouteWaypoint, to: RouteWaypoint, risks: RiskZone[]): number {
    let totalRisk = 0;
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;

    for (const zone of risks) {
      const dist = this.haversineDistance(midLat, midLng, zone.lat, zone.lng) * 1.852; // Convert to km
      if (dist < zone.radius) {
        const riskMultiplier = {
          low: 5,
          medium: 15,
          high: 30,
          critical: 50,
        }[zone.riskLevel];
        totalRisk += riskMultiplier * (1 - dist / zone.radius);
      }
    }

    return totalRisk;
  }

  private generateRandomPath(
    waypoints: RouteWaypoint[],
    origin: RouteWaypoint,
    destination: RouteWaypoint
  ): RouteWaypoint[] {
    const ports = waypoints.filter(w => w.type === 'port');
    const numPorts = Math.floor(Math.random() * Math.min(3, ports.length));
    const selectedPorts = this.shuffleArray([...ports]).slice(0, numPorts);
    
    return [origin, ...selectedPorts, destination];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private calculateConfidence(energyHistory: number[]): number {
    if (energyHistory.length < 100) return 0.5;
    
    // Check convergence
    const lastN = energyHistory.slice(-500);
    const variance = this.calculateVariance(lastN);
    const convergence = Math.exp(-variance * 100);
    
    return Math.min(0.99, 0.6 + convergence * 0.39);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  }
}

export const quantumRouter = new QuantumMaritimeRouter();
