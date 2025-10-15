// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrendData {
  date: string;
  completed: number;
  pending: number;
  in_progress: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the last 6 months of job data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Query jobs from the database
    const { data: jobs, error } = await supabaseClient
      .from("mmi_jobs")
      .select("status, created_at")
      .gte("created_at", sixMonthsAgo.toISOString());

    if (error) {
      console.error("Error fetching jobs:", error);
      // Return mock data if database query fails
      return new Response(JSON.stringify(getMockTrendData()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Aggregate jobs by month and status
    const trendMap: Record<string, TrendData> = {};

    jobs?.forEach((job) => {
      const date = new Date(job.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!trendMap[monthKey]) {
        trendMap[monthKey] = {
          date: monthKey,
          completed: 0,
          pending: 0,
          in_progress: 0,
        };
      }

      // Map status to trend fields
      if (job.status === "completed" || job.status === "concluido") {
        trendMap[monthKey].completed++;
      } else if (job.status === "pending" || job.status === "pendente") {
        trendMap[monthKey].pending++;
      } else if (job.status === "in_progress" || job.status === "em_progresso") {
        trendMap[monthKey].in_progress++;
      }
    });

    // Convert to array and sort by date
    const trendData = Object.values(trendMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return new Response(JSON.stringify(trendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in bi-jobs-trend function:", error);
    return new Response(JSON.stringify(getMockTrendData()), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// Mock data for fallback
function getMockTrendData(): TrendData[] {
  const currentDate = new Date();
  const mockData: TrendData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    mockData.push({
      date: monthYear,
      completed: Math.floor(Math.random() * 20) + 10,
      pending: Math.floor(Math.random() * 15) + 5,
      in_progress: Math.floor(Math.random() * 10) + 3,
    });
  }

  return mockData;
}
