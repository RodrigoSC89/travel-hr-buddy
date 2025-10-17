/**
 * IMCA Audit Generator Edge Function
 * Generates AI-powered IMCA DP Technical Audit reports using OpenAI GPT-4o
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { vesselName, dpClass, location, auditObjective, operationalData } = await req.json();

    if (!vesselName || !dpClass || !location || !auditObjective) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct the AI prompt with specialized instructions for IMCA audits
    const prompt = `Você é um auditor especialista em sistemas de Posicionamento Dinâmico (DP) para embarcações marítimas. Realize uma auditoria técnica completa seguindo as normas IMCA, IMO e MTS.

DADOS DA AUDITORIA:
- Embarcação: ${vesselName}
- Classe DP: ${dpClass}
- Localização: ${location}
- Objetivo: ${auditObjective}
${operationalData?.incidentDetails ? `- Detalhes do Incidente: ${operationalData.incidentDetails}` : ""}
${operationalData?.environmentalConditions ? `- Condições Ambientais: ${operationalData.environmentalConditions}` : ""}
${operationalData?.systemStatus ? `- Status dos Sistemas: ${operationalData.systemStatus}` : ""}
${operationalData?.recentChanges ? `- Mudanças Recentes: ${operationalData.recentChanges}` : ""}

NORMAS A AVALIAR:
1. IMCA M 103 - Guidelines for DP Operations
2. IMCA M 117 - DP Vessel Design Philosophy Guidelines
3. IMCA M 190 - Guidance on Failure Modes & Effects Analyses (FMEAs)
4. IMCA M 166 - Guidance on DP Annual Trials Programmes
5. IMCA M 109 - Competence Assurance and Assessment
6. IMCA M 220 - Guidance on DP Related Incidents
7. IMCA M 140 - FMEA Management Guide
8. MSF 182 - Marine Safety Forum
9. MTS DP Operations - Marine Technology Society DP Guidelines
10. IMO MSC.1/Circ.1580 - Guidelines for vessels and units with dynamic positioning systems

MÓDULOS DP A AVALIAR:
1. Sistemas de Controle DP
2. Propulsão e Thrusters
3. Geração de Energia
4. Sistemas de Referência (sensores)
5. Comunicações
6. Pessoal e Competências
7. FMEA (Failure Modes and Effects Analysis)
8. Trials Anuais
9. Documentação
10. PMS (Planned Maintenance System)
11. Capability Plots
12. Planejamento Operacional

ESTRUTURA DO RELATÓRIO (RETORNE EM JSON):
{
  "id": "unique-id",
  "userId": "to-be-set",
  "createdAt": "current-iso-date",
  "updatedAt": "current-iso-date",
  "vesselName": "${vesselName}",
  "dpClass": "${dpClass}",
  "location": "${location}",
  "auditDate": "current-date",
  "auditObjective": "${auditObjective}",
  "operationalData": {...},
  "overallScore": number (0-100),
  "executiveSummary": "resumo executivo detalhado em português",
  "standardsEvaluated": ["array with all 10 standards"],
  "moduleEvaluations": [
    {
      "moduleId": "id",
      "moduleName": "nome",
      "score": number (0-100),
      "findings": "descobertas detalhadas",
      "recommendations": ["array de recomendações"]
    }
  ],
  "nonConformities": [
    {
      "id": "nc-id",
      "standard": "norma aplicável",
      "module": "módulo afetado",
      "description": "descrição detalhada",
      "riskLevel": "Alto|Médio|Baixo",
      "evidence": "evidências (opcional)"
    }
  ],
  "actionPlan": [
    {
      "id": "action-id",
      "description": "ação corretiva",
      "priority": "Crítico|Alto|Médio|Baixo",
      "deadline": "data-iso (Crítico: 7 dias, Alto: 30 dias, Médio: 90 dias, Baixo: 180 dias)",
      "responsible": "responsável (opcional)",
      "relatedNonConformity": "id da não conformidade (opcional)"
    }
  ],
  "observations": "observações adicionais",
  "strengths": ["pontos fortes"],
  "weaknesses": ["pontos fracos"]
}

INSTRUÇÕES:
1. Avalie TODOS os 12 módulos DP
2. Identifique não conformidades baseadas nas 10 normas
3. Classifique riscos como Alto (crítico), Médio (importante) ou Baixo (menor)
4. Crie plano de ação priorizado com prazos adequados
5. Seja específico e técnico, usando terminologia marítima DP
6. Forneça análise realista baseada na classe DP e contexto operacional
7. Se houver incidente, foque nas causas raízes e prevenção
8. Retorne APENAS o JSON, sem texto adicional

Gere o relatório de auditoria completo em JSON:`;

    console.log("Calling OpenAI API for IMCA audit generation...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um auditor especialista em sistemas DP para embarcações marítimas, com profundo conhecimento das normas IMCA, IMO e MTS. Responda SEMPRE em JSON válido."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("AI Response received, parsing JSON...");

    // Parse the JSON response
    let report;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      report = JSON.parse(cleanedResponse);
      
      // Ensure required fields are present and set defaults
      report.id = report.id || crypto.randomUUID();
      report.userId = "to-be-set"; // Will be set by the service layer
      report.createdAt = report.createdAt || new Date().toISOString();
      report.updatedAt = report.updatedAt || new Date().toISOString();
      report.auditDate = report.auditDate || new Date().toISOString().split('T')[0];
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("AI Response:", aiResponse);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Audit report generated successfully");

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in IMCA audit generator:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
