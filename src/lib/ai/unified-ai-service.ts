/**
 * Unified AI Service - Central AI Router
 * Roteia requests para as IAs especializadas corretas
 * PATCH AI-TRAINING v2.0
 */

import { supabase } from '@/integrations/supabase/client';
import { AI_MODULES, type AIModuleKey, getSystemPrompt } from '@/lib/ai-prompts';
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  module: AIModuleKey;
  message: string;
  context?: Record<string, unknown>;
  conversationHistory?: AIMessage[];
  stream?: boolean;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  actions?: AIAction[];
  confidence?: number;
  source?: string;
}

export interface AIAction {
  type: string;
  label: string;
  payload: Record<string, unknown>;
}

/**
 * Unified AI Router - Routes requests to specialized AI modules
 */
export class UnifiedAIService {
  private static instance: UnifiedAIService;

  private constructor() {}

  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService();
    }
    return UnifiedAIService.instance;
  }

  /**
   * Send a message to a specialized AI module
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const module = AI_MODULES[request.module];
    if (!module) {
      return {
        success: false,
        message: `Módulo de IA '${request.module}' não encontrado.`
      };
    }

    try {
      // Get system prompt for the module
      const systemPrompt = await getSystemPrompt(request.module);

      // Build context string
      const contextString = request.context 
        ? `\n\nCONTEXTO ATUAL:\n${JSON.stringify(request.context, null, 2)}`
        : '';

      // Prepare messages for the API
      const messages: AIMessage[] = [
        ...(request.conversationHistory || []),
        { role: 'user', content: request.message + contextString }
      ];

      // Call the specialized edge function
      const { data, error } = await supabase.functions.invoke(module.edgeFunction, {
        body: {
          message: request.message,
          messages,
          context: request.context,
          systemPrompt,
          stream: request.stream
        }
      });

      if (error) {
        logger.error(`[${module.name}] Error:`, error);
        return {
          success: false,
          message: `Erro ao processar sua solicitação: ${error.message}`,
          source: module.name
        };
      }

      return {
        success: true,
        message: data?.response || data?.message || data?.content || 'Resposta processada.',
        data: data?.data,
        actions: data?.actions,
        confidence: data?.confidence,
        source: module.name
      };
    } catch (err) {
      logger.error(`[${module.name}] Exception:`, err);
      return {
        success: false,
        message: 'Erro interno ao processar sua solicitação.',
        source: module.name
      };
    }
  }

  /**
   * Stream a response from AI module
   */
  async *streamChat(request: AIRequest): AsyncGenerator<string> {
    const module = AI_MODULES[request.module];
    if (!module) {
      yield 'Módulo de IA não encontrado.';
      return;
    }

    try {
      const systemPrompt = await getSystemPrompt(request.module);
      
      // Use ai-hub-chat for unified routing
      const response = await fetch(
        getEdgeFunctionUrl('ai-hub-chat'),
        {
          method: 'POST',
          headers: getEdgeFunctionHeaders(),
          body: JSON.stringify({
            module: request.module,
            messages: request.conversationHistory || [],
            context: request.context,
            stream: true
          })
        }
      );

      if (!response.ok || !response.body) {
        yield 'Erro ao iniciar streaming.';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') return;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Partial JSON, continue buffering
          }
        }
      }
    } catch (err) {
      logger.error(`[${module.name}] Stream error:`, err);
      yield 'Erro no streaming.';
    }
  }

  /**
   * Quick action - predefined AI actions
   */
  async quickAction(
    module: AIModuleKey,
    action: string,
    params: Record<string, unknown> = {}
  ): Promise<AIResponse> {
    const actionPrompts: Record<string, string> = {
      // PEOTRAM
      'generate_evidence': `Gerar evidência técnica para o item ${params.itemId || 'selecionado'}`,
      'explain_element': `Explicar detalhadamente o Elemento ${params.elementNumber || ''} do PEOTRAM`,
      
      // Safety
      'analyze_incident': `Analisar o incidente: ${params.description || ''}`,
      'generate_tbt': `Gerar Toolbox Talk sobre: ${params.topic || 'segurança'}`,
      
      // Crew
      'rotation_planning': `Planejar rotação de tripulação para o próximo trimestre`,
      'certification_check': `Verificar certificações vencendo nos próximos 90 dias`,
      
      // Bunker
      'compare_prices': `Comparar preços de bunker nos portos: ${params.ports || 'da rota atual'}`,
      'consumption_analysis': `Analisar consumo de combustível do último mês`,
      
      // Fleet
      'fleet_status': `Fornecer status completo da frota`,
      'performance_ranking': `Ranking de performance das embarcações`,
      
      // Weather
      'route_weather': `Previsão meteorológica para rota ${params.route || 'atual'}`,
      
      // Maintenance
      'overdue_maintenance': `Listar manutenções vencidas e próximas`,
      'predictive_alert': `Analisar equipamentos com risco de falha`,
      
      // Cargo
      'stability_check': `Verificar estabilidade para carga de ${params.cargo || 'pendente'}`,
      
      // Charter
      'demurrage_calc': `Calcular demurrage/despatch do último porto`,
      
      // MLC
      'hours_check': `Verificar compliance de horas de trabalho/descanso`,
      'sea_compliance': `Verificar contratos SEA de toda tripulação`,

      // Generic
      'status': `Fornecer status geral`,
      'help': `O que você pode fazer por mim?`
    };

    const prompt = actionPrompts[action] || `Executar ação: ${action}`;
    
    return this.chat({
      module,
      message: prompt,
      context: params
    });
  }

  /**
   * Get available modules with their capabilities
   */
  getAvailableModules() {
    return Object.entries(AI_MODULES).map(([key, config]) => ({
      key: key as AIModuleKey,
      name: config.name,
      description: config.description,
      icon: config.icon,
      color: config.color,
      capabilities: config.capabilities
    }));
  }

  /**
   * Find best module for a query
   */
  async findBestModule(query: string): Promise<AIModuleKey> {
    const lowerQuery = query.toLowerCase();
    
    // Keyword matching
    const moduleKeywords: Record<AIModuleKey, string[]> = {
      peotram: ['peotram', 'petrobras', 'auditoria', 'elemento', 'evidência'],
      peodp: ['dp', 'posicionamento', 'dinâmico', 'fmea', 'asog', 'redundância'],
      command: ['comando', 'central', 'status', 'geral', 'brain', 'nautilus'],
      voice: ['voz', 'aria', 'falar', 'áudio'],
      bunker: ['combustível', 'bunker', 'fuel', 'consumo', 'abastecimento', 'eexi', 'cii'],
      safety: ['segurança', 'safety', 'incidente', 'near miss', 'tbt', 'risco', 'hseq'],
      compliance: ['compliance', 'certificado', 'psc', 'sire', 'vetting', 'auditoria'],
      fleet: ['frota', 'fleet', 'navio', 'embarcação', 'performance'],
      crew: ['tripulação', 'crew', 'marítimo', 'rotação', 'certificação'],
      weather: ['tempo', 'weather', 'meteorologia', 'mar', 'vento', 'tufão', 'rota'],
      maintenance: ['manutenção', 'pms', 'work order', 'preventiva', 'preditiva', 'peça'],
      cargo: ['carga', 'cargo', 'estabilidade', 'estiva', 'imdg', 'porão'],
      training: ['treinamento', 'training', 'drill', 'stcw', 'competência', 'exercício'],
      voyage: ['viagem', 'voyage', 'eta', 'rota', 'estimativa', 'porto'],
      charter: ['charter', 'afretamento', 'demurrage', 'despatch', 'laytime', 'contrato'],
      mlc: ['mlc', 'trabalho', 'descanso', 'horas', 'sea', 'welfare', 'labour']
    };

    for (const [module, keywords] of Object.entries(moduleKeywords)) {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        return module as AIModuleKey;
      }
    }

    // Default to command center
    return 'command';
  }
}

// Export singleton instance
export const unifiedAI = UnifiedAIService.getInstance();

// Hook for React components
export function useUnifiedAI() {
  return unifiedAI;
}
