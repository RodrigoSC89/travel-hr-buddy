/**
 * PATCH 164.0 - Navigation Copilot
 * AI-powered navigation with weather integration and route optimization
 */

import { logger } from '@/lib/logger';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RoutePoint extends Coordinates {
  timestamp?: number;
  speed?: number;
  heading?: number;
}

export interface WeatherData {
  location: Coordinates;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  visibility: number;
  conditions: string;
  severity: 'safe' | 'caution' | 'danger';
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  timestamp: number;
  temperature: number;
  windSpeed: number;
  conditions: string;
  severity: 'safe' | 'caution' | 'danger';
}

export interface NavigationRoute {
  id: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints: RoutePoint[];
  distance: number; // in nautical miles
  estimatedDuration: number; // in hours
  etaWithAI: string;
  weatherAlerts: WeatherAlert[];
  riskScore: number; // 0-100
  recommended: boolean;
}

export interface WeatherAlert {
  id: string;
  location: Coordinates;
  type: 'storm' | 'high_winds' | 'poor_visibility' | 'high_waves';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  validUntil: number;
}

export interface RouteOptimizationOptions {
  avoidStorms?: boolean;
  maxWindSpeed?: number;
  maxWaveHeight?: number;
  preferShorterDistance?: boolean;
  considerFuelEfficiency?: boolean;
}

class NavigationCopilot {
  private openWeatherApiKey: string | undefined;
  private mapboxApiKey: string | undefined;

  constructor() {
    this.openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    this.mapboxApiKey = import.meta.env.VITE_MAPBOX_TOKEN;
  }

  /**
   * Get weather data for a location
   */
  async getWeatherData(location: Coordinates): Promise<WeatherData> {
    if (!this.openWeatherApiKey) {
      logger.warn('OpenWeather API key not configured');
      return this.getMockWeatherData(location);
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${this.openWeatherApiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();

      return {
        location,
        temperature: data.main.temp,
        windSpeed: data.wind.speed * 1.94384, // Convert m/s to knots
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000, // Convert to km
        conditions: data.weather[0].description,
        severity: this.calculateWeatherSeverity(data.wind.speed * 1.94384, data.visibility)
      };
    } catch (error) {
      logger.error('Failed to fetch weather data:', error);
      return this.getMockWeatherData(location);
    }
  }

  /**
   * Calculate route with weather optimization
   */
  async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    options: RouteOptimizationOptions = {}
  ): Promise<NavigationRoute[]> {
    logger.info('Calculating routes with weather optimization');

    // Get weather data along potential routes
    const weatherAlerts = await this.getWeatherAlertsAlongRoute(origin, destination);

    // Calculate multiple route options
    const routes: NavigationRoute[] = [];

    // Direct route
    const directRoute = await this.calculateDirectRoute(origin, destination, weatherAlerts);
    routes.push(directRoute);

    // Alternative routes if storms detected
    if (options.avoidStorms && weatherAlerts.some(a => a.type === 'storm')) {
      const alternativeRoute = await this.calculateAlternativeRoute(
        origin,
        destination,
        weatherAlerts,
        options
      );
      routes.push(alternativeRoute);
    }

    // Sort by risk score and mark recommended
    routes.sort((a, b) => a.riskScore - b.riskScore);
    if (routes.length > 0) {
      routes[0].recommended = true;
    }

    return routes;
  }

  /**
   * Calculate direct route
   */
  private async calculateDirectRoute(
    origin: Coordinates,
    destination: Coordinates,
    weatherAlerts: WeatherAlert[]
  ): Promise<NavigationRoute> {
    // Calculate great circle distance
    const distance = this.calculateDistance(origin, destination);
    
    // Estimate duration (assuming average speed of 10 knots)
    const avgSpeed = 10;
    const duration = distance / avgSpeed;

    // Generate waypoints
    const waypoints = this.generateWaypoints(origin, destination, 10);

    // Calculate risk score
    const riskScore = this.calculateRouteRisk(waypoints, weatherAlerts);

    // Predict ETA with AI (considering weather)
    const etaWithAI = this.predictETAWithAI(duration, weatherAlerts);

    return {
      id: 'direct',
      origin,
      destination,
      waypoints,
      distance,
      estimatedDuration: duration,
      etaWithAI,
      weatherAlerts: weatherAlerts.filter(alert => 
        this.isAlertNearRoute(alert, waypoints)
      ),
      riskScore,
      recommended: false
    };
  }

  /**
   * Calculate alternative route avoiding hazards
   */
  private async calculateAlternativeRoute(
    origin: Coordinates,
    destination: Coordinates,
    weatherAlerts: WeatherAlert[],
    options: RouteOptimizationOptions
  ): Promise<NavigationRoute> {
    // Find storm locations
    const stormAlerts = weatherAlerts.filter(a => a.type === 'storm' || a.severity === 'critical');

    // Generate waypoints that avoid storms
    const waypoints = this.generateAvoidanceWaypoints(origin, destination, stormAlerts);

    // Calculate route distance
    const distance = this.calculateRouteDistance(waypoints);
    
    const avgSpeed = 10;
    const duration = distance / avgSpeed;

    const riskScore = this.calculateRouteRisk(waypoints, weatherAlerts);
    const etaWithAI = this.predictETAWithAI(duration, weatherAlerts);

    return {
      id: 'alternative',
      origin,
      destination,
      waypoints,
      distance,
      estimatedDuration: duration,
      etaWithAI,
      weatherAlerts: weatherAlerts.filter(alert => 
        this.isAlertNearRoute(alert, waypoints)
      ),
      riskScore,
      recommended: false
    };
  }

