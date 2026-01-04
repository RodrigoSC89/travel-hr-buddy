/**
 * Route Optimizer - Nautilus One v3.2.0
 * AI-powered route optimization with weather, fuel, and risk analysis
 */

// Types
interface Position {
  lat: number;
  lng: number;
}

interface Vessel {
  id: string;
  name: string;
  type: string;
  fuelCapacity: number; // tons
  fuelConsumption: number; // tons per day at cruising speed
  cruisingSpeed: number; // knots
  maxSpeed: number; // knots
  draft: number; // meters
}

interface RouteParams {
  departure: Position & { port: string };
  arrival: Position & { port: string };
  vessel: Vessel;
  cargo: {
    type: string;
    weight: number;
    hazardous: boolean;
  };
  departureDate: Date;
  intermediatePorts?: Array<Position & { port: string }>;
}

interface WeatherForecast {
  position: Position;
  date: Date;
  waveHeight: number; // meters
  windSpeed: number; // knots
  windDirection: number; // degrees
  visibility: number; // nautical miles
  precipitation: number; // mm
  severity: 'calm' | 'moderate' | 'rough' | 'severe';
}

interface FuelPrice {
  port: string;
  position: Position;
  hfo: number; // $/ton Heavy Fuel Oil
  lsfo: number; // $/ton Low Sulfur Fuel Oil
  mgo: number; // $/ton Marine Gas Oil
  lastUpdated: Date;
}

interface RiskZone {
  id: string;
  type: 'piracy' | 'weather' | 'political' | 'environmental';
  severity: 'high' | 'medium' | 'low';
  polygon: Position[];
  validFrom: Date;
  validTo: Date;
  description: string;
}

interface RouteSegment {
  from: Position;
  to: Position;
  distance: number; // nautical miles
  estimatedDuration: number; // hours
  fuelConsumption: number; // tons
  inECA: boolean;
  risks: RiskZone[];
}

interface OptimizedRoute {
  id: string;
  segments: RouteSegment[];
  totalDistance: number; // nautical miles
  estimatedDuration: number; // hours
  eta: Date;
  fuelCost: number;
  fuelConsumption: {
    hfo: number;
    lsfo: number;
    total: number;
  };
  riskScore: number; // 0-100
  emissionsEstimate: number; // tons CO2
  score: number; // overall route score
  bunkerStops: Array<{
    port: string;
    position: Position;
    fuelType: string;
    quantity: number;
    cost: number;
  }>;
}

interface RouteAdjustment {
  recommendation: string;
  reason: string;
  newRoute?: OptimizedRoute;
  savings?: {
    fuel: number;
    time: number;
    risk: number;
  };
}

// ECA (Emission Control Areas) zones - simplified
const ECA_ZONES = [
  { name: 'North Sea ECA', bounds: { north: 62, south: 48, east: 10, west: -5 } },
  { name: 'Baltic Sea ECA', bounds: { north: 66, south: 53, east: 30, west: 10 } },
  { name: 'North America ECA', bounds: { north: 60, south: 25, east: -50, west: -130 } },
  { name: 'US Caribbean ECA', bounds: { north: 25, south: 18, east: -64, west: -98 } },
];

