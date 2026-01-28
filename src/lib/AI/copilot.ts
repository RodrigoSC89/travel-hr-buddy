/**
 * Copilot AI Suggestion Engine
 * Provides AI-powered suggestions and context-aware assistance
 * Integrated with OpenAI GPT-4o for production use
 */

import { logger } from "@/lib/logger";
import { openai } from "@/lib/ai/openai-client";

/**
 * Generate AI suggestions based on context using GPT-4o
 * @param context - The context string to generate suggestions for
 * @returns Promise<string> - AI-generated suggestion
 */
export const copilotSuggest = async (context: string): Promise<string> => {
  try {
    logger.info("Generating copilot suggestion for context:", context.substring(0, 50));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente inteligente do sistema Nauti One, especializado em operações marítimas. Forneça sugestões úteis e concisas baseadas no contexto."
        },
        { role: "user", content: context }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content || `Sugestão de IA baseada em: ${context}`;
  } catch (err) {
    logger.warn("OpenAI API unavailable, using fallback");
    // Fallback when API is unavailable
    return `Sugestão de IA baseada em: ${context}`;
  }
};

/**
 * Analyze context and provide recommendations using AI
 * @param context - The context to analyze
 * @returns Promise<string[]> - Array of recommendations
 */
export const analyzeContext = async (context: string): Promise<string[]> => {
  try {
    logger.info("Analyzing context:", context.substring(0, 50));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um analista do sistema Nauti One. Forneça 3 recomendações práticas baseadas no contexto. Retorne cada recomendação em uma linha separada."
        },
        { role: "user", content: context }
      ],
      max_tokens: 300,
      temperature: 0.5
    });
    
    const content = response.choices[0]?.message?.content || "";
    const recommendations = content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    
    return recommendations.length > 0 ? recommendations : [
      "Recomendação 1: Considere revisar os dados",
      "Recomendação 2: Verifique a conformidade",
      "Recomendação 3: Analise as tendências recentes"
    ];
  } catch {
    logger.warn("OpenAI API unavailable, using fallback");
    return [
      "Recomendação 1: Considere revisar os dados",
      "Recomendação 2: Verifique a conformidade",
      "Recomendação 3: Analise as tendências recentes"
    ];
  }
};

/**
 * Generate completion suggestions for partial input
 * @param partialInput - The partial input to complete
 * @returns Promise<string[]> - Array of completion suggestions
 */
export const getCompletions = async (partialInput: string): Promise<string[]> => {
  try {
    logger.info("Getting completions for:", partialInput);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Complete o texto parcial com 3 sugestões diferentes. Retorne cada sugestão em uma linha separada, sem numeração."
        },
        { role: "user", content: `Complete: "${partialInput}"` }
      ],
      max_tokens: 150,
      temperature: 0.8
    });
    
    const content = response.choices[0]?.message?.content || "";
    const completions = content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    
    return completions.length > 0 ? completions : [
      `${partialInput} - opção 1`,
      `${partialInput} - opção 2`,
      `${partialInput} - opção 3`
    ];
  } catch {
    logger.warn("OpenAI API unavailable, using fallback");
    return [
      `${partialInput} - opção 1`,
      `${partialInput} - opção 2`,
      `${partialInput} - opção 3`
    ];
  }
};
