/**
 * Globe2D Component
 * Fallback 2D globe visualization when 3D is not available
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlobeMarker {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  pulse?: boolean;
}

interface Globe2DProps {
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  autoRotate?: boolean;
  className?: string;
}

export const Globe2D: React.FC<Globe2DProps> = ({
  markers,
  onMarkerClick,
  autoRotate = true,
  className
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Convert lat/lng to 2D position
  const latLngToPosition = (lat: number, lng: number) => {
    const adjustedLng = (lng + rotation) % 360;
    const x = 50 + (adjustedLng / 360) * 100;
    const y = 50 - (lat / 180) * 100;
    return { x: x % 100, y };
  };

  return (
    <div className={cn(
      "relative w-full aspect-square max-w-md mx-auto rounded-full overflow-hidden",
      "bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900",
      "border-4 border-primary/30 shadow-2xl shadow-primary/20",
      className
    )}>
      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const y = 50 - (lat / 90) * 50;
          return (
            <line
              key={`lat-${lat}`}
              x1="0%"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
          );
        })}
        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map(lng => {
          const x = (lng / 180) * 100;
          return (
            <React.Fragment key={`lng-${lng}`}>
              <line
                x1={`${x}%`}
                y1="0%"
                x2={`${x}%`}
                y2="100%"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
              <line
                x1={`${100-x}%`}
                y1="0%"
                x2={`${100-x}%`}
                y2="100%"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            </React.Fragment>
          );
        })}
        {/* Equator */}
        <line
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
        />
      </svg>

      {/* Continents Placeholder */}
      <div className="absolute inset-8 rounded-full border border-primary/20" />

      {/* Markers */}
      {markers.map((marker, index) => {
        const pos = latLngToPosition(marker.lat, marker.lng);
        const isVisible = pos.x > 10 && pos.x < 90;
        
        return (
          <button
            key={marker.id || index}
            className={cn(
              "absolute w-3 h-3 rounded-full transition-all duration-300",
              "hover:scale-150 hover:z-10 cursor-pointer",
              isVisible ? "opacity-100" : "opacity-30"
            )}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: marker.color || 'hsl(var(--primary))',
              boxShadow: `0 0 10px ${marker.color || 'hsl(var(--primary))'}`,
            }}
            onClick={() => onMarkerClick?.(marker)}
            title={marker.label}
          >
            {marker.pulse && (
              <span 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: marker.color || 'hsl(var(--primary))', opacity: 0.5 }}
              />
            )}
          </button>
        );
      })}

      {/* Center Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default Globe2D;
