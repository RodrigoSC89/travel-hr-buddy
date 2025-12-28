import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mmsi, imo, shipName } = await req.json();
    const apiKey = Deno.env.get("MARINETRAFFIC_API_KEY");

    if (!apiKey) {
      console.error("MARINETRAFFIC_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "MarineTraffic API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mmsi && !imo && !shipName) {
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

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MarineTraffic] API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `MarineTraffic API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`[MarineTraffic] Successfully fetched AIS data`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[MarineTraffic] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