  /**
   * Get weather alerts along a route
   */
  private async getWeatherAlertsAlongRoute(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<WeatherAlert[]> {
    // Generate sample waypoints to check weather
    const checkPoints = this.generateWaypoints(origin, destination, 5);
    
    const alerts: WeatherAlert[] = [];

    for (const point of checkPoints) {
      const weather = await this.getWeatherData(point);
      
      if (weather.severity !== 'safe') {
        alerts.push({
          id: `alert-${point.lat}-${point.lng}`,
          location: point,
          type: this.getAlertType(weather),
          severity: this.mapSeverity(weather.severity),
          description: `${weather.conditions} - Wind: ${Math.round(weather.windSpeed)} knots`,
          validUntil: Date.now() + 6 * 60 * 60 * 1000 // 6 hours
        });
      }
    }

    return alerts;
  }

  /**
   * Predict ETA with AI considering weather conditions
   */
  private predictETAWithAI(baseDuration: number, alerts: WeatherAlert[]): string {
    let adjustedDuration = baseDuration;

    // Adjust for weather conditions
    for (const alert of alerts) {
      switch (alert.severity) {
        case 'low':
          adjustedDuration *= 1.05; // 5% delay
          break;
        case 'medium':
          adjustedDuration *= 1.15; // 15% delay
          break;
        case 'high':
          adjustedDuration *= 1.30; // 30% delay
          break;
        case 'critical':
          adjustedDuration *= 1.50; // 50% delay
          break;
      }
    }

    const eta = new Date(Date.now() + adjustedDuration * 60 * 60 * 1000);
    return eta.toLocaleString();
  }

  /**
   * Calculate risk score for a route
   */
  private calculateRouteRisk(waypoints: RoutePoint[], alerts: WeatherAlert[]): number {
    let riskScore = 0;

    for (const alert of alerts) {
      if (this.isAlertNearRoute(alert, waypoints)) {
        switch (alert.severity) {
          case 'low': riskScore += 10; break;
          case 'medium': riskScore += 25; break;
          case 'high': riskScore += 50; break;
          case 'critical': riskScore += 100; break;
        }
      }
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Helper functions
   */

  private calculateDistance(p1: Coordinates, p2: Coordinates): number {
    // Haversine formula for great circle distance
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = this.toRad(p2.lat - p1.lat);
    const dLon = this.toRad(p2.lng - p1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(p1.lat)) *
      Math.cos(this.toRad(p2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateRouteDistance(waypoints: RoutePoint[]): number {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
    }
    return totalDistance;
  }

  private generateWaypoints(
    origin: Coordinates,
    destination: Coordinates,
    count: number
  ): RoutePoint[] {
    const waypoints: RoutePoint[] = [origin];
    
    for (let i = 1; i < count; i++) {
      const ratio = i / count;
      waypoints.push({
        lat: origin.lat + (destination.lat - origin.lat) * ratio,
        lng: origin.lng + (destination.lng - origin.lng) * ratio
      });
    }
    
    waypoints.push(destination);
    return waypoints;
  }

  private generateAvoidanceWaypoints(
    origin: Coordinates,
    destination: Coordinates,
    alerts: WeatherAlert[]
  ): RoutePoint[] {
    // Simple avoidance: add offset perpendicular to direct route
    const midpoint = {
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2
    };

    // Check if midpoint is near any storms
    const nearStorm = alerts.some(alert => 
      this.calculateDistance(alert.location, midpoint) < 50 // within 50 nm
    );

    if (nearStorm) {
      // Add offset waypoint
      const offsetWaypoint = {
        lat: midpoint.lat + 0.5, // Offset north
        lng: midpoint.lng
      };
      return [origin, offsetWaypoint, destination];
    }

    return [origin, midpoint, destination];
  }

  private isAlertNearRoute(alert: WeatherAlert, waypoints: RoutePoint[]): boolean {
    const threshold = 30; // 30 nautical miles
    
    return waypoints.some(wp => 
      this.calculateDistance(alert.location, wp) < threshold
    );
  }

  private calculateWeatherSeverity(windSpeed: number, visibility: number): 'safe' | 'caution' | 'danger' {
    if (windSpeed > 40 || visibility < 1) return 'danger';
    if (windSpeed > 25 || visibility < 3) return 'caution';
    return 'safe';
  }

  private getAlertType(weather: WeatherData): WeatherAlert['type'] {
    if (weather.windSpeed > 40) return 'storm';
    if (weather.windSpeed > 25) return 'high_winds';
    if (weather.visibility < 1) return 'poor_visibility';
    if (weather.waveHeight && weather.waveHeight > 3) return 'high_waves';
    return 'high_winds';
  }

  private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'safe': return 'low';
      case 'caution': return 'medium';
      case 'danger': return 'critical';
      default: return 'medium';
    }
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getMockWeatherData(location: Coordinates): WeatherData {
    return {
      location,
      temperature: 20,
      windSpeed: 10,
      windDirection: 180,
      visibility: 10,
      conditions: 'Clear',
      severity: 'safe'
    };
  }
}

export const navigationCopilot = new NavigationCopilot();
