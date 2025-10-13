// Edge Function: restore-analytics
// Returns restore statistics and daily data for the analytics dashboard

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email filter from query params
    const url = new URL(req.url);
    const emailFilter = url.searchParams.get("email") || "";

    console.log(`📊 Fetching restore analytics for email filter: "${emailFilter}"`);

    // Fetch daily data
    const { data: dailyData, error: dailyError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: emailFilter }
    );

    if (dailyError) {
      console.error("Error fetching daily data:", dailyError);
      throw dailyError;
    }

    // Fetch summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: emailFilter }
    );

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
      throw summaryError;
    }

    const summary: RestoreSummary = summaryData && summaryData.length > 0 
      ? summaryData[0] 
      : { total: 0, unique_docs: 0, avg_per_day: 0 };

    const response = {
      summary,
      dailyData: dailyData || [],
    };

    console.log(`✅ Successfully fetched analytics: ${summary.total} total restores, ${dailyData?.length || 0} days`);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in restore-analytics:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
