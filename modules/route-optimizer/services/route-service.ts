/**
 * Route Optimizer Service
 * PATCH 104.0
 */

import { supabase } from "../../../src/integrations/supabase/client";
import type { Route, RouteOptimizationRequest, Coordinates } from "../types";
import { generateRouteWaypoints, fetchRouteWeatherForecast } from "./weather-service";
import { generateAIRouteRecommendation } from "./ai-service";

/**
 * Fetch all routes
 */
export async function fetchRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching routes:", error);
    throw new Error(`Failed to fetch routes: ${error.message}`);
  }

  return (data as unknown as Route[]) || [];
}

/**
 * Fetch routes for a specific vessel
 */
export async function fetchVesselRoutes(vesselId: string): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("vessel_id", vesselId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vessel routes:", error);
    throw new Error(`Failed to fetch vessel routes: ${error.message}`);
  }

  return (data as unknown as Route[]) || [];
}

/**
 * Fetch a single route by ID
 */
export async function fetchRouteById(id: string): Promise<Route | null> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching route:", error);
    return null;
  }

  return data as unknown as Route;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(origin: Coordinates, destination: Coordinates): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
  const dLon = (destination.lng - origin.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * (Math.PI / 180)) *
      Math.cos(destination.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate fuel consumption based on distance and vessel characteristics
 */
function estimateFuel(distanceNm: number, vesselSpeed = 15): number {
  // Simplified fuel estimation: ~0.055 tons per nautical mile at 15 knots
  const fuelPerNm = 0.055;
  return Math.round(distanceNm * fuelPerNm * 10) / 10;
}

/**
 * Optimize a route with AI recommendations
 */
export async function optimizeRoute(
  request: RouteOptimizationRequest
): Promise<Route> {
  // Geocode origin and destination (simplified - in production use Mapbox Geocoding API)
  const originCoords: Coordinates = { lat: 0, lng: 0 }; // Placeholder
  const destCoords: Coordinates = { lat: 0, lng: 0 }; // Placeholder

  // Calculate distance
  const distance = calculateDistance(originCoords, destCoords);

  // Generate waypoints for weather forecast
  const waypoints = generateRouteWaypoints(originCoords, destCoords, 5);

  // Fetch weather forecast
  const weatherForecast = await fetchRouteWeatherForecast(waypoints);

  // Generate route geometry (GeoJSON LineString)
  const routeGeometry = {
    type: "LineString" as const,
    coordinates: waypoints.map((w) => [w.lng, w.lat] as [number, number]),
  };

  // Estimate fuel
  const fuelEstimate = estimateFuel(distance, request.preferred_speed);

  // Calculate estimated arrival
  const speed = request.preferred_speed || 15;
  const travelTimeHours = distance / speed;
  const departureDate = request.departure_date
    ? new Date(request.departure_date)
    : new Date();
  const arrivalDate = new Date(
    departureDate.getTime() + travelTimeHours * 60 * 60 * 1000
  );

  // Generate AI recommendation
  const aiRecommendation = await generateAIRouteRecommendation({
    origin: request.origin,
    destination: request.destination,
    distance,
    weatherForecast,
    fuelEstimate,
    estimatedDuration: travelTimeHours,
  });

  // Create route in database
  const { data, error } = await supabase
    .from("routes")
    .insert([
      {
        vessel_id: request.vessel_id,
        origin: request.origin,
        origin_coordinates: originCoords,
        destination: request.destination,
        destination_coordinates: destCoords,
        planned_departure: departureDate.toISOString(),
        estimated_arrival: arrivalDate.toISOString(),
        status: "planned",
        distance_nm: distance,
        fuel_estimate: fuelEstimate,
        weather_forecast: { waypoints: weatherForecast },
        route_geometry: routeGeometry,
        ai_recommendation: aiRecommendation,
      } as any,
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating route:", error);
    throw new Error(`Failed to create route: ${error.message}`);
  }

  return data as unknown as Route;
}

/**
 * Update route status
 */
export async function updateRouteStatus(
  routeId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("routes")
    .update({ status } as any)
    .eq("id", routeId);

  if (error) {
    console.error("Error updating route status:", error);
    throw new Error(`Failed to update route status: ${error.message}`);
  }
}

/**
 * Delete a route
 */
export async function deleteRoute(routeId: string): Promise<void> {
  const { error } = await supabase.from("routes").delete().eq("id", routeId);

  if (error) {
    console.error("Error deleting route:", error);
    throw new Error(`Failed to delete route: ${error.message}`);
  }
}
