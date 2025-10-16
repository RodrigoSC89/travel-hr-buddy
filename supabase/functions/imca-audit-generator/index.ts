import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { basicData, operationalData, includeAllModules, specificModules } = requestData;

    if (!basicData) {
      return new Response(
        JSON.stringify({ error: "basicData is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for GPT-4o
    const prompt = buildAuditPrompt(basicData, operationalData, includeAllModules, specificModules);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "Você é um auditor técnico altamente qualificado em sistemas de posicionamento dinâmico (DP), com profunda familiaridade nas normas internacionais da IMCA, IMO e MTS. Você deve gerar auditorias técnicas detalhadas em formato JSON estruturado."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate audit", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const auditContent = openaiData.choices[0].message.content;
    
    // Parse the JSON response
    const auditData = JSON.parse(auditContent);

    // Construct the complete audit report
    const auditReport = {
      basicData,
      operationalData,
      context: auditData.context || "",
      modulesAudited: auditData.modulesAudited || [],
      standardsApplied: auditData.standardsApplied || [],
      nonConformities: auditData.nonConformities || [],
      actionPlan: auditData.actionPlan || [],
      summary: auditData.summary || "",
      recommendations: auditData.recommendations || "",
      status: "draft",
      generatedAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(auditReport),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in imca-audit-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAuditPrompt(basicData: any, operationalData: any, includeAllModules: boolean, specificModules?: string[]): string {
  const modules = includeAllModules
    ? [
        "Sistema de Controle DP",
        "Sistema de Propulsão",
        "Sensores de Posicionamento",
        "Rede e Comunicações",
        "Pessoal DP",
        "Logs e Históricos",
        "FMEA",
        "Testes Anuais",
        "Documentação",
        "Power Management System",
        "Capability Plots",
        "Planejamento Operacional"
      ]
    : specificModules || [];

  let prompt = `Gere uma Auditoria Técnica IMCA completa em formato JSON para a seguinte embarcação/operação:

**Dados Básicos:**
- Nome: ${basicData.vesselName}
- Tipo de Operação: ${basicData.operationType}
- Localização: ${basicData.location}
- Classe DP: ${basicData.dpClass}
- Objetivo da Auditoria: ${basicData.auditObjective}
- Data: ${basicData.auditDate}
`;

  if (operationalData?.incidentDescription) {
    prompt += `\n**Dados Operacionais:**\n`;
    prompt += `- Descrição do Incidente: ${operationalData.incidentDescription}\n`;
    if (operationalData.environmentalConditions) {
      prompt += `- Condições Ambientais: ${operationalData.environmentalConditions}\n`;
    }
    if (operationalData.systemStatus) {
      prompt += `- Status do Sistema: ${operationalData.systemStatus}\n`;
    }
    if (operationalData.operatorActions) {
      prompt += `- Ações do Operador: ${operationalData.operatorActions}\n`;
    }
    if (operationalData.tamActivation !== undefined) {
      prompt += `- TAM Ativado: ${operationalData.tamActivation ? "Sim" : "Não"}\n`;
    }
    if (operationalData.logCompleteness) {
      prompt += `- Completude dos Logs: ${operationalData.logCompleteness}\n`;
    }
  }

  prompt += `\n**Normas de Referência:**
1. IMCA M103 - Guidelines for the Design and Operation of Dynamically Positioned Vessels
2. IMCA M117 - Code of Practice for the Training and Experience of Key DP Personnel
3. IMCA M190 - Code of Practice for Developing and Conducting DP Annual Trials Programmes
4. IMCA M166 - Code of Practice on Failure Modes and Effects Analysis (FMEA)
5. IMCA M109 - Guide to DP-related Documentation
6. IMCA M220 - Guidance on Operational Activity Planning
7. IMCA M140 - Specification for DP Capability Plots
8. MSF 182 - International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels
9. MTS DP Operations - Guidance (Marine Technology Society)
10. IMO MSC.1/Circ.1580 - Guidelines for Vessels with Dynamic Positioning Systems

**Módulos a Auditar:**
${modules.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Por favor, gere um relatório de auditoria técnica detalhado em formato JSON com a seguinte estrutura:

{
  "context": "Contexto da auditoria (2-3 parágrafos explicando o cenário)",
  "modulesAudited": ["Lista dos módulos auditados"],
  "standardsApplied": ["Lista dos códigos das normas aplicadas, ex: IMCA M103"],
  "nonConformities": [
    {
      "module": "Nome do módulo",
      "standard": "Código da norma",
      "description": "Descrição detalhada da não-conformidade",
      "riskLevel": "Alto|Médio|Baixo",
      "probableCauses": ["Lista de causas prováveis"],
      "correctiveAction": "Descrição da ação corretiva recomendada",
      "verificationRequirements": "Requisitos para verificar a correção"
    }
  ],
  "actionPlan": [
    {
      "priority": "Crítico|Alto|Médio|Baixo",
      "action": "Descrição da ação",
      "recommendedDeadline": "Prazo recomendado (ex: 7 dias, 30 dias, 90 dias)",
      "responsibleParty": "Parte responsável pela execução",
      "verificationMethod": "Método de verificação da conclusão"
    }
  ],
  "summary": "Resumo executivo da auditoria",
  "recommendations": "Recomendações finais e próximos passos"
}

Seja técnico, detalhado e específico. Para cada não-conformidade, cite a norma específica e explique claramente o problema e a solução. Priorize itens críticos no plano de ação.`;

  return prompt;
}
