/**
 * Windy API Service
 * Test and interact with Windy API for weather forecasts and wind data
 */

export interface WindyTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Windy API connection
 * Note: Windy primarily uses API keys for embedding maps and forecast data
 * They don't have a public REST API for testing, but we can verify the key exists
 */
export async function testWindy(): Promise<WindyTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_WINDY_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Windy API key not configured',
      };
    }

    // Windy API is primarily for map embedding and doesn't have a simple test endpoint
    // We'll validate the key format and provide information about usage
    if (apiKey.length < 10) {
      return {
        success: false,
        error: 'Windy API key appears to be invalid (too short)',
      };
    }

    return {
      success: true,
      message: 'Windy API key is configured. Use it for map embedding and forecast widgets.',
      data: {
        keyLength: apiKey.length,
        usage: 'Embed Windy maps using the API key in your application',
        embedUrl: `https://embed.windy.com/embed.html?apiKey=${apiKey}`,
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
 * Get Windy embed URL for a location
 */
export function getWindyEmbedUrl(
  latitude: number,
  longitude: number,
  zoom: number = 5
): string {
  const apiKey = import.meta.env.VITE_WINDY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Windy API key not configured');
  }

  return `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=${zoom}&level=surface&overlay=wind&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=${latitude}&detailLon=${longitude}&metricWind=default&metricTemp=default&radarRange=-1`;
}

/**
 * Get Windy widget configuration
 */
export function getWindyWidgetConfig(latitude: number, longitude: number) {
  const apiKey = import.meta.env.VITE_WINDY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Windy API key not configured');
  }

  return {
    key: apiKey,
    lat: latitude,
    lon: longitude,
    zoom: 5,
  };
}
