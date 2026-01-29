/**
 * 🎤 Voice AI Commander - Revolutionary Voice Control System
 * PATCH REVOLUTION v2.0
 * 
 * Sistema de controle total por voz com NLU avançado
 * "Nauti, qual o status da frota?"
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface VoiceCommand {
  intent: string;
  entities: Record<string, string>;
  confidence: number;
  rawText: string;
  language: string;
}

export interface VoiceResponse {
  text: string;
  audio?: string; // Base64 audio
  action?: {
    type: string;
    payload: Record<string, unknown>;
  };
  suggestions?: string[];
}

export interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  language: string;
  context: Record<string, unknown>;
}

// Intent patterns for NLU
const INTENT_PATTERNS = {
  // Fleet commands
  'fleet.status': [
    /status\s*(da|do|das|dos)?\s*frota/i,
    /fleet\s*status/i,
    /como\s*(está|estão)\s*(a|as)?\s*frota/i,
    /situação\s*(da|do)?\s*frota/i,
  ],
  'vessel.locate': [
    /onde\s*(está|fica)\s*o?\s*navio\s*(.+)/i,
    /localizar?\s*(navio|embarcação)\s*(.+)/i,
    /posição\s*(do|da)?\s*(.+)/i,
    /where\s*is\s*(.+)/i,
  ],
  'crew.status': [
    /status\s*(da|do)?\s*tripulação/i,
    /crew\s*status/i,
    /quantos\s*tripulantes/i,
    /situação\s*(da|do)?\s*crew/i,
  ],
  'maintenance.pending': [
    /manutenções?\s*pendentes?/i,
    /pending\s*maintenance/i,
    /o\s*que\s*precisa\s*(de)?\s*manutenção/i,
  ],
  'weather.forecast': [
    /previsão\s*(do)?\s*tempo/i,
    /weather\s*forecast/i,
    /como\s*(está|vai\s*estar)\s*o\s*tempo/i,
    /condições\s*meteorológicas/i,
  ],
  'alert.summary': [
    /alertas?\s*(ativos?)?/i,
    /active\s*alerts?/i,
    /quais?\s*(são\s*os)?\s*alertas?/i,
  ],
  'compliance.status': [
    /status\s*(de)?\s*compliance/i,
    /conformidade/i,
    /certificados?\s*(vencendo|expirando)/i,
  ],
  'report.generate': [
    /gerar?\s*relatório\s*(.+)/i,
    /generate\s*report\s*(.+)/i,
    /criar?\s*relatório\s*(.+)/i,
  ],
  'navigate.to': [
    /ir\s*para\s*(.+)/i,
    /abrir?\s*(.+)/i,
    /go\s*to\s*(.+)/i,
    /open\s*(.+)/i,
    /navegar?\s*para\s*(.+)/i,
  ],
  'help': [
    /ajuda/i,
    /help/i,
    /o\s*que\s*(você)?\s*pode\s*fazer/i,
    /comandos?\s*disponíveis?/i,
  ],
};

// Route mappings for navigation
const ROUTE_MAPPINGS: Record<string, string> = {
  'frota': '/fleet-command-center',
  'fleet': '/fleet-command-center',
  'tripulação': '/crew',
  'crew': '/crew',
  'manutenção': '/maintenance',
  'maintenance': '/maintenance',
  'clima': '/weather',
  'tempo': '/weather',
  'weather': '/weather',
  'compliance': '/compliance',
  'conformidade': '/compliance',
  'dashboard': '/central-comando',
  'comando': '/central-comando',
  'documentos': '/documents',
  'documents': '/documents',
  'treinamento': '/training',
  'training': '/training',
  'relatórios': '/reports',
  'reports': '/reports',
  'ia': '/ai-command-center',
  'ai': '/ai-command-center',
  'configurações': '/settings',
  'settings': '/settings',
};

class VoiceAICommander {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private session: VoiceSession | null = null;
  private onCommandCallback: ((response: VoiceResponse) => void) | null = null;
  private onListeningChangeCallback: ((isListening: boolean) => void) | null = null;
  private isListening = false;
  private wakeWord = 'nauti';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognitionAPI = (window as unknown as { 
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      logger.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'pt-BR';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript.toLowerCase().trim();
        this.processCommand(transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      logger.error('Speech recognition error', new Error(event.error));
      this.isListening = false;
      this.onListeningChangeCallback?.(false);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we should still be listening
        this.recognition?.start();
      }
    };
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech Recognition not available');
    }

    this.session = {
      sessionId: crypto.randomUUID(),
      isActive: true,
      language: 'pt-BR',
      context: {},
    };

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recognition.start();
      this.isListening = true;
      this.onListeningChangeCallback?.(true);
      
      // Announce that we're listening
      this.speak('Olá! Estou ouvindo. Diga "Nauti" seguido do seu comando.');
    } catch (error) {
      logger.error('Microphone access denied', error as Error);
      throw error;
    }
  }

  stopListening(): void {
    this.recognition?.stop();
    this.isListening = false;
    this.session = null;
    this.onListeningChangeCallback?.(false);
  }

  private async processCommand(transcript: string): Promise<void> {
    // Check for wake word
    if (!transcript.includes(this.wakeWord)) {
      return; // Ignore commands without wake word
    }

    // Remove wake word from transcript
    const commandText = transcript.replace(new RegExp(`${this.wakeWord}[,.]?\\s*`, 'gi'), '').trim();
    
    if (!commandText) {
      this.speak('Sim? Como posso ajudar?');
      return;
    }

    // Parse intent
    const command = this.parseIntent(commandText);
    
    if (!command) {
      this.speak('Desculpe, não entendi. Pode repetir?');
      return;
    }

    // Execute command
    const response = await this.executeCommand(command);
    
    // Respond
    this.speak(response.text);
    this.onCommandCallback?.(response);
  }

  private parseIntent(text: string): VoiceCommand | null {
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          return {
            intent,
            entities: this.extractEntities(match),
            confidence: 0.85,
            rawText: text,
            language: 'pt-BR',
          };
        }
      }
    }
    return null;
  }

  private extractEntities(match: RegExpMatchArray): Record<string, string> {
    const entities: Record<string, string> = {};
    match.slice(1).forEach((group, index) => {
      if (group) {
        entities[`entity_${index}`] = group.trim();
      }
    });
    return entities;
  }

  private async executeCommand(command: VoiceCommand): Promise<VoiceResponse> {
    switch (command.intent) {
      case 'fleet.status':
        return this.getFleetStatus();
      
      case 'vessel.locate':
        return this.locateVessel(command.entities.entity_1 || command.entities.entity_0 || '');
      
      case 'crew.status':
        return this.getCrewStatus();
      
      case 'maintenance.pending':
        return this.getPendingMaintenance();
      
      case 'weather.forecast':
        return this.getWeatherForecast();
      
      case 'alert.summary':
        return this.getAlertSummary();
      
      case 'compliance.status':
        return this.getComplianceStatus();
      
      case 'report.generate':
        return this.generateReport(command.entities.entity_0 || 'geral');
      
      case 'navigate.to':
        return this.navigateTo(command.entities.entity_0 || '');
      
      case 'help':
        return this.getHelp();
      
      default:
        return {
          text: 'Comando não reconhecido. Diga "Nauti ajuda" para ver os comandos disponíveis.',
          suggestions: ['status da frota', 'tripulação', 'alertas', 'ajuda'],
        };
    }
  }

  private async getFleetStatus(): Promise<VoiceResponse> {
    try {
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name, status')
        .limit(100);

      const total = vessels?.length || 0;
      const operational = vessels?.filter(v => v.status === 'operational').length || 0;
      const inMaintenance = vessels?.filter(v => v.status === 'maintenance').length || 0;

      return {
        text: `A frota possui ${total} embarcações. ${operational} estão operacionais e ${inMaintenance} em manutenção.`,
        action: {
          type: 'navigate',
          payload: { route: '/fleet-command-center' },
        },
        suggestions: ['localizar navio', 'manutenções pendentes', 'clima'],
      };
    } catch (error) {
      return { text: 'Não foi possível obter o status da frota.' };
    }
  }

  private async locateVessel(vesselName: string): Promise<VoiceResponse> {
    try {
      const { data: vessel } = await supabase
        .from('vessels')
        .select('name, current_latitude, current_longitude')
        .ilike('name', `%${vesselName}%`)
        .limit(1)
        .maybeSingle();

      if (vessel) {
        return {
          text: `O navio ${vessel.name} está localizado nas coordenadas ${vessel.current_latitude?.toFixed(2) || 'N/A'}, ${vessel.current_longitude?.toFixed(2) || 'N/A'}.`,
          action: {
            type: 'showOnMap',
            payload: { 
              vesselName: vessel.name,
              lat: vessel.current_latitude, 
              lng: vessel.current_longitude 
            },
          },
        };
      }

      return { text: `Não encontrei nenhum navio chamado ${vesselName}.` };
    } catch (error) {
      return { text: 'Não foi possível localizar o navio.' };
    }
  }

  private async getCrewStatus(): Promise<VoiceResponse> {
    try {
      const { data: crew } = await supabase
        .from('crew_members')
        .select('id, status')
        .limit(500);

      const total = crew?.length || 0;
      const onboard = crew?.filter(c => c.status === 'onboard').length || 0;
      const onLeave = crew?.filter(c => c.status === 'on_leave').length || 0;

      return {
        text: `A tripulação possui ${total} membros. ${onboard} estão a bordo e ${onLeave} em licença.`,
        action: {
          type: 'navigate',
          payload: { route: '/crew' },
        },
        suggestions: ['certificados vencendo', 'escalas', 'treinamentos'],
      };
    } catch (error) {
      return { text: 'Não foi possível obter o status da tripulação.' };
    }
  }

  private async getPendingMaintenance(): Promise<VoiceResponse> {
    try {
      const { count } = await supabase
        .from('maintenance_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'scheduled']);

      return {
        text: `Existem ${count || 0} manutenções pendentes ou agendadas.`,
        action: {
          type: 'navigate',
          payload: { route: '/maintenance' },
        },
      };
    } catch (error) {
      return { text: 'Não foi possível verificar as manutenções.' };
    }
  }

  private async getWeatherForecast(): Promise<VoiceResponse> {
    return {
      text: 'Abrindo o painel de clima e meteorologia.',
      action: {
        type: 'navigate',
        payload: { route: '/weather' },
      },
    };
  }

  private async getAlertSummary(): Promise<VoiceResponse> {
    try {
      const { data: alerts } = await supabase
        .from('soc_alerts')
        .select('severity')
        .eq('status', 'active')
        .limit(100);

      const total = alerts?.length || 0;
      const critical = alerts?.filter(a => a.severity === 'critical').length || 0;
      const high = alerts?.filter(a => a.severity === 'high').length || 0;

      if (total === 0) {
        return { text: 'Não há alertas ativos no momento. Tudo sob controle!' };
      }

      return {
        text: `Existem ${total} alertas ativos. ${critical} críticos e ${high} de alta prioridade.`,
        action: {
          type: 'navigate',
          payload: { route: '/soc-monitoring' },
        },
      };
    } catch (error) {
      return { text: 'Não foi possível verificar os alertas.' };
    }
  }

  private async getComplianceStatus(): Promise<VoiceResponse> {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { count } = await supabase
        .from('maritime_certificates')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', thirtyDaysFromNow.toISOString());

      return {
        text: `${count || 0} certificados vencem nos próximos 30 dias.`,
        action: {
          type: 'navigate',
          payload: { route: '/compliance' },
        },
      };
    } catch (error) {
      return { text: 'Não foi possível verificar o status de compliance.' };
    }
  }

  private async generateReport(type: string): Promise<VoiceResponse> {
    return {
      text: `Iniciando geração do relatório ${type}. Você será notificado quando estiver pronto.`,
      action: {
        type: 'generateReport',
        payload: { reportType: type },
      },
    };
  }

  private navigateTo(destination: string): VoiceResponse {
    const route = ROUTE_MAPPINGS[destination.toLowerCase()];
    
    if (route) {
      return {
        text: `Abrindo ${destination}.`,
        action: {
          type: 'navigate',
          payload: { route },
        },
      };
    }

    return {
      text: `Não encontrei "${destination}". Tente: frota, tripulação, manutenção, clima, compliance.`,
      suggestions: Object.keys(ROUTE_MAPPINGS).slice(0, 5),
    };
  }

  private getHelp(): VoiceResponse {
    return {
      text: 'Você pode me pedir: status da frota, localizar navio, status da tripulação, manutenções pendentes, previsão do tempo, alertas ativos, status de compliance, gerar relatório, ou navegar para qualquer módulo.',
      suggestions: [
        'status da frota',
        'tripulação',
        'alertas',
        'clima',
        'compliance',
      ],
    };
  }

  speak(text: string): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    utterance.pitch = 1;

    // Try to find a Brazilian Portuguese voice
    const voices = this.synthesis.getVoices();
    const ptBrVoice = voices.find(v => v.lang === 'pt-BR') || 
                      voices.find(v => v.lang.startsWith('pt'));
    if (ptBrVoice) {
      utterance.voice = ptBrVoice;
    }

    this.synthesis.speak(utterance);
  }

  onCommand(callback: (response: VoiceResponse) => void): void {
    this.onCommandCallback = callback;
  }

  onListeningChange(callback: (isListening: boolean) => void): void {
    this.onListeningChangeCallback = callback;
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    if (this.session) {
      this.session.language = lang;
    }
  }

  setWakeWord(word: string): void {
    this.wakeWord = word.toLowerCase();
  }

  get isActive(): boolean {
    return this.isListening;
  }
}

export const voiceAICommander = new VoiceAICommander();
