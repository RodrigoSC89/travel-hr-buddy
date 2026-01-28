/**
 * Real-time Route Optimization Engine
 * Autonomous route and speed adjustment based on weather, currents, and bunker prices
 */

export interface VesselPosition {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  wavePeriod: number;
  currentSpeed: number;
  currentDirection: number;
  visibility: number;
  precipitation: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  timestamp: Date;
  windSpeed: number;
  waveHeight: number;
  currentSpeed: number;
}

export interface BunkerPrice {
  portId: string;
  portName: string;
  latitude: number;
  longitude: number;
  pricePerTon: number;
  availability: 'high' | 'medium' | 'low';
  waitingTime: number; // hours
  lastUpdated: Date;
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  arrivalTime: Date;
  recommendedSpeed: number;
  weatherRisk: number;
  notes: string;
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[];
  totalDistance: number;
  totalTime: number;
  estimatedFuelConsumption: number;
  estimatedCost: number;
  recommendedBunkerStop: BunkerPrice | null;
  riskScore: number;
  optimizationType: 'fuel' | 'time' | 'safety' | 'balanced';
  savings: {
    fuel: number;
    cost: number;
    time: number;
  };
  alerts: RouteAlert[];
}

export interface RouteAlert {
  type: 'weather' | 'traffic' | 'restriction' | 'bunker';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  location: { lat: number; lon: number };
  validFrom: Date;
  validTo: Date;
}

export interface VesselSpecs {
  vesselId: string;
  vesselName: string;
  maxSpeed: number;
  economicalSpeed: number;
  fuelCapacity: number;
  currentFuel: number;
  consumptionRate: number; // tons per hour at economical speed
  weatherPenalties: {
    waveHeight: number; // consumption increase per meter
    windSpeed: number; // consumption increase per knot
  };
}

class RealtimeRouteOptimizer {
  private readonly EARTH_RADIUS = 6371; // km
  private currentWeatherData: Map<string, WeatherData> = new Map();
  private bunkerPrices: BunkerPrice[] = [];
  private activeRoutes: Map<string, OptimizedRoute> = new Map();

  async optimizeRoute(
    vessel: VesselSpecs,
    currentPosition: VesselPosition,
    destination: { latitude: number; longitude: number; name: string },
    optimizationType: 'fuel' | 'time' | 'safety' | 'balanced' = 'balanced',
    requiredArrivalTime?: Date
  ): Promise<OptimizedRoute> {
    // Calculate base route
    const baseDistance = this.calculateDistance(
      currentPosition.latitude, currentPosition.longitude,
      destination.latitude, destination.longitude
    );

    // Get weather along route
    const routeWeather = this.getRouteWeather(currentPosition, destination);
    
    // Calculate optimal waypoints avoiding bad weather
    const waypoints = this.calculateOptimalWaypoints(
      currentPosition,
      destination,
      routeWeather,
      optimizationType
    );

    // Calculate speeds based on optimization type and constraints
    const speedProfile = this.calculateSpeedProfile(
      vessel,
      waypoints,
      requiredArrivalTime,
      optimizationType
    );

    // Find optimal bunker stop if needed
    const bunkerStop = this.findOptimalBunkerStop(
      vessel,
      waypoints,
      this.bunkerPrices
    );

    // Calculate totals
    const totalDistance = this.calculateTotalDistance(waypoints);
    const totalTime = this.calculateTotalTime(waypoints, speedProfile);
    const fuelConsumption = this.calculateFuelConsumption(vessel, waypoints, speedProfile, routeWeather);
    const estimatedCost = this.calculateCost(fuelConsumption, bunkerStop);

    // Calculate savings compared to direct route
    const directFuel = this.calculateDirectRouteFuel(vessel, baseDistance, routeWeather);
    const savings = {
      fuel: ((directFuel - fuelConsumption) / directFuel) * 100,
      cost: estimatedCost * 0.1, // Estimated savings
      time: 0 // Calculated if arrival time constraint met
    };

    // Generate alerts
    const alerts = this.generateRouteAlerts(waypoints, routeWeather);

    // Risk score (0-100)
    const riskScore = this.calculateRiskScore(routeWeather, waypoints);

    const route: OptimizedRoute = {
      waypoints: waypoints.map((wp, i) => ({
        ...wp,
        recommendedSpeed: speedProfile[i] || vessel.economicalSpeed,
        arrivalTime: this.calculateArrivalTime(currentPosition.timestamp, waypoints.slice(0, i + 1), speedProfile)
      })),
      totalDistance,
      totalTime,
      estimatedFuelConsumption: fuelConsumption,
      estimatedCost,
      recommendedBunkerStop: bunkerStop,
      riskScore,
      optimizationType,
      savings,
      alerts
    };

    this.activeRoutes.set(vessel.vesselId, route);
    return route;
  }

