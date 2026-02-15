import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUDIT_QUESTIONS = [
  { id: "dp_log", category: "Documentação", weight: 10, question: "O DP Log está atualizado com todas as entradas das últimas 90 dias?", reference: "IMCA M 117 Rev 2" },
  { id: "fmea_current", category: "FMEA", weight: 15, question: "O FMEA está atualizado após últimas modificações ao sistema DP?", reference: "IMCA M 166" },
  { id: "annual_dp_trial", category: "Trials", weight: 15, question: "Annual DP Trial realizado nos últimos 12 meses por empresa aprovada IMCA?", reference: "IMCA M 190" },
  { id: "dp_operators_cert", category: "Certificação", weight: 15, question: "Todos os DPOs possuem certificado NI DP válido e logbook atualizado?", reference: "Nautical Institute DP Scheme" },
  { id: "ciras_filed", category: "Incidentes", weight: 10, question: "Todos os incidentes DP foram reportados ao IMCA CIRAS?", reference: "IMCA M 232" },
  { id: "power_management", category: "Energia", weight: 10, question: "PMS calibrado e testado conforme requisitos IMCA?", reference: "IMCA M 166 Rev 2, Sec 4.2" },
  { id: "thruster_maintenance", category: "Propulsão", weight: 10, question: "Todos os thrusters revisados conforme plano de manutenção do fabricante?", reference: "SMS Maintenance Plan" },
  { id: "reference_systems", category: "Referência", weight: 10, question: "Mínimo 3 sistemas de referência independentes operacionais e calibrados?", reference: "IMCA M 166, Sec 3.4" },
  { id: "dp_drills", category: "Simulacros", weight: 5, question: "Simulacros de emergência DP realizados mensalmente e documentados?", reference: "OCIMF DPOG 2.1.5" },
];

interface AuditResponse {
  question_id: string;
  answer: "yes" | "partial" | "no" | "na";
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, vessel_id } = await req.json() as { responses: AuditResponse[]; vessel_id?: string };

    if (!responses || !Array.isArray(responses)) {
      return new Response(JSON.stringify({ error: "Responses array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalWeight = 0;
    let earnedWeight = 0;
    const deficiencies: Array<{ category: string; question: string; reference: string; severity: string }> = [];
    const weakAreas: string[] = [];
    const recommendations: string[] = [];

    for (const question of AUDIT_QUESTIONS) {
      const response = responses.find(r => r.question_id === question.id);
      const answer = response?.answer || "no";

      if (answer === "na") continue;
      totalWeight += question.weight;

      if (answer === "yes") {
        earnedWeight += question.weight;
      } else if (answer === "partial") {
        earnedWeight += Math.round(question.weight * 0.5);
        weakAreas.push(question.category);
        recommendations.push(`Melhorar: ${question.question} (${question.reference})`);
      } else if (answer === "no") {
        deficiencies.push({
          category: question.category,
          question: question.question,
          reference: question.reference,
          severity: question.weight >= 15 ? "major" : question.weight >= 10 ? "moderate" : "minor",
        });
        recommendations.push(`⚠️ RESOLVER: ${question.question} (${question.reference})`);
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    const passed = score >= 70 && deficiencies.filter(d => d.severity === "major").length === 0;

    const result = {
      score,
      passed,
      result: passed ? "PASSED" : score >= 50 ? "CONDITIONAL" : "FAILED",
      totalQuestions: AUDIT_QUESTIONS.length,
      answeredQuestions: responses.length,
      deficiencies,
      deficiencyCount: deficiencies.length,
      weakAreas: [...new Set(weakAreas)],
      recommendations,
      simulatedAt: new Date().toISOString(),
    };

    // Log simulation
    if (vessel_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("ai_audit_logs").insert({
        user_input: "DP Audit Simulation (DPVOA/IMCA)",
        module_name: "peo-dp",
        interaction_type: "dp_audit_simulation",
        ai_response: JSON.stringify({ score, passed, deficiencyCount: deficiencies.length }),
        confidence_score: score / 100,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
