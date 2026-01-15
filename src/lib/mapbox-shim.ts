/**
 * Mapbox GL Shim
 * Provides a consistent import pattern for mapbox-gl across the codebase
 * PATCH WINDY-2.4: Fixed ESM/CJS compatibility and constructor issues
 */

import * as mapboxglModule from 'mapbox-gl';
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

// Get the actual mapbox-gl module, handling both ESM and CJS exports
const resolveMapboxGL = (): any => {
  const mod = mapboxglModule as any;
  
  // Check for default export first (common in ESM)
  if (mod.default && typeof mod.default === 'object' && mod.default.Map) {
    return mod.default;
  }
  
  // Check if the module itself has Map (CJS pattern)
  if (mod.Map && typeof mod.Map === 'function') {
    return mod;
  }
  
  // Try accessing nested default
  if (mod.default?.default && mod.default.default.Map) {
    return mod.default.default;
  }
  
  // Return module as-is and hope for the best
  return mod;
};

const mapboxglOriginal = resolveMapboxGL();

// Create mock classes for when mapbox-gl is not available
class MockMap {
  private container: HTMLElement | null = null;
  
  constructor(options?: any) {
    console.warn('[mapbox-shim] Using mock Map - mapbox-gl not loaded properly');
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

// Create a mutable wrapper around mapbox-gl to allow setting accessToken
const createMutableMapbox = (): MapboxGLInterface => {
  // Safety check
  if (!mapboxglOriginal || typeof mapboxglOriginal !== 'object') {
    console.error('[mapbox-shim] mapbox-gl not loaded properly');
    return {
      accessToken: '',
      Map: MockMap as any,
      Marker: MockMarker as any,
      Popup: MockPopup as any,
      NavigationControl: MockNavigationControl as any,
      LngLatBounds: MockLngLatBounds as any,
      LngLat: MockLngLat as any,
    };
  }

  // Check if Map constructor is available
  if (!mapboxglOriginal.Map || typeof mapboxglOriginal.Map !== 'function') {
    console.error('[mapbox-shim] mapbox-gl.Map is not a constructor');
    return {
      accessToken: '',
      Map: MockMap as any,
      Marker: mapboxglOriginal.Marker || MockMarker as any,
      Popup: mapboxglOriginal.Popup || MockPopup as any,
      NavigationControl: mapboxglOriginal.NavigationControl || MockNavigationControl as any,
      LngLatBounds: mapboxglOriginal.LngLatBounds || MockLngLatBounds as any,
      LngLat: mapboxglOriginal.LngLat || MockLngLat as any,
    };
  }

  // Check if we can use the original directly
  const isFrozen = Object.isFrozen(mapboxglOriginal);
  
  if (!isFrozen) {
    return mapboxglOriginal as MapboxGLInterface;
  }

  // Create a mutable wrapper for frozen modules
  let _accessToken = '';
  
  const mapboxMutable: MapboxGLInterface = {
    get accessToken() { 
      return _accessToken || mapboxglOriginal.accessToken || '';
    },
    set accessToken(value: string) {
      _accessToken = value;
      try {
        mapboxglOriginal.accessToken = value;
      } catch {
        // Ignore if frozen - we use our internal token
      }
    },
    Map: mapboxglOriginal.Map,
    Marker: mapboxglOriginal.Marker,
    Popup: mapboxglOriginal.Popup,
    NavigationControl: mapboxglOriginal.NavigationControl,
    LngLatBounds: mapboxglOriginal.LngLatBounds,
    LngLat: mapboxglOriginal.LngLat,
  };
  
  // Copy all other properties
  Object.keys(mapboxglOriginal).forEach(key => {
    if (!(key in mapboxMutable)) {
      try {
        (mapboxMutable as any)[key] = (mapboxglOriginal as any)[key];
      } catch {
        // Skip non-copyable properties
      }
    }
  });

  return mapboxMutable;
};

const mapboxgl = createMutableMapbox();

// Type export for proper typing
export type MapboxGL = MapboxGLInterface;
export default mapboxgl;
export { mapboxgl };
