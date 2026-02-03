import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCrewRequest {
  name: string;
  email?: string;
  phone?: string;
  position: string;
  rank?: string;
  nationality?: string;
  date_of_birth?: string;
  passport_number?: string;
  seaman_book_number?: string;
  hire_date?: string;
  vessel_id?: string;
  organization_id: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications?: Array<{
    type: string;
    number: string;
    issued_date: string;
    expiry_date: string;
    issuing_authority: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const crewData: CreateCrewRequest = await req.json();

    // Validation
    if (!crewData.name || !crewData.position || !crewData.organization_id) {
      return new Response(
        JSON.stringify({ error: "Name, position, and organization_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user has permission - try organization_members first
    let { data: userOrg } = await adminSupabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", crewData.organization_id)
      .single();
    
    if (!userOrg) {
      const { data: legacyOrg } = await adminSupabase
        .from("organization_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", crewData.organization_id)
        .single();
      userOrg = legacyOrg;
    }

    if (!userOrg || !["admin", "manager", "hr_manager"].includes(userOrg.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create crew member
    const { data: crewMember, error: createError } = await adminSupabase
      .from("crew_members")
      .insert({
        name: crewData.name,
        email: crewData.email,
        phone: crewData.phone,
        position: crewData.position,
        rank: crewData.rank,
        nationality: crewData.nationality,
        date_of_birth: crewData.date_of_birth,
        passport_number: crewData.passport_number,
        seaman_book_number: crewData.seaman_book_number,
        hire_date: crewData.hire_date || new Date().toISOString(),
        vessel_id: crewData.vessel_id,
        organization_id: crewData.organization_id,
        emergency_contact: crewData.emergency_contact,
        status: "active",
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create crew error:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add certifications if provided
    if (crewData.certifications && crewData.certifications.length > 0) {
      const certifications = crewData.certifications.map(cert => ({
        crew_member_id: crewMember.id,
        certificate_type: cert.type,
        certificate_number: cert.number,
        issue_date: cert.issued_date,
        expiry_date: cert.expiry_date,
        issuing_authority: cert.issuing_authority,
        status: new Date(cert.expiry_date) > new Date() ? "valid" : "expired",
        organization_id: crewData.organization_id,
      }));

      await adminSupabase.from("maritime_certificates").insert(certifications);
    }

    // Log the action
    await adminSupabase.from("access_logs").insert({
      user_id: user.id,
      action: "crew_created",
      module_accessed: "crew",
      result: "success",
      severity: "info",
      details: { crew_id: crewMember.id, name: crewData.name },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: crewMember,
        message: "Crew member created successfully"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-crew error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
