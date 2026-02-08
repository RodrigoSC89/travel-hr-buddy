import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ActionType = "crew_overview" | "wellbeing_analysis" | "scheduling_optimization" | "certification_matrix" | "ai_analysis";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, vesselId, crewId } = await req.json() as {
      action: ActionType;
      vesselId?: string;
      crewId?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[People Intelligence] Action: ${action}, Vessel: ${vesselId || "all"}`);

    // Fetch people data
    const [crewRes, certsRes, assignmentsRes, medicalRes] = await Promise.all([
      supabase.from("crew_members").select("*").limit(100),
      supabase.from("crew_certifications").select("*").limit(200),
      supabase.from("crew_assignments").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("medical_exams").select("*").order("exam_date", { ascending: false }).limit(100),
    ]);

    const contextData = {
      crew: crewRes.data || [],
      certifications: certsRes.data || [],
      assignments: assignmentsRes.data || [],
      medicals: medicalRes.data || [],
    };

    if (action === "crew_overview") {
      const byRank = groupBy(contextData.crew, "rank");
      const byStatus = groupBy(contextData.crew, "status");
      const byNationality = groupBy(contextData.crew, "nationality");

      return new Response(JSON.stringify({
        action,
        overview: {
          totalCrew: contextData.crew.length,
          byRank,
          byStatus,
          byNationality,
          activeCrew: contextData.crew.filter((c: any) => c.status === "active" || c.status === "on_board").length,
          onLeave: contextData.crew.filter((c: any) => c.status === "on_leave").length,
          available: contextData.crew.filter((c: any) => c.status === "available").length,
          totalCertifications: contextData.certifications.length,
          activeAssignments: contextData.assignments.filter((a: any) => a.status === "active").length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "wellbeing_analysis") {
      const now = new Date();
      // Analyze work patterns for fatigue risk
      const activeAssignments = contextData.assignments.filter((a: any) => a.status === "active");
      const longAssignments = activeAssignments.filter((a: any) => {
        if (!a.start_date) return false;
        const start = new Date(a.start_date);
        const daysOnboard = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return daysOnboard > 120; // MLC max recommended
      });

      // Medical status
      const medicalExpired = contextData.medicals.filter((m: any) =>
        m.expiry_date && new Date(m.expiry_date) < now
      );

      return new Response(JSON.stringify({
        action,
        wellbeing: {
          crewAtFatigueRisk: longAssignments.length,
          longAssignments: longAssignments.map((a: any) => ({
            crewId: a.crew_member_id,
            startDate: a.start_date,
            daysOnboard: Math.round((now.getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)),
          })),
          medicalExpirations: medicalExpired.length,
          mlcCompliance: {
            maxContinuousService: 11, // months MLC limit
            avgServiceDays: calculateAvgDays(activeAssignments),
            overLimitCount: longAssignments.length,
          },
          wellbeingScore: Math.max(0, 100 - (longAssignments.length * 10) - (medicalExpired.length * 5)),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "scheduling_optimization") {
      const activeAssignments = contextData.assignments.filter((a: any) => a.status === "active");
      const availableCrew = contextData.crew.filter((c: any) => c.status === "available");

      return new Response(JSON.stringify({
        action,
        scheduling: {
          activeAssignments: activeAssignments.length,
          availableCrew: availableCrew.length,
          pendingRotations: activeAssignments.filter((a: any) => {
            if (!a.end_date) return false;
            const end = new Date(a.end_date);
            const daysUntilEnd = (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilEnd <= 30 && daysUntilEnd > 0;
          }).length,
          crewUtilization: contextData.crew.length > 0
            ? Math.round((activeAssignments.length / contextData.crew.length) * 100) : 0,
          gapAnalysis: {
            positionsNeeded: Math.max(0, activeAssignments.length - availableCrew.length),
            surplus: Math.max(0, availableCrew.length - 5), // min 5 reserve
          },
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "certification_matrix") {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expired = contextData.certifications.filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) < now
      );
      const expiringSoon = contextData.certifications.filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) >= now && new Date(c.expiry_date) <= thirtyDays
      );
      const byCertType = groupBy(contextData.certifications, "certification_name");

      return new Response(JSON.stringify({
        action,
        matrix: {
          totalCertifications: contextData.certifications.length,
          expired: expired.length,
          expiringSoon: expiringSoon.length,
          valid: contextData.certifications.length - expired.length,
          complianceRate: contextData.certifications.length > 0
            ? Math.round(((contextData.certifications.length - expired.length) / contextData.certifications.length) * 100) : 100,
          byCertType,
          urgentRenewals: [...expired, ...expiringSoon].slice(0, 15),
          stcwCompliance: calculateSTCWCompliance(contextData.certifications),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ai_analysis") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const prompt = `Analise a gestão de pessoal marítimo:

Tripulação: ${contextData.crew.length} membros, ranks: ${JSON.stringify(groupBy(contextData.crew, "rank"))}
Certificações: ${contextData.certifications.length}, status: ${JSON.stringify(groupBy(contextData.certifications, "status"))}
Alocações ativas: ${contextData.assignments.filter((a: any) => a.status === "active").length}
Exames médicos: ${contextData.medicals.length}

Forneça:
1. Score de saúde organizacional (0-100)
2. Riscos de fadiga e bem-estar (MLC 2006)
3. Gaps de certificação STCW
4. Otimizações de escala recomendadas
5. Previsão de necessidades de contratação`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Você é um especialista em gestão de tripulação marítima (MLC 2006, STCW). Forneça análises acionáveis em português." },
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
      return new Response(JSON.stringify({
        action,
        analysis: aiData.choices?.[0]?.message?.content || "",
        summary: {
          crewAnalyzed: contextData.crew.length,
          certificationsChecked: contextData.certifications.length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[People Intelligence] Error:", error);
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

function calculateAvgDays(assignments: any[]): number {
  const now = new Date();
  const days = assignments
    .filter((a: any) => a.start_date)
    .map((a: any) => (now.getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24));
  return days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
}

function calculateSTCWCompliance(certs: any[]): number {
  const stcwCerts = certs.filter((c: any) =>
    c.certification_name?.toLowerCase().includes("stcw") ||
    c.certification_type?.toLowerCase().includes("stcw")
  );
  const now = new Date();
  const valid = stcwCerts.filter((c: any) => !c.expiry_date || new Date(c.expiry_date) >= now);
  return stcwCerts.length > 0 ? Math.round((valid.length / stcwCerts.length) * 100) : 100;
}
