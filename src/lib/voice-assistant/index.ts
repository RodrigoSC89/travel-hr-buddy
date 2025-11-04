/**
 * PATCH 628 - Voice Assistant (Experimental)
 * Voice command interface with Web Speech API and fallback
 */

export type VoiceCommand =
  | 'start_psc_inspection'
  | 'open_ism_panel'
  | 'open_mlc_panel'
  | 'open_ovid_panel'
  | 'open_lsa_panel'
  | 'record_non_conformity'
  | 'show_dashboard'
  | 'open_reports'
  | 'help'
  | 'cancel';

export interface VoiceCommandConfig {
  command: VoiceCommand;
  keywords: string[];
  alternativeKeywords?: string[];
  action: () => void | Promise<void>;
  description: string;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  command?: VoiceCommand;
  timestamp: string;
}

export interface VoiceAssistantConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  autoStart: boolean;
}

/**
 * Voice Recognition Engine
 */
export class VoiceRecognitionEngine {
  private recognition: any; // SpeechRecognition
  private isListening: boolean = false;
  private commandHistory: VoiceRecognitionResult[] = [];
  private config: VoiceAssistantConfig;

  constructor(config?: Partial<VoiceAssistantConfig>) {
    this.config = {
      language: 'pt-BR',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      autoStart: false,
      ...config,
    };

    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech API
   */
  private initializeRecognition(): void {
    if (!this.isBrowserSupported()) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.setupEventHandlers();
  }

  /**
   * Check if browser supports Web Speech API
   */
  static isBrowserSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  isBrowserSupported(): boolean {
    return VoiceRecognitionEngine.isBrowserSupported();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition ended');
    };

    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onresult = (event: any) => {
      this.handleResult(event);
    };
  }

  /**
   * Handle recognition result
   */
  private handleResult(event: any): void {
    const results = event.results;
    const lastResult = results[results.length - 1];
    const transcript = lastResult[0].transcript.trim();
    const confidence = lastResult[0].confidence;

    const result: VoiceRecognitionResult = {
      transcript,
      confidence,
      timestamp: new Date().toISOString(),
    };

    this.commandHistory.push(result);
    console.log('Voice transcript:', transcript, 'Confidence:', confidence);
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.recognition) {
      console.error('Speech recognition not available');
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }

  /**
   * Abort recognition
   */
  abort(): void {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to abort recognition:', error);
    }
  }

  /**
   * Get listening status
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Get command history
   */
  getHistory(): VoiceRecognitionResult[] {
    return [...this.commandHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.commandHistory = [];
  }
}

/**
 * Voice Command Processor
 */
export class VoiceCommandProcessor {
  private commands: Map<VoiceCommand, VoiceCommandConfig> = new Map();
  private onCommandExecuted?: (command: VoiceCommand, transcript: string) => void;

  constructor() {
    this.registerDefaultCommands();
  }

