import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddCertificationRequest {
  crew_member_id: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  issuing_country?: string;
  stcw_code?: string;
  endorsement_number?: string;
  notes?: string;
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

    const certData: AddCertificationRequest = await req.json();

    // Validation
    if (!certData.crew_member_id || !certData.certificate_type || !certData.certificate_number) {
      return new Response(
        JSON.stringify({ error: "crew_member_id, certificate_type, and certificate_number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get crew member to verify organization
    const { data: crewMember, error: crewError } = await adminSupabase
      .from("crew_members")
      .select("id, organization_id, name")
      .eq("id", certData.crew_member_id)
      .single();

    if (crewError || !crewMember) {
      return new Response(
        JSON.stringify({ error: "Crew member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user has permission - try organization_members first
    let { data: userOrg } = await adminSupabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", crewMember.organization_id)
      .single();
    
    if (!userOrg) {
      const { data: legacyOrg } = await adminSupabase
        .from("organization_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", crewMember.organization_id)
        .single();
      userOrg = legacyOrg;
    }

    if (!userOrg || !["admin", "manager", "hr_manager"].includes(userOrg.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine status based on expiry date
    const expiryDate = new Date(certData.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = "valid";
    if (daysUntilExpiry < 0) {
      status = "expired";
    } else if (daysUntilExpiry <= 30) {
      status = "expiring_soon";
    }

    // Create certification
    const { data: certification, error: createError } = await adminSupabase
      .from("maritime_certificates")
      .insert({
        crew_member_id: certData.crew_member_id,
        certificate_type: certData.certificate_type,
        certificate_number: certData.certificate_number,
        issue_date: certData.issue_date,
        expiry_date: certData.expiry_date,
        issuing_authority: certData.issuing_authority,
        issuing_country: certData.issuing_country,
        stcw_code: certData.stcw_code,
        endorsement_number: certData.endorsement_number,
        notes: certData.notes,
        status,
        organization_id: crewMember.organization_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create certification error:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update crew compliance status
    await updateCrewCompliance(adminSupabase, certData.crew_member_id);

    // Log the action
    await adminSupabase.from("access_logs").insert({
      user_id: user.id,
      action: "certification_added",
      module_accessed: "crew",
      result: "success",
      severity: "info",
      details: { 
        crew_id: certData.crew_member_id,
        crew_name: crewMember.name,
        certificate_type: certData.certificate_type,
        certificate_id: certification.id
      },
    });

    // Create alert if expiring soon
    if (status === "expiring_soon") {
      await adminSupabase.from("alerts").insert({
        organization_id: crewMember.organization_id,
        alert_type: "certificate_expiry",
        severity: "warning",
        title: `Certificate expiring soon: ${certData.certificate_type}`,
        message: `${crewMember.name}'s ${certData.certificate_type} expires in ${daysUntilExpiry} days`,
        related_entity_type: "maritime_certificates",
        related_entity_id: certification.id,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: certification,
        message: "Certification added successfully",
        warnings: status === "expiring_soon" ? [`Certificate expires in ${daysUntilExpiry} days`] : undefined
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("add-certification error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateCrewCompliance(supabase: any, crewMemberId: string) {
  // Get all certificates for crew member
  const { data: certs } = await supabase
    .from("maritime_certificates")
    .select("status")
    .eq("crew_member_id", crewMemberId);

  if (!certs) return;

  const hasExpired = certs.some((c: any) => c.status === "expired");
  const hasExpiringSoon = certs.some((c: any) => c.status === "expiring_soon");

  let complianceStatus = "compliant";
  if (hasExpired) {
    complianceStatus = "non_compliant";
  } else if (hasExpiringSoon) {
    complianceStatus = "at_risk";
  }

  await supabase
    .from("crew_members")
    .update({ compliance_status: complianceStatus })
    .eq("id", crewMemberId);
}
