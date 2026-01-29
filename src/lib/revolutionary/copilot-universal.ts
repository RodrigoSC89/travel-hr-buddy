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

const MODULE_KNOWLEDGE: Record<string, {
  capabilities: string[];
  commonQuestions: string[];
  quickActions: Array<{ label: string; action: string; icon: string }>;
}> = {
  'fleet-command-center': {
    capabilities: ['Visualização em tempo real da frota', 'Tracking AIS e posições', 'Status operacional', 'Gerenciamento de viagens'],
    commonQuestions: ['Onde está o navio X?', 'Qual o status da frota?', 'Quantas embarcações operacionais?', 'Mostre viagens em andamento'],
    quickActions: [
      { label: 'Ver Mapa', action: 'navigate:/fleet-map', icon: '🗺️' },
      { label: 'Status Geral', action: 'show:fleet-status', icon: '📊' },
      { label: 'Alertas', action: 'show:fleet-alerts', icon: '⚠️' },
    ],
  },
  'crew': {
    capabilities: ['Gestão de tripulantes', 'Escalas e rotações', 'Certificações e documentos', 'Treinamentos'],
    commonQuestions: ['Quantos tripulantes a bordo?', 'Certificados vencendo?', 'Escala do navio X?', 'Quem precisa treinamento?'],
    quickActions: [
      { label: 'Adicionar Tripulante', action: 'dialog:add-crew', icon: '➕' },
      { label: 'Certificados', action: 'navigate:/certificates', icon: '📜' },
      { label: 'Escalas', action: 'navigate:/rotations', icon: '📅' },
    ],
  },
  'maintenance': {
    capabilities: ['Ordens de manutenção', 'Manutenção preventiva', 'Estoque de peças', 'Histórico de equipamentos'],
    commonQuestions: ['Manutenções pendentes?', 'Histórico do motor?', 'Peças em estoque crítico?', 'Próximo dry dock?'],
    quickActions: [
      { label: 'Nova Ordem', action: 'dialog:create-order', icon: '🔧' },
      { label: 'Pendentes', action: 'filter:pending', icon: '⏳' },
      { label: 'Preventiva', action: 'navigate:/preventive', icon: '📋' },
    ],
  },
  'compliance': {
    capabilities: ['Auditorias e inspeções', 'Certificações de embarcação', 'Checklists', 'Não-conformidades'],
    commonQuestions: ['Status de compliance?', 'Auditorias pendentes?', 'NCs abertas?', 'Certificado X vence quando?'],
    quickActions: [
      { label: 'Nova Auditoria', action: 'dialog:create-audit', icon: '✅' },
      { label: 'Certificados', action: 'navigate:/vessel-certificates', icon: '📜' },
      { label: 'PEOTRAM', action: 'navigate:/peotram', icon: '📋' },
    ],
  },
  'weather': {
    capabilities: ['Previsões meteorológicas', 'Condições marítimas', 'Alertas de clima', 'Weather routing'],
    commonQuestions: ['Clima na rota X?', 'Alertas de tempestade?', 'Melhor rota?', 'Previsão 7 dias?'],
    quickActions: [
      { label: 'Mapa de Clima', action: 'navigate:/weather-map', icon: '🌤️' },
      { label: 'Alertas', action: 'show:weather-alerts', icon: '⚠️' },
      { label: 'Planejar Rota', action: 'dialog:route-planner', icon: '🧭' },
    ],
  },
  'finance': {
    capabilities: ['Custos operacionais', 'Folha de pagamento', 'Faturamento', 'Relatórios financeiros'],
    commonQuestions: ['Custo operacional do mês?', 'Resumo da folha?', 'Faturas pendentes?', 'Comparativo por embarcação?'],
    quickActions: [
      { label: 'Dashboard', action: 'navigate:/finance-dashboard', icon: '💰' },
      { label: 'Folha', action: 'navigate:/payroll', icon: '💳' },
      { label: 'Relatórios', action: 'navigate:/finance-reports', icon: '📊' },
    ],
  },
};

const CONTEXT_PROMPTS: Record<string, string> = {
  default: `Você é o Copilot do Nauti One, um assistente inteligente especializado em operações marítimas.`,
  'fleet-command-center': `Você está na Central de Comando da Frota. Ajude com tracking, status operacional e viagens.`,
  'crew': `Você está no módulo de Tripulação. Ajude com gestão de tripulantes, escalas e certificações.`,
  'maintenance': `Você está no módulo de Manutenção. Ajude com ordens de serviço e manutenção preventiva.`,
  'compliance': `Você está no módulo de Compliance. Ajude com auditorias e certificações.`,
  'weather': `Você está no módulo de Clima. Ajude com previsões e weather routing.`,
  'finance': `Você está no módulo Financeiro. Ajude com custos e relatórios.`,
};

class CopilotUniversal {
  private context: CopilotContext | null = null;
  private conversationHistory: CopilotMessage[] = [];

  setContext(context: CopilotContext): void {
    this.context = context;
    logger.debug('Copilot context updated', { module: context.module });
  }

