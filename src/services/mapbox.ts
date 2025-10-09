/**
 * Mapbox API Service
 * Provides mapping, geocoding, and location services
 */

export interface MapboxTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Mapbox API connection
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
