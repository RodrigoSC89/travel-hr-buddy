/**
 * Natural Language Understanding Engine v3
 * Advanced NLU with Claude AI for maritime operations
 */

import { supabase } from '@/integrations/supabase/client';

export interface ParsedCommand {
  intent: string;
  parameters: Record<string, unknown>;
  confidence: number;
  rawText: string;
  language: string;
}

export interface NLUResult {
  success: boolean;
  message: string;
  action?: string;
  data?: unknown;
  navigateTo?: string;
  requiresConfirmation?: boolean;
}

export interface NLUContext {
  lastIntent?: string;
  lastEntity?: string;
  lastVessel?: string;
  userRole?: string;
  currentPage?: string;
  sessionDuration?: number;
  language: string;
}

// Intent definitions for maritime operations
const INTENT_DEFINITIONS = {
  create_issue: {
    keywords: ['criar', 'adicionar', 'registrar', 'create', 'add', 'log', 'novo', 'nova', 'new'],
    entities: ['non-conformidade', 'non-conformity', 'issue', 'problema', 'defeito', 'observação']
  },
  query_crew: {
    keywords: ['quais', 'quantos', 'listar', 'mostrar', 'who', 'which', 'list', 'show', 'buscar'],
    entities: ['tripulação', 'crew', 'marinheiro', 'sailor', 'oficial', 'officer', 'burnout', 'risco']
  },
  capture_evidence: {
    keywords: ['tirar', 'capturar', 'foto', 'fotografar', 'take', 'capture', 'photo', 'evidence'],
    entities: ['foto', 'photo', 'imagem', 'image', 'evidência', 'evidence', 'documento']
  },
  generate_report: {
    keywords: ['gerar', 'criar', 'enviar', 'generate', 'create', 'send', 'relatório', 'report'],
    entities: ['compliance', 'daily', 'weekly', 'monthly', 'audit', 'vessel', 'crew']
  },
  send_alert: {
    keywords: ['alertar', 'notificar', 'avisar', 'alert', 'notify', 'warn', 'enviar'],
    entities: ['crítico', 'critical', 'urgente', 'urgent', 'emergência', 'emergency']
  },
  check_status: {
    keywords: ['status', 'como', 'qual', 'verificar', 'check', 'how', 'what'],
    entities: ['navio', 'vessel', 'combustível', 'fuel', 'equipamento', 'equipment', 'bunker']
  },
  schedule_task: {
    keywords: ['agendar', 'programar', 'schedule', 'plan', 'marcar'],
    entities: ['manutenção', 'maintenance', 'inspeção', 'inspection', 'treinamento', 'training']
  },
  navigate: {
    keywords: ['ir', 'abrir', 'navegar', 'go', 'open', 'navigate', 'mostrar'],
    entities: ['dashboard', 'frota', 'fleet', 'tripulação', 'crew', 'compliance', 'bunker']
  }
} as const;

// Severity mappings
const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ['crítico', 'crítica', 'critical', 'urgente', 'urgent', 'emergência', 'emergency'],
  high: ['alto', 'alta', 'high', 'importante', 'important', 'grave'],
  medium: ['médio', 'média', 'medium', 'moderado', 'moderate'],
  low: ['baixo', 'baixa', 'low', 'menor', 'minor']
};

// Time expressions
const TIME_EXPRESSIONS: Record<string, () => Date> = {
  'hoje': () => new Date(),
  'today': () => new Date(),
  'amanhã': () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; },
  'tomorrow': () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; },
  'ontem': () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; },
  'yesterday': () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; },
  'esta semana': () => new Date(),
  'this week': () => new Date()
};

export class NLUEngine {
  private context: NLUContext;
  private commandHistory: ParsedCommand[] = [];
  
  constructor(language: string = 'pt') {
    this.context = { language };
  }

  updateContext(updates: Partial<NLUContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Process voice/text command using NLU
   */
  async processCommand(transcript: string): Promise<NLUResult> {
    const normalizedText = transcript.toLowerCase().trim();
    
    // Try local pattern matching first (faster)
    const localResult = this.localPatternMatch(normalizedText);
    if (localResult.confidence > 0.7) {
      return this.executeCommand(localResult);
    }
    
    // Fall back to Claude AI for complex understanding
    try {
      const aiResult = await this.processWithClaude(transcript);
      return this.executeCommand(aiResult);
    } catch (error) {
      console.error('NLU processing failed:', error);
      // Fall back to local matching even with lower confidence
      return this.executeCommand(localResult);
    }
  }

  /**
   * Local pattern matching for fast response
   */
  private localPatternMatch(text: string): ParsedCommand {
    let bestMatch = {
      intent: 'unknown',
      parameters: {} as Record<string, unknown>,
      confidence: 0,
      rawText: text,
      language: this.context.language
    };

    // Check each intent definition
    for (const [intent, definition] of Object.entries(INTENT_DEFINITIONS)) {
      let score = 0;
      const params: Record<string, unknown> = {};

      // Check keywords
      for (const keyword of definition.keywords) {
        if (text.includes(keyword)) {
          score += 0.3;
        }
      }

      // Check entities
      for (const entity of definition.entities) {
        if (text.includes(entity)) {
          score += 0.3;
          params.entity = entity;
        }
      }

      // Extract severity
      for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            params.severity = severity;
            score += 0.1;
            break;
          }
        }
      }

