import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface TravelMapProps {
  locations: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    type: "hotel" | "airport";
  }>;
  className?: string;
}

export const TravelMap: React.FC<TravelMapProps> = ({ locations, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get token from environment
    const initializeMap = async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        
        if (!token) {
          console.warn('Mapbox token not configured');
          return;
        }
        
        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: locations.length > 0 ? locations[0].coordinates : [-74.5, 40],
          zoom: 10,
          projection: "mercator"
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add markers for each location
        locations.forEach(location => {
          const el = document.createElement("div");
          el.className = location.type === "hotel" ? "hotel-marker" : "airport-marker";
          el.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${location.type === "hotel" ? "#3b82f6" : "#f59e0b"};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          `;

          new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="font-semibold">${location.name}</div>`)
            )
            .addTo(map.current!);
        });

        // Fit map to show all locations
        if (locations.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          locations.forEach(location => bounds.extend(location.coordinates));
          map.current.fitBounds(bounds, { padding: 50 });
        }

      } catch (error) {
        // Fallback without map
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [locations]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};