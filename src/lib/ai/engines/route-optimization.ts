/**
 * Real-Time Route Optimization Engine
 * IA autônoma que ajusta velocidade e rota baseado em clima, correntes e bunker
 * Nível: Autônomo
 */

export interface VesselPosition {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number; // knots
  timestamp: Date;
}

export interface WeatherCondition {
  windSpeed: number; // knots
  windDirection: number; // degrees
  waveHeight: number; // meters
  visibility: number; // nautical miles
  precipitation: 'none' | 'light' | 'moderate' | 'heavy';
  seaState: number; // 0-9 Beaufort scale
}

export interface OceanCurrent {
  speed: number; // knots
  direction: number; // degrees
  depth: number; // meters
}

export interface BunkerPrice {
  portCode: string;
  portName: string;
  pricePerTon: number;
  currency: string;
  availability: 'high' | 'medium' | 'low';
  estimatedWaitTime: number; // hours
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  name: string;
  eta: Date;
  distanceFromPrevious: number; // nautical miles
  recommendedSpeed: number; // knots
  fuelConsumption: number; // tons
}

export interface OptimizedRoute {
  id: string;
  vesselId: string;
  origin: VesselPosition;
  destination: { latitude: number; longitude: number; name: string };
  waypoints: RouteWaypoint[];
  totalDistance: number; // nautical miles
  estimatedDuration: number; // hours
  estimatedFuelConsumption: number; // tons
  estimatedCost: number; // USD
  savings: {
    fuel: number; // percentage vs standard route
    time: number; // hours
    cost: number; // USD
  };
  riskScore: number; // 0-100
  weatherAlerts: string[];
  bunkerRecommendations: BunkerRecommendation[];
  optimizationType: 'fuel' | 'time' | 'balanced' | 'safety';
  confidence: number;
  lastUpdated: Date;
  nextRecalculation: Date;
}

export interface BunkerRecommendation {
  portCode: string;
  portName: string;
  recommendedQuantity: number; // tons
  estimatedPrice: number; // USD
  savingsVsNextPort: number; // USD
  deviationRequired: number; // nautical miles
  timeImpact: number; // hours
  priority: 'recommended' | 'optional' | 'emergency';
}

export interface SpeedAdjustment {
  fromWaypoint: number;
  toWaypoint: number;
  recommendedSpeed: number;
  reason: string;
  fuelSavings: number;
  timeImpact: number;
}

class RouteOptimizationEngine {
  private readonly EARTH_RADIUS_NM = 3440.065; // nautical miles

  async optimizeRoute(
    vessel: {
      id: string;
      currentPosition: VesselPosition;
      fuelCapacity: number;
      currentFuel: number;
      averageConsumption: number; // tons per nautical mile
      maxSpeed: number;
      economicalSpeed: number;
    },
    destination: { latitude: number; longitude: number; name: string },
    options: {
      optimizationType: OptimizedRoute['optimizationType'];
      maxDeviationNm?: number;
      requiredArrivalTime?: Date;
      avoidAreas?: Array<{ lat: number; lon: number; radius: number }>;
    }
  ): Promise<OptimizedRoute> {
    // Fetch real-time data
    const [weather, currents, bunkerPrices] = await Promise.all([
      this.fetchWeatherData(vessel.currentPosition, destination),
      this.fetchCurrentData(vessel.currentPosition, destination),
      this.fetchBunkerPrices(vessel.currentPosition, destination)
    ]);

    // Calculate base route
    const baseRoute = this.calculateGreatCircleRoute(
      vessel.currentPosition,
      destination
    );

    // Apply weather routing
    const weatherOptimizedRoute = this.applyWeatherRouting(
      baseRoute,
      weather,
      currents,
      options.avoidAreas
    );

    // Optimize speed profile
    const speedProfile = this.optimizeSpeedProfile(
      weatherOptimizedRoute,
      vessel,
      options.optimizationType,
      options.requiredArrivalTime
    );

    // Calculate bunker recommendations
    const bunkerRecs = this.calculateBunkerRecommendations(
      weatherOptimizedRoute,
      bunkerPrices,
      vessel,
      options.maxDeviationNm || 50
    );

    // Build final route
    const waypoints = this.buildWaypoints(
      weatherOptimizedRoute,
      speedProfile,
      vessel
    );

    const totalDistance = this.calculateTotalDistance(waypoints);
    const estimatedDuration = this.calculateDuration(waypoints, speedProfile);
    const estimatedFuel = this.calculateFuelConsumption(
      waypoints,
      speedProfile,
      vessel.averageConsumption
    );

    // Calculate savings vs standard route
    const standardDistance = this.haversineDistance(
      vessel.currentPosition.latitude,
      vessel.currentPosition.longitude,
      destination.latitude,
      destination.longitude
    );
    const standardFuel = standardDistance * vessel.averageConsumption;
    const standardDuration = standardDistance / vessel.economicalSpeed;

    const fuelSavings = ((standardFuel - estimatedFuel) / standardFuel) * 100;
    const timeSavings = standardDuration - estimatedDuration;

    return {
      id: crypto.randomUUID(),
      vesselId: vessel.id,
      origin: vessel.currentPosition,
      destination,
      waypoints,
      totalDistance,
      estimatedDuration,
      estimatedFuelConsumption: estimatedFuel,
      estimatedCost: this.calculateRouteCost(estimatedFuel, bunkerPrices),
      savings: {
        fuel: Math.max(0, fuelSavings),
        time: Math.max(0, timeSavings),
        cost: Math.max(0, (standardFuel - estimatedFuel) * 600) // $600/ton average
      },
      riskScore: this.calculateRouteRisk(weather, currents),
      weatherAlerts: this.generateWeatherAlerts(weather),
      bunkerRecommendations: bunkerRecs,
      optimizationType: options.optimizationType,
      confidence: this.calculateConfidence(weather),
      lastUpdated: new Date(),
      nextRecalculation: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    };
  }

