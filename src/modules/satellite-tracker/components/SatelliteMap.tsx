/**
 * PATCH 501: Satellite Map Component
 * Displays satellite position on interactive map
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SatelliteMapProps {
  satellite: {
    id: string;
    name: string;
    position?: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
  };
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({ satellite }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken] = useState(
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || ''
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapboxToken) {
      console.warn('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const initialPosition = satellite.position || { latitude: 0, longitude: 0 };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [initialPosition.longitude, initialPosition.latitude],
      zoom: 3,
      projection: 'globe' as any
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Enable fog and atmosphere
    map.current.on('style.load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });
      }
    });

    return () => {
      if (marker.current) marker.current.remove();
      if (map.current) map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !satellite.position) return;

    const { latitude, longitude, altitude } = satellite.position;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create custom marker element
    const el = document.createElement('div');
    el.className = 'satellite-marker';
    el.style.backgroundImage = 'url(/satellite-icon.svg)';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundSize = '100%';
    el.style.cursor = 'pointer';

    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-2">
        <h3 class="font-bold">${satellite.name}</h3>
        <p class="text-sm">Lat: ${latitude.toFixed(4)}°</p>
        <p class="text-sm">Lon: ${longitude.toFixed(4)}°</p>
        <p class="text-sm">Alt: ${altitude.toFixed(1)} km</p>
      </div>
    `);

    // Add marker
    marker.current = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map.current);

    // Fly to new position
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 4,
      duration: 1500
    });
  }, [satellite]);

  if (!mapboxToken) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-96 rounded-lg" />
      {satellite.position && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm">
          <div className="font-semibold mb-1">{satellite.name}</div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <div>Lat: {satellite.position.latitude.toFixed(6)}°</div>
            <div>Lon: {satellite.position.longitude.toFixed(6)}°</div>
            <div>Alt: {satellite.position.altitude.toFixed(2)} km</div>
          </div>
        </div>
      )}
    </div>
  );
};
