import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Exponential backoff with jitter
const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return exponentialDelay + jitter;
};

// Check if error is retryable
const isRetryableError = (status?: number, error?: Error): boolean => {
  if (!status && error) {
    // Network errors are retryable
    return error.message.includes("fetch") || error.message.includes("network");
  }
  // Retry on 429 (rate limit), 500s (server errors), and 503 (service unavailable)
  return status === 429 || (status !== undefined && status >= 500 && status < 600);
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
    // Extract job ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 2]; // Assuming path is /mmi-job-postpone/{id}/postpone

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch job data from database
    const { data: job, error: jobError } = await supabase
      .from('mmi_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    // Use mock data if job not found (for development/testing)
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

    const jobData = job || mockJob;

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Processing postpone request for job:", jobId);

    // Build prompt for OpenAI
    const prompt = `Você é um engenheiro marítimo com IA embarcada. Avalie a possibilidade de postergar o seguinte job de manutenção:

Título: ${jobData.title}
Componente: ${jobData.component}
Uso atual: ${jobData.usage_hours}h
Média histórica: ${jobData.avg_usage}h
Peça em estoque: ${jobData.stock ? 'Sim' : 'Não'}
Missão em andamento: ${jobData.mission_active ? 'Sim' : 'Não'}
Histórico: ${jobData.history}

Responda apenas com: ✅ Pode postergar com risco baixo OU ❌ Não é recomendável postergar.`;

    const requestBody = {
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Você é um engenheiro embarcado que avalia risco de postergação." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.2
    };

    // Retry logic with exponential backoff
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
          break; // Success, exit retry loop
        }

        // Check if we should retry
        if (!isRetryableError(response.status)) {
          const errorText = await response.text();
          console.error("OpenAI API non-retryable error:", errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        lastError = new Error(`HTTP ${response.status}`);
        
        // Wait before retrying (except on last attempt)
        if (attempt < MAX_RETRIES) {
          const delay = getRetryDelay(attempt);
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on timeout or network errors on last attempt
        if (attempt === MAX_RETRIES) {
          throw new Error(`OpenAI API failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
        
        // Wait before retrying
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

    console.log("Generated response:", reply);

    return new Response(JSON.stringify({ 
      message: reply,
      jobId: jobId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in mmi-job-postpone function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
