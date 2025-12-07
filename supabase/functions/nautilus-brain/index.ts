import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Nautilus Brain, a inteligência artificial central do sistema Nautilus One - a plataforma de gestão marítima mais avançada do mundo.

Suas capacidades incluem:
- Gestão inteligente de frota marítima
- Manutenção preditiva de embarcações
- Otimização de rotas e consumo de combustível
- Gestão de tripulação e certificações
- Controle de estoque e procurement
- Compliance regulatório (SOLAS, ISM, ISPS, MLC)
- Análise de dados e insights operacionais
- Predição de falhas e alertas proativos

Você deve:
1. Responder em português do Brasil
2. Ser conciso mas completo
3. Fornecer dados e métricas quando relevante
4. Sugerir ações proativas
5. Alertar sobre riscos e prazos críticos
6. Usar terminologia náutica apropriada

Quando o usuário perguntar sobre:
- Embarcações: forneça status, localização, manutenções pendentes
- Tripulação: certificações, escalas, conformidade
- Manutenção: próximas manutenções, peças críticas, predições
- Estoque: níveis, reposição automática, fornecedores
- Compliance: certificados vencendo, auditorias, não-conformidades
- Custos: análise de custos por embarcação, otimizações`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (context) {
      contextualPrompt += `\n\nContexto atual do sistema:\n`;
      if (context.vessels) {
        contextualPrompt += `- Total de embarcações: ${context.vessels.total}\n`;
        contextualPrompt += `- Em operação: ${context.vessels.active}\n`;
        contextualPrompt += `- Em manutenção: ${context.vessels.maintenance}\n`;
      }
      if (context.alerts) {
        contextualPrompt += `- Alertas ativos: ${context.alerts.count}\n`;
        contextualPrompt += `- Alertas críticos: ${context.alerts.critical}\n`;
      }
      if (context.maintenance) {
        contextualPrompt += `- Manutenções pendentes: ${context.maintenance.pending}\n`;
        contextualPrompt += `- Próximas 7 dias: ${context.maintenance.upcoming}\n`;
      }
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
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Nautilus Brain error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
