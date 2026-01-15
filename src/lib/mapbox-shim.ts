/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 * PATCH WINDY-2.3: Enhanced ESM/CJS compatibility
 */

import mapboxglDefault from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Get the actual mapbox-gl module, handling both ESM and CJS exports
const getMapboxGL = () => {
  // Try default export first
  if (mapboxglDefault && typeof mapboxglDefault === 'object' && 'Map' in mapboxglDefault) {
    return mapboxglDefault;
  }
  
  // Fallback: try accessing as any
  const mod = mapboxglDefault as any;
  if (mod?.default && typeof mod.default === 'object' && 'Map' in mod.default) {
    return mod.default;
  }
  
  // Last resort: return whatever we have
  return mapboxglDefault;
};

const mapboxglOriginal = getMapboxGL();

// Create a mutable wrapper around mapbox-gl to allow setting accessToken
const createMutableMapbox = () => {
  // Safety check
  if (!mapboxglOriginal || typeof mapboxglOriginal !== 'object') {
    console.error('[mapbox-shim] mapbox-gl not loaded properly');
    // Return stub with proper class implementations
    return {
      accessToken: '',
      Map: class MockMap {
        constructor() {
          console.warn('[mapbox-shim] Using mock Map - mapbox-gl not loaded');
        }
        on() { return this; }
        remove() {}
        addControl() {}
        setView() {}
        getZoom() { return 0; }
        getCenter() { return { lat: 0, lng: 0 }; }
      },
      Marker: class MockMarker {
        setLngLat() { return this; }
        setPopup() { return this; }
        addTo() { return this; }
      },
      Popup: class MockPopup {
        setHTML() { return this; }
      },
      NavigationControl: class {},
      LngLatBounds: class {
        extend() { return this; }
      },
      LngLat: class {},
    };
  }

  // Check if we can use the original directly
  const isFrozen = Object.isFrozen(mapboxglOriginal);
  
  if (!isFrozen) {
    return mapboxglOriginal;
  }

  // Create a mutable copy for frozen modules
  const mapboxMutable: Record<string, any> = {};
  
  // Copy all enumerable properties
  Object.keys(mapboxglOriginal).forEach(key => {
    try {
      mapboxMutable[key] = (mapboxglOriginal as any)[key];
    } catch (e) {
      // Skip non-copyable properties
    }
  });
  
  // Explicitly copy critical classes
  const criticalClasses = ['Map', 'Marker', 'Popup', 'NavigationControl', 'LngLatBounds', 'LngLat'];
  criticalClasses.forEach(cls => {
    if ((mapboxglOriginal as any)[cls]) {
      mapboxMutable[cls] = (mapboxglOriginal as any)[cls];
    }
  });
  
  // Internal storage for access token
  let _accessToken = '';
  
  // Define writable accessToken property
  Object.defineProperty(mapboxMutable, 'accessToken', {
    get: () => _accessToken || (mapboxglOriginal as any).accessToken,
    set: (value: string) => {
      _accessToken = value;
      try {
        (mapboxglOriginal as any).accessToken = value;
      } catch {
        // Ignore if frozen
      }
    },
    configurable: true,
    enumerable: true
  });

  return mapboxMutable;
};

const mapboxgl = createMutableMapbox();

// Type export for proper typing
export type MapboxGL = typeof mapboxglDefault;
export default mapboxgl as MapboxGL;
export { mapboxgl };
