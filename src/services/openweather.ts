/**
 * OpenWeather API Service
 * Provides weather data and forecasts
 */

export interface OpenWeatherTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
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
        error: 'OpenWeather API key not configured'
      };
    }

    // Test with a simple weather request for London
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'OpenWeather API is working correctly',
      data: {
        location: data.name,
        temperature: `${data.main?.temp}°C`,
        weather: data.weather?.[0]?.description
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get OpenWeather API status
 */
export function getOpenWeatherStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