export class RouteOptimizer {
  // Calculate optimal routes
  static async optimizeRoute(params: RouteParams): Promise<OptimizedRoute[]> {
    const { departure, arrival, vessel, cargo, departureDate } = params;
    
    // Get weather forecast
    const weather = await this.getWeatherForecast(departure, arrival, 30);
    
    // Get fuel prices
    const fuelPrices = await this.getFuelPrices([
      departure.port,
      arrival.port,
      ...(params.intermediatePorts?.map(p => p.port) || []),
    ]);
    
    // Get risk zones
    const riskZones = await this.getRiskZones();
    
    // Calculate multiple route options
    const routes = await this.calculateRoutes(departure, arrival, {
      avoidHighSeas: weather.filter(w => w.waveHeight > 6).map(w => w.position),
      avoidPiracy: riskZones.filter(z => z.type === 'piracy' && z.severity === 'high'),
      fuelStops: this.optimizeFuelStops(fuelPrices, vessel.fuelCapacity),
      vessel,
      cargo,
      departureDate,
    });
    
    // Score and rank routes
    const scoredRoutes = routes.map(route => ({
      ...route,
      fuelCost: this.calculateFuelCost(route, vessel, fuelPrices),
      riskScore: this.calculateRiskScore(route, riskZones, weather),
      emissionsEstimate: this.calculateEmissions(route, vessel),
      score: 0, // Will be calculated
    }));
    
    // Calculate overall scores
    for (const route of scoredRoutes) {
      route.score = this.calculateRouteScore(route);
    }
    
    // Return top 3 routes sorted by score
    return scoredRoutes.sort((a, b) => b.score - a.score).slice(0, 3);
  }
  
  // Real-time route adjustment
  static async adjustRouteRealTime(
    currentPosition: Position,
    currentRoute: OptimizedRoute,
    vessel: Vessel
  ): Promise<RouteAdjustment> {
    // Get updated weather
    const destination = currentRoute.segments[currentRoute.segments.length - 1].to;
    const weather = await this.getWeatherForecast(currentPosition, destination, 7);
    
    // Get updated risks
    const riskZones = await this.getRiskZones();
    
    // Calculate remaining route metrics
    const remainingSegments = this.getRemainingSegments(currentPosition, currentRoute);
    const remainingDistance = remainingSegments.reduce((sum, s) => sum + s.distance, 0);
    
    // Check for weather warnings
    const severeWeather = weather.filter(w => w.severity === 'severe' || w.waveHeight > 6);
    
    // Check for new risks
    const newRisks = this.identifyNewRisks(remainingSegments, riskZones);
    
    // If no issues, continue current route
    if (severeWeather.length === 0 && newRisks.length === 0) {
      return {
        recommendation: 'Continue current route',
        reason: 'No significant changes in conditions',
      };
    }
    
    // Calculate alternative routes
    const alternatives = await this.calculateRoutes(currentPosition, destination, {
      avoidHighSeas: severeWeather.map(w => w.position),
      avoidPiracy: riskZones.filter(z => z.type === 'piracy'),
      fuelStops: [],
      vessel,
      cargo: { type: 'general', weight: 0, hazardous: false },
      departureDate: new Date(),
    });
    
    if (alternatives.length === 0) {
      return {
        recommendation: 'Continue with caution',
        reason: 'No viable alternatives found',
      };
    }
    
    const bestAlternative = alternatives[0];
    
    // Calculate savings
    const savings = {
      fuel: currentRoute.fuelConsumption.total - bestAlternative.fuelConsumption.total,
      time: currentRoute.estimatedDuration - bestAlternative.estimatedDuration,
      risk: currentRoute.riskScore - bestAlternative.riskScore,
    };
    
    // Only recommend if significant improvement (>10%)
    const significantImprovement = 
      Math.abs(savings.fuel / currentRoute.fuelConsumption.total) > 0.1 ||
      Math.abs(savings.risk / currentRoute.riskScore) > 0.1;
    
    if (significantImprovement) {
      const reasons: string[] = [];
      if (severeWeather.length > 0) reasons.push('weather conditions');
      if (newRisks.length > 0) reasons.push('risk zones');
      if (savings.fuel > 0) reasons.push('fuel savings');
      
      return {
        recommendation: 'Route adjustment recommended',
        reason: `Due to ${reasons.join(', ')}`,
        newRoute: bestAlternative,
        savings,
      };
    }
    
    return {
      recommendation: 'Continue current route',
      reason: 'Alternatives do not offer significant improvement',
    };
  }
  
