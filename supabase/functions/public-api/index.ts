import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Extract API key from headers
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate API key and get permissions
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // In a real implementation, you'd validate the API key against a database
    // For demo purposes, we'll use a simple validation
    if (!apiKey.startsWith("naut_")) {
      return new Response(
        JSON.stringify({ error: "Invalid API key format" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Rate limiting (simplified)
    const clientId = apiKey.substring(0, 20);
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = 1000; // requests per hour

    const clientLimits = rateLimitStore.get(clientId);
    if (clientLimits) {
      if (now < clientLimits.resetTime) {
        if (clientLimits.count >= limit) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded" }),
            { 
              status: 429, 
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": clientLimits.resetTime.toString()
              } 
            }
          );
        }
        clientLimits.count++;
      } else {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    }

    // API Routes
    if (path.startsWith("/api/v1/vessels") && method === "GET") {
      return await handleVesselsGet(supabase);
    }

    if (path.startsWith("/api/v1/certificates") && method === "GET") {
      return await handleCertificatesGet(supabase);
    }

    if (path.startsWith("/api/v1/certificates") && method === "POST") {
      const body = await req.json();
      return await handleCertificatesPost(supabase, body);
    }

    if (path.startsWith("/api/v1/analytics/crew") && method === "GET") {
      return await handleCrewAnalytics(supabase);
    }

    if (path.startsWith("/api/v1/peotram/reports") && method === "GET") {
      return await handlePeotramReports(supabase);
    }

    if (path === "/api/v1/status" && method === "GET") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          version: "1.0.0",
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleVesselsGet(supabase: any) {
  try {
    const { data: vessels, error } = await supabase
      .from("vessels")
      .select(`
        id,
        name,
        type,
        imo_number,
        flag,
        built_year,
        gross_tonnage,
        status,
        current_location,
        created_at
      `)
      .limit(50);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data: vessels || [],
        meta: {
          total: vessels?.length || 0,
          limit: 50,
          endpoint: "/api/v1/vessels"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Vessels API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch vessels" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleCertificatesGet(supabase: any) {
  try {
    const { data: certificates, error } = await supabase
      .from("certificates")
      .select(`
        id,
        certificate_type,
        certificate_number,
        issue_date,
        expiry_date,
        status,
        issuing_authority,
        employee_id,
        created_at
      `)
      .limit(100);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data: certificates || [],
        meta: {
          total: certificates?.length || 0,
          limit: 100,
          endpoint: "/api/v1/certificates"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Certificates API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch certificates" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleCertificatesPost(supabase: any, body: any) {
  try {
    const { data: certificate, error } = await supabase
      .from("certificates")
      .insert([{
        certificate_type: body.certificate_type,
        certificate_number: body.certificate_number,
        issue_date: body.issue_date,
        expiry_date: body.expiry_date,
        issuing_authority: body.issuing_authority,
        employee_id: body.employee_id,
        status: "active"
      }])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data: certificate,
        message: "Certificate created successfully"
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Certificate Creation Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create certificate" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handleCrewAnalytics(supabase: any) {
  try {
    const { data: crewMembers, error } = await supabase
      .from("crew_members")
      .select(`
        id,
        full_name,
        position,
        status,
        experience_years,
        created_at
      `)
      .limit(50);

    if (error) throw error;

    // Generate analytics summary
    const analytics = {
      total_crew: crewMembers?.length || 0,
      by_status: crewMembers?.reduce((acc: any, member: any) => {
        acc[member.status] = (acc[member.status] || 0) + 1;
        return acc;
      }, {}) || {},
      avg_experience: crewMembers?.reduce((sum: number, member: any) => 
        sum + (member.experience_years || 0), 0) / (crewMembers?.length || 1) || 0,
      by_position: crewMembers?.reduce((acc: any, member: any) => {
        acc[member.position] = (acc[member.position] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    return new Response(
      JSON.stringify({
        data: analytics,
        crew_details: crewMembers || [],
        meta: {
          generated_at: new Date().toISOString(),
          endpoint: "/api/v1/analytics/crew"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Crew Analytics Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate crew analytics" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

async function handlePeotramReports(supabase: any) {
  try {
    const { data: audits, error } = await supabase
      .from("peotram_audits")
      .select(`
        id,
        audit_type,
        status,
        overall_score,
        non_conformities_count,
        auditor_name,
        audit_date,
        vessel_id,
        created_at
      `)
      .limit(25);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data: audits || [],
        meta: {
          total: audits?.length || 0,
          limit: 25,
          endpoint: "/api/v1/peotram/reports"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("PEOTRAM Reports Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch PEOTRAM reports" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}