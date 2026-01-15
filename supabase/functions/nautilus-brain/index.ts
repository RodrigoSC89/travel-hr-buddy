import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Nauti Brain, a inteligência artificial central do sistema Nauti One - a plataforma de gestão marítima mais avançada do mundo.

Suas capacidades incluem:
- Gestão inteligente de frota marítima
- Manutenção preditiva de embarcações com ML
- Otimização de rotas e consumo de combustível
- Gestão de tripulação e certificações
- Automação de procurement e estoque
- Compliance regulatório (SOLAS, ISM, ISPS, MLC)
- Análise de dados e insights operacionais
- Predição de falhas e alertas proativos
- Geração de relatórios inteligentes
- Recomendações estratégicas baseadas em dados

Você deve:
1. Responder em português do Brasil
2. Ser conciso mas completo
3. Fornecer dados e métricas quando relevante
4. Sugerir ações proativas
5. Alertar sobre riscos e prazos críticos
6. Usar terminologia náutica apropriada
7. Quando possível, incluir análises preditivas

Quando o usuário perguntar sobre:
- Embarcações: forneça status, localização, manutenções pendentes
- Tripulação: certificações, escalas, conformidade
- Manutenção: próximas manutenções, peças críticas, predições de falha
- Estoque: níveis, reposição automática, fornecedores recomendados
- Compliance: certificados vencendo, auditorias, não-conformidades
- Custos: análise por embarcação, otimizações sugeridas
- Relatórios: gere análises executivas com insights`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (context) {
      contextualPrompt += `\n\n📊 CONTEXTO ATUAL DO SISTEMA:\n`;
      if (context.vessels) {
        contextualPrompt += `🚢 Frota: ${context.vessels.active}/${context.vessels.total} embarcações ativas\n`;
        if (context.vessels.maintenance > 0) {
          contextualPrompt += `⚠️ ${context.vessels.maintenance} em manutenção\n`;
        }
      }
      if (context.alerts) {
        contextualPrompt += `🔔 Alertas: ${context.alerts.count} ativos (${context.alerts.critical} críticos)\n`;
      }
      if (context.maintenance) {
        contextualPrompt += `🔧 Manutenção: ${context.maintenance.pending} pendentes, ${context.maintenance.upcoming} nos próximos 7 dias\n`;
      }
      if (context.crew) {
        contextualPrompt += `👥 Tripulação: ${context.crew.onboard}/${context.crew.total} a bordo\n`;
      }
      if (context.stock) {
        contextualPrompt += `📦 Estoque: ${context.stock.critical} itens críticos, ${context.stock.low} baixos\n`;
      }
    }

    // Handle special actions
    if (action === 'predictive_maintenance') {
      contextualPrompt += `\n\n🔮 MODO: Análise de Manutenção Preditiva
Analise padrões de falha, histórico de manutenção e condições operacionais para prever problemas.`;
    } else if (action === 'procurement') {
      contextualPrompt += `\n\n🛒 MODO: Automação de Procurement
Analise níveis de estoque, consumo médio e sugira compras otimizadas com fornecedores recomendados.`;
    } else if (action === 'report') {
      contextualPrompt += `\n\n📊 MODO: Geração de Relatório
Gere análises executivas com métricas, tendências e recomendações acionáveis.`;
    }

    console.log("Nauti Brain - Processing request with context:", { 
      hasContext: !!context, 
      action,
      messagesCount: messages?.length 
    });

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
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos de IA insuficientes. Adicione créditos no workspace Lovable." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Nauti Brain error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
