/**
 * Hook universal de IA
 * Usa API real quando disponível, fallback para Mock AI
 */

import { useState, useCallback } from 'react';
import { mockAI } from '@/services/mock-ai-service';
import { supabase } from '@/integrations/supabase/client';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIOptions {
  module?: string;
  forceMock?: boolean;
}

export function useAIService(options: UseAIOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    // Adiciona mensagem do usuário
    const userMessage: AIMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let response: string;
      let usedMock = false;

      // Tenta usar Edge Function real primeiro (se não forçar mock)
      if (!options.forceMock) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('nauti-ai', {
            body: { 
              message: content, 
              module: options.module,
              conversationHistory: messages.slice(-10),
            },
          });

          if (!fnError && data?.response) {
            response = data.response;
          } else {
            throw new Error('Edge function unavailable');
          }
        } catch {
          // Fallback para Mock AI
          const mockResponse = await mockAI.chat(content);
          response = mockResponse.response;
          usedMock = true;
        }
      } else {
        // Usa Mock AI diretamente
        const mockResponse = await mockAI.chat(content);
        response = mockResponse.response;
        usedMock = true;
      }

      // Adiciona resposta da IA
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response + (usedMock ? '\n\n_[Modo Local]_' : ''),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar mensagem';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, options.forceMock, options.module]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const getPredictions = useCallback(async (vesselId: string) => {
    setIsLoading(true);
    try {
      // Tenta Edge Function real
      try {
        const { data, error } = await supabase.functions.invoke('ai-predictive-maintenance', {
          body: { vesselId },
        });
        if (!error && data) return data;
      } catch {
        // Fallback
      }
      
      // Mock fallback
      return await mockAI.predictMaintenance(vesselId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeDocument = useCallback(async (documentUrl: string, type?: string) => {
    setIsLoading(true);
    try {
      // Tenta Edge Function real
      try {
        const { data, error } = await supabase.functions.invoke('document-summarization', {
          body: { documentUrl, type },
        });
        if (!error && data) return data;
      } catch {
        // Fallback
      }
      
      // Mock fallback
      return await mockAI.analyzeDocument(documentUrl, type);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (params: {
    vesselId?: string;
    period?: string;
    type?: string;
  }) => {
    setIsLoading(true);
    try {
      // Tenta Edge Function real
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-report', {
          body: params,
        });
        if (!error && data) return data;
      } catch {
        // Fallback
      }
      
      // Mock fallback
      return await mockAI.generateExecutiveReport(params);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    getPredictions,
    analyzeDocument,
    generateReport,
  };
}
