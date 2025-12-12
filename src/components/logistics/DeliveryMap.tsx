import { useEffect, useRef, useState, useCallback } from "react";;
import React, { useEffect, useRef, useState } from "react";
import { loadMapboxGL } from "@/lib/performance/heavy-libs-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Package } from "lucide-react";
import { Skeleton } from "@/components/unified/Skeletons.unified";

// Set your Mapbox access token (should be in environment variables)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

if (!MAPBOX_TOKEN) {
}

interface DeliveryLocation {
  id: string;
  shipment_number: string;
  origin: string;
  destination: string;
  status: "pending" | "in_transit" | "delivered" | "delayed";
  coordinates: {
    origin: [number, number]; // [lng, lat]
    destination: [number, number];
    current?: [number, number];
  };
  estimated_arrival?: string;
}

interface DeliveryMapProps {
  deliveries: DeliveryLocation[];
}

export const DeliveryMap = memo(function({ deliveries }: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        if (!mounted || !mapContainer.current) return;
        
        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [-50, -10],
          zoom: 3,
        };

        map.current = mapInstance;
        mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

        mapInstance.on("load", () => {
          if (mounted) {
            setIsLoading(false);
            addDeliveryMarkers();
          }
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        console.error("Error initializing map:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addDeliveryMarkers();
    }
  }, [deliveries]);

  const addDeliveryMarkers = () => {
    if (!map.current || !mapboxRef.current) return;
    const mapboxgl = mapboxRef.current;

    // Clear existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach(marker => marker.remove());

    // Add markers for each delivery
    deliveries.forEach((delivery) => {
      if (!map.current) return;

      // Origin marker
      const originEl = document.createElement("div");
      originEl.className = "delivery-marker origin";
      originEl.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      new mapboxgl.Marker(originEl)
        .setLngLat(delivery.coordinates.origin)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${delivery.origin}</h3>
              <p class="text-sm">Origin - ${delivery.shipment_number}</p>
            </div>`
          )
        )
        .addTo(map.current);

      // Destination marker
      const destEl = document.createElement("div");
      destEl.className = "delivery-marker destination";
      destEl.innerHTML = `
        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      new mapboxgl.Marker(destEl)
        .setLngLat(delivery.coordinates.destination)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-bold">${delivery.destination}</h3>
              <p class="text-sm">Destination - ${delivery.shipment_number}</p>
            </div>`
          )
        )
        .addTo(map.current);

      // Current location marker (if in transit)
      if (delivery.coordinates.current && delivery.status === "in_transit") {
        const currentEl = document.createElement("div");
        currentEl.className = "delivery-marker current";
        currentEl.innerHTML = `
          <div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        `;

        new mapboxgl.Marker(currentEl)
          .setLngLat(delivery.coordinates.current)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-bold">Current Location</h3>
                <p class="text-sm">${delivery.shipment_number}</p>
                <p class="text-xs text-gray-500">Status: ${delivery.status}</p>
              </div>`
            )
          )
          .addTo(map.current);
      }

      // Draw line between origin and destination
      if (map.current.getLayer(`route-${delivery.id}`)) {
        map.current.removeLayer(`route-${delivery.id}`);
        map.current.removeSource(`route-${delivery.id}`);
      }

      map.current.addSource(`route-${delivery.id}`, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [delivery.coordinates.origin, delivery.coordinates.destination],
          },
        },
      });

      map.current.addLayer({
        id: `route-${delivery.id}`,
        type: "line",
        source: `route-${delivery.id}`,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": delivery.status === "delivered" ? "#22c55e" : "#3b82f6",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "delivered":
      return "bg-green-500";
    case "in_transit":
      return "bg-blue-500";
    case "delayed":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Tracking Map
        </CardTitle>
        <CardDescription>Real-time visualization of shipments and deliveries</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-20">
              <Skeleton className="w-full h-[600px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Loading map...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="h-[600px] w-full" />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10">
            <h4 className="font-semibold mb-2 text-sm">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Origin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Delayed</span>
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {deliveries.filter(d => d.status === "in_transit").length}
                </div>
                <div className="text-xs text-gray-500">In Transit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {deliveries.filter(d => d.status === "delivered").length}
                </div>
                <div className="text-xs text-gray-500">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
