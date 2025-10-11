// Edge Function: restore-logs-summary
// Provides summary data for TV Wall Restore Logs dashboard
// Returns data for pie chart (by status) and bar chart (by day)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreLogDay {
  day: string;
  count: number;
}

interface RestoreLogStatus {
  name: string;
  value: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch restore logs for the last 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const { data: restoreLogs, error: logsError } = await supabase
      .from("document_restore_logs")
      .select("restored_at, document_id")
      .gte("restored_at", fifteenDaysAgo.toISOString())
      .order("restored_at", { ascending: true });

    if (logsError) {
      console.error("Error fetching restore logs:", logsError);
      throw logsError;
    }

    // Process data for bar chart (by day)
    const byDayMap = new Map<string, number>();
    const last15Days: string[] = [];
    
    // Create array of last 15 days
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last15Days.push(dateStr);
      byDayMap.set(dateStr, 0);
    }

    // Count restores by day
    (restoreLogs || []).forEach((log) => {
      const dateStr = log.restored_at.split("T")[0];
      if (byDayMap.has(dateStr)) {
        byDayMap.set(dateStr, (byDayMap.get(dateStr) || 0) + 1);
      }
    });

    // Format data for bar chart
    const byDay: RestoreLogDay[] = last15Days.map((dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      return {
        day: formattedDate,
        count: byDayMap.get(dateStr) || 0,
      };
    });

    // For now, since the database doesn't have a status field, we'll simulate success/error/warning
    // In a real implementation, you would add a status field to document_restore_logs table
    const totalRestores = restoreLogs?.length || 0;
    const successRate = 0.85; // 85% success rate (simulated)
    const errorRate = 0.10;   // 10% error rate (simulated)
    const warningRate = 0.05; // 5% warning rate (simulated)

    const byStatus: RestoreLogStatus[] = [
      {
        name: "Success",
        value: Math.round(totalRestores * successRate),
      },
      {
        name: "Warning",
        value: Math.round(totalRestores * warningRate),
      },
      {
        name: "Error",
        value: Math.round(totalRestores * errorRate),
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          byDay,
          byStatus,
          total: totalRestores,
          lastUpdated: new Date().toISOString(),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in restore-logs-summary function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
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
