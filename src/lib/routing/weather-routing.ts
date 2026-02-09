/**
 * Weather Routing Module
 * AI-powered route optimization based on weather forecasts and risk avoidance
 */

import { supabase } from "@/integrations/supabase/client";
import { getWeatherData, NormalizedWeatherData } from "@/services/weather";
import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";

// ===============================
// Types
// ===============================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Waypoint extends Coordinates {
  name?: string;
  eta?: Date;
}

export interface RouteRequest {
  origin: Waypoint;
  destination: Waypoint;
  vesselSpeed: number; // knots
  departureTime: Date;
  avoidanceSettings?: {
    maxWindSpeed: number; // knots
    maxWaveHeight: number; // meters
    avoidPiracyZones: boolean;
  };
}

export interface WeatherPoint {
  position: Coordinates;
  eta: Date;
  weather: {
    windSpeed: number;
    windDirection: number;
    waveHeight?: number;
    pressure?: number;
    visibility?: number;
    description?: string;
  };
  risk: "low" | "medium" | "high" | "severe";
  riskScore: number;
}

export interface RouteSegment {
  from: Waypoint;
  to: Waypoint;
  distance: number; // nautical miles
  duration: number; // hours
  bearing: number; // degrees
  weather: WeatherPoint;
}

export interface AlternativeRoute {
  id: string;
  name: string;
  type: "direct" | "weather_avoidance" | "fuel_optimized" | "time_optimized";
  waypoints: Waypoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  eta: Date;
  fuelEstimate: number; // tons
  riskScore: number;
  recommendation: string;
  weatherRisks: Array<{
    position: Coordinates;
    type: string;
    severity: string;
    description: string;
  }>;
}

export interface HazardZone {
  id: string;
  name: string;
  type: "weather" | "piracy" | "traffic";
  polygon: Coordinates[];
  severity: "low" | "medium" | "high";
}

export interface WeatherRoutingResult {
  recommendedRoute: AlternativeRoute;
  alternatives: AlternativeRoute[];
  weatherForecast: WeatherPoint[];
  hazardZones: HazardZone[];
  generatedAt: Date;
}

// ===============================
// Configuration
// ===============================

const DEFAULT_AVOIDANCE = {
  maxWindSpeed: 35, // knots
  maxWaveHeight: 4, // meters
  avoidPiracyZones: true,
};

// Known piracy risk zones (simplified polygons)
const PIRACY_ZONES = [
  {
    id: "gulf-of-aden",
    name: "Golfo de Áden",
    polygon: [
      { lat: 15, lon: 45 },
      { lat: 15, lon: 55 },
      { lat: 10, lon: 55 },
      { lat: 10, lon: 45 },
    ],
  },
  {
    id: "strait-of-malacca",
    name: "Estreito de Malaca",
    polygon: [
      { lat: 6, lon: 99 },
      { lat: 6, lon: 104 },
      { lat: 1, lon: 104 },
      { lat: 1, lon: 99 },
    ],
  },
  {
    id: "west-africa",
    name: "Costa Oeste Africana",
    polygon: [
      { lat: 8, lon: -5 },
      { lat: 8, lon: 12 },
      { lat: 0, lon: 12 },
      { lat: 0, lon: -5 },
    ],
  },
];

// ===============================
// Utility Functions
// ===============================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing between two coordinates
 */
