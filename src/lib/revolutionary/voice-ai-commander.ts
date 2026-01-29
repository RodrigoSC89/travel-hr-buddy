/**
 * 🎤 Voice AI Commander - Natural Language Control
 * PATCH REVOLUTION v2.0
 * 
 * Controle total por voz com comandos naturais
 * Versão simplificada com Web Speech API
 */

import { logger } from "@/lib/logger";

export interface VoiceCommand {
  transcript: string;
  intent: string;
  entities: Record<string, string>;
  confidence: number;
  timestamp: Date;
}

export interface VoiceResponse {
  text: string;
  action?: {
    type: string;
    payload: Record<string, unknown>;
  };
  suggestions?: string[];
}

export interface VoiceSession {
  id: string;
  startedAt: Date;
  commandCount: number;
  isActive: boolean;
}

// Command patterns and their intents
const COMMAND_PATTERNS: Array<{
  patterns: string[];
  intent: string;
  action: { type: string; payload: Record<string, unknown> };
  response: string;
}> = [
  {
    patterns: ['status da frota', 'como está a frota', 'mostrar frota'],
    intent: 'fleet_status',
    action: { type: 'navigate', payload: { route: '/fleet-command' } },
    response: 'Abrindo status da frota. Você tem 12 embarcações operacionais.',
  },
  {
    patterns: ['mostrar tripulação', 'status da tripulação', 'ver tripulantes'],
    intent: 'crew_status',
    action: { type: 'navigate', payload: { route: '/crew' } },
    response: 'Exibindo informações da tripulação.',
  },
  {
    patterns: ['manutenções pendentes', 'mostrar manutenção', 'ordens de serviço'],
    intent: 'maintenance_status',
    action: { type: 'navigate', payload: { route: '/maintenance-command' } },
    response: 'Você tem 8 manutenções pendentes, 2 com prioridade alta.',
  },
  {
    patterns: ['alertas', 'mostrar alertas', 'alertas críticos'],
    intent: 'show_alerts',
    action: { type: 'navigate', payload: { route: '/soc' } },
    response: 'Você tem 3 alertas ativos. Nenhum crítico no momento.',
  },
  {
    patterns: ['clima', 'previsão do tempo', 'condições meteorológicas'],
    intent: 'weather',
    action: { type: 'navigate', payload: { route: '/weather-command' } },
    response: 'Abrindo condições meteorológicas.',
  },
  {
    patterns: ['ir para', 'navegar para', 'abrir'],
    intent: 'navigation',
    action: { type: 'navigate', payload: {} },
    response: 'Navegando para o módulo solicitado.',
  },
  {
    patterns: ['ajuda', 'o que você pode fazer', 'comandos'],
    intent: 'help',
    action: { type: 'show_help', payload: {} },
    response: 'Posso ajudar com status da frota, tripulação, manutenção, alertas, clima e navegação. Diga "Nauti" seguido do comando.',
  },
];

class VoiceAICommander {
  private recognition: any = null;
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
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      logger.warn('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'pt-BR';

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript.toLowerCase().trim();
        this.processCommand(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      logger.error('Speech recognition error', new Error(event.error));
      this.isListening = false;
      this.onListeningChangeCallback?.(false);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition?.start();
      }
    };
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech Recognition not available');
    }

    this.isListening = true;
    this.session = {
      id: `session-${Date.now()}`,
      startedAt: new Date(),
      commandCount: 0,
      isActive: true,
    };

    this.recognition.start();
    this.onListeningChangeCallback?.(true);
    logger.info('Voice commander started');
  }

  stopListening(): void {
    this.isListening = false;
    this.recognition?.stop();
    this.onListeningChangeCallback?.(false);
    
    if (this.session) {
      this.session.isActive = false;
    }
    logger.info('Voice commander stopped');
  }

  private async processCommand(transcript: string): Promise<void> {
    // Check for wake word
    const hasWakeWord = transcript.includes(this.wakeWord);
    const commandText = hasWakeWord 
      ? transcript.replace(this.wakeWord, '').trim()
      : transcript;

    if (!commandText) return;

    // Find matching command pattern
    const matchedPattern = COMMAND_PATTERNS.find(pattern =>
      pattern.patterns.some(p => commandText.includes(p))
    );

    const command: VoiceCommand = {
      transcript: commandText,
      intent: matchedPattern?.intent || 'unknown',
      entities: {},
      confidence: matchedPattern ? 0.85 : 0.5,
      timestamp: new Date(),
    };

    let response: VoiceResponse;

    if (matchedPattern) {
      response = {
        text: matchedPattern.response,
        action: matchedPattern.action,
        suggestions: ['status da frota', 'alertas', 'tripulação'],
      };

      if (this.session) {
        this.session.commandCount++;
      }
    } else {
      response = {
        text: `Não entendi o comando "${commandText}". Tente dizer "Nauti, ajuda" para ver os comandos disponíveis.`,
        suggestions: ['ajuda', 'status da frota', 'alertas'],
      };
    }

    // Speak response
    this.speak(response.text);

    // Notify callback
    this.onCommandCallback?.(response);

    logger.info('Voice command processed', { command, response });
  }

  speak(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.synthesis.speak(utterance);
  }

  onCommand(callback: (response: VoiceResponse) => void): void {
    this.onCommandCallback = callback;
  }

  onListeningChange(callback: (isListening: boolean) => void): void {
    this.onListeningChangeCallback = callback;
  }

  getSession(): VoiceSession | null {
    return this.session;
  }

  isAvailable(): boolean {
    return this.recognition !== null;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Get available commands for help
  getAvailableCommands(): Array<{ command: string; description: string }> {
    return [
      { command: 'status da frota', description: 'Ver status das embarcações' },
      { command: 'mostrar tripulação', description: 'Ver informações da tripulação' },
      { command: 'manutenções pendentes', description: 'Listar manutenções' },
      { command: 'alertas', description: 'Ver alertas do sistema' },
      { command: 'clima', description: 'Condições meteorológicas' },
      { command: 'ajuda', description: 'Lista de comandos' },
    ];
  }
}

export const voiceAICommander = new VoiceAICommander();
