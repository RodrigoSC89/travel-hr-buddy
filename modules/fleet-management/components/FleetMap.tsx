/**
 * Fleet Map Component with Mapbox
 * PATCH 103.0
 */

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Vessel } from "../types";

interface FleetMapProps {
  vessels: Vessel[];
  selectedVesselId?: string;
  onVesselSelect?: (vessel: Vessel) => void;
  height?: string;
}

export function FleetMap({
  vessels,
  selectedVesselId,
  onVesselSelect,
  height = "500px",
}: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const token =
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
      import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      setMapError("Mapbox token not configured");
      return;
    }

    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-30, 0], // Atlantic Ocean center
        zoom: 2,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (error) {
      setMapError(`Failed to initialize map: ${error}`);
    }
  }, []);

  // Update markers when vessels change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    vessels.forEach((vessel) => {
      if (!vessel.last_known_position) return;

      const { lat, lng } = vessel.last_known_position;

      // Create marker color based on status
      const markerColor =
        vessel.status === "critical"
          ? "#ef4444"
          : vessel.status === "maintenance"
          ? "#f59e0b"
          : vessel.maintenance_status === "urgent"
          ? "#f97316"
          : vessel.maintenance_status === "critical"
          ? "#dc2626"
          : "#22c55e";

      // Create marker element
      const el = document.createElement("div");
      el.className = "vessel-marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = markerColor;
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      if (vessel.id === selectedVesselId) {
        el.style.border = "4px solid #3b82f6";
        el.style.boxShadow = "0 0 10px rgba(59, 130, 246, 0.8)";
      }

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vessel.name}</h3>
          <p style="margin: 4px 0; font-size: 12px;">IMO: ${vessel.imo_code}</p>
          <p style="margin: 4px 0; font-size: 12px;">Status: <span style="color: ${markerColor}">${vessel.status}</span></p>
          ${vessel.last_known_position.speed ? `<p style="margin: 4px 0; font-size: 12px;">Speed: ${vessel.last_known_position.speed} knots</p>` : ""}
          ${vessel.last_known_position.course ? `<p style="margin: 4px 0; font-size: 12px;">Course: ${vessel.last_known_position.course}°</p>` : ""}
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      // Add click handler
      el.addEventListener("click", () => {
        if (onVesselSelect) {
          onVesselSelect(vessel);
        }
      });

      markersRef.current.set(vessel.id, marker);
    });

    // Fit bounds to show all vessels
    if (vessels.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      vessels.forEach((vessel) => {
        if (vessel.last_known_position) {
          bounds.extend([
            vessel.last_known_position.lng,
            vessel.last_known_position.lat,
          ]);
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 8,
        });
      }
    }
  }, [vessels, selectedVesselId, onVesselSelect]);

  if (mapError) {
    return (
      <div
        className="flex items-center justify-center bg-gray-900 text-white rounded-lg border border-gray-700"
        style={{ height }}
      >
        <div className="text-center p-6">
          <p className="text-red-400 mb-2">Map Error</p>
          <p className="text-sm text-gray-400">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="rounded-lg overflow-hidden border border-gray-700"
      style={{ height }}
    />
  );
}
