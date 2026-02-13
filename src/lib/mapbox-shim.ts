/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 * PATCH WINDY-3.0: Complete rewrite to fix ESM import errors
 * 
 * Problem: mapbox-gl doesn't provide a default export in ESM mode
 * Solution: Use dynamic import with * as syntax and handle module structure
 */

import { logger } from "@/lib/utils/production-logger";

// Type definitions
/* eslint-disable @typescript-eslint/no-explicit-any -- mapbox-gl external library types require any for interop */
type MapboxMapConstructor = new (options: any) => any;
type MapboxMarkerConstructor = new (options?: any) => any;
type MapboxPopupConstructor = new (options?: any) => any;
type MapboxNavigationControlConstructor = new (options?: any) => any;
type MapboxLngLatBoundsConstructor = new (sw?: any, ne?: any) => any;
type MapboxLngLatConstructor = new (lng: number, lat: number) => any;

export interface MapboxGLInterface {
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
  private _container: any;
  constructor(options?: any) {
    this._container = options?.container;
    logger.debug('[mapbox-shim] Using mock Map - mapbox-gl not loaded');
  }
  on(_event: string, callback: Function) { 
    // Simulate load event for compatibility
    if (_event === 'load') {
      setTimeout(() => callback(), 100);
    }
    return this; 
  }
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
    Map: MockMap as unknown as MapboxGLInterface["Map"],
    Marker: MockMarker as unknown as MapboxGLInterface["Marker"],
    Popup: MockPopup as unknown as MapboxGLInterface["Popup"],
    NavigationControl: MockNavigationControl as unknown as MapboxGLInterface["NavigationControl"],
    LngLatBounds: MockLngLatBounds as unknown as MapboxGLInterface["LngLatBounds"],
    LngLat: MockLngLat as unknown as MapboxGLInterface["LngLat"],
  };
};

// State
let mapboxInstance: MapboxGLInterface | null = null;
let loadPromise: Promise<MapboxGLInterface> | null = null;
let cssLoaded = false;

// Load CSS dynamically
const loadMapboxCSS = (): void => {
  if (cssLoaded || typeof document === 'undefined') return;
  cssLoaded = true;
  
  // Check if CSS already exists
  if (document.querySelector('link[href*="mapbox-gl"]')) return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
  document.head.appendChild(link);
};

// Async loader function
const loadMapboxGL = async (): Promise<MapboxGLInterface> => {
  // Return cached instance
  if (mapboxInstance && mapboxInstance.Map !== MockMap) {
    return mapboxInstance;
  }

  // Load CSS first
  loadMapboxCSS();

  try {
    // CRITICAL FIX: Use namespace import instead of default
    // mapbox-gl exports all members directly, not as default
    const mapboxModule = await import('mapbox-gl');
    
    // Debug: log what we got
    logger.debug('[mapbox-shim] Module keys:', { keys: Object.keys(mapboxModule) });
    
    // Handle various possible module structures
    let resolved: unknown = null;
    
    // Try different resolution strategies
    if (mapboxModule && typeof mapboxModule === 'object') {
      const mod = mapboxModule as Record<string, unknown>;
      // Strategy 1: Direct module has Map
      if ('Map' in mod && typeof mod.Map === 'function') {
        resolved = mapboxModule;
      }
      // Strategy 2: Default export has Map
      else if (mod.default && typeof mod.default === 'object' && 'Map' in (mod.default as Record<string, unknown>)) {
        resolved = mod.default;
      }
      // Strategy 3: Nested default
      else if (mod.default && typeof mod.default === 'object' && 'default' in (mod.default as Record<string, unknown>)) {
        const nested = (mod.default as Record<string, unknown>).default;
        if (nested && typeof nested === 'object' && 'Map' in (nested as Record<string, unknown>)) {
          resolved = nested;
        }
      }
    }
    
    const res = resolved as Record<string, unknown> | null;
    if (res && res.Map) {
      logger.debug('[mapbox-shim] Successfully resolved mapbox-gl');
      
      // Create mutable wrapper with proper accessToken handling
      let _accessToken = '';
      
      const wrapper: MapboxGLInterface = {
        get accessToken() { 
          return _accessToken || String(res.accessToken || ''); 
        },
        set accessToken(value: string) {
          _accessToken = value;
          // Try to set on original module
          try { 
            if (res && typeof res === 'object') {
              res.accessToken = value;
            }
          } catch (e) {
            // Ignore if read-only
          }
        },
        Map: res.Map as MapboxGLInterface["Map"],
        Marker: (res.Marker || MockMarker) as unknown as MapboxGLInterface["Marker"],
        Popup: (res.Popup || MockPopup) as unknown as MapboxGLInterface["Popup"],
        NavigationControl: (res.NavigationControl || MockNavigationControl) as unknown as MapboxGLInterface["NavigationControl"],
        LngLatBounds: (res.LngLatBounds || MockLngLatBounds) as unknown as MapboxGLInterface["LngLatBounds"],
        LngLat: (res.LngLat || MockLngLat) as unknown as MapboxGLInterface["LngLat"],
      };
      
      // Copy additional properties safely
      if (res && typeof res === 'object') {
        Object.keys(res).forEach(key => {
          if (!(key in wrapper)) {
            try { 
              (wrapper as Record<string, unknown>)[key] = res[key]; 
            } catch (e) {
              // Ignore copy errors
            }
          }
        });
      }
      
      mapboxInstance = wrapper;
      return wrapper;
    } else {
      logger.warn('[mapbox-shim] Could not resolve Map from module');
    }
  } catch (error) {
    logger.error('[mapbox-shim] Failed to load mapbox-gl', error);
  }
  
  // Return mock as fallback
  logger.debug('[mapbox-shim] Using mock implementation');
  mapboxInstance = createMockMapbox();
  return mapboxInstance;
};

// Start loading immediately but don't block
if (typeof window !== 'undefined') {
  loadPromise = loadMapboxGL();
}

// Synchronous getter for compatibility (may return mock initially)
export const getMapboxGL = (): MapboxGLInterface => {
  return mapboxInstance || createMockMapbox();
};

// Async getter for guaranteed loaded mapbox
export const getMapboxGLAsync = async (): Promise<MapboxGLInterface> => {
  if (loadPromise) {
    return loadPromise;
  }
  return loadMapboxGL();
};

// Check if real mapbox is loaded (not mock)
export const isMapboxLoaded = (): boolean => {
  return mapboxInstance !== null && mapboxInstance.Map !== MockMap;
};

// Force reload
export const reloadMapbox = async (): Promise<MapboxGLInterface> => {
  mapboxInstance = null;
  loadPromise = loadMapboxGL();
  return loadPromise;
};

// Type export
export type MapboxGL = MapboxGLInterface;

// Default export as mock for immediate use, async for real
const defaultExport = createMockMapbox();
export default defaultExport;
export { mapboxInstance as mapboxgl };
