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
    // Query to get jobs count grouped by component_id
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("component_id")
      .not("component_id", "is", null);

    if (error) throw error;

    // Group by component_id and count
    const jobsByComponent = (data || []).reduce((acc: Record<string, number>, job: any) => {
      const componentId = job.component_id;
      if (componentId) {
        acc[componentId] = (acc[componentId] || 0) + 1;
      }
      return acc;
    }, {});

    // Convert to array format expected by the chart
    const result = Object.entries(jobsByComponent).map(([component_id, count]) => ({
      component_id,
      count,
    }));

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
