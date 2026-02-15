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

    const { doc_type, vessel_id } = await req.json();

    if (!doc_type) {
      return new Response(JSON.stringify({ error: "doc_type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let content: Record<string, unknown> = {};

    switch (doc_type) {
      case "dp_log_report": {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
        let q = supabase.from("peodp_audit_trail").select("*")
          .gte("timestamp", ninetyDaysAgo).order("timestamp", { ascending: false });
        const { data: logs } = await q;

        let eq = supabase.from("peodp_equipment").select("name, status, system_type");
        if (vessel_id) eq = eq.eq("vessel_id", vessel_id);
        const { data: equipment } = await eq;

        content = {
          title: "Relatório DP Log — Últimos 90 Dias",
          period: { from: ninetyDaysAgo.slice(0, 10), to: new Date().toISOString().slice(0, 10) },
          totalEntries: logs?.length || 0,
          entries: (logs || []).slice(0, 100),
          equipmentSummary: equipment || [],
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "annual_dp_trial_prep": {
        let eq = supabase.from("peodp_equipment").select("*");
        if (vessel_id) eq = eq.eq("vessel_id", vessel_id);
        const { data: equipment } = await eq;

        const { data: audits } = await supabase.from("peotram_audits")
          .select("*").eq("audit_type", "dp_trial").order("created_at", { ascending: false }).limit(5);

        content = {
          title: "Preparação Annual DP Trial — IMCA M 190",
          equipment: equipment || [],
          recentTrials: audits || [],
          checklist: [
            "1. Verificar todos os sistemas de referência de posição",
            "2. Testar blackout e recuperação automática",
            "3. Verificar FMEA vs. configuração atual",
            "4. Testar drift-off e drive-off scenarios",
            "5. Verificar calibração de todos os sensores",
            "6. Testar PMS e distribuição de carga",
            "7. Verificar comunicações DP",
            "8. Documentar ASOG/CAM procedures",
            "9. Verificar logbooks de DPOs",
            "10. Preparar documentação de emergência",
          ],
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "fmea_summary": {
        let eq = supabase.from("peodp_equipment").select("*");
        if (vessel_id) eq = eq.eq("vessel_id", vessel_id);
        const { data: equipment } = await eq;

        const systemGroups = (equipment || []).reduce((acc: Record<string, any[]>, eq: any) => {
          if (!acc[eq.system_type]) acc[eq.system_type] = [];
          acc[eq.system_type].push(eq);
          return acc;
        }, {});

        content = {
          title: "Resumo Executivo FMEA — Sistema DP",
          systems: Object.entries(systemGroups).map(([type, items]) => ({
            system: type,
            totalEquipment: (items as any[]).length,
            operational: (items as any[]).filter((e: any) => e.status === "operational").length,
            issues: (items as any[]).filter((e: any) => e.status !== "operational").map((e: any) => ({
              name: e.name, status: e.status, notes: e.status_notes,
            })),
          })),
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      case "audit_evidence_pack": {
        // Aggregate all DP data into a comprehensive pack
        let eq = supabase.from("peodp_equipment").select("*");
        if (vessel_id) eq = eq.eq("vessel_id", vessel_id);
        const { data: equipment } = await eq;

        let iq = supabase.from("peodp_incidents").select("*");
        if (vessel_id) iq = iq.eq("vessel_id", vessel_id);
        const { data: incidents } = await iq;

        const { data: audits } = await supabase.from("peotram_audits")
          .select("*").eq("audit_type", "peodp").order("created_at", { ascending: false }).limit(10);

        content = {
          title: "📦 Pacote Completo de Evidências — Auditoria DPVOA",
          sections: {
            equipment: { total: (equipment || []).length, data: equipment || [] },
            incidents: { total: (incidents || []).length, data: incidents || [] },
            audits: { total: (audits || []).length, data: audits || [] },
          },
          compliance: {
            equipmentOperational: (equipment || []).filter((e: any) => e.status === "operational").length,
            openIncidents: (incidents || []).filter((i: any) => i.status === "open").length,
          },
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      default: {
        content = {
          title: `Documento DP: ${doc_type}`,
          message: "Tipo de documento será implementado em breve",
          generatedAt: new Date().toISOString(),
        };
      }
    }

    // Log generation
    await supabase.from("ai_audit_logs").insert({
      user_input: `Generate DP Document: ${doc_type}`,
      module_name: "peo-dp",
      interaction_type: "document_generation",
      ai_response: JSON.stringify({ doc_type, success: true }),
    });

    return new Response(JSON.stringify({
      success: true,
      doc_type,
      content,
      generatedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
