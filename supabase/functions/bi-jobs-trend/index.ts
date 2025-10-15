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
    // Query to get jobs grouped by status and date (month)
    // This aggregates jobs by month and status to show trends
    const { data, error } = await supabase
      .from("mmi_jobs")
      .select("status, created_at, completed_date")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group jobs by month and status
    const trendsMap = new Map<string, { completed: number; pending: number; in_progress: number }>();

    (data || []).forEach((job: any) => {
      const date = new Date(job.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trendsMap.has(monthKey)) {
        trendsMap.set(monthKey, { completed: 0, pending: 0, in_progress: 0 });
      }

      const trend = trendsMap.get(monthKey)!;
      
      if (job.status === "completed") {
        trend.completed++;
      } else if (job.status === "pending") {
        trend.pending++;
      } else if (job.status === "in_progress") {
        trend.in_progress++;
      }
    });

    // Convert map to array and sort by date
    const result = Array.from(trendsMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // Get last 6 months

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
    console.error("BI Jobs Trend Error:", error);
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
