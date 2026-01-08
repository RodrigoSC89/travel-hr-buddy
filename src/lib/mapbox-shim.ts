/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 */

// Re-export mapbox-gl with proper ESM compatibility
import * as mapboxglModule from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Handle both ESM and CommonJS exports - cast to any to avoid type conflicts
const mapboxgl: typeof mapboxglModule & { accessToken: string } = 
  (mapboxglModule as any).default || mapboxglModule;

export default mapboxgl;
export { mapboxgl };
