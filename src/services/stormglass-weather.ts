/**
 * StormGlass Weather Service
 * Fallback weather API for maritime operations
 * API: api.stormglass.io
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface StormGlassWeatherData {
  airTemperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  waterTemperature: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
  currentSpeed: number;
  currentDirection: number;
}

export interface StormGlassResponse {
  hours: Array<{
    time: string;
    airTemperature: { sg: number };
    pressure: { sg: number };
    humidity: { sg: number };
    windSpeed: { sg: number };
    windDirection: { sg: number };
    waveHeight?: { sg: number };
    wavePeriod?: { sg: number };
    waveDirection?: { sg: number };
    waterTemperature?: { sg: number };
    visibility?: { sg: number };
    cloudCover?: { sg: number };
    precipitation?: { sg: number };
    currentSpeed?: { sg: number };
    currentDirection?: { sg: number };
  }>;
  meta: {
    cost: number;
    dailyQuota: number;
    end: string;
    lat: number;
    lng: number;
    params: string[];
    requestCount: number;
    start: string;
  };
}

export interface WeatherLocation {
  lat: number;
  lng: number;
  name?: string;
}

class StormGlassService {
  private baseUrl = "https://api.stormglass.io/v2";
  private cache = new Map<string, { data: StormGlassWeatherData; timestamp: number }>();
  private cacheDuration = 30 * 60 * 1000; // 30 minutes

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(location: WeatherLocation): Promise<StormGlassWeatherData | null> {
    const cacheKey = `${location.lat},${location.lng}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase.functions.invoke("stormglass-weather", {
        body: {
          lat: location.lat,
          lng: location.lng,
          type: "current"
        }
      });

      if (error) throw error;

      const weatherData = this.parseCurrentWeather(data);
      
      if (weatherData) {
        this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      }

      return weatherData;
    } catch (error) {
      logger.error("[StormGlass] Error fetching current weather:", error);
      return null;
    }
  }

  /**
   * Get marine forecast for a location
   */
  async getMarineForecast(location: WeatherLocation, hours: number = 24): Promise<StormGlassWeatherData[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("stormglass-weather", {
        body: {
          lat: location.lat,
          lng: location.lng,
          type: "forecast",
          hours
        }
      });

      if (error) throw error;

      return this.parseForecast(data, hours);
    } catch (error) {
      logger.error("[StormGlass] Error fetching marine forecast:", error);
      return null;
    }
  }

  /**
   * Get tide data for a location
   */
  async getTideData(location: WeatherLocation): Promise<Record<string, unknown>[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("stormglass-weather", {
        body: {
          lat: location.lat,
          lng: location.lng,
          type: "tide"
        }
      });

      if (error) throw error;

      return data?.data || null;
    } catch (error) {
      logger.error("[StormGlass] Error fetching tide data:", error);
      return null;
    }
  }

  /**
   * Check if conditions are safe for maritime operations
   */
  assessMaritimeSafety(weather: StormGlassWeatherData): {
    safe: boolean;
    warnings: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
  } {
    const warnings: string[] = [];
    let riskScore = 0;

    // Wind speed assessment
    if (weather.windSpeed > 25) {
      warnings.push(`Vento forte: ${weather.windSpeed.toFixed(1)} m/s`);
      riskScore += weather.windSpeed > 35 ? 3 : 2;
    }

    // Wave height assessment
    if (weather.waveHeight > 3) {
      warnings.push(`Ondas altas: ${weather.waveHeight.toFixed(1)} m`);
      riskScore += weather.waveHeight > 5 ? 3 : 2;
    }

    // Visibility assessment
    if (weather.visibility < 1000) {
      warnings.push(`Visibilidade reduzida: ${(weather.visibility / 1000).toFixed(1)} km`);
      riskScore += weather.visibility < 500 ? 3 : 2;
    }

    // Precipitation assessment
    if (weather.precipitation > 5) {
      warnings.push(`Precipitação intensa: ${weather.precipitation.toFixed(1)} mm/h`);
      riskScore += 1;
    }

    // Current speed assessment
    if (weather.currentSpeed > 2) {
      warnings.push(`Corrente forte: ${weather.currentSpeed.toFixed(1)} m/s`);
      riskScore += 1;
    }

    let riskLevel: "low" | "medium" | "high" | "critical";
    if (riskScore >= 6) {
      riskLevel = "critical";
    } else if (riskScore >= 4) {
      riskLevel = "high";
    } else if (riskScore >= 2) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    return {
      safe: riskScore < 4,
      warnings,
      riskLevel
    };
  }

  private parseCurrentWeather(response: StormGlassResponse): StormGlassWeatherData | null {
    if (!response?.hours?.length) return null;

    const current = response.hours[0];
    
    return {
      airTemperature: current.airTemperature?.sg || 0,
      pressure: current.pressure?.sg || 0,
      humidity: current.humidity?.sg || 0,
      windSpeed: current.windSpeed?.sg || 0,
      windDirection: current.windDirection?.sg || 0,
      waveHeight: current.waveHeight?.sg || 0,
      wavePeriod: current.wavePeriod?.sg || 0,
      waveDirection: current.waveDirection?.sg || 0,
      waterTemperature: current.waterTemperature?.sg || 0,
      visibility: current.visibility?.sg || 10000,
      cloudCover: current.cloudCover?.sg || 0,
      precipitation: current.precipitation?.sg || 0,
      currentSpeed: current.currentSpeed?.sg || 0,
      currentDirection: current.currentDirection?.sg || 0
    };
  }

  private parseForecast(response: StormGlassResponse, limit: number): StormGlassWeatherData[] {
    if (!response?.hours?.length) return [];

    return response.hours.slice(0, limit).map(hour => ({
      airTemperature: hour.airTemperature?.sg || 0,
      pressure: hour.pressure?.sg || 0,
      humidity: hour.humidity?.sg || 0,
      windSpeed: hour.windSpeed?.sg || 0,
      windDirection: hour.windDirection?.sg || 0,
      waveHeight: hour.waveHeight?.sg || 0,
      wavePeriod: hour.wavePeriod?.sg || 0,
      waveDirection: hour.waveDirection?.sg || 0,
      waterTemperature: hour.waterTemperature?.sg || 0,
      visibility: hour.visibility?.sg || 10000,
      cloudCover: hour.cloudCover?.sg || 0,
      precipitation: hour.precipitation?.sg || 0,
      currentSpeed: hour.currentSpeed?.sg || 0,
      currentDirection: hour.currentDirection?.sg || 0
    }));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const stormGlassService = new StormGlassService();
