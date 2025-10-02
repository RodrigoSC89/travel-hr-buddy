import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory for edge function)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx except 429)
      if (error instanceof Error && error.message.includes('400')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Unknown error');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, userId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Rate limiting check (20 requests per minute per user)
    const rateLimitKey = userId || 'anonymous';
    const now = Date.now();
    const rateLimit = rateLimitStore.get(rateLimitKey);
    
    if (!rateLimit || now >= rateLimit.resetTime) {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
    } else if (rateLimit.count >= 20) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait a moment.',
        timestamp: new Date().toISOString()
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      rateLimit.count++;
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Processing chat request:', message.substring(0, 50) + '...');

    const systemPrompt = `Você é um assistente corporativo inteligente chamado Nautilus Assistant. 

    Você pode ajudar com:
    - Análise de dados e geração de relatórios
    - Dúvidas sobre o sistema e navegação
    - Informações sobre certificados e compliance
    - Reservas e viagens corporativas
    - Alertas de preços e monitoramento
    - Gestão de recursos humanos
    - Análises de desempenho e métricas

    Características:
    - Seja sempre profissional, útil e direto
    - Responda em português brasileiro
    - Forneça informações precisas e acionáveis
    - Se não souber algo específico, seja honesto
    - Sugira próximos passos quando apropriado

    ${context ? `Contexto adicional: ${context}` : ''}`;

    // Use retry logic for OpenAI API call
    const data = await retryWithBackoff(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      return await response.json();
    });

    const reply = data.choices[0].message.content;

    console.log('Generated response successfully');

    return new Response(JSON.stringify({ 
      reply,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    const statusCode = error instanceof Error && error.message.includes('429') ? 429 : 500;
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});