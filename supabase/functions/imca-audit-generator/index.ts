// ===========================
// IMCA Audit Generator Edge Function
// AI-powered audit generation using GPT-4o
// ===========================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditBasicData {
  vesselName: string;
  dpClass: "DP1" | "DP2" | "DP3";
  location: string;
  auditObjective: string;
}

interface AuditOperationalData {
  incidentDescription?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  tamActivation?: boolean;
}

interface IMCAAuditRequest {
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { basicData, operationalData }: IMCAAuditRequest = await req.json();

    if (!basicData || !basicData.vesselName || !basicData.dpClass || !basicData.location || !basicData.auditObjective) {
      return new Response(
        JSON.stringify({ error: "Missing required basic data fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the comprehensive prompt for GPT-4o
    const prompt = buildAuditPrompt(basicData, operationalData);

    // Call OpenAI GPT-4o
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um auditor técnico altamente qualificado em sistemas de posicionamento dinâmico (DP), com profunda familiaridade nas normas internacionais da IMCA, IMO e MTS.

Seu objetivo é gerar uma auditoria técnica detalhada em formato JSON estruturado.

Você deve avaliar os seguintes 12 módulos críticos:
1. Sistema de Controle DP
2. Sistema de Propulsão
3. Sensores de Posicionamento
4. Rede e Comunicações
5. Pessoal DP
6. Logs e Históricos
7. FMEA
8. Testes Anuais
9. Documentação
10. Power Management System
11. Capability Plots
12. Planejamento Operacional

E considerar as normas:
- IMCA M103 (Design & Operation)
- IMCA M117 (Personnel Training)
- IMCA M190 (Annual Trials)
- IMCA M166 (FMEA)
- IMCA M109 (Documentation)
- IMCA M220 (Operations Planning)
- IMCA M140 (Capability Plots)
- MSF 182 (OSV Operations)
- MTS DP Operations
- IMO MSC.1/Circ.1580`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate audit with AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAIData = await openAIResponse.json();
    const aiResponseText = openAIData.choices[0].message.content;

    // Parse the JSON response from AI
    const auditData = JSON.parse(aiResponseText);

    // Build structured audit report
    const audit = {
      basicData,
      operationalData,
      context: {
        summary: auditData.context?.summary || auditData.summary || "Auditoria técnica gerada com base nas informações fornecidas.",
        applicableStandards: auditData.context?.applicableStandards || auditData.applicableStandards || [
          "IMCA M103", "IMCA M117", "IMCA M190", "IMCA M166", "IMCA M109"
        ]
      },
      nonConformities: auditData.nonConformities || [],
      correctiveActions: auditData.correctiveActions || [],
      generatedAt: new Date().toISOString(),
      score: auditData.score || calculateScore(auditData.nonConformities || [])
    };

    return new Response(
      JSON.stringify({ success: true, audit }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in IMCA audit generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAuditPrompt(basicData: AuditBasicData, operationalData?: AuditOperationalData): string {
  let prompt = `Gere uma auditoria técnica DP em formato JSON com a seguinte estrutura:

{
  "context": {
    "summary": "Resumo do contexto da auditoria (2-3 parágrafos)",
    "applicableStandards": ["array de normas aplicáveis, ex: IMCA M103, IMCA M117, etc"]
  },
  "nonConformities": [
    {
      "module": "Nome do Módulo (ex: Sistema de Controle DP)",
      "standard": "Norma relacionada (ex: IMCA M103)",
      "description": "Descrição detalhada da não conformidade",
      "riskLevel": "Alto | Médio | Baixo",
      "evidence": "Evidência específica (opcional)"
    }
  ],
  "correctiveActions": [
    {
      "priority": "Crítico | Alto | Médio | Baixo",
      "description": "Descrição da ação corretiva",
      "deadline": "Prazo estimado (ex: < 7 dias, < 30 dias)",
      "responsible": "Responsável sugerido (opcional)"
    }
  ],
  "score": 85
}

**Dados da Embarcação:**
- Nome: ${basicData.vesselName}
- Classe DP: ${basicData.dpClass}
- Local: ${basicData.location}
- Objetivo: ${basicData.auditObjective}
`;

  if (operationalData) {
    prompt += `\n**Dados Operacionais:**\n`;
    if (operationalData.incidentDescription) {
      prompt += `- Incidente: ${operationalData.incidentDescription}\n`;
    }
    if (operationalData.environmentalConditions) {
      prompt += `- Condições Ambientais: ${operationalData.environmentalConditions}\n`;
    }
    if (operationalData.systemStatus) {
      prompt += `- Status do Sistema: ${operationalData.systemStatus}\n`;
    }
    if (operationalData.tamActivation !== undefined) {
      prompt += `- Ativação TAM: ${operationalData.tamActivation ? "Sim" : "Não"}\n`;
    }
  }

  prompt += `\n**Instruções:**
1. Identifique 3-5 não conformidades relevantes considerando a classe DP e o contexto fornecido
2. Classifique cada não conformidade por risco (Alto/Médio/Baixo)
3. Gere 5-8 ações corretivas priorizadas
4. Aplique as normas IMCA, IMO e MTS relevantes
5. Calcule um score de 0-100 baseado na severidade das não conformidades
6. Use linguagem técnica profissional em português
7. Seja específico e prático nas recomendações`;

  return prompt;
}

function calculateScore(nonConformities: any[]): number {
  if (!nonConformities || nonConformities.length === 0) {
    return 95;
  }

  let score = 100;
  for (const nc of nonConformities) {
    if (nc.riskLevel === "Alto") {
      score -= 15;
    } else if (nc.riskLevel === "Médio") {
      score -= 8;
    } else {
      score -= 3;
    }
  }

  return Math.max(0, score);
}
