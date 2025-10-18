import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirement_title, description, evidence, compliance_status } = await req.json();

    // Initialize OpenAI with API key from environment
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Construct the prompt
    const prompt = `
Você é um auditor técnico de embarcações offshore, especializado nos critérios SGSO (Sistema de Gestão de Segurança Operacional) do IBAMA.

Analise o seguinte requisito SGSO:

**Requisito:** ${requirement_title}
**Descrição:** ${description}
**Status de Conformidade:** ${compliance_status || "Não informado"}
**Evidência fornecida:** ${evidence || "Nenhuma evidência fornecida"}

Com base nas informações fornecidas, gere uma análise detalhada em formato JSON contendo:

1. **causa_provavel**: Identifique a causa provável de não conformidade (se houver). Se o status for conformidade total, explique os pontos fortes.

2. **recomendacao**: Forneça sugestões de ação corretiva ou preventiva específicas e práticas. Para conformidades totais, sugira melhorias contínuas.

3. **impacto**: Descreva o impacto operacional e de segurança desta situação, considerando tanto os aspectos ambientais quanto os de segurança da tripulação.

Responda APENAS com um objeto JSON válido no formato:
{
  "causa_provavel": "texto aqui",
  "recomendacao": "texto aqui",
  "impacto": "texto aqui"
}
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em auditorias SGSO para embarcações offshore, com profundo conhecimento das normas IBAMA, ANP e práticas de segurança marítima.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || "";
    
    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        analysis = {
          causa_provavel: "Análise não disponível",
          recomendacao: aiResponse,
          impacto: "Não determinado",
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      analysis = {
        causa_provavel: "Erro ao processar análise",
        recomendacao: aiResponse || "Resposta não disponível",
        impacto: "Não determinado",
      };
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in analyze-sgso-item function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erro ao processar análise",
        causa_provavel: "Erro ao processar análise por IA",
        recomendacao: "Por favor, tente novamente mais tarde ou realize a análise manual.",
        impacto: "Não determinado devido a erro no processamento",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
