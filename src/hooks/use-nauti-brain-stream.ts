/**
 * Hook para Nauti Brain com Streaming SSE
 * Com fallback automático para Mock AI quando API não disponível
 */

import { useState, useCallback, useRef } from 'react';
import { mockAI } from '@/services/mock-ai-service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isMock?: boolean;
}

interface UseNautiBrainStreamOptions {
  onError?: (error: Error) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  forceMock?: boolean;
}

const CHAT_URL = `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/nauti-brain-stream`;

export function useNautiBrainStream(options: UseNautiBrainStreamOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Simula streaming de texto (para modo mock)
   */
  const simulateStreaming = async (text: string): Promise<void> => {
    const words = text.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      accumulated += (i === 0 ? '' : ' ') + words[i];
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: accumulated,
          };
        }
        return newMessages;
      });

      // Delay entre palavras para efeito de streaming
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20));
    }
  };

  /**
   * Fallback para Mock AI
   */
  const useMockAI = async (content: string): Promise<void> => {
    setUsingMock(true);
    
    // Adiciona mensagem inicial do assistente
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isMock: true,
    }]);

    try {
      const response = await mockAI.chat(content);
      await simulateStreaming(response.response + '\n\n_[Modo Local - Configure API para IA real]_');
    } finally {
      // Marca streaming como completo
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            isStreaming: false,
          };
        }
        return newMessages;
      });
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    options.onStreamStart?.();

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Se forçar mock, usa diretamente
    if (options.forceMock) {
      try {
        await useMockAI(content);
      } finally {
        setIsLoading(false);
        options.onStreamEnd?.();
      }
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API unavailable: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setUsingMock(false);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add initial assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isMock: false,
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            
            if (delta) {
              assistantContent += delta;
              
              // Update assistant message
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: assistantContent,
                  };
                }
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            isStreaming: false,
          };
        }
        return newMessages;
      });

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useNautiBrainStream] Request aborted');
      } else {
        console.warn('[useNautiBrainStream] API failed, using mock:', err);
        // Fallback para Mock AI
        await useMockAI(content);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      options.onStreamEnd?.();
    }
  }, [messages, isLoading, options]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setUsingMock(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    usingMock,
    sendMessage,
    cancelStream,
    clearMessages,
  };
}
