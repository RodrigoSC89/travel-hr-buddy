import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      crew_member,
      assessment_type,
      responses,
      incident_context
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em Neurociência Aplicada à Segurança Marítima e Fatores Humanos.

ÁREAS DE AVALIAÇÃO:
1. Quociente Emocional (QE): Autoconhecimento, Autorregulação, Empatia, Habilidades Sociais, Motivação
2. Fadiga e Cansaço: Turnos, horas trabalhadas, qualidade do sono
3. Stress Operacional: Pressão, prazos, emergências
4. Comunicação: Clareza, assertividade, escuta ativa
5. Tomada de Risco: Comportamentos de risco, violações de procedimentos
6. Arrogância/Excesso de Confiança: Subestimação de riscos

Para cada avaliação, forneça:
- Score numérico (0-100)
- Análise comportamental
- Riscos identificados
- Recomendações personalizadas
- Plano de desenvolvimento

Responda de forma técnica mas acessível, focando em segurança operacional.`;

    let userPrompt = "";
    
    if (assessment_type === "qi") {
      userPrompt = `Avalie o Quociente Emocional (QE) do tripulante:

**TRIPULANTE**: ${crew_member.name}
**FUNÇÃO**: ${crew_member.role}
**TEMPO DE SERVIÇO**: ${crew_member.tenure || 'N/A'}

**RESPOSTAS DO TESTE QE**:
${JSON.stringify(responses, null, 2)}

Forneça:
1. Score por dimensão (Autoconhecimento, Autorregulação, Empatia, Habilidades Sociais, Motivação)
2. Score QE total
3. Pontos fortes e áreas de melhoria
4. Recomendações de desenvolvimento
5. Impacto na segurança operacional`;
    } else if (assessment_type === "incident") {
      userPrompt = `Analise os fatores humanos relacionados ao incidente:

**TRIPULANTE ENVOLVIDO**: ${crew_member.name}
**FUNÇÃO**: ${crew_member.role}

**CONTEXTO DO INCIDENTE**:
${incident_context}

**FATORES REPORTADOS**:
${JSON.stringify(responses, null, 2)}

Analise:
1. Fatores humanos contribuintes (fadiga, stress, comunicação, etc.)
2. Nível de cada fator (1-5)
3. Causa raiz comportamental
4. Score de risco comportamental
5. Recomendações preventivas`;
    } else {
      userPrompt = `Avaliação comportamental geral:

**TRIPULANTE**: ${crew_member.name}
**FUNÇÃO**: ${crew_member.role}

**DADOS DA AVALIAÇÃO**:
${JSON.stringify(responses, null, 2)}

Forneça análise completa de fatores humanos e recomendações.`;
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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "";

    const result = {
      crew_member_id: crew_member.id,
      crew_member_name: crew_member.name,
      assessment_type,
      analysis,
      scores: extractScores(analysis),
      risk_level: extractRiskLevel(analysis),
      recommendations: extractRecommendations(analysis),
      wellness_plan: assessment_type === "qi" ? generateWellnessPlan(analysis) : null,
      generated_at: new Date().toISOString()
    };

    console.log("Human factors assessment completed for:", crew_member.name);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in human-factors-assessment:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractScores(analysis: string): Record<string, number> {
  const scores: Record<string, number> = {};
  const patterns = [
    { key: "self_awareness", pattern: /autoconhecimento[:\s]*(\d+)/i },
    { key: "self_regulation", pattern: /autorregula[çc][ãa]o[:\s]*(\d+)/i },
    { key: "empathy", pattern: /empatia[:\s]*(\d+)/i },
    { key: "social_skills", pattern: /habilidades sociais[:\s]*(\d+)/i },
    { key: "motivation", pattern: /motiva[çc][ãa]o[:\s]*(\d+)/i },
    { key: "total_qi", pattern: /(?:qe|qi) total[:\s]*(\d+)/i },
    { key: "fatigue", pattern: /fadiga[:\s]*(\d+)/i },
    { key: "stress", pattern: /stress[:\s]*(\d+)/i },
  ];

  for (const { key, pattern } of patterns) {
    const match = analysis.match(pattern);
    if (match) {
      scores[key] = parseInt(match[1]);
    }
  }

  return scores;
}

function extractRiskLevel(analysis: string): string {
  if (analysis.toLowerCase().includes("crítico") || analysis.toLowerCase().includes("alto risco")) {
    return "high";
  }
  if (analysis.toLowerCase().includes("moderado") || analysis.toLowerCase().includes("médio")) {
    return "medium";
  }
  return "low";
}

function extractRecommendations(analysis: string): string[] {
  const sections = analysis.split(/recomenda[çc][õo]es|sugest[õo]es/i);
  if (sections.length < 2) return [];
  const items = sections[1].split(/\n[-•*]|\d\./);
  return items.filter(i => i.trim().length > 5).slice(0, 5).map(i => i.trim());
}

function generateWellnessPlan(analysis: string): object {
  return {
    relaxation_exercises: ["Respiração 4-7-8", "Mindfulness 5 minutos", "Alongamento"],
    recommended_breaks: ["Pausa de 10 min a cada 2h", "Descanso adequado entre turnos"],
    mental_health_resources: ["Suporte psicológico disponível", "Linha de apoio 24h"],
    follow_up_schedule: "Reavaliação em 30 dias"
  };
}
