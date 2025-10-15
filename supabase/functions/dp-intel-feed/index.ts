import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse query parameters for filtering
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const classDP = url.searchParams.get("class_dp");
    const source = url.searchParams.get("source");
    const searchTag = url.searchParams.get("tag");

    // Build query
    let query = supabase
      .from("dp_incidents")
      .select("*")
      .order("incident_date", { ascending: false })
      .limit(limit);

    // Apply filters if provided
    if (classDP) {
      query = query.eq("class_dp", classDP);
    }
    if (source) {
      query = query.eq("source", source);
    }
    if (searchTag) {
      query = query.contains("tags", [searchTag]);
    }

    const { data: incidents, error } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match expected format
    const transformedIncidents = (incidents || []).map((incident) => ({
      id: incident.id,
      title: incident.title,
      date: incident.incident_date,
      vessel: incident.vessel,
      location: incident.location,
      rootCause: incident.root_cause,
      classDP: incident.class_dp,
      source: incident.source,
      link: incident.link,
      summary: incident.summary,
      tags: incident.tags || [],
    }));

    return new Response(
      JSON.stringify({ 
        incidents: transformedIncidents,
        meta: {
          total: transformedIncidents.length,
          source: 'DP Intelligence Center - Database',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          filters: {
            class_dp: classDP || null,
            source: source || null,
            tag: searchTag || null,
            limit
          }
        }
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );

  } catch (error) {
    console.error("DP Intel Feed Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch DP incidents feed",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
