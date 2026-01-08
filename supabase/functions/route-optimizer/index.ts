import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Port {
  code: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

interface RouteConstraints {
  max_draft?: number;
  avoid_eca?: boolean;
  avoid_piracy_zones?: boolean;
  prefer_sheltered?: boolean;
  max_wave_height?: number;
  arrival_window?: { earliest: string; latest: string };
  fuel_budget?: number;
}

interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
  eta?: string;
  distance_from_prev?: number;
  fuel_consumption?: number;
  weather_risk?: "low" | "medium" | "high";
}

interface OptimizedRoute {
  departure_port: Port;
  arrival_port: Port;
  waypoints: RouteWaypoint[];
  total_distance_nm: number;
  estimated_duration_hours: number;
  estimated_fuel_consumption: number;
  estimated_fuel_cost: number;
  co2_emissions_tons: number;
  weather_risk_overall: "low" | "medium" | "high";
  optimization_score: number;
  alternatives: any[];
}

// Major shipping routes and waypoints
const MAJOR_WAYPOINTS: Record<string, { lat: number; lng: number; name: string }> = {
  suez_north: { lat: 31.25, lng: 32.35, name: "Suez Canal North" },
  suez_south: { lat: 29.95, lng: 32.55, name: "Suez Canal South" },
  gibraltar: { lat: 36.0, lng: -5.5, name: "Strait of Gibraltar" },
  malacca: { lat: 2.0, lng: 102.5, name: "Strait of Malacca" },
  singapore: { lat: 1.27, lng: 103.8, name: "Singapore Strait" },
  panama_atlantic: { lat: 9.35, lng: -79.9, name: "Panama Atlantic" },
  panama_pacific: { lat: 8.95, lng: -79.55, name: "Panama Pacific" },
  cape_good_hope: { lat: -34.35, lng: 18.5, name: "Cape of Good Hope" },
  bab_el_mandeb: { lat: 12.5, lng: 43.3, name: "Bab el-Mandeb" },
  hormuz: { lat: 26.5, lng: 56.5, name: "Strait of Hormuz" },
};

// Piracy risk zones
const PIRACY_ZONES = [
  { lat: 5, lng: 48, radius: 500, name: "Gulf of Aden" },
  { lat: 2, lng: 105, radius: 200, name: "Malacca Strait" },
  { lat: 4, lng: 7, radius: 300, name: "Gulf of Guinea" },
];

