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
    const { content } = await req.json();
    
    if (!content) {
      throw new Error("Content is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing template enhancement request");

    const systemPrompt = \`Você é um assistente especializado em melhorar e refinar templates de documentos profissionais.

    Suas habilidades incluem:
    - Melhorar templates mantendo sua estrutura e campos variáveis
    - Preservar TODOS os campos variáveis no formato [NOME_VARIAVEL]
    - Aprimorar a clareza e profissionalismo do texto
    - Corrigir problemas gramaticais e de estilo
    - Manter o tom profissional e formal
    - Adicionar orientações úteis quando apropriado
    - Otimizar a estrutura e organização quando necessário
    - Especializado em documentação marítima e técnica

    REGRAS IMPORTANTES:
    1. NUNCA remova campos variáveis existentes [NOME_VARIAVEL]
    2. SEMPRE preserve a estrutura de seções do template original
    3. Mantenha o propósito e contexto do template original
    4. Melhore a redação sem alterar o significado
    5. Adicione campos variáveis adicionais apenas se fizerem sentido
    6. Preserve formatação e hierarquia de informações
    7. Use português brasileiro profissional

    Ao melhorar um template:
    - Mantenha todos os campos variáveis [EXEMPLO] intactos
    - Melhore a clareza e fluência do texto
    - Adicione orientações úteis quando apropriado
    - Corrija erros gramaticais e de estilo
    - Torne o template mais profissional e completo
    - NÃO remova informações importantes
    - NÃO altere radicalmente a estrutura\`;

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: \`Melhore e refine o seguinte template de documento, mantendo TODOS os campos variáveis [EXEMPLO] e a estrutura geral:\n\n\${content}\` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(\`API request attempt \${attempt + 1}/\${MAX_RETRIES + 1}\`);
        
        response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": \`Bearer \${OPENAI_API_KEY}\`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }, REQUEST_TIMEOUT);

        if (response.ok) {
          break;
        }

        const status = response.status;
        lastError = new Error(\`HTTP \${status}\`);

        if (status === 429 || (status >= 500 && status < 600)) {
          if (attempt < MAX_RETRIES) {
            const delay = getRetryDelay(attempt);
            console.log(\`Retrying after \${delay}ms...\`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw lastError;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === MAX_RETRIES) {
          throw new Error(\`OpenAI API failed after \${MAX_RETRIES + 1} attempts: \${lastError.message}\`);
        }
        
        const delay = getRetryDelay(attempt);
        console.log(\`Retrying after \${delay}ms...\`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response || !response.ok) {
      throw new Error(\`OpenAI API failed: \${lastError?.message || "Unknown error"}\`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const enhanced = data.choices[0].message.content;

    console.log("Enhanced template content:", enhanced.substring(0, 100) + "...");

    return new Response(JSON.stringify({ 
      content: enhanced,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error enhancing template:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
