import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PortAPI - Global port information and berthing data
 * Port schedules, facilities, and operational status
 */

interface PortRequest {
  operation: "search" | "details" | "schedule" | "facilities" | "weather";
  portCode?: string;
  query?: string;
  country?: string;
}

const GLOBAL_PORTS = [
  { code: "BRSSZ", name: "Santos", country: "BR", lat: -23.96, lng: -46.33, type: "Major Container" },
  { code: "BRRIO", name: "Rio de Janeiro", country: "BR", lat: -22.90, lng: -43.17, type: "Cruise & Cargo" },
  { code: "BRPNG", name: "Paranaguá", country: "BR", lat: -25.52, lng: -48.52, type: "Bulk & Grain" },
  { code: "NLRTM", name: "Rotterdam", country: "NL", lat: 51.90, lng: 4.50, type: "Major Hub" },
  { code: "SGSIN", name: "Singapore", country: "SG", lat: 1.26, lng: 103.84, type: "Transhipment Hub" },
  { code: "CNSHA", name: "Shanghai", country: "CN", lat: 31.23, lng: 121.47, type: "Mega Port" },
  { code: "USLAX", name: "Los Angeles", country: "US", lat: 33.73, lng: -118.26, type: "Gateway Americas" },
  { code: "AEDXB", name: "Dubai", country: "AE", lat: 25.27, lng: 55.30, type: "Middle East Hub" },
  { code: "DEHAM", name: "Hamburg", country: "DE", lat: 53.55, lng: 9.99, type: "European Gateway" },
  { code: "JPYOK", name: "Yokohama", country: "JP", lat: 35.44, lng: 139.64, type: "Pacific Hub" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PortRequest = await req.json();
    const { operation, portCode, query, country } = payload;

    console.log(`[port-api] Operation: ${operation}`);

    switch (operation) {
      case "search": {
        let results = GLOBAL_PORTS;
        
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.code.toLowerCase().includes(q)
          );
        }
        
        if (country) {
          results = results.filter(p => p.country === country);
        }

        return new Response(
          JSON.stringify({
            success: true,
            count: results.length,
            ports: results.map(p => ({
              ...p,
              status: ["Operational", "Congested", "Weather Alert"][Math.floor(Math.random() * 3)],
              waitTime: `${Math.floor(Math.random() * 48)}h`,
            })),
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "details": {
        const port = GLOBAL_PORTS.find(p => p.code === portCode) || GLOBAL_PORTS[0];
        
        const details = {
          ...port,
          status: "Operational",
          timezone: "UTC-3",
          vhfChannel: 16,
          pilotRequired: true,
          maxDraft: 14.5,
          maxLOA: 366,
          terminals: [
            { name: "Container Terminal 1", type: "Container", berths: 8 },
            { name: "Bulk Terminal", type: "Bulk", berths: 4 },
            { name: "Liquid Terminal", type: "Tanker", berths: 3 },
          ],
          contacts: {
            harbor: "+55 13 3232-1234",
            pilot: "+55 13 3232-5678",
            customs: "+55 13 3232-9012",
          },
          services: ["Bunkering", "Fresh Water", "Provisions", "Repairs", "Waste Disposal"],
          averageWaitTime: `${Math.floor(12 + Math.random() * 36)}h`,
          currentVessels: Math.floor(10 + Math.random() * 40),
        };

        return new Response(
          JSON.stringify({
            success: true,
            port: details,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "schedule": {
        const arrivals = Array.from({ length: 10 }, (_, i) => ({
          vessel: `MV ${["ATLANTIC", "PACIFIC", "AMAZON", "SANTOS"][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 100)}`,
          eta: new Date(Date.now() + (i + 1) * 6 * 60 * 60 * 1000).toISOString(),
          from: GLOBAL_PORTS[Math.floor(Math.random() * GLOBAL_PORTS.length)].name,
          cargo: ["Containers", "Bulk", "General", "Tanker"][Math.floor(Math.random() * 4)],
          agent: "Maritime Services Ltd",
        }));

        const departures = Array.from({ length: 8 }, (_, i) => ({
          vessel: `MV ${["BRAZIL", "EUROPA", "ASIA", "GLOBAL"][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 100)}`,
          etd: new Date(Date.now() + (i + 1) * 8 * 60 * 60 * 1000).toISOString(),
          to: GLOBAL_PORTS[Math.floor(Math.random() * GLOBAL_PORTS.length)].name,
          cargo: ["Containers", "Bulk", "General", "Tanker"][Math.floor(Math.random() * 4)],
        }));

        return new Response(
          JSON.stringify({
            success: true,
            portCode,
            arrivals,
            departures,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "facilities": {
        return new Response(
          JSON.stringify({
            success: true,
            portCode,
            facilities: {
              bunkerSuppliers: [
                { name: "Petrobras Marine", types: ["HFO", "MGO", "LSMGO"], contact: "+55 13 3232-1111" },
                { name: "Shell Marine", types: ["MGO", "VLSFO"], contact: "+55 13 3232-2222" },
              ],
              repairYards: [
                { name: "Santos Shipyard", capabilities: ["Hull", "Engine", "Electrical"], dryDock: true },
              ],
              provisions: [
                { name: "Marine Provisions Co", types: ["Fresh", "Frozen", "Dry"], delivery: true },
              ],
              wasteReception: {
                bilge: true,
                sludge: true,
                garbage: true,
                sewage: true,
              },
            },
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "weather": {
        const port = GLOBAL_PORTS.find(p => p.code === portCode) || GLOBAL_PORTS[0];
        
        return new Response(
          JSON.stringify({
            success: true,
            portCode,
            weather: {
              temperature: 22 + Math.random() * 10,
              humidity: 70 + Math.random() * 20,
              windSpeed: 5 + Math.random() * 15,
              windDirection: Math.floor(Math.random() * 360),
              visibility: 8 + Math.random() * 12,
              seaState: ["Calm", "Slight", "Moderate", "Rough"][Math.floor(Math.random() * 4)],
              tideHeight: 0.5 + Math.random() * 2,
              nextHighTide: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
              nextLowTide: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            },
            location: { lat: port.lat, lng: port.lng },
            timestamp: new Date().toISOString(),
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
    console.error("[port-api] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