  adjustRouteRealtime(
    vesselId: string,
    currentPosition: VesselPosition,
    newWeatherData: WeatherData
  ): { speedAdjustment: number; courseAdjustment: number; reason: string } | null {
    const route = this.activeRoutes.get(vesselId);
    if (!route) return null;

    // Check if weather requires adjustment
    const weatherImpact = this.assessWeatherImpact(newWeatherData);
    
    if (weatherImpact.severity === 'low') {
      return null;
    }

    // Calculate adjustments
    let speedAdjustment = 0;
    let courseAdjustment = 0;
    let reason = '';

    if (newWeatherData.waveHeight > 3) {
      speedAdjustment = -2; // Reduce by 2 knots
      reason = `High waves (${newWeatherData.waveHeight}m) - reducing speed for safety`;
    }

    if (newWeatherData.windSpeed > 25) {
      speedAdjustment = Math.min(speedAdjustment, -3);
      reason = `Strong winds (${newWeatherData.windSpeed}kn) - ${reason || 'reducing speed'}`;
    }

    // Course adjustment if current is against heading
    const currentImpact = this.calculateCurrentImpact(currentPosition.heading, newWeatherData);
    if (currentImpact < -1) {
      courseAdjustment = this.calculateOptimalCourseDeviation(currentPosition, newWeatherData);
      reason += ` | Course adjustment ${courseAdjustment > 0 ? '+' : ''}${courseAdjustment}° to minimize current impact`;
    }

    return { speedAdjustment, courseAdjustment, reason };
  }

  updateBunkerPrices(prices: BunkerPrice[]): void {
    this.bunkerPrices = prices;
  }

