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
    const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    const WINDY_API_KEY = Deno.env.get("WINDY_API_KEY");
    
    if (!OPENWEATHER_API_KEY) {
      console.error("OPENWEATHER_API_KEY not configured");
      throw new Error("OPENWEATHER_API_KEY is not configured");
    }

    const { action, lat, lon, layer, zoom } = await req.json();
    
    console.log("Weather Map Proxy request:", { action, lat, lon, layer, zoom });

    if (action === "get_keys") {
      // Return API keys for client-side map rendering
      return new Response(
        JSON.stringify({ 
          openweather: OPENWEATHER_API_KEY,
          windy: WINDY_API_KEY || null,
          success: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "weather_data") {
      // Fetch weather data from OpenWeatherMap
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
      
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return new Response(
        JSON.stringify({ data, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "forecast") {
      // Fetch forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
      
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return new Response(
        JSON.stringify({ data, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action", success: false }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in weather-map-proxy:", error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
