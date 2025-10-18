import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const apiBaseUrl = Deno.env.get("API_BASE_URL") || "http://localhost:3000";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scheduled risk forecast generation...");
    const startTime = Date.now();

    // Get all active vessels
    const { data: vessels, error: vesselsError } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active");

    if (vesselsError) {
      console.error("Error fetching vessels:", vesselsError);
      throw vesselsError;
    }

    console.log(`Found ${vessels?.length || 0} active vessels`);

    if (!vessels || vessels.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active vessels found",
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark expired risks as resolved
    console.log("Marking expired risks as resolved...");
    const { data: expiredRisks, error: expiredError } = await supabase
      .from("tactical_risks")
      .update({ status: "Expired" })
      .eq("status", "Active")
      .lt("valid_until", new Date().toISOString())
      .select();

    if (expiredError) {
      console.error("Error updating expired risks:", expiredError);
    } else {
      console.log(`Marked ${expiredRisks?.length || 0} risks as expired`);
    }

    // Call the forecast API for all vessels
    console.log("Calling forecast-risks API...");
    try {
      const response = await fetch(`${apiBaseUrl}/api/ai/forecast-risks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body means process all vessels
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Forecast API error:", errorText);
        throw new Error(
          `Forecast API failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Forecast API result:", result);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully generated risk forecasts for ${vessels.length} vessel(s)`,
          vessels_processed: vessels.length,
          expired_risks_marked: expiredRisks?.length || 0,
          forecasts_generated: result.forecasts?.length || 0,
          duration_seconds: duration.toFixed(2),
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (apiError) {
      console.error("Error calling forecast API:", apiError);
      throw apiError;
    }
  } catch (error: any) {
    console.error("Error in forecast-risks-cron:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

console.log("Forecast risks cron function initialized");
