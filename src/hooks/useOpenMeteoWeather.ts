/**
 * Hook for Open-Meteo Weather Data
 * Provides easy access to real-time weather, marine, and air quality data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchOpenMeteoWeather,
  fetchOpenMeteoMarine,
  fetchOpenMeteoAirQuality,
  getWeatherDescription,
  getAQIDescription,
  OpenMeteoResponse,
  OpenMeteoMarineData,
  OpenMeteoAirQuality
} from '@/services/weather/open-meteo.service';
import {
  checkWeatherConditions,
  processAndNotifyAlerts,
  WeatherAlert,
  DEFAULT_THRESHOLDS
} from '@/lib/notifications/weather-alert-service';
import type { CurrentWeather, DailyForecast, HourlyForecast, MarineData, AirQuality } from '@/components/weather/windy/types';
import { logger } from '@/lib/logger';

interface UseOpenMeteoWeatherOptions {
  lat: number;
  lon: number;
  locationName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in ms
  enableAlerts?: boolean;
}

interface UseOpenMeteoWeatherReturn {
  // Data
  currentWeather: CurrentWeather | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  marineData: MarineData | null;
  airQuality: AirQuality | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  dataSource: string;
  
  // Alerts
  activeAlerts: WeatherAlert[];
  
  // Actions
  refresh: () => Promise<void>;
  refreshMarine: () => Promise<void>;
  refreshAirQuality: () => Promise<void>;
}

export function useOpenMeteoWeather(options: UseOpenMeteoWeatherOptions): UseOpenMeteoWeatherReturn {
  const { 
    lat, 
    lon, 
    locationName = 'Unknown',
    autoRefresh = true,
    refreshInterval = 600000, // 10 minutes
    enableAlerts = true
  } = options;

  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<WeatherAlert[]>([]);

  // Transform Open-Meteo response to our types
  const transformWeatherData = useCallback((data: OpenMeteoResponse) => {
    // Current weather
    if (data.current) {
      const weatherInfo = getWeatherDescription(data.current.weather_code);
      
      const current: CurrentWeather = {
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.pressure_msl,
        visibility: (data.current.visibility || 10000) / 1000, // Convert to km
        uvIndex: data.current.uv_index || 0,
        cloudCoverage: data.current.cloud_cover,
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        wind: {
          speed: data.current.wind_speed_10m,
          gust: data.current.wind_gusts_10m,
          direction: data.current.wind_direction_10m
        },
        sunrise: data.daily?.sunrise?.[0]?.split('T')[1] || '06:00',
        sunset: data.daily?.sunset?.[0]?.split('T')[1] || '18:00'
      };
      
      setCurrentWeather(current);
    }

    // Hourly forecast
    if (data.hourly) {
      const hourly: HourlyForecast[] = data.hourly.time.slice(0, 48).map((time, i) => {
        const hour = new Date(time).getHours();
        const weatherInfo = getWeatherDescription(data.hourly!.weather_code[i]);
        
        return {
          hour,
          time: `${hour.toString().padStart(2, '0')}:00`,
          temperature: data.hourly!.temperature_2m[i],
          rain: data.hourly!.precipitation[i] || 0,
          windSpeed: data.hourly!.wind_speed_10m[i],
          windGust: data.hourly!.wind_gusts_10m[i],
          windDirection: data.hourly!.wind_direction_10m[i],
          humidity: data.hourly!.relative_humidity_2m[i],
          icon: weatherInfo.icon,
          condition: weatherInfo.condition
        };
      });
      
      setHourlyForecast(hourly);
    }

    // Daily forecast
    if (data.daily) {
      const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
      
      const daily: DailyForecast[] = data.daily.time.map((date, i) => {
        const d = new Date(date);
        const weatherInfo = getWeatherDescription(data.daily!.weather_code[i]);
        
        return {
          date,
          dayOfWeek: days[d.getDay()],
          tempMin: data.daily!.temperature_2m_min[i],
          tempMax: data.daily!.temperature_2m_max[i],
          condition: weatherInfo.condition,
          description: weatherInfo.description,
          icon: weatherInfo.icon,
          humidity: 0, // Not available in daily
          windSpeed: data.daily!.wind_speed_10m_max[i],
          rainProbability: data.daily!.precipitation_probability_max?.[i] || 0
        };
      });
      
      setDailyForecast(daily);
    }
  }, []);

  // Transform marine data
  const transformMarineData = useCallback((data: OpenMeteoMarineData) => {
    if (!data.hourly) return;
    
    // Get current hour index
    const now = new Date();
    const currentHourIndex = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
    const idx = currentHourIndex >= 0 ? currentHourIndex : 0;
    
    // Find next high/low tide (simplified - would need real tide API for accuracy)
    const marine: MarineData = {
      waveHeight: data.hourly.wave_height[idx] || 0,
      wavePeriod: data.hourly.wave_period[idx] || 0,
      waveDirection: data.hourly.wave_direction[idx] || 0,
      swellHeight: data.hourly.swell_wave_height?.[idx] || 0,
      waterTemperature: 24, // Would need separate API
      tideLevel: 0,
      tideType: 'rising',
      nextTide: {
        time: '14:30',
        type: 'high',
        level: 0
      }
    };
    
    setMarineData(marine);
  }, []);

  // Transform air quality data
  const transformAirQuality = useCallback((data: OpenMeteoAirQuality) => {
    if (!data.hourly) return;
    
    const now = new Date();
    const currentHourIndex = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
    const idx = currentHourIndex >= 0 ? currentHourIndex : 0;
    
    const aqi = data.hourly.european_aqi?.[idx] || data.hourly.us_aqi?.[idx] || 0;
    const aqiInfo = getAQIDescription(aqi);
    
    const quality: AirQuality = {
      aqi,
      level: aqiInfo.level as any,
      pm25: data.hourly.pm2_5[idx] || 0,
      pm10: data.hourly.pm10[idx] || 0,
      o3: data.hourly.ozone[idx] || 0,
      no2: data.hourly.nitrogen_dioxide[idx] || 0,
      so2: data.hourly.sulphur_dioxide[idx] || 0
    };
    
    setAirQuality(quality);
  }, []);

  // Fetch weather data
  const refresh = useCallback(async () => {
    if (!lat || !lon) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchOpenMeteoWeather(lat, lon, {
        hourlyHours: 48,
        dailyDays: 7,
        forceRefresh: true
      });
      
      transformWeatherData(data);
      setLastUpdated(new Date());
      
      // Process alerts if enabled
      if (enableAlerts && data.current) {
        // Convert km/h to knots for alert service (1 km/h = 0.54 knots)
        const windSpeedKnots = data.current.wind_speed_10m * 0.54;
        
        const alerts = checkWeatherConditions({
          windSpeed: windSpeedKnots,
          visibility: (data.current.visibility || 10000) / 1000,
          pressure: data.current.pressure_msl
        }, DEFAULT_THRESHOLDS);
        
        if (alerts.length > 0) {
          processAndNotifyAlerts(alerts);
        }
        
        setActiveAlerts(alerts);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(message);
      logger.error('[useOpenMeteoWeather] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lat, lon, enableAlerts, transformWeatherData]);

  // Fetch marine data
  const refreshMarine = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const data = await fetchOpenMeteoMarine(lat, lon, { forceRefresh: true });
      transformMarineData(data);
      
      // Add marine alerts if enabled
      if (enableAlerts && data.hourly) {
        const now = new Date();
        const idx = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
        const waveHeight = data.hourly.wave_height[idx >= 0 ? idx : 0];
        
        if (waveHeight) {
          const waveAlerts = checkWeatherConditions({ waveHeight }, DEFAULT_THRESHOLDS);
          if (waveAlerts.length > 0) {
            processAndNotifyAlerts(waveAlerts);
          }
          setActiveAlerts(prev => [...prev.filter(a => a.type !== 'waves'), ...waveAlerts]);
        }
      }
    } catch (err) {
      logger.error('[useOpenMeteoWeather] Marine error:', err);
    }
  }, [lat, lon, enableAlerts, transformMarineData]);

  // Fetch air quality data
  const refreshAirQuality = useCallback(async () => {
    if (!lat || !lon) return;
    
    try {
      const data = await fetchOpenMeteoAirQuality(lat, lon, { forceRefresh: true });
      transformAirQuality(data);
    } catch (err) {
      logger.error('[useOpenMeteoWeather] AQI error:', err);
    }
  }, [lat, lon, transformAirQuality]);

  // Initial fetch
  useEffect(() => {
    refresh();
    refreshMarine();
    refreshAirQuality();
  }, [lat, lon]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refresh();
      refreshMarine();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh, refreshMarine]);

  return {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    marineData,
    airQuality,
    isLoading,
    error,
    lastUpdated,
    dataSource: 'Open-Meteo (Free)',
    activeAlerts,
    refresh,
    refreshMarine,
    refreshAirQuality
  };
}

export default useOpenMeteoWeather;
