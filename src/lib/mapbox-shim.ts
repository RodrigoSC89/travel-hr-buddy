/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 * PATCH WINDY-1.2: Fixed ESM default export issue
 */

import * as mapboxglModule from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Handle both ESM and CJS exports
const mapboxglOriginal = (mapboxglModule as any).default || mapboxglModule;

// Create a mutable wrapper around mapbox-gl to allow setting accessToken
// Some bundlers freeze the default export, preventing token assignment
const createMutableMapbox = () => {
  // If mapbox-gl is not loaded properly, return a stub
  if (!mapboxglOriginal || typeof mapboxglOriginal !== 'object') {
    console.warn('[mapbox-shim] mapbox-gl not loaded properly, using stub');
    return {
      accessToken: '',
      Map: class {},
      Marker: class {},
      Popup: class {},
      NavigationControl: class {},
      LngLatBounds: class {},
      LngLat: class {},
    };
  }

  // Check if the original module is frozen
  const isFrozen = Object.isFrozen(mapboxglOriginal);
  
  if (!isFrozen) {
    // If not frozen, use it directly
    return mapboxglOriginal;
  }

  // Create a shallow copy that we can modify
  const mapboxMutable: any = {};
  
  // Copy all properties from original
  for (const key of Object.keys(mapboxglOriginal)) {
    mapboxMutable[key] = (mapboxglOriginal as any)[key];
  }
  
  // Copy prototype chain for classes like Map, Marker, etc.
  try {
    Object.setPrototypeOf(mapboxMutable, Object.getPrototypeOf(mapboxglOriginal));
  } catch {
    // Ignore if fails
  }
  
  // Ensure critical classes are copied
  mapboxMutable.Map = mapboxglOriginal.Map;
  mapboxMutable.Marker = mapboxglOriginal.Marker;
  mapboxMutable.Popup = mapboxglOriginal.Popup;
  mapboxMutable.NavigationControl = mapboxglOriginal.NavigationControl;
  mapboxMutable.LngLatBounds = mapboxglOriginal.LngLatBounds;
  mapboxMutable.LngLat = mapboxglOriginal.LngLat;
  
  // Internal storage for access token
  let _accessToken = '';
  
  // Define writable accessToken property
  Object.defineProperty(mapboxMutable, 'accessToken', {
    get: () => _accessToken,
    set: (value: string) => {
      _accessToken = value;
      // Also try to set it on the original in case it works
      try {
        (mapboxglOriginal as any).accessToken = value;
      } catch {
        // Ignore if it fails
      }
    },
    configurable: true,
    enumerable: true
  });

  return mapboxMutable;
};

const mapboxgl = createMutableMapbox();

export default mapboxgl;
export { mapboxgl };
