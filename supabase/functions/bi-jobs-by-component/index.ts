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
    // Query to get completed jobs with component names and actual hours
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("component_id, actual_hours, mmi_components(component_name)")
      .eq("status", "completed")
      .not("component_id", "is", null);

    if (error) throw error;

    // Group by component_id, count jobs, and calculate average duration
    interface ComponentStats {
      count: number;
      totalHours: number;
      componentName: string;
    }

    const jobsByComponent = (data || []).reduce((acc: Record<string, ComponentStats>, job: any) => {
      const componentId = job.component_id;
      const actualHours = job.actual_hours || 0;
      const componentName = job.mmi_components?.component_name || componentId;

      if (componentId) {
        if (!acc[componentId]) {
          acc[componentId] = {
            count: 0,
            totalHours: 0,
            componentName,
          };
        }
        acc[componentId].count += 1;
        acc[componentId].totalHours += actualHours;
      }
      return acc;
    }, {});

    // Convert to array format expected by the chart and calculate averages
    const result = Object.entries(jobsByComponent)
      .map(([component_id, stats]) => ({
        component_id: stats.componentName,
        count: stats.count,
        avg_duration: stats.count > 0 ? Number((stats.totalHours / stats.count).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

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
