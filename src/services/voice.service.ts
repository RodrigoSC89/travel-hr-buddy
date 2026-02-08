/**
 * PATCH 661: Voice Assistant v2 - Service Layer (TypeScript Fixed)
 * Service for voice commands, sessions, and multi-platform support
 * Fixed: voice_sessions/voice_command_templates/voice_personalities don't exist - use voice_commands + voice_settings + in-memory
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type {
  VoiceSession,
  VoiceCommand,
  VoiceCommandTemplate,
  VoicePersonality,
  VoiceSettings,
  VoiceCommandRequest,
  StartSessionRequest,
  VoiceRecognitionResult,
  CommandExecutionResult,
} from "@/types/voice";

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

// In-memory session store (voice_sessions table doesn't exist)
const sessionStore = new Map<string, VoiceSession>();

export class VoiceService {
  private static recognition: BrowserSpeechRecognition | null = null;
  private static synthesis: SpeechSynthesis | null = null;
  private static currentSessionId: string | null = null;
  private static wakeWordDetector: BrowserSpeechRecognition | null = null;
  private static isWakeWordActive = false;
  private static wakeWordCallback: ((detected: boolean) => void) | null = null;

  static initSpeechAPIs(): void {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || 
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = "pt-BR";
      }
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  static isSpeechRecognitionAvailable(): boolean {
    this.initSpeechAPIs();
    return this.recognition !== null;
  }

  static isSpeechSynthesisAvailable(): boolean {
    this.initSpeechAPIs();
    return this.synthesis !== null;
  }

  static async startSession(request: StartSessionRequest): Promise<VoiceSession> {
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.currentSessionId = sessionId;

    // Store session in memory (voice_sessions table doesn't exist)
    const session: VoiceSession = {
      id: sessionId,
      session_id: sessionId,
      platform: request.platform,
      mode: request.mode || "online",
      language: request.language || "pt-BR",
      voice_engine: this.isSpeechRecognitionAvailable() ? "web_speech_api" : "fallback",
      device_info: request.device_info,
      started_at: new Date().toISOString(),
    } as VoiceSession;

    sessionStore.set(sessionId, session);
    logger.info("[Voice] Session started:", sessionId);
    return session;
  }

  static async endSession(sessionId: string): Promise<void> {
    const session = sessionStore.get(sessionId);
    if (session) {
      sessionStore.delete(sessionId);
    }
    if (this.currentSessionId === sessionId) this.currentSessionId = null;
    logger.info("[Voice] Session ended:", sessionId);
  }

  static async getSession(sessionId: string): Promise<VoiceSession | null> {
    return sessionStore.get(sessionId) || null;
  }

  static getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  static async startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.recognition) throw new Error("Speech recognition not available");

    this.recognition.onresult = (event: any) => {
      const result = event.results[0];
      onResult({
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        is_final: result.isFinal,
      });
    };

    this.recognition.onerror = (event: any) => {
      if (onError) onError(new Error(event.error));
    };

    this.recognition.start();
  }

  static stopListening(): void {
    if (this.recognition) this.recognition.stop();
  }

  static async speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    if (!this.synthesis) throw new Error("Speech synthesis not available");

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));
      this.synthesis!.speak(utterance);
    });
  }

  static stopSpeaking(): void {
    if (this.synthesis) this.synthesis.cancel();
  }

  static async processCommand(request: VoiceCommandRequest): Promise<VoiceCommand> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // voice_commands requires: command_text, intent, user_id
    const { data, error } = await supabase
      .from("voice_commands")
      .insert({
        command_text: request.command_text,
        intent: "general",
        user_id: user?.id || "",
      })
      .select()
      .single();

    if (error) {
      logger.error("[Voice] Error saving command:", error);
      throw error;
    }

    return data as unknown as VoiceCommand;
  }

  static async getCommand(id: string): Promise<VoiceCommand | null> {
    const { data, error } = await supabase
      .from("voice_commands")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as VoiceCommand | null;
  }

  static async getCommandHistory(limit = 50): Promise<VoiceCommand[]> {
    const { data, error } = await supabase
      .from("voice_commands")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as unknown as VoiceCommand[];
  }

  static async getTemplates(): Promise<VoiceCommandTemplate[]> {
    // voice_command_templates doesn't exist - return defaults
    return [
      { id: "1", command_pattern: "status da frota", intent: "fleet_status", description: "Verifica status da frota", response_template: "", requires_online: false, is_enabled: true, popularity_score: 10, language: "pt-BR", created_at: "", updated_at: "" },
      { id: "2", command_pattern: "criar missão", intent: "create_mission", description: "Cria nova missão", response_template: "", requires_online: true, is_enabled: true, popularity_score: 8, language: "pt-BR", created_at: "", updated_at: "" },
      { id: "3", command_pattern: "verificar alertas", intent: "check_alerts", description: "Verifica alertas ativos", response_template: "", requires_online: false, is_enabled: true, popularity_score: 7, language: "pt-BR", created_at: "", updated_at: "" },
    ] as VoiceCommandTemplate[];
  }

  static async getPersonalities(): Promise<VoicePersonality[]> {
    // voice_personalities doesn't exist - return defaults
    return [
      { id: "1", name: "nautilus", display_name: "Nautilus", language: "pt-BR", tone: "professional", is_default: true, is_enabled: true, created_at: "" },
      { id: "2", name: "capitao", display_name: "Capitão", language: "pt-BR", tone: "professional", is_default: false, is_enabled: true, created_at: "" },
    ] as VoicePersonality[];
  }

  static async getSettings(): Promise<VoiceSettings | null> {
    // voice_settings exists in schema
    const { data, error } = await supabase
      .from("voice_settings")
      .select("*")
      .maybeSingle();
    if (error) {
      logger.error("[Voice] Error fetching settings:", error);
      return null;
    }
    return data as unknown as VoiceSettings | null;
  }

  static async saveSettings(settings: Partial<VoiceSettings>): Promise<VoiceSettings> {
    const { data, error } = await supabase
      .from("voice_settings")
      .upsert(settings as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as VoiceSettings;
  }

  static async executeCommand(intent: string, entities?: Record<string, unknown>): Promise<CommandExecutionResult> {
    const responses: Record<string, string> = {
      fleet_status: "A frota está operando normalmente com todos os navios em rota.",
      create_mission: "Iniciando criação de nova missão...",
      check_alerts: "Não há alertas ativos no momento.",
      help: "Posso ajudar com status da frota, criar missões, verificar alertas e muito mais.",
    };

    const responseText = responses[intent] || "Comando não reconhecido.";

    return {
      success: !!responses[intent],
      response_text: responseText,
      executed_action: intent,
      data: entities,
    };
  }

  static startWakeWordDetection(wakeWord: string = "nautilus", onDetected: (detected: boolean) => void): void {
    if (!this.recognition) throw new Error("Speech recognition not available");

    this.isWakeWordActive = true;
    this.wakeWordCallback = onDetected;

    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) throw new Error("Speech recognition not supported");

    this.wakeWordDetector = new SpeechRecognitionAPI();
    this.wakeWordDetector.continuous = true;
    this.wakeWordDetector.interimResults = true;
    this.wakeWordDetector.lang = "pt-BR";

    this.wakeWordDetector.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const results = Array.from({ length: event.results.length }, (_, i) => event.results[i]);
      const transcript = results.map((r) => r[0].transcript).join(" ").toLowerCase();
      if (transcript.includes(wakeWord.toLowerCase())) onDetected(true);
    };

    this.wakeWordDetector.onerror = () => { this.isWakeWordActive = false; };
    this.wakeWordDetector.start();
  }

  static stopWakeWordDetection(): void {
    if (this.wakeWordDetector) {
      this.wakeWordDetector.stop();
      this.wakeWordDetector = null;
      this.isWakeWordActive = false;
      this.wakeWordCallback = null;
    }
  }

  static isWakeWordDetectionActive(): boolean {
    return this.isWakeWordActive;
  }

  static async speakWithNaturalVoice(text: string, options?: { rate?: number; pitch?: number; volume?: number; voiceName?: string }): Promise<void> {
    if (!this.synthesis) throw new Error("Speech synthesis not available");

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = this.synthesis!.getVoices();
      let selectedVoice = options?.voiceName ? voices.find(v => v.name === options.voiceName) : null;

      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith("pt") && (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("premium"))) || voices.find(v => v.lang.startsWith("pt")) || voices[0];
      }

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = "pt-BR";
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));
      this.synthesis!.speak(utterance);
    });
  }

  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    this.initSpeechAPIs();
    return this.synthesis.getVoices();
  }

  static async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synthesis) return [];
    return new Promise((resolve) => {
      const voices = this.synthesis!.getVoices();
      if (voices.length > 0) resolve(voices);
      else this.synthesis!.onvoiceschanged = () => resolve(this.synthesis!.getVoices());
    });
  }
}
