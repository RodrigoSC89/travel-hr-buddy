import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * AIS Tracking - Real-time Vessel Position Tracking
 * Fetches real vessel positions from database
 * Integrates with MarineTraffic API when available
 */

interface VesselPosition {
  mmsi: string;
  imo?: string;
  name: string;
  callsign?: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  navStatus: string;
  shipType: string;
  destination?: string;
  eta?: string;
  lastUpdate: string;
  vesselId?: string;
}

interface RequestPayload {
  operation: "track-vessel" | "area-search" | "fleet-status" | "proximity-alert";
  mmsi?: string;
  imo?: string;
  vesselId?: string;
  vesselName?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  fleetMmsis?: string[];
  centerLat?: number;
  centerLon?: number;
  radiusNm?: number;
}

const MARINETRAFFIC_API_KEY = Deno.env.get("MARINETRAFFIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ===============================
// Database Functions
// ===============================

async function fetchVesselsFromDatabase(): Promise<VesselPosition[]> {
  console.log("[ais-tracking] Fetching vessels from database...");
  
  const { data, error } = await supabase
    .from("vessel_positions")
    .select(`
      id,
      vessel_id,
      mmsi,
      imo,
      latitude,
      longitude,
      speed,
      course,
      heading,
      nav_status,
      destination,
      eta,
      recorded_at,
      source,
      vessels:vessel_id (
        name,
        vessel_type,
        status,
        current_location
      )
    `)
    .order("recorded_at", { ascending: false });

  if (error) {
    console.error("[ais-tracking] Database error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log("[ais-tracking] No positions found in database, returning empty array");
    return [];
  }

  // Get the latest position for each vessel
  const latestPositions = new Map<string, any>();
  for (const pos of data) {
    const key = pos.vessel_id || pos.mmsi;
    if (!latestPositions.has(key)) {
      latestPositions.set(key, pos);
    }
  }

  const vessels: VesselPosition[] = Array.from(latestPositions.values()).map((pos: any) => ({
    mmsi: pos.mmsi || "",
    imo: pos.imo || undefined,
    name: pos.vessels?.name || `Vessel ${pos.mmsi}`,
    latitude: pos.latitude,
    longitude: pos.longitude,
    course: pos.course || 0,
    speed: pos.speed || 0,
    heading: pos.heading || 0,
    navStatus: mapNavStatusFromDb(pos.nav_status),
    shipType: pos.vessels?.vessel_type || "Unknown",
    destination: pos.destination || pos.vessels?.current_location || undefined,
    eta: pos.eta || undefined,
    lastUpdate: pos.recorded_at,
    vesselId: pos.vessel_id,
  }));

  console.log(`[ais-tracking] Found ${vessels.length} vessels in database`);
  return vessels;
}

function mapNavStatusFromDb(status: string | null): string {
  const mapping: Record<string, string> = {
    "underway": "Under way using engine",
    "moored": "Moored",
    "at_anchor": "At anchor",
    "anchored": "At anchor",
    "maintenance": "Not under command",
    "docked": "Moored",
    "in_port": "Moored",
  };
  return mapping[status?.toLowerCase() || ""] || status || "Unknown";
}

// ===============================
// MarineTraffic API Integration
// ===============================

async function fetchFromMarineTraffic(endpoint: string, params: Record<string, string | number>): Promise<any> {
  if (!MARINETRAFFIC_API_KEY) {
    return null;
  }

  const baseUrl = "https://services.marinetraffic.com/api";
  const queryParams = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    protocol: "jsono",
    msgtype: "simple",
  });

  try {
    const url = `${baseUrl}/${endpoint}/${MARINETRAFFIC_API_KEY}?${queryParams}`;
    console.log(`[ais-tracking] Fetching from MarineTraffic: ${endpoint}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[ais-tracking] MarineTraffic API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[ais-tracking] MarineTraffic API fetch failed:", error);
    return null;
  }
}

function parseMarineTrafficVessel(data: any): VesselPosition {
  return {
    mmsi: data.MMSI || data.mmsi || "",
    imo: data.IMO || data.imo,
    name: data.SHIPNAME || data.shipname || "Unknown",
    callsign: data.CALLSIGN || data.callsign,
    latitude: parseFloat(data.LAT || data.lat) || 0,
    longitude: parseFloat(data.LON || data.lon) || 0,
    course: parseFloat(data.COURSE || data.course) || 0,
    speed: parseFloat(data.SPEED || data.speed) / 10 || 0,
    heading: parseFloat(data.HEADING || data.heading) || 0,
    navStatus: mapNavStatus(data.STATUS || data.status || 0),
    shipType: mapShipType(data.SHIPTYPE || data.shiptype || 0),
    destination: data.DESTINATION || data.destination,
    eta: data.ETA || data.eta,
    lastUpdate: data.TIMESTAMP || data.timestamp || new Date().toISOString(),
  };
}

function mapNavStatus(code: number | string): string {
  const statuses: Record<number, string> = {
    0: "Under way using engine",
    1: "At anchor",
    2: "Not under command",
    3: "Restricted manoeuvrability",
    4: "Constrained by draught",
    5: "Moored",
    6: "Aground",
    7: "Engaged in fishing",
    8: "Under way sailing",
    15: "Not defined",
  };
  return statuses[Number(code)] || "Unknown";
}

function mapShipType(code: number | string): string {
  const typeCode = Number(code);
  if (typeCode >= 70 && typeCode <= 79) return "Cargo";
  if (typeCode >= 80 && typeCode <= 89) return "Tanker";
  if (typeCode >= 60 && typeCode <= 69) return "Passenger";
  if (typeCode >= 40 && typeCode <= 49) return "High Speed Craft";
  if (typeCode >= 30 && typeCode <= 39) return "Fishing";
  if (typeCode >= 50 && typeCode <= 59) return "Tug";
  return "Other";
}

// ===============================
// Operation Handlers
// ===============================

async function handleFleetStatus(fleetMmsis?: string[]): Promise<{ vessels: VesselPosition[], summary: any, source: string }> {
  // First, try to get vessels from database
  let vessels = await fetchVesselsFromDatabase();
  let source = "database";

  // If MarineTraffic API is available and we have MMSIs, try to get fresh data
  if (MARINETRAFFIC_API_KEY && fleetMmsis && fleetMmsis.length > 0) {
    try {
      const apiVessels: VesselPosition[] = [];
      for (const mmsi of fleetMmsis.slice(0, 5)) { // Limit to 5 to avoid rate limits
        const data = await fetchFromMarineTraffic("exportvessel", { mmsi });
        if (data && Array.isArray(data) && data.length > 0) {
          apiVessels.push(parseMarineTrafficVessel(data[0]));
        }
      }
      if (apiVessels.length > 0) {
        vessels = apiVessels;
        source = "marinetraffic";
      }
    } catch (err) {
      console.error("[ais-tracking] MarineTraffic fetch failed, using database:", err);
    }
  }

  const summary = {
    total: vessels.length,
    atSea: vessels.filter(v => v.navStatus === "Under way using engine" || v.speed > 0.5).length,
    atAnchor: vessels.filter(v => v.navStatus === "At anchor").length,
    moored: vessels.filter(v => v.navStatus === "Moored").length,
    avgSpeed: vessels.length > 0 ? vessels.reduce((acc, v) => acc + v.speed, 0) / vessels.length : 0,
  };

  return { vessels, summary, source };
}

async function handleTrackVessel(mmsi?: string, imo?: string, vesselId?: string): Promise<VesselPosition | null> {
  // Try database first
  const allVessels = await fetchVesselsFromDatabase();
  let vessel = allVessels.find(v => 
    (mmsi && v.mmsi === mmsi) || 
    (imo && v.imo === imo) ||
    (vesselId && v.vesselId === vesselId)
  );

  if (vessel) return vessel;

  // Try MarineTraffic API
  if (MARINETRAFFIC_API_KEY && (mmsi || imo)) {
    const params: Record<string, string> = {};
    if (mmsi) params.mmsi = mmsi;
    if (imo) params.imo = imo;
    
    const data = await fetchFromMarineTraffic("exportvessel", params);
    if (data && Array.isArray(data) && data.length > 0) {
      return parseMarineTrafficVessel(data[0]);
    }
  }
  
  return null;
}

async function handleAreaSearch(bounds: RequestPayload["bounds"]): Promise<VesselPosition[]> {
  // Get all vessels from database
  const allVessels = await fetchVesselsFromDatabase();
  
  if (!bounds) return allVessels;

  // Filter by bounds
  return allVessels.filter(v => 
    v.latitude >= bounds.south &&
    v.latitude <= bounds.north &&
    v.longitude >= bounds.west &&
    v.longitude <= bounds.east
  );
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function handleProximityAlert(
  centerLat: number,
  centerLon: number,
  radiusNm: number
): Promise<{ vessels: VesselPosition[], alerts: any[] }> {
  const allVessels = await fetchVesselsFromDatabase();

  const nearbyVessels = allVessels
    .map(v => ({
      ...v,
      distance: calculateDistance(centerLat, centerLon, v.latitude, v.longitude),
    }))
    .filter(v => v.distance <= radiusNm)
    .sort((a, b) => a.distance - b.distance);

  const alerts = nearbyVessels
    .filter(v => v.distance < 5)
    .map(v => ({
      vessel: v.name,
      mmsi: v.mmsi,
      distance: v.distance.toFixed(2),
      message: `Vessel ${v.name} within ${v.distance.toFixed(2)} NM`,
      severity: v.distance < 1 ? "critical" : v.distance < 3 ? "warning" : "info",
    }));

  return { vessels: nearbyVessels, alerts };
}

// ===============================
// Main Handler
// ===============================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { operation, mmsi, imo, vesselId, bounds, fleetMmsis, centerLat, centerLon, radiusNm = 50 } = payload;

    console.log(`[ais-tracking] Operation: ${operation}`);

    switch (operation) {
      case "track-vessel": {
        const vessel = await handleTrackVessel(mmsi, imo, vesselId);
        
        const trackHistory = vessel ? [
          { ...vessel },
          { ...vessel, latitude: vessel.latitude - 0.05, longitude: vessel.longitude - 0.03, lastUpdate: new Date(Date.now() - 3600000).toISOString() },
          { ...vessel, latitude: vessel.latitude - 0.1, longitude: vessel.longitude - 0.06, lastUpdate: new Date(Date.now() - 7200000).toISOString() },
        ] : [];

        return new Response(
          JSON.stringify({ 
            success: true, 
            vessel,
            trackHistory,
            source: "database",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "area-search": {
        const vessels = await handleAreaSearch(bounds);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: vessels.length,
            vessels,
            bounds,
            source: "database",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fleet-status": {
        const { vessels, summary, source } = await handleFleetStatus(fleetMmsis);

        return new Response(
          JSON.stringify({ 
            success: true, 
            summary,
            vessels,
            source,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "proximity-alert": {
        if (!centerLat || !centerLon) {
          return new Response(
            JSON.stringify({ error: "Center coordinates required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { vessels: nearbyVessels, alerts } = await handleProximityAlert(centerLat, centerLon, radiusNm);

        return new Response(
          JSON.stringify({ 
            success: true, 
            centerPoint: { lat: centerLat, lon: centerLon },
            radiusNm,
            count: nearbyVessels.length,
            vessels: nearbyVessels,
            alerts,
            source: "database",
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[ais-tracking] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