  getSuggestions(): CopilotSuggestion[] {
    if (!this.context) return [];

    const suggestions: CopilotSuggestion[] = [];
    const moduleKnowledge = MODULE_KNOWLEDGE[this.context.module];

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

    if (this.context.entityType === 'vessel') {
      suggestions.push({
        id: 'insight-vessel-status',
        type: 'insight',
        title: 'Análise da Embarcação',
        description: 'Gerar relatório completo',
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

  getQuickQuestions(): string[] {
    if (!this.context) return [];
    const moduleKnowledge = MODULE_KNOWLEDGE[this.context.module];
    return moduleKnowledge?.commonQuestions || ['Como posso ajudar?'];
  }

  async chat(message: string): Promise<CopilotResponse> {
    const userMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      context: this.context || undefined,
    };
    this.conversationHistory.push(userMessage);

    try {
      const localResponse = this.handleLocalPatterns(message);
      if (localResponse) {
        return localResponse;
      }

      const response = await this.callAIBackend(message);
      
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

  private handleLocalPatterns(message: string): CopilotResponse | null {
    const lowerMessage = message.toLowerCase();

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

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('o que você pode fazer')) {
      const moduleKnowledge = this.context ? MODULE_KNOWLEDGE[this.context.module] : null;
      const capabilities = moduleKnowledge?.capabilities || ['Responder perguntas', 'Ajudar com navegação'];

      return {
        message: `Posso ajudar com:\n\n${capabilities.map(c => `• ${c}`).join('\n')}`,
        suggestions: this.getSuggestions(),
        followUpQuestions: moduleKnowledge?.commonQuestions.slice(0, 3),
      };
    }

    if (lowerMessage.includes('status') && this.context?.entityType === 'vessel') {
      return {
        message: 'Buscando status da embarcação...',
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

  private extractNavigationDestination(message: string): { label: string; route: string } | null {
    const destinations: Record<string, { label: string; route: string }> = {
      'frota': { label: 'Central de Comando', route: '/fleet-command-center' },
      'tripulação': { label: 'Tripulação', route: '/crew' },
      'manutenção': { label: 'Manutenção', route: '/maintenance' },
      'compliance': { label: 'Compliance', route: '/compliance' },
      'clima': { label: 'Clima', route: '/weather' },
      'financeiro': { label: 'Financeiro', route: '/finance-dashboard' },
      'dashboard': { label: 'Dashboard', route: '/central-comando' },
      'ia': { label: 'Central de IA', route: '/ai-command-center' },
    };

    for (const [keyword, destination] of Object.entries(destinations)) {
      if (message.includes(keyword)) {
        return destination;
      }
    }

    return null;
  }

  private async callAIBackend(message: string): Promise<CopilotResponse> {
    const systemPrompt = this.context 
      ? CONTEXT_PROMPTS[this.context.module] || CONTEXT_PROMPTS.default
      : CONTEXT_PROMPTS.default;

    try {
      const { data, error } = await supabase.functions.invoke('copilot-chat', {
        body: {
          message,
          systemPrompt,
          conversationHistory: this.conversationHistory.slice(-10),
          context: this.context,
        },
      });

      if (error) throw error;

      return {
        message: data?.response || 'Como posso ajudar?',
        suggestions: this.generateSmartSuggestions(data?.response || '', message),
        followUpQuestions: data?.followUpQuestions || [],
        relatedData: data?.relatedData,
      };
    } catch {
      return {
        message: this.generateFallbackResponse(message),
        suggestions: this.getSuggestions(),
        followUpQuestions: this.getQuickQuestions().slice(0, 3),
      };
    }
  }

  private generateSmartSuggestions(response: string, userMessage: string): CopilotSuggestion[] {
    const suggestions: CopilotSuggestion[] = [];

    if (response.toLowerCase().includes('embarcação') || response.toLowerCase().includes('navio')) {
      suggestions.push({
        id: 'vessel-details',
        type: 'action',
        title: 'Ver Detalhes da Embarcação',
        description: 'Abrir página de detalhes',
        priority: 'medium',
        action: { type: 'navigate', payload: { route: '/fleet-command-center' }, label: 'Ver' },
      });
    }

    if (response.toLowerCase().includes('manutenção')) {
      suggestions.push({
        id: 'maintenance-orders',
        type: 'action',
        title: 'Ver Ordens de Manutenção',
        description: 'Lista de manutenções pendentes',
        priority: 'medium',
        action: { type: 'navigate', payload: { route: '/maintenance' }, label: 'Ver' },
      });
    }

    return suggestions.length > 0 ? suggestions : this.getSuggestions().slice(0, 3);
  }

  private generateFallbackResponse(message: string): string {
    const moduleKnowledge = this.context ? MODULE_KNOWLEDGE[this.context.module] : null;
    
    if (moduleKnowledge) {
      return `Estou aqui para ajudar com ${moduleKnowledge.capabilities[0].toLowerCase()}.\n\nPerguntas sugeridas:\n${moduleKnowledge.commonQuestions.slice(0, 3).map(q => `• "${q}"`).join('\n')}`;
    }

    return `Entendi sua solicitação. Posso ajudar com navegação, operações marítimas ou ações específicas.`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): CopilotMessage[] {
    return this.conversationHistory;
  }

  getModuleCapabilities(): string[] {
    if (!this.context) return [];
    return MODULE_KNOWLEDGE[this.context.module]?.capabilities || [];
  }

  async provideFeedback(messageId: string, wasHelpful: boolean): Promise<void> {
    logger.debug('Feedback received', { messageId, wasHelpful });
  }
}

export const copilotUniversal = new CopilotUniversal();
