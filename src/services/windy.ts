/**
 * Windy API Service
 * Provides weather, wind, and marine forecasts
 */

export interface WindyTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Windy API connection
 */
export async function testWindy(): Promise<WindyTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_WINDY_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Windy API key not configured'
      };
    }

    // Test with a simple point forecast request
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat: 51.5074,
        lon: -0.1278,
        model: 'gfs',
        parameters: ['wind', 'temp'],
        levels: ['surface'],
        key: apiKey
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Windy API is working correctly',
      data: {
        location: `${data.lat}, ${data.lon}`,
        model: data.model,
        parametersAvailable: Object.keys(data).filter(k => !['lat', 'lon', 'model'].includes(k)).length
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
 * Get Windy API status
 */
export function getWindyStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_WINDY_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
