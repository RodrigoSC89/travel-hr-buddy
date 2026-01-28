import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * MarineTraffic AIS Edge Function
 * Fetches real-time AIS data from MarineTraffic API
 * Falls back to mock data when API key is not configured
 */

// Mock data for development/demo when API key is not available
const MOCK_VESSELS = [
  {
    mmsi: "477333400",
    imo: "9632179",
    shipname: "EVER GIVEN",
    lat: -23.9847,
    lon: -46.2891,
    speed: 145, // speed in 1/10 knot
    course: 185.3,
    heading: 183,
    destination: "SANTOS",
    eta: "2026-01-30T14:00:00Z",
    status: 0,
    shiptype: 70,
    timestamp: new Date().toISOString(),
  },
  {
    mmsi: "563048100",
    imo: "9398000",
    shipname: "MSC GULSUN",
    lat: -24.2104,
    lon: -46.3542,
    speed: 120,
    course: 275.8,
    heading: 274,
    destination: "PARANAGUA",
    eta: "2026-02-01T08:00:00Z",
    status: 0,
    shiptype: 70,
    timestamp: new Date().toISOString(),
  },
  {
    mmsi: "352848000",
    imo: "9461867",
    shipname: "HMM ALGECIRAS",
    lat: -23.7521,
    lon: -45.9876,
    speed: 0,
    course: 0,
    heading: 45,
    destination: "SANTOS",
    eta: "2026-01-29T06:00:00Z",
    status: 5, // Moored
    shiptype: 70,
    timestamp: new Date().toISOString(),
  },
];

// Map to get mock vessel by MMSI
const MOCK_VESSEL_MAP = new Map(MOCK_VESSELS.map(v => [v.mmsi, v]));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mmsi, imo, shipName, operation = "single" } = await req.json();
    const apiKey = Deno.env.get("MARINETRAFFIC_API_KEY");

    // If no API key, return mock data with source indicator
    if (!apiKey || apiKey.trim() === "") {
      console.log("[MarineTraffic] Using mock data (API key not configured)");
      
      if (operation === "fleet" || (!mmsi && !imo && !shipName)) {
        // Return all mock vessels for fleet request
        return new Response(
          JSON.stringify({ 
            data: MOCK_VESSELS,
            source: "mock",
            message: "Using demo data - configure MARINETRAFFIC_API_KEY for real AIS data"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return specific mock vessel or closest match
      const vessel = mmsi ? MOCK_VESSEL_MAP.get(mmsi) : MOCK_VESSELS[0];
      
      if (vessel) {
        return new Response(
          JSON.stringify({ 
            data: [vessel],
            source: "mock",
            message: "Using demo data - configure MARINETRAFFIC_API_KEY for real AIS data"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return generic mock if no match
      return new Response(
        JSON.stringify({ 
          data: [{ ...MOCK_VESSELS[0], mmsi: mmsi || "000000000" }],
          source: "mock",
          message: "Using demo data - configure MARINETRAFFIC_API_KEY for real AIS data"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mmsi && !imo && !shipName && operation !== "fleet") {
      return new Response(
        JSON.stringify({ error: "mmsi, imo, or shipName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[MarineTraffic] Fetching AIS data for mmsi=${mmsi}, imo=${imo}, shipName=${shipName}`);

    // Build API URL based on available parameters
    let url = `https://services.marinetraffic.com/api/exportvesseltrack/v:2/${apiKey}/protocol:jsono`;
    
    if (mmsi) {
      url += `/mmsi:${mmsi}`;
    } else if (imo) {
      url += `/imo:${imo}`;
    }

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MarineTraffic] API error: ${response.status} - ${errorText}`);
      
      // Fall back to mock data on API error
      if (mmsi && MOCK_VESSEL_MAP.has(mmsi)) {
        console.log("[MarineTraffic] Falling back to mock data due to API error");
        return new Response(
          JSON.stringify({ 
            data: [MOCK_VESSEL_MAP.get(mmsi)],
            source: "mock_fallback",
            message: `API error (${response.status}), using demo data`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `MarineTraffic API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`[MarineTraffic] Successfully fetched AIS data`);

    return new Response(
      JSON.stringify({ data, source: "marinetraffic" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MarineTraffic] Error:", error);
    
    // Return mock data on any error
    console.log("[MarineTraffic] Falling back to mock data due to error");
    return new Response(
      JSON.stringify({ 
        data: MOCK_VESSELS,
        source: "mock_error",
        message: "Using demo data due to service error"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
