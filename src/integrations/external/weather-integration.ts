/**
 * Weather Integration Service
 * Unified interface for OpenWeatherMap, StormGlass, and other weather APIs
 */
import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  wavePeriod?: number;
  visibility: number;
  pressure: number;
  description: string;
  icon: string;
  timestamp: Date;
}

export interface WeatherForecast {
  date: Date;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  precipitationProbability: number;
  description: string;
  icon: string;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: "advisory" | "watch" | "warning" | "extreme";
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedAreas: string[];
}

export interface MaritimeConditions {
  seaState: "calm" | "slight" | "moderate" | "rough" | "very_rough" | "high" | "very_high";
  swellHeight: number;
  swellDirection: number;
  swellPeriod: number;
  waterTemperature: number;
  tideHeight?: number;
  tideType?: "high" | "low" | "rising" | "falling";
  currentSpeed?: number;
  currentDirection?: number;
}

export class WeatherIntegration {
  /**
   * Get current weather for a location
   */
  static async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          action: "current",
          lat,
          lng,
        },
      });

      if (error) throw new Error(error.message);

      return {
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.wind_speed,
        windDirection: data.wind_direction,
        waveHeight: data.wave_height,
        wavePeriod: data.wave_period,
        visibility: data.visibility,
        pressure: data.pressure,
        description: data.description,
        icon: data.icon,
        timestamp: new Date(data.timestamp),
      };
    } catch (err) {
      console.error("Failed to fetch weather:", err);
      // Return fallback data
      return {
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        windDirection: 0,
        visibility: 0,
        pressure: 0,
        description: "Dados indisponíveis",
        icon: "unknown",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get weather forecast for next 7 days
   */
  static async getForecast(lat: number, lng: number, days: number = 7): Promise<WeatherForecast[]> {
    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          action: "forecast",
          lat,
          lng,
          days,
        },
      });

      if (error) throw new Error(error.message);

      return (data.forecast || []).map((f: any) => ({
        date: new Date(f.date),
        tempMin: f.temp_min,
        tempMax: f.temp_max,
        windSpeed: f.wind_speed,
        windDirection: f.wind_direction,
        waveHeight: f.wave_height,
        precipitationProbability: f.precipitation_probability,
        description: f.description,
        icon: f.icon,
      }));
    } catch (err) {
      console.error("Failed to fetch forecast:", err);
      return [];
    }
  }

  /**
   * Get active weather alerts for a region
   */
  static async getAlerts(lat: number, lng: number, radiusKm: number = 100): Promise<WeatherAlert[]> {
    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          action: "alerts",
          lat,
          lng,
          radius: radiusKm,
        },
      });

      if (error) throw new Error(error.message);

      return (data.alerts || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        description: a.description,
        startTime: new Date(a.start_time),
        endTime: new Date(a.end_time),
        affectedAreas: a.affected_areas || [],
      }));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      return [];
    }
  }

  /**
   * Get maritime-specific conditions (waves, swell, tide)
   */
  static async getMaritimeConditions(lat: number, lng: number): Promise<MaritimeConditions | null> {
    try {
      const { data, error } = await supabase.functions.invoke("stormglass-weather", {
        body: { lat, lng },
      });

      if (error) throw new Error(error.message);

      const seaStateMap: Record<number, MaritimeConditions["seaState"]> = {
        0: "calm",
        1: "slight",
        2: "moderate",
        3: "rough",
        4: "very_rough",
        5: "high",
        6: "very_high",
      };

      return {
        seaState: seaStateMap[Math.min(Math.floor(data.waveHeight || 0), 6)] || "calm",
        swellHeight: data.swellHeight || 0,
        swellDirection: data.swellDirection || 0,
        swellPeriod: data.swellPeriod || 0,
        waterTemperature: data.waterTemperature || 0,
        tideHeight: data.tideHeight,
        tideType: data.tideType,
        currentSpeed: data.currentSpeed,
        currentDirection: data.currentDirection,
      };
    } catch (err) {
      console.error("Failed to fetch maritime conditions:", err);
      return null;
    }
  }

  /**
   * Check if conditions are safe for navigation
   */
  static async isNavigationSafe(
    lat: number, 
    lng: number,
    thresholds?: {
      maxWindSpeed?: number;
      maxWaveHeight?: number;
      minVisibility?: number;
    }
  ): Promise<{ safe: boolean; warnings: string[] }> {
    const defaults = {
      maxWindSpeed: 25, // knots
      maxWaveHeight: 4, // meters
      minVisibility: 5, // km
    };
    const limits = { ...defaults, ...thresholds };

    const weather = await this.getCurrentWeather(lat, lng);
    const maritime = await this.getMaritimeConditions(lat, lng);
    const alerts = await this.getAlerts(lat, lng);

    const warnings: string[] = [];

    if (weather.windSpeed > limits.maxWindSpeed) {
      warnings.push(`Vento forte: ${weather.windSpeed.toFixed(1)} nós`);
    }

    if (maritime && maritime.swellHeight > limits.maxWaveHeight) {
      warnings.push(`Ondas altas: ${maritime.swellHeight.toFixed(1)}m`);
    }

    if (weather.visibility < limits.minVisibility) {
      warnings.push(`Baixa visibilidade: ${weather.visibility.toFixed(1)} km`);
    }

    const severeAlerts = alerts.filter(a => a.severity === "warning" || a.severity === "extreme");
    if (severeAlerts.length > 0) {
      warnings.push(`${severeAlerts.length} alerta(s) meteorológico(s) ativo(s)`);
    }

    return {
      safe: warnings.length === 0,
      warnings,
    };
  }
}

// Convenience exports
export const getMaritimeWeather = WeatherIntegration.getCurrentWeather.bind(WeatherIntegration);
export const getWeatherForecast = WeatherIntegration.getForecast.bind(WeatherIntegration);
export const getWeatherAlerts = WeatherIntegration.getAlerts.bind(WeatherIntegration);