  /**
   * Register default commands
   */
  private registerDefaultCommands(): void {
    this.registerCommand({
      command: 'start_psc_inspection',
      keywords: ['iniciar', 'inspeção', 'psc', 'port state control'],
      alternativeKeywords: ['começar', 'abrir', 'psc'],
      action: () => {
        console.log('Starting PSC inspection...');
        // Navigate to PSC module
        if (typeof window !== 'undefined') {
          window.location.hash = '#/psc-inspection';
        }
      },
      description: 'Iniciar inspeção PSC',
    });

    this.registerCommand({
      command: 'open_ism_panel',
      keywords: ['abrir', 'painel', 'ism', 'safety management'],
      alternativeKeywords: ['mostrar', 'ism', 'gestão', 'segurança'],
      action: () => {
        console.log('Opening ISM panel...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/ism-audit';
        }
      },
      description: 'Abrir painel ISM',
    });

    this.registerCommand({
      command: 'open_mlc_panel',
      keywords: ['abrir', 'painel', 'mlc', 'maritime labour'],
      alternativeKeywords: ['mostrar', 'mlc', 'trabalho', 'marítimo'],
      action: () => {
        console.log('Opening MLC panel...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/mlc-inspection';
        }
      },
      description: 'Abrir painel MLC',
    });

    this.registerCommand({
      command: 'open_ovid_panel',
      keywords: ['abrir', 'painel', 'ovid', 'vessel inspection'],
      alternativeKeywords: ['mostrar', 'ovid', 'embarcação'],
      action: () => {
        console.log('Opening OVID panel...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/ovid';
        }
      },
      description: 'Abrir painel OVID',
    });

    this.registerCommand({
      command: 'open_lsa_panel',
      keywords: ['abrir', 'painel', 'lsa', 'life saving', 'salva-vidas'],
      alternativeKeywords: ['mostrar', 'lsa', 'equipamento', 'salvamento'],
      action: () => {
        console.log('Opening LSA panel...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/lsa-inspection';
        }
      },
      description: 'Abrir painel LSA',
    });

    this.registerCommand({
      command: 'record_non_conformity',
      keywords: ['registrar', 'não conformidade', 'deficiência'],
      alternativeKeywords: ['anotar', 'documentar', 'problema'],
      action: () => {
        console.log('Recording non-conformity...');
        // Open non-conformity recording modal/form
      },
      description: 'Registrar não conformidade',
    });

    this.registerCommand({
      command: 'show_dashboard',
      keywords: ['mostrar', 'dashboard', 'painel', 'principal'],
      alternativeKeywords: ['voltar', 'início', 'home'],
      action: () => {
        console.log('Showing dashboard...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/dashboard';
        }
      },
      description: 'Mostrar dashboard',
    });

    this.registerCommand({
      command: 'open_reports',
      keywords: ['abrir', 'relatórios', 'reports'],
      alternativeKeywords: ['mostrar', 'ver', 'relatórios'],
      action: () => {
        console.log('Opening reports...');
        if (typeof window !== 'undefined') {
          window.location.hash = '#/reports';
        }
      },
      description: 'Abrir relatórios',
    });

    this.registerCommand({
      command: 'help',
      keywords: ['ajuda', 'help', 'comandos'],
      action: () => {
        console.log('Showing help...');
        this.showAvailableCommands();
      },
      description: 'Mostrar ajuda',
    });

    this.registerCommand({
      command: 'cancel',
      keywords: ['cancelar', 'parar', 'cancel', 'stop'],
      action: () => {
        console.log('Canceling...');
      },
      description: 'Cancelar',
    });
  }

  /**
   * Register a voice command
   */
  registerCommand(config: VoiceCommandConfig): void {
    this.commands.set(config.command, config);
  }

  /**
   * Process transcript and execute command
   */
  async processTranscript(transcript: string): Promise<VoiceCommand | null> {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Find matching command
    for (const [command, config] of this.commands.entries()) {
      if (this.matchesCommand(normalizedTranscript, config)) {
        try {
          await config.action();
          
          if (this.onCommandExecuted) {
            this.onCommandExecuted(command, transcript);
          }
          
          return command;
        } catch (error) {
          console.error('Error executing command:', error);
          return null;
        }
      }
    }

    console.log('No matching command found for:', transcript);
    return null;
  }

  /**
   * Check if transcript matches command
   */
  private matchesCommand(transcript: string, config: VoiceCommandConfig): boolean {
    const allKeywords = [
      ...config.keywords,
      ...(config.alternativeKeywords || []),
    ];

    // Calculate match score - higher is better
    const matchScore = allKeywords.filter((keyword) =>
      transcript.includes(keyword.toLowerCase())
    ).length;

    // Must match at least 2 keywords and include the specific module identifier
    const hasMinimumMatch = matchScore >= 2;
    
    // For specific module commands, check for unique identifier
    const uniqueIdentifiers = ['psc', 'ism', 'mlc', 'ovid', 'lsa'];
    const hasUniqueId = uniqueIdentifiers.some(id => 
      config.keywords.includes(id) && transcript.includes(id)
    );

    // If command has a unique identifier, require it
    const requiresUniqueId = uniqueIdentifiers.some(id => config.keywords.includes(id));
    
    return hasMinimumMatch && (!requiresUniqueId || hasUniqueId);
  }

