/**
 * Open-Meteo Weather Service - FREE API (No API Key Required)
 * Real-time weather data including:
 * - Current weather
 * - Hourly forecast (200+ hours)
 * - Daily forecast (16 days)
 * - Marine/Ocean data (waves, swell, water temp)
 * - Air quality
 * 
 * Documentation: https://open-meteo.com/
 */

export interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  visibility?: number;
  uv_index?: number;
}

export interface OpenMeteoHourlyData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  weather_code: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  uv_index: number[];
}

export interface OpenMeteoDailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  rain_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
  uv_index_max: number[];
}

export interface OpenMeteoMarineData {
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    swell_wave_height: number[];
    swell_wave_direction: number[];
    swell_wave_period: number[];
    ocean_current_velocity?: number[];
    ocean_current_direction?: number[];
  };
  daily?: {
    time: string[];
    wave_height_max: number[];
    wave_direction_dominant: number[];
    wave_period_max: number[];
  };
}

export interface OpenMeteoAirQuality {
  hourly: {
    time: string[];
    pm10: number[];
    pm2_5: number[];
    carbon_monoxide: number[];
    nitrogen_dioxide: number[];
    sulphur_dioxide: number[];
    ozone: number[];
    uv_index: number[];
    european_aqi: number[];
    us_aqi: number[];
  };
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: OpenMeteoCurrentWeather;
  hourly?: OpenMeteoHourlyData;
  daily?: OpenMeteoDailyData;
  current_units?: Record<string, string>;
  hourly_units?: Record<string, string>;
  daily_units?: Record<string, string>;
}

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheKey(endpoint: string, params: Record<string, any>): string {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Open-Meteo] Using cached data');
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * WMO Weather Code to description and icon mapping
 */
export function getWeatherDescription(code: number): { description: string; icon: string; condition: string } {
  const weatherCodes: Record<number, { description: string; icon: string; condition: string }> = {
    0: { description: 'Céu limpo', icon: '☀️', condition: 'Clear' },
    1: { description: 'Predominantemente limpo', icon: '🌤️', condition: 'Mostly Clear' },
    2: { description: 'Parcialmente nublado', icon: '⛅', condition: 'Partly Cloudy' },
    3: { description: 'Nublado', icon: '☁️', condition: 'Cloudy' },
    45: { description: 'Nevoeiro', icon: '🌫️', condition: 'Fog' },
    48: { description: 'Nevoeiro com geada', icon: '🌫️', condition: 'Rime Fog' },
    51: { description: 'Chuvisco leve', icon: '🌧️', condition: 'Light Drizzle' },
    53: { description: 'Chuvisco moderado', icon: '🌧️', condition: 'Moderate Drizzle' },
    55: { description: 'Chuvisco intenso', icon: '🌧️', condition: 'Heavy Drizzle' },
    56: { description: 'Chuvisco gelado leve', icon: '🌨️', condition: 'Freezing Drizzle' },
    57: { description: 'Chuvisco gelado intenso', icon: '🌨️', condition: 'Heavy Freezing Drizzle' },
    61: { description: 'Chuva leve', icon: '🌧️', condition: 'Light Rain' },
    63: { description: 'Chuva moderada', icon: '🌧️', condition: 'Rain' },
    65: { description: 'Chuva forte', icon: '🌧️', condition: 'Heavy Rain' },
    66: { description: 'Chuva gelada leve', icon: '🌨️', condition: 'Freezing Rain' },
    67: { description: 'Chuva gelada forte', icon: '🌨️', condition: 'Heavy Freezing Rain' },
    71: { description: 'Neve leve', icon: '❄️', condition: 'Light Snow' },
    73: { description: 'Neve moderada', icon: '❄️', condition: 'Snow' },
    75: { description: 'Neve forte', icon: '❄️', condition: 'Heavy Snow' },
    77: { description: 'Grãos de neve', icon: '🌨️', condition: 'Snow Grains' },
    80: { description: 'Pancadas de chuva leves', icon: '🌦️', condition: 'Light Showers' },
    81: { description: 'Pancadas de chuva', icon: '🌦️', condition: 'Showers' },
    82: { description: 'Pancadas de chuva fortes', icon: '⛈️', condition: 'Heavy Showers' },
    85: { description: 'Pancadas de neve leves', icon: '🌨️', condition: 'Light Snow Showers' },
    86: { description: 'Pancadas de neve fortes', icon: '🌨️', condition: 'Heavy Snow Showers' },
    95: { description: 'Tempestade', icon: '⛈️', condition: 'Thunderstorm' },
    96: { description: 'Tempestade com granizo leve', icon: '⛈️', condition: 'Thunderstorm with Hail' },
    99: { description: 'Tempestade com granizo forte', icon: '⛈️', condition: 'Severe Thunderstorm' },
  };

  return weatherCodes[code] || { description: 'Indefinido', icon: '🌡️', condition: 'Unknown' };
}

/**
 * Fetch current weather and forecast from Open-Meteo
 */
