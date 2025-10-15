import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Query to get job statistics by component
    // Count completed jobs and calculate average duration in hours
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select(`
        component_id,
        mmi_components!inner(component_name),
        status,
        actual_hours
      `)
      .eq("status", "completed");

    if (error) {
      throw error;
    }

    // Group by component and calculate statistics
    const statsMap = new Map<string, {
      component_id: string;
      component_name: string;
      count: number;
      total_hours: number;
    }>();

    data?.forEach((job: any) => {
      const componentId = job.component_id;
      const componentName = job.mmi_components?.component_name || "Unknown";
      
      if (!statsMap.has(componentId)) {
        statsMap.set(componentId, {
          component_id: componentId,
          component_name: componentName,
          count: 0,
          total_hours: 0,
        });
      }

      const stats = statsMap.get(componentId)!;
      stats.count += 1;
      stats.total_hours += job.actual_hours || 0;
    });

    // Convert to array and calculate averages
    const result = Array.from(statsMap.values()).map(stats => ({
      component_id: stats.component_name,
      count: stats.count,
      avg_duration: stats.count > 0 ? Number((stats.total_hours / stats.count).toFixed(2)) : 0,
    }));

    // Sort by count descending
    result.sort((a, b) => b.count - a.count);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json",
        } 
      }
    );
  } catch (error) {
    console.error("BI Jobs by Component Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json",
        } 
      }
    );
  }
});
