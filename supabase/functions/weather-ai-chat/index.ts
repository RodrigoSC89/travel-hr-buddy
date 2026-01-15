import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const SYSTEM_PROMPT = `Você é um assistente meteorológico inteligente especializado em previsão do tempo e condições marítimas para o Brasil.

Suas responsabilidades:
1. Responder perguntas sobre clima e condições meteorológicas
2. Fornecer recomendações práticas (roupas, atividades, viagens)
3. Alertar sobre condições perigosas para navegação marítima
4. Analisar tendências climáticas e padrões
5. Dar dicas de saúde relacionadas ao clima

Diretrizes:
- Responda sempre em português brasileiro
- Seja conciso mas informativo (2-4 frases)
- Use emojis relevantes para tornar as respostas mais visuais
- Priorize informações de segurança quando houver alertas
- Considere o contexto marítimo (ondas, ventos, maré) quando relevante
- Se não tiver dados suficientes, indique claramente

Formato de resposta preferido:
- Resposta direta à pergunta
- Recomendação prática (se aplicável)
- Alerta de segurança (se necessário)`;

interface ChatRequest {
  message: string;
  context?: string;
  location?: string;
  history?: Array<{ role: string; content: string }>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { message, context, location, history = [] }: ChatRequest = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log(`[Weather AI Chat] Processing request for location: ${location}`);
    console.log(`[Weather AI Chat] Context length: ${context?.length || 0} chars`);

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add context if provided
    if (context) {
      messages.push({
        role: 'system',
        content: `Dados meteorológicos atuais para análise:\n${context}`
      });
    }

    // Add conversation history (last 6 messages)
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    console.log(`[Weather AI Chat] Sending ${messages.length} messages to GPT-4o`);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Weather AI Chat] OpenAI API error: ${response.status}`, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log(`[Weather AI Chat] Response generated successfully`);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'gpt-4o-mini',
        location,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Weather AI Chat] Error:', errorMessage);

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
