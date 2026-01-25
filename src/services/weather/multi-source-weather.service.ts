/**
 * Multi-Source Weather Service
 * Aggregates data from multiple providers with automatic fallback
 * PATCH WINDY-2.3
 */

import { openMeteoService } from "./open-meteo.service";
import { logger } from "@/lib/utils/production-logger";

// WeatherData interface
interface WeatherSourceData {
  source: string;
  timestamp: Date;
  success: boolean;
  current?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    pressure: number;
    cloudCover: number;
    visibility?: number;
    uvIndex?: number;
  };
  marine?: {
    waveHeight: number;
    waveDirection: number;
    wavePeriod: number;
    swellHeight?: number;
    swellDirection?: number;
    seaTemperature?: number;
  };
  forecast?: {
    date: string;
    tempMin: number;
    tempMax: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  }[];
}

interface MultiSourceConfig {
  enableWindGuru?: boolean;
  enableWindyAPI?: boolean;
  enableAccuWeather?: boolean;
  enableOpenMeteo?: boolean;
  primarySource?: 'open-meteo' | 'windguru' | 'windy' | 'accuweather';
  fallbackOrder?: string[];
  cacheTimeout?: number;
}

const DEFAULT_CONFIG: MultiSourceConfig = {
  enableOpenMeteo: true,
  enableWindGuru: false,
  enableWindyAPI: false,
  enableAccuWeather: false,
  primarySource: 'open-meteo',
  fallbackOrder: ['open-meteo', 'windguru', 'windy', 'accuweather'],
  cacheTimeout: 600000, // 10 minutes
};

// Cache for weather data
const weatherCache = new Map<string, { data: WeatherSourceData; expires: number }>();

/**
 * Fetch data from WindGuru (simulated - requires API key)
 */
async function fetchWindGuruData(lat: number, lon: number): Promise<WeatherSourceData | null> {
  try {
    logger.debug('[MultiSource] WindGuru: API key required for real data');
    return null;
  } catch (error) {
    logger.error('[MultiSource] WindGuru fetch failed', error);
    return null;
  }
}

/**
 * Fetch data from Windy API (simulated - requires API key)
 */
async function fetchWindyAPIData(lat: number, lon: number): Promise<WeatherSourceData | null> {
  try {
    logger.debug('[MultiSource] Windy API: Using embedded map, point forecast requires API key');
    return null;
  } catch (error) {
    logger.error('[MultiSource] Windy API fetch failed', error);
    return null;
  }
}

/**
 * Fetch data from AccuWeather (simulated - requires API key)
 */
async function fetchAccuWeatherData(lat: number, lon: number): Promise<WeatherSourceData | null> {
  try {
    logger.debug('[MultiSource] AccuWeather: API key required for real data');
    return null;
  } catch (error) {
    logger.error('[MultiSource] AccuWeather fetch failed', error);
    return null;
  }
}

/**
 * Fetch data from Open-Meteo (free, no API key required)
 */
async function fetchOpenMeteoData(lat: number, lon: number): Promise<WeatherSourceData | null> {
  try {
    const data = await openMeteoService.getWeatherData(lat, lon);
    
    if (!data || !data.current) {
      return null;
    }

    return {
      source: 'open-meteo',
      timestamp: new Date(),
      success: true,
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        windGust: data.current.wind_gusts_10m,
        pressure: data.current.pressure_msl,
        cloudCover: data.current.cloud_cover,
        visibility: data.current.visibility,
        uvIndex: data.current.uv_index,
      },
      forecast: data.daily?.time?.slice(0, 7).map((date: string, i: number) => ({
        date,
        tempMin: data.daily!.temperature_2m_min[i],
        tempMax: data.daily!.temperature_2m_max[i],
        precipitation: data.daily!.precipitation_sum?.[i] || 0,
        windSpeed: data.daily!.wind_speed_10m_max[i],
        condition: 'Clear',
      })),
    };
  } catch (error) {
    logger.error('[MultiSource] Open-Meteo fetch failed', error);
    return null;
  }
}

/**
 * Main service class for multi-source weather data
 */
class MultiSourceWeatherService {
  private config: MultiSourceConfig;

  constructor(config?: Partial<MultiSourceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get weather data from multiple sources with fallback
   */
  async getWeatherData(lat: number, lon: number): Promise<WeatherSourceData> {
    const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = weatherCache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && cached.expires > Date.now()) {
      logger.debug(`[MultiSource] Returning cached data from ${cached.data.source}`);
      return cached.data;
    }

    // Try sources in fallback order
    for (const source of this.config.fallbackOrder || []) {
      let data: WeatherSourceData | null = null;

      switch (source) {
        case 'open-meteo':
          if (this.config.enableOpenMeteo) {
            data = await fetchOpenMeteoData(lat, lon);
          }
          break;
        case 'windguru':
          if (this.config.enableWindGuru) {
            data = await fetchWindGuruData(lat, lon);
          }
          break;
        case 'windy':
          if (this.config.enableWindyAPI) {
            data = await fetchWindyAPIData(lat, lon);
          }
          break;
        case 'accuweather':
          if (this.config.enableAccuWeather) {
            data = await fetchAccuWeatherData(lat, lon);
          }
          break;
      }

      if (data && data.success) {
        // Cache successful response
        weatherCache.set(cacheKey, {
          data,
          expires: Date.now() + (this.config.cacheTimeout || 600000),
        });
        
        logger.debug(`[MultiSource] Successfully fetched from ${source}`);
        return data;
      }
    }

    // Return empty result if all sources fail
    logger.warn('[MultiSource] All sources failed, returning empty data');
    return {
      source: 'none',
      timestamp: new Date(),
      success: false,
    };
  }

  /**
   * Get marine data from Open-Meteo Marine API
   */
  async getMarineData(lat: number, lon: number): Promise<WeatherSourceData['marine'] | null> {
    try {
      const data = await openMeteoService.getMarineData(lat, lon);
      
      if (data && data.hourly) {
        const current = {
          waveHeight: data.hourly.wave_height?.[0] || 0,
          waveDirection: data.hourly.wave_direction?.[0] || 0,
          wavePeriod: data.hourly.wave_period?.[0] || 0,
          swellHeight: data.hourly.swell_wave_height?.[0],
          swellDirection: data.hourly.swell_wave_direction?.[0],
        };
        return current;
      }
      return null;
    } catch (error) {
      logger.error('[MultiSource] Marine data fetch failed', error);
      return null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MultiSourceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear cache
   */
  clearCache() {
    weatherCache.clear();
    logger.debug('[MultiSource] Cache cleared');
  }

  /**
   * Get available sources status
   */
  getSourcesStatus() {
    return {
      'open-meteo': { enabled: this.config.enableOpenMeteo, status: 'available', apiKeyRequired: false },
      'windguru': { enabled: this.config.enableWindGuru, status: 'requires-config', apiKeyRequired: true },
      'windy': { enabled: this.config.enableWindyAPI, status: 'requires-config', apiKeyRequired: true },
      'accuweather': { enabled: this.config.enableAccuWeather, status: 'requires-config', apiKeyRequired: true },
    };
  }
}

// Export singleton instance
export const multiSourceWeatherService = new MultiSourceWeatherService();

// Export types
export type { WeatherSourceData, MultiSourceConfig };
