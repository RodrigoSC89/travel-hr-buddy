/**
 * Smart AI Assistant - PATCH 900
 * Contextual AI assistant with maritime domain knowledge
 * Now integrated with Hybrid LLM Engine for offline-first AI
 */

import { useState, useCallback, useEffect } from 'react';
import { hybridLLMEngine } from '@/lib/llm/hybrid-engine';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    data?: Record<string, unknown>;
    suggestions?: string[];
  };
}

interface AssistantContext {
  currentPage: string;
  userRole: string;
  recentActions: string[];
  activeModule: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

// Maritime domain knowledge prompts
const DOMAIN_PROMPTS: Record<string, string> = {
  travel: `Você é um assistente especializado em gestão de viagens marítimas. 
Ajude com solicitações de viagem, reservas, documentação e logística de embarque/desembarque.`,
  
  hr: `Você é um assistente de RH especializado no setor marítimo.
Ajude com gestão de tripulantes, documentação STCW, certificações, escalas e férias.`,
  
  fleet: `Você é um assistente de gestão de frota.
Ajude com status de embarcações, manutenções, posicionamento e operações.`,
  
  documents: `Você é um assistente de gestão documental.
Ajude com organização, busca e validação de documentos marítimos.`,
  
  default: `Você é o assistente inteligente do Nautilus One, sistema de gestão marítima.
Ajude os usuários a navegar pelo sistema e realizar suas tarefas de forma eficiente.`,
};

// Quick actions by context
const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  travel: [
    { id: 'new-travel', label: 'Nova viagem', prompt: 'Como criar uma nova solicitação de viagem?' },
    { id: 'pending', label: 'Pendentes', prompt: 'Quais solicitações estão pendentes de aprovação?' },
    { id: 'reports', label: 'Relatórios', prompt: 'Como gerar relatório de viagens do mês?' },
  ],
  hr: [
    { id: 'expiring-docs', label: 'Docs expirando', prompt: 'Quais documentos de tripulantes expiram em breve?' },
    { id: 'add-crew', label: 'Novo tripulante', prompt: 'Como cadastrar um novo tripulante?' },
    { id: 'certifications', label: 'Certificações', prompt: 'Como verificar certificações STCW?' },
  ],
  fleet: [
    { id: 'vessel-status', label: 'Status', prompt: 'Qual o status atual da frota?' },
    { id: 'maintenance', label: 'Manutenções', prompt: 'Quais manutenções estão programadas?' },
    { id: 'positions', label: 'Posições', prompt: 'Onde estão as embarcações agora?' },
  ],
  default: [
    { id: 'help', label: 'Ajuda', prompt: 'O que você pode fazer?' },
    { id: 'shortcuts', label: 'Atalhos', prompt: 'Quais são os atalhos de teclado?' },
    { id: 'navigation', label: 'Navegação', prompt: 'Como navegar pelo sistema?' },
  ],
};

class SmartAssistant {
  private messages: AssistantMessage[] = [];
  private context: AssistantContext = {
    currentPage: '/',
    userRole: 'user',
    recentActions: [],
    activeModule: 'default',
  };
  private listeners = new Set<(messages: AssistantMessage[]) => void>();
  
  /**
   * Update assistant context
   */
  setContext(context: Partial<AssistantContext>): void {
    this.context = { ...this.context, ...context };
  }
  
  /**
   * Get system prompt based on context
   */
  private getSystemPrompt(): string {
    const modulePrompt = DOMAIN_PROMPTS[this.context.activeModule] || DOMAIN_PROMPTS.default;
    
    return `${modulePrompt}

Contexto atual:
- Página: ${this.context.currentPage}
- Módulo: ${this.context.activeModule}
- Papel do usuário: ${this.context.userRole}

Seja conciso, profissional e sempre ofereça próximos passos claros.
Quando possível, sugira ações que o usuário pode realizar no sistema.`;
  }
  
  /**
   * Get quick actions for current context
   */
  getQuickActions(): QuickAction[] {
    return QUICK_ACTIONS[this.context.activeModule] || QUICK_ACTIONS.default;
  }
  
  /**
   * Add user message and get response
   */
  async sendMessage(content: string): Promise<AssistantMessage> {
    // Add user message
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    this.messages.push(userMessage);
    this.notify();
    
    // Generate response (local for now, can be replaced with AI API)
    const response = await this.generateResponse(content);
    
    const assistantMessage: AssistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata,
    };
    
    this.messages.push(assistantMessage);
    this.notify();
    
