/**
 * AI Copilot Module
 * Provides AI-powered suggestions and assistance across the Nautilus One platform
 * 
 * This module serves as the main entry point for AI copilot features,
 * providing intelligent suggestions, context-aware assistance, and semantic search.
 */

import { openai } from "@/lib/ai/openai-client";

/**
 * Generate AI-powered suggestions based on context
 * 
 * @param context - The context string to generate suggestions from
 * @returns A promise that resolves to a suggestion string
 * 
 * @example
 * const suggestion = await copilotSuggest("Create safety checklist for vessel inspection");
 * console.log(suggestion); // "💡 Sugestão de IA baseada em: Create safety checklist..."
 */
export const copilotSuggest = async (context: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Fallback to mock implementation if no API key
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("⚠️ OpenAI API key not configured. Using mock suggestions.");
    return `💡 Sugestão de IA baseada em: ${context}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful maritime industry assistant that provides brief, actionable suggestions in Portuguese (Brazil)."
        },
        {
          role: "user",
          content: `Provide a brief suggestion or insight for: ${context}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const suggestion = response.choices[0]?.message?.content || "Sem sugestões disponíveis no momento.";
    return `💡 ${suggestion}`;
  } catch (error) {
    console.error("Error generating copilot suggestion:", error);
    return `💡 Sugestão de IA baseada em: ${context}`;
  }
};

/**
 * Analyze text and provide AI-powered insights
 * 
 * @param text - Text to analyze
 * @returns Analysis results with key insights
 */
export const analyzeText = async (text: string): Promise<{
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  keyPoints: string[];
}> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Fallback implementation
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return {
      summary: "Análise disponível apenas com chave de API configurada",
      sentiment: "neutral",
      keyPoints: ["Configure a chave de API OpenAI para análise completa"]
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a text analysis expert. Provide concise analysis in Portuguese (Brazil)."
        },
        {
          role: "user",
          content: `Analyze this text and provide: 1) A brief summary, 2) Sentiment (positive/neutral/negative), 3) Up to 3 key points.\n\nText: ${text}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const analysis = response.choices[0]?.message?.content || "";
    
    // Simple parsing - in production, use structured outputs
    return {
      summary: analysis.split("\n")[0] || "Análise não disponível",
      sentiment: "neutral",
      keyPoints: analysis.split("\n").slice(1, 4).filter(Boolean)
    };
  } catch (error) {
    console.error("Error analyzing text:", error);
    return {
      summary: "Erro ao analisar texto",
      sentiment: "neutral",
      keyPoints: []
    };
  }
};

/**
 * Generate context-aware completions
 * 
 * @param prompt - The prompt to complete
 * @param context - Additional context for the completion
 * @returns Completed text
 */
export const generateCompletion = async (
  prompt: string,
  context?: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return `${prompt} [API key required for completion]`;
  }

  try {
    const messages = [
      {
        role: "system" as const,
        content: "You are a helpful assistant for maritime operations and business management."
      }
    ];

    if (context) {
      messages.push({
        role: "system" as const,
        content: `Context: ${context}`
      });
    }

    messages.push({
      role: "user" as const,
      content: prompt
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sem resposta disponível";
  } catch (error) {
    console.error("Error generating completion:", error);
    return `${prompt} [Error generating completion]`;
  }
};

// Re-export copilot query functions for convenience
export { querySimilarJobs } from "@/lib/ai/copilot/querySimilarJobs";
export type { SimilarJobResult, SimilarJobMetadata, JobEmbeddingMatch } from "@/lib/ai/copilot/types";
