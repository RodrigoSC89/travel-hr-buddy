import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Supabase client with auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const start = url.searchParams.get("start"); // Start date (YYYY-MM-DD)
    const end = url.searchParams.get("end");     // End date (YYYY-MM-DD)
    const email = url.searchParams.get("email"); // Filter by email (admin only)

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const isAdmin = profile?.role === "admin";

    // Build base query
    let query = supabase
      .from("assistant_report_logs")
      .select("id, user_email, status, message, sent_at, user_id, report_type")
      .order("sent_at", { ascending: false })
      .limit(1000);

    // If not admin, show only user's own logs
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    } else {
      // Admins can filter by email
      if (email) {
        query = query.ilike("user_email", `%${email}%`);
      }
    }

    // Apply date filters if they exist
    if (start) {
      query = query.gte("sent_at", start);
    }
    if (end) {
      // Add time to end of day for end date
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte("sent_at", endDate.toISOString());
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching logs:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify(data || []),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