  updateWeatherData(weather: WeatherData): void {
    const key = `${weather.latitude.toFixed(1)}_${weather.longitude.toFixed(1)}`;
    this.currentWeatherData.set(key, weather);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c * 0.539957; // Convert km to nautical miles
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getRouteWeather(
    start: VesselPosition,
    end: { latitude: number; longitude: number }
  ): WeatherData[] {
    // Interpolate weather along route
    const points = 10;
    const weather: WeatherData[] = [];

    for (let i = 0; i <= points; i++) {
      const fraction = i / points;
      const lat = start.latitude + (end.latitude - start.latitude) * fraction;
      const lon = start.longitude + (end.longitude - start.longitude) * fraction;
      
      const key = `${lat.toFixed(1)}_${lon.toFixed(1)}`;
      const cached = this.currentWeatherData.get(key);
      
      if (cached) {
        weather.push(cached);
      } else {
        // Generate synthetic weather for demo
        weather.push(this.generateSyntheticWeather(lat, lon));
      }
    }

    return weather;
  }

  private generateSyntheticWeather(lat: number, lon: number): WeatherData {
    // Generate realistic weather patterns
    const baseWind = 10 + Math.random() * 15;
    const baseWave = 1 + Math.random() * 2;
    
    return {
      latitude: lat,
      longitude: lon,
      windSpeed: baseWind,
      windDirection: Math.random() * 360,
      waveHeight: baseWave,
      wavePeriod: 6 + Math.random() * 4,
      currentSpeed: 0.5 + Math.random() * 2,
      currentDirection: Math.random() * 360,
      visibility: 5 + Math.random() * 10,
      precipitation: Math.random() * 5,
      forecast: []
    };
  }

  private calculateOptimalWaypoints(
    start: VesselPosition,
    end: { latitude: number; longitude: number },
    weather: WeatherData[],
    optimizationType: string
  ): RouteWaypoint[] {
    const waypoints: RouteWaypoint[] = [];
    const points = Math.max(5, Math.ceil(this.calculateDistance(
      start.latitude, start.longitude, end.latitude, end.longitude
    ) / 100)); // One waypoint per 100nm

    for (let i = 0; i <= points; i++) {
      const fraction = i / points;
      let lat = start.latitude + (end.latitude - start.latitude) * fraction;
      let lon = start.longitude + (end.longitude - start.longitude) * fraction;

      // Deviate around bad weather if safety-focused
      const nearestWeather = weather[Math.round(fraction * (weather.length - 1))];
      if (optimizationType === 'safety' || optimizationType === 'balanced') {
        const deviation = this.calculateWeatherDeviation(nearestWeather);
        lat += deviation.lat;
        lon += deviation.lon;
      }

      waypoints.push({
        latitude: lat,
        longitude: lon,
        arrivalTime: new Date(),
        recommendedSpeed: 0,
        weatherRisk: this.calculatePointRisk(nearestWeather),
        notes: this.generateWaypointNotes(nearestWeather)
      });
    }

    return waypoints;
  }

  private calculateWeatherDeviation(weather: WeatherData): { lat: number; lon: number } {
    if (weather.waveHeight < 3 && weather.windSpeed < 20) {
      return { lat: 0, lon: 0 };
    }

    // Deviate perpendicular to wind direction
    const deviationMagnitude = Math.min(0.5, (weather.waveHeight - 2) * 0.1);
    const windRad = this.toRad(weather.windDirection + 90);
    
    return {
      lat: Math.cos(windRad) * deviationMagnitude,
      lon: Math.sin(windRad) * deviationMagnitude
    };
  }

  private calculatePointRisk(weather: WeatherData): number {
    let risk = 0;
    
    // Wave risk (0-40 points)
    if (weather.waveHeight > 4) risk += 40;
    else if (weather.waveHeight > 3) risk += 25;
    else if (weather.waveHeight > 2) risk += 10;
    
    // Wind risk (0-30 points)
    if (weather.windSpeed > 30) risk += 30;
    else if (weather.windSpeed > 20) risk += 20;
    else if (weather.windSpeed > 15) risk += 10;
    
    // Visibility risk (0-20 points)
    if (weather.visibility < 1) risk += 20;
    else if (weather.visibility < 3) risk += 10;
    
    // Current risk (0-10 points)
    if (weather.currentSpeed > 3) risk += 10;
    else if (weather.currentSpeed > 2) risk += 5;

    return Math.min(100, risk);
  }

  private generateWaypointNotes(weather: WeatherData): string {
    const notes: string[] = [];
    
    if (weather.waveHeight > 3) notes.push(`Heavy seas: ${weather.waveHeight}m waves`);
    if (weather.windSpeed > 20) notes.push(`Strong winds: ${weather.windSpeed}kn`);
    if (weather.visibility < 3) notes.push(`Reduced visibility: ${weather.visibility}nm`);
    if (weather.currentSpeed > 2) notes.push(`Strong current: ${weather.currentSpeed}kn`);
    
    return notes.join(' | ') || 'Normal conditions';
  }

  private calculateSpeedProfile(
    vessel: VesselSpecs,
    waypoints: RouteWaypoint[],
    requiredArrivalTime: Date | undefined,
    optimizationType: string
  ): number[] {
    const speeds: number[] = [];
    
    for (const waypoint of waypoints) {
      let speed = vessel.economicalSpeed;
      
      // Adjust for optimization type
      switch (optimizationType) {
        case 'time':
          speed = vessel.maxSpeed * 0.9;
          break;
        case 'fuel':
          speed = vessel.economicalSpeed * 0.85;
          break;
        case 'safety':
          speed = vessel.economicalSpeed * (1 - waypoint.weatherRisk / 200);
          break;
        default: // balanced
          speed = vessel.economicalSpeed * (1 - waypoint.weatherRisk / 400);
      }

      // Apply safety limits
      if (waypoint.weatherRisk > 50) {
        speed = Math.min(speed, vessel.economicalSpeed * 0.7);
      }

      speeds.push(Math.max(speed, vessel.economicalSpeed * 0.5));
    }

    return speeds;
  }

  private findOptimalBunkerStop(
    vessel: VesselSpecs,
    waypoints: RouteWaypoint[],
    prices: BunkerPrice[]
  ): BunkerPrice | null {
    // Check if bunker stop needed
    const totalDistance = this.calculateTotalDistance(waypoints);
    const estimatedFuel = totalDistance * (vessel.consumptionRate / vessel.economicalSpeed);
    
    if (vessel.currentFuel > estimatedFuel * 1.3) {
      return null; // Enough fuel with 30% margin
    }

    // Find best price along route
    const nearbyPorts = prices
      .filter(port => {
        const nearestWaypoint = waypoints.reduce((nearest, wp) => {
          const dist = this.calculateDistance(wp.latitude, wp.longitude, port.latitude, port.longitude);
          return dist < nearest.dist ? { dist, wp } : nearest;
        }, { dist: Infinity, wp: waypoints[0] });
        
        return nearestWaypoint.dist < 100; // Within 100nm of route
      })
      .sort((a, b) => {
        // Score by price + waiting time + distance
        const scoreA = a.pricePerTon + a.waitingTime * 10;
        const scoreB = b.pricePerTon + b.waitingTime * 10;
        return scoreA - scoreB;
      });

    return nearbyPorts[0] || null;
  }

  private calculateTotalDistance(waypoints: RouteWaypoint[]): number {
    let total = 0;
    for (let i = 1; i < waypoints.length; i++) {
      total += this.calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
    }
    return total;
  }

  private calculateTotalTime(waypoints: RouteWaypoint[], speeds: number[]): number {
    let totalHours = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const distance = this.calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
      totalHours += distance / (speeds[i] || 12);
    }
    return totalHours;
  }

