/**
 * OpenWeather API Service
 * Test and interact with OpenWeather API for weather data
 */

export interface OpenWeatherTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  location: string;
}

/**
 * Test OpenWeather API connection
 */
export async function testOpenWeather(): Promise<OpenWeatherTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenWeather API key not configured',
      };
    }

    // Test with a known location (Rio de Janeiro)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Rio de Janeiro,BR&appid=${apiKey}&units=metric&lang=pt_br`
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'OpenWeather API is connected and working properly',
      data: {
        location: data.name,
        temperature: `${data.main?.temp}°C`,
        description: data.weather?.[0]?.description,
        humidity: `${data.main?.humidity}%`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`
  );

  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    windSpeed: data.wind.speed,
    location: data.name,
  };
}

/**
 * Get weather by coordinates
 */
export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`
  );

  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    windSpeed: data.wind.speed,
    location: data.name,
  };
}
