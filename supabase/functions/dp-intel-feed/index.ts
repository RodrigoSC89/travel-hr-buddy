import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedQuery {
  incident_id?: string;
  incident_type?: string;
  severity?: string;
  vessel_class?: string;
  imca_standard?: string;
  search?: string;
  limit?: number;
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Parse query parameters
    const url = new URL(req.url);
    const query: FeedQuery = {
      incident_id: url.searchParams.get("incident_id") || undefined,
      incident_type: url.searchParams.get("incident_type") || undefined,
      severity: url.searchParams.get("severity") || undefined,
      vessel_class: url.searchParams.get("vessel_class") || undefined,
      imca_standard: url.searchParams.get("imca_standard") || undefined,
      search: url.searchParams.get("search") || undefined,
      limit: parseInt(url.searchParams.get("limit") || "10"),
      status: url.searchParams.get("status") || undefined,
    };

    console.log("DP Intel Feed query:", query);

    // Build the query
    let dbQuery = supabase
      .from("dp_incidents")
      .select("*")
      .order("incident_date", { ascending: false });

    // Apply filters
    if (query.incident_id) {
      dbQuery = dbQuery.eq("incident_id", query.incident_id);
    }

    if (query.incident_type) {
      dbQuery = dbQuery.eq("incident_type", query.incident_type);
    }

    if (query.severity) {
      dbQuery = dbQuery.eq("severity", query.severity);
    }

    if (query.vessel_class) {
      dbQuery = dbQuery.eq("vessel_class", query.vessel_class);
    }

    if (query.status) {
      dbQuery = dbQuery.eq("status", query.status);
    }

    if (query.imca_standard) {
      dbQuery = dbQuery.contains("imca_standards", [query.imca_standard]);
    }

    if (query.search) {
      // Search in title, description, and root_cause
      dbQuery = dbQuery.or(
        `title.ilike.%${query.search}%,description.ilike.%${query.search}%,root_cause.ilike.%${query.search}%`
      );
    }

    // Apply limit
    dbQuery = dbQuery.limit(query.limit || 10);

    const { data: incidents, error } = await dbQuery;

    if (error) {
      console.error("Error fetching DP incidents:", error);
      throw error;
    }

    // Format response
    const response = {
      success: true,
      count: incidents?.length || 0,
      incidents: incidents || [],
      filters_applied: query,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in dp-intel-feed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
