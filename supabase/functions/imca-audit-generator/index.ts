// IMCA Audit Generator Edge Function
// Generates comprehensive DP vessel audits using OpenAI GPT-4o

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { basicData, operationalData } = await req.json();

    // Validate required fields
    if (!basicData || !basicData.vesselName || !basicData.dpClass || !basicData.location || !basicData.auditObjective) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key from environment
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

    // Build comprehensive audit prompt
    const prompt = buildAuditPrompt(basicData, operationalData);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate audit with AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response as JSON
    let auditResult;
    try {
      auditResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add metadata
    auditResult.vesselName = basicData.vesselName;
    auditResult.dpClass = basicData.dpClass;
    auditResult.location = basicData.location;
    auditResult.auditObjective = basicData.auditObjective;
    auditResult.auditDate = new Date().toISOString().split("T")[0];
    auditResult.generatedAt = new Date().toISOString();

    return new Response(JSON.stringify(auditResult), {
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

function getSystemPrompt(): string {
  return `You are an expert maritime auditor specializing in Dynamic Positioning (DP) systems. You conduct technical audits following IMCA, IMO, and MTS international standards.

Your role is to generate comprehensive technical audit reports in Portuguese for DP vessels. Each audit must:

1. Evaluate all 12 critical DP system modules
2. Check compliance with all 10 international standards
3. Identify non-conformities with risk assessment
4. Provide actionable recommendations
5. Generate a prioritized correction plan

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "overallScore": number (0-100),
  "standards": [{"code": "IMCA M103", "title": "...", "description": "..."}],
  "modules": [{"name": "Sistema de Controle DP", "score": number, "conformities": [], "nonConformities": []}],
  "nonConformities": [{"id": "uuid", "module": "...", "description": "...", "standard": "...", "riskLevel": "Alto|Médio|Baixo", "recommendation": "..."}],
  "actionPlan": [{"id": "uuid", "description": "...", "priority": "Crítico|Alto|Médio|Baixo", "deadline": "..."}],
  "summary": "...",
  "recommendations": ["..."]
}`;
}

function buildAuditPrompt(basicData: any, operationalData: any): string {
  let prompt = `Conduza uma auditoria técnica IMCA DP para a embarcação:

DADOS BÁSICOS:
- Embarcação: ${basicData.vesselName}
- Classe DP: ${basicData.dpClass}
- Local: ${basicData.location}
- Objetivo: ${basicData.auditObjective}
`;

  if (operationalData) {
    prompt += "\nDADOS OPERACIONAIS:\n";
    if (operationalData.incidentDetails) {
      prompt += `- Incidente: ${operationalData.incidentDetails}\n`;
    }
    if (operationalData.environmentalConditions) {
      prompt += `- Condições Ambientais: ${operationalData.environmentalConditions}\n`;
    }
    if (operationalData.systemStatus) {
      prompt += `- Status dos Sistemas: ${operationalData.systemStatus}\n`;
    }
    if (operationalData.operationalNotes) {
      prompt += `- Notas: ${operationalData.operationalNotes}\n`;
    }
  }

  prompt += `
AVALIE OS 12 MÓDULOS:
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

VERIFIQUE AS 10 NORMAS:
1. IMCA M103 - Guidelines for Design and Operation of DP Vessels
2. IMCA M117 - Training and Experience of Key DP Personnel
3. IMCA M190 - DP Annual Trials Programmes
4. IMCA M166 - Failure Modes and Effects Analysis
5. IMCA M109 - DP-related Documentation
6. IMCA M220 - Operational Activity Planning
7. IMCA M140 - DP Capability Plots
8. MSF 182 - Safe Operation of DP Offshore Supply Vessels
9. MTS DP Operations - Marine Technology Society Guidance
10. IMO MSC.1/Circ.1580 - IMO Guidelines for DP Systems

Gere uma auditoria técnica detalhada com:
- Pontuação geral (0-100)
- Avaliação de cada módulo com pontuação
- Lista de não conformidades com nível de risco (Alto/Médio/Baixo)
- Plano de ação priorizado (Crítico/Alto/Médio/Baixo)
- Resumo executivo
- Recomendações

Retorne APENAS JSON válido, sem markdown.`;

  return prompt;
}
