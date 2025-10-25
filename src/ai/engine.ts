/**
 * PATCH 131.0 - Core AI Engine
 * Central AI Engine with OpenAI Integration
 * 
 * This engine provides AI capabilities with module-specific context awareness
 * for all Nautilus One modules.
 */

import { openai } from "@/lib/ai/openai-client";
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
    console.warn("⚠️ OpenAI API key not configured. Returning mock response.");
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
    console.error("Error calling OpenAI API:", error);
    throw new Error(`AI Engine Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Store AI interaction for context building
 */
const storeInteraction = async (request: AIEngineRequest, response: string): Promise<void> => {
  if (!request.context) return;
  
  try {
    // Store interaction in module context for future learning
    // This could be extended to save to Supabase for persistent learning
    const contextData = {
      moduleName: request.context.moduleName,
      userId: request.context.userId,
      input: request.messages[request.messages.length - 1]?.content,
      output: response,
      timestamp: new Date().toISOString()
    };
    
    console.log("AI Interaction stored:", contextData);
    // TODO: Implement Supabase persistence for context history
  } catch (error) {
    console.warn("Failed to store AI interaction:", error);
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
