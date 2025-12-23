/// <reference path="../deno-ambient.d.ts" />
// ✅ Edge Function: forecast-risks-cron v1.0
// Automated daily risk forecasting for all active vessels
// Runs daily at 06:00 UTC to update tactical risk predictions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForecastResponse {
  success: boolean;
  risks_generated?: number;
  vessels_processed?: number;
  error?: string;
  details?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting automated risk forecast...');

    const apiBaseUrl = Deno.env.get("API_BASE_URL") || Deno.env.get("VITE_APP_URL");
    
    if (!apiBaseUrl) {
      console.error('❌ API_BASE_URL not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "API_BASE_URL not configured" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const forecastUrl = `${apiBaseUrl}/api/ai/forecast-risks`;
    console.log(`📡 Calling forecast API: ${forecastUrl}`);

    const response = await fetch(forecastUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        process_all: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API call failed: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API call failed: ${response.status}`,
          details: errorText
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result: ForecastResponse = await response.json();
    console.log(`✅ Forecast completed: ${result.risks_generated} risks for ${result.vessels_processed} vessels`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Risk forecast completed successfully',
        risks_generated: result.risks_generated,
        vessels_processed: result.vessels_processed,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('❌ Forecast cron error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to run risk forecast',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

console.log('📅 Forecast Risks Cron Function initialized');
