/**
 * IMCA Audit Generator Edge Function
 * Generates comprehensive DP technical audits using OpenAI GPT-4o
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// International standards for DP operations
const IMCA_STANDARDS = [
  "IMCA M103 - Guidelines for the Design and Operation of Dynamically Positioned Vessels",
  "IMCA M117 - The Training and Experience of Key DP Personnel",
  "IMCA M190 - Guidance on Failure Modes and Effects Analyses (FMEAs)",
  "IMCA M166 - Guidance on Simultaneous Operations (SIMOPs)",
  "IMCA M109 - International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels",
  "IMCA M220 - Guidance on DP Electrical Power and Control Systems",
  "IMCA M140 - Specification for DP Capability Plots",
  "MSF 182 - Code of Practice for the Safe Operation of Dynamically Positioned Classed Surface Vessels",
  "MTS DP Operations Guidance",
  "IMO MSC.1/Circ.1580 - Guidelines for Vessels with Dynamic Positioning Systems",
];

// DP System modules to evaluate
const DP_MODULES = [
  "Sistema de Controle DP",
  "Sistema de Propulsão",
  "Geração de Energia",
  "Sensores de Referência",
  "Sistema de Comunicação",
  "Capacitação de Pessoal",
  "FMEA Atualizado",
  "Provas Anuais",
  "Documentação Técnica",
  "Sistema de PMS",
  "Capability Plots",
  "Planejamento Operacional",
];

interface IMCAAuditRequest {
  vesselName: string;
  dpClass: "DP1" | "DP2" | "DP3";
  location: string;
  auditObjective: string;
  operationalData?: {
    incidentDetails?: string;
    environmentalConditions?: string;
    systemStatus?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { vesselName, dpClass, location, auditObjective, operationalData } =
      (await req.json()) as IMCAAuditRequest;

    // Validate required fields
    if (!vesselName || !dpClass || !location || !auditObjective) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the prompt for OpenAI
    const systemPrompt = `Você é um auditor técnico especializado em sistemas de Posicionamento Dinâmico (DP) para embarcações marítimas, com conhecimento profundo das normas IMCA, IMO e MTS.

Sua tarefa é gerar uma auditoria técnica completa e detalhada em português brasileiro, avaliando todos os aspectos críticos do sistema DP da embarcação.

Avalie os seguintes ${DP_MODULES.length} módulos do sistema DP:
${DP_MODULES.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Verifique a conformidade com as seguintes ${IMCA_STANDARDS.length} normas internacionais:
${IMCA_STANDARDS.map((s, i) => `${i + 1}. ${s}`).join("\n")}

IMPORTANTE: Retorne a resposta APENAS como um objeto JSON válido (sem markdown, sem blocos de código, sem explicações adicionais) com a seguinte estrutura:

{
  "overallScore": <número de 0 a 100>,
  "summary": "<resumo executivo de 2-3 parágrafos>",
  "standards": [
    {
      "standard": "<nome da norma>",
      "description": "<breve descrição>",
      "compliant": <true ou false>,
      "observations": "<observações sobre conformidade>"
    }
  ],
  "modules": [
    {
      "name": "<nome do módulo>",
      "score": <número de 0 a 10>,
      "observations": "<observações detalhadas>",
      "nonConformities": []
    }
  ],
  "nonConformities": [
    {
      "module": "<módulo relacionado>",
      "description": "<descrição da não conformidade>",
      "standard": "<norma aplicável>",
      "riskLevel": "<Alto, Médio ou Baixo>",
      "recommendation": "<recomendação específica>"
    }
  ],
  "actionPlan": [
    {
      "priority": "<Crítico, Alto, Médio ou Baixo>",
      "description": "<ação a ser tomada>",
      "responsible": "<responsável sugerido>",
      "status": "pending"
    }
  ]
}

Níveis de risco: "Alto", "Médio", "Baixo"
Prioridades: "Crítico" (< 7 dias), "Alto" (< 30 dias), "Médio" (< 90 dias), "Baixo" (< 180 dias)`;

    const userPrompt = `Gere uma auditoria técnica IMCA para a seguinte embarcação:

Nome da Embarcação: ${vesselName}
Classe DP: ${dpClass}
Local: ${location}
Objetivo da Auditoria: ${auditObjective}

${operationalData?.incidentDetails ? `Detalhes de Incidente: ${operationalData.incidentDetails}\n` : ""}
${operationalData?.environmentalConditions ? `Condições Ambientais: ${operationalData.environmentalConditions}\n` : ""}
${operationalData?.systemStatus ? `Status dos Sistemas: ${operationalData.systemStatus}\n` : ""}

Gere uma auditoria completa considerando a classe DP e as condições específicas informadas. Seja rigoroso e detalhado na avaliação.`;

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate audit" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content.trim();

    // Parse the AI response
    let auditData;
    try {
      // Remove any markdown code blocks if present
      const jsonContent = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      auditData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse audit data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate deadlines based on priority
    const getDeadline = (priority: string): string => {
      const daysMap: Record<string, number> = {
        Crítico: 7,
        Alto: 30,
        Médio: 90,
        Baixo: 180,
      };
      const days = daysMap[priority] || 30;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);
      return deadline.toISOString();
    };

    // Enrich action plan with deadlines
    const enrichedActionPlan = auditData.actionPlan.map((action: any) => ({
      ...action,
      deadline: getDeadline(action.priority),
    }));

    // Build the final response
    const result = {
      vesselName,
      dpClass,
      location,
      auditObjective,
      auditDate: new Date().toISOString(),
      overallScore: auditData.overallScore,
      standards: auditData.standards,
      modules: auditData.modules,
      nonConformities: auditData.nonConformities,
      actionPlan: enrichedActionPlan,
      summary: auditData.summary,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in imca-audit-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