  private calculateFuelConsumption(
    vessel: VesselSpecs,
    waypoints: RouteWaypoint[],
    speeds: number[],
    weather: WeatherData[]
  ): number {
    let totalFuel = 0;
    
    for (let i = 1; i < waypoints.length; i++) {
      const distance = this.calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
      const speed = speeds[i] || vessel.economicalSpeed;
      const time = distance / speed;
      
      // Base consumption
      let consumption = vessel.consumptionRate * time;
      
      // Weather penalties
      const weatherIndex = Math.min(i, weather.length - 1);
      const w = weather[weatherIndex];
      consumption *= (1 + w.waveHeight * vessel.weatherPenalties.waveHeight);
      consumption *= (1 + w.windSpeed * vessel.weatherPenalties.windSpeed / 100);
      
      // Speed penalty (exponential above economical)
      if (speed > vessel.economicalSpeed) {
        const speedRatio = speed / vessel.economicalSpeed;
        consumption *= Math.pow(speedRatio, 2.5);
      }
      
      totalFuel += consumption;
    }

    return totalFuel;
  }

  private calculateDirectRouteFuel(vessel: VesselSpecs, distance: number, weather: WeatherData[]): number {
    const time = distance / vessel.economicalSpeed;
    let fuel = vessel.consumptionRate * time;
    
    // Average weather penalty
    const avgWave = weather.reduce((sum, w) => sum + w.waveHeight, 0) / weather.length;
    const avgWind = weather.reduce((sum, w) => sum + w.windSpeed, 0) / weather.length;
    
    fuel *= (1 + avgWave * vessel.weatherPenalties.waveHeight);
    fuel *= (1 + avgWind * vessel.weatherPenalties.windSpeed / 100);
    
    return fuel;
  }

