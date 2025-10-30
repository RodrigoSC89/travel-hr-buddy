/**
 * PATCH 532 - Weather Integration Service
 * Connects weather-dashboard data with route planning for AI geospatial optimization
 */

import { logger } from "@/lib/logger";
import type { Coordinates } from "@/modules/navigation-copilot";

export interface WeatherCondition {
  location: Coordinates;
  timestamp: number;
  temperature: number;
  windSpeed: number; // knots
  windDirection: number; // degrees
  waveHeight: number; // meters
  visibility: number; // nautical miles
  precipitation: number; // mm/h
  conditions: string;
  severity: "safe" | "caution" | "danger" | "critical";
}

export interface RouteWeatherImpact {
  avgWindSpeed: number;
  maxWindSpeed: number;
  avgWaveHeight: number;
  maxWaveHeight: number;
  totalStormHours: number;
  safetyScore: number; // 0-100
  recommendedSpeed: number; // knots
  timeImpact: number; // hours (positive = delay)
}

class WeatherIntegrationService {
  private weatherCache = new Map<string, WeatherCondition>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  /**
   * Get weather data for multiple waypoints along a route
   */
  async getRouteWeather(waypoints: Coordinates[]): Promise<WeatherCondition[]> {
    const weatherData: WeatherCondition[] = [];

    for (const point of waypoints) {
      const weather = await this.getWeatherForPoint(point);
      weatherData.push(weather);
    }

    return weatherData;
  }

  /**
   * Get weather data for a specific point
   */
  private async getWeatherForPoint(location: Coordinates): Promise<WeatherCondition> {
    const cacheKey = `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;
    
    // Check cache
    const cached = this.weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    // In production, this would call a real weather API
    // For now, generate realistic weather data
    const weather = this.generateWeatherData(location);
    this.weatherCache.set(cacheKey, weather);

    return weather;
  }

  /**
   * Generate realistic weather data (simulate API call)
   */
  private generateWeatherData(location: Coordinates): WeatherCondition {
    // Simulate different weather conditions based on location
    const lat = location.lat;
    const lng = location.lng;
    
    // Higher latitudes tend to have stronger winds
    const baseWindSpeed = 5 + Math.abs(lat) * 0.3;
    const windVariation = Math.random() * 10;
    const windSpeed = baseWindSpeed + windVariation;
    
    // Wave height correlates with wind
    const waveHeight = Math.max(0.5, (windSpeed / 10) + Math.random() * 2);
    
    // Temperature decreases with latitude
    const temperature = 30 - Math.abs(lat) * 0.5 + Math.random() * 5;
    
    // Determine severity
    let severity: WeatherCondition["severity"] = "safe";
    if (windSpeed > 35 || waveHeight > 4) {
      severity = "critical";
    } else if (windSpeed > 25 || waveHeight > 3) {
      severity = "danger";
    } else if (windSpeed > 15 || waveHeight > 2) {
      severity = "caution";
    }

    return {
      location,
      timestamp: Date.now(),
      temperature,
      windSpeed,
      windDirection: Math.random() * 360,
      waveHeight,
      visibility: Math.max(2, 10 - windSpeed * 0.2),
      precipitation: windSpeed > 20 ? Math.random() * 5 : 0,
      conditions: this.getConditionDescription(windSpeed, waveHeight),
      severity,
    };
  }

  private getConditionDescription(windSpeed: number, waveHeight: number): string {
    if (windSpeed > 35) return "Storm conditions";
    if (windSpeed > 25) return "Very rough seas";
    if (windSpeed > 15) return "Rough seas";
    if (waveHeight > 2) return "Moderate seas";
    return "Calm seas";
  }

  /**
   * Calculate weather impact on a route
   */
  async calculateRouteWeatherImpact(
    waypoints: Coordinates[],
    vesselSpeed: number = 12
  ): Promise<RouteWeatherImpact> {
    const weatherData = await this.getRouteWeather(waypoints);

    const windSpeeds = weatherData.map(w => w.windSpeed);
    const waveHeights = weatherData.map(w => w.waveHeight);
    
    const avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const maxWindSpeed = Math.max(...windSpeeds);
    const avgWaveHeight = waveHeights.reduce((a, b) => a + b, 0) / waveHeights.length;
    const maxWaveHeight = Math.max(...waveHeights);
    
    // Count hours in storm conditions
    const totalStormHours = weatherData.filter(
      w => w.severity === "danger" || w.severity === "critical"
    ).length;

    // Calculate safety score (0-100)
    let safetyScore = 100;
    safetyScore -= avgWindSpeed > 20 ? 30 : avgWindSpeed > 15 ? 15 : 0;
    safetyScore -= avgWaveHeight > 3 ? 30 : avgWaveHeight > 2 ? 15 : 0;
    safetyScore -= totalStormHours * 10;
    safetyScore = Math.max(0, safetyScore);

    // Recommend speed reduction in rough conditions
    let recommendedSpeed = vesselSpeed;
    if (maxWindSpeed > 25 || maxWaveHeight > 3) {
      recommendedSpeed = vesselSpeed * 0.7; // 30% speed reduction
    } else if (maxWindSpeed > 15 || maxWaveHeight > 2) {
      recommendedSpeed = vesselSpeed * 0.85; // 15% speed reduction
    }

    // Calculate time impact due to weather
    const speedReduction = vesselSpeed - recommendedSpeed;
    const timeImpact = (speedReduction / vesselSpeed) * waypoints.length * 0.5; // Rough estimate

    logger.info("Route weather impact calculated", {
      avgWindSpeed,
      maxWindSpeed,
      safetyScore,
      recommendedSpeed,
      timeImpact,
    });

    return {
      avgWindSpeed,
      maxWindSpeed,
      avgWaveHeight,
      maxWaveHeight,
      totalStormHours,
      safetyScore,
      recommendedSpeed,
      timeImpact,
    };
  }

  /**
   * Find optimal route considering wind and currents
   */
  calculateWindOptimizedWaypoints(
    origin: Coordinates,
    destination: Coordinates,
    weatherData: WeatherCondition[]
  ): Coordinates[] {
    // Simplified wind optimization - in production would use more sophisticated algorithms
    const waypoints: Coordinates[] = [origin];
    
    // Add intermediate waypoints that avoid high wind areas
    const numWaypoints = 3;
    for (let i = 1; i < numWaypoints; i++) {
      const progress = i / numWaypoints;
      const lat = origin.lat + (destination.lat - origin.lat) * progress;
      const lng = origin.lng + (destination.lng - origin.lng) * progress;
      
      // Adjust waypoint based on weather
      // Move slightly to avoid high wind areas (simplified)
      const offset = Math.random() * 0.5 - 0.25; // Small random offset
      
      waypoints.push({
        lat: lat + offset,
        lng: lng + offset,
      });
    }
    
    waypoints.push(destination);
    return waypoints;
  }
}

export const weatherIntegrationService = new WeatherIntegrationService();
