import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PSCResponse {
  question_id: string;
  answer: "yes" | "partial" | "no" | "na";
  notes?: string;
}

const PSC_QUESTIONS = [
  { id: "dcm_valid", category: "Documentação", weight: 15, detention_risk: "high",
    question: "DCM Parte I e II válidas e a bordo?", regulation: "MLC Reg. 5.1.3" },
  { id: "mlc_certificate", category: "Certificação", weight: 15, detention_risk: "high",
    question: "MLC Certificate válido?", regulation: "MLC Reg. 5.1.3" },
  { id: "contracts_signed", category: "Contratos", weight: 10, detention_risk: "high",
    question: "Todos os marítimos com CEM assinado a bordo?", regulation: "MLC Reg. 2.1" },
  { id: "work_rest_records", category: "Horas", weight: 10, detention_risk: "medium",
    question: "Registros horas de trabalho/descanso completos e assinados?", regulation: "MLC Reg. 2.3" },
  { id: "minimum_wage", category: "Salários", weight: 10, detention_risk: "high",
    question: "Todos recebem mínimo ITF/MLC vigente ($673/mês)?", regulation: "MLC Reg. 2.2" },
  { id: "medical_certificates", category: "Saúde", weight: 10, detention_risk: "high",
    question: "Todos com certificado médico STCW/ILO válido?", regulation: "MLC Reg. 1.2" },
  { id: "accommodation_standards", category: "Alojamento", weight: 8, detention_risk: "medium",
    question: "Alojamentos com espaço, ventilação e iluminação mínimos MLC?", regulation: "MLC Reg. 3.1" },
  { id: "food_quality", category: "Alimentação", weight: 7, detention_risk: "low",
    question: "Alimentação e água potável com padrões nutricionais MLC?", regulation: "MLC Reg. 3.2" },
  { id: "complaint_procedure", category: "Queixas", weight: 5, detention_risk: "medium",
    question: "Procedimento de queixas disponível no idioma dos marítimos?", regulation: "MLC Reg. 5.1.5" },
  { id: "repatriation", category: "Repatriação", weight: 10, detention_risk: "high",
    question: "Seguro de repatriação ativo e documentado para todos?", regulation: "MLC Reg. 2.5" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, vessel_id } = await req.json() as { responses: PSCResponse[]; vessel_id?: string };

    if (!responses || !Array.isArray(responses)) {
      return new Response(JSON.stringify({ error: "Responses array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalScore = 0;
    let maxScore = 0;
    const deficiencies: Array<{ category: string; question: string; regulation: string; detention_risk: string; severity: string }> = [];
    const recommendations: string[] = [];
    let detentionRisk = false;

    for (const question of PSC_QUESTIONS) {
      const response = responses.find(r => r.question_id === question.id);
      const answer = response?.answer || "no";
      maxScore += question.weight;

      if (answer === "yes") {
        totalScore += question.weight;
      } else if (answer === "partial") {
        totalScore += Math.round(question.weight * 0.5);
        deficiencies.push({
          category: question.category,
          question: question.question,
          regulation: question.regulation,
          detention_risk: question.detention_risk,
          severity: "observation",
        });
        recommendations.push(`Completar conformidade: ${question.question} (${question.regulation})`);
      } else if (answer === "no") {
        deficiencies.push({
          category: question.category,
          question: question.question,
          regulation: question.regulation,
          detention_risk: question.detention_risk,
          severity: question.detention_risk === "high" ? "deficiency" : "observation",
        });
        
        if (question.detention_risk === "high") {
          detentionRisk = true;
          recommendations.push(`⚠️ URGENTE: ${question.question} — risco de detenção (${question.regulation})`);
        } else {
          recommendations.push(`Resolver: ${question.question} (${question.regulation})`);
        }
      }
      // "na" = not applicable, skip
    }

    const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const highRiskDeficiencies = deficiencies.filter(d => d.detention_risk === "high" && d.severity === "deficiency");

    // Detention logic: Paris MoU / Tokyo MoU criteria
    const detained = detentionRisk && highRiskDeficiencies.length >= 2;

    const result = {
      score,
      detained,
      result: detained ? "DETAINED" : score >= 80 ? "PASSED" : "DEFICIENCIES_NOTED",
      totalQuestions: PSC_QUESTIONS.length,
      answeredQuestions: responses.length,
      deficiencies,
      deficiencyCount: deficiencies.length,
      highRiskCount: highRiskDeficiencies.length,
      recommendations,
      detentionRisk,
      parisRouRegime: score >= 90 ? "low_risk" : score >= 70 ? "standard" : "high_risk",
      estimatedInspectionTime: "2-4 hours",
      simulatedAt: new Date().toISOString(),
    };

    // Log simulation if vessel_id provided
    if (vessel_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("ai_audit_logs").insert({
        user_input: "PSC MLC Inspection Simulation",
        module_name: "mlc",
        interaction_type: "psc_simulation",
        ai_response: JSON.stringify({ score, detained, deficiencyCount: deficiencies.length }),
        confidence_score: score / 100,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
