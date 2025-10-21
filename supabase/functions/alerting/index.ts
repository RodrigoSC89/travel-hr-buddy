import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

/**
 * Alerting Edge Function
 * 
 * Fetches alerts from Supabase and publishes them to MQTT broker.
 * This function can be triggered via cron or HTTP request.
 */
export const handler = async (req: Request) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch recent alerts from the database
    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("*")
      .limit(5)
      .order("timestamp", { ascending: false });
    
    if (error) {
      console.error("Error fetching alerts:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch alerts", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Note: MQTT publishing would typically require a server-side MQTT client
    // For edge functions, you might want to use HTTP webhooks or Supabase Realtime instead
    // This is a placeholder for the MQTT publishing logic
    console.log("Alerts fetched:", alerts);
    
    // If MQTT URL is provided, you could publish via HTTP bridge
    const mqttUrl = Deno.env.get("MQTT_URL");
    if (mqttUrl) {
      // Here you would implement HTTP-based MQTT publishing or use a bridge service
      console.log("MQTT publishing would happen here to:", mqttUrl);
    }
    
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        alerts: alerts || [],
        count: alerts?.length || 0 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unexpected error in alerting function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};

// Serve the function
Deno.serve(handler);
