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
      case "analyze_incident":
        systemPrompt = `Você é um especialista em segurança marítima e investigação de incidentes.
Analise o incidente fornecido e forneça:
1. Análise de causa raiz (RCA)
2. Avaliação de risco
3. Recomendações de ações corretivas
4. Medidas preventivas
5. Conformidade regulatória (ISM, SOLAS)
6. Lições aprendidas
7. Score de risco (0-100)

Responda em JSON:
{
  "rootCauseAnalysis": string,
  "riskAssessment": string,
  "recommendations": string[],
  "preventiveMeasures": string[],
  "regulatoryCompliance": string,
  "lessonsLearned": string,
  "riskScore": number,
  "predictedRecurrence": number
}`;
        userPrompt = `Analise o seguinte incidente de segurança:

Título: ${data.incident?.title}
Descrição: ${data.incident?.summary}
Causa Raiz: ${data.incident?.rootCause}
Embarcação: ${data.incident?.vessel}
Local: ${data.incident?.location}
Data: ${data.incident?.date}
Categoria: ${data.incident?.sgso_category}
Nível de Risco: ${data.incident?.sgso_risk_level}
${data.customPrompt ? `\nInstruções adicionais: ${data.customPrompt}` : ''}`;
        break;

      case "generate_recommendations":
        systemPrompt = `Você é um especialista em treinamento de segurança marítima.
Baseado nos dados da tripulação, gere recomendações de treinamento personalizadas.
Considere: certificações STCW, histórico de incidentes, gaps de competência.

Responda em JSON:
{
  "recommendations": [
    {
      "id": string,
      "crewMemberId": string,
      "crewMemberName": string,
      "recommendedCourses": string[],
      "priority": "low" | "medium" | "high",
      "reason": string,
      "predictedImpact": string
    }
  ]
}`;
        userPrompt = `Gere recomendações de treinamento para a tripulação:
${JSON.stringify(data.crew || [])}`;
        break;

      case "predictive_insights":
        systemPrompt = `Você é um analista de segurança marítima com expertise em análise preditiva.
Analise os dados de segurança e gere insights preditivos sobre:
- Tendências de segurança
- Previsões de risco
- Lacunas de treinamento
- Fadiga operacional
- Conformidade regulatória

Responda em JSON:
{
  "insights": [
    {
      "id": string,
      "type": string,
      "title": string,
      "description": string,
      "impact": "low" | "medium" | "high",
      "timeframe": string,
      "actionRequired": boolean,
      "suggestedAction": string
    }
  ]
}`;
        userPrompt = `Analise os seguintes dados de segurança e gere insights preditivos:
${JSON.stringify(data)}`;
        break;

      case "dds_generate":
        systemPrompt = `Você é um especialista em segurança marítima que cria Diálogos Diários de Segurança (DDS).
Gere um DDS completo e engajador sobre o tópico solicitado.
O DDS deve ser prático, relevante para operações marítimas e promover conscientização.

Responda em JSON:
{
  "title": string,
  "topic": string,
  "content": string,
  "keyPoints": string[],
  "discussionQuestions": string[],
  "safetyTips": string[],
  "duration": string
}`;
        userPrompt = `Gere um DDS sobre: ${data.topic || 'Segurança geral a bordo'}
Embarcação: ${data.vessel || 'Embarcação padrão'}
Departamento: ${data.department || 'Todos'}`;
        break;

      case "chat":
        systemPrompt = `Você é um assistente especializado em segurança marítima e industrial.
Suas áreas de expertise incluem:
- ISM Code e SMS
- SOLAS e convenções marítimas
- Investigação de incidentes e RCA
- DDS e treinamentos de segurança
- Gestão de riscos operacionais
- Saúde ocupacional marítima
- TRIR, LTI e métricas de segurança

Responda de forma clara, prática e em português.`;
        userPrompt = data.message;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Safety AI - Action: ${action}`);

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
        max_tokens: 2500,
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
    if (action !== "chat") {
      try {
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

    console.log(`Safety AI - Success for action: ${action}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Safety AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