    return assistantMessage;
  }
  
  /**
   * Generate response using Hybrid LLM Engine (cloud + offline fallback)
   */
  private async generateResponse(input: string): Promise<{
    content: string;
    metadata?: AssistantMessage['metadata'];
  }> {
    const lowerInput = input.toLowerCase();
    
    // Navigation intents - handle locally for instant response
    if (lowerInput.includes('ir para') || lowerInput.includes('abrir') || lowerInput.includes('navegar')) {
      const destinations: Record<string, { path: string; name: string }> = {
        'dashboard': { path: '/dashboard', name: 'Dashboard' },
        'viagens': { path: '/travel-command', name: 'Viagens' },
        'viagem': { path: '/travel-command', name: 'Viagens' },
        'rh': { path: '/people-command', name: 'Recursos Humanos' },
        'recursos humanos': { path: '/people-command', name: 'Recursos Humanos' },
        'frota': { path: '/fleet-command', name: 'Frota' },
        'documentos': { path: '/documents', name: 'Documentos' },
        'manutenção': { path: '/maintenance-command', name: 'Manutenção' },
        'mmi': { path: '/maintenance-command', name: 'Manutenção' },
        'compliance': { path: '/compliance-hub', name: 'Compliance Hub' },
        'configurações': { path: '/settings', name: 'Configurações' },
        'tripulação': { path: '/maritime-command', name: 'Tripulação' },
        'crew': { path: '/maritime-command', name: 'Tripulação' },
        'comando': { path: '/nautilus-command', name: 'Centro de Comando' },
      };
      
      for (const [key, dest] of Object.entries(destinations)) {
        if (lowerInput.includes(key)) {
          return {
            content: `Posso te levar para ${dest.name}. Clique no botão abaixo para navegar.`,
            metadata: {
              action: 'navigate',
              data: { path: dest.path, name: dest.name },
              suggestions: [`Ir para ${dest.name}`],
            },
          };
        }
      }
    }

    // Try Hybrid LLM Engine for complex queries
    try {
      const llmResponse = await hybridLLMEngine.query(input, {
        context: `Módulo atual: ${this.context.activeModule}. Página: ${this.context.currentPage}. Papel: ${this.context.userRole}.`
      });

      // Build suggestions based on response source
      const suggestions = llmResponse.source === 'cloud' 
        ? ['Ver mais detalhes', 'Outra pergunta']
        : ['Tentar novamente online', 'Ver ajuda'];

      return {
        content: llmResponse.response,
        metadata: {
          suggestions,
          data: {
            source: llmResponse.source,
            confidence: llmResponse.confidence,
            latency: llmResponse.latency
          }
        },
      };
    } catch (error) {
      console.warn('[SmartAssistant] LLM query failed, using fallback:', error);
    }

    // Fallback responses for common intents
    if (lowerInput.includes('ajuda') || lowerInput.includes('o que você pode')) {
      return {
        content: `Posso ajudar você com:

📍 **Navegação** - "Ir para viagens", "Abrir dashboard"
📋 **Tarefas** - "Criar nova viagem", "Ver pendentes"
🔍 **Busca** - "Buscar tripulante João"
📊 **Relatórios** - "Gerar relatório mensal"
🛠️ **Manutenção** - "Ver ordens de serviço", "Status MMI"
⚓ **Compliance** - "Auditorias pendentes", "Checklists"

Use os botões de ação rápida abaixo ou digite sua pergunta.`,
        metadata: {
          suggestions: ['Ir para MMI', 'Ver pendentes', 'Compliance'],
        },
      };
    }
    
    // Default fallback
    return {
      content: `Entendi sua pergunta sobre "${input}". 

No momento estou processando localmente. Para respostas mais detalhadas:
- Verifique sua conexão de internet
- Tente uma pergunta mais específica
- Use os módulos do sistema diretamente

Como posso ajudar?`,
      metadata: {
        suggestions: ['Ver ajuda', 'Ir para dashboard'],
      },
    };
  }
  
  /**
   * Get all messages
   */
  getMessages(): AssistantMessage[] {
    return [...this.messages];
  }
  
  /**
   * Clear conversation
   */
  clearMessages(): void {
    this.messages = [];
    this.notify();
  }
  
  /**
   * Subscribe to message changes
   */
  subscribe(listener: (messages: AssistantMessage[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notify(): void {
    const messages = this.getMessages();
    this.listeners.forEach(fn => fn(messages));
  }
}

// Singleton instance
export const smartAssistant = new SmartAssistant();

/**
 * React hook for smart assistant
 */
export function useSmartAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>(smartAssistant.getMessages());
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const unsubscribe = smartAssistant.subscribe(setMessages);
    return unsubscribe;
  }, []);
  
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    try {
      await smartAssistant.sendMessage(content);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const setContext = useCallback((context: Partial<AssistantContext>) => {
    smartAssistant.setContext(context);
  }, []);
  
  return {
    messages,
    isLoading,
    sendMessage,
    setContext,
    clearMessages: smartAssistant.clearMessages.bind(smartAssistant),
    quickActions: smartAssistant.getQuickActions(),
  };
}