  // Optimize fuel strategy considering ECA zones
  static async optimizeFuelStrategy(
    route: OptimizedRoute,
    vessel: Vessel
  ): Promise<{
    hfo: number;
    lsfo: number;
    mgo: number;
    totalCost: number;
    bunkerPlan: Array<{
      port: string;
      fuelType: string;
      quantity: number;
      price: number;
    }>;
  }> {
    let hfo = 0;
    let lsfo = 0;
    let mgo = 0;
    
    const bunkerPlan: Array<{
      port: string;
      fuelType: string;
      quantity: number;
      price: number;
    }> = [];
    
    // Calculate fuel needs per segment
    for (const segment of route.segments) {
      if (segment.inECA) {
        lsfo += segment.fuelConsumption;
      } else {
        hfo += segment.fuelConsumption;
      }
    }
    
    // Add port maneuvering fuel
    const portCalls = route.bunkerStops.length + 2; // departure + arrival + stops
    mgo = portCalls * 2; // 2 tons per port call
    
    // Get best prices for bunker stops
    const fuelPrices = await this.getFuelPrices([]);
    
    // Plan bunker stops
    let remainingCapacity = vessel.fuelCapacity;
    let requiredFuel = hfo + lsfo + mgo;
    
    // Sort bunker stops by price
    const sortedStops = [...route.bunkerStops].sort((a, b) => a.cost - b.cost);
    
    for (const stop of sortedStops) {
      if (remainingCapacity <= requiredFuel * 0.2) {
        // Need to bunker
        const quantityNeeded = Math.min(vessel.fuelCapacity - remainingCapacity, requiredFuel);
        bunkerPlan.push({
          port: stop.port,
          fuelType: stop.fuelType,
          quantity: quantityNeeded,
          price: stop.cost,
        });
        remainingCapacity += quantityNeeded;
        requiredFuel -= quantityNeeded;
      }
    }
    
    // Calculate total cost
    const avgHfoPrice = 500; // $/ton
    const avgLsfoPrice = 700; // $/ton
    const avgMgoPrice = 900; // $/ton
    
    const totalCost = hfo * avgHfoPrice + lsfo * avgLsfoPrice + mgo * avgMgoPrice;
    
    return {
      hfo,
      lsfo,
      mgo,
      totalCost,
      bunkerPlan,
    };
  }
  
  // Private: Get weather forecast (simulated)
  private static async getWeatherForecast(
    from: Position,
    to: Position,
    days: number
  ): Promise<WeatherForecast[]> {
    const forecasts: WeatherForecast[] = [];
    const numPoints = days;
    
    for (let i = 0; i < numPoints; i++) {
      const fraction = i / numPoints;
      const position = {
        lat: from.lat + (to.lat - from.lat) * fraction,
        lng: from.lng + (to.lng - from.lng) * fraction,
      };
      
      // Simulate weather - in production, use real weather API
      const waveHeight = Math.random() * 4 + 0.5;
      const windSpeed = Math.random() * 30 + 5;
      
      let severity: WeatherForecast['severity'];
      if (waveHeight < 2 && windSpeed < 15) severity = 'calm';
      else if (waveHeight < 4 && windSpeed < 25) severity = 'moderate';
      else if (waveHeight < 6 && windSpeed < 35) severity = 'rough';
      else severity = 'severe';
      
      forecasts.push({
        position,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        waveHeight,
        windSpeed,
        windDirection: Math.random() * 360,
        visibility: Math.random() * 10 + 2,
        precipitation: Math.random() * 20,
        severity,
      });
    }
    
    return forecasts;
  }
  
  // Private: Get fuel prices (simulated)
  private static async getFuelPrices(ports: string[]): Promise<FuelPrice[]> {
    // Simulated fuel prices - in production, use real API
    const basePrices: Record<string, FuelPrice> = {
      'Singapore': { port: 'Singapore', position: { lat: 1.3521, lng: 103.8198 }, hfo: 450, lsfo: 650, mgo: 850, lastUpdated: new Date() },
      'Rotterdam': { port: 'Rotterdam', position: { lat: 51.9244, lng: 4.4777 }, hfo: 500, lsfo: 700, mgo: 900, lastUpdated: new Date() },
      'Houston': { port: 'Houston', position: { lat: 29.7604, lng: -95.3698 }, hfo: 480, lsfo: 680, mgo: 880, lastUpdated: new Date() },
      'Dubai': { port: 'Dubai', position: { lat: 25.2048, lng: 55.2708 }, hfo: 460, lsfo: 660, mgo: 860, lastUpdated: new Date() },
      'Santos': { port: 'Santos', position: { lat: -23.9608, lng: -46.3336 }, hfo: 520, lsfo: 720, mgo: 920, lastUpdated: new Date() },
    };
    
    return Object.values(basePrices);
  }
  
