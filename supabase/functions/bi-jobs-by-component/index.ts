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
    // Query completed jobs with component names and actual hours
    const { data: jobs, error } = await supabase
      .from('mmi_jobs')
      .select('component_id, actual_hours, mmi_components(component_name)')
      .eq('status', 'completed')
      .not('actual_hours', 'is', null);

    if (error) throw error;

    // Group by component and calculate statistics
    const statsMap = new Map<string, { count: number; totalHours: number; componentName: string }>();
    
    jobs?.forEach((job: any) => {
      const componentName = job.mmi_components?.component_name || job.component_id;
      const hours = parseFloat(job.actual_hours) || 0;
      
      if (!statsMap.has(componentName)) {
        statsMap.set(componentName, { count: 0, totalHours: 0, componentName });
      }
      
      const stats = statsMap.get(componentName)!;
      stats.count++;
      stats.totalHours += hours;
    });

    // Convert to array and calculate averages
    const result = Array.from(statsMap.values())
      .map(({ componentName, count, totalHours }) => ({
        component_id: componentName,
        count,
        avg_duration: count > 0 ? parseFloat((totalHours / count).toFixed(1)) : 0
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