      // Extract time
      for (const [timeExpr, getDate] of Object.entries(TIME_EXPRESSIONS)) {
        if (text.includes(timeExpr)) {
          params.date = getDate().toISOString();
          score += 0.1;
          break;
        }
      }

      // Extract numbers
      const numberMatch = text.match(/\d+/);
      if (numberMatch) {
        params.number = parseInt(numberMatch[0]);
      }

      if (score > bestMatch.confidence) {
        bestMatch = {
          intent,
          parameters: params,
          confidence: Math.min(score, 1),
          rawText: text,
          language: this.context.language
        };
      }
    }

    return bestMatch;
  }

  /**
   * Process with Claude AI for complex NLU
   */
  private async processWithClaude(transcript: string): Promise<ParsedCommand> {
    const contextString = this.buildContextString();
    
    const { data, error } = await supabase.functions.invoke('lovable-ai-gateway', {
      body: {
        model: 'claude-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an NLU engine for Nautilus One, a maritime HR platform.
Extract structured commands from user input in ${this.context.language === 'pt' ? 'Portuguese' : 'English'}.

Current context:
${contextString}

Return ONLY valid JSON with this structure:
{
  "intent": "create_issue|query_crew|capture_evidence|generate_report|send_alert|check_status|schedule_task|navigate|unknown",
  "parameters": {
    "entity": "string (e.g., 'engine', 'crew member')",
    "severity": "critical|high|medium|low",
    "date": "ISO date string",
    "target": "navigation target or query subject",
    "vessel": "vessel name or id",
    "action": "specific action to take"
  },
  "confidence": 0.0-1.0
}`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      }
    });

    if (error) {
      throw error;
    }

    const responseText = data?.choices?.[0]?.message?.content || data?.content?.[0]?.text;
    
    try {
      const parsed = JSON.parse(responseText);
      return {
        intent: parsed.intent || 'unknown',
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0.5,
        rawText: transcript,
        language: this.context.language
      };
    } catch {
      return this.localPatternMatch(transcript.toLowerCase());
    }
  }

  /**
   * Execute the parsed command
   */
  private async executeCommand(command: ParsedCommand): Promise<NLUResult> {
    // Update context with last command
    this.context.lastIntent = command.intent;
    this.context.lastEntity = command.parameters.entity as string;
    this.commandHistory.push(command);

    const { intent, parameters } = command;

    switch (intent) {
      case 'create_issue':
        return this.handleCreateIssue(parameters);

      case 'query_crew':
        return this.handleQueryCrew(parameters);

      case 'capture_evidence':
        return this.handleCaptureEvidence(parameters);

      case 'generate_report':
        return this.handleGenerateReport(parameters);

      case 'send_alert':
        return this.handleSendAlert(parameters);

      case 'check_status':
        return this.handleCheckStatus(parameters);

      case 'schedule_task':
        return this.handleScheduleTask(parameters);

      case 'navigate':
        return this.handleNavigate(parameters);

      default:
        return {
          success: false,
          message: this.context.language === 'pt'
            ? 'Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.'
            : 'Command not recognized. Say "help" to see available commands.',
          action: 'unknown'
        };
    }
  }

  private handleCreateIssue(params: Record<string, unknown>): NLUResult {
    const message = this.context.language === 'pt'
      ? `Criando ${params.severity || ''} ${params.entity || 'observação'}...`
      : `Creating ${params.severity || ''} ${params.entity || 'issue'}...`;

    return {
      success: true,
      message,
      action: 'create_issue',
      data: params,
      navigateTo: '/preovid/nova-inspecao',
      requiresConfirmation: params.severity === 'critical'
    };
  }

  private handleQueryCrew(params: Record<string, unknown>): NLUResult {
    const message = this.context.language === 'pt'
      ? `Buscando tripulação${params.entity ? ` com ${params.entity}` : ''}...`
      : `Searching crew${params.entity ? ` with ${params.entity}` : ''}...`;

    return {
      success: true,
      message,
      action: 'query_crew',
      data: params,
      navigateTo: '/tripulacao'
    };
  }

  private handleCaptureEvidence(params: Record<string, unknown>): NLUResult {
    return {
      success: true,
      message: this.context.language === 'pt' 
        ? 'Abrindo câmera para captura de evidência...'
        : 'Opening camera for evidence capture...',
      action: 'capture_evidence',
      data: { ...params, openCamera: true }
    };
  }

  private handleGenerateReport(params: Record<string, unknown>): NLUResult {
    const reportType = params.entity as string || 'compliance';
    
    return {
      success: true,
      message: this.context.language === 'pt'
        ? `Gerando relatório de ${reportType}...`
        : `Generating ${reportType} report...`,
      action: 'generate_report',
      data: { type: reportType, ...params },
      navigateTo: '/relatorios'
    };
  }

  private handleSendAlert(params: Record<string, unknown>): NLUResult {
    return {
      success: true,
      message: this.context.language === 'pt'
        ? 'Enviando alerta...'
        : 'Sending alert...',
      action: 'send_alert',
      data: params,
      requiresConfirmation: true
    };
  }

  private handleCheckStatus(params: Record<string, unknown>): NLUResult {
    const entity = params.entity as string;
    const routes: Record<string, string> = {
      'navio': '/frota',
      'vessel': '/frota',
      'combustível': '/bunker',
      'fuel': '/bunker',
      'bunker': '/bunker',
      'tripulação': '/tripulacao',
      'crew': '/tripulacao',
      'equipamento': '/manutencao',
      'equipment': '/manutencao'
    };

    return {
      success: true,
      message: this.context.language === 'pt'
        ? `Verificando status ${entity ? `de ${entity}` : ''}...`
        : `Checking ${entity || ''} status...`,
      action: 'check_status',
      data: params,
      navigateTo: entity ? routes[entity] || '/dashboard' : '/dashboard'
    };
  }

  private handleScheduleTask(params: Record<string, unknown>): NLUResult {
    const taskType = params.entity as string;
    const routes: Record<string, string> = {
      'manutenção': '/manutencao',
      'maintenance': '/manutencao',
      'inspeção': '/preovid',
      'inspection': '/preovid',
      'treinamento': '/treinamento',
      'training': '/treinamento'
    };

    return {
      success: true,
      message: this.context.language === 'pt'
        ? `Agendando ${taskType || 'tarefa'}...`
        : `Scheduling ${taskType || 'task'}...`,
      action: 'schedule_task',
      data: params,
      navigateTo: taskType ? routes[taskType] || '/central-comando' : '/central-comando'
    };
  }

  private handleNavigate(params: Record<string, unknown>): NLUResult {
    const target = (params.target as string || params.entity as string || '').toLowerCase();
    
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'painel': '/dashboard',
      'frota': '/frota',
      'fleet': '/frota',
      'tripulação': '/tripulacao',
      'crew': '/tripulacao',
      'compliance': '/compliance-center',
      'bunker': '/bunker',
      'combustível': '/bunker',
      'manutenção': '/manutencao',
      'maintenance': '/manutencao',
      'relatórios': '/relatorios',
      'reports': '/relatorios',
      'ia': '/ai-hub',
      'ai': '/ai-hub'
    };

    const navigateTo = routes[target] || '/dashboard';

    return {
      success: true,
      message: this.context.language === 'pt'
        ? `Navegando para ${target || 'dashboard'}...`
        : `Navigating to ${target || 'dashboard'}...`,
      action: 'navigate',
      navigateTo
    };
  }

  private buildContextString(): string {
    return `
Last intent: ${this.context.lastIntent || 'none'}
Last entity: ${this.context.lastEntity || 'none'}
Active vessel: ${this.context.lastVessel || 'none'}
Current page: ${this.context.currentPage || 'unknown'}
User role: ${this.context.userRole || 'unknown'}
Language: ${this.context.language}
Session commands: ${this.commandHistory.length}
    `.trim();
  }

  /**
   * Request confirmation for destructive actions
   */
  async confirmAction(action: string): Promise<boolean> {
    // This would trigger a voice prompt for confirmation
    // For now, return true (to be integrated with voice UI)
    return true;
  }

  /**
   * Get help message
   */
  getHelpMessage(): string {
    if (this.context.language === 'pt') {
      return `Comandos disponíveis:
• "Criar non-conformidade crítica no motor" - Registrar problemas
• "Quais tripulantes estão em risco de burnout?" - Consultas de tripulação
• "Tirar foto de evidência" - Captura de evidências
• "Gerar relatório de compliance" - Gerar relatórios
• "Status do combustível" - Verificar status
• "Ir para dashboard" - Navegação
• "Agendar manutenção" - Agendar tarefas`;
    }
    
    return `Available commands:
• "Create critical non-conformity on engine" - Log issues
• "Which crew members are at burnout risk?" - Crew queries
• "Take evidence photo" - Evidence capture
• "Generate compliance report" - Generate reports
• "Check fuel status" - Status checks
• "Go to dashboard" - Navigation
• "Schedule maintenance" - Schedule tasks`;
  }
}

// Singleton instance
let nluInstance: NLUEngine | null = null;

export function getNLUEngine(language: string = 'pt'): NLUEngine {
  if (!nluInstance) {
    nluInstance = new NLUEngine(language);
  }
  return nluInstance;
}

export default NLUEngine;
