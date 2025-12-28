import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * API Health Monitor
 * Checks health status of all external API integrations
 */

interface APIStatus {
  name: string;
  displayName: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  responseTime: number;
  lastCheck: string;
  quota?: {
    used: number;
    limit: number;
    percent: number;
  };
  environment: "production" | "sandbox" | "demo";
  message?: string;
}

interface HealthCheckRequest {
  operation: "check-all" | "check-single" | "get-status";
  apiName?: string;
}

async function checkAPIHealth(name: string): Promise<APIStatus> {
  const startTime = Date.now();
  let status: APIStatus["status"] = "unknown";
  let responseTime = 0;
  let message = "";
  let environment: APIStatus["environment"] = "production";

  try {
    switch (name) {
      case "openweathermap": {
        const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
        if (!apiKey) {
          status = "down";
          message = "API Key not configured";
          break;
        }
        
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=-23.5505&lon=-46.6333&appid=${apiKey}`);
        responseTime = Date.now() - startTime;
        status = resp.ok ? "healthy" : "degraded";
        message = resp.ok ? "Operational" : `HTTP ${resp.status}`;
        break;
      }

      case "stormglass": {
        const apiKey = Deno.env.get("STORMGLASS_API_KEY");
        if (!apiKey) {
          status = "down";
          message = "API Key not configured";
          break;
        }
        
        // Don't actually call to save quota, just check key exists
        responseTime = 50;
        status = "healthy";
        message = "API Key configured";
        break;
      }

      case "amadeus": {
        const apiKey = Deno.env.get("AMADEUS_API_KEY");
        const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
        
        if (!apiKey || !apiSecret) {
          status = "down";
          message = "API credentials not configured";
          break;
        }

        const tokenResp = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: apiKey,
            client_secret: apiSecret,
          }),
        });
        
        responseTime = Date.now() - startTime;
        status = tokenResp.ok ? "healthy" : "degraded";
        environment = "production";
        message = tokenResp.ok ? "Production environment active" : `Auth failed: ${tokenResp.status}`;
        break;
      }

      case "windy": {
        const apiKey = Deno.env.get("WINDY_API_KEY");
        status = apiKey ? "healthy" : "degraded";
        responseTime = 30;
        message = apiKey ? "API Key configured" : "Using embed fallback";
        break;
      }

      case "noaa": {
        const resp = await fetch("https://api.weather.gov/");
        responseTime = Date.now() - startTime;
        status = resp.ok ? "healthy" : "degraded";
        message = "Public API - No key required";
        break;
      }

      case "mapbox": {
        const token = Deno.env.get("MAPBOX_PUBLIC_TOKEN");
        status = token ? "healthy" : "down";
        responseTime = 20;
        message = token ? "Token configured" : "Token not configured";
        break;
      }

      case "elevenlabs": {
        const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
        status = apiKey ? "healthy" : "degraded";
        responseTime = 25;
        message = apiKey ? "Voice API ready" : "Not configured";
        break;
      }

      case "openai": {
        const apiKey = Deno.env.get("OPENAI_API_KEY");
        status = apiKey ? "healthy" : "degraded";
        responseTime = 30;
        message = apiKey ? "AI API ready" : "Not configured";
        break;
      }

      case "perplexity": {
        const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
        status = apiKey ? "healthy" : "degraded";
        responseTime = 25;
        message = apiKey ? "Search API ready" : "Not configured";
        break;
      }

      case "twilio": {
        const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const phoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
        
        if (accountSid && authToken && phoneNumber) {
          // Verificar credenciais com API real
          try {
            const twilioResp = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
              {
                headers: {
                  "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`)
                }
              }
            );
            responseTime = Date.now() - startTime;
            status = twilioResp.ok ? "healthy" : "degraded";
            environment = twilioResp.ok ? "production" : "demo";
            message = twilioResp.ok ? "Messaging ready" : `Auth failed: ${twilioResp.status}`;
          } catch {
            status = "degraded";
            environment = "demo";
            message = "Connection failed";
          }
        } else {
          status = "degraded";
          responseTime = 20;
          environment = "demo";
          message = "Demo mode - Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER";
        }
        break;
      }

      case "marine-traffic": {
        // Corrigido: usar MARINETRAFFIC_API_KEY (sem underscore entre MARINE e TRAFFIC)
        const apiKey = Deno.env.get("MARINETRAFFIC_API_KEY");
        status = apiKey ? "healthy" : "degraded";
        responseTime = 30;
        environment = apiKey ? "production" : "demo";
        message = apiKey ? "AIS tracking active" : "Demo mode with simulated data";
        break;
      }

      default:
        status = "unknown";
        message = `Unknown API: ${name}`;
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    status = "down";
    message = error instanceof Error ? error.message : "Connection failed";
  }

  const displayNames: Record<string, string> = {
    openweathermap: "OpenWeatherMap",
    stormglass: "StormGlass",
    amadeus: "Amadeus",
    windy: "Windy",
    noaa: "NOAA",
    mapbox: "Mapbox",
    elevenlabs: "ElevenLabs",
    openai: "OpenAI",
    perplexity: "Perplexity",
    twilio: "Twilio",
    "marine-traffic": "MarineTraffic",
  };

  return {
    name,
    displayName: displayNames[name] || name,
    status,
    responseTime,
    lastCheck: new Date().toISOString(),
    environment,
    message,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: HealthCheckRequest = await req.json();
    const { operation, apiName } = payload;

    console.log(`[api-health-monitor] Operation: ${operation}`);

    switch (operation) {
      case "check-all": {
        const apis = [
          "openweathermap",
          "stormglass",
          "amadeus",
          "windy",
          "noaa",
          "mapbox",
          "elevenlabs",
          "openai",
          "perplexity",
          "twilio",
          "marine-traffic",
        ];

        const results = await Promise.all(apis.map(checkAPIHealth));
        
        const summary = {
          healthy: results.filter(r => r.status === "healthy").length,
          degraded: results.filter(r => r.status === "degraded").length,
          down: results.filter(r => r.status === "down").length,
          unknown: results.filter(r => r.status === "unknown").length,
          avgResponseTime: Math.round(results.reduce((acc, r) => acc + r.responseTime, 0) / results.length),
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            summary,
            apis: results,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check-single": {
        if (!apiName) {
          return new Response(
            JSON.stringify({ error: "API name required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const result = await checkAPIHealth(apiName);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            api: result,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-status": {
        // Return cached/static status for dashboard display
        const staticStatus = {
          production: ["openweathermap", "amadeus", "noaa", "mapbox"],
          configured: ["stormglass", "windy", "elevenlabs", "openai", "perplexity"],
          demo: ["twilio", "marine-traffic"],
          lastUpdate: new Date().toISOString(),
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            status: staticStatus,
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
    console.error("[api-health-monitor] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