  // Private: Get risk zones (simulated)
  private static async getRiskZones(): Promise<RiskZone[]> {
    return [
      {
        id: 'piracy-gog',
        type: 'piracy',
        severity: 'high',
        polygon: [
          { lat: 15, lng: -20 },
          { lat: 5, lng: -20 },
          { lat: 5, lng: 10 },
          { lat: 15, lng: 10 },
        ],
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        description: 'Gulf of Guinea high-risk area',
      },
      {
        id: 'piracy-som',
        type: 'piracy',
        severity: 'medium',
        polygon: [
          { lat: 15, lng: 50 },
          { lat: 5, lng: 50 },
          { lat: 5, lng: 70 },
          { lat: 15, lng: 70 },
        ],
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        description: 'Somali coast risk area',
      },
    ];
  }
  
  // Private: Calculate routes
  private static async calculateRoutes(
    from: Position,
    to: Position,
    options: {
      avoidHighSeas: Position[];
      avoidPiracy: RiskZone[];
      fuelStops: Array<{ port: string; position: Position }>;
      vessel: Vessel;
      cargo: { type: string; weight: number; hazardous: boolean };
      departureDate: Date;
    }
  ): Promise<OptimizedRoute[]> {
    const routes: OptimizedRoute[] = [];
    
    // Direct route
    const directRoute = this.calculateDirectRoute(from, to, options.vessel, options.departureDate);
    routes.push(directRoute);
    
    // Route avoiding risks
    if (options.avoidPiracy.length > 0) {
      const safeRoute = this.calculateSafeRoute(from, to, options.vessel, options.avoidPiracy, options.departureDate);
      routes.push(safeRoute);
    }
    
    // Weather-optimized route
    if (options.avoidHighSeas.length > 0) {
      const weatherRoute = this.calculateWeatherRoute(from, to, options.vessel, options.avoidHighSeas, options.departureDate);
      routes.push(weatherRoute);
    }
    
    return routes;
  }
  
  // Private: Calculate direct route
  private static calculateDirectRoute(
    from: Position,
    to: Position,
    vessel: Vessel,
    departureDate: Date
  ): OptimizedRoute {
    const distance = this.calculateDistance(from, to);
    const duration = distance / vessel.cruisingSpeed;
    const fuelConsumption = (duration / 24) * vessel.fuelConsumption;
    
    const inECA = this.isInECA({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 });
    
    return {
      id: `route-direct-${Date.now()}`,
      segments: [{
        from,
        to,
        distance,
        estimatedDuration: duration,
        fuelConsumption,
        inECA,
        risks: [],
      }],
      totalDistance: distance,
      estimatedDuration: duration,
      eta: new Date(departureDate.getTime() + duration * 60 * 60 * 1000),
      fuelCost: 0,
      fuelConsumption: {
        hfo: inECA ? 0 : fuelConsumption,
        lsfo: inECA ? fuelConsumption : 0,
        total: fuelConsumption,
      },
      riskScore: 0,
      emissionsEstimate: 0,
      score: 0,
      bunkerStops: [],
    };
  }
  
