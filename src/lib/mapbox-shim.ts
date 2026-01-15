/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 * PATCH WINDY-2.5: Fixed ESM import issue in Vite
 */

// Import mapbox-gl CSS first
import 'mapbox-gl/dist/mapbox-gl.css';

// Type definitions
type MapboxMapConstructor = new (options: any) => any;
type MapboxMarkerConstructor = new (options?: any) => any;
type MapboxPopupConstructor = new (options?: any) => any;
type MapboxNavigationControlConstructor = new (options?: any) => any;
type MapboxLngLatBoundsConstructor = new (sw?: any, ne?: any) => any;
type MapboxLngLatConstructor = new (lng: number, lat: number) => any;

interface MapboxGLInterface {
  accessToken: string;
  Map: MapboxMapConstructor;
  Marker: MapboxMarkerConstructor;
  Popup: MapboxPopupConstructor;
  NavigationControl: MapboxNavigationControlConstructor;
  LngLatBounds: MapboxLngLatBoundsConstructor;
  LngLat: MapboxLngLatConstructor;
  [key: string]: any;
}

// Create mock classes for when mapbox-gl is not available
class MockMap {
  private container: HTMLElement | null = null;
  
  constructor(options?: any) {
    console.warn('[mapbox-shim] Using mock Map - mapbox-gl not loaded');
    if (options?.container) {
      this.container = typeof options.container === 'string' 
        ? document.getElementById(options.container) 
        : options.container;
    }
  }
  on(_event: string, _callback: Function) { return this; }
  off(_event: string, _callback: Function) { return this; }
  remove() {}
  addControl() { return this; }
  removeControl() { return this; }
  setStyle() { return this; }
  getStyle() { return {}; }
  setLayoutProperty() { return this; }
  setPaintProperty() { return this; }
  setFilter() { return this; }
  getLayer() { return null; }
  addLayer() { return this; }
  removeLayer() { return this; }
  getSource() { return null; }
  addSource() { return this; }
  removeSource() { return this; }
  setView() {}
  getZoom() { return 5; }
  setZoom() { return this; }
  getCenter() { return { lat: 0, lng: 0 }; }
  setCenter() { return this; }
  flyTo() { return this; }
  fitBounds() { return this; }
  setFog() { return this; }
  scrollZoom = { disable: () => {}, enable: () => {} };
  easeTo() { return this; }
}

class MockMarker {
  setLngLat() { return this; }
  setPopup() { return this; }
  addTo() { return this; }
  remove() { return this; }
  getElement() { return document.createElement('div'); }
}

class MockPopup {
  setHTML() { return this; }
  setLngLat() { return this; }
  addTo() { return this; }
  remove() { return this; }
}

class MockNavigationControl {}

class MockLngLatBounds {
  extend() { return this; }
  getSouthWest() { return { lat: 0, lng: 0 }; }
  getNorthEast() { return { lat: 0, lng: 0 }; }
}

class MockLngLat {
  lat = 0;
  lng = 0;
  constructor(lng?: number, lat?: number) {
    this.lng = lng || 0;
    this.lat = lat || 0;
  }
}

// Create a mock implementation that will be used as fallback
const createMockMapbox = (): MapboxGLInterface => {
  return {
    accessToken: '',
    Map: MockMap as any,
    Marker: MockMarker as any,
    Popup: MockPopup as any,
    NavigationControl: MockNavigationControl as any,
    LngLatBounds: MockLngLatBounds as any,
    LngLat: MockLngLat as any,
  };
};

// Dynamic import approach to handle ESM/CJS compatibility
let mapboxgl: MapboxGLInterface = createMockMapbox();
let mapboxLoaded = false;
let loadPromise: Promise<MapboxGLInterface> | null = null;

// Async loader function
const loadMapboxGL = async (): Promise<MapboxGLInterface> => {
  if (mapboxLoaded && mapboxgl.Map !== MockMap) {
    return mapboxgl;
  }

  try {
    // Use dynamic import for better ESM/CJS handling
    const module = await import('mapbox-gl');
    
    // Get the actual mapbox-gl object
    let resolved: any = null;
    const mod = module as any;
    
    if (mod.default && typeof mod.default === 'object' && mod.default.Map) {
      resolved = mod.default;
    } else if (mod.Map && typeof mod.Map === 'function') {
      resolved = mod;
    } else if (mod.default?.default?.Map) {
      resolved = mod.default.default;
    }
    
    if (resolved && resolved.Map) {
      // Create mutable wrapper
      let _accessToken = '';
      
      const wrapper: MapboxGLInterface = {
        get accessToken() { return _accessToken || resolved.accessToken || ''; },
        set accessToken(value: string) {
          _accessToken = value;
          try { resolved.accessToken = value; } catch {}
        },
        Map: resolved.Map,
        Marker: resolved.Marker || MockMarker as any,
        Popup: resolved.Popup || MockPopup as any,
        NavigationControl: resolved.NavigationControl || MockNavigationControl as any,
        LngLatBounds: resolved.LngLatBounds || MockLngLatBounds as any,
        LngLat: resolved.LngLat || MockLngLat as any,
      };
      
      // Copy additional properties
      Object.keys(resolved).forEach(key => {
        if (!(key in wrapper)) {
          try { (wrapper as any)[key] = resolved[key]; } catch {}
        }
      });
      
      mapboxgl = wrapper;
      mapboxLoaded = true;
      return wrapper;
    }
  } catch (error) {
    console.error('[mapbox-shim] Failed to load mapbox-gl:', error);
  }
  
  return createMockMapbox();
};

// Start loading immediately but don't block
loadPromise = loadMapboxGL();

// Synchronous getter for compatibility (may return mock initially)
export const getMapboxGL = (): MapboxGLInterface => mapboxgl;

// Async getter for guaranteed loaded mapbox
export const getMapboxGLAsync = async (): Promise<MapboxGLInterface> => {
  if (loadPromise) {
    return loadPromise;
  }
  return loadMapboxGL();
};

// Initialize synchronously with a try-catch for immediate use
try {
  // Attempt synchronous require for SSR/build compatibility
  const syncModule = require('mapbox-gl');
  if (syncModule) {
    const resolved = syncModule.default || syncModule;
    if (resolved && resolved.Map) {
      let _token = '';
      mapboxgl = {
        get accessToken() { return _token || resolved.accessToken || ''; },
        set accessToken(value: string) {
          _token = value;
          try { resolved.accessToken = value; } catch {}
        },
        Map: resolved.Map,
        Marker: resolved.Marker || MockMarker as any,
        Popup: resolved.Popup || MockPopup as any,
        NavigationControl: resolved.NavigationControl || MockNavigationControl as any,
        LngLatBounds: resolved.LngLatBounds || MockLngLatBounds as any,
        LngLat: resolved.LngLat || MockLngLat as any,
      };
      mapboxLoaded = true;
    }
  }
} catch {
  // Ignore - will use async loader
}

// Type export
export type MapboxGL = MapboxGLInterface;
export default mapboxgl;
export { mapboxgl };
