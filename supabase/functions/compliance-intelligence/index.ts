import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ActionType = "audit_overview" | "psc_readiness" | "certificate_status" | "compliance_gaps" | "ai_analysis";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, vesselId, auditType } = await req.json() as {
      action: ActionType;
      vesselId?: string;
      auditType?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Compliance Intelligence] Action: ${action}, Vessel: ${vesselId || "all"}`);

    // Fetch compliance data
    const [auditsRes, certificatesRes, inspectionsRes, ncRes] = await Promise.all([
      supabase.from("auditorias_realizadas").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("crew_certifications").select("*").limit(100),
      supabase.from("psc_inspections").select("*").order("inspection_date", { ascending: false }).limit(30),
      supabase.from("non_conformities").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    const contextData = {
      audits: auditsRes.data || [],
      certificates: certificatesRes.data || [],
      inspections: inspectionsRes.data || [],
      nonConformities: ncRes.data || [],
    };

    if (action === "audit_overview") {
      const totalAudits = contextData.audits.length;
      const pendingNC = contextData.nonConformities.filter((nc: any) => nc.status === "open" || nc.status === "pending").length;
      const closedNC = contextData.nonConformities.filter((nc: any) => nc.status === "closed").length;
      const recentInspections = contextData.inspections.slice(0, 10);

      return new Response(JSON.stringify({
        action,
        overview: {
          totalAudits,
          pendingNonConformities: pendingNC,
          closedNonConformities: closedNC,
          ncClosureRate: totalAudits > 0 ? Math.round((closedNC / (pendingNC + closedNC || 1)) * 100) : 0,
          recentInspections,
          auditsByType: groupBy(contextData.audits, "audit_type"),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "psc_readiness") {
      const detentions = contextData.inspections.filter((i: any) => i.detained === true);
      const deficiencies = contextData.inspections.reduce((sum: number, i: any) => sum + (i.deficiencies_count || 0), 0);

      return new Response(JSON.stringify({
        action,
        readiness: {
          totalInspections: contextData.inspections.length,
          detentions: detentions.length,
          detentionRate: contextData.inspections.length > 0
            ? Math.round((detentions.length / contextData.inspections.length) * 100) : 0,
          totalDeficiencies: deficiencies,
          avgDeficienciesPerInspection: contextData.inspections.length > 0
            ? Math.round(deficiencies / contextData.inspections.length * 10) / 10 : 0,
          recentInspections: contextData.inspections.slice(0, 5),
          riskLevel: detentions.length > 2 ? "HIGH" : detentions.length > 0 ? "MEDIUM" : "LOW",
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "certificate_status") {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const expired = contextData.certificates.filter((c: any) => c.expiry_date && new Date(c.expiry_date) < now);
      const expiring30 = contextData.certificates.filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) >= now && new Date(c.expiry_date) <= thirtyDays
      );
      const expiring60 = contextData.certificates.filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) > thirtyDays && new Date(c.expiry_date) <= sixtyDays
      );

      return new Response(JSON.stringify({
        action,
        certificates: {
          total: contextData.certificates.length,
          expired: expired.length,
          expiring30Days: expiring30.length,
          expiring60Days: expiring60.length,
          valid: contextData.certificates.length - expired.length - expiring30.length - expiring60.length,
          complianceRate: contextData.certificates.length > 0
            ? Math.round(((contextData.certificates.length - expired.length) / contextData.certificates.length) * 100) : 100,
          urgentRenewals: [...expired, ...expiring30].slice(0, 10),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "compliance_gaps") {
      const openNC = contextData.nonConformities.filter((nc: any) => nc.status !== "closed");
      const criticalNC = openNC.filter((nc: any) => nc.severity === "critical" || nc.severity === "major");

      return new Response(JSON.stringify({
        action,
        gaps: {
          totalOpenNC: openNC.length,
          criticalNC: criticalNC.length,
          byCategory: groupBy(openNC, "category"),
          bySeverity: groupBy(openNC, "severity"),
          overdueActions: openNC.filter((nc: any) => nc.due_date && new Date(nc.due_date) < new Date()).length,
          topRisks: criticalNC.slice(0, 5),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ai_analysis") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const prompt = `Analise o status de compliance marítimo:

Auditorias: ${JSON.stringify(contextData.audits.slice(0, 10))}
Não-Conformidades: ${JSON.stringify(contextData.nonConformities.slice(0, 15))}
Inspeções PSC: ${JSON.stringify(contextData.inspections.slice(0, 10))}
Certificados: ${contextData.certificates.length} total

Forneça:
1. Score geral de compliance (0-100)
2. Top 5 riscos identificados
3. Ações prioritárias recomendadas
4. Previsão de próxima detenção PSC
5. Gaps regulatórios críticos (SOLAS, MARPOL, MLC, STCW)`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Você é um especialista em compliance marítimo com conhecimento profundo de SOLAS, MARPOL, MLC 2006, STCW e ISM Code. Forneça análises acionáveis em português." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const analysis = aiData.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({
        action,
        analysis,
        summary: {
          auditsAnalyzed: contextData.audits.length,
          ncAnalyzed: contextData.nonConformities.length,
          inspectionsAnalyzed: contextData.inspections.length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Compliance Intelligence] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