function calculateBearing(from: Coordinates, to: Coordinates): number {
  const dLon = toRad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Calculate intermediate point between two coordinates
 */
function interpolatePoint(from: Coordinates, to: Coordinates, fraction: number): Coordinates {
  const lat = from.lat + (to.lat - from.lat) * fraction;
  const lon = from.lon + (to.lon - from.lon) * fraction;
  return { lat, lon };
}

/**
 * Check if point is inside polygon
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].lat > point.lat !== polygon[j].lat > point.lat &&
      point.lon <
        ((polygon[j].lon - polygon[i].lon) * (point.lat - polygon[i].lat)) /
          (polygon[j].lat - polygon[i].lat) +
          polygon[i].lon
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ===============================
// Weather Fetching
// ===============================

/**
 * Fetch weather forecast for route waypoints
 */
async function fetchWeatherForRoute(
  waypoints: Waypoint[],
  departureTime: Date,
  vesselSpeed: number
): Promise<WeatherPoint[]> {
  const weatherPoints: WeatherPoint[] = [];
  let currentTime = new Date(departureTime);

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    
    try {
      const weather = await getWeatherData(wp.lat, wp.lon);
      
      const riskScore = calculateWeatherRisk(weather);
      
      weatherPoints.push({
        position: { lat: wp.lat, lon: wp.lon },
        eta: new Date(currentTime),
        weather: {
          windSpeed: weather.windSpeedKnots,
          windDirection: weather.windDirection,
          waveHeight: weather.waveHeight,
          pressure: weather.pressure,
          visibility: weather.visibility ? weather.visibility / 1000 : undefined,
          description: weather.description,
        },
        risk: getRiskLevel(riskScore),
        riskScore,
      });

      // Calculate time to next waypoint
      if (i < waypoints.length - 1) {
        const distance = calculateDistance(wp, waypoints[i + 1]);
        const hours = distance / vesselSpeed;
        currentTime = new Date(currentTime.getTime() + hours * 3600000);
      }
    } catch (err) {
      logger.warn(`[WeatherRouting] Failed to fetch weather for waypoint ${i}`, { error: err });
    }
  }

  return weatherPoints;
}

/**
 * Calculate weather risk score (0-100)
 */
