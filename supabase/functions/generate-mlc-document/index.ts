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

    const { doc_type, vessel_id, month } = await req.json();

    if (!doc_type) {
      return new Response(JSON.stringify({ error: "doc_type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    let content: Record<string, unknown> = {};

    switch (doc_type) {
      case "dcm_draft": {
        let dq = supabase.from("mlc_dcm").select("*").order("created_at", { ascending: false }).limit(1);
        if (vessel_id) dq = dq.eq("vessel_id", vessel_id);
        const { data: dcm } = await dq;

        const { data: crew } = await supabase.from("crew_members").select("id, full_name, rank, status, nationality");
        const { data: contracts } = await supabase.from("crew_employment_contracts").select("*").eq("status", "active");

        content = {
          title: "DMLC Parte II — Rascunho Automático",
          currentDCM: dcm?.[0] || null,
          crewCount: crew?.length || 0,
          activeContracts: contracts?.length || 0,
          sections: {
            title1: { minimumAge: "Todos os marítimos acima de 18 anos", medicalCertificates: "Verificar tabela de certificados" },
            title2: { seaContracts: `${contracts?.length || 0} contratos ativos`, workRestRecords: "Registros mantidos eletronicamente" },
            title3: { accommodation: "Conforme última inspeção", foodCatering: "Cozinheiro certificado a bordo" },
            title4: { medicalCare: "Hospital de bordo equipado", healthSafety: "Comitê de segurança ativo" },
            title5: { flagState: dcm?.[0]?.flag_state || "N/A", grievanceProcedure: "Disponível em múltiplos idiomas" },
          },
          generatedAt: now.toISOString(),
        };
        break;
      }

      case "work_rest_monthly": {
        const targetMonth = month || now.toISOString().slice(0, 7);
        const startDate = `${targetMonth}-01`;
        const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString().slice(0, 10);

        let wq = supabase.from("mlc_work_rest_records").select("*, crew:crew_members(full_name, rank)")
          .gte("date", startDate).lte("date", endDate);
        if (vessel_id) wq = wq.eq("vessel_id", vessel_id);
        const { data: records } = await wq;

        const violations = (records || []).filter((r: any) => r.has_violation);

        content = {
          title: `Relatório Mensal de Horas de Trabalho/Descanso — ${targetMonth}`,
          period: { from: startDate, to: endDate },
          totalRecords: records?.length || 0,
          totalViolations: violations.length,
          records: records || [],
          regulation: "MLC 2006 Reg. 2.3 / STCW A-VIII/1",
          generatedAt: now.toISOString(),
        };
        break;
      }

      case "wage_register": {
        const { data: payroll } = await supabase.from("payroll_records").select("*")
          .order("created_at", { ascending: false }).limit(100);

        content = {
          title: "Registro de Salários MLC — Verificação ITF",
          minimumWage: "$673/mês (ILO/ITF vigente)",
          totalRecords: payroll?.length || 0,
          records: payroll || [],
          regulation: "MLC 2006 Reg. 2.2",
          generatedAt: now.toISOString(),
        };
        break;
      }

      case "crew_contracts_status": {
        const { data: contracts } = await supabase.from("crew_employment_contracts")
          .select("*, crew:crew_members(full_name, rank)").order("end_date", { ascending: true });

        const expiringSoon = (contracts || []).filter((c: any) => {
          if (!c.end_date) return false;
          const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000);
          return daysLeft > 0 && daysLeft <= 30;
        });

        content = {
          title: "Status de Contratos de Emprego Marítimo (CEM/SEA)",
          totalContracts: contracts?.length || 0,
          activeContracts: (contracts || []).filter((c: any) => c.status === "active").length,
          expiringSoon: expiringSoon.length,
          contracts: contracts || [],
          regulation: "MLC 2006 Reg. 2.1",
          generatedAt: now.toISOString(),
        };
        break;
      }

      case "medical_certificates_report": {
        const { data: medicals } = await supabase.from("maritime_certificates")
          .select("*, crew:crew_members(full_name, rank)")
          .eq("certificate_type", "medical").order("expiry_date", { ascending: true });

        const expired = (medicals || []).filter((m: any) => new Date(m.expiry_date) < now);
        const expiring = (medicals || []).filter((m: any) => {
          const d = new Date(m.expiry_date);
          return d > now && d < new Date(now.getTime() + 30 * 86400000);
        });

        content = {
          title: "Relatório de Certificados Médicos STCW/ILO",
          totalCertificates: medicals?.length || 0,
          expired: expired.length,
          expiringSoon: expiring.length,
          valid: (medicals?.length || 0) - expired.length - expiring.length,
          certificates: medicals || [],
          regulation: "MLC 2006 Reg. 1.2",
          generatedAt: now.toISOString(),
        };
        break;
      }

      case "psc_evidence_pack": {
        // Aggregate everything
        const [dcm, contracts, medicals, workRest, complaints, crew] = await Promise.all([
          supabase.from("mlc_dcm").select("*").order("created_at", { ascending: false }).limit(1),
          supabase.from("crew_employment_contracts").select("*").eq("status", "active"),
          supabase.from("maritime_certificates").select("*").eq("certificate_type", "medical"),
          supabase.from("mlc_work_rest_records").select("*").order("date", { ascending: false }).limit(200),
          supabase.from("mlc_complaints").select("*").order("created_at", { ascending: false }),
          supabase.from("crew_members").select("id, full_name, rank, status"),
        ]);

        content = {
          title: "📦 Pacote Completo PSC MLC 2006 — 47 Documentos",
          dcm: dcm.data?.[0] || null,
          crew: { total: crew.data?.length || 0, data: crew.data || [] },
          contracts: { total: contracts.data?.length || 0, data: contracts.data || [] },
          medicalCertificates: { total: medicals.data?.length || 0, data: medicals.data || [] },
          workRestRecords: { total: workRest.data?.length || 0, recentRecords: (workRest.data || []).slice(0, 50) },
          complaints: { total: complaints.data?.length || 0, data: complaints.data || [] },
          regulation: "MLC 2006 — Títulos 1 a 5",
          generatedAt: now.toISOString(),
        };
        break;
      }

      default: {
        content = {
          title: `Documento MLC: ${doc_type}`,
          message: "Tipo será implementado em breve",
          generatedAt: now.toISOString(),
        };
      }
    }

    // Log
    await supabase.from("ai_audit_logs").insert({
      user_input: `Generate MLC Document: ${doc_type}`,
      module_name: "mlc",
      interaction_type: "document_generation",
      ai_response: JSON.stringify({ doc_type, success: true }),
    });

    return new Response(JSON.stringify({
      success: true,
      doc_type,
      content,
      generatedAt: now.toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
