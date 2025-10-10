import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface APIStatus {
  [key: string]: "valid" | "invalid" | "missing" | "checking";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Parse request body
    const body = await req.json();
    const apiStatuses: APIStatus = body;

    // Get current user if authenticated
    let userId = null;
    if (authHeader) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      userId = session?.user?.id || null;
    }

    // Prepare log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      user_id: userId,
      api_statuses: apiStatuses,
      user_agent: req.headers.get("user-agent") || "unknown",
    };

    // Log to console (in production, you might want to store this in a database table)
    console.log("API Status Log:", JSON.stringify(logEntry, null, 2));

    // You could optionally store this in a Supabase table
    // Example: await supabase.from('api_status_logs').insert([logEntry]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "API status logged successfully",
        logged_at: logEntry.timestamp,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error logging API status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to log API status",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
