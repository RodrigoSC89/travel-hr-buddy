import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * NASA Open API - Environmental and satellite data
 * Earth observation, space weather, and maritime environmental data
 * 
 * REQUIRES: NASA_API_KEY secret to be configured
 * Get your free key at: https://api.nasa.gov/
 */

interface NASARequest {
  operation: "apod" | "earth-imagery" | "neo" | "donki" | "epic" | "mars-weather";
  lat?: number;
  lng?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("NASA_API_KEY");
    
    // Enforce real API key - no demo fallback in production
    if (!apiKey) {
      console.error("[nasa-api] NASA_API_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "NOT_CONFIGURED",
          message: "NASA API key not configured. Get a free key at https://api.nasa.gov/",
          configRequired: ["NASA_API_KEY"],
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: NASARequest = await req.json();
    const { operation, lat, lng, date, startDate, endDate } = payload;
    
    console.log(`[nasa-api] Operation: ${operation}`);

    switch (operation) {
      case "apod": {
        // Astronomy Picture of the Day
        const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${date ? `&date=${date}` : ""}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`NASA API returned ${response.status}`);
        }
        
        const data = await response.json();
        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa",
            apod: data,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "earth-imagery": {
        if (!lat || !lng) {
          return new Response(
            JSON.stringify({ error: "Coordinates required (lat, lng)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const url = `https://api.nasa.gov/planetary/earth/imagery?lon=${lng}&lat=${lat}&api_key=${apiKey}${date ? `&date=${date}` : ""}`;
        
        const response = await fetch(url);
        
        const imagery = {
          location: { lat, lng },
          date: date || new Date().toISOString().split("T")[0],
          imageUrl: url,
          satellite: "Landsat 8",
          resolution: "30m",
          bands: ["Red", "Green", "Blue", "NIR"],
          applications: [
            "Ocean color analysis",
            "Coastal monitoring",
            "Ship detection",
            "Oil spill detection",
          ],
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa",
            imagery,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "neo": {
        // Near Earth Objects
        const start = startDate || new Date().toISOString().split("T")[0];
        const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`NASA NEO API returned ${response.status}`);
        }
        
        const data = await response.json();
        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa",
            elementCount: data.element_count,
            nearEarthObjects: data.near_earth_objects,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "donki": {
        // Space Weather Database Of Notifications, Knowledge, Information
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const end = new Date().toISOString().split("T")[0];
        
        // Fetch solar flares
        const flareUrl = `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${apiKey}`;
        const flareResponse = await fetch(flareUrl);
        const solarFlares = flareResponse.ok ? await flareResponse.json() : [];
        
        // Fetch geomagnetic storms
        const gstUrl = `https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=${apiKey}`;
        const gstResponse = await fetch(gstUrl);
        const geomagneticStorms = gstResponse.ok ? await gstResponse.json() : [];

        const spaceWeather = {
          solarFlares: solarFlares.slice(0, 10),
          geomagneticStorms: geomagneticStorms.slice(0, 10),
          impact: {
            gpsAccuracy: geomagneticStorms.length > 0 ? "Minor degradation possible" : "Normal",
            hfRadio: solarFlares.length > 0 ? "Minor degradation possible" : "Normal",
            satelliteOps: "Normal",
            recommendation: "Monitor for updates during active periods",
          },
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa-donki",
            period: { start, end },
            spaceWeather,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "epic": {
        // Earth Polychromatic Imaging Camera
        const epicUrl = `https://api.nasa.gov/EPIC/api/natural?api_key=${apiKey}`;
        
        const response = await fetch(epicUrl);
        if (!response.ok) {
          throw new Error(`NASA EPIC API returned ${response.status}`);
        }
        
        const images = await response.json();
        
        const epicData = {
          date: date || new Date().toISOString().split("T")[0],
          images: images.slice(0, 5).map((img: any) => ({
            identifier: img.identifier,
            caption: img.caption,
            centroid_coordinates: img.centroid_coordinates,
            sun_j2000_position: img.sun_j2000_position,
            lunar_j2000_position: img.lunar_j2000_position,
          })),
          satellite: "DSCOVR",
          distance: "1.5 million km from Earth",
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa-epic",
            epic: epicData,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mars-weather": {
        // InSight Mars Weather Service
        const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`NASA InSight API returned ${response.status}`);
        }
        
        const data = await response.json();
        const sols = data.sol_keys || [];
        const latestSol = sols[sols.length - 1];
        const solData = data[latestSol] || {};

        const marsWeather = {
          sol: parseInt(latestSol) || 0,
          season: solData.Season || "unknown",
          temperature: {
            average: solData.AT?.av || null,
            min: solData.AT?.mn || null,
            max: solData.AT?.mx || null,
          },
          pressure: solData.PRE?.av || null,
          wind: {
            speed: solData.HWS?.av || null,
            direction: solData.WD?.most_common?.compass_point || null,
          },
          note: "Data from InSight lander (reference for space operations planning)",
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: "nasa-insight",
            mars: marsWeather,
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
    console.error("[nasa-api] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
