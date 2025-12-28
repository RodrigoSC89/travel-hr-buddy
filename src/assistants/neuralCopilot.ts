/**
 * PATCH 213.0 - Neural Copilot Engine (Co-Piloto Neural IA)
 * 
 * Virtual copilot based on embedded AI with continuous context and multimodal support (voice/text).
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Web Speech API types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  input_type?: "voice" | "text";
  timestamp: Date;
}

export interface TacticalRecommendation {
  id: string;
  type: "route_change" | "speed_adjustment" | "crew_alert" | "resource_allocation" | "emergency_protocol";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  reasoning: string;
  suggested_actions: string[];
  confidence: number;
}

export interface CopilotContext {
  mission_logs: unknown[];
  telemetry_data: unknown[];
  current_location?: {
    latitude: number;
    longitude: number;
  };
  vessel_status?: unknown;
  weather_conditions?: unknown;
}

export interface CopilotSession {
  id: string;
  user_id: string;
  session_name: string;
  context: CopilotContext;
  messages: CopilotMessage[];
  recommendations: TacticalRecommendation[];
  status: "active" | "paused" | "completed";
  created_at: Date;
  updated_at: Date;
}

// Database row type aligned with Supabase schema
interface CopilotSessionRow {
  id: string;
  user_id: string | null;
  session_name: string | null;
  context: Json | null;
  messages: Json | null;
  recommendations: Json | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

class NeuralCopilotEngine {
  private activeSessions: Map<string, CopilotSession> = new Map();
  private speechRecognition: SpeechRecognitionInstance | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isListening = false;

  constructor() {
    logger.info("[NeuralCopilot] Initialized");
    this.initializeSpeechAPIs();
  }

  /**
   * Initialize Web Speech API
   */
  private initializeSpeechAPIs(): void {
    if (typeof window !== "undefined") {
      // Speech Recognition (input) - use any to avoid complex Web Speech API types
      const windowAny = window as unknown as Record<string, unknown>;
      const SpeechRecognitionAPI = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const SpeechRecognitionConstructor = SpeechRecognitionAPI as new () => SpeechRecognitionInstance;
        this.speechRecognition = new SpeechRecognitionConstructor();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = "pt-BR";
        
        logger.info("[NeuralCopilot] Speech Recognition initialized");
      } else {
        logger.warn("[NeuralCopilot] Speech Recognition not available");
      }

      // Speech Synthesis (output)
      if ("speechSynthesis" in window) {
        this.speechSynthesis = window.speechSynthesis;
        logger.info("[NeuralCopilot] Speech Synthesis initialized");
      } else {
        logger.warn("[NeuralCopilot] Speech Synthesis not available");
      }
    }
  }

  /**
   * Create a new copilot session
   */
  async createSession(
    userId: string,
    sessionName: string,
    context: CopilotContext
  ): Promise<string> {
    try {
      logger.info("[NeuralCopilot] Creating new session", { userId, sessionName });

      const systemMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "system",
        content: "You are a Naval AI Copilot assistant. Provide tactical recommendations and explain decisions clearly.",
        timestamp: new Date(),
      };

      const { data, error } = await supabase
        .from("copilot_sessions")
        .insert({
          user_id: userId,
          session_name: sessionName,
          context: context as unknown as Json,
          messages: [systemMessage] as unknown as Json,
          recommendations: [] as unknown as Json,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      const row = data as CopilotSessionRow;
      const session: CopilotSession = {
        id: row.id,
        user_id: userId,
        session_name: sessionName,
        context: context,
        messages: [systemMessage],
        recommendations: [],
        status: "active",
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      };

      this.activeSessions.set(session.id, session);

      logger.info("[NeuralCopilot] Session created", { sessionId: session.id });

      return session.id;
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to create session", { error });
      throw error;
    }
  }

  /**
   * Send text command to copilot
   */
  async sendTextCommand(sessionId: string, command: string): Promise<string> {
    try {
      logger.info("[NeuralCopilot] Processing text command", { sessionId, command });

      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Add user message
      const userMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: command,
        input_type: "text",
        timestamp: new Date(),
      };

      session.messages.push(userMessage);

      // Generate AI response
      const response = await this.generateResponse(session, command);

      // Add assistant message
      const assistantMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      session.messages.push(assistantMessage);

      // Update session in database
      await this.updateSession(session);

      logger.info("[NeuralCopilot] Command processed", { sessionId });

      return response;
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to process text command", { error });
      throw error;
    }
  }

  /**
   * Generate AI response using GPT-4o-mini
   */
  private async generateResponse(session: CopilotSession, command: string): Promise<string> {
    // Simulate GPT-4o-mini response (replace with actual OpenAI API call)
    // This is a simplified version - actual implementation would use OpenAI SDK
    
    logger.info("[NeuralCopilot] Generating AI response");

    // Build context from session
    const contextSummary = this.buildContextSummary(session.context);
    
    // Analyze command type
    if (command.toLowerCase().includes("weather") || command.toLowerCase().includes("clima")) {
      return `Based on current telemetry, weather conditions are ${session.context.weather_conditions ? "available" : "being fetched"}. ${contextSummary}`;
    }
    
    if (command.toLowerCase().includes("route") || command.toLowerCase().includes("rota")) {
      return `Analyzing current route. Current location: ${session.context.current_location ? `${session.context.current_location.latitude}, ${session.context.current_location.longitude}` : "unknown"}. Recommendation: Maintain current course unless weather deteriorates.`;
    }
    
    if (command.toLowerCase().includes("status") || command.toLowerCase().includes("situação")) {
      return `System Status: All systems operational. ${session.context.mission_logs.length} mission logs recorded. Telemetry data: ${session.context.telemetry_data.length} readings available.`;
    }

    // General response
    return `I understand your request: "${command}". Based on current context with ${session.context.mission_logs.length} mission logs, I recommend monitoring the situation closely. Would you like me to provide more specific tactical recommendations?`;
  }

  /**
   * Build context summary
   */
  private buildContextSummary(context: CopilotContext): string {
    const parts: string[] = [];
    
    if (context.mission_logs.length > 0) {
      parts.push(`${context.mission_logs.length} mission log(s)`);
    }
    
    if (context.telemetry_data.length > 0) {
      parts.push(`${context.telemetry_data.length} telemetry reading(s)`);
    }
    
    if (context.current_location) {
      parts.push("position tracked");
    }

    return parts.length > 0 ? `Context: ${parts.join(", ")}.` : "";
  }

  /**
   * Generate tactical recommendation
   */
  async generateRecommendation(
    sessionId: string,
    type: TacticalRecommendation["type"]
  ): Promise<TacticalRecommendation> {
    try {
      logger.info("[NeuralCopilot] Generating recommendation", { sessionId, type });

      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Generate recommendation based on context and type
      const recommendation: TacticalRecommendation = {
        id: crypto.randomUUID(),
        type: type,
        priority: "medium",
        description: this.getRecommendationDescription(type),
        reasoning: this.getRecommendationReasoning(type, session.context),
        suggested_actions: this.getSuggestedActions(type),
        confidence: 0.75,
      };

      session.recommendations.push(recommendation);
      await this.updateSession(session);

      logger.info("[NeuralCopilot] Recommendation generated", {
        sessionId,
        recommendationId: recommendation.id,
      });

      return recommendation;
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to generate recommendation", { error });
      throw error;
    }
  }

  /**
   * Get recommendation description
   */
  private getRecommendationDescription(type: TacticalRecommendation["type"]): string {
    const descriptions: Record<TacticalRecommendation["type"], string> = {
      route_change: "Consider adjusting route to optimize efficiency",
      speed_adjustment: "Adjust vessel speed based on current conditions",
      crew_alert: "Alert crew members about upcoming situation",
      resource_allocation: "Optimize resource distribution",
      emergency_protocol: "Review emergency protocols",
    };
    return descriptions[type];
  }

  /**
   * Get recommendation reasoning
   */
  private getRecommendationReasoning(
    type: TacticalRecommendation["type"],
    context: CopilotContext
  ): string {
    const weatherInfo = context.weather_conditions ? "with current weather patterns" : "";
    const telemetryInfo = context.telemetry_data.length > 0 ? `based on ${context.telemetry_data.length} telemetry readings` : "";
    
    return `Recommendation ${weatherInfo} ${telemetryInfo}. AI analysis suggests this action will improve mission outcomes.`;
  }

  /**
   * Get suggested actions
   */
  private getSuggestedActions(type: TacticalRecommendation["type"]): string[] {
    const actions: Record<TacticalRecommendation["type"], string[]> = {
      route_change: [
        "Review alternative routes",
        "Calculate fuel impact",
        "Notify navigation team",
      ],
      speed_adjustment: [
        "Reduce speed by 10%",
        "Monitor fuel consumption",
        "Update ETA",
      ],
      crew_alert: [
        "Send notification to crew",
        "Brief team on situation",
        "Prepare contingency plans",
      ],
      resource_allocation: [
        "Review current inventory",
        "Redistribute resources",
        "Update supply requests",
      ],
      emergency_protocol: [
        "Review emergency procedures",
        "Ensure equipment readiness",
        "Conduct safety drill",
      ],
    };
    return actions[type];
  }

  /**
   * Start voice input
   */
  startVoiceInput(sessionId: string, onResult: (text: string) => void): void {
    if (!this.speechRecognition) {
      logger.error("[NeuralCopilot] Speech recognition not available");
      throw new Error("Speech recognition not available");
    }

    if (this.isListening) {
      logger.warn("[NeuralCopilot] Already listening");
      return;
    }

    logger.info("[NeuralCopilot] Starting voice input", { sessionId });

    this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      logger.info("[NeuralCopilot] Voice input received", { transcript });
      onResult(transcript);
    };

    this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      logger.error("[NeuralCopilot] Speech recognition error", { error: event.error });
    };

    this.speechRecognition.start();
    this.isListening = true;
  }

  /**
   * Stop voice input
   */
  stopVoiceInput(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
      logger.info("[NeuralCopilot] Voice input stopped");
    }
  }

  /**
   * Speak response (text-to-speech)
   */
  speakResponse(text: string): void {
    if (!this.speechSynthesis) {
      logger.error("[NeuralCopilot] Speech synthesis not available");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    this.speechSynthesis.speak(utterance);
    logger.info("[NeuralCopilot] Speaking response");
  }

  /**
   * Get session
   */
  private async getSession(sessionId: string): Promise<CopilotSession | null> {
    // Check memory first
    const cached = this.activeSessions.get(sessionId);
    if (cached) return cached;

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from("copilot_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const row = data as CopilotSessionRow;
      const session: CopilotSession = {
        id: row.id,
        user_id: row.user_id || "",
        session_name: row.session_name || "",
        context: (row.context as unknown as CopilotContext) || { mission_logs: [], telemetry_data: [] },
        messages: (row.messages as unknown as CopilotMessage[]) || [],
        recommendations: (row.recommendations as unknown as TacticalRecommendation[]) || [],
        status: (row.status as CopilotSession["status"]) || "active",
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      };

      this.activeSessions.set(sessionId, session);
      return session;
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to get session", { error });
      return null;
    }
  }

  /**
   * Update session in database
   */
  private async updateSession(session: CopilotSession): Promise<void> {
    try {
      const { error } = await supabase
        .from("copilot_sessions")
        .update({
          messages: session.messages as unknown as Json,
          recommendations: session.recommendations as unknown as Json,
          context: session.context as unknown as Json,
          status: session.status,
        })
        .eq("id", session.id);

      if (error) throw error;

      this.activeSessions.set(session.id, session);
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to update session", { error });
      throw error;
    }
  }

  /**
   * List sessions for user
   */
  async listSessions(userId: string): Promise<CopilotSession[]> {
    try {
      const { data, error } = await supabase
        .from("copilot_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data || []) as CopilotSessionRow[]).map(row => ({
        id: row.id,
        user_id: row.user_id || "",
        session_name: row.session_name || "",
        context: (row.context as unknown as CopilotContext) || { mission_logs: [], telemetry_data: [] },
        messages: (row.messages as unknown as CopilotMessage[]) || [],
        recommendations: (row.recommendations as unknown as TacticalRecommendation[]) || [],
        status: (row.status as CopilotSession["status"]) || "active",
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to list sessions", { error });
      return [];
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session.status = "completed";
      await this.updateSession(session);

      this.activeSessions.delete(sessionId);

      logger.info("[NeuralCopilot] Session ended", { sessionId });
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to end session", { error });
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("copilot_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      this.activeSessions.delete(sessionId);

      logger.info("[NeuralCopilot] Session deleted", { sessionId });
    } catch (error) {
      logger.error("[NeuralCopilot] Failed to delete session", { error });
      throw error;
    }
  }
}

// Export singleton instance
export const neuralCopilot = new NeuralCopilotEngine();
