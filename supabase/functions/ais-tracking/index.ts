import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * AIS Tracking - Real-time Vessel Position Tracking
 * Integrates with MarineTraffic API for live AIS data
 * Falls back to realistic mock data when API key is not configured
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
}

interface RequestPayload {
  operation: "track-vessel" | "area-search" | "fleet-status" | "proximity-alert";
  mmsi?: string;
  imo?: string;
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

// ===============================
// MarineTraffic API Integration
// ===============================

async function fetchFromMarineTraffic(endpoint: string, params: Record<string, string | number>): Promise<any> {
  if (!MARINETRAFFIC_API_KEY) {
    console.log("[ais-tracking] MarineTraffic API key not configured, using mock data");
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

    const data = await response.json();
    return data;
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
    speed: parseFloat(data.SPEED || data.speed) / 10 || 0, // MarineTraffic returns speed in 1/10 knots
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
// Mock Data Generator (Fallback)
// ===============================

function generateMockVesselData(count: number, bounds?: RequestPayload["bounds"]): VesselPosition[] {
  const vessels: VesselPosition[] = [];
  const shipTypes = ["Cargo", "Tanker", "Container", "Bulk Carrier", "Offshore", "Passenger", "Tug"];
  const navStatuses = ["Under way using engine", "At anchor", "Moored", "Restricted manoeuvrability"];
  const destinations = ["SANTOS", "RIO DE JANEIRO", "PARANAGUA", "ROTTERDAM", "SINGAPORE", "HOUSTON"];
  
  const minLat = bounds?.south ?? -25;
  const maxLat = bounds?.north ?? -22;
  const minLon = bounds?.west ?? -46;
  const maxLon = bounds?.east ?? -43;

  for (let i = 0; i < count; i++) {
    const mmsi = `710${String(100000 + Math.floor(Math.random() * 900000)).substring(0, 6)}`;
    vessels.push({
      mmsi,
      imo: `IMO${9000000 + Math.floor(Math.random() * 999999)}`,
      name: `NAUTILUS ${String.fromCharCode(65 + i)} ${Math.floor(Math.random() * 100)}`,
      callsign: `PP${String.fromCharCode(65 + i)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      latitude: minLat + Math.random() * (maxLat - minLat),
      longitude: minLon + Math.random() * (maxLon - minLon),
      course: Math.floor(Math.random() * 360),
      speed: Math.random() * 15,
      heading: Math.floor(Math.random() * 360),
      navStatus: navStatuses[Math.floor(Math.random() * navStatuses.length)],
      shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    });
  }
  
  return vessels;
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

// ===============================
// Operation Handlers
// ===============================

async function handleTrackVessel(mmsi?: string, imo?: string): Promise<VesselPosition | null> {
  // Try MarineTraffic API first
  if (MARINETRAFFIC_API_KEY && (mmsi || imo)) {
    const params: Record<string, string> = {};
    if (mmsi) params.mmsi = mmsi;
    if (imo) params.imo = imo;
    
    const data = await fetchFromMarineTraffic("exportvessel", params);
    if (data && Array.isArray(data) && data.length > 0) {
      return parseMarineTrafficVessel(data[0]);
    }
  }
  
  // Fallback to mock data
  const vessel = generateMockVesselData(1)[0];
  if (mmsi) vessel.mmsi = mmsi;
  return vessel;
}

async function handleAreaSearch(bounds: RequestPayload["bounds"]): Promise<VesselPosition[]> {
  // Try MarineTraffic API first
  if (MARINETRAFFIC_API_KEY && bounds) {
    const params = {
      MINLAT: bounds.south,
      MAXLAT: bounds.north,
      MINLON: bounds.west,
      MAXLON: bounds.east,
    };
    
    const data = await fetchFromMarineTraffic("exportvessels", params);
    if (data && Array.isArray(data)) {
      return data.map(parseMarineTrafficVessel);
    }
  }
  
  // Fallback to mock data
  return generateMockVesselData(15, bounds);
}

async function handleFleetStatus(fleetMmsis?: string[]): Promise<{ vessels: VesselPosition[], summary: any }> {
  let vessels: VesselPosition[] = [];
  
  // Try MarineTraffic API for each vessel in fleet
  if (MARINETRAFFIC_API_KEY && fleetMmsis && fleetMmsis.length > 0) {
    const promises = fleetMmsis.map(mmsi => handleTrackVessel(mmsi));
    const results = await Promise.all(promises);
    vessels = results.filter((v): v is VesselPosition => v !== null);
  }
  
  // If no API results, use mock data
  if (vessels.length === 0) {
    vessels = generateMockVesselData(fleetMmsis?.length || 5);
    if (fleetMmsis) {
      fleetMmsis.forEach((m, i) => {
        if (vessels[i]) vessels[i].mmsi = m;
      });
    }
  }

  const summary = {
    total: vessels.length,
    atSea: vessels.filter(v => v.navStatus === "Under way using engine").length,
    atAnchor: vessels.filter(v => v.navStatus === "At anchor").length,
    moored: vessels.filter(v => v.navStatus === "Moored").length,
    avgSpeed: vessels.length > 0 ? vessels.reduce((acc, v) => acc + v.speed, 0) / vessels.length : 0,
  };

  return { vessels, summary };
}

async function handleProximityAlert(
  centerLat: number,
  centerLon: number,
  radiusNm: number
): Promise<{ vessels: VesselPosition[], alerts: any[] }> {
  // Get vessels in area around center point
  const bounds = {
    north: centerLat + (radiusNm / 60),
    south: centerLat - (radiusNm / 60),
    east: centerLon + (radiusNm / 60),
    west: centerLon - (radiusNm / 60),
  };

  const allVessels = await handleAreaSearch(bounds);

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
    const { operation, mmsi, imo, bounds, fleetMmsis, centerLat, centerLon, radiusNm = 50 } = payload;

    const source = MARINETRAFFIC_API_KEY ? "marinetraffic" : "mock";
    console.log(`[ais-tracking] Operation: ${operation} | Source: ${source}`);

    switch (operation) {
      case "track-vessel": {
        const vessel = await handleTrackVessel(mmsi, imo);
        
        // Generate track history
        const trackHistory = vessel ? [
          { ...vessel },
          { ...vessel, latitude: vessel.latitude - 0.05, longitude: vessel.longitude - 0.03, lastUpdate: new Date(Date.now() - 3600000).toISOString() },
          { ...vessel, latitude: vessel.latitude - 0.1, longitude: vessel.longitude - 0.06, lastUpdate: new Date(Date.now() - 7200000).toISOString() },
          { ...vessel, latitude: vessel.latitude - 0.15, longitude: vessel.longitude - 0.09, lastUpdate: new Date(Date.now() - 10800000).toISOString() },
        ] : [];

        return new Response(
          JSON.stringify({ 
            success: true, 
            vessel,
            trackHistory,
            source,
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
            source,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fleet-status": {
        const { vessels, summary } = await handleFleetStatus(fleetMmsis);

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
            source,
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
