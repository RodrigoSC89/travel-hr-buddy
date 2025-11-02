/**
 * PATCH 536 - Core AI Engine
 * Central AI Engine with OpenAI Integration
 * 
 * This engine provides AI capabilities with module-specific context awareness
 * for all Nautilus One modules.
 */

import { openai } from "@/lib/ai/openai-client";
import { logger } from "@/lib/logger";
import { getModuleContext, ModuleContext } from "./contexts/moduleContext";

export interface AIEngineRequest {
  model?: "gpt-4o-mini" | "gpt-4o" | "gpt-3.5-turbo";
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  context?: ModuleContext;
  temperature?: number;
  maxTokens?: number;
}

export interface AIEngineResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  timestamp: Date;
}

/**
 * Run OpenAI completion with module context
 */
export const runOpenAI = async (request: AIEngineRequest): Promise<AIEngineResponse> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    logger.warn("OpenAI API key not configured - returning mock response");
    return {
      content: "AI engine não configurado. Configure VITE_OPENAI_API_KEY para habilitar respostas da IA.",
      model: "mock",
      timestamp: new Date()
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: request.model || "gpt-4o-mini",
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1000,
    });

    const choice = response.choices[0];
    
    // Store context if provided
    if (request.context) {
      await storeInteraction(request, choice.message.content || "");
    }

    return {
      content: choice.message.content || "",
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
      model: response.model,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error("Error calling OpenAI API", { error });
    throw new Error(`AI Engine Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * PATCH 586: Store AI interaction for context building with Supabase persistence
 */
const storeInteraction = async (request: AIEngineRequest, response: string): Promise<void> => {
  if (!request.context) return;
  
  try {
    const contextData = {
      module_name: request.context.moduleName,
      user_id: request.context.userId,
      input: request.messages[request.messages.length - 1]?.content,
      output: response,
      model: request.model || "gpt-4o-mini",
      temperature: request.temperature ?? 0.7,
      metadata: {
        messageCount: request.messages.length,
        hasSystemMessage: request.messages.some(m => m.role === "system")
      }
    };
    
    // Store in Supabase for persistent learning and analytics
    const { error } = await supabase
      .from("ai_interactions")
      .insert(contextData);
    
    if (error) {
      logger.warn("Failed to persist AI interaction to Supabase", { error });
    } else {
      logger.debug("AI interaction logged to Supabase", { module: contextData.module_name });
    }
  } catch (error) {
    logger.warn("Failed to store AI interaction", { error });
  }
};

/**
 * Generate system prompt with module context
 */
export const generateSystemPrompt = (moduleName: string, context?: Record<string, any>): string => {
  const basePrompt = `Você é um assistente IA especializado no módulo ${moduleName} do sistema Nautilus One.`;
  
  const contextPrompt = context ? `\n\nContexto adicional:\n${JSON.stringify(context, null, 2)}` : "";
  
  const behaviorPrompt = `\n\nComportamento esperado:
- Forneça respostas práticas e acionáveis
- Use terminologia marítima quando apropriado
- Seja conciso mas informativo
- Sugira próximos passos quando relevante
- Indique nível de confiança nas recomendações`;

  return basePrompt + contextPrompt + behaviorPrompt;
};
