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
    const body = await req.json().catch(() => ({}));
    const { type = "all_day", minMagnitude = 2.5 } = body;

    console.log(`[NOAA/USGS] Fetching earthquake data: type=${type}, minMagnitude=${minMagnitude}`);

    // USGS Earthquake API endpoints
    const endpoints: Record<string, string> = {
      all_hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
      all_day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      all_week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
      all_month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
      significant_month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
    };

    const url = endpoints[type] || endpoints.all_day;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NOAA/USGS] API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `USGS API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Filter by minimum magnitude if specified
    const filteredFeatures = data.features?.filter(
      (feature: any) => feature.properties?.mag >= minMagnitude
    ) || [];

    const result = {
      ...data,
      features: filteredFeatures,
      metadata: {
        ...data.metadata,
        filtered: true,
        minMagnitude,
        originalCount: data.features?.length || 0,
        filteredCount: filteredFeatures.length,
      },
    };

    console.log(`[NOAA/USGS] Fetched ${filteredFeatures.length} earthquakes (filtered from ${data.features?.length || 0})`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[NOAA/USGS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
