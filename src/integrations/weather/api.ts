/**
 * PATCH 630: Weather Integration Module
 * Fetches weather data from external APIs (OpenWeather, etc.)
 */

interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  description: string;
  visibility: number;
  cloudCoverage: number;
  precipitation: number;
}

interface WeatherAPIResponse {
  coord: { lat: number; lon: number };
  weather: Array<{ main: string; description: string }>;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  clouds: { all: number };
  rain?: { '1h': number };
  name: string;
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather for a specific location
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data: WeatherAPIResponse = await response.json();

  return {
    location: {
      lat: data.coord.lat,
      lon: data.coord.lon,
      name: data.name,
    },
    temperature: data.main.temp,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    condition: data.weather[0]?.main || 'Unknown',
    description: data.weather[0]?.description || '',
    visibility: data.visibility,
    cloudCoverage: data.clouds.all,
    precipitation: data.rain?.['1h'] || 0,
  };
}

/**
 * Fetch weather for multiple maritime locations
 */
export async function fetchMaritimeWeather(locations: Array<{ lat: number; lon: number; name: string }>) {
  const weatherPromises = locations.map(loc => 
    fetchWeather(loc.lat, loc.lon)
      .catch(error => {
        console.error(`Failed to fetch weather for ${loc.name}:`, error);
        return null;
      })
  );

  const results = await Promise.all(weatherPromises);
  return results.filter((result): result is WeatherData => result !== null);
}

/**
 * Common maritime locations for weather monitoring
 */
export const MARITIME_LOCATIONS = [
  { lat: -23.5505, lon: -46.6333, name: 'Port of Santos' },
  { lat: -22.9068, lon: -43.1729, name: 'Port of Rio de Janeiro' },
  { lat: -3.7319, lon: -38.5267, name: 'Port of Fortaleza' },
  { lat: -12.9714, lon: -38.5014, name: 'Port of Salvador' },
  { lat: -25.4284, lon: -49.2733, name: 'Port of Paranaguá' },
];

/**
 * Get weather condition severity for maritime operations
 * Returns: 'safe' | 'caution' | 'warning' | 'danger'
 */
export function getWeatherSeverity(weather: WeatherData): string {
  const { windSpeed, visibility, condition } = weather;

  // Dangerous conditions
  if (windSpeed > 25 || visibility < 1000 || ['Thunderstorm', 'Tornado'].includes(condition)) {
    return 'danger';
  }

  // Warning conditions
  if (windSpeed > 15 || visibility < 5000 || ['Storm', 'Squall'].includes(condition)) {
    return 'warning';
  }

  // Caution conditions
  if (windSpeed > 10 || visibility < 10000 || ['Rain', 'Snow', 'Fog'].includes(condition)) {
    return 'caution';
  }

  return 'safe';
}