  // Private: Calculate safe route avoiding risks
  private static calculateSafeRoute(
    from: Position,
    to: Position,
    vessel: Vessel,
    risks: RiskZone[],
    departureDate: Date
  ): OptimizedRoute {
    // Add detour around risk zones
    const detourFactor = 1.15; // 15% longer
    const distance = this.calculateDistance(from, to) * detourFactor;
    const duration = distance / vessel.cruisingSpeed;
    const fuelConsumption = (duration / 24) * vessel.fuelConsumption;
    
    const inECA = this.isInECA({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 });
    
    return {
      id: `route-safe-${Date.now()}`,
      segments: [{
        from,
        to,
        distance,
        estimatedDuration: duration,
        fuelConsumption,
        inECA,
        risks: [],
      }],
      totalDistance: distance,
      estimatedDuration: duration,
      eta: new Date(departureDate.getTime() + duration * 60 * 60 * 1000),
      fuelCost: 0,
      fuelConsumption: {
        hfo: inECA ? 0 : fuelConsumption,
        lsfo: inECA ? fuelConsumption : 0,
        total: fuelConsumption,
      },
      riskScore: 10, // Lower risk
      emissionsEstimate: 0,
      score: 0,
      bunkerStops: [],
    };
  }
  
  // Private: Calculate weather-optimized route
  private static calculateWeatherRoute(
    from: Position,
    to: Position,
    vessel: Vessel,
    weatherRisks: Position[],
    departureDate: Date
  ): OptimizedRoute {
    // Add detour around weather
    const detourFactor = 1.1; // 10% longer
    const distance = this.calculateDistance(from, to) * detourFactor;
    const duration = distance / vessel.cruisingSpeed;
    const fuelConsumption = (duration / 24) * vessel.fuelConsumption;
    
    const inECA = this.isInECA({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 });
    
    return {
      id: `route-weather-${Date.now()}`,
      segments: [{
        from,
        to,
        distance,
        estimatedDuration: duration,
        fuelConsumption,
        inECA,
        risks: [],
      }],
      totalDistance: distance,
      estimatedDuration: duration,
      eta: new Date(departureDate.getTime() + duration * 60 * 60 * 1000),
      fuelCost: 0,
      fuelConsumption: {
        hfo: inECA ? 0 : fuelConsumption,
        lsfo: inECA ? fuelConsumption : 0,
        total: fuelConsumption,
      },
      riskScore: 15,
      emissionsEstimate: 0,
      score: 0,
      bunkerStops: [],
    };
  }
  
