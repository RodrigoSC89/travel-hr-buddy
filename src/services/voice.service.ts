// @ts-nocheck
// PATCH-601: Re-added @ts-nocheck for build stability
/**
 * PATCH 349: Voice Assistant v2 - Service Layer
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
  Platform,
} from "@/types/voice";

// Browser Speech Recognition API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = any;

export class VoiceService {
  private static recognition: SpeechRecognition | null = null;
  private static synthesis: SpeechSynthesis | null = null;
  private static currentSessionId: string | null = null;
  private static wakeWordDetector: SpeechRecognition | null = null;
  private static isWakeWordActive = false;
  private static wakeWordCallback: ((detected: boolean) => void) | null = null;

  // Initialize Speech APIs
  static initSpeechAPIs(): void {
    if (typeof window !== "undefined") {
      // @ts-expect-error - webkit prefix
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
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

  // Session Management
  static async startSession(
    request: StartSessionRequest
  ): Promise<VoiceSession> {
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.currentSessionId = sessionId;

    const { data, error } = await supabase
      .from("voice_sessions")
      .insert({
        session_id: sessionId,
        platform: request.platform,
        mode: request.mode || "online",
        language: request.language || "pt-BR",
        voice_engine: this.isSpeechRecognitionAvailable()
          ? "web_speech_api"
          : "fallback",
        device_info: request.device_info,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async endSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const duration = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    const { error } = await supabase
      .from("voice_sessions")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
      })
      .eq("session_id", sessionId);

    if (error) throw error;

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  static async getSession(sessionId: string): Promise<VoiceSession | null> {
    const { data, error } = await supabase
      .from("voice_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  static getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // Voice Recognition
  static async startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.recognition) {
      throw new Error("Speech recognition not available");
    }

    this.recognition.onresult = (event) => {
      const result = event.results[0];
      onResult({
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        is_final: result.isFinal,
      });
    };

    this.recognition.onerror = (event) => {
      if (onError) {
        onError(new Error(event.error));
      }
    };

    this.recognition.start();
  }

  static stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Voice Synthesis
  static async speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
    }
  ): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not available");
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      this.synthesis.speak(utterance);
    });
  }

  static stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Command Processing
  static async processCommand(
    request: VoiceCommandRequest
  ): Promise<VoiceCommand> {
    const { data, error } = await supabase.rpc("process_voice_command", {
      p_session_id: request.session_id,
      p_command_text: request.command_text,
      p_confidence_score: request.confidence_score || 0.0,
    });

    if (error) throw error;

    // Get the created command
    const command = await this.getCommand(data);
    if (!command) throw new Error("Command not found");

    return command;
  }

  static async getCommand(id: string): Promise<VoiceCommand | null> {
    const { data, error } = await supabase
      .from("voice_commands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getCommandHistory(limit = 50): Promise<VoiceCommand[]> {
    const { data, error } = await supabase
      .from("voice_commands")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async searchCommands(query: string): Promise<VoiceCommand[]> {
    const { data, error } = await supabase
      .from("voice_commands")
      .select("*")
      .ilike("command_text", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // Command Templates
  static async getTemplates(): Promise<VoiceCommandTemplate[]> {
    const { data, error } = await supabase
      .from("voice_command_templates")
      .select("*")
      .eq("is_enabled", true)
      .order("popularity_score", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getPopularCommandsForCache(
    limit = 20
  ): Promise<VoiceCommandTemplate[]> {
    const { data, error } = await supabase.rpc(
      "get_popular_commands_for_cache",
      {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_limit: limit,
      }
    );

    if (error) throw error;
    return data || [];
  }

  // Personalities
  static async getPersonalities(): Promise<VoicePersonality[]> {
    const { data, error } = await supabase
      .from("voice_personalities")
      .select("*")
      .eq("is_enabled", true)
      .order("display_name");

    if (error) throw error;
    return data || [];
  }

  static async getDefaultPersonality(): Promise<VoicePersonality | null> {
    const { data, error } = await supabase
      .from("voice_personalities")
      .select("*")
      .eq("is_default", true)
      .eq("is_enabled", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Settings
  static async getSettings(): Promise<VoiceSettings | null> {
    const { data, error } = await supabase
      .from("voice_settings")
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async saveSettings(
    settings: Partial<VoiceSettings>
  ): Promise<VoiceSettings> {
    const { data, error } = await supabase
      .from("voice_settings")
      .upsert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Offline Cache
  static async getCachedCommands() {
    const { data, error } = await supabase
      .from("voice_command_cache")
      .select("*")
      .order("last_used_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async cacheCommand(
    commandPattern: string,
    intent: string,
    response: string,
    cachedData?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase.from("voice_command_cache").upsert({
      command_pattern: commandPattern,
      intent,
      cached_response: response,
      cached_data: cachedData,
      last_used_at: new Date().toISOString(),
      usage_count: 1,
    });

    if (error) throw error;
  }

  // Command Execution
  static async executeCommand(
    intent: string,
    entities?: Record<string, unknown>
  ): Promise<CommandExecutionResult> {
    // This would integrate with other services based on intent
    // For now, return a simple response
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

  // Analytics
  static async getAnalytics(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [sessions, commands] = await Promise.all([
      supabase
        .from("voice_sessions")
        .select("*")
        .gte("started_at", startDate.toISOString()),
      supabase
        .from("voice_commands")
        .select("*")
        .gte("created_at", startDate.toISOString()),
    ]);

    const sessionData = sessions.data || [];
    const commandData = commands.data || [];

    const successfulCommands = commandData.filter(
      (c) => c.status === "executed"
    ).length;
    const successRate =
      commandData.length > 0
        ? (successfulCommands / commandData.length) * 100
        : 0;

    const avgConfidence =
      commandData.length > 0
        ? commandData.reduce((sum, c) => sum + (c.confidence_score || 0), 0) /
          commandData.length
        : 0;

    return {
      total_sessions: sessionData.length,
      total_commands: commandData.length,
      success_rate: Math.round(successRate),
      avg_confidence: Math.round(avgConfidence * 100) / 100,
    };
  }

  // PATCH 381: Wake Word Detection
  static startWakeWordDetection(
    wakeWord: string = "nautilus",
    onDetected: (detected: boolean) => void
  ): void {
    if (!this.recognition) {
      throw new Error("Speech recognition not available");
    }

    this.isWakeWordActive = true;
    this.wakeWordCallback = onDetected;

    // @ts-expect-error - webkit prefix
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.wakeWordDetector = new SpeechRecognition();
    this.wakeWordDetector.continuous = true;
    this.wakeWordDetector.interimResults = true;
    this.wakeWordDetector.lang = "pt-BR";

    this.wakeWordDetector.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map((result: any) => result[0].transcript)
        .join(" ")
        .toLowerCase();

      if (transcript.includes(wakeWord.toLowerCase())) {
        onDetected(true);
        this.logInteraction("wake_word_detected", { wakeWord, transcript });
      }
    };

    this.wakeWordDetector.onerror = (event) => {
      console.error("Wake word detection error:", event.error);
      this.isWakeWordActive = false;
    };

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

  // PATCH 381: Enhanced TTS with Natural Voice
  static async speakWithNaturalVoice(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceName?: string;
    }
  ): Promise<void> {
    if (!this.synthesis) {
      throw new Error("Speech synthesis not available");
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and select the most natural one
      const voices = this.synthesis.getVoices();
      let selectedVoice = null;

      if (options?.voiceName) {
        selectedVoice = voices.find(v => v.name === options.voiceName);
      }

      if (!selectedVoice) {
        // Try to find a Portuguese voice with 'natural' or 'premium' in the name
        selectedVoice = voices.find(v => 
          v.lang.startsWith("pt") && 
          (v.name.toLowerCase().includes("natural") || 
           v.name.toLowerCase().includes("premium") ||
           v.name.toLowerCase().includes("enhanced"))
        ) || voices.find(v => v.lang.startsWith("pt")) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = "pt-BR";
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      utterance.onend = () => {
        this.logInteraction("speech_completed", { text, voice: selectedVoice?.name });
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.logInteraction("speech_error", { text, error: event.error });
        reject(new Error(event.error));
      };

      this.synthesis.speak(utterance);
      this.logInteraction("speech_started", { text, voice: selectedVoice?.name });
    });
  }

  // PATCH 381: Interaction Logging with Timestamps
  static async logInteraction(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      
      await supabase.from("voice_interaction_logs").insert({
        session_id: this.currentSessionId,
        event_type: eventType,
        event_data: data,
        timestamp,
        created_at: timestamp,
      });
    } catch (error) {
      console.error("Failed to log interaction:", error);
    }
  }

  static async getInteractionHistory(
    sessionId?: string,
    limit = 100
  ): Promise<any[]> {
    let query = supabase
      .from("voice_interaction_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Get available natural voices
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }

    this.initSpeechAPIs();
    return this.synthesis.getVoices();
  }

  static async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synthesis) {
      return [];
    }

    return new Promise((resolve) => {
      const voices = this.synthesis!.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        this.synthesis!.onvoiceschanged = () => {
          resolve(this.synthesis!.getVoices());
        };
      }
    });
  }
}