export async function fetchOpenMeteoWeather(
  lat: number,
  lon: number,
  options: {
    hourlyHours?: number;
    dailyDays?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<OpenMeteoResponse> {
  const { hourlyHours = 48, dailyDays = 7, forceRefresh = false } = options;
  
  const params = { lat, lon, hourlyHours, dailyDays };
  const cacheKey = getCacheKey('weather', params);
  
  if (!forceRefresh) {
    const cached = getCachedData<OpenMeteoResponse>(cacheKey);
    if (cached) return cached;
  }

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'rain',
    'weather_code',
    'cloud_cover',
    'visibility',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'uv_index'
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'precipitation_sum',
    'rain_sum',
    'precipitation_hours',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
    'uv_index_max'
  ].join(',');

  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation',
    'rain',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m'
  ].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=${currentParams}` +
    `&hourly=${hourlyParams}` +
    `&daily=${dailyParams}` +
    `&forecast_hours=${hourlyHours}` +
    `&forecast_days=${dailyDays}` +
    `&timezone=auto` +
    `&wind_speed_unit=kmh`;

  console.log('[Open-Meteo] Fetching weather data...');

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoResponse = await response.json();
    setCachedData(cacheKey, data);
    console.log('[Open-Meteo] Weather data fetched successfully');
    return data;
  } catch (error) {
    console.error('[Open-Meteo] Fetch error:', error);
    throw error;
  }
}

/**
 * Fetch marine/ocean data from Open-Meteo Marine API
 */
export async function fetchOpenMeteoMarine(
  lat: number,
  lon: number,
  options: {
    forecastDays?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<OpenMeteoMarineData> {
  const { forecastDays = 7, forceRefresh = false } = options;
  
  const params = { lat, lon, forecastDays };
  const cacheKey = getCacheKey('marine', params);
  
  if (!forceRefresh) {
    const cached = getCachedData<OpenMeteoMarineData>(cacheKey);
    if (cached) return cached;
  }

  const hourlyParams = [
    'wave_height',
    'wave_direction',
    'wave_period',
    'swell_wave_height',
    'swell_wave_direction',
    'swell_wave_period'
  ].join(',');

  const dailyParams = [
    'wave_height_max',
    'wave_direction_dominant',
    'wave_period_max'
  ].join(',');

  const url = `https://marine-api.open-meteo.com/v1/marine?` +
    `latitude=${lat}&longitude=${lon}` +
    `&hourly=${hourlyParams}` +
    `&daily=${dailyParams}` +
    `&forecast_days=${forecastDays}` +
    `&timezone=auto`;

  console.log('[Open-Meteo] Fetching marine data...');

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo Marine API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoMarineData = await response.json();
    setCachedData(cacheKey, data);
    console.log('[Open-Meteo] Marine data fetched successfully');
    return data;
  } catch (error) {
    console.error('[Open-Meteo] Marine fetch error:', error);
    throw error;
  }
}

/**
 * Fetch air quality data from Open-Meteo Air Quality API
 */
export async function fetchOpenMeteoAirQuality(
  lat: number,
  lon: number,
  options: {
    forecastDays?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<OpenMeteoAirQuality> {
  const { forecastDays = 3, forceRefresh = false } = options;
  
  const params = { lat, lon, forecastDays };
  const cacheKey = getCacheKey('air_quality', params);
  
  if (!forceRefresh) {
    const cached = getCachedData<OpenMeteoAirQuality>(cacheKey);
    if (cached) return cached;
  }

  const hourlyParams = [
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'ozone',
    'uv_index',
    'european_aqi',
    'us_aqi'
  ].join(',');

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?` +
    `latitude=${lat}&longitude=${lon}` +
    `&hourly=${hourlyParams}` +
    `&forecast_days=${forecastDays}` +
    `&timezone=auto`;

  console.log('[Open-Meteo] Fetching air quality data...');

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo AQI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoAirQuality = await response.json();
    setCachedData(cacheKey, data);
    console.log('[Open-Meteo] Air quality data fetched successfully');
    return data;
  } catch (error) {
    console.error('[Open-Meteo] AQI fetch error:', error);
    throw error;
  }
}

/**
 * Clear all Open-Meteo cache
 */
export function clearOpenMeteoCache(): void {
  cache.clear();
  console.log('[Open-Meteo] Cache cleared');
}

/**
 * Get AQI level description
 */
export function getAQIDescription(aqi: number): { level: string; color: string; advice: string } {
  if (aqi <= 20) return { level: 'Excelente', color: 'green', advice: 'Qualidade do ar ideal' };
  if (aqi <= 40) return { level: 'Bom', color: 'lime', advice: 'Qualidade do ar satisfatória' };
  if (aqi <= 60) return { level: 'Moderado', color: 'yellow', advice: 'Qualidade aceitável' };
  if (aqi <= 80) return { level: 'Ruim', color: 'orange', advice: 'Pessoas sensíveis podem ser afetadas' };
  if (aqi <= 100) return { level: 'Muito Ruim', color: 'red', advice: 'Efeitos à saúde podem ocorrer' };
  return { level: 'Perigoso', color: 'purple', advice: 'Condições de emergência' };
}

/**
 * Convert wind direction degrees to cardinal direction
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get wind direction arrow
 */
export function getWindArrow(degrees: number): string {
  const arrows = ['↓', '↙', '↙', '←', '←', '←', '↖', '↖', '↑', '↗', '↗', '→', '→', '→', '↘', '↘'];
  const index = Math.round(degrees / 22.5) % 16;
  return arrows[index];
}

/**
 * Unified service object for easier imports
 */
export const openMeteoService = {
  getWeatherData: fetchOpenMeteoWeather,
  getMarineData: fetchOpenMeteoMarine,
  getAirQualityData: fetchOpenMeteoAirQuality,
  getWeatherDescription,
  getAQIDescription,
  getWindDirection,
  getWindArrow,
  clearCache: clearOpenMeteoCache
};
