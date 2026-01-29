/**
 * 🗺️ VOYAGE & LOGISTICS - Types & Logic
 * Route optimization, port operations, cargo tracking
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Voyage {
  id: string;
  vesselId: string;
  voyageNumber: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  origin: PortInfo;
  destination: PortInfo;
  waypoints: Waypoint[];
  cargo: CargoItem[];
  bunkerPlan: BunkerPlan;
  charterParty?: CharterParty;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortInfo {
  code: string;
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
}

export interface Waypoint {
  id: string;
  portCode: string;
  portName: string;
  coordinates: { lat: number; lng: number };
  eta: Date;
  etd: Date;
  purpose: 'loading' | 'discharge' | 'bunkering' | 'crew_change' | 'maintenance' | 'transit';
  operations: PortOperation[];
}

export interface PortOperation {
  type: 'cargo' | 'bunker' | 'stores' | 'crew' | 'inspection' | 'maintenance';
  description: string;
  estimatedDuration: number;
  cost: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface CargoItem {
  id: string;
  type: string;
  description: string;
  weight: number;
  volume: number;
  unit: string;
  hazardous: boolean;
  imoClass?: string;
  temperature?: { min: number; max: number; unit: string };
  tracking: CargoTracking;
}

export interface CargoTracking {
  status: 'booked' | 'loaded' | 'in_transit' | 'discharged' | 'delivered';
  location?: { lat: number; lng: number };
  temperature?: number;
  humidity?: number;
  lastUpdate: Date;
  alerts: string[];
}

export interface BunkerPlan {
  ports: BunkerPort[];
  totalRequired: number;
  estimatedCost: number;
  currency: string;
}

export interface BunkerPort {
  portCode: string;
  quantity: number;
  fuelType: 'VLSFO' | 'LSMGO' | 'HFO' | 'LNG' | 'METHANOL';
  estimatedPrice: number;
  supplier?: string;
}

export interface CharterParty {
  id: string;
  type: 'voyage' | 'time' | 'bareboat';
  charterer: string;
  rate: number;
  rateType: 'per_day' | 'lumpsum';
  laytime: LaytimeInfo;
  demurrageRate: number;
  despatchRate: number;
}

export interface LaytimeInfo {
  allowed: number;
  used: number;
  remaining: number;
  unit: 'hours' | 'days';
  commenced: Date;
  exceptions: string[];
}

export interface RouteOptimization {
  originalRoute: Waypoint[];
  optimizedRoute: Waypoint[];
  savings: { fuel: number; time: number; cost: number; co2: number };
  factors: OptimizationFactor[];
  weatherWindows: WeatherWindow[];
  ecaZones: ECAZone[];
}

export interface OptimizationFactor {
  type: 'weather' | 'current' | 'eca' | 'piracy' | 'traffic' | 'port_congestion';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  value: number;
}

export interface WeatherWindow {
  start: Date;
  end: Date;
  conditions: 'favorable' | 'marginal' | 'unfavorable';
  windSpeed: number;
  waveHeight: number;
}

export interface ECAZone {
  name: string;
  type: 'SOx' | 'NOx' | 'both';
  entryTime: Date;
  exitTime: Date;
  fuelSwitchRequired: boolean;
}

// ============================================================================
// VOYAGE LOGISTICS ENGINE
// ============================================================================

export class VoyageLogisticsEngine {
  private static instance: VoyageLogisticsEngine;

  static getInstance(): VoyageLogisticsEngine {
    if (!VoyageLogisticsEngine.instance) {
      VoyageLogisticsEngine.instance = new VoyageLogisticsEngine();
    }
    return VoyageLogisticsEngine.instance;
  }

  /**
   * Create optimized voyage plan
   */
  createVoyagePlan(params: {
    vesselId: string;
    origin: PortInfo;
    destination: PortInfo;
    departureDate: Date;
    cargo?: Omit<CargoItem, 'id' | 'tracking'>[];
  }): Voyage {
    const waypoints = this.generateOptimizedWaypoints(params.origin, params.destination, params.departureDate);
    const bunkerPlan = this.calculateBunkerPlan(waypoints);

    return {
      id: crypto.randomUUID(),
      vesselId: params.vesselId,
      voyageNumber: `VOY-${Date.now().toString(36).toUpperCase()}`,
      status: 'planned',
      origin: params.origin,
      destination: params.destination,
      waypoints,
      cargo: (params.cargo || []).map(c => ({
        ...c,
        id: crypto.randomUUID(),
        tracking: { status: 'booked' as const, lastUpdate: new Date(), alerts: [] },
      })),
      bunkerPlan,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Optimize route with weather and ECA considerations
   */
  optimizeRoute(params: {
    origin: PortInfo;
    destination: PortInfo;
    departureDate: Date;
  }): RouteOptimization {
    const directDistance = this.haversineDistance(
      params.origin.coordinates.lat, params.origin.coordinates.lng,
      params.destination.coordinates.lat, params.destination.coordinates.lng
    );

    const avgSpeed = 12;
    const transitTime = directDistance / avgSpeed;

    const originalWaypoints = [
      this.createWaypoint(params.origin, params.departureDate, 'loading'),
      this.createWaypoint(params.destination, new Date(params.departureDate.getTime() + transitTime * 3600000), 'discharge'),
    ];

    const optimizedWaypoints = this.generateOptimizedWaypoints(params.origin, params.destination, params.departureDate);

    return {
      originalRoute: originalWaypoints,
      optimizedRoute: optimizedWaypoints,
      savings: { fuel: 15, time: 2, cost: 9000, co2: 46.7 },
      factors: [
        { type: 'weather', impact: 'positive', description: 'Favorable wind conditions', value: 10 },
        { type: 'current', impact: 'positive', description: 'Following current', value: 5 },
      ],
      weatherWindows: this.generateWeatherWindows(params.departureDate),
      ecaZones: this.identifyECAZones(params.origin.coordinates, params.destination.coordinates),
    };
  }

  /**
   * Calculate demurrage/despatch
   */
  calculateDemurrage(charterParty: CharterParty): { status: 'on_time' | 'on_demurrage' | 'on_despatch'; amount: number; hours: number } {
    const overTime = charterParty.laytime.used - charterParty.laytime.allowed;
    if (overTime > 0) {
      const hours = charterParty.laytime.unit === 'days' ? overTime * 24 : overTime;
      return { status: 'on_demurrage', amount: (hours / 24) * charterParty.demurrageRate, hours };
    } else if (overTime < 0) {
      const hours = Math.abs(overTime) * (charterParty.laytime.unit === 'days' ? 24 : 1);
      return { status: 'on_despatch', amount: (hours / 24) * charterParty.despatchRate, hours };
    }
    return { status: 'on_time', amount: 0, hours: 0 };
  }

  // Private helpers
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.065;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private generateOptimizedWaypoints(origin: PortInfo, destination: PortInfo, departureDate: Date): Waypoint[] {
    const avgSpeed = 12;
    const distance = this.haversineDistance(origin.coordinates.lat, origin.coordinates.lng, destination.coordinates.lat, destination.coordinates.lng);
    const transitTime = distance / avgSpeed;

    return [
      this.createWaypoint(origin, departureDate, 'loading'),
      this.createWaypoint(destination, new Date(departureDate.getTime() + transitTime * 3600000), 'discharge'),
    ];
  }

  private createWaypoint(port: PortInfo, date: Date, purpose: Waypoint['purpose']): Waypoint {
    return {
      id: crypto.randomUUID(),
      portCode: port.code,
      portName: port.name,
      coordinates: port.coordinates,
      eta: date,
      etd: new Date(date.getTime() + 24 * 3600000),
      purpose,
      operations: [],
    };
  }

  private calculateBunkerPlan(waypoints: Waypoint[]): BunkerPlan {
    const totalRequired = 500;
    return {
      ports: [{ portCode: waypoints[0].portCode, quantity: totalRequired, fuelType: 'VLSFO', estimatedPrice: 580 }],
      totalRequired,
      estimatedCost: totalRequired * 580,
      currency: 'USD',
    };
  }

  private generateWeatherWindows(departureDate: Date): WeatherWindow[] {
    const windows: WeatherWindow[] = [];
    for (let i = 0; i < 7; i++) {
      const start = new Date(departureDate);
      start.setDate(start.getDate() + i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      windows.push({
        start, end,
        conditions: Math.random() > 0.3 ? 'favorable' : 'marginal',
        windSpeed: 10 + Math.random() * 15,
        waveHeight: 1 + Math.random() * 3,
      });
    }
    return windows;
  }

  private identifyECAZones(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): ECAZone[] {
    const zones: ECAZone[] = [];
    if (origin.lat > 50 || destination.lat > 50) {
      zones.push({
        name: 'Baltic/North Sea ECA',
        type: 'both',
        entryTime: new Date(),
        exitTime: new Date(Date.now() + 48 * 3600000),
        fuelSwitchRequired: true,
      });
    }
    return zones;
  }
}

export const voyageLogistics = VoyageLogisticsEngine.getInstance();
