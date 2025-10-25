/**
 * Route Detail Component with Map and AI Recommendations
 * PATCH 104.0
 */

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Fuel, Calendar, TrendingUp, X, Cloud } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Route } from "../types";
import { format } from "date-fns";

interface RouteDetailProps {
  route: Route;
  onClose: () => void;
}

export function RouteDetail({ route, onClose }: RouteDetailProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token =
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 0],
      zoom: 2,
    });

    // Add markers for origin and destination
    if (route.origin_coordinates) {
      new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([route.origin_coordinates.lng, route.origin_coordinates.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`<strong>Origin:</strong> ${route.origin}`)
        )
        .addTo(map);
    }

    if (route.destination_coordinates) {
      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([
          route.destination_coordinates.lng,
          route.destination_coordinates.lat,
        ])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>Destination:</strong> ${route.destination}`
          )
        )
        .addTo(map);
    }

    // Draw route line if geometry exists
    if (route.route_geometry) {
      map.on("load", () => {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.route_geometry!,
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 3,
          },
        });

        // Fit bounds to show entire route
        const coordinates = route.route_geometry!.coordinates;
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
        );

        map.fitBounds(bounds, { padding: 50 });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [route]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "planned":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "active":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "completed":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    case "delayed":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {route.origin} → {route.destination}
              </h3>
              <Badge variant="outline" className={getStatusColor(route.status)}>
                {route.status}
              </Badge>
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {route.distance_nm && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>Distance</span>
                  </div>
                  <p className="text-white font-bold">
                    {Math.round(route.distance_nm)} nm
                  </p>
                </div>
              )}

              {route.fuel_estimate && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Fuel className="h-4 w-4" />
                    <span>Fuel Estimate</span>
                  </div>
                  <p className="text-white font-bold">{route.fuel_estimate} tons</p>
                </div>
              )}

              {route.planned_departure && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Departure</span>
                  </div>
                  <p className="text-white font-bold">
                    {format(new Date(route.planned_departure), "MMM d, yyyy")}
                  </p>
                </div>
              )}

              {route.estimated_arrival && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>ETA</span>
                  </div>
                  <p className="text-white font-bold">
                    {format(new Date(route.estimated_arrival), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-white font-semibold mb-2">Route Map</h4>
            <div
              ref={mapContainerRef}
              className="h-96 rounded-lg border border-gray-700"
            />
          </div>

          {/* AI Recommendation */}
          {route.ai_recommendation && (
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                AI Route Recommendation
              </h4>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-line">
                  {route.ai_recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Weather Forecast */}
          {route.weather_forecast?.waypoints && route.weather_forecast.waypoints.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-400" />
                Weather Forecast Along Route
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {route.weather_forecast.waypoints.map((waypoint, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-3 text-sm"
                  >
                    <p className="text-gray-400 mb-2">
                      Waypoint {index + 1} ({waypoint.distance_from_origin} nm)
                    </p>
                    <div className="space-y-1 text-gray-300">
                      <p>Temp: {waypoint.conditions.temperature}°C</p>
                      <p>Wind: {waypoint.conditions.wind_speed} m/s</p>
                      <p className="capitalize">{waypoint.conditions.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {route.notes && (
            <div>
              <h4 className="text-white font-semibold mb-2">Notes</h4>
              <p className="text-gray-300">{route.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
