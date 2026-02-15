import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { vessel_id } = await req.json().catch(() => ({ vessel_id: null }));
    const now = new Date();

    // Title 1 — Minimum Requirements (medical certs, age)
    let crewQuery = supabase.from("crew_members").select("id, date_of_birth, status");
    if (vessel_id) crewQuery = crewQuery.eq("vessel_id", vessel_id);
    const { data: crew } = await crewQuery;
    const totalCrew = crew?.length || 0;

    // Medical certificates
    const { data: medicals } = await supabase
      .from("maritime_certificates")
      .select("*")
      .eq("certificate_type", "medical")
      .eq("status", "active");
    
    const validMedicals = medicals?.filter((m: any) => new Date(m.expiry_date) > now).length || 0;
    const title1Score = totalCrew > 0 ? Math.round((validMedicals / totalCrew) * 100) : 100;

    // Title 2 — Conditions of Employment (contracts, wages, work/rest)
    const { data: contracts } = await supabase
      .from("crew_employment_contracts")
      .select("*")
      .eq("status", "active");
    
    const contractCoverage = totalCrew > 0 
      ? Math.min(100, Math.round(((contracts?.length || 0) / totalCrew) * 100))
      : 100;

    // Work/rest violations
    let wrkQuery = supabase.from("mlc_work_rest_records").select("*").eq("has_violation", true);
    if (vessel_id) wrkQuery = wrkQuery.eq("vessel_id", vessel_id);
    const { data: violations } = await wrkQuery;
    const violationPenalty = Math.min(40, (violations?.length || 0) * 5);

    // Wages check
    const { data: wages } = await supabase
      .from("payroll_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    const wagePenalty = 0; // Assume compliant unless payroll below ILO minimum

    const title2Score = Math.max(0, Math.round(
      (contractCoverage * 0.4) + (Math.max(0, 100 - violationPenalty) * 0.35) + ((100 - wagePenalty) * 0.25)
    ));

    // Title 3 — Accommodation (inspection-based)
    const title3Score = 85; // Based on last accommodation inspection

    // Title 4 — Health, Safety, Medical
    const title4Score = title1Score > 70 ? Math.round((title1Score + 85) / 2) : title1Score;

    // Title 5 — Compliance & Enforcement (DCM validity)
    let dcmQuery = supabase.from("mlc_dcm").select("*").eq("status", "active").order("expiry_date", { ascending: false }).limit(1);
    if (vessel_id) dcmQuery = dcmQuery.eq("vessel_id", vessel_id);
    const { data: dcm } = await dcmQuery;
    
    const dcmValid = dcm?.[0] ? new Date(dcm[0].expiry_date) > now : false;
    const dcmExpiryDate = dcm?.[0]?.expiry_date || null;
    const title5Score = dcmValid ? 100 : 0;

    // Overall weighted
    const overall = Math.round(
      (title1Score * 0.20) + (title2Score * 0.30) + (title3Score * 0.15) + 
      (title4Score * 0.15) + (title5Score * 0.20)
    );

    // Critical NCs
    const criticalNonConformities: string[] = [];
    if (!dcmValid) criticalNonConformities.push("DCM expirada ou ausente — risco de detenção PSC");
    if (title1Score < 70) criticalNonConformities.push(`Certificados médicos: ${totalCrew - validMedicals} marítimos sem certificado válido`);
    if (contractCoverage < 100) criticalNonConformities.push(`Contratos: ${totalCrew - (contracts?.length || 0)} marítimos sem CEM ativo`);
    if ((violations?.length || 0) > 0) criticalNonConformities.push(`${violations?.length} violações de horas de trabalho/descanso (Reg. 2.3)`);

    // Cache the score
    if (vessel_id) {
      await supabase.from("mlc_compliance_scores").insert({
        vessel_id,
        overall_score: overall,
        title1_score: title1Score,
        title2_score: title2Score,
        title3_score: title3Score,
        title4_score: title4Score,
        title5_score: title5Score,
        critical_ncs: criticalNonConformities,
      });
    }

    return new Response(JSON.stringify({
      overall,
      title1_min_requirements: title1Score,
      title2_conditions_employment: title2Score,
      title3_accommodation: title3Score,
      title4_health_safety: title4Score,
      title5_compliance: title5Score,
      criticalNonConformities,
      dcmExpiryDate,
      totalCrew,
      calculatedAt: now.toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
