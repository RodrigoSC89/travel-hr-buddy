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
    console.log("Fetching DP incidents from database...");
    
    // Fetch incidents from the dp_incidents table
    const { data: dbIncidents, error: dbError } = await supabase
      .from("dp_incidents")
      .select("*")
      .order("date", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Transform database records to match frontend expected format
    const incidents = (dbIncidents || []).map((incident: any) => ({
      id: incident.id,
      title: incident.title,
      date: incident.date,
      vessel: incident.vessel,
      location: incident.location,
      rootCause: incident.root_cause,
      classDP: incident.class_dp,
      source: incident.source,
      link: incident.link,
      summary: incident.summary,
      tags: incident.tags || [],
    }));

    console.log(`Successfully fetched ${incidents.length} incidents from database`);

    return new Response(
      JSON.stringify({ 
        incidents,
        meta: {
          total: incidents.length,
          source: 'DP Intelligence Center - Database',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
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
