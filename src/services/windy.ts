/**
 * Windy (Weather) Service Integration
 * Test weather data by coordinates
 */

export interface WindyTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Windy API connectivity
 */
export async function testWindyConnection(): Promise<WindyTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_WINDY_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "Windy/Weather API key not configured",
      error: "Missing VITE_WINDY_API_KEY or VITE_OPENWEATHER_API_KEY",
    };
  }

  try {
    // Test with OpenWeatherMap API as it's more commonly available
    // Rio de Janeiro coordinates: -22.9068, -43.1729
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=-22.9068&lon=-43.1729&appid=${apiKey}&units=metric`,
      {
        method: "GET",
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `Weather API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.weather && data.main) {
      return {
        success: true,
        message: "Weather API connection successful",
        responseTime,
        data: {
          location: data.name,
          temperature: `${data.main.temp}°C`,
          weather: data.weather[0].description,
        },
      };
    }

    return {
      success: false,
      message: "Weather API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Weather API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
