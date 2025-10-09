/**
 * Windy API Service
 * Provides advanced weather visualization, wind patterns, and maritime forecasts
 * 
 * Documentation: https://api.windy.com/
 */

import { apiManager } from '@/lib/api-manager';

interface WindyWeatherPoint {
  lat: number;
  lon: number;
  model?: string;
  parameters?: string[];
  levels?: string[];
  key?: string;
}

interface WindyForecast {
  lat: number;
  lon: number;
  model: string;
  parameters: Record<string, any>;
  ts: number[];
  units: Record<string, string>;
}

interface WindyWebcam {
  id: string;
  status: string;
  title: string;
  image: {
    current: {
      icon: string;
      thumbnail: string;
      preview: string;
    };
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

export class WindyService {
  private baseUrl = 'https://api.windy.com';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_WINDY_API_KEY || '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get point forecast for specific location
   */
  async getPointForecast(params: WindyWeatherPoint): Promise<WindyForecast> {
    if (!this.isConfigured()) {
      throw new Error('Windy API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/point-forecast/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: params.lat,
          lon: params.lon,
          model: params.model || 'gfs',
          parameters: params.parameters || ['wind', 'temp', 'precip', 'clouds'],
          levels: params.levels || ['surface'],
          key: this.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Windy API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Windy point forecast error:', error);
      throw error;
    }
  }

  /**
   * Get maritime-specific weather data
   */
  async getMaritimeWeather(lat: number, lon: number) {
    return this.getPointForecast({
      lat,
      lon,
      model: 'gfs',
      parameters: ['wind', 'gust', 'waves', 'swell', 'wwaves', 'wspd', 'wdir'],
      levels: ['surface'],
    });
  }

  /**
   * Get webcam data near location (for visual confirmation)
   */
  async getNearbyWebcams(lat: number, lon: number, radius: number = 50): Promise<WindyWebcam[]> {
    if (!this.isConfigured()) {
      throw new Error('Windy API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/webcams/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lon,
          radius,
          key: this.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Windy webcams API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result?.webcams || [];
    } catch (error) {
      console.error('Windy webcams error:', error);
      throw error;
    }
  }

  /**
   * Format forecast data for maritime use
   */
  formatMaritimeForecast(forecast: WindyForecast) {
    const timestamps = forecast.ts;
    const windSpeed = forecast.parameters['wind-surface'];
    const windGust = forecast.parameters['gust-surface'];
    const windDir = forecast.parameters['wdir-surface'];
    const waves = forecast.parameters['waves-surface'];
    const temp = forecast.parameters['temp-surface'];

    return timestamps.map((ts: number, index: number) => ({
      datetime: new Date(ts).toISOString(),
      windSpeed: windSpeed?.[index],
      windGust: windGust?.[index],
      windDirection: windDir?.[index],
      waveHeight: waves?.[index],
      temperature: temp?.[index],
      conditions: this.assessMaritimeConditions(
        windSpeed?.[index],
        windGust?.[index],
        waves?.[index]
      ),
    }));
  }

  /**
   * Assess maritime conditions based on weather parameters
   */
  private assessMaritimeConditions(
    windSpeed?: number,
    windGust?: number,
    waveHeight?: number
  ): {
    severity: 'safe' | 'caution' | 'warning' | 'danger';
    description: string;
  } {
    // Convert m/s to knots for maritime assessment (1 m/s ≈ 1.944 knots)
    const windKnots = windSpeed ? windSpeed * 1.944 : 0;
    const gustKnots = windGust ? windGust * 1.944 : 0;

    if (windKnots > 34 || gustKnots > 47 || (waveHeight && waveHeight > 4)) {
      return {
        severity: 'danger',
        description: 'Condições perigosas - operação não recomendada',
      };
    } else if (windKnots > 27 || gustKnots > 40 || (waveHeight && waveHeight > 3)) {
      return {
        severity: 'warning',
        description: 'Condições adversas - navegação com cautela',
      };
    } else if (windKnots > 21 || gustKnots > 33 || (waveHeight && waveHeight > 2)) {
      return {
        severity: 'caution',
        description: 'Condições moderadas - atenção redobrada',
      };
    } else {
      return {
        severity: 'safe',
        description: 'Condições favoráveis para navegação',
      };
    }
  }

  /**
   * Get weather alerts for specific location
   */
  async getWeatherAlerts(lat: number, lon: number) {
    const forecast = await this.getMaritimeWeather(lat, lon);
    const formatted = this.formatMaritimeForecast(forecast);

    const alerts = [];

    // Check next 24 hours for dangerous conditions
    for (let i = 0; i < Math.min(8, formatted.length); i++) {
      const point = formatted[i];
      if (point.conditions.severity === 'danger' || point.conditions.severity === 'warning') {
        alerts.push({
          datetime: point.datetime,
          severity: point.conditions.severity,
          description: point.conditions.description,
          windSpeed: point.windSpeed,
          windGust: point.windGust,
          waveHeight: point.waveHeight,
        });
      }
    }

    return alerts;
  }
}

// Export singleton instance
export const windyService = new WindyService();
