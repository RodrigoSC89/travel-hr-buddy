/**
 * PATCH 131.0 - AI Assistant Hook
 * React hook for integrating AI assistant in any component
 * 
 * Usage:
 * ```tsx
 * const { ask, loading, error, response } = useAIAssistant('mission-control');
 * 
 * const handleQuestion = async () => {
 *   const answer = await ask('What is the current mission status?');
 *   console.log(answer);
 * };
 * ```
 */

import { useState, useCallback } from "react";
import { runOpenAI, generateSystemPrompt } from "../engine";
import { getModuleContext, addContextHistory } from "../contexts/moduleContext";

export interface AIAssistantOptions {
  userId?: string;
  additionalContext?: Record<string, any>;
  model?: "gpt-4o-mini" | "gpt-4o" | "gpt-3.5-turbo";
  temperature?: number;
}

export interface AIAssistantResult {
  ask: (input: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  response: string | null;
  clearError: () => void;
}

/**
 * Hook for AI Assistant integration in components
 */
export const useAIAssistant = (
  moduleName: string,
  options: AIAssistantOptions = {}
): AIAssistantResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const ask = useCallback(async (input: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get module context
      const context = getModuleContext(moduleName, options.userId);
      
      // Build messages with context
      const systemPrompt = generateSystemPrompt(moduleName, options.additionalContext);
      
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: input }
      ];
      
      // Add conversation history if available
      if (context.history && context.history.length > 0) {
        const recentHistory = context.history.slice(-5);
        recentHistory.forEach((entry) => {
          if (entry.action && entry.result) {
            messages.push({ role: "user" as const, content: entry.action });
          }
        });
      }
      
      // Call AI engine
      const aiResponse = await runOpenAI({
        model: options.model || "gpt-4o-mini",
        messages,
        context,
        temperature: options.temperature ?? 0.7,
        maxTokens: 1000
      });
      
      // Store interaction in context
      addContextHistory(moduleName, options.userId, {
        action: input,
        timestamp: new Date().toISOString(),
        result: aiResponse.content,
        metadata: {
          model: aiResponse.model,
          usage: aiResponse.usage
        }
      });
      
      setResponse(aiResponse.content);
      return aiResponse.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao processar sua pergunta";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [moduleName, options.userId, options.additionalContext, options.model, options.temperature]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ask,
    loading,
    error,
    response,
    clearError
  };
};
