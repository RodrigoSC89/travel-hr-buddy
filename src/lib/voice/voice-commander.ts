/**
 * Voice Commander - Voice-First Interface for Nautilus One
 * Natural language voice commands for maritime operations
 */

import { logger } from "@/lib/utils/production-logger";

export interface VoiceIntent {
  action: string;
  params: Record<string, string>;
  confidence: number;
  rawText: string;
}

export interface VoiceCommandResult {
  success: boolean;
  action: string;
  message: string;
  data?: unknown;
  navigateTo?: string;
}

export interface VoiceContext {
  currentPage: string;
  userRole: string;
  vesselId?: string;
  language: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Command patterns with maritime-specific vocabulary
const COMMAND_PATTERNS: Record<string, { pattern: RegExp; action: string }> = {
  // Navigation
  navigate: {
    pattern: /(?:ir para|abrir|mostrar|show me|go to|open)\s+(.+)/i,
    action: 'navigate'
  },
  
  // Status queries
  vesselStatus: {
    pattern: /(?:qual|what is|como está|status)\s+(?:o status|the status|do|of)?\s*(?:navio|vessel|embarcação)?\s*(.+)?/i,
    action: 'vessel_status'
  },
  
  // Weather
  weather: {
    pattern: /(?:previsão|weather|tempo|forecast)\s*(?:para|for)?\s*(.+)?/i,
    action: 'weather'
  },
  
  // Crew
  crewStatus: {
    pattern: /(?:tripulação|crew|equipe)\s*(?:status|disponível|available)?/i,
    action: 'crew_status'
  },
  
  // Reports
  generateReport: {
    pattern: /(?:gerar|generate|criar|create)\s+(?:relatório|report)\s*(?:de|of)?\s*(.+)?/i,
    action: 'generate_report'
  },
  
  // Compliance
  compliance: {
    pattern: /(?:compliance|conformidade|auditoria|audit)\s*(?:de|of)?\s*(.+)?/i,
    action: 'compliance'
  },
  
  // Maintenance
  maintenance: {
    pattern: /(?:manutenção|maintenance|próxima|next)\s*(?:de|of|para|for)?\s*(.+)?/i,
    action: 'maintenance'
  },
  
  // Fuel/Bunker
  fuel: {
    pattern: /(?:combustível|fuel|bunker|rob)\s*(?:atual|current|status)?/i,
    action: 'fuel_status'
  },
  
  // Alerts
  alerts: {
    pattern: /(?:alertas|alerts|notificações|notifications)\s*(?:pendentes|pending)?/i,
    action: 'alerts'
  },
  
  // Help
  help: {
    pattern: /(?:ajuda|help|comandos|commands)/i,
    action: 'help'
  }
};

// Module name mappings
const MODULE_MAPPINGS: Record<string, string> = {
  'dashboard': '/dashboard',
  'painel': '/dashboard',
  'comando': '/central-comando/visao-geral',
  'command': '/central-comando/visao-geral',
  'frota': '/frota',
  'fleet': '/frota',
  'tripulação': '/tripulacao',
  'crew': '/tripulacao',
  'peotram': '/peotram',
  'peodp': '/peodp',
  'manutenção': '/manutencao',
  'maintenance': '/manutencao',
  'documentos': '/documentos',
  'documents': '/documentos',
  'compliance': '/compliance-center',
  'conformidade': '/compliance-center',
  'treinamento': '/treinamento',
  'training': '/treinamento',
  'bunker': '/bunker',
  'combustível': '/bunker',
  'fuel': '/bunker',
  'tempo': '/previsao-tempo',
  'weather': '/previsao-tempo',
  'segurança': '/seguranca',
  'safety': '/seguranca',
  'relatórios': '/relatorios',
  'reports': '/relatorios',
  'ia': '/ai-hub',
  'ai': '/ai-hub',
  'assistente': '/ai-hub',
};

export class VoiceCommander {
  // Web Speech API recognition instance (browser-specific)
  private recognition: { start: () => void; stop: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: SpeechRecognitionEvent) => void) | null; onend: (() => void) | null; onerror: ((e: SpeechRecognitionErrorEvent) => void) | null } | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private context: VoiceContext;
  private onResult: ((result: VoiceCommandResult) => void) | null = null;
  private onListeningChange: ((listening: boolean) => void) | null = null;

  constructor(context: VoiceContext) {
    this.context = context;
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      logger.warn('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.context.language === 'pt' ? 'pt-BR' : 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const confidence = event.results[last][0].confidence;
      
      if (event.results[last].isFinal) {
        this.processCommand(transcript, confidence);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onListeningChange?.(false);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      logger.error('Speech recognition error', { error: event.error });
      this.isListening = false;
      this.onListeningChange?.(false);
    };
  }

  setOnResult(callback: (result: VoiceCommandResult) => void) {
    this.onResult = callback;
  }

  setOnListeningChange(callback: (listening: boolean) => void) {
    this.onListeningChange = callback;
  }

  updateContext(context: Partial<VoiceContext>) {
    this.context = { ...this.context, ...context };
    if (this.recognition) {
      this.recognition.lang = this.context.language === 'pt' ? 'pt-BR' : 'en-US';
    }
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.isListening) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recognition.start();
      this.isListening = true;
      this.onListeningChange?.(true);
    } catch (error) {
      logger.error('Microphone access denied', error);
      throw error;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.onListeningChange?.(false);
    }
  }

  private async processCommand(text: string, confidence: number): Promise<void> {
    const intent = this.extractIntent(text, confidence);
    const result = await this.executeCommand(intent);
    
    this.onResult?.(result);
    
    // Speak response
    if (result.message) {
      this.speak(result.message);
    }
  }

  private extractIntent(text: string, confidence: number): VoiceIntent {
    const normalizedText = text.toLowerCase().trim();
    
    for (const [key, { pattern, action }] of Object.entries(COMMAND_PATTERNS)) {
      const match = normalizedText.match(pattern);
      if (match) {
        return {
          action,
          params: { target: match[1]?.trim() || '' },
          confidence,
          rawText: text
        };
      }
    }

    // Default to AI query
    return {
      action: 'ai_query',
      params: { query: text },
      confidence,
      rawText: text
    };
  }

  private async executeCommand(intent: VoiceIntent): Promise<VoiceCommandResult> {
    switch (intent.action) {
      case 'navigate':
        return this.handleNavigation(intent.params.target);
        
      case 'vessel_status':
        return this.handleVesselStatus(intent.params.target);
        
      case 'weather':
        return this.handleWeather(intent.params.target);
        
      case 'crew_status':
        return this.handleCrewStatus();
        
      case 'generate_report':
        return this.handleGenerateReport(intent.params.target);
        
      case 'compliance':
        return this.handleCompliance(intent.params.target);
        
      case 'maintenance':
        return this.handleMaintenance(intent.params.target);
        
      case 'fuel_status':
        return this.handleFuelStatus();
        
      case 'alerts':
        return this.handleAlerts();
        
      case 'help':
        return this.handleHelp();
        
      case 'ai_query':
        return this.handleAIQuery(intent.params.query);
        
      default:
        return {
          success: false,
          action: intent.action,
          message: this.context.language === 'pt' 
            ? 'Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.'
            : 'Command not recognized. Say "help" to see available commands.'
        };
    }
  }

  private handleNavigation(target: string): VoiceCommandResult {
    const normalizedTarget = target.toLowerCase();
    
    for (const [key, path] of Object.entries(MODULE_MAPPINGS)) {
      if (normalizedTarget.includes(key)) {
        return {
          success: true,
          action: 'navigate',
          message: this.context.language === 'pt' 
            ? `Abrindo ${key}`
            : `Opening ${key}`,
          navigateTo: path
        };
      }
    }

    return {
      success: false,
      action: 'navigate',
      message: this.context.language === 'pt'
        ? `Não encontrei o módulo "${target}". Tente novamente.`
        : `Module "${target}" not found. Please try again.`
    };
  }

  private handleVesselStatus(vesselName?: string): VoiceCommandResult {
    return {
      success: true,
      action: 'vessel_status',
      message: this.context.language === 'pt'
        ? `Buscando status ${vesselName ? `do navio ${vesselName}` : 'da frota'}`
        : `Getting status ${vesselName ? `of vessel ${vesselName}` : 'of fleet'}`,
      navigateTo: '/frota'
    };
  }

  private handleWeather(location?: string): VoiceCommandResult {
    return {
      success: true,
      action: 'weather',
      message: this.context.language === 'pt'
        ? `Abrindo previsão do tempo${location ? ` para ${location}` : ''}`
        : `Opening weather forecast${location ? ` for ${location}` : ''}`,
      navigateTo: '/previsao-tempo'
    };
  }

  private handleCrewStatus(): VoiceCommandResult {
    return {
      success: true,
      action: 'crew_status',
      message: this.context.language === 'pt'
        ? 'Abrindo status da tripulação'
        : 'Opening crew status',
      navigateTo: '/tripulacao'
    };
  }

  private handleGenerateReport(reportType?: string): VoiceCommandResult {
    return {
      success: true,
      action: 'generate_report',
      message: this.context.language === 'pt'
        ? `Gerando relatório${reportType ? ` de ${reportType}` : ''}`
        : `Generating report${reportType ? ` for ${reportType}` : ''}`,
      navigateTo: '/relatorios'
    };
  }

  private handleCompliance(target?: string): VoiceCommandResult {
    return {
      success: true,
      action: 'compliance',
      message: this.context.language === 'pt'
        ? `Abrindo centro de compliance${target ? ` - ${target}` : ''}`
        : `Opening compliance center${target ? ` - ${target}` : ''}`,
      navigateTo: '/compliance-center'
    };
  }

  private handleMaintenance(equipment?: string): VoiceCommandResult {
    return {
      success: true,
      action: 'maintenance',
      message: this.context.language === 'pt'
        ? `Abrindo manutenção${equipment ? ` de ${equipment}` : ''}`
        : `Opening maintenance${equipment ? ` for ${equipment}` : ''}`,
      navigateTo: '/manutencao'
    };
  }

  private handleFuelStatus(): VoiceCommandResult {
    return {
      success: true,
      action: 'fuel_status',
      message: this.context.language === 'pt'
        ? 'Abrindo status de combustível'
        : 'Opening fuel status',
      navigateTo: '/bunker'
    };
  }

  private handleAlerts(): VoiceCommandResult {
    return {
      success: true,
      action: 'alerts',
      message: this.context.language === 'pt'
        ? 'Mostrando alertas pendentes'
        : 'Showing pending alerts',
      navigateTo: '/central-comando/alertas'
    };
  }

  private handleHelp(): VoiceCommandResult {
    const helpMessage = this.context.language === 'pt'
      ? 'Comandos disponíveis: ir para módulo, status do navio, previsão do tempo, status da tripulação, gerar relatório, compliance, manutenção, combustível, alertas'
      : 'Available commands: go to module, vessel status, weather forecast, crew status, generate report, compliance, maintenance, fuel, alerts';
    
    return {
      success: true,
      action: 'help',
      message: helpMessage
    };
  }

  private handleAIQuery(query: string): VoiceCommandResult {
    return {
      success: true,
      action: 'ai_query',
      message: this.context.language === 'pt'
        ? 'Processando sua pergunta...'
        : 'Processing your question...',
      data: { query },
      navigateTo: '/ai-hub'
    };
  }

  speak(text: string): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.context.language === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a natural voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith(this.context.language) && v.name.includes('Natural')
    ) || voices.find(v => v.lang.startsWith(this.context.language));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  destroy(): void {
    this.stopListening();
    this.synthesis.cancel();
    this.recognition = null;
  }
}

// Hook for React components
export function useVoiceCommander(context: VoiceContext) {
  return new VoiceCommander(context);
}

// Web Speech API - types are handled via 'any' for cross-browser compatibility
// The native SpeechRecognition API is accessed via window object in initRecognition()
