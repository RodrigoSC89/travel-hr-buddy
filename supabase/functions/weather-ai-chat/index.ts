/**
 * Weather AI Chat - Lovable AI Gateway
 * Contextual weather assistant for maritime operations
 */
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "WEATHER-AI-CHAT";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Você é um assistente meteorológico inteligente especializado em previsão do tempo e condições marítimas.

Suas responsabilidades:
1. Responder perguntas sobre clima e condições meteorológicas
2. Fornecer recomendações práticas para operações marítimas
3. Alertar sobre condições perigosas para navegação
4. Analisar tendências climáticas e padrões de vento/ondas
5. Recomendar janelas operacionais seguras

Diretrizes:
- Responda sempre em português brasileiro
- Seja conciso mas informativo (2-4 frases)
- Use emojis relevantes para tornar as respostas mais visuais
- Priorize informações de segurança quando houver alertas
- Considere o contexto marítimo (ondas, ventos, maré, correntes) quando relevante
- Forneça recomendações operacionais para embarcações quando possível
- Se não tiver dados suficientes, indique claramente`;

interface ChatRequest {
  message: string;
  context?: string;
  location?: string;
  history?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { message, context, location, history = [] }: ChatRequest = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    edgeLogger.info(TAG, "Processing request", { location, contextLength: context?.length || 0 });

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Dados meteorológicos atuais para análise:\n${context}`
      });
    }

    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: message });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded", response: "⏳ Limite de requisições atingido. Tente novamente em alguns instantes." }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Credits exhausted", response: "💳 Créditos de IA esgotados. Contate o administrador." }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      edgeLogger.error(TAG, "AI gateway error", new Error(errorData), { status: response.status });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    edgeLogger.success(TAG, "Response generated");

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'google/gemini-3-flash-preview',
        location,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    edgeLogger.error(TAG, "Error", error);

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: 'Desculpe, não foi possível processar sua pergunta. Tente novamente em alguns instantes. 🌧️'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
