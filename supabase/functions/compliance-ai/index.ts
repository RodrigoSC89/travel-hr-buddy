import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_compliance":
        systemPrompt = `Você é um especialista em conformidade marítima e auditorias. Analise os dados fornecidos e forneça:
1. Nível de risco geral (low, medium, high, critical)
2. Áreas de risco com percentuais e tendências
3. Previsão de problemas potenciais com probabilidades
4. Gaps de conformidade identificados
5. Prontidão para diferentes tipos de auditoria
6. Resumo executivo em português

Responda SEMPRE em JSON válido seguindo este formato:
{
  "overallRiskLevel": "low|medium|high|critical",
  "riskAreas": [{"area": string, "risk": number, "trend": "improving|stable|worsening", "recommendation": string}],
  "predictedIssues": [{"issue": string, "probability": number, "impact": string, "preventiveAction": string}],
  "complianceGaps": [{"regulation": string, "gap": string, "priority": "high|medium|low", "suggestedAction": string}],
  "auditReadiness": [{"type": string, "readinessScore": number, "weakAreas": string[], "recommendations": string[]}],
  "summary": string
}`;
        userPrompt = `Analise os seguintes dados de conformidade:

Items de Conformidade: ${JSON.stringify(data.complianceItems || [])}
Auditorias: ${JSON.stringify(data.audits || [])}
Certificados: ${JSON.stringify(data.certificates || [])}

Forneça uma análise completa de conformidade.`;
        break;

      case "generate_checklist":
        systemPrompt = `Você é um especialista em auditorias marítimas. Gere um checklist detalhado para o tipo de auditoria especificado.
O checklist deve ser específico, acionável e baseado nas melhores práticas da indústria marítima.
Responda em JSON: {"checklist": ["item1", "item2", ...]}`;
        userPrompt = `Gere um checklist completo para:
Tipo de Auditoria: ${data.auditType}
Tipo de Embarcação: ${data.vesselType}
Regulamentações aplicáveis: ISM Code, ISPS Code, SOLAS, MARPOL, MLC 2006`;
        break;

      case "analyze_document":
        systemPrompt = `Você é um especialista em análise de documentos de conformidade marítima.
Analise o documento e identifique:
1. Tipo de documento
2. Informações extraídas relevantes
3. Status de conformidade
4. Problemas encontrados
5. Recomendações

Responda em JSON:
{
  "documentType": string,
  "extractedInfo": object,
  "complianceStatus": "compliant|non-compliant|needs-review",
  "issues": string[],
  "recommendations": string[]
}`;
        userPrompt = `Analise o seguinte documento:
Tipo: ${data.type}
Conteúdo: ${data.content}`;
        break;

      case "chat":
        systemPrompt = `Você é um assistente especializado em conformidade marítima, auditorias e regulamentações.
Suas áreas de conhecimento incluem:
- ISM Code (International Safety Management)
- ISPS Code (International Ship and Port Facility Security)
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution Prevention)
- MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- Auditorias PSC (Port State Control)
- Auditorias de Classificadoras

Responda de forma clara, concisa e prática em português. Forneça exemplos quando relevante.
Se a pergunta for sobre procedimentos específicos, inclua referências às regulamentações aplicáveis.`;
        userPrompt = data.message;
        break;

      case "predict_risks":
        systemPrompt = `Você é um especialista em análise preditiva de riscos de conformidade marítima.
Analise os dados e preveja riscos futuros com probabilidades.
Responda em JSON:
{
  "predictions": [
    {"issue": string, "probability": number, "impact": string, "preventiveAction": string}
  ]
}`;
        userPrompt = `Analise os seguintes dados e preveja riscos potenciais:
${JSON.stringify(data.complianceData)}`;
        break;

      case "suggest_corrective_action":
        systemPrompt = `Você é um especialista em ações corretivas para não-conformidades marítimas.
Sugira ações corretivas específicas, prazos realistas e responsabilidades.
Responda de forma clara e acionável.`;
        userPrompt = `Sugira ações corretivas para o seguinte finding:
Categoria: ${data.finding?.category}
Descrição: ${data.finding?.description}
Severidade: ${data.finding?.severity}`;
        break;

      case "training_recommendation":
        systemPrompt = `Você é um especialista em treinamento marítimo e desenvolvimento de tripulação.
Baseado no histórico do tripulante, sugira treinamentos prioritários e um plano de desenvolvimento.
Considere requisitos STCW e necessidades operacionais.`;
        userPrompt = data.message;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Try to parse JSON response if expected
    let result;
    if (["analyze_compliance", "generate_checklist", "analyze_document", "predict_risks"].includes(action)) {
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = { response: content };
        }
      } catch {
        result = { response: content };
      }
    } else {
      result = { response: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Compliance AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
