import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Circuit Breaker State
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false
};

const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 30000; // 30 seconds

function checkCircuitBreaker(): boolean {
  if (circuitBreaker.isOpen) {
    const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailure;
    if (timeSinceLastFailure > CIRCUIT_BREAKER_RESET_MS) {
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
      console.log("[Nauti Brain] Circuit breaker reset - attempting recovery");
      return false; // Circuit closed, allow request
    }
    return true; // Circuit still open
  }
  return false; // Circuit closed
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.isOpen = true;
    console.log("[Nauti Brain] Circuit breaker OPENED after", circuitBreaker.failures, "failures");
  }
}

function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.isOpen = false;
}

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

// Fallback to OpenAI GPT-4o if Lovable AI fails
async function callWithFallback(
  messages: any[], 
  contextualPrompt: string,
  LOVABLE_API_KEY: string
): Promise<Response> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  // Try primary: Lovable AI Gateway (Gemini)
  try {
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

    if (response.ok) {
      recordSuccess();
      return response;
    }

    // Rate limit or payment - don't fallback, return error
    if (response.status === 429 || response.status === 402) {
      return response;
    }

    throw new Error(`Lovable AI error: ${response.status}`);
  } catch (primaryError) {
    console.error("[Nauti Brain] Primary (Lovable AI) failed:", primaryError);
    recordFailure();

    // Fallback to OpenAI GPT-4o
    if (OPENAI_API_KEY) {
      console.log("[Nauti Brain] Attempting fallback to OpenAI GPT-4o...");
      try {
        const fallbackResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: contextualPrompt },
              ...(messages || []),
            ],
            stream: true,
          }),
        });

        if (fallbackResponse.ok) {
          console.log("[Nauti Brain] Fallback to GPT-4o successful");
          recordSuccess();
          return fallbackResponse;
        }
        throw new Error(`OpenAI fallback error: ${fallbackResponse.status}`);
      } catch (fallbackError) {
        console.error("[Nauti Brain] Fallback (OpenAI) also failed:", fallbackError);
        recordFailure();
      }
    }

    throw primaryError;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, action, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check circuit breaker
    if (checkCircuitBreaker()) {
      console.log("[Nauti Brain] Circuit breaker is OPEN - returning cached response");
      return new Response(JSON.stringify({ 
        error: "Sistema de IA temporariamente indisponível. Tente novamente em 30 segundos.",
        circuitBreakerOpen: true
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    console.log("[Nauti Brain] Processing request:", { 
      hasContext: !!context, 
      action,
      messagesCount: messages?.length,
      circuitBreakerState: circuitBreaker
    });

    // Log decision to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const startTime = Date.now();
      
      try {
        const response = await callWithFallback(messages, contextualPrompt, LOVABLE_API_KEY);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Nauti Brain] AI error:", response.status, errorText);
          
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

        // Log successful decision
        const responseTime = Date.now() - startTime;
        await supabase.from('ai_decisions').insert({
          title: 'Nauti Brain Chat',
          description: `Chat response for action: ${action || 'general'}`,
          type: 'nauti_brain_chat',
          confidence: 0.85,
          confidence_level: 'high',
          impact: 'low',
          status: 'completed',
          justification_reasoning: `Processed ${messages?.length || 0} messages with context`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).catch((err: Error) => console.error("[Nauti Brain] Decision logging error:", err));

        console.log("[Nauti Brain] Response successful in", responseTime, "ms");

        // Return streaming response
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (error) {
        console.error("[Nauti Brain] All providers failed:", error);
        throw error;
      }
    } else {
      // No Supabase - just call AI directly
      const response = await callWithFallback(messages, contextualPrompt, LOVABLE_API_KEY);
      
      if (!response.ok) {
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

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
  } catch (error) {
    console.error("[Nauti Brain] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});