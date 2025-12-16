/**
 * Advanced Voice Commands - PATCH 837
 * Natural language voice control system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { hapticFeedback } from '@/lib/ux/haptic-feedback';

interface VoiceCommand {
  id: string;
  patterns: string[];
  action: (params?: Record<string, string>) => void;
  description: string;
  category: string;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  lastCommand: string | null;
  error: string | null;
  confidence: number;
}

type SpeechRecognitionType = typeof window.SpeechRecognition;

class AdvancedVoiceEngine {
  private recognition: InstanceType<SpeechRecognitionType> | null = null;
  private commands: VoiceCommand[] = [];
  private state: VoiceState = {
    isListening: false,
    isProcessing: false,
    transcript: '',
    lastCommand: null,
    error: null,
    confidence: 0,
  };
  private listeners = new Set<(state: VoiceState) => void>();
  private isSupported = false;
  
  constructor() {
    this.initRecognition();
    this.registerDefaultCommands();
  }
  
  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.isSupported = false;
      return;
    }
    
    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'pt-BR';
    this.recognition.maxAlternatives = 3;
    
    this.recognition.onstart = () => {
      this.updateState({ isListening: true, error: null });
      hapticFeedback.trigger('light');
    };
    
    this.recognition.onend = () => {
      this.updateState({ isListening: false });
    };
    
    this.recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const results = event.results[event.results.length - 1];
      const transcript = results[0].transcript.toLowerCase().trim();
      const confidence = results[0].confidence;
      
      this.updateState({ 
        transcript, 
        confidence,
        isProcessing: results.isFinal,
      });
      
      if (results.isFinal) {
        this.processCommand(transcript);
      }
    };
    
    this.recognition.onerror = (event: { error: string }) => {
      this.updateState({ 
        error: event.error,
        isListening: false,
        isProcessing: false,
      });
      hapticFeedback.trigger('error');
    };
  }
  
  private registerDefaultCommands(): void {
    // Navigation commands
    this.registerCommand({
      id: 'nav-dashboard',
      patterns: ['ir para dashboard', 'abrir dashboard', 'mostrar dashboard', 'início'],
      action: () => window.location.href = '/dashboard',
      description: 'Navegar para o Dashboard',
      category: 'navigation',
    });
    
    this.registerCommand({
      id: 'nav-travel',
      patterns: ['ir para viagens', 'abrir viagens', 'módulo de viagens'],
      action: () => window.location.href = '/travel',
      description: 'Navegar para Viagens',
      category: 'navigation',
    });
    
    this.registerCommand({
      id: 'nav-hr',
      patterns: ['ir para rh', 'recursos humanos', 'abrir rh', 'gestão de pessoas'],
      action: () => window.location.href = '/hr',
      description: 'Navegar para RH',
      category: 'navigation',
    });
    
    this.registerCommand({
      id: 'nav-fleet',
      patterns: ['ir para frota', 'abrir frota', 'embarcações', 'navios'],
      action: () => window.location.href = '/fleet',
      description: 'Navegar para Frota',
      category: 'navigation',
    });
    
    this.registerCommand({
      id: 'nav-documents',
      patterns: ['ir para documentos', 'abrir documentos', 'meus documentos'],
      action: () => window.location.href = '/documents',
      description: 'Navegar para Documentos',
      category: 'navigation',
    });
    
    // Action commands
    this.registerCommand({
      id: 'action-search',
      patterns: ['buscar', 'pesquisar', 'procurar'],
      action: () => {
        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
        document.dispatchEvent(event);
      },
      description: 'Abrir busca',
      category: 'action',
    });
    
    this.registerCommand({
      id: 'action-new',
      patterns: ['criar novo', 'novo registro', 'adicionar'],
      action: () => {
        const newButton = document.querySelector('[data-action="new"]') as HTMLButtonElement;
        newButton?.click();
      },
      description: 'Criar novo item',
      category: 'action',
    });
    
    this.registerCommand({
      id: 'action-refresh',
      patterns: ['atualizar', 'recarregar', 'refresh'],
      action: () => window.location.reload(),
      description: 'Atualizar página',
      category: 'action',
    });
    
    this.registerCommand({
      id: 'action-back',
      patterns: ['voltar', 'página anterior', 'retornar'],
      action: () => window.history.back(),
      description: 'Voltar',
      category: 'action',
    });
    
    // System commands
    this.registerCommand({
      id: 'system-help',
      patterns: ['ajuda', 'comandos', 'o que você pode fazer'],
      action: () => this.speakCommands(),
      description: 'Mostrar ajuda',
      category: 'system',
    });
    
    this.registerCommand({
      id: 'system-notifications',
      patterns: ['notificações', 'alertas', 'avisos'],
      action: () => {
        const notifButton = document.querySelector('[data-onboarding="notifications"]') as HTMLButtonElement;
        notifButton?.click();
      },
      description: 'Abrir notificações',
      category: 'system',
    });
  }
  
  /**
   * Register a new voice command
   */
  registerCommand(command: VoiceCommand): void {
    const existing = this.commands.findIndex(c => c.id === command.id);
    if (existing >= 0) {
      this.commands[existing] = command;
    } else {
      this.commands.push(command);
    }
  }
  
  /**
   * Process voice input and match command
   */
  private processCommand(transcript: string): void {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          this.executeCommand(command);
          return;
        }
      }
    }
    
    // No match found
    this.updateState({ 
      lastCommand: null,
      isProcessing: false,
    });
    this.speak('Desculpe, não entendi o comando.');
  }
  
  private executeCommand(command: VoiceCommand): void {
    this.updateState({ 
      lastCommand: command.id,
      isProcessing: false,
    });
    
    hapticFeedback.trigger('success');
    command.action();
  }
  
  /**
   * Speak text using TTS
   */
  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }
  
  private speakCommands(): void {
    const categories = [...new Set(this.commands.map(c => c.category))];
    const text = categories.map(cat => {
      const cmds = this.commands.filter(c => c.category === cat);
      return `${cat}: ${cmds.map(c => c.patterns[0]).join(', ')}`;
    }).join('. ');
    
    this.speak(`Comandos disponíveis: ${text}`);
  }
  
  /**
   * Start listening
   */
  start(): void {
    if (!this.isSupported || !this.recognition) {
      this.updateState({ error: 'Reconhecimento de voz não suportado' });
      return;
    }
    
    try {
      this.recognition.start();
    } catch {
      // Already listening
    }
  }
  
  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
  
  /**
   * Get all registered commands
   */
  getCommands(): VoiceCommand[] {
    return [...this.commands];
  }
  
  /**
   * Check if voice is supported
   */
  checkSupport(): boolean {
    return this.isSupported;
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: VoiceState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  
  private updateState(partial: Partial<VoiceState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }
}

// Singleton instance
export const voiceEngine = new AdvancedVoiceEngine();

/**
 * React hook for voice commands
 */
export function useVoiceCommands() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    lastCommand: null,
    error: null,
    confidence: 0,
  });
  
  useEffect(() => {
    return voiceEngine.subscribe(setState);
  }, []);
  
  const startListening = useCallback(() => {
    voiceEngine.start();
  }, []);
  
  const stopListening = useCallback(() => {
    voiceEngine.stop();
  }, []);
  
  const registerCommand = useCallback((command: VoiceCommand) => {
    voiceEngine.registerCommand(command);
  }, []);
  
  return {
    ...state,
    isSupported: voiceEngine.checkSupport(),
    commands: voiceEngine.getCommands(),
    startListening,
    stopListening,
    registerCommand,
    speak: voiceEngine.speak.bind(voiceEngine),
  };
}
