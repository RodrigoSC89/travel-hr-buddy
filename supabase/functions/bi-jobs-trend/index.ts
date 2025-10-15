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
    // Get the last 6 months of completed jobs data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: jobs, error } = await supabase
      .from("mmi_jobs")
      .select("completed_date")
      .eq("status", "completed")
      .gte("completed_date", sixMonthsAgo.toISOString().split("T")[0])
      .order("completed_date", { ascending: true });

    if (error) {
      throw error;
    }

    // Group jobs by month
    const monthlyData = new Map<string, number>();

    // Initialize last 6 months with zero counts
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyData.set(monthKey, 0);
    }

    // Count completed jobs per month
    jobs?.forEach((job) => {
      if (job.completed_date) {
        const monthKey = job.completed_date.slice(0, 7); // YYYY-MM format
        if (monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        }
      }
    });

    // Transform to array format for the chart
    const result = Array.from(monthlyData.entries()).map(([key, count]) => {
      const date = new Date(key + "-01");
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        total_jobs: count
      };
    });

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
    console.error("Error fetching jobs trend:", error);
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
