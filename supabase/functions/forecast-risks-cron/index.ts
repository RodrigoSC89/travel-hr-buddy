import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting automated risk forecast generation...");

    // Get all active vessels
    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active");

    if (vesselError) {
      throw new Error(`Failed to fetch vessels: ${vesselError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      console.log("No active vessels found");
      return new Response(
        JSON.stringify({ success: true, message: "No active vessels to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${vessels.length} active vessel(s)`);

    // Mark expired risks as resolved
    const { error: updateError } = await supabase
      .from("tactical_risks")
      .update({ status: "expired" })
      .lt("valid_until", new Date().toISOString().split("T")[0])
      .eq("status", "open");

    if (updateError) {
      console.error("Error marking expired risks:", updateError);
    }

    const results = [];

    // Generate risks for each vessel
    for (const vessel of vessels) {
      try {
        console.log(`Generating risks for vessel: ${vessel.name}`);

        // Call the forecast API
        const apiUrl = Deno.env.get("API_BASE_URL") || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/ai/forecast-risks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vessel_id: vessel.id }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            success: true,
            risks_created: data.results?.[0]?.risks_created || 0,
          });
          console.log(`✓ Successfully generated risks for ${vessel.name}`);
        } else {
          results.push({
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            success: false,
            error: `API returned ${response.status}`,
          });
          console.error(`✗ Failed to generate risks for ${vessel.name}`);
        }
      } catch (error) {
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`✗ Error processing vessel ${vessel.name}:`, error);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Completed: ${successCount}/${vessels.length} vessels processed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        vessels_processed: vessels.length,
        successful: successCount,
        failed: vessels.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
