/**
 * Mapbox API Service
 * Test and interact with Mapbox API for maps and geocoding
 */

export interface MapboxTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface MapboxGeocodeResult {
  place_name: string;
  coordinates: [number, number];
  bbox?: number[];
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
        error: 'Mapbox access token not configured',
      };
    }

    // Test with a simple geocoding request
    const testQuery = 'Rio de Janeiro, Brazil';
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(testQuery)}.json?access_token=${accessToken}&limit=1`
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
      message: 'Mapbox API is connected and working properly',
      data: {
        testQuery,
        resultCount: data.features?.length || 0,
        sampleResult: data.features?.[0]?.place_name,
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
 * Get geocoding data for a location
 */
export async function geocodeLocation(query: string): Promise<MapboxGeocodeResult[]> {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (!accessToken) {
    throw new Error('Mapbox access token not configured');
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=5`
  );

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.features.map((feature: any) => ({
    place_name: feature.place_name,
    coordinates: feature.center,
    bbox: feature.bbox,
  }));
}

/**
 * Get reverse geocoding data for coordinates
 */
export async function reverseGeocode(longitude: number, latitude: number): Promise<string> {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (!accessToken) {
    throw new Error('Mapbox access token not configured');
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&limit=1`
  );

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.features?.[0]?.place_name || 'Unknown location';
}
