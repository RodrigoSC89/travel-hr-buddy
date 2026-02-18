import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { json_data, vessel_id, organization_id } = await req.json();

    if (!json_data || !vessel_id) {
      return new Response(JSON.stringify({ error: "json_data and vessel_id are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse OCIMF SIRE 2.0 JSON format
    const inspection = json_data;
    const findings: Array<Record<string, unknown>> = [];
    const questions: Array<Record<string, unknown>> = [];

    // Extract inspection metadata
    const inspectionRecord = {
      vessel_id,
      organization_id,
      inspection_type: inspection.inspectionType || "SIRE 2.0",
      inspector_name: inspection.inspector?.name || inspection.inspectorName,
      inspector_company: inspection.inspector?.company || inspection.inspectorCompany,
      inspection_date: inspection.inspectionDate || inspection.date,
      port: inspection.port || inspection.location,
      status: "completed",
      overall_score: inspection.overallScore || inspection.score,
      metadata: {
        ocimf_import: true,
        import_date: new Date().toISOString(),
        sire_version: inspection.sireVersion || "2.0",
        vessel_imo: inspection.vesselIMO,
        raw_chapters: Object.keys(inspection.chapters || inspection.sections || {}),
      },
    };

    // Insert main inspection
    const { data: sireInspection, error: inspError } = await supabase
      .from("sire2_inspections")
      .insert(inspectionRecord)
      .select()
      .single();

    if (inspError) throw inspError;

    // Parse chapters/sections for findings
    const chapters = inspection.chapters || inspection.sections || {};
    for (const [chapterKey, chapter] of Object.entries(chapters)) {
      const ch = chapter as Record<string, unknown>;
      const chapterQuestions = (ch.questions || ch.items || []) as Array<Record<string, unknown>>;

      for (const q of chapterQuestions) {
        // Import question
        questions.push({
          inspection_id: sireInspection.id,
          chapter_code: chapterKey,
          question_code: q.questionCode || q.code || q.id,
          question_text: q.questionText || q.text || q.description,
          answer: q.answer || q.response,
          observation: q.observation || q.comment || q.notes,
          evidence_required: q.evidenceRequired || false,
          risk_level: q.riskLevel || q.risk || "medium",
        });

        // If there's a finding/observation
        if (q.finding || q.observation || q.nonConformity) {
          findings.push({
            inspection_id: sireInspection.id,
            chapter_code: chapterKey,
            question_code: q.questionCode || q.code,
            finding_type: q.findingType || (q.nonConformity ? "non_conformity" : "observation"),
            description: q.finding || q.observation || q.nonConformity,
            severity: q.severity || "medium",
            status: "open",
            corrective_action_required: q.correctiveAction || q.car,
            due_date: q.dueDate,
          });
        }
      }
    }

    // Batch insert findings
    let findingsCount = 0;
    if (findings.length > 0) {
      const { error: findErr } = await supabase
        .from("sire2_findings")
        .insert(findings);
      if (findErr) console.error("Findings insert error:", findErr);
      else findingsCount = findings.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        inspection_id: sireInspection.id,
        chapters_imported: Object.keys(chapters).length,
        questions_imported: questions.length,
        findings_imported: findingsCount,
        message: `SIRE 2.0 inspection imported successfully from OCIMF JSON`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
