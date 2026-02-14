/**
 * PATCH 852 - Core AI Engine with Lovable AI Gateway
 * Unified AI Engine using Lovable AI for all AI operations
 * 
 * This engine provides AI capabilities with module-specific context awareness
 * for all Nauti One modules.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { ModuleContext } from "./contexts/moduleContext";

export interface AIEngineRequest {
  model?: string;
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
 * Run AI completion via Lovable AI Gateway (through Edge Function)
 */
export const runOpenAI = async (request: AIEngineRequest): Promise<AIEngineResponse> => {
  try {
    // Call the ai-advisor edge function which uses Lovable AI Gateway
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: {
        question: request.messages.find(m => m.role === "user")?.content || "",
        systemPrompt: request.messages.find(m => m.role === "system")?.content || generateSystemPrompt("general"),
        profile: request.context?.moduleName || "general"
      }
    });

    if (error) {
      logger.warn("AI Gateway error, using fallback response", { error });
      return getFallbackResponse(request);
    }

    // Store context if provided
    if (request.context) {
      await storeInteraction(request, data.response || "");
    }

    return {
      content: data.response || data.evidence || data.justification || "",
      usage: undefined,
      model: request.model || "google/gemini-2.5-flash",
      timestamp: new Date()
    };
  } catch (error) {
    logger.warn("AI Engine error, using fallback", { error });
    return getFallbackResponse(request);
  }
};

/**
 * Fallback response when AI is unavailable
 */
const getFallbackResponse = (request: AIEngineRequest): AIEngineResponse => {
  const userMessage = request.messages.find(m => m.role === "user")?.content || "";
  const moduleName = request.context?.moduleName || "geral";
  
  const fallbackResponses: Record<string, string> = {
    "maintenance": "Para manutenção, recomendo verificar o histórico de intervenções e consultar o plano de manutenção preventiva.",
    "crew": "Para gestão de tripulação, acesse o módulo Maritime Command para visualizar escalas e certificações.",
    "voyage": "Para planejamento de viagem, utilize o módulo Voyage Planner para otimizar rotas e consumo.",
    "compliance": "Para compliance, consulte o Compliance Hub para verificar status de conformidade com MLC 2006 e STCW.",
    "geral": "Estou em modo offline. Para assistência completa, verifique sua conexão de rede."
  };

  return {
    content: fallbackResponses[moduleName] || fallbackResponses["geral"],
    model: "fallback",
    timestamp: new Date()
  };
};

/**
 * Store AI interaction for context building with Supabase persistence
 */
const storeInteraction = async (request: AIEngineRequest, response: string): Promise<void> => {
  if (!request.context) return;
  
  try {
    const contextData = {
      module_name: request.context.moduleName,
      user_id: request.context.userId,
      input: request.messages[request.messages.length - 1]?.content,
      output: response,
      model: request.model || "google/gemini-2.5-flash",
      temperature: request.temperature ?? 0.7,
      metadata: {
        messageCount: request.messages.length,
        hasSystemMessage: request.messages.some(m => m.role === "system")
      }
    };
    
    await supabase
      .from("ai_memory_events")
      .insert({
        event_type: "ai_interaction",
        event_data: contextData,
        user_id: request.context.userId,
        metadata: contextData.metadata
      });
  } catch (error) {
    logger.debug("Failed to store AI interaction");
  }
};

/**
 * Generate system prompt with module context
 */
export const generateSystemPrompt = (moduleName: string, context?: Record<string, unknown>): string => {
  const basePrompt = `Você é um assistente IA especializado no módulo ${moduleName} do sistema Nautilus One - uma plataforma de gestão de RH marítimo.`;
  
  const contextPrompt = context ? `\n\nContexto adicional:\n${JSON.stringify(context, null, 2)}` : "";
  
  const behaviorPrompt = `\n\nComportamento esperado:
- Forneça respostas práticas e acionáveis
- Use terminologia marítima quando apropriado (MLC 2006, STCW, SOLAS)
- Seja conciso mas informativo
- Sugira próximos passos quando relevante
- Indique nível de confiança nas recomendações`;

  return basePrompt + contextPrompt + behaviorPrompt;
};
