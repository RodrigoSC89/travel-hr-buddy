/**
 * WindyMapLayer Component - Patch 143.1
 * Reusable Windy map layer component with dynamic overlay switching
 */

import React from "react";
import { WindyMap, type WindyOverlay } from "./WindyMap";

interface WindyMapLayerProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: number;
  defaultOverlay?: WindyOverlay;
}

/**
 * Componentized Windy Map Layer for reuse across the application
 * 
 * Features:
 * - Lazy loading for performance
 * - Dynamic overlay switching
 * - Customizable position and zoom
 * - Optional controls
 * 
 * Usage:
 * ```tsx
 * <WindyMapLayer
 *   latitude={-15}
 *   longitude={-45}
 *   zoom={5}
 *   height={600}
 *   defaultOverlay="wind"
 * />
 * ```
 */
export const WindyMapLayer: React.FC<WindyMapLayerProps> = ({
  latitude = -15,
  longitude = -45,
  zoom = 5,
  height = 500,
  defaultOverlay = 'wind',
}) => {
  const [currentOverlay, setCurrentOverlay] = React.useState<WindyOverlay>(defaultOverlay);

  const handleOverlayChange = (overlay: WindyOverlay) => {
    setCurrentOverlay(overlay);
  };

  return (
    <WindyMap
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      overlay={currentOverlay}
      height={height}
      onOverlayChange={handleOverlayChange}
    />
  );
};

/**
 * Preset map layers for common maritime regions
 */
export const BrazilianCoastMap: React.FC<{ height?: number }> = ({ height = 500 }) => (
  <WindyMapLayer
    latitude={-15}
    longitude={-45}
    zoom={4}
    height={height}
    defaultOverlay="waves"
  />
);

export const CaribbeanMap: React.FC<{ height?: number }> = ({ height = 500 }) => (
  <WindyMapLayer
    latitude={18}
    longitude={-75}
    zoom={5}
    height={height}
    defaultOverlay="wind"
  />
);

export const NorthAtlanticMap: React.FC<{ height?: number }> = ({ height = 500 }) => (
  <WindyMapLayer
    latitude={40}
    longitude={-30}
    zoom={4}
    height={height}
    defaultOverlay="waves"
  />
);
