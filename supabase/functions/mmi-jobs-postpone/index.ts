import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;
const REQUEST_TIMEOUT = 30000;

// Exponential backoff with jitter
const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
};

// Timeout wrapper for fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      throw new Error("Method not allowed. Use POST.");
    }

    const { id } = await req.json();
    
    if (!id) {
      throw new Error("Job ID is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const jobId = id;

    console.log(`Processing postpone request for job ID: ${jobId}`);

    // Simulação de recuperação de dados (normalmente viria do Supabase)
    const mockJob = {
      id: jobId,
      title: 'Troca de filtro hidráulico',
      component: 'Bomba hidráulica popa',
      usage_hours: 241,
      avg_usage: 260,
      stock: true,
      mission_active: true,
      history: '3 trocas nos últimos 90 dias'
    };

    const prompt = `Você é um engenheiro marítimo com IA embarcada. Avalie a possibilidade de postergar o seguinte job de manutenção:

Título: ${mockJob.title}
Componente: ${mockJob.component}
Uso atual: ${mockJob.usage_hours}h
Média histórica: ${mockJob.avg_usage}h
Peça em estoque: ${mockJob.stock ? 'Sim' : 'Não'}
Missão em andamento: ${mockJob.mission_active ? 'Sim' : 'Não'}
Histórico: ${mockJob.history}

Responda apenas com: ✅ Pode postergar com risco baixo OU ❌ Não é recomendável postergar.`;

    const requestBody = {
      model: "gpt-4",
      messages: [
        { role: "system", content: "Você é um engenheiro embarcado que avalia risco de postergação." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    };

    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`API request attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }, REQUEST_TIMEOUT);

        if (response.ok) {
          break;
        }

        const status = response.status;
        lastError = new Error(`HTTP ${status}`);

        if (status === 429 || (status >= 500 && status < 600)) {
          if (attempt < MAX_RETRIES) {
            const delay = getRetryDelay(attempt);
            console.log(`Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw lastError;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === MAX_RETRIES) {
          throw new Error(`OpenAI API failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
        
        const delay = getRetryDelay(attempt);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`OpenAI API failed: ${lastError?.message || "Unknown error"}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const reply = data.choices[0].message.content;

    console.log("AI analysis result:", reply);

    return new Response(JSON.stringify({ 
      message: reply,
      timestamp: new Date().toISOString(),
      jobId: jobId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[MMI_JOBS_POSTPONE_ERROR]", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro ao avaliar postergação do job",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Method not allowed. Use POST." ? 405 : 500,
    });
  }
});
