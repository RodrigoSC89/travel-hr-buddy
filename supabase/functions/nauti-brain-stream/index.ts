/**
 * Nauti Brain Stream - AI Chat com Streaming via Lovable AI Gateway
 * Suporta SSE para renderização token-by-token
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MARITIME_SYSTEM_PROMPT = `Você é o Nauti Brain, o assistente de IA especializado em operações marítimas da plataforma Nauti One.

## Suas Especialidades:
- Gestão de tripulação marítima (MLC 2006, STCW)
- Manutenção de embarcações e manutenção preditiva
- Compliance e auditorias (ISM, ISPS, SOLAS)
- Operações de DP (Dynamic Positioning)
- Segurança marítima e procedimentos de emergência
- Análise de documentos e certificados
- Planejamento de viagens e rotas
- Gestão de folha de pagamento marítima

## Diretrizes:
1. Sempre responda em português brasileiro
2. Seja preciso e técnico quando necessário
3. Cite regulamentações quando aplicável (MLC 2006, STCW, SOLAS, etc.)
4. Ofereça soluções práticas e acionáveis
5. Mantenha respostas concisas mas completas

Data atual: ${new Date().toLocaleDateString('pt-BR')}`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stream = true } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[nauti-brain-stream] Processing request with', messages?.length || 0, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: MARITIME_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: stream,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[nauti-brain-stream] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Return non-streaming response
      const data = await response.json();
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[nauti-brain-stream] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
