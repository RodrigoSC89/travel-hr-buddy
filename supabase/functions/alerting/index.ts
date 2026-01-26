// ============================================================================
// Supabase Edge Function: alerting
// Purpose: Serverless alerting system for ControlHub observability
// Schedule: Can be triggered manually or via cron
// ============================================================================

import { edgeLogger } from "../_shared/edge-logger.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TAG = "ALERTING";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Alert {
  id: string;
  timestamp: string;
  severity: string;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    edgeLogger.info(TAG, "Starting alerting system");

    // Fetch recent alerts from database
    let alerts: Alert[] = [];
    
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        edgeLogger.warn(TAG, "Alerts table not found or error fetching", { error: error.message });
        alerts = [];
      } else {
        alerts = data || [];
      }
    } catch (err) {
      edgeLogger.warn(TAG, "Error querying alerts table", { error: String(err) });
      alerts = [];
    }

    edgeLogger.info(TAG, `Found ${alerts.length} alerts`);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      alerts_count: alerts.length,
      alerts: alerts,
      message: alerts.length > 0 
        ? `Retrieved ${alerts.length} alerts` 
        : "No alerts found",
    };

    edgeLogger.success(TAG, "Alerting system completed successfully");

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    edgeLogger.error(TAG, "Unexpected error in alerting", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
