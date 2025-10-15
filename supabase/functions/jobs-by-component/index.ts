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
    // Duration is calculated as the difference between updated_at and created_at for completed jobs
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("component_name, created_at, updated_at, status")
      .eq("status", "completed");

    if (error) {
      throw error;
    }

    // Group by component and calculate statistics
    const componentStats: { [key: string]: { count: number; totalDuration: number } } = {};

    data?.forEach((job: any) => {
      const componentName = job.component_name || "Não especificado";
      
      if (!componentStats[componentName]) {
        componentStats[componentName] = { count: 0, totalDuration: 0 };
      }

      componentStats[componentName].count++;

      // Calculate duration in hours
      if (job.created_at && job.updated_at) {
        const createdAt = new Date(job.created_at).getTime();
        const updatedAt = new Date(job.updated_at).getTime();
        const durationHours = (updatedAt - createdAt) / (1000 * 60 * 60);
        componentStats[componentName].totalDuration += durationHours;
      }
    });

    // Transform to array format expected by the chart
    const result = Object.entries(componentStats).map(([component, stats]) => ({
      component_id: component,
      count: stats.count,
      avg_duration: stats.count > 0 ? parseFloat((stats.totalDuration / stats.count).toFixed(2)) : 0,
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
    console.error("Error fetching jobs by component:", error);
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
