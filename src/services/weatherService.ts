/**
 * Weather Service - Real API Integration
 * Integrates with OpenWeatherMap API and caches data in Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface WeatherResponse {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    clouds: number;
    visibility: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  };
  forecast: {
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
    pop: number; // Probability of precipitation
  }[];
  alerts: {
    event: string;
    description: string;
    severity: string;
    start: string;
    end: string;
  }[];
  maritime?: {
    wave_height?: number;
    wave_direction?: number;
    sea_state?: string;
  };
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('OpenWeatherMap API key not configured');
    }
  }

  /**
   * Fetch current weather and forecast
   */
  async getWeather(lat: number, lon: number, locationName?: string): Promise<WeatherResponse> {
    try {
      // Check cache first
      const cachedData = await this.getCachedWeather(lat, lon);
      if (cachedData) {
        logger.info('Returning cached weather data');
        return cachedData;
      }

      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.statusText}`);
      }
      const currentData = await currentResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
      }
      const forecastData = await forecastResponse.json();

      // Fetch alerts (One Call API 3.0 - may require subscription)
      let alerts: any[] = [];
      try {
        const alertsResponse = await fetch(
          `${this.baseUrl}/onecall?lat=${lat}&lon=${lon}&appid=${this.apiKey}&exclude=minutely,hourly`
        );
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          alerts = alertsData.alerts || [];
        }
      } catch (error) {
        logger.warn('Could not fetch weather alerts:', error);
      }

      // Transform data
      const weatherResponse: WeatherResponse = {
        location: {
          name: locationName || currentData.name,
          lat,
          lon,
        },
        current: {
          temp: currentData.main.temp,
          feels_like: currentData.main.feels_like,
          humidity: currentData.main.humidity,
          pressure: currentData.main.pressure,
          wind_speed: currentData.wind.speed,
          wind_deg: currentData.wind.deg,
          clouds: currentData.clouds.all,
          visibility: currentData.visibility,
          weather: currentData.weather,
        },
        forecast: this.processForecast(forecastData.list),
        alerts: this.processAlerts(alerts),
      };

      // Cache the data
      await this.cacheWeatherData(weatherResponse);

      logger.info('Weather data fetched successfully');
      return weatherResponse;
    } catch (error) {
      logger.error('Error fetching weather:', error);
      throw error;
    }
  }

  /**
   * Process forecast data - get daily forecasts
   */
  private processForecast(forecastList: any[]) {
    const dailyForecasts: Map<string, any> = new Map();

    forecastList.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          pop: item.pop || 0,
        });
      } else {
        const existing = dailyForecasts.get(date);
        existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
        existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
      }
    });

    return Array.from(dailyForecasts.values()).slice(0, 5);
  }

  /**
   * Process weather alerts
   */
  private processAlerts(alerts: any[]) {
    return alerts.map((alert) => ({
      event: alert.event,
      description: alert.description,
      severity: this.mapSeverity(alert.tags),
      start: new Date(alert.start * 1000).toISOString(),
      end: new Date(alert.end * 1000).toISOString(),
    }));
  }

  /**
   * Map alert tags to severity level
   */
  private mapSeverity(tags: string[]): string {
    if (tags?.includes('Extreme')) return 'critical';
    if (tags?.includes('Severe')) return 'high';
    if (tags?.includes('Moderate')) return 'medium';
    return 'low';
  }

  /**
   * Cache weather data in Supabase
   */
  private async cacheWeatherData(data: WeatherResponse): Promise<void> {
    try {
      const { error } = await supabase.from('weather_logs').insert([
        {
          location_name: data.location.name,
          location: { lat: data.location.lat, lng: data.location.lon },
          temperature: data.current.temp,
          feels_like: data.current.feels_like,
          humidity: data.current.humidity,
          pressure: data.current.pressure,
          wind_speed: data.current.wind_speed,
          wind_direction: data.current.wind_deg,
          clouds_percentage: data.current.clouds,
          visibility: data.current.visibility,
          weather_main: data.current.weather[0]?.main,
          weather_description: data.current.weather[0]?.description,
          weather_icon: data.current.weather[0]?.icon,
          observation_time: new Date().toISOString(),
          data_source: 'openweather',
        },
      ]);

      if (error) throw error;
      logger.info('Weather data cached successfully');
    } catch (error) {
      logger.error('Error caching weather data:', error);
      // Don't throw - caching failure shouldn't break the API call
    }
  }

  /**
   * Get cached weather data (within last hour)
   */
  private async getCachedWeather(
    lat: number,
    lon: number
  ): Promise<WeatherResponse | null> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('weather_logs')
        .select('*')
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      // Transform cached data back to WeatherResponse format
      return {
        location: {
          name: data.location_name,
          lat: data.location.lat,
          lon: data.location.lng,
        },
        current: {
          temp: data.temperature,
          feels_like: data.feels_like,
          humidity: data.humidity,
          pressure: data.pressure,
          wind_speed: data.wind_speed,
          wind_deg: data.wind_direction,
          clouds: data.clouds_percentage,
          visibility: data.visibility,
          weather: [
            {
              main: data.weather_main,
              description: data.weather_description,
              icon: data.weather_icon,
            },
          ],
        },
        forecast: [],
        alerts: [],
      };
    } catch (error) {
      logger.error('Error getting cached weather:', error);
      return null;
    }
  }

  /**
   * Get weather history for a location
   */
  async getWeatherHistory(
    lat: number,
    lon: number,
    days: number = 7
  ): Promise<any[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('weather_logs')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching weather history:', error);
      return [];
    }
  }
}

export const weatherService = new WeatherService();
