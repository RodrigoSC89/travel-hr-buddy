import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration not found");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query jobs with status 'completed', grouped by component_id
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("component_id, created_at, updated_at")
      .eq("status", "completed");

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Group by component_id and calculate count + avg_duration
    const groupedData = (data || []).reduce((acc: Record<string, { count: number, totalDuration: number }>, job: any) => {
      const componentId = job.component_id || "Unknown";
      
      // Calculate duration in hours
      const createdAt = new Date(job.created_at).getTime();
      const updatedAt = new Date(job.updated_at).getTime();
      const duration = (updatedAt - createdAt) / (1000 * 60 * 60);
      
      if (!acc[componentId]) {
        acc[componentId] = { count: 0, totalDuration: 0 };
      }
      
      acc[componentId].count += 1;
      acc[componentId].totalDuration += duration;
      
      return acc;
    }, {});

    // Format the result as an array of objects with component_id, count, and avg_duration
    const result = Object.entries(groupedData)
      .map(([component_id, stats]) => ({
        component_id,
        count: stats.count,
        avg_duration: parseFloat((stats.totalDuration / stats.count).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in jobs-by-component function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