  private calculateCost(fuelConsumption: number, bunkerStop: BunkerPrice | null): number {
    const fuelPrice = bunkerStop?.pricePerTon || 600; // Default price
    return fuelConsumption * fuelPrice;
  }

  private calculateRiskScore(weather: WeatherData[], waypoints: RouteWaypoint[]): number {
    const avgWeatherRisk = weather.reduce((sum, w) => sum + this.calculatePointRisk(w), 0) / weather.length;
    const maxWaypointRisk = Math.max(...waypoints.map(w => w.weatherRisk));
    
    return Math.round((avgWeatherRisk + maxWaypointRisk) / 2);
  }

  private generateRouteAlerts(waypoints: RouteWaypoint[], weather: WeatherData[]): RouteAlert[] {
    const alerts: RouteAlert[] = [];

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const w = weather[Math.min(i, weather.length - 1)];

      if (w.waveHeight > 4) {
        alerts.push({
          type: 'weather',
          severity: 'critical',
          message: `Severe sea state: ${w.waveHeight}m waves`,
          location: { lat: wp.latitude, lon: wp.longitude },
          validFrom: new Date(),
          validTo: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      } else if (w.waveHeight > 3) {
        alerts.push({
          type: 'weather',
          severity: 'warning',
          message: `Heavy seas: ${w.waveHeight}m waves expected`,
          location: { lat: wp.latitude, lon: wp.longitude },
          validFrom: new Date(),
          validTo: new Date(Date.now() + 12 * 60 * 60 * 1000)
        });
      }

      if (w.visibility < 1) {
        alerts.push({
          type: 'weather',
          severity: 'critical',
          message: `Poor visibility: ${w.visibility}nm`,
          location: { lat: wp.latitude, lon: wp.longitude },
          validFrom: new Date(),
          validTo: new Date(Date.now() + 6 * 60 * 60 * 1000)
        });
      }
    }

    return alerts.slice(0, 10); // Limit to 10 alerts
  }

  private assessWeatherImpact(weather: WeatherData): { severity: 'low' | 'medium' | 'high' } {
    const risk = this.calculatePointRisk(weather);
    if (risk > 60) return { severity: 'high' };
    if (risk > 30) return { severity: 'medium' };
    return { severity: 'low' };
  }

  private calculateCurrentImpact(heading: number, weather: WeatherData): number {
    // Calculate how much current helps/hinders
    const angleDiff = Math.abs(heading - weather.currentDirection);
    const cosAngle = Math.cos(this.toRad(angleDiff));
    return weather.currentSpeed * cosAngle; // Positive = helpful, negative = against
  }

  private calculateOptimalCourseDeviation(position: VesselPosition, weather: WeatherData): number {
    // Simple course adjustment to minimize current impact
    const angleDiff = position.heading - weather.currentDirection;
    if (Math.abs(angleDiff) < 30) return 0;
    return angleDiff > 0 ? 15 : -15;
  }

  private calculateArrivalTime(startTime: Date, waypoints: RouteWaypoint[], speeds: number[]): Date {
    let totalHours = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const dist = this.calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
      totalHours += dist / (speeds[i] || 12);
    }
    return new Date(startTime.getTime() + totalHours * 60 * 60 * 1000);
  }
}

export const realtimeRouteOptimizer = new RealtimeRouteOptimizer();
