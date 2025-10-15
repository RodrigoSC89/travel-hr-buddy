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
    // Query to get jobs by component with count and average duration
    // The query joins mmi_jobs with mmi_components to get component names
    // Filters for completed jobs only
    // Groups by component and calculates:
    // - count: total number of completed jobs per component
    // - avg_duration: average actual_hours per component
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select(`
        component_id,
        actual_hours,
        mmi_components!inner(component_name)
      `)
      .eq("status", "completed")
      .not("component_id", "is", null)
      .not("actual_hours", "is", null);

    if (error) {
      console.error("Database query error:", error);
      throw error;
    }

    // Group data by component and calculate statistics
    const componentStats = new Map<string, { count: number; totalHours: number }>();

    data?.forEach((job: any) => {
      const componentName = job.mmi_components?.component_name || "Unknown Component";
      const hours = parseFloat(job.actual_hours) || 0;

      if (!componentStats.has(componentName)) {
        componentStats.set(componentName, { count: 0, totalHours: 0 });
      }

      const stats = componentStats.get(componentName)!;
      stats.count += 1;
      stats.totalHours += hours;
    });

    // Transform into chart-friendly format
    const result = Array.from(componentStats.entries()).map(([component_id, stats]) => ({
      component_id,
      count: stats.count,
      avg_duration: stats.count > 0 ? parseFloat((stats.totalHours / stats.count).toFixed(2)) : 0,
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
        },
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
        },
      }
    );
  }
});