  calculateRealTimeAdjustments(
    currentRoute: OptimizedRoute,
    currentPosition: VesselPosition,
    latestWeather: WeatherCondition
  ): {
    speedAdjustments: SpeedAdjustment[];
    routeDeviation: RouteWaypoint[] | null;
    urgency: 'none' | 'low' | 'medium' | 'high';
    reason: string;
  } {
    const adjustments: SpeedAdjustment[] = [];
    let routeDeviation: RouteWaypoint[] | null = null;
    let urgency: 'none' | 'low' | 'medium' | 'high' = 'none';
    let reason = 'Nenhum ajuste necessário';

    // Check for severe weather
    if (latestWeather.seaState >= 7 || latestWeather.windSpeed > 50) {
      urgency = 'high';
      reason = 'Condições meteorológicas severas detectadas';
      
      adjustments.push({
        fromWaypoint: 0,
        toWaypoint: 1,
        recommendedSpeed: Math.max(8, currentPosition.speed * 0.6),
        reason: 'Redução por mar agitado (Sea State ' + latestWeather.seaState + ')',
        fuelSavings: 15,
        timeImpact: 4
      });
    } else if (latestWeather.seaState >= 5) {
      urgency = 'medium';
      reason = 'Condições moderadas - ajuste de velocidade recomendado';
      
      adjustments.push({
        fromWaypoint: 0,
        toWaypoint: 1,
        recommendedSpeed: currentPosition.speed * 0.85,
        reason: 'Otimização por ondulação moderada',
        fuelSavings: 8,
        timeImpact: 1.5
      });
    }

    // Check if deviating from planned route
    const nextWaypoint = currentRoute.waypoints[0];
    if (nextWaypoint) {
      const deviation = this.haversineDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        nextWaypoint.latitude,
        nextWaypoint.longitude
      );

      if (deviation > 10) {
        urgency = urgency === 'none' ? 'low' : urgency;
        reason = `Desvio de ${deviation.toFixed(1)} NM da rota planejada`;
      }
    }

