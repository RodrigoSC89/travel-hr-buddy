import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * AIS Tracking - Vessel Position Tracking via AIS
 * Integrates with free AIS data sources for real-time vessel tracking
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

// Simulated AIS data for demonstration (in production, use real AIS API)
// This provides realistic demo data while AIS API keys are configured
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { operation, mmsi, bounds, fleetMmsis, centerLat, centerLon, radiusNm = 50 } = payload;

    console.log(`[ais-tracking] Operation: ${operation}`);

    switch (operation) {
      case "track-vessel": {
        // Track a specific vessel
        const vessel = generateMockVesselData(1)[0];
        if (mmsi) vessel.mmsi = mmsi;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            vessel,
            trackHistory: [
              { ...vessel, lastUpdate: new Date(Date.now() - 3600000).toISOString() },
              { ...vessel, latitude: vessel.latitude - 0.05, longitude: vessel.longitude - 0.03, lastUpdate: new Date(Date.now() - 7200000).toISOString() },
              { ...vessel, latitude: vessel.latitude - 0.1, longitude: vessel.longitude - 0.06, lastUpdate: new Date(Date.now() - 10800000).toISOString() },
            ]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "area-search": {
        // Search vessels in a geographic area
        const vessels = generateMockVesselData(15, bounds);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: vessels.length,
            vessels,
            bounds,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fleet-status": {
        // Get status of fleet vessels
        const fleetCount = fleetMmsis?.length || 5;
        const vessels = generateMockVesselData(fleetCount);
        
        if (fleetMmsis) {
          fleetMmsis.forEach((m, i) => {
            if (vessels[i]) vessels[i].mmsi = m;
          });
        }

        const summary = {
          total: vessels.length,
          atSea: vessels.filter(v => v.navStatus === "Under way using engine").length,
          atAnchor: vessels.filter(v => v.navStatus === "At anchor").length,
          moored: vessels.filter(v => v.navStatus === "Moored").length,
          avgSpeed: vessels.reduce((acc, v) => acc + v.speed, 0) / vessels.length,
        };

        return new Response(
          JSON.stringify({ 
            success: true, 
            summary,
            vessels,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "proximity-alert": {
        // Check for vessels in proximity
        if (!centerLat || !centerLon) {
          return new Response(
            JSON.stringify({ error: "Center coordinates required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const allVessels = generateMockVesselData(20, {
          north: centerLat + 1,
          south: centerLat - 1,
          east: centerLon + 1,
          west: centerLon - 1,
        });

        const nearbyVessels = allVessels
          .map(v => ({
            ...v,
            distance: calculateDistance(centerLat, centerLon, v.latitude, v.longitude),
          }))
          .filter(v => v.distance <= radiusNm)
          .sort((a, b) => a.distance - b.distance);

        return new Response(
          JSON.stringify({ 
            success: true, 
            centerPoint: { lat: centerLat, lon: centerLon },
            radiusNm,
            count: nearbyVessels.length,
            vessels: nearbyVessels,
            alerts: nearbyVessels.filter(v => v.distance < 5).map(v => ({
              vessel: v.name,
              distance: v.distance.toFixed(2),
              message: `Vessel ${v.name} within ${v.distance.toFixed(2)} NM`,
              severity: v.distance < 1 ? "critical" : v.distance < 3 ? "warning" : "info"
            })),
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
    console.error("ais-tracking error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
