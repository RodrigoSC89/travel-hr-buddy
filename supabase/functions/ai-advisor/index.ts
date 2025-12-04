import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { question, systemPrompt, profile, action, eventData, decision } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let messages: any[] = [];
    let responseType = "chat";

    if (action === "generate-evidence") {
      responseType = "evidence";
      messages = [
        {
          role: "system",
          content: `Você é um especialista em documentação técnica offshore e sistemas DP.
Gere um resumo técnico de evidência para auditoria baseado nos dados fornecidos.
O resumo deve ser:
- Estruturado com seções claras (Evento, Contexto, Análise, Conclusão)
- Referenciando normas IMCA quando aplicável
- Objetivo e factual
- Adequado para documentação de conformidade
Formato: Markdown`
        },
        {
          role: "user",
          content: `Gere um resumo técnico de evidência para o seguinte evento:\n\n${JSON.stringify(eventData, null, 2)}`
        }
      ];
    } else if (action === "generate-justification") {
      responseType = "justification";
      messages = [
        {
          role: "system",
          content: `Você é um especialista em governança e compliance offshore.
Gere uma justificativa técnica formal para a decisão operacional fornecida.
A justificativa deve:
- Explicar o racional técnico da decisão
- Citar normas/procedimentos relevantes (IMCA, ASOG, FMEA)
- Avaliar riscos considerados
- Documentar alternativas avaliadas
- Ser adequada para registro de auditoria
Formato: Markdown`
        },
        {
          role: "user",
          content: `Gere uma justificativa técnica para a seguinte decisão:\n\n${JSON.stringify(decision, null, 2)}`
        }
      ];
    } else {
      // Chat normal
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ];
    }

    console.log(`AI Advisor request - Action: ${action || "chat"}, Profile: ${profile}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result: any = {};

    if (responseType === "evidence") {
      result = { evidence: content };
    } else if (responseType === "justification") {
      result = { justification: content };
    } else {
      result = {
        response: content,
        confidence: 0.85,
        sources: extractSources(content),
        recommendations: extractRecommendations(content),
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Advisor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractSources(content: string): string[] {
  const sources: string[] = [];
  const patterns = [
    /IMCA\s+M\d+/gi,
    /NORMAM[- ]\d+/gi,
    /IMO\s+[A-Z]+/gi,
    /ASOG/gi,
    /FMEA/gi,
    /PEOTRAM/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      sources.push(...matches.map(m => m.toUpperCase()));
    }
  });
  
  return [...new Set(sources)];
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.match(/^[-•*]\s*(?:recomend|sugest|verificar|monitorar|realizar)/i)) {
      recommendations.push(line.replace(/^[-•*]\s*/, '').trim());
    }
  });
  
  return recommendations.slice(0, 5);
}
