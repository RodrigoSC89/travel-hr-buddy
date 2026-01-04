/**
 * PATCH 661: Voice Assistant v2 - Service Layer (TypeScript Fixed)
 * Service for voice commands, sessions, and multi-platform support
 */

import { supabase } from "@/integrations/supabase/client";
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

// Browser SpeechRecognition type (varies by browser implementation)
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

    const { data, error } = await (supabase as any)
      .from("voice_sessions")
      .insert({
        session_id: sessionId,
        platform: request.platform,
        mode: request.mode || "online",
        language: request.language || "pt-BR",
        voice_engine: this.isSpeechRecognitionAvailable() ? "web_speech_api" : "fallback",
        device_info: request.device_info,
      })
      .select()
      .single();

    if (error) throw error;
    return data as VoiceSession;
  }

  static async endSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    const { error } = await (supabase as any)
      .from("voice_sessions")
      .update({ ended_at: new Date().toISOString(), duration_seconds: duration })
      .eq("session_id", sessionId);

    if (error) throw error;
    if (this.currentSessionId === sessionId) this.currentSessionId = null;
  }

  static async getSession(sessionId: string): Promise<VoiceSession | null> {
    const { data, error } = await (supabase as any)
      .from("voice_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) throw error;
    return data as VoiceSession | null;
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
    const { data, error } = await (supabase as any).rpc("process_voice_command", {
      p_session_id: request.session_id,
      p_command_text: request.command_text,
      p_confidence_score: request.confidence_score || 0.0,
    });

    if (error) throw error;
    const command = await this.getCommand(data as string);
    if (!command) throw new Error("Command not found");
    return command;
  }

  static async getCommand(id: string): Promise<VoiceCommand | null> {
    const { data, error } = await (supabase as any).from("voice_commands").select("*").eq("id", id).single();
    if (error) throw error;
    return data as VoiceCommand | null;
  }

  static async getCommandHistory(limit = 50): Promise<VoiceCommand[]> {
    const { data, error } = await (supabase as any).from("voice_commands").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as VoiceCommand[];
  }

  static async getTemplates(): Promise<VoiceCommandTemplate[]> {
    const { data, error } = await (supabase as any).from("voice_command_templates").select("*").eq("is_enabled", true).order("popularity_score", { ascending: false });
    if (error) throw error;
    return (data || []) as VoiceCommandTemplate[];
  }

  static async getPersonalities(): Promise<VoicePersonality[]> {
    const { data, error } = await (supabase as any).from("voice_personalities").select("*").eq("is_enabled", true).order("display_name");
    if (error) throw error;
    return (data || []) as VoicePersonality[];
  }

  static async getSettings(): Promise<VoiceSettings | null> {
    const { data, error } = await (supabase as any).from("voice_settings").select("*").maybeSingle();
    if (error) throw error;
    return data as VoiceSettings | null;
  }

  static async saveSettings(settings: Partial<VoiceSettings>): Promise<VoiceSettings> {
    const { data, error } = await (supabase as any).from("voice_settings").upsert(settings).select().single();
    if (error) throw error;
    return data as VoiceSettings;
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
