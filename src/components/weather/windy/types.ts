/**
 * Weather Command - Windy Style Types
 * PATCH WINDY-1.0
 */

export interface WeatherLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  isFavorite?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  cloudCoverage: number;
  condition: string;
  description: string;
  icon: string;
  wind: {
    speed: number;
    gust: number;
    direction: number;
  };
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  hour: number;
  time: string;
  temperature: number;
  rain: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  humidity: number;
  icon: string;
  condition: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
}

export interface MarineData {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  waterTemperature: number;
  tideLevel: number;
  tideType: 'high' | 'low' | 'rising' | 'falling';
  nextTide: {
    time: string;
    type: 'high' | 'low';
    level: number;
  };
}

export interface AirQuality {
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  validFrom: string;
  validTo: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ForecastModel = 'ECMWF' | 'GFS' | 'ICON' | 'NAM';
export type DisplayMode = 'basic' | 'advanced' | 'table';
export type ForecastRange = '3h' | '24h' | '7d';
export type MapLayer = 'wind' | 'temp' | 'rain' | 'clouds' | 'pressure' | 'waves';
