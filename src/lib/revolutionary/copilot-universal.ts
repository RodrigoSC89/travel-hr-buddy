/**
 * 🤖 Copilot Universal - Context-Aware AI Assistant
 * PATCH REVOLUTION v2.0
 * 
 * Assistente IA contextual em CADA tela do sistema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CopilotContext {
  module: string;
  route: string;
  entityType?: string;
  entityId?: string;
  entityData?: Record<string, unknown>;
  userRole: string;
  permissions: string[];
  recentActions: string[];
}

export interface CopilotSuggestion {
  id: string;
  type: 'action' | 'insight' | 'warning' | 'tip';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    type: string;
    payload: Record<string, unknown>;
    label: string;
  };
  dismissed?: boolean;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: CopilotContext;
  suggestions?: CopilotSuggestion[];
}

export interface CopilotResponse {
  message: string;
  suggestions: CopilotSuggestion[];
  relatedData?: Record<string, unknown>;
  followUpQuestions?: string[];
}

// Module-specific knowledge base
const MODULE_KNOWLEDGE: Record<string, {
  capabilities: string[];
  commonQuestions: string[];
  quickActions: Array<{ label: string; action: string; icon: string }>;
}> = {
  'fleet-command-center': {
    capabilities: [
      'Visualização em tempo real da frota',
      'Tracking AIS e posições',
      'Status operacional de embarcações',
      'Gerenciamento de viagens',
    ],
    commonQuestions: [
      'Onde está o navio X?',
      'Qual o status da frota?',
      'Quantas embarcações estão operacionais?',
      'Mostre as viagens em andamento',
    ],
    quickActions: [
      { label: 'Ver Mapa', action: 'navigate:/fleet-map', icon: '🗺️' },
      { label: 'Status Geral', action: 'show:fleet-status', icon: '📊' },
      { label: 'Alertas', action: 'show:fleet-alerts', icon: '⚠️' },
    ],
  },
  'crew': {
    capabilities: [
      'Gestão de tripulantes',
      'Escalas e rotações',
      'Certificações e documentos',
      'Treinamentos',
    ],
    commonQuestions: [
      'Quantos tripulantes estão a bordo?',
      'Quais certificados vencem este mês?',
      'Mostre a escala do navio X',
      'Quem precisa de treinamento?',
    ],
    quickActions: [
      { label: 'Adicionar Tripulante', action: 'dialog:add-crew', icon: '➕' },
      { label: 'Certificados', action: 'navigate:/certificates', icon: '📜' },
      { label: 'Escalas', action: 'navigate:/rotations', icon: '📅' },
    ],
  },
  'maintenance': {
    capabilities: [
      'Ordens de manutenção',
      'Manutenção preventiva',
      'Estoque de peças',
      'Histórico de equipamentos',
    ],
    commonQuestions: [
      'Quais manutenções estão pendentes?',
      'Mostre o histórico do motor principal',
      'Quantas peças em estoque crítico?',
      'Qual o próximo dry dock?',
    ],
    quickActions: [
      { label: 'Nova Ordem', action: 'dialog:create-order', icon: '🔧' },
      { label: 'Pendentes', action: 'filter:pending', icon: '⏳' },
      { label: 'Preventiva', action: 'navigate:/preventive', icon: '📋' },
    ],
  },
  'compliance': {
    capabilities: [
      'Auditorias e inspeções',
      'Certificações de embarcação',
      'Checklists de conformidade',
      'Não-conformidades',
    ],
    commonQuestions: [
      'Qual o status de compliance da frota?',
      'Quantas auditorias pendentes?',
      'Mostre não-conformidades abertas',
      'Quando vence o certificado X?',
    ],
    quickActions: [
      { label: 'Nova Auditoria', action: 'dialog:create-audit', icon: '✅' },
      { label: 'Certificados', action: 'navigate:/vessel-certificates', icon: '📜' },
      { label: 'PEOTRAM', action: 'navigate:/peotram', icon: '📋' },
    ],
  },
  'weather': {
    capabilities: [
      'Previsões meteorológicas',
      'Condições marítimas',
      'Alertas de clima',
      'Weather routing',
    ],
    commonQuestions: [
      'Como está o clima na rota X?',
      'Existem alertas de tempestade?',
      'Qual a melhor rota considerando o clima?',
      'Previsão para os próximos 7 dias',
    ],
    quickActions: [
      { label: 'Mapa de Clima', action: 'navigate:/weather-map', icon: '🌤️' },
      { label: 'Alertas', action: 'show:weather-alerts', icon: '⚠️' },
      { label: 'Planejar Rota', action: 'dialog:route-planner', icon: '🧭' },
    ],
  },
  'finance': {
    capabilities: [
      'Custos operacionais',
      'Folha de pagamento',
      'Faturamento',
      'Relatórios financeiros',
    ],
    commonQuestions: [
      'Qual o custo operacional do mês?',
      'Mostre o resumo da folha de pagamento',
      'Quais faturas estão pendentes?',
      'Comparativo de custos por embarcação',
    ],
    quickActions: [
      { label: 'Dashboard', action: 'navigate:/finance-dashboard', icon: '💰' },
      { label: 'Folha', action: 'navigate:/payroll', icon: '💳' },
      { label: 'Relatórios', action: 'navigate:/finance-reports', icon: '📊' },
    ],
  },
};

// Context-specific prompts
const CONTEXT_PROMPTS: Record<string, string> = {
  default: `Você é o Copilot do Nauti One, um assistente inteligente especializado em operações marítimas.
Ajude o usuário de forma objetiva e profissional. Você tem acesso ao contexto da tela atual.`,
  
  'fleet-command-center': `Você está na Central de Comando da Frota. Ajude com tracking de embarcações, 
status operacional, viagens e qualquer questão relacionada à gestão da frota.`,
  
  'crew': `Você está no módulo de Tripulação. Ajude com gestão de tripulantes, escalas, 
certificações, treinamentos e questões de RH marítimo.`,
  
  'maintenance': `Você está no módulo de Manutenção. Ajude com ordens de serviço, manutenção preventiva,
gestão de equipamentos e planejamento de dry docks.`,
  
  'compliance': `Você está no módulo de Compliance. Ajude com auditorias, certificações,
não-conformidades, PEOTRAM e questões regulatórias (MLC, STCW, ISM).`,
  
  'weather': `Você está no módulo de Clima. Ajude com previsões meteorológicas, 
condições marítimas, weather routing e alertas de segurança.`,
  
  'finance': `Você está no módulo Financeiro. Ajude com custos operacionais, folha de pagamento,
faturamento e relatórios financeiros.`,
};

class CopilotUniversal {
  private context: CopilotContext | null = null;
  private conversationHistory: CopilotMessage[] = [];

  // Set current context
  setContext(context: CopilotContext): void {
    this.context = context;
    logger.debug('Copilot context updated', { module: context.module });
  }

  // Get context-aware suggestions
  getSuggestions(): CopilotSuggestion[] {
    if (!this.context) return [];

    const suggestions: CopilotSuggestion[] = [];
    const moduleKnowledge = MODULE_KNOWLEDGE[this.context.module];

    // Quick action suggestions
    moduleKnowledge?.quickActions.forEach((action, index) => {
      suggestions.push({
        id: `quick-${index}`,
        type: 'action',
        title: action.label,
        description: `${action.icon} Ação rápida`,
        priority: 'medium',
        action: {
          type: action.action.split(':')[0],
          payload: { target: action.action.split(':')[1] },
          label: action.label,
        },
      });
    });

    // Context-specific insights
    if (this.context.entityType === 'vessel') {
      suggestions.push({
        id: 'insight-vessel-status',
        type: 'insight',
        title: 'Análise da Embarcação',
        description: 'Gerar relatório completo de status e recomendações',
        priority: 'low',
        action: {
          type: 'analyze',
          payload: { entityId: this.context.entityId },
          label: 'Analisar',
        },
      });
    }

    return suggestions.slice(0, 5);
  }

  // Get contextual quick questions
  getQuickQuestions(): string[] {
    if (!this.context) return [];

    const moduleKnowledge = MODULE_KNOWLEDGE[this.context.module];
    return moduleKnowledge?.commonQuestions || [
      'Como posso ajudar?',
      'O que você gostaria de fazer?',
    ];
  }

  // Process user message
  async chat(message: string): Promise<CopilotResponse> {
    // Add user message to history
    const userMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context: this.context || undefined,
    };
    this.conversationHistory.push(userMessage);

    try {
      // Try to handle locally first for common patterns
      const localResponse = this.handleLocalPatterns(message);
      if (localResponse) {
        return localResponse;
      }

      // Call AI backend
      const response = await this.callAIBackend(message);
      
      // Add assistant message to history
      const assistantMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      this.conversationHistory.push(assistantMessage);

      return response;
    } catch (error) {
      logger.error('Copilot chat error', error as Error);
      
      return {
        message: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        suggestions: this.getSuggestions(),
        followUpQuestions: ['Posso ajudar com algo mais?'],
      };
    }
  }

  // Handle common patterns locally
  private handleLocalPatterns(message: string): CopilotResponse | null {
    const lowerMessage = message.toLowerCase();

    // Navigation requests
    if (lowerMessage.includes('ir para') || lowerMessage.includes('abrir') || lowerMessage.includes('navegar')) {
      const destination = this.extractNavigationDestination(lowerMessage);
      if (destination) {
        return {
          message: `Abrindo ${destination.label}...`,
          suggestions: [{
            id: 'nav-action',
            type: 'action',
            title: `Ir para ${destination.label}`,
            description: '',
            priority: 'high',
            action: {
              type: 'navigate',
              payload: { route: destination.route },
              label: 'Navegar',
            },
          }],
        };
      }
    }

    // Help requests
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('o que você pode fazer')) {
      const moduleKnowledge = this.context ? MODULE_KNOWLEDGE[this.context.module] : null;
      
      const capabilities = moduleKnowledge?.capabilities || [
        'Responder perguntas sobre o sistema',
        'Ajudar com navegação',
        'Fornecer insights e recomendações',
      ];

      return {
        message: `Posso ajudar você com:\n\n${capabilities.map(c => `• ${c}`).join('\n')}\n\nO que você gostaria de fazer?`,
        suggestions: this.getSuggestions(),
        followUpQuestions: moduleKnowledge?.commonQuestions.slice(0, 3),
      };
    }

    // Status requests
    if (lowerMessage.includes('status') && this.context?.entityType === 'vessel') {
      return {
        message: 'Vou buscar o status da embarcação...',
        suggestions: [{
          id: 'status-action',
          type: 'action',
          title: 'Ver Status Completo',
          description: 'Exibir todos os detalhes',
          priority: 'high',
          action: {
            type: 'show',
            payload: { panel: 'vessel-status', entityId: this.context.entityId },
            label: 'Ver Detalhes',
          },
        }],
      };
    }

    return null;
  }

  // Extract navigation destination
  private extractNavigationDestination(message: string): { label: string; route: string } | null {
    const destinations: Record<string, { label: string; route: string }> = {
      'frota': { label: 'Central de Comando', route: '/fleet-command-center' },
      'tripulação': { label: 'Tripulação', route: '/crew' },
      'manutenção': { label: 'Manutenção', route: '/maintenance' },
      'compliance': { label: 'Compliance', route: '/compliance' },
      'clima': { label: 'Clima', route: '/weather' },
      'tempo': { label: 'Clima', route: '/weather' },
      'financeiro': { label: 'Financeiro', route: '/finance-dashboard' },
      'dashboard': { label: 'Dashboard', route: '/central-comando' },
      'configurações': { label: 'Configurações', route: '/settings' },
      'ia': { label: 'Central de IA', route: '/ai-command-center' },
    };

    for (const [keyword, destination] of Object.entries(destinations)) {
      if (message.includes(keyword)) {
        return destination;
      }
    }

    return null;
  }

  // Call AI backend
  private async callAIBackend(message: string): Promise<CopilotResponse> {
    const systemPrompt = this.context 
      ? CONTEXT_PROMPTS[this.context.module] || CONTEXT_PROMPTS.default
      : CONTEXT_PROMPTS.default;

    const contextInfo = this.context 
      ? `\n\nContexto atual:
- Módulo: ${this.context.module}
- Rota: ${this.context.route}
${this.context.entityType ? `- Tipo de entidade: ${this.context.entityType}` : ''}
${this.context.entityId ? `- ID da entidade: ${this.context.entityId}` : ''}`
      : '';

    try {
      const { data, error } = await supabase.functions.invoke('copilot-chat', {
        body: {
          message,
          systemPrompt: systemPrompt + contextInfo,
          conversationHistory: this.conversationHistory.slice(-10), // Last 10 messages
          context: this.context,
        },
      });

      if (error) throw error;

      return {
        message: data.response || 'Desculpe, não entendi. Pode reformular?',
        suggestions: this.generateSmartSuggestions(data.response, message),
        followUpQuestions: data.followUpQuestions || [],
        relatedData: data.relatedData,
      };
    } catch (error) {
      // Fallback response
      return {
        message: this.generateFallbackResponse(message),
        suggestions: this.getSuggestions(),
        followUpQuestions: this.getQuickQuestions().slice(0, 3),
      };
    }
  }

  // Generate smart suggestions based on response
  private generateSmartSuggestions(response: string, userMessage: string): CopilotSuggestion[] {
    const suggestions: CopilotSuggestion[] = [];

    // Add context-aware suggestions
    if (response.toLowerCase().includes('embarcação') || response.toLowerCase().includes('navio')) {
      suggestions.push({
        id: 'vessel-details',
        type: 'action',
        title: 'Ver Detalhes da Embarcação',
        description: 'Abrir página de detalhes',
        priority: 'medium',
        action: {
          type: 'navigate',
          payload: { route: '/fleet-command-center' },
          label: 'Ver',
        },
      });
    }

    if (response.toLowerCase().includes('manutenção')) {
      suggestions.push({
        id: 'maintenance-orders',
        type: 'action',
        title: 'Ver Ordens de Manutenção',
        description: 'Lista de manutenções pendentes',
        priority: 'medium',
        action: {
          type: 'navigate',
          payload: { route: '/maintenance' },
          label: 'Ver',
        },
      });
    }

    // Add default suggestions if none generated
    if (suggestions.length === 0) {
      return this.getSuggestions().slice(0, 3);
    }

    return suggestions;
  }

  // Generate fallback response
  private generateFallbackResponse(message: string): string {
    const moduleKnowledge = this.context ? MODULE_KNOWLEDGE[this.context.module] : null;
    
    if (moduleKnowledge) {
      return `Estou aqui para ajudar com ${moduleKnowledge.capabilities[0].toLowerCase()}. 
      
Algumas coisas que você pode perguntar:
${moduleKnowledge.commonQuestions.slice(0, 3).map(q => `• "${q}"`).join('\n')}`;
    }

    return `Entendi sua solicitação: "${message}". 

Posso ajudar você a navegar pelo sistema, responder perguntas sobre operações marítimas, 
ou realizar ações específicas. Como posso ajudar?`;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): CopilotMessage[] {
    return this.conversationHistory;
  }

  // Get module capabilities
  getModuleCapabilities(): string[] {
    if (!this.context) return [];
    return MODULE_KNOWLEDGE[this.context.module]?.capabilities || [];
  }

  // Log interaction for analytics
  private async logInteraction(message: string, response: string, wasHelpful?: boolean): Promise<void> {
    logger.debug('Copilot interaction', { message: message.substring(0, 50), wasHelpful });
  }
  }

  // Provide feedback on response
  async provideFeedback(messageId: string, wasHelpful: boolean): Promise<void> {
    const message = this.conversationHistory.find(m => m.id === messageId);
    if (message) {
      await this.logInteraction(
        message.content,
        this.conversationHistory.find(m => m.role === 'assistant' && m.timestamp > message.timestamp)?.content || '',
        wasHelpful
      );
    }
  }
}

export const copilotUniversal = new CopilotUniversal();