    return { speedAdjustments: adjustments, routeDeviation, urgency, reason };
  }

  private async fetchWeatherData(
    origin: VesselPosition,
    destination: { latitude: number; longitude: number }
  ): Promise<WeatherCondition[]> {
    // In production, this would call a weather API
    // Simulating weather data along the route
    const conditions: WeatherCondition[] = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      conditions.push({
        windSpeed: 15 + Math.random() * 20,
        windDirection: Math.random() * 360,
        waveHeight: 1 + Math.random() * 3,
        visibility: 5 + Math.random() * 10,
        precipitation: ['none', 'light', 'moderate'][Math.floor(Math.random() * 3)] as WeatherCondition['precipitation'],
        seaState: Math.floor(2 + Math.random() * 4)
      });
    }

    return conditions;
  }

  private async fetchCurrentData(
    origin: VesselPosition,
    destination: { latitude: number; longitude: number }
  ): Promise<OceanCurrent[]> {
    // Simulated ocean current data
    return Array(10).fill(null).map(() => ({
      speed: 0.5 + Math.random() * 2,
      direction: Math.random() * 360,
      depth: 10 + Math.random() * 50
    }));
  }

  private async fetchBunkerPrices(
    origin: VesselPosition,
    destination: { latitude: number; longitude: number }
  ): Promise<BunkerPrice[]> {
    // Simulated bunker prices at nearby ports
    return [
      { portCode: 'SGSIN', portName: 'Singapore', pricePerTon: 580, currency: 'USD', availability: 'high', estimatedWaitTime: 4 },
      { portCode: 'AEFUJ', portName: 'Fujairah', pricePerTon: 560, currency: 'USD', availability: 'high', estimatedWaitTime: 6 },
      { portCode: 'NLRTM', portName: 'Rotterdam', pricePerTon: 620, currency: 'USD', availability: 'medium', estimatedWaitTime: 8 },
      { portCode: 'HKHKG', portName: 'Hong Kong', pricePerTon: 595, currency: 'USD', availability: 'medium', estimatedWaitTime: 5 },
      { portCode: 'BRSSZ', portName: 'Santos', pricePerTon: 640, currency: 'USD', availability: 'high', estimatedWaitTime: 3 }
    ];
  }

  private calculateGreatCircleRoute(
    origin: VesselPosition,
    destination: { latitude: number; longitude: number }
  ): Array<{ lat: number; lon: number }> {
    const points: Array<{ lat: number; lon: number }> = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const lat = origin.latitude + (destination.latitude - origin.latitude) * fraction;
      const lon = origin.longitude + (destination.longitude - origin.longitude) * fraction;
      points.push({ lat, lon });
    }

    return points;
  }

  private applyWeatherRouting(
    baseRoute: Array<{ lat: number; lon: number }>,
    weather: WeatherCondition[],
    currents: OceanCurrent[],
    avoidAreas?: Array<{ lat: number; lon: number; radius: number }>
  ): Array<{ lat: number; lon: number }> {
    // Apply deviations to avoid bad weather
    return baseRoute.map((point, index) => {
      const weatherIdx = Math.min(index, weather.length - 1);
      const w = weather[weatherIdx];

      // Deviate from severe weather
      if (w.seaState >= 6 || w.waveHeight > 4) {
        const deviation = 0.5; // degrees
        return {
          lat: point.lat + (Math.random() > 0.5 ? deviation : -deviation),
          lon: point.lon + (Math.random() > 0.5 ? deviation : -deviation)
        };
      }

      return point;
    });
  }

  private optimizeSpeedProfile(
    route: Array<{ lat: number; lon: number }>,
    vessel: { maxSpeed: number; economicalSpeed: number },
    optimizationType: OptimizedRoute['optimizationType'],
    requiredArrivalTime?: Date
  ): number[] {
    return route.map((_, index) => {
      switch (optimizationType) {
        case 'fuel':
          return vessel.economicalSpeed * 0.9;
        case 'time':
          return vessel.maxSpeed * 0.95;
        case 'safety':
          return vessel.economicalSpeed * 0.85;
        case 'balanced':
        default:
          return vessel.economicalSpeed;
      }
    });
  }

  private calculateBunkerRecommendations(
    route: Array<{ lat: number; lon: number }>,
    bunkerPrices: BunkerPrice[],
    vessel: { currentFuel: number; fuelCapacity: number },
    maxDeviation: number
  ): BunkerRecommendation[] {
    const recommendations: BunkerRecommendation[] = [];
    const sortedPrices = [...bunkerPrices].sort((a, b) => a.pricePerTon - b.pricePerTon);

    for (const port of sortedPrices.slice(0, 3)) {
      const requiredFuel = vessel.fuelCapacity - vessel.currentFuel;
      if (requiredFuel > 100) {
        recommendations.push({
          portCode: port.portCode,
          portName: port.portName,
          recommendedQuantity: Math.min(requiredFuel, vessel.fuelCapacity * 0.8),
          estimatedPrice: requiredFuel * port.pricePerTon,
          savingsVsNextPort: requiredFuel * (sortedPrices[sortedPrices.length - 1].pricePerTon - port.pricePerTon),
          deviationRequired: Math.random() * maxDeviation,
          timeImpact: port.estimatedWaitTime,
          priority: port === sortedPrices[0] ? 'recommended' : 'optional'
        });
      }
    }

    return recommendations;
  }

  private buildWaypoints(
    route: Array<{ lat: number; lon: number }>,
    speedProfile: number[],
    vessel: { averageConsumption: number }
  ): RouteWaypoint[] {
    let cumulativeTime = 0;

    return route.map((point, index) => {
      const prevPoint = index > 0 ? route[index - 1] : point;
      const distance = index > 0
        ? this.haversineDistance(prevPoint.lat, prevPoint.lon, point.lat, point.lon)
        : 0;
      const speed = speedProfile[index];
      const timeToPoint = distance / speed;
      cumulativeTime += timeToPoint;

      return {
        latitude: point.lat,
        longitude: point.lon,
        name: `WP${String(index + 1).padStart(2, '0')}`,
        eta: new Date(Date.now() + cumulativeTime * 60 * 60 * 1000),
        distanceFromPrevious: distance,
        recommendedSpeed: speed,
        fuelConsumption: distance * vessel.averageConsumption
      };
    });
  }

  private calculateTotalDistance(waypoints: RouteWaypoint[]): number {
    return waypoints.reduce((sum, wp) => sum + wp.distanceFromPrevious, 0);
  }

  private calculateDuration(waypoints: RouteWaypoint[], speedProfile: number[]): number {
    return waypoints.reduce((sum, wp, index) => {
      return sum + (wp.distanceFromPrevious / speedProfile[index]);
    }, 0);
  }

  private calculateFuelConsumption(
    waypoints: RouteWaypoint[],
    speedProfile: number[],
    baseConsumption: number
  ): number {
    return waypoints.reduce((sum, wp, index) => {
      // Higher speeds = exponentially higher consumption
      const speedFactor = Math.pow(speedProfile[index] / 12, 1.5);
      return sum + wp.distanceFromPrevious * baseConsumption * speedFactor;
    }, 0);
  }

  private calculateRouteCost(fuelConsumption: number, bunkerPrices: BunkerPrice[]): number {
    const avgPrice = bunkerPrices.reduce((sum, p) => sum + p.pricePerTon, 0) / bunkerPrices.length;
    return fuelConsumption * avgPrice;
  }

  private calculateRouteRisk(weather: WeatherCondition[], currents: OceanCurrent[]): number {
    const weatherRisk = weather.reduce((sum, w) => {
      let risk = 0;
      if (w.seaState >= 7) risk += 30;
      else if (w.seaState >= 5) risk += 15;
      if (w.windSpeed > 40) risk += 20;
      if (w.visibility < 2) risk += 25;
      return sum + risk;
    }, 0) / weather.length;

    const currentRisk = currents.reduce((sum, c) => {
      return sum + (c.speed > 3 ? 10 : 0);
    }, 0) / currents.length;

    return Math.min(100, weatherRisk + currentRisk);
  }

  private generateWeatherAlerts(weather: WeatherCondition[]): string[] {
    const alerts: string[] = [];

    const maxSeaState = Math.max(...weather.map(w => w.seaState));
    const maxWind = Math.max(...weather.map(w => w.windSpeed));
    const minVisibility = Math.min(...weather.map(w => w.visibility));

    if (maxSeaState >= 7) {
      alerts.push(`⚠️ Mar muito agitado previsto (Sea State ${maxSeaState})`);
    }
    if (maxWind > 40) {
      alerts.push(`💨 Ventos fortes previstos (${maxWind} nós)`);
    }
    if (minVisibility < 2) {
      alerts.push(`🌫️ Baixa visibilidade prevista (${minVisibility} NM)`);
    }

    return alerts;
  }

  private calculateConfidence(weather: WeatherCondition[]): number {
    // Confidence decreases with weather variability
    const avgSeaState = weather.reduce((sum, w) => sum + w.seaState, 0) / weather.length;
    const variance = weather.reduce((sum, w) => sum + Math.pow(w.seaState - avgSeaState, 2), 0) / weather.length;
    
    return Math.max(0.6, 0.95 - variance * 0.1);
  }

  private haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_NM * c;
  }
}

export const routeOptimizationEngine = new RouteOptimizationEngine();
