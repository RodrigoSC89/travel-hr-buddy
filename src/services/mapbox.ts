/**
 * Mapbox API Service
 * Provides maps, geocoding, routing, and location services
 * 
 * Documentation: https://docs.mapbox.com/api/
 */

interface GeocodingResult {
  id: string;
  type: string;
  placeName: string;
  center: [number, number]; // [lon, lat]
  bbox?: [number, number, number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface DirectionsRoute {
  distance: number;
  duration: number;
  geometry: {
    type: 'LineString';
    coordinates: Array<[number, number]>;
  };
  legs: Array<{
    distance: number;
    duration: number;
    steps: Array<{
      distance: number;
      duration: number;
      instruction: string;
      maneuver: any;
    }>;
  }>;
}

interface MatrixResult {
  durations: number[][];
  distances?: number[][];
  sources: Array<{ location: [number, number] }>;
  destinations: Array<{ location: [number, number] }>;
}

export class MapboxService {
  private baseUrl = 'https://api.mapbox.com';
  private accessToken: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || 
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
      import.meta.env.VITE_MAPBOX_TOKEN || 
      '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get access token for client-side usage
   */
  getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Forward geocoding - convert address to coordinates
   */
  async geocodeForward(query: string, options?: {
    proximity?: [number, number];
    bbox?: [number, number, number, number];
    country?: string;
    types?: string[];
    language?: string;
    limit?: number;
  }): Promise<GeocodingResult[]> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        ...(options?.proximity && { proximity: options.proximity.join(',') }),
        ...(options?.bbox && { bbox: options.bbox.join(',') }),
        ...(options?.country && { country: options.country }),
        ...(options?.types && { types: options.types.join(',') }),
        ...(options?.language && { language: options.language }),
        limit: (options?.limit || 5).toString(),
      });

      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        type: feature.place_type[0],
        placeName: feature.place_name,
        center: feature.center,
        bbox: feature.bbox,
        context: feature.context,
      }));
    } catch (error) {
      console.error('Mapbox forward geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocoding - convert coordinates to address
   */
  async geocodeReverse(
    lon: number,
    lat: number,
    options?: {
      types?: string[];
      language?: string;
    }
  ): Promise<GeocodingResult | null> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        ...(options?.types && { types: options.types.join(',') }),
        ...(options?.language && { language: options.language }),
      });

      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${lon},${lat}.json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        id: feature.id,
        type: feature.place_type[0],
        placeName: feature.place_name,
        center: feature.center,
        bbox: feature.bbox,
        context: feature.context,
      };
    } catch (error) {
      console.error('Mapbox reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get directions between points
   */
  async getDirections(
    coordinates: Array<[number, number]>,
    options?: {
      profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
      alternatives?: boolean;
      steps?: boolean;
      geometries?: 'geojson' | 'polyline' | 'polyline6';
      overview?: 'full' | 'simplified' | 'false';
      language?: string;
    }
  ): Promise<DirectionsRoute[]> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const profile = options?.profile || 'driving';
      const coordinatesStr = coordinates.map(c => c.join(',')).join(';');
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        alternatives: (options?.alternatives ?? false).toString(),
        steps: (options?.steps ?? true).toString(),
        geometries: options?.geometries || 'geojson',
        overview: options?.overview || 'full',
        ...(options?.language && { language: options.language }),
      });

      const response = await fetch(
        `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinatesStr}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.routes.map((route: any) => ({
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        legs: route.legs,
      }));
    } catch (error) {
      console.error('Mapbox directions error:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix between multiple points
   */
  async getMatrix(
    coordinates: Array<[number, number]>,
    options?: {
      profile?: 'driving' | 'walking' | 'cycling';
      sources?: number[];
      destinations?: number[];
    }
  ): Promise<MatrixResult> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const profile = options?.profile || 'driving';
      const coordinatesStr = coordinates.map(c => c.join(',')).join(';');
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        ...(options?.sources && { sources: options.sources.join(';') }),
        ...(options?.destinations && { destinations: options.destinations.join(';') }),
      });

      const response = await fetch(
        `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordinatesStr}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        durations: data.durations,
        distances: data.distances,
        sources: data.sources,
        destinations: data.destinations,
      };
    } catch (error) {
      console.error('Mapbox matrix error:', error);
      throw error;
    }
  }

  /**
   * Get isochrone (areas reachable within a time)
   */
  async getIsochrone(
    coordinates: [number, number],
    contours: number[], // in minutes
    options?: {
      profile?: 'driving' | 'walking' | 'cycling';
      polygons?: boolean;
    }
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const profile = options?.profile || 'driving';
      const contoursStr = contours.join(',');
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        contours_minutes: contoursStr,
        polygons: (options?.polygons ?? true).toString(),
      });

      const response = await fetch(
        `${this.baseUrl}/isochrone/v1/mapbox/${profile}/${coordinates.join(',')}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mapbox isochrone error:', error);
      throw error;
    }
  }

  /**
   * Get static map image URL
   */
  getStaticMapUrl(
    coordinates: [number, number],
    zoom: number,
    options?: {
      width?: number;
      height?: number;
      style?: string;
      markers?: Array<{
        coordinates: [number, number];
        size?: 'small' | 'large';
        label?: string;
        color?: string;
      }>;
      bearing?: number;
      pitch?: number;
    }
  ): string {
    const width = options?.width || 600;
    const height = options?.height || 400;
    const style = options?.style || 'streets-v12';
    
    let overlay = '';
    if (options?.markers && options.markers.length > 0) {
      overlay = options.markers.map(marker => {
        const size = marker.size || 'small';
        const color = marker.color || 'red';
        const label = marker.label ? `-${marker.label}` : '';
        return `pin-${size}${label}+${color}(${marker.coordinates.join(',')})`;
      }).join(',');
      overlay += '/';
    }

    const bearing = options?.bearing !== undefined ? `,${options.bearing}` : '';
    const pitch = options?.pitch !== undefined ? `,${options.pitch}` : '';
    
    return `${this.baseUrl}/styles/v1/mapbox/${style}/static/${overlay}${coordinates.join(',')},${zoom}${bearing}${pitch}/${width}x${height}?access_token=${this.accessToken}`;
  }

  /**
   * Search for places nearby
   */
  async searchNearby(
    coordinates: [number, number],
    query: string,
    radius: number = 1000, // in meters
    options?: {
      types?: string[];
      limit?: number;
    }
  ): Promise<GeocodingResult[]> {
    return this.geocodeForward(query, {
      proximity: coordinates,
      types: options?.types,
      limit: options?.limit,
    });
  }

  /**
   * Get maritime route (optimized for water navigation)
   */
  async getMaritimeRoute(
    startCoordinates: [number, number],
    endCoordinates: [number, number]
  ): Promise<DirectionsRoute[]> {
    // Note: Mapbox doesn't have a dedicated maritime profile
    // This uses the driving profile as a fallback
    // For real maritime routing, consider specialized maritime APIs
    return this.getDirections([startCoordinates, endCoordinates], {
      profile: 'driving',
      steps: true,
      overview: 'full',
    });
  }

  /**
   * Calculate distance between two points (in km)
   */
  calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Format distance in human-readable format
   */
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }
}

// Export singleton instance
export const mapboxService = new MapboxService();
