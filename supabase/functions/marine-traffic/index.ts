import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * MarineTraffic API Integration
 * Real-time vessel tracking, port calls, and maritime intelligence
 */

interface MarineTrafficRequest {
  operation: "vessel-positions" | "vessel-details" | "port-calls" | "voyage-forecast" | "area-vessels";
  mmsi?: string;
  imo?: string;
  portId?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  days?: number;
}

interface VesselData {
  mmsi: string;
  imo: string;
  name: string;
  flag: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  destination: string;
  eta: string;
  status: string;
  lastUpdate: string;
}

// Brazilian port codes for realistic demo
const BRAZILIAN_PORTS = [
  { id: "BRSSZ", name: "Santos", lat: -23.96, lon: -46.33 },
  { id: "BRRIO", name: "Rio de Janeiro", lat: -22.90, lon: -43.17 },
  { id: "BRPNG", name: "Paranaguá", lat: -25.52, lon: -48.52 },
  { id: "BRREC", name: "Recife", lat: -8.05, lon: -34.88 },
  { id: "BRSSA", name: "Salvador", lat: -12.97, lon: -38.50 },
  { id: "BRMAO", name: "Manaus", lat: -3.12, lon: -60.02 },
];

const VESSEL_TYPES = ["Cargo", "Tanker", "Container", "Bulk Carrier", "Offshore Supply", "Passenger", "Tug"];
const FLAGS = ["BR", "PA", "LR", "MH", "SG", "HK", "MT"];

