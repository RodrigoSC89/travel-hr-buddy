/**
 * Mapbox Service Integration
 * Test geolocation and static map functionality
 */

export interface MapboxTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
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
      message: "Mapbox API key not configured",
      error: "Missing VITE_MAPBOX_ACCESS_TOKEN or VITE_MAPBOX_TOKEN",
    };
  }

  try {
    // Test geocoding API with a simple location query
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/Rio%20de%20Janeiro.json?access_token=${apiKey}&limit=1`,
      {
        method: "GET",
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
        message: "Mapbox API connection successful",
        responseTime,
        data: {
          location: data.features[0].place_name,
          coordinates: data.features[0].center,
        },
      };
    }

    return {
      success: false,
      message: "Mapbox API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Mapbox API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