function calculateWeatherRisk(weather: NormalizedWeatherData): number {
  let score = 0;

  // Wind risk (0-40 points)
  if (weather.windSpeedKnots > 50) score += 40;
  else if (weather.windSpeedKnots > 40) score += 30;
  else if (weather.windSpeedKnots > 30) score += 20;
  else if (weather.windSpeedKnots > 20) score += 10;

  // Wave risk (0-40 points)
  if (weather.waveHeight !== undefined) {
    if (weather.waveHeight > 8) score += 40;
    else if (weather.waveHeight > 6) score += 30;
    else if (weather.waveHeight > 4) score += 20;
    else if (weather.waveHeight > 2) score += 10;
  }

  // Pressure risk (0-10 points)
  if (weather.pressure !== undefined && weather.pressure < 990) {
    score += 10;
  }

  // Visibility risk (0-10 points)
  if (weather.visibility !== undefined && weather.visibility < 2000) {
    score += 10;
  }

  return Math.min(100, score);
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "severe" {
  if (score >= 60) return "severe";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}

// ===============================
// Route Generation
// ===============================

/**
 * Generate intermediate waypoints between origin and destination
 */
function generateRouteWaypoints(
  origin: Waypoint,
  destination: Waypoint,
  numPoints: number = 5
): Waypoint[] {
  const waypoints: Waypoint[] = [origin];

  for (let i = 1; i < numPoints; i++) {
    const fraction = i / numPoints;
    const point = interpolatePoint(origin, destination, fraction);
    waypoints.push({
      ...point,
      name: `Waypoint ${i}`,
    });
  }

  waypoints.push(destination);
  return waypoints;
}

/**
 * Generate alternative route avoiding hazards
 */
function generateAvoidanceRoute(
  origin: Waypoint,
  destination: Waypoint,
  hazardPoints: Coordinates[],
  offset: number = 2 // degrees
): Waypoint[] {
  const waypoints: Waypoint[] = [origin];
  const directBearing = calculateBearing(origin, destination);

  // Add offset waypoints to avoid hazards
  if (hazardPoints.length > 0) {
    const midpoint = interpolatePoint(origin, destination, 0.5);
    
    // Calculate perpendicular offset
    const offsetBearing = (directBearing + 90) % 360;
    const offsetPoint: Waypoint = {
      lat: midpoint.lat + offset * Math.cos(toRad(offsetBearing)),
      lon: midpoint.lon + offset * Math.sin(toRad(offsetBearing)),
      name: "Desvio Climático",
    };

    waypoints.push(offsetPoint);
  }

  waypoints.push(destination);
  return waypoints;
}

/**
 * Build route segments from waypoints
 */
function buildRouteSegments(
  waypoints: Waypoint[],
  weatherPoints: WeatherPoint[],
  vesselSpeed: number
): RouteSegment[] {
  const segments: RouteSegment[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const distance = calculateDistance(from, to);
    const duration = distance / vesselSpeed;
    const bearing = calculateBearing(from, to);
    const weather = weatherPoints[i] || weatherPoints[weatherPoints.length - 1];

    segments.push({
      from,
      to,
      distance,
      duration,
      bearing,
      weather,
    });
  }

  return segments;
}

// ===============================
// Main Routing Function
// ===============================

/**
 * Calculate weather-optimized routes
 */
export async function calculateWeatherRouting(
  request: RouteRequest
): Promise<WeatherRoutingResult> {
  const avoidance = { ...DEFAULT_AVOIDANCE, ...request.avoidanceSettings };

  logger.debug("[WeatherRouting] Calculating routes...");

  // Generate direct route waypoints
  const directWaypoints = generateRouteWaypoints(request.origin, request.destination, 6);
  
  // Fetch weather for direct route
  const directWeather = await fetchWeatherForRoute(
    directWaypoints,
    request.departureTime,
    request.vesselSpeed
  );

  // Identify hazard points
  const hazardPoints = directWeather
    .filter((wp) => wp.risk === "high" || wp.risk === "severe")
    .map((wp) => wp.position);

  // Check for piracy zones
  const piracyHazards = PIRACY_ZONES.filter(
    (zone) =>
      avoidance.avoidPiracyZones &&
      directWaypoints.some((wp) => isPointInPolygon(wp, zone.polygon))
  );

  // Generate alternative routes
  const routes: AlternativeRoute[] = [];

  // 1. Direct Route
  const directDistance = directWaypoints.reduce((sum, wp, i) => {
    if (i === 0) return 0;
    return sum + calculateDistance(directWaypoints[i - 1], wp);
  }, 0);

  const directDuration = directDistance / request.vesselSpeed;
  const directRiskScore = directWeather.reduce((sum, wp) => sum + wp.riskScore, 0) / directWeather.length;

  routes.push({
    id: "direct",
    name: "Rota Direta",
    type: "direct",
    waypoints: directWaypoints,
    segments: buildRouteSegments(directWaypoints, directWeather, request.vesselSpeed),
    totalDistance: directDistance,
    totalDuration: directDuration,
    eta: new Date(request.departureTime.getTime() + directDuration * 3600000),
    fuelEstimate: directDistance * 0.03, // Simplified fuel calculation
    riskScore: directRiskScore,
    recommendation:
      directRiskScore > 40
        ? "⚠️ Risco elevado - considere rota alternativa"
        : "✓ Rota viável",
    weatherRisks: directWeather
      .filter((wp) => wp.risk !== "low")
      .map((wp) => ({
        position: wp.position,
        type: "weather",
        severity: wp.risk,
        description: wp.weather.description || `Vento ${wp.weather.windSpeed.toFixed(0)} nós`,
      })),
  });

  // 2. Weather Avoidance Route (if hazards exist)
  if (hazardPoints.length > 0 || piracyHazards.length > 0) {
    const avoidanceWaypoints = generateAvoidanceRoute(
      request.origin,
      request.destination,
      hazardPoints,
      3
    );
    
    const avoidanceWeather = await fetchWeatherForRoute(
      avoidanceWaypoints,
      request.departureTime,
      request.vesselSpeed
    );

    const avoidanceDistance = avoidanceWaypoints.reduce((sum, wp, i) => {
      if (i === 0) return 0;
      return sum + calculateDistance(avoidanceWaypoints[i - 1], wp);
    }, 0);

    const avoidanceDuration = avoidanceDistance / request.vesselSpeed;
    const avoidanceRiskScore =
      avoidanceWeather.reduce((sum, wp) => sum + wp.riskScore, 0) / avoidanceWeather.length;

    routes.push({
      id: "weather-avoidance",
      name: "Desvio Climático",
      type: "weather_avoidance",
      waypoints: avoidanceWaypoints,
      segments: buildRouteSegments(avoidanceWaypoints, avoidanceWeather, request.vesselSpeed),
      totalDistance: avoidanceDistance,
      totalDuration: avoidanceDuration,
      eta: new Date(request.departureTime.getTime() + avoidanceDuration * 3600000),
      fuelEstimate: avoidanceDistance * 0.03,
      riskScore: avoidanceRiskScore,
      recommendation:
        avoidanceRiskScore < directRiskScore
          ? "✓ Recomendada - menor risco"
          : "Rota alternativa disponível",
      weatherRisks: avoidanceWeather
        .filter((wp) => wp.risk !== "low")
        .map((wp) => ({
          position: wp.position,
          type: "weather",
          severity: wp.risk,
          description: wp.weather.description || `Vento ${wp.weather.windSpeed.toFixed(0)} nós`,
        })),
    });
  }

  // 3. Fuel Optimized (slower speed)
  const fuelOptimizedSpeed = request.vesselSpeed * 0.85;
  const fuelOptimizedDuration = directDistance / fuelOptimizedSpeed;
  
  routes.push({
    id: "fuel-optimized",
    name: "Economia de Combustível",
    type: "fuel_optimized",
    waypoints: directWaypoints,
    segments: buildRouteSegments(directWaypoints, directWeather, fuelOptimizedSpeed),
    totalDistance: directDistance,
    totalDuration: fuelOptimizedDuration,
    eta: new Date(request.departureTime.getTime() + fuelOptimizedDuration * 3600000),
    fuelEstimate: directDistance * 0.025, // Less fuel at slower speed
    riskScore: directRiskScore,
    recommendation: "💰 Menor consumo de combustível (+15% tempo)",
    weatherRisks: [],
  });

  // Sort by risk score (lower is better)
  routes.sort((a, b) => a.riskScore - b.riskScore);

  // Build hazard zones
  const hazardZones: HazardZone[] = piracyHazards.map((zone) => ({
    id: zone.id,
    name: zone.name,
    type: "piracy" as const,
    polygon: zone.polygon,
    severity: "high" as const,
  }));

  // Add weather hazard zones
  hazardPoints.forEach((point, i) => {
    hazardZones.push({
      id: `weather-${i}`,
      name: `Zona de Mau Tempo ${i + 1}`,
      type: "weather" as const,
      polygon: [
        { lat: point.lat - 1, lon: point.lon - 1 },
        { lat: point.lat - 1, lon: point.lon + 1 },
        { lat: point.lat + 1, lon: point.lon + 1 },
        { lat: point.lat + 1, lon: point.lon - 1 },
      ],
      severity: "medium" as const,
    });
  });

  logger.debug(`[WeatherRouting] Generated ${routes.length} routes`);

  return {
    recommendedRoute: routes[0],
    alternatives: routes.slice(1),
    weatherForecast: directWeather,
    hazardZones,
    generatedAt: new Date(),
  };
}

/**
 * Store route calculation in database
 */
export async function storeRouteCalculation(
  result: WeatherRoutingResult,
  vesselId?: string
): Promise<void> {
  try {
    await (supabase.from as Function)("voyage_routes").insert({
      vessel_id: vesselId,
      origin: result.recommendedRoute.waypoints[0],
      destination: result.recommendedRoute.waypoints[result.recommendedRoute.waypoints.length - 1],
      route_data: result,
      recommended_route_id: result.recommendedRoute.id,
      alternatives_count: result.alternatives.length,
      hazards_count: result.hazardZones.length,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    logger.error("[WeatherRouting] Failed to store route:", err);
    Sentry.captureException(err);
  }
}

export default {
  calculateWeatherRouting,
  storeRouteCalculation,
  calculateDistance,
  calculateBearing,
};