// ECA zones (Emission Control Areas)
const ECA_ZONES = [
  { name: "North Sea", bounds: { north: 62, south: 48, east: 12, west: -5 } },
  { name: "Baltic Sea", bounds: { north: 66, south: 53, east: 30, west: 10 } },
  { name: "North America", bounds: { north: 50, south: 25, east: -60, west: -130 } },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...data } = await req.json();

    console.log(`[Route Optimizer] Action: ${action}`);

    switch (action) {
      case "optimize_route":
        return await optimizeRoute(supabase, data);
      
      case "calculate_eta":
        return await calculateETA(data);
      
      case "estimate_fuel":
        return await estimateFuel(data);
      
      case "get_weather_along_route":
        return await getWeatherAlongRoute(data.waypoints);
      
      case "check_compliance":
        return await checkRouteCompliance(data);
      
      case "compare_routes":
        return await compareRoutes(data.routes);
      
      case "get_port_info":
        return await getPortInfo(supabase, data.port_code);
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("[Route Optimizer] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function optimizeRoute(supabase: any, data: any): Promise<Response> {
  const {
    departure_port,
    arrival_port,
    vessel_id,
    constraints = {},
    speed_knots = 14,
    fuel_price_per_ton = 600,
  } = data;

  // Calculate base route
  const baseRoute = calculateGreatCircleRoute(departure_port, arrival_port);
  
  // Apply constraints and find optimal waypoints
  const optimizedWaypoints = await findOptimalWaypoints(
    departure_port,
    arrival_port,
    constraints
  );

  // Calculate distances
  let totalDistance = 0;
  const waypointsWithMetrics: RouteWaypoint[] = [];
  
  for (let i = 0; i < optimizedWaypoints.length; i++) {
    const wp = optimizedWaypoints[i];
    const prevWp = i > 0 ? optimizedWaypoints[i - 1] : departure_port;
    
    const distanceFromPrev = calculateDistance(
      prevWp.lat, prevWp.lng,
      wp.lat, wp.lng
    );
    
    totalDistance += distanceFromPrev;
    
    // Calculate fuel consumption (simplified model)
    const fuelForSegment = calculateSegmentFuel(distanceFromPrev, speed_knots);
    
    // Assess weather risk (mock - would integrate with weather API)
    const weatherRisk = assessWeatherRisk(wp.lat, wp.lng);
    
    waypointsWithMetrics.push({
      ...wp,
      distance_from_prev: Math.round(distanceFromPrev * 10) / 10,
      fuel_consumption: Math.round(fuelForSegment * 10) / 10,
      weather_risk: weatherRisk,
    });
  }

  // Calculate totals
  const estimatedDuration = totalDistance / speed_knots;
  const totalFuel = waypointsWithMetrics.reduce((sum, wp) => sum + (wp.fuel_consumption || 0), 0);
  const fuelCost = totalFuel * fuel_price_per_ton;
  const co2Emissions = totalFuel * 3.114; // CO2 factor for marine fuel

  // Overall weather risk
  const riskCounts = { low: 0, medium: 0, high: 0 };
  waypointsWithMetrics.forEach(wp => {
    if (wp.weather_risk) riskCounts[wp.weather_risk]++;
  });
  const overallRisk = riskCounts.high > 0 ? "high" : riskCounts.medium > 2 ? "medium" : "low";

  // Calculate optimization score (0-100)
  const optimizationScore = calculateOptimizationScore({
    distance: totalDistance,
    baseDistance: baseRoute.distance,
    fuel: totalFuel,
    weatherRisk: overallRisk,
    ecaCompliance: !isInECA(waypointsWithMetrics) || constraints.avoid_eca === false,
  });

  // Generate alternatives (simplified)
  const alternatives = generateAlternatives(departure_port, arrival_port, constraints);

  const result: OptimizedRoute = {
    departure_port,
    arrival_port,
    waypoints: waypointsWithMetrics,
    total_distance_nm: Math.round(totalDistance),
    estimated_duration_hours: Math.round(estimatedDuration * 10) / 10,
    estimated_fuel_consumption: Math.round(totalFuel),
    estimated_fuel_cost: Math.round(fuelCost),
    co2_emissions_tons: Math.round(co2Emissions * 10) / 10,
    weather_risk_overall: overallRisk,
    optimization_score: optimizationScore,
    alternatives,
  };

  // Store optimization result
  if (vessel_id) {
    await supabase.from("route_optimizations").insert({
      vessel_id,
      departure_port: departure_port.code,
      arrival_port: arrival_port.code,
      optimized_route: result,
      distance_nm: totalDistance,
      estimated_fuel: totalFuel,
      fuel_savings_percent: ((baseRoute.fuel - totalFuel) / baseRoute.fuel * 100),
      optimization_score: optimizationScore,
      status: "calculated",
    });
  }

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function calculateETA(data: any): Promise<Response> {
  const { departure_time, distance_nm, speed_knots = 14, weather_delay_hours = 0 } = data;

  const travelHours = distance_nm / speed_knots;
  const totalHours = travelHours + weather_delay_hours;
  
  const departureDate = new Date(departure_time);
  const arrivalDate = new Date(departureDate.getTime() + totalHours * 60 * 60 * 1000);

  return new Response(
    JSON.stringify({
      departure_time,
      estimated_arrival: arrivalDate.toISOString(),
      travel_hours: Math.round(travelHours * 10) / 10,
      weather_delay_hours,
      total_hours: Math.round(totalHours * 10) / 10,
      distance_nm,
      speed_knots,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function estimateFuel(data: any): Promise<Response> {
  const {
    distance_nm,
    speed_knots = 14,
    vessel_type = "container",
    cargo_weight_tons = 0,
    weather_factor = 1.0,
  } = data;

  // Base consumption rates by vessel type (tons per nautical mile)
  const baseRates: Record<string, number> = {
    container: 0.08,
    tanker: 0.12,
    bulk: 0.10,
    general: 0.06,
    offshore: 0.15,
  };

  const baseRate = baseRates[vessel_type] || 0.08;
  
  // Speed adjustment (fuel consumption ~ speed^3)
  const speedFactor = Math.pow(speed_knots / 14, 3);
  
  // Cargo weight adjustment
  const cargoFactor = 1 + (cargo_weight_tons / 50000) * 0.2;
  
  const totalConsumption = distance_nm * baseRate * speedFactor * cargoFactor * weather_factor;
  
  // Cost estimates
  const fuelPrices = {
    vlsfo: 600, // Very Low Sulphur Fuel Oil
    mgo: 800,   // Marine Gas Oil
    lng: 400,   // LNG (per ton equivalent)
  };

  return new Response(
    JSON.stringify({
      distance_nm,
      speed_knots,
      vessel_type,
      fuel_consumption_tons: Math.round(totalConsumption * 10) / 10,
      costs: {
        vlsfo: Math.round(totalConsumption * fuelPrices.vlsfo),
        mgo: Math.round(totalConsumption * fuelPrices.mgo),
        lng: Math.round(totalConsumption * fuelPrices.lng),
      },
      co2_emissions_tons: Math.round(totalConsumption * 3.114 * 10) / 10,
      factors_applied: {
        speed_factor: Math.round(speedFactor * 100) / 100,
        cargo_factor: Math.round(cargoFactor * 100) / 100,
        weather_factor,
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getWeatherAlongRoute(waypoints: RouteWaypoint[]): Promise<Response> {
  // Mock weather data - in production, integrate with weather API
  const weatherData = waypoints.map((wp, index) => ({
    waypoint_index: index,
    lat: wp.lat,
    lng: wp.lng,
    wind_speed_knots: 10 + Math.random() * 20,
    wind_direction: Math.floor(Math.random() * 360),
    wave_height_m: 1 + Math.random() * 3,
    visibility_nm: 5 + Math.random() * 10,
    conditions: Math.random() > 0.7 ? "rain" : "clear",
    risk_level: Math.random() > 0.8 ? "high" : Math.random() > 0.5 ? "medium" : "low",
  }));

  return new Response(
    JSON.stringify({
      waypoints_analyzed: waypoints.length,
      weather_forecast: weatherData,
      overall_conditions: weatherData.filter(w => w.risk_level === "high").length > 0 ? "challenging" : "favorable",
      recommended_speed_reduction: weatherData.filter(w => w.wave_height_m > 3).length > 0 ? 2 : 0,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function checkRouteCompliance(data: any): Promise<Response> {
  const { waypoints, vessel_draft, cargo_type } = data;

  const compliance = {
    eca_zones: [] as string[],
    piracy_zones: [] as string[],
    draft_restrictions: [] as string[],
    cargo_restrictions: [] as string[],
    overall_compliant: true,
  };

  // Check each waypoint
  for (const wp of waypoints) {
    // ECA check
    for (const eca of ECA_ZONES) {
      if (
        wp.lat >= eca.bounds.south &&
        wp.lat <= eca.bounds.north &&
        wp.lng >= eca.bounds.west &&
        wp.lng <= eca.bounds.east
      ) {
        if (!compliance.eca_zones.includes(eca.name)) {
          compliance.eca_zones.push(eca.name);
        }
      }
    }

    // Piracy zone check
    for (const zone of PIRACY_ZONES) {
      const distance = calculateDistance(wp.lat, wp.lng, zone.lat, zone.lng);
      if (distance < zone.radius) {
        if (!compliance.piracy_zones.includes(zone.name)) {
          compliance.piracy_zones.push(zone.name);
        }
      }
    }
  }

  compliance.overall_compliant = compliance.piracy_zones.length === 0;

  return new Response(
    JSON.stringify({
      ...compliance,
      recommendations: compliance.eca_zones.length > 0 
        ? ["Use low-sulphur fuel in ECA zones"] 
        : [],
      warnings: compliance.piracy_zones.length > 0
        ? ["Route passes through high-risk piracy area. Consider alternative routing."]
        : [],
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function compareRoutes(routes: any[]): Promise<Response> {
  const comparison = routes.map((route, index) => ({
    route_index: index,
    name: route.name || `Route ${index + 1}`,
    distance_nm: route.total_distance_nm,
    duration_hours: route.estimated_duration_hours,
    fuel_consumption: route.estimated_fuel_consumption,
    fuel_cost: route.estimated_fuel_cost,
    co2_emissions: route.co2_emissions_tons,
    weather_risk: route.weather_risk_overall,
    optimization_score: route.optimization_score,
  }));

  // Find best route by different criteria
  const bestByDistance = comparison.reduce((a, b) => a.distance_nm < b.distance_nm ? a : b);
  const bestByFuel = comparison.reduce((a, b) => a.fuel_consumption < b.fuel_consumption ? a : b);
  const bestByScore = comparison.reduce((a, b) => a.optimization_score > b.optimization_score ? a : b);

  return new Response(
    JSON.stringify({
      routes: comparison,
      recommendations: {
        shortest_route: bestByDistance.route_index,
        most_fuel_efficient: bestByFuel.route_index,
        best_overall: bestByScore.route_index,
      },
      savings_potential: {
        max_fuel_savings: Math.round(
          Math.max(...comparison.map(r => r.fuel_consumption)) -
          Math.min(...comparison.map(r => r.fuel_consumption))
        ),
        max_time_savings_hours: Math.round(
          Math.max(...comparison.map(r => r.duration_hours)) -
          Math.min(...comparison.map(r => r.duration_hours))
        ),
      },
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getPortInfo(supabase: any, portCode: string): Promise<Response> {
  // Mock port data - in production, use port database
  const ports: Record<string, Port & { facilities: string[]; restrictions: string[] }> = {
    SGSIN: {
      code: "SGSIN",
      name: "Singapore",
      lat: 1.27,
      lng: 103.8,
      country: "Singapore",
      facilities: ["bunkering", "repairs", "cargo handling", "crew change"],
      restrictions: [],
    },
    NLRTM: {
      code: "NLRTM",
      name: "Rotterdam",
      lat: 51.9,
      lng: 4.5,
      country: "Netherlands",
      facilities: ["bunkering", "repairs", "cargo handling", "lng"],
      restrictions: ["ECA zone - low sulphur fuel required"],
    },
    CNSHA: {
      code: "CNSHA",
      name: "Shanghai",
      lat: 31.2,
      lng: 121.5,
      country: "China",
      facilities: ["bunkering", "repairs", "cargo handling"],
      restrictions: [],
    },
  };

  const port = ports[portCode];

  if (!port) {
    return new Response(
      JSON.stringify({ error: "Port not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify(port),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

function calculateGreatCircleRoute(from: Port, to: Port): { distance: number; fuel: number } {
  const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  const fuel = distance * 0.08; // Simple fuel estimate
  return { distance, fuel };
}

async function findOptimalWaypoints(
  from: Port,
  to: Port,
  constraints: RouteConstraints
): Promise<RouteWaypoint[]> {
  const waypoints: RouteWaypoint[] = [];
  
  // Add intermediate waypoints based on route
  // This is simplified - real implementation would use proper routing algorithms
  
  // Check if Suez route is beneficial
  const directDistance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  const suezDistance = 
    calculateDistance(from.lat, from.lng, MAJOR_WAYPOINTS.suez_south.lat, MAJOR_WAYPOINTS.suez_south.lng) +
    calculateDistance(MAJOR_WAYPOINTS.suez_north.lat, MAJOR_WAYPOINTS.suez_north.lng, to.lat, to.lng);

  if (suezDistance < directDistance * 1.2 && from.lng > 30 && to.lng < 20) {
    waypoints.push({
      ...MAJOR_WAYPOINTS.bab_el_mandeb,
      eta: undefined,
    });
    waypoints.push({
      ...MAJOR_WAYPOINTS.suez_south,
      eta: undefined,
    });
    waypoints.push({
      ...MAJOR_WAYPOINTS.suez_north,
      eta: undefined,
    });
  }

  // Add destination
  waypoints.push({
    lat: to.lat,
    lng: to.lng,
    name: to.name,
  });

  return waypoints;
}

function calculateSegmentFuel(distance: number, speed: number): number {
  const baseRate = 0.08; // tons per nm
  const speedFactor = Math.pow(speed / 14, 3);
  return distance * baseRate * speedFactor;
}

function assessWeatherRisk(lat: number, lng: number): "low" | "medium" | "high" {
  // Simplified weather risk assessment
  // High risk zones: North Atlantic in winter, typhoon belt
  if (lat > 40 && lng < -30 && lng > -80) return "high";
  if (lat > 10 && lat < 30 && lng > 100 && lng < 180) return "medium";
  return "low";
}

function isInECA(waypoints: RouteWaypoint[]): boolean {
  for (const wp of waypoints) {
    for (const eca of ECA_ZONES) {
      if (
        wp.lat >= eca.bounds.south &&
        wp.lat <= eca.bounds.north &&
        wp.lng >= eca.bounds.west &&
        wp.lng <= eca.bounds.east
      ) {
        return true;
      }
    }
  }
  return false;
}

function calculateOptimizationScore(params: any): number {
  let score = 100;
  
  // Distance penalty
  if (params.distance > params.baseDistance * 1.1) {
    score -= 10;
  }
  
  // Weather penalty
  if (params.weatherRisk === "high") score -= 20;
  if (params.weatherRisk === "medium") score -= 10;
  
  // ECA compliance bonus
  if (params.ecaCompliance) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function generateAlternatives(from: Port, to: Port, constraints: RouteConstraints): any[] {
  // Generate 2-3 alternative routes
  return [
    {
      name: "Direct Route",
      distance_difference_nm: 0,
      time_difference_hours: 0,
      fuel_difference_percent: 0,
      pros: ["Shortest distance"],
      cons: ["May have weather exposure"],
    },
    {
      name: "Coastal Route",
      distance_difference_nm: Math.round(calculateDistance(from.lat, from.lng, to.lat, to.lng) * 0.1),
      time_difference_hours: 8,
      fuel_difference_percent: 5,
      pros: ["Sheltered waters", "Emergency port access"],
      cons: ["Longer distance", "Higher fuel consumption"],
    },
  ];
}
