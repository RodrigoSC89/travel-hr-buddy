/**
 * Weather Fallback Service
 * Provides a unified interface for weather data with automatic fallback
 * Priority: OpenWeatherMap → Windy → StormGlass
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface MarineWeatherData {
  source: 'openweathermap' | 'windy' | 'stormglass';
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike?: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windSpeedKnots: number;
    windDirection: number;
    windGust?: number;
    visibility: number;
    cloudCover?: number;
    precipitation?: number;
    description?: string;
  };
  marine?: {
    waveHeight?: number;
    wavePeriod?: number;
    waveDirection?: number;
    waterTemperature?: number;
    currentSpeed?: number;
    currentDirection?: number;
    seaLevel?: number;
  };
  forecast?: MarineWeatherForecast[];
}

export interface MarineWeatherForecast {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  precipitation?: number;
}

interface WeatherProviderResult {
  success: boolean;
  data?: MarineWeatherData;
  error?: string;
  source: string;
}

const WEATHER_PROVIDERS = ['openweathermap', 'windy', 'stormglass'] as const;
type WeatherProvider = typeof WEATHER_PROVIDERS[number];

/**
 * Fetch marine weather with automatic fallback
 */
export async function getMarineWeather(
  lat: number,
  lon: number,
  preferredProvider?: WeatherProvider
): Promise<MarineWeatherData> {
  const providers = preferredProvider 
    ? [preferredProvider, ...WEATHER_PROVIDERS.filter(p => p !== preferredProvider)]
    : [...WEATHER_PROVIDERS];

  let lastError: string = 'No providers available';

  for (const provider of providers) {
    try {
      logger.debug(`[WeatherFallback] Trying provider: ${provider}`);
      const result = await fetchFromProvider(provider, lat, lon);
      
      if (result.success && result.data) {
        logger.info(`[WeatherFallback] Success with ${provider}`);
        return result.data;
      }
      
      lastError = result.error || `Provider ${provider} returned no data`;
      logger.warn(`[WeatherFallback] ${provider} failed: ${lastError}`);
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[WeatherFallback] ${provider} error`, error);
    }
  }

  throw new Error(`All weather providers failed. Last error: ${lastError}`);
}

/**
 * Fetch from a specific provider
 */
async function fetchFromProvider(
  provider: WeatherProvider,
  lat: number,
  lon: number
): Promise<WeatherProviderResult> {
  switch (provider) {
    case 'openweathermap':
      return fetchOpenWeatherMap(lat, lon);
    case 'windy':
      return fetchWindy(lat, lon);
    case 'stormglass':
      return fetchStormGlass(lat, lon);
    default:
      return { success: false, error: 'Unknown provider', source: provider };
  }
}

/**
 * Fetch from OpenWeatherMap via edge function
 */
async function fetchOpenWeatherMap(lat: number, lon: number): Promise<WeatherProviderResult> {
  const { data, error } = await supabase.functions.invoke('weather-map-proxy', {
    body: { action: 'weather_data', lat, lon }
  });

  if (error || !data?.success) {
    return { 
      success: false, 
      error: error?.message || data?.error || 'OpenWeatherMap request failed',
      source: 'openweathermap'
    };
  }

  const owm = data.data;
  
  return {
    success: true,
    source: 'openweathermap',
    data: {
      source: 'openweathermap',
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      current: {
        temperature: owm.main?.temp ?? 0,
        feelsLike: owm.main?.feels_like,
        humidity: owm.main?.humidity ?? 0,
        pressure: owm.main?.pressure ?? 0,
        windSpeed: owm.wind?.speed ?? 0,
        windSpeedKnots: (owm.wind?.speed ?? 0) * 1.94384,
        windDirection: owm.wind?.deg ?? 0,
        windGust: owm.wind?.gust,
        visibility: owm.visibility ?? 10000,
        cloudCover: owm.clouds?.all,
        description: owm.weather?.[0]?.description,
      },
    },
  };
}

/**
 * Fetch from Windy via edge function
 */
async function fetchWindy(lat: number, lon: number): Promise<WeatherProviderResult> {
  const { data, error } = await supabase.functions.invoke('weather-integration', {
    body: { 
      latitude: lat, 
      longitude: lon,
      source: 'windy'
    }
  });

  if (error || !data?.success) {
    return { 
      success: false, 
      error: error?.message || data?.error || 'Windy request failed',
      source: 'windy'
    };
  }

  const windy = data.data?.windy;
  if (!windy) {
    return { success: false, error: 'No Windy data returned', source: 'windy' };
  }

  return {
    success: true,
    source: 'windy',
    data: {
      source: 'windy',
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      current: {
        temperature: windy.temp ?? 0,
        humidity: windy.rh ?? 0,
        pressure: windy.pressure ?? 0,
        windSpeed: windy.wind ?? 0,
        windSpeedKnots: (windy.wind ?? 0) * 1.94384,
        windDirection: windy.windDir ?? 0,
        visibility: windy.visibility ?? 10000,
      },
      marine: {
        waveHeight: windy.waves,
        seaLevel: windy.sealevel,
      },
    },
  };
}

/**
 * Fetch from StormGlass via edge function
 */
async function fetchStormGlass(lat: number, lon: number): Promise<WeatherProviderResult> {
  const { data, error } = await supabase.functions.invoke('stormglass-weather', {
    body: { 
      action: 'weather',
      lat,
      lng: lon
    }
  });

  if (error || !data?.success) {
    return { 
      success: false, 
      error: error?.message || data?.error || 'StormGlass request failed',
      source: 'stormglass'
    };
  }

  const sg = data.data?.current;
  if (!sg) {
    return { success: false, error: 'No StormGlass data returned', source: 'stormglass' };
  }

  return {
    success: true,
    source: 'stormglass',
    data: {
      source: 'stormglass',
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      current: {
        temperature: sg.airTemperature ?? 0,
        humidity: sg.humidity ?? 0,
        pressure: sg.pressure ?? 0,
        windSpeed: sg.windSpeed ?? 0,
        windSpeedKnots: sg.windSpeedKnots ?? 0,
        windDirection: sg.windDirection ?? 0,
        windGust: sg.windGust,
        visibility: sg.visibility ?? 10000,
        cloudCover: sg.cloudCover,
        precipitation: sg.precipitation,
      },
      marine: {
        waveHeight: sg.waveHeight,
        wavePeriod: sg.wavePeriod,
        waveDirection: sg.waveDirection,
        waterTemperature: sg.waterTemperature,
        currentSpeed: sg.currentSpeed,
        currentDirection: sg.currentDirection,
        seaLevel: sg.seaLevel,
      },
      forecast: data.data?.forecast?.map((f: {
        time: string;
        airTemperature?: number;
        windSpeed?: number;
        windDirection?: number;
        waveHeight?: number;
        precipitation?: number;
      }) => ({
        time: f.time,
        temperature: f.airTemperature,
        windSpeed: f.windSpeed,
        windDirection: f.windDirection,
        waveHeight: f.waveHeight,
        precipitation: f.precipitation,
      })),
    },
  };
}

/**
 * Fetch tidal data from StormGlass
 */
export async function getTidalData(
  lat: number,
  lon: number,
  startDate?: Date,
  endDate?: Date
): Promise<{ extremes: Array<{ time: string; type: 'high' | 'low'; height: number }> }> {
  const { data, error } = await supabase.functions.invoke('stormglass-weather', {
    body: { 
      action: 'tide',
      lat,
      lng: lon,
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
    }
  });

  if (error || !data?.success) {
    throw new Error(error?.message || data?.error || 'Failed to fetch tidal data');
  }

  return data.data;
}

/**
 * Fetch astronomy data (sunrise, sunset, moon phases)
 */
export async function getAstronomyData(
  lat: number,
  lon: number,
  date?: Date
): Promise<{
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
  moonPhase?: string;
}> {
  const { data, error } = await supabase.functions.invoke('stormglass-weather', {
    body: { 
      action: 'astronomy',
      lat,
      lng: lon,
      start: date?.toISOString(),
    }
  });

  if (error || !data?.success) {
    throw new Error(error?.message || data?.error || 'Failed to fetch astronomy data');
  }

  const astro = data.data?.data?.[0];
  return {
    sunrise: astro?.sunrise,
    sunset: astro?.sunset,
    moonrise: astro?.moonrise,
    moonset: astro?.moonset,
    moonPhase: astro?.moonPhase,
  };
}

/**
 * Check health of all weather providers
 */
export async function checkWeatherProvidersHealth(): Promise<Record<WeatherProvider, boolean>> {
  const results: Record<WeatherProvider, boolean> = {
    openweathermap: false,
    windy: false,
    stormglass: false,
  };

  // Test with a known location (Rio de Janeiro)
  const testLat = -22.9068;
  const testLon = -43.1729;

  await Promise.all(
    WEATHER_PROVIDERS.map(async (provider) => {
      try {
        const result = await fetchFromProvider(provider, testLat, testLon);
        results[provider] = result.success;
      } catch {
        results[provider] = false;
      }
    })
  );

  return results;
}