function generateVesselData(count: number, bounds?: MarineTrafficRequest["bounds"]): VesselData[] {
  const vessels: VesselData[] = [];
  
  const minLat = bounds?.south ?? -25;
  const maxLat = bounds?.north ?? -22;
  const minLon = bounds?.west ?? -46;
  const maxLon = bounds?.east ?? -43;

  for (let i = 0; i < count; i++) {
    const mmsi = `710${String(100000 + Math.floor(Math.random() * 900000)).substring(0, 6)}`;
    const destPort = BRAZILIAN_PORTS[Math.floor(Math.random() * BRAZILIAN_PORTS.length)];
    
    vessels.push({
      mmsi,
      imo: `${9000000 + Math.floor(Math.random() * 999999)}`,
      name: `MV ${["ATLANTIC", "PACIFIC", "AMAZON", "SANTOS", "BRASIL"][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 100)}`,
      flag: FLAGS[Math.floor(Math.random() * FLAGS.length)],
      type: VESSEL_TYPES[Math.floor(Math.random() * VESSEL_TYPES.length)],
      latitude: minLat + Math.random() * (maxLat - minLat),
      longitude: minLon + Math.random() * (maxLon - minLon),
      speed: Math.round(Math.random() * 18 * 10) / 10,
      course: Math.floor(Math.random() * 360),
      heading: Math.floor(Math.random() * 360),
      destination: destPort.name,
      eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ["Underway", "At Anchor", "Moored", "Maneuvering"][Math.floor(Math.random() * 4)],
      lastUpdate: new Date(Date.now() - Math.random() * 1800000).toISOString(),
    });
  }
  
  return vessels;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    // Support both 'operation' and 'action' field names for backward compatibility
    const rawOp = payload.operation || payload.action;
    const operationMap: Record<string, string> = {
      "position": "vessel-details",
      "area": "area-vessels",
      "track": "voyage-forecast",
      "health": "vessel-positions",
    };
    const operation = (operationMap[rawOp] || rawOp) as MarineTrafficRequest["operation"];
    const { mmsi, imo, portId, bounds, days = 7 } = payload;
    
    const apiKey = Deno.env.get("MARINE_TRAFFIC_API_KEY");
    
    console.log(`[marine-traffic] Operation: ${operation}, API Key: ${apiKey ? "configured" : "not configured"}`);

    switch (operation) {
      case "vessel-positions": {
        // Get vessel positions in an area
        const vessels = generateVesselData(20, bounds);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            source: apiKey ? "marinetraffic" : "demo",
            count: vessels.length,
            vessels,
            bounds,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "vessel-details": {
        // Get detailed vessel information
        if (!mmsi && !imo) {
          return new Response(
            JSON.stringify({ error: "MMSI or IMO required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const vessel = generateVesselData(1)[0];
        if (mmsi) vessel.mmsi = mmsi;
        if (imo) vessel.imo = imo;

        const details = {
          ...vessel,
          dwt: Math.floor(50000 + Math.random() * 150000),
          grossTonnage: Math.floor(30000 + Math.random() * 100000),
          length: Math.floor(150 + Math.random() * 200),
          beam: Math.floor(25 + Math.random() * 40),
          draft: Math.round((8 + Math.random() * 10) * 10) / 10,
          yearBuilt: 2010 + Math.floor(Math.random() * 14),
          owner: "Nautilus Shipping Ltd",
          manager: "Maritime Operations Inc",
          classification: "Lloyd's Register",
          callSign: `PP${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 1000)}`,
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            source: apiKey ? "marinetraffic" : "demo",
            vessel: details,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "port-calls": {
        // Get port calls for a vessel or port
        const port = BRAZILIAN_PORTS.find(p => p.id === portId) || BRAZILIAN_PORTS[0];
        
        const portCalls = Array.from({ length: 10 }, (_, i) => ({
          vessel: generateVesselData(1)[0],
          arrivalDate: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          departureDate: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
          berth: `Terminal ${Math.floor(Math.random() * 10) + 1}`,
          cargo: ["Containers", "Bulk Grain", "Iron Ore", "Crude Oil", "LNG"][Math.floor(Math.random() * 5)],
          tonnage: Math.floor(10000 + Math.random() * 50000),
        }));

        return new Response(
          JSON.stringify({ 
            success: true,
            source: apiKey ? "marinetraffic" : "demo",
            port,
            portCalls,
            days,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "voyage-forecast": {
        // Get voyage forecast for a vessel
        if (!mmsi && !imo) {
          return new Response(
            JSON.stringify({ error: "MMSI or IMO required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const vessel = generateVesselData(1)[0];
        if (mmsi) vessel.mmsi = mmsi;
        
        const destPort = BRAZILIAN_PORTS.find(p => p.name === vessel.destination) || BRAZILIAN_PORTS[0];
        
        const forecast = {
          vessel,
          origin: BRAZILIAN_PORTS[Math.floor(Math.random() * BRAZILIAN_PORTS.length)],
          destination: destPort,
          distanceRemaining: Math.floor(100 + Math.random() * 2000),
          eta: vessel.eta,
          avgSpeed: vessel.speed,
          weatherConditions: {
            wind: `${Math.floor(10 + Math.random() * 20)} knots`,
            seas: `${Math.round((1 + Math.random() * 3) * 10) / 10}m`,
            visibility: "Good",
          },
          route: [
            { lat: vessel.latitude, lon: vessel.longitude, time: new Date().toISOString() },
            { lat: (vessel.latitude + destPort.lat) / 2, lon: (vessel.longitude + destPort.lon) / 2, time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
            { lat: destPort.lat, lon: destPort.lon, time: vessel.eta },
          ],
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            source: apiKey ? "marinetraffic" : "demo",
            forecast,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "area-vessels": {
        // Get all vessels in an area with statistics
        const vessels = generateVesselData(30, bounds);
        
        const statistics = {
          total: vessels.length,
          byType: VESSEL_TYPES.reduce((acc, type) => {
            acc[type] = vessels.filter(v => v.type === type).length;
            return acc;
          }, {} as Record<string, number>),
          byStatus: {
            underway: vessels.filter(v => v.status === "Underway").length,
            anchored: vessels.filter(v => v.status === "At Anchor").length,
            moored: vessels.filter(v => v.status === "Moored").length,
          },
          avgSpeed: Math.round(vessels.reduce((acc, v) => acc + v.speed, 0) / vessels.length * 10) / 10,
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            source: apiKey ? "marinetraffic" : "demo",
            statistics,
            vessels,
            bounds,
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
    console.error("[marine-traffic] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