  // Private: Calculate distance between two points (Haversine formula)
  private static calculateDistance(from: Position, to: Position): number {
    const R = 3440.065; // Earth radius in nautical miles
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Private: Convert degrees to radians
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  // Private: Check if position is in ECA zone
  private static isInECA(position: Position): boolean {
    for (const eca of ECA_ZONES) {
      if (
        position.lat >= eca.bounds.south &&
        position.lat <= eca.bounds.north &&
        position.lng >= eca.bounds.west &&
        position.lng <= eca.bounds.east
      ) {
        return true;
      }
    }
    return false;
  }
  
  // Private: Optimize fuel stops
  private static optimizeFuelStops(
    fuelPrices: FuelPrice[],
    capacity: number
  ): Array<{ port: string; position: Position }> {
    // Sort by total price (HFO + LSFO weighted)
    const sorted = [...fuelPrices].sort((a, b) => {
      const priceA = a.hfo * 0.7 + a.lsfo * 0.3;
      const priceB = b.hfo * 0.7 + b.lsfo * 0.3;
      return priceA - priceB;
    });
    
    return sorted.slice(0, 3).map(p => ({
      port: p.port,
      position: p.position,
    }));
  }
  
  // Private: Calculate fuel cost
  private static calculateFuelCost(
    route: OptimizedRoute,
    vessel: Vessel,
    prices: FuelPrice[]
  ): number {
    const avgHfoPrice = prices.reduce((sum, p) => sum + p.hfo, 0) / prices.length;
    const avgLsfoPrice = prices.reduce((sum, p) => sum + p.lsfo, 0) / prices.length;
    
    return route.fuelConsumption.hfo * avgHfoPrice + route.fuelConsumption.lsfo * avgLsfoPrice;
  }
  
  // Private: Calculate risk score
  private static calculateRiskScore(
    route: OptimizedRoute,
    risks: RiskZone[],
    weather: WeatherForecast[]
  ): number {
    let score = 0;
    
    // Add risk for each segment in risk zones
    for (const segment of route.segments) {
      for (const risk of segment.risks) {
        if (risk.severity === 'high') score += 30;
        else if (risk.severity === 'medium') score += 15;
        else score += 5;
      }
    }
    
    // Add weather risk
    const severeWeather = weather.filter(w => w.severity === 'severe').length;
    const roughWeather = weather.filter(w => w.severity === 'rough').length;
    
    score += severeWeather * 20;
    score += roughWeather * 10;
    
    return Math.min(100, score);
  }
  
  // Private: Calculate emissions
  private static calculateEmissions(route: OptimizedRoute, vessel: Vessel): number {
    // CO2 emission factors (tons CO2 per ton fuel)
    const emissionFactors = {
      hfo: 3.114,
      lsfo: 3.151,
      mgo: 3.206,
    };
    
    return (
      route.fuelConsumption.hfo * emissionFactors.hfo +
      route.fuelConsumption.lsfo * emissionFactors.lsfo
    );
  }
  
  // Private: Calculate overall route score
  private static calculateRouteScore(route: OptimizedRoute): number {
    // Weight factors
    const weights = {
      distance: 0.25,
      time: 0.25,
      fuel: 0.25,
      risk: 0.25,
    };
    
    // Normalize values (lower is better)
    const distanceScore = Math.max(0, 100 - route.totalDistance / 100);
    const timeScore = Math.max(0, 100 - route.estimatedDuration / 10);
    const fuelScore = Math.max(0, 100 - route.fuelConsumption.total / 10);
    const riskScore = 100 - route.riskScore;
    
    return (
      weights.distance * distanceScore +
      weights.time * timeScore +
      weights.fuel * fuelScore +
      weights.risk * riskScore
    );
  }
  
  // Private: Get remaining segments from current position
  private static getRemainingSegments(
    currentPosition: Position,
    route: OptimizedRoute
  ): RouteSegment[] {
    // Find the current segment
    let foundCurrent = false;
    const remaining: RouteSegment[] = [];
    
    for (const segment of route.segments) {
      if (foundCurrent) {
        remaining.push(segment);
        continue;
      }
      
      // Check if current position is within this segment
      const distToFrom = this.calculateDistance(currentPosition, segment.from);
      const distToTo = this.calculateDistance(currentPosition, segment.to);
      const segmentLength = segment.distance;
      
      if (distToFrom + distToTo <= segmentLength * 1.1) {
        // We're in this segment
        foundCurrent = true;
        
        // Add remaining portion of this segment
        remaining.push({
          ...segment,
          from: currentPosition,
          distance: distToTo,
        });
      }
    }
    
    return remaining;
  }
  
  // Private: Identify new risks
  private static identifyNewRisks(
    segments: RouteSegment[],
    riskZones: RiskZone[]
  ): RiskZone[] {
    const newRisks: RiskZone[] = [];
    
    for (const zone of riskZones) {
      const existingInSegments = segments.some(s => s.risks.some(r => r.id === zone.id));
      
      if (!existingInSegments) {
        // Check if route passes through this zone
        for (const segment of segments) {
          if (this.segmentIntersectsZone(segment, zone)) {
            newRisks.push(zone);
            break;
          }
        }
      }
    }
    
    return newRisks;
  }
  
  // Private: Check if segment intersects risk zone
  private static segmentIntersectsZone(segment: RouteSegment, zone: RiskZone): boolean {
    // Simplified check - just check if midpoint is in zone
    const midpoint = {
      lat: (segment.from.lat + segment.to.lat) / 2,
      lng: (segment.from.lng + segment.to.lng) / 2,
    };
    
    return this.isPointInPolygon(midpoint, zone.polygon);
  }
  
  // Private: Check if point is in polygon
  private static isPointInPolygon(point: Position, polygon: Position[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      if ((yi > point.lat) !== (yj > point.lat) &&
          point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}

export default RouteOptimizer;
