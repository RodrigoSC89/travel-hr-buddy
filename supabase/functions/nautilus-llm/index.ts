// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

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
}

serve(async (req) => {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { prompt, contextId = 'global', moduleId, sessionId, mode = 'safe' }: NautilusLLMRequest = await req.json();
    
    const startTime = Date.now();

    // Buscar contexto do sistema
    const { data: contextData } = await supabase
      .from('system_context_snapshots')
      .select('*')
      .eq('context_id', contextId)
      .single();

    const contextSummary = contextData?.summary || 'Sistema operacional normal';

    // Definir temperatura baseada no modo
    const temperatureMap = {
      'deterministic': 0.1,
      'creative': 0.7,
      'safe': 0.3
    };

    const temperature = temperatureMap[mode];

    // System prompt específico do Nautilus
    const systemPrompt = `Você é a IA embarcada do Nautilus One, um sistema marítimo offshore avançado.

CONTEXTO DO SISTEMA: ${contextSummary}

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

    // Verificar cache primeiro (fallback)
    const promptHash = btoa(prompt).substring(0, 50);
    const { data: cachedResponse } = await supabase
      .from('ia_response_cache')
      .select('*')
      .eq('prompt_hash', promptHash)
      .single();

    let response: string;
    let usedCache = false;

    try {
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
          max_tokens: 1000,
        }),
      });

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
        throw new Error('AI API error');
      }

      const data = await aiResponse.json();
      response = data.choices[0].message.content;

      // Atualizar cache
      await supabase
        .from('ia_response_cache')
        .upsert({
          prompt_hash: promptHash,
          cached_response: response,
          model_used: model,
          usage_count: (cachedResponse?.usage_count || 0) + 1,
          last_used_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('AI API error, using fallback:', error);
      
      if (cachedResponse) {
        response = cachedResponse.cached_response;
        usedCache = true;
      } else {
        response = 'Sistema em modo fallback. Por favor, reformule sua pergunta ou aguarde o restabelecimento da conexão com a IA principal.';
      }
    }

    const executionTime = Date.now() - startTime;

    // Calcular confidence score baseado no uso de cache e tempo de execução
    const confidenceScore = usedCache ? 0.75 : 0.95;

    // Obter user_id do token JWT
    const authHeader = req.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Registrar log da interação
    await supabase
      .from('ia_context_log')
      .insert({
        session_id: sessionId,
        user_id: userId,
        prompt,
        response,
        module_id: moduleId,
        confidence_score: confidenceScore,
        execution_time_ms: executionTime,
        model_used: usedCache ? 'cache' : 'gpt-4o-mini',
        context_snapshot: contextData,
        metadata: {
          mode,
          used_cache: usedCache,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        response,
        sessionId,
        executionTime,
        confidenceScore,
        usedCache,
        model: usedCache ? 'cache' : 'gpt-4o-mini'
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
        fallbackMessage: 'Sistema de IA temporariamente indisponível. Por favor, tente novamente.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
