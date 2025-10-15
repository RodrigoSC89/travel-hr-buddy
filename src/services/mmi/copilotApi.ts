/**
 * MMI Copilot Service v1.1.0
 * Provides AI-powered maintenance suggestions based on historical data with vector embeddings
 */

import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "./embeddingService";
import { AIRecommendation, SimilarCase } from "@/types/mmi";
import OpenAI from "openai";

export interface CopilotSuggestion {
  text: string;
  timestamp: string;
}

/**
 * Get similar historical cases using vector similarity search
 */
const getSimilarCases = async (embedding: number[], matchThreshold = 0.7, matchCount = 5): Promise<SimilarCase[]> => {
  try {
    const { data, error } = await supabase.rpc("match_mmi_job_history", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.warn("Error fetching similar cases from database:", error);
      return [];
    }

    return (data || []).map((item: {
      job_id?: string;
      similarity?: number;
      action?: string;
      outcome?: string;
      created_at?: string;
    }) => ({
      job_id: item.job_id || "UNKNOWN",
      similarity: item.similarity || 0,
      action: item.action || "No action recorded",
      outcome: item.outcome || "Unknown",
      date: item.created_at,
    }));
  } catch (error) {
    console.warn("Database not available, using mock similar cases");
    return [
      { job_id: "JOB-001", similarity: 0.85, action: "Substituição preventiva", outcome: "Sucesso" },
      { job_id: "JOB-012", similarity: 0.78, action: "Inspeção detalhada", outcome: "Sucesso" },
      { job_id: "JOB-024", similarity: 0.72, action: "Manutenção corretiva", outcome: "Sucesso" },
    ];
  }
};

/**
 * Generate AI recommendation with GPT-4 based on job and historical context
 */
export const getAIRecommendation = async (jobDescription: string): Promise<AIRecommendation> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Generate embedding for similarity search
  const embedding = await generateEmbedding(jobDescription);
  const similarCases = await getSimilarCases(embedding);

  // If OpenAI API is not available, return mock recommendation
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("OpenAI API key not configured, using mock recommendation");
    return {
      technical_action: `Realizar inspeção completa e preventiva do componente descrito: ${jobDescription.substring(0, 100)}`,
      component: "Sistema identificado no job",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      requires_work_order: true,
      reasoning: `Com base em ${similarCases.length} casos similares no histórico, recomenda-se ação preventiva. Casos similares tiveram sucesso com manutenção programada.`,
      similar_cases: similarCases,
    };
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const similarCasesContext = similarCases.map(c => 
      `- Job ${c.job_id} (${(c.similarity * 100).toFixed(0)}% similar): ${c.action} → ${c.outcome}`
    ).join("\n");

    const prompt = `Você é um assistente especializado em manutenção industrial marítima.

Problema: ${jobDescription}

Casos históricos similares:
${similarCasesContext || "Nenhum caso similar encontrado"}

Forneça uma recomendação técnica estruturada em JSON com os seguintes campos:
- technical_action: ação técnica detalhada recomendada
- component: nome do componente ou sistema afetado
- deadline: data sugerida no formato YYYY-MM-DD (considere 7-14 dias)
- requires_work_order: true/false se requer ordem de serviço formal
- reasoning: explicação detalhada baseada nos casos históricos

Responda APENAS com JSON válido, sem texto adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a technical maintenance assistant. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const recommendation = JSON.parse(content);

    return {
      ...recommendation,
      similar_cases: similarCases,
    };
  } catch (error) {
    console.error("Error generating AI recommendation:", error);
    // Return fallback recommendation
    return {
      technical_action: `Realizar inspeção e manutenção preventiva: ${jobDescription.substring(0, 100)}`,
      component: "Sistema do job",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      requires_work_order: true,
      reasoning: "Recomendação baseada em boas práticas de manutenção industrial.",
      similar_cases: similarCases,
    };
  }
};

/**
 * Get AI-powered maintenance suggestions using streaming response
 * @param prompt - Description of the maintenance issue
 * @param onChunk - Callback to handle each chunk of the streaming response
 * @returns Promise that resolves when the stream is complete
 */
export const getCopilotSuggestions = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke("mmi-copilot", {
      body: { prompt },
    });

    if (error) {
      throw error;
    }

    // Handle non-streaming response (fallback)
    if (data) {
      onChunk(data.reply || data.text || JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error fetching copilot suggestions:", error);
    throw error;
  }
};

/**
 * Get AI-powered maintenance suggestions with streaming support
 * @param prompt - Description of the maintenance issue
 * @param onChunk - Callback to handle each chunk of the streaming response
 * @returns Promise that resolves when the stream is complete
 */
export const streamCopilotSuggestions = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    // Get the function URL from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error("Supabase URL not configured");
    }

    const functionUrl = `${supabaseUrl}/functions/v1/mmi-copilot`;
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || supabaseAnonKey}`,
        "apikey": supabaseAnonKey || "",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      
      if (done) {
        isDone = true;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error("Error streaming copilot suggestions:", error);
    throw error;
  }
};