  /**
   * Set command executed callback
   */
  onCommand(callback: (command: VoiceCommand, transcript: string) => void): void {
    this.onCommandExecuted = callback;
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): VoiceCommandConfig[] {
    return Array.from(this.commands.values());
  }

  /**
   * Show available commands
   */
  showAvailableCommands(): void {
    console.log('Available voice commands:');
    this.commands.forEach((config) => {
      console.log(`- ${config.description}: ${config.keywords.join(', ')}`);
    });
  }
}

/**
 * Main Voice Assistant
 */
export class VoiceAssistant {
  private engine: VoiceRecognitionEngine;
  private processor: VoiceCommandProcessor;
  private isEnabled: boolean = false;
  private onStatusChange?: (isListening: boolean) => void;
  private onTranscript?: (transcript: string, confidence: number) => void;
  private onCommandExecuted?: (command: VoiceCommand) => void;

  constructor(config?: Partial<VoiceAssistantConfig>) {
    this.engine = new VoiceRecognitionEngine(config);
    this.processor = new VoiceCommandProcessor();
    this.setupProcessorCallback();
  }

  /**
   * Setup processor callback
   */
  private setupProcessorCallback(): void {
    this.processor.onCommand((command, transcript) => {
      if (this.onCommandExecuted) {
        this.onCommandExecuted(command);
      }
    });
  }

  /**
   * Check if voice assistant is supported
   */
  static isSupported(): boolean {
    return VoiceRecognitionEngine.isBrowserSupported();
  }

  /**
   * Enable voice assistant
   */
  enable(): void {
    this.isEnabled = true;
    console.log('Voice assistant enabled');
  }

  /**
   * Disable voice assistant
   */
  disable(): void {
    this.isEnabled = false;
    this.stop();
    console.log('Voice assistant disabled');
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.isEnabled) {
      console.warn('Voice assistant is not enabled');
      return;
    }

    this.engine.start();
    
    if (this.onStatusChange) {
      this.onStatusChange(true);
    }

    // Monitor for results
    this.monitorResults();
  }

  /**
   * Stop listening
   */
  stop(): void {
    this.engine.stop();
    
    if (this.onStatusChange) {
      this.onStatusChange(false);
    }
  }

  /**
   * Monitor recognition results
   */
  private monitorResults(): void {
    const checkInterval = setInterval(() => {
      if (!this.engine.isActive()) {
        clearInterval(checkInterval);
        return;
      }

      const history = this.engine.getHistory();
      if (history.length > 0) {
        const lastResult = history[history.length - 1];
        
        if (this.onTranscript) {
          this.onTranscript(lastResult.transcript, lastResult.confidence);
        }

        // Process command
        this.processor.processTranscript(lastResult.transcript);
      }
    }, 500);
  }

  /**
   * Process text command (fallback)
   */
  async processText(text: string): Promise<VoiceCommand | null> {
    return await this.processor.processTranscript(text);
  }

  /**
   * Register custom command
   */
  registerCommand(config: VoiceCommandConfig): void {
    this.processor.registerCommand(config);
  }

  /**
   * Set status change callback
   */
  onStatus(callback: (isListening: boolean) => void): void {
    this.onStatusChange = callback;
  }

  /**
   * Set transcript callback
   */
  onTranscriptReceived(callback: (transcript: string, confidence: number) => void): void {
    this.onTranscript = callback;
  }

  /**
   * Set command executed callback
   */
  onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandExecuted = callback;
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): VoiceCommandConfig[] {
    return this.processor.getAvailableCommands();
  }

  /**
   * Get history
   */
  getHistory(): VoiceRecognitionResult[] {
    return this.engine.getHistory();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.engine.clearHistory();
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.engine.isActive();
  }

  /**
   * Check if enabled
   */
  isActive(): boolean {
    return this.isEnabled;
  }
}

export default VoiceAssistant;
