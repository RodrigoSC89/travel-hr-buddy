/**
 * PATCH 1200 - AI Incident Analysis Edge Function
 * Uses Lovable AI Gateway to analyze maritime incidents
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncidentData {
  title: string;
  summary: string;
  rootCause: string;
  vessel: string;
  location: string;
  class_dp: string;
  tags: string[];
  date: string;
  sgso_category?: string;
  sgso_risk_level?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident, customPrompt } = await req.json() as { 
      incident: IncidentData; 
      customPrompt?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em segurança marítima e operações de DP (Dynamic Positioning). 
Sua função é analisar incidentes marítimos e fornecer:
1. Análise detalhada de causa raiz usando metodologia 5 Porquês e Diagrama de Ishikawa
2. Avaliação de risco seguindo padrões IMO e IMCA
3. Recomendações práticas e acionáveis
4. Medidas preventivas baseadas em melhores práticas da indústria
5. Verificação de conformidade com regulamentações (SOLAS, MARPOL, IMCA M 117, etc.)
6. Lições aprendidas aplicáveis a outras operações
7. Referência a incidentes similares documentados

Responda sempre em português brasileiro com linguagem técnica apropriada para profissionais marítimos.
Formate a resposta como JSON com as seguintes chaves:
- rootCauseAnalysis: string
- riskAssessment: string  
- recommendations: array de strings
- preventiveMeasures: array de strings
- regulatoryCompliance: string
- lessonsLearned: string
- similarIncidents: array de strings`;

    const userMessage = customPrompt 
      ? `Analise este incidente e responda: ${customPrompt}\n\nIncidente: ${JSON.stringify(incident, null, 2)}`
      : `Analise o seguinte incidente marítimo e forneça uma análise completa:

Título: ${incident.title}
Embarcação: ${incident.vessel}
Classe DP: ${incident.class_dp}
Local: ${incident.location}
Data: ${incident.date}
Causa Raiz Identificada: ${incident.rootCause}
Categoria SGSO: ${incident.sgso_category || "N/A"}
Nível de Risco SGSO: ${incident.sgso_risk_level || "N/A"}
Tags: ${incident.tags.join(", ")}

Descrição: ${incident.summary}

Forneça uma análise completa seguindo o formato especificado.`;

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
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Try to parse as JSON, fallback to structured extraction
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch {
      // If JSON parsing fails, create structured response from text
      analysis = {
        rootCauseAnalysis: content,
        riskAssessment: `Avaliação baseada no incidente: ${incident.title}`,
        recommendations: [
          "Revisar procedimentos operacionais",
          "Implementar medidas corretivas",
          "Treinar equipe envolvida"
        ],
        preventiveMeasures: [
          "Manutenção preventiva regular",
          "Simulações periódicas",
          "Atualização de checklists"
        ],
        regulatoryCompliance: "Verificar conformidade com IMO MSC.1/Circ.1580 e IMCA M 117",
        lessonsLearned: "Documentar e compartilhar lições aprendidas com toda a frota",
        similarIncidents: ["Consultar base de dados IMCA para incidentes similares"]
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Incident Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro na análise",
        rootCauseAnalysis: "Análise não disponível no momento",
        riskAssessment: "Avaliação pendente",
        recommendations: ["Entre em contato com o suporte"],
        preventiveMeasures: [],
        regulatoryCompliance: "",
        lessonsLearned: "",
        similarIncidents: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
