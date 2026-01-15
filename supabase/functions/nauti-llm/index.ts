import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NautilusLLMRequest {
  prompt: string;
  contextId?: string;
  moduleId?: string;
  sessionId: string;
  mode?: 'deterministic' | 'creative' | 'safe';
  systemPrompt?: string;
  stream?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar Lovable AI Gateway (preferencial) ou OpenAI como fallback
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
      throw new Error('No AI API key configured');
    }

    const { prompt, contextId = 'global', moduleId, sessionId, mode = 'safe', systemPrompt: customSystemPrompt, stream = false }: NautilusLLMRequest = await req.json();
    
    const startTime = Date.now();

    // Definir temperatura baseada no modo
    const temperatureMap: Record<string, number> = {
      'deterministic': 0.1,
      'creative': 0.7,
      'safe': 0.3
    };

    const temperature = temperatureMap[mode] || 0.3;

    // System prompt específico do Nautilus
    const defaultSystemPrompt = `Você é a IA embarcada do Nautilus One, um sistema marítimo offshore avançado.

DIRETRIZES:
- Seja preciso e técnico em análises
- Priorize segurança operacional
- Forneça diagnósticos acionáveis
- Use terminologia marítima quando apropriado
- Identifique riscos e anomalias
- Sugira ações corretivas específicas

CAPACIDADES:
- Análise de logs e eventos do sistema
- Diagnóstico de falhas e degradações
- Previsão de manutenções
- Otimização operacional
- Geração de relatórios técnicos
- Interpretação de comandos em linguagem natural`;

    const systemPrompt = customSystemPrompt || defaultSystemPrompt;

    // Usar Lovable AI Gateway (preferencial)
    const apiUrl = LOVABLE_API_KEY 
      ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const apiKey = LOVABLE_API_KEY || OPENAI_API_KEY;
    const model = LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: 1500,
        stream,
      }),
    });

    // Handle streaming response
    if (stream && aiResponse.ok && aiResponse.body) {
      return new Response(aiResponse.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    }

    // Tratar rate limits e erros de pagamento
    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns segundos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'Créditos de IA esgotados. Recarregue seu plano.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const response = data.choices?.[0]?.message?.content || 'Sem resposta da IA';

    const executionTime = Date.now() - startTime;
    const confidenceScore = 0.95;

    console.log(`Nautilus LLM: ${prompt.substring(0, 50)}... -> ${response.substring(0, 50)}... (${executionTime}ms)`);

    return new Response(
      JSON.stringify({
        response,
        sessionId,
        executionTime,
        confidenceScore,
        usedCache: false,
        model
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Nautilus LLM error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackMessage: 'Sistema de IA temporariamente indisponível. Por favor, tente novamente.',
        response: 'Sistema de IA temporariamente indisponível. Por favor, tente novamente.',
        sessionId: crypto.randomUUID(),
        executionTime: 0,
        confidenceScore: 0.5,
        usedCache: false,
        model: 'fallback'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
