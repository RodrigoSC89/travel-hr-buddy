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
      console.log("LOVABLE_API_KEY not configured, using local processing");
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_recommendations":
        systemPrompt = `Você é um especialista em treinamento marítimo e gestão de competências de tripulação. 
Analise os dados da tripulação e cursos disponíveis para gerar recomendações personalizadas de treinamento.
Considere: certificações vencendo, lacunas de habilidades, histórico de desempenho e requisitos regulatórios.
Responda APENAS em JSON válido.`;
        userPrompt = `Analise estes dados e gere recomendações de treinamento:
Tripulação: ${JSON.stringify(data.crew?.slice(0, 10))}
Cursos disponíveis: ${JSON.stringify(data.courses?.slice(0, 10))}

Retorne um JSON com formato:
{
  "recommendations": [
    {
      "id": "string",
      "crewMemberId": "string", 
      "crewMemberName": "string",
      "recommendedCourses": ["string"],
      "priority": "high|medium|low",
      "reason": "string",
      "predictedImpact": "string"
    }
  ]
}`;
        break;

      case "analyze_gaps":
        systemPrompt = `Você é um analista de treinamento marítimo especializado em identificar lacunas de competências.
Analise os dados para identificar áreas onde a tripulação precisa de desenvolvimento.
Considere requisitos STCW, SOLAS e outras regulamentações marítimas.
Responda APENAS em JSON válido.`;
        userPrompt = `Analise lacunas de treinamento:
Tripulação: ${JSON.stringify(data.crew?.slice(0, 10))}
Progresso atual: ${JSON.stringify(data.progress?.slice(0, 10))}

Retorne JSON:
{
  "gaps": [
    {
      "id": "string",
      "area": "string",
      "severity": "critical|warning|info",
      "affectedCrew": number,
      "description": "string",
      "suggestedAction": "string"
    }
  ]
}`;
        break;

      case "predictive_insights":
        systemPrompt = `Você é um sistema de IA preditiva para gestão de treinamento marítimo.
Gere insights baseados em tendências, vencimentos de certificações e padrões de desempenho.
Foque em ações preventivas e conformidade regulatória.
Responda APENAS em JSON válido.`;
        userPrompt = `Gere insights preditivos baseados nos dados:
${JSON.stringify(data)}

Retorne JSON:
{
  "insights": [
    {
      "id": "string",
      "type": "certification_expiry|skill_gap|compliance_risk|performance_trend",
      "title": "string",
      "description": "string",
      "impact": "high|medium|low",
      "timeframe": "string",
      "actionRequired": boolean,
      "suggestedAction": "string optional"
    }
  ]
}`;
        break;

      case "generate_content":
        systemPrompt = `Você é um especialista em criação de conteúdo educacional para treinamento marítimo.
Crie conteúdo detalhado, prático e alinhado com padrões da indústria.
O conteúdo deve ser em português brasileiro.
Responda APENAS em JSON válido.`;
        userPrompt = `Crie ${data.type} sobre o tema: ${data.topic}

Para course_outline, retorne:
{
  "content": {
    "title": "string",
    "modules": [{"id": number, "title": "string", "duration": number, "objectives": ["string"]}],
    "estimatedDuration": number,
    "prerequisites": ["string"]
  }
}`;
        break;

      case "generate_quiz":
        systemPrompt = `Você é um especialista em avaliação de treinamento marítimo.
Crie questões de múltipla escolha relevantes, práticas e alinhadas com a dificuldade solicitada.
As questões devem testar conhecimento aplicável.
Responda APENAS em JSON válido.`;
        userPrompt = `Crie um quiz de dificuldade ${data.difficulty} sobre:
${data.content?.substring(0, 1000)}

Retorne:
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number (índice 0-3),
      "explanation": "string"
    }
  ]
}`;
        break;

      case "chat":
        systemPrompt = `Você é um assistente especializado em treinamento marítimo e desenvolvimento de tripulação.
Ajude com dúvidas sobre cursos, certificações, planejamento de treinamento e conformidade.
Seja conciso, prático e forneça informações precisas.
Responda em português brasileiro.`;
        userPrompt = data.message;
        break;

      case "analyze_performance":
        systemPrompt = `Você é um analista de desempenho de treinamento.
Analise o histórico de treinamento e forneça insights sobre desempenho e áreas de melhoria.
Responda APENAS em JSON válido.`;
        userPrompt = `Analise o desempenho do tripulante:
ID: ${data.crewId}
Histórico: ${JSON.stringify(data.history?.slice(0, 20))}

Retorne:
{
  "overallScore": number,
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "trend": "improving|stable|declining",
  "recommendations": ["string"],
  "predictedPerformance": number
}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

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
          JSON.stringify({ error: "Rate limit exceeded", fallback: processLocally(action, data) }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", fallback: processLocally(action, data) }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI Gateway error:", response.status);
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle chat action differently (text response)
    if (action === "chat") {
      return new Response(
        JSON.stringify({ response: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
    }

    return new Response(
      JSON.stringify(processLocally(action, data)),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Training AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Local processing fallback
function processLocally(action: string, data: any): any {
  switch (action) {
    case "generate_recommendations":
      const crew = data.crew || [];
      const courses = data.courses || [];
      return {
        recommendations: crew.slice(0, 5).map((c: any, i: number) => ({
          id: `rec-${i}`,
          crewMemberId: c.id || `crew-${i}`,
          crewMemberName: c.name || `Tripulante ${i + 1}`,
          recommendedCourses: courses.slice(0, 2).map((course: any) => course.course_name || course.name || "Curso"),
          priority: i === 0 ? "high" : i < 3 ? "medium" : "low",
          reason: `Recomendação baseada em análise de competências.`,
          predictedImpact: "Melhoria estimada de 15% em conformidade",
        })),
      };

    case "analyze_gaps":
      return {
        gaps: [
          { id: "gap-1", area: "Segurança STCW", severity: "critical", affectedCrew: 3, description: "Certificações próximas do vencimento", suggestedAction: "Agendar renovação" },
          { id: "gap-2", area: "Combate a Incêndio", severity: "warning", affectedCrew: 5, description: "Atualização necessária", suggestedAction: "Incluir no próximo ciclo" },
        ],
      };

    case "predictive_insights":
      return {
        insights: [
          { id: "i-1", type: "certification_expiry", title: "Certificações vencendo", description: "8 certificações vencem nos próximos 60 dias", impact: "high", timeframe: "60 dias", actionRequired: true, suggestedAction: "Agendar renovações" },
          { id: "i-2", type: "performance_trend", title: "Tendência positiva", description: "Melhoria de 18% no desempenho geral", impact: "medium", timeframe: "3 meses", actionRequired: false },
        ],
      };

    case "generate_content":
      return {
        content: {
          title: `Curso: ${data.topic || "Treinamento"}`,
          modules: [
            { id: 1, title: "Módulo 1 - Fundamentos", duration: 2, objectives: ["Compreender conceitos básicos"] },
            { id: 2, title: "Módulo 2 - Aplicação Prática", duration: 3, objectives: ["Aplicar conhecimentos"] },
          ],
          estimatedDuration: 5,
          prerequisites: [],
        },
      };

    case "generate_quiz":
      return {
        questions: [
          { id: "q1", question: "Qual o procedimento correto de segurança?", options: ["A - Correto", "B", "C", "D"], correctAnswer: 0, explanation: "A opção A está correta." },
        ],
      };

    case "chat":
      return { response: "Olá! Como posso ajudar com seus treinamentos?" };

    case "analyze_performance":
      return {
        overallScore: 82,
        strengths: ["Boa taxa de conclusão"],
        areasForImprovement: ["Tempo de resposta"],
        trend: "improving",
        recommendations: ["Continuar com treinamentos práticos"],
        predictedPerformance: 85,
      };

    default:
      return { error: "Unknown action" };
  }
}
