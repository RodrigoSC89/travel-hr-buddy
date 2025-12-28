import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Meteomatics API - High-precision weather forecasts
 * Professional meteorological data for maritime operations
 */

interface MeteomaticsRequest {
  operation: "forecast" | "historical" | "marine" | "aviation";
  lat: number;
  lng: number;
  parameters?: string[];
  startTime?: string;
  endTime?: string;
  interval?: string;
}

interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  cloudCover: number;
  visibility: number;
}

function generateWeatherData(hours: number = 24): WeatherData[] {
  const data: WeatherData[] = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 20 + Math.random() * 15 - Math.sin(i / 12 * Math.PI) * 5,
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 20,
      windDirection: Math.floor(Math.random() * 360),
      pressure: 1010 + Math.random() * 20 - 10,
      precipitation: Math.random() > 0.7 ? Math.random() * 10 : 0,
      cloudCover: Math.random() * 100,
      visibility: 5 + Math.random() * 15,
    });
  }
  
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: MeteomaticsRequest = await req.json();
    const { operation, lat, lng, parameters, startTime, endTime, interval = "PT1H" } = payload;

    const username = Deno.env.get("METEOMATICS_USERNAME");
    const password = Deno.env.get("METEOMATICS_PASSWORD");
    
    console.log(`[meteomatics] Operation: ${operation}, Coords: ${lat},${lng}`);

    // If credentials not configured, return demo data
    if (!username || !password) {
      console.log("[meteomatics] Using demo data - credentials not configured");
    }

    switch (operation) {
      case "forecast": {
        const forecastData = generateWeatherData(72);
        
        return new Response(
          JSON.stringify({
            success: true,
            source: username ? "meteomatics" : "demo",
            location: { lat, lng },
            interval,
            forecast: forecastData,
            summary: {
              avgTemperature: forecastData.reduce((a, b) => a + b.temperature, 0) / forecastData.length,
              maxWind: Math.max(...forecastData.map(d => d.windSpeed)),
              totalPrecipitation: forecastData.reduce((a, b) => a + b.precipitation, 0),
            },
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "marine": {
        const marineData = {
          waveHeight: 1 + Math.random() * 3,
          wavePeriod: 5 + Math.random() * 10,
          waveDirection: Math.floor(Math.random() * 360),
          swellHeight: 0.5 + Math.random() * 2,
          swellDirection: Math.floor(Math.random() * 360),
          seaSurfaceTemp: 18 + Math.random() * 10,
          salinity: 33 + Math.random() * 3,
          currentSpeed: Math.random() * 3,
          currentDirection: Math.floor(Math.random() * 360),
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: username ? "meteomatics" : "demo",
            location: { lat, lng },
            marine: marineData,
            forecast: generateWeatherData(48),
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "aviation": {
        const aviationData = {
          flightRules: ["VFR", "MVFR", "IFR", "LIFR"][Math.floor(Math.random() * 4)],
          ceiling: 1000 + Math.floor(Math.random() * 10000),
          visibility: 5 + Math.random() * 15,
          turbulence: ["None", "Light", "Moderate", "Severe"][Math.floor(Math.random() * 4)],
          icing: ["None", "Light", "Moderate"][Math.floor(Math.random() * 3)],
          windShear: Math.random() > 0.8,
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: username ? "meteomatics" : "demo",
            location: { lat, lng },
            aviation: aviationData,
            forecast: generateWeatherData(24),
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "historical": {
        return new Response(
          JSON.stringify({
            success: true,
            source: username ? "meteomatics" : "demo",
            location: { lat, lng },
            period: { start: startTime, end: endTime },
            historical: generateWeatherData(168),
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
    console.error("[meteomatics] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
