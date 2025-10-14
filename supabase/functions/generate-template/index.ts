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
    const { title, purpose } = await req.json();
    
    if (!title) {
      throw new Error("Title is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing template generation request:", title, purpose);

    const systemPrompt = `Você é um assistente especializado em criar templates de documentos profissionais de alta qualidade.

    Suas habilidades incluem:
    - Criar templates reutilizáveis para diversos tipos de documentos
    - Incluir campos variáveis que podem ser substituídos posteriormente (formato: [NOME_VARIAVEL])
    - Estruturar templates de forma profissional e organizada
    - Adaptar o conteúdo ao contexto e propósito especificado
    - Criar seções apropriadas e bem estruturadas
    - Especialmente otimizado para documentação marítima e técnica

    Campos variáveis comuns a incluir:
    - [NOME_TECNICO] - Nome do técnico responsável
    - [DATA] - Data do documento
    - [DATA_INSPECAO] - Data de inspeção
    - [EMBARCACAO] ou [NOME_EMBARCACAO] - Nome da embarcação
    - [EMPRESA] - Nome da empresa
    - [LOCAL] - Local do serviço
    - [NUMERO_RELATORIO] - Número do relatório
    - [EQUIPAMENTO] - Nome do equipamento
    - [OBSERVACOES] - Observações gerais

    Características dos templates:
    - Linguagem profissional e clara em português brasileiro
    - Estrutura bem definida com seções
    - Campos variáveis claramente marcados com []
    - Espaços para informações a serem preenchidas
    - Formatação apropriada e consistente
    - Conteúdo relevante ao contexto marítimo/técnico quando aplicável

    Ao gerar um template, sempre:
    1. Crie uma estrutura clara com títulos e seções
    2. Inclua campos variáveis onde apropriado
    3. Forneça orientações sobre o que preencher
    4. Mantenha tom profissional e formal
    5. Considere o contexto marítimo/técnico se relevante`;

    const userPrompt = purpose 
      ? `Crie um template de documento com o título: "${title}" para o seguinte propósito: ${purpose}`
      : `Crie um template de documento com o título: "${title}"`;

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    
    const content = data.choices[0].message.content;

    console.log("Generated template content:", content.substring(0, 100) + "...");

    return new Response(JSON.stringify({ 
      content,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating template:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
