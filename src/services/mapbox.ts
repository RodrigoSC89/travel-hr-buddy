/**
 * Mapbox Service Integration
 * Test geolocation and static map functionality
 */

export interface MapboxTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}

export interface MapboxTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Mapbox API connectivity
 */
export async function testMapboxConnection(): Promise<MapboxTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;

  if (!apiKey) {
    return {
      success: false,
      message: 'Mapbox API key not configured',
      error: 'Missing VITE_MAPBOX_ACCESS_TOKEN or VITE_MAPBOX_TOKEN',
    };
  }

  try {
    // Test geocoding API with a simple location query
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/Rio%20de%20Janeiro.json?access_token=${apiKey}&limit=1`,
      {
        method: 'GET',
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `Mapbox API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return {
        success: true,
        message: 'Mapbox API connection successful',
        responseTime,
        data: {
          location: data.features[0].place_name,
          coordinates: data.features[0].center,
        },
      };
    }

    return {
      success: false,
      message: 'Mapbox API returned unexpected data',
      responseTime,
      error: 'Invalid response format',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to Mapbox API',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Mapbox API connection (simplified version for API test panel)
 */
export async function testMapbox(): Promise<MapboxTestResponse> {
  try {
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!accessToken) {
      return {
        success: false,
        error: 'Mapbox access token not configured'
      };
    }

    // Test with a simple geocoding request
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/London.json?access_token=${accessToken}&limit=1`
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
      message: 'Mapbox API is working correctly',
      data: {
        features: data.features?.length || 0,
        attribution: data.attribution
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
 * Get Mapbox API status
 */
export function getMapboxStatus(): { configured: boolean; token?: string } {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
  return {
    configured: !!token,
    token: token ? `${token.substring(0, 10)}...` : undefined
  };
}
