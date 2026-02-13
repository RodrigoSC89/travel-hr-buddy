/**
 * Multimodal Intent Engine
 * DEBT-FIX: Removed (supabase as any) - ia_performance_log exists in schema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

// SpeechRecognition interface for cross-browser compat
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export interface IntentInput {
  voiceCommand?: string;
  gestureInput?: {
    type: string;
    confidence: number;
    data: Record<string, unknown>;
  };
  typedQuery?: string;
  context?: Record<string, unknown>;
}

export interface IntentOutput {
  intent: string;
  target: string | null;
  confidence: number;
  action: string;
  parameters: Record<string, unknown>;
  inputType: "voice" | "gesture" | "text" | "multimodal";
  timestamp: string;
}

/**
 * Multimodal Intent Engine
 * Processes voice, gesture, and text inputs to determine user intent
 */
export class MultimodalIntentEngine {
  private isInitialized = false;
  private recognitionService: SpeechRecognitionInstance | null = null;
  
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const win = window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
        const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
        this.recognitionService = new SpeechRecognitionAPI();
        if (this.recognitionService) {
          this.recognitionService.continuous = false;
          this.recognitionService.interimResults = false;
          this.recognitionService.lang = "pt-BR";
        }
      }
      
      this.isInitialized = true;
      logger.info("Multimodal Intent Engine initialized");
    } catch (error) {
      logger.error("Failed to initialize Intent Engine", { error });
    }
  }

  async processIntent(input: IntentInput): Promise<IntentOutput> {
    const startTime = Date.now();
    
    try {
      const inputType = this.determineInputType(input);
      const prompt = this.buildIntentPrompt(input, inputType);
      const intentResult = await this.classifyIntent(prompt);
      
      const responseTime = Date.now() - startTime;
      await this.logPerformance(responseTime, inputType, intentResult.intent, intentResult.confidence);
      
      return {
        ...intentResult,
        inputType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error processing intent", { error });
      throw error;
    }
  }

  async processVoiceCommand(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.recognitionService) {
      throw new Error("Speech recognition not available");
    }

    return new Promise((resolve, reject) => {
      this.recognitionService!.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        resolve();
      };

      this.recognitionService!.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errMsg = event.error || 'unknown';
        if (onError) onError(errMsg);
        reject(errMsg);
      };

      this.recognitionService!.onend = () => {
        resolve();
      };

      this.recognitionService!.start();
    });
  }

  async processGesture(gestureData: IntentInput["gestureInput"]): Promise<IntentOutput> {
    return this.processIntent({ gestureInput: gestureData });
  }

  async processTextQuery(query: string, context?: Record<string, unknown>): Promise<IntentOutput> {
    return this.processIntent({ typedQuery: query, context });
  }

  private determineInputType(input: IntentInput): "voice" | "gesture" | "text" | "multimodal" {
    const hasVoice = !!input.voiceCommand;
    const hasGesture = !!input.gestureInput;
    const hasText = !!input.typedQuery;
    
    const count = [hasVoice, hasGesture, hasText].filter(Boolean).length;
    
    if (count > 1) return "multimodal";
    if (hasVoice) return "voice";
    if (hasGesture) return "gesture";
    return "text";
  }

  private buildIntentPrompt(input: IntentInput, inputType: string): string {
    let prompt = "You are an AI assistant helping to interpret user intent from multimodal input.\n\n";
    prompt += `Input Type: ${inputType}\n\n`;
    
    if (input.voiceCommand) prompt += `Voice Command: "${input.voiceCommand}"\n`;
    if (input.gestureInput) prompt += `Gesture Input: ${input.gestureInput.type} (confidence: ${input.gestureInput.confidence})\n`;
    if (input.typedQuery) prompt += `Text Query: "${input.typedQuery}"\n`;
    if (input.context) prompt += `\nContext: ${JSON.stringify(input.context, null, 2)}\n`;
    
    prompt += `\nBased on the input above, determine the user's intent.`;
    return prompt;
  }

  private async classifyIntent(prompt: string): Promise<Omit<IntentOutput, "inputType" | "timestamp">> {
    try {
      return this.extractIntentFromPrompt(prompt);
    } catch (error) {
      logger.error("Error classifying intent", { error });
      return { intent: "unknown", target: null, confidence: 0, action: "none", parameters: {} };
    }
  }

  private extractIntentFromPrompt(prompt: string): {
    intent: string; target: string | null; confidence: number; action: string; parameters: Record<string, unknown>;
  } {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("navigate") || lowerPrompt.includes("go to") || lowerPrompt.includes("open")) {
      return { intent: "navigate", target: this.extractTarget(prompt), confidence: 0.85, action: "navigate_to", parameters: {} };
    }
    if (lowerPrompt.includes("show") || lowerPrompt.includes("display") || lowerPrompt.includes("what") || lowerPrompt.includes("how")) {
      return { intent: "query", target: this.extractTarget(prompt), confidence: 0.80, action: "fetch_data", parameters: {} };
    }
    if (lowerPrompt.includes("create") || lowerPrompt.includes("add") || lowerPrompt.includes("new")) {
      return { intent: "command", target: this.extractTarget(prompt), confidence: 0.90, action: "create", parameters: {} };
    }
    if (lowerPrompt.includes("update") || lowerPrompt.includes("edit") || lowerPrompt.includes("change")) {
      return { intent: "command", target: this.extractTarget(prompt), confidence: 0.85, action: "update", parameters: {} };
    }
    
    return { intent: "query", target: null, confidence: 0.50, action: "process", parameters: {} };
  }

  private extractTarget(prompt: string): string | null {
    const targets = ["dashboard", "report", "incident", "task", "document", "vessel", "crew"];
    for (const target of targets) {
      if (prompt.toLowerCase().includes(target)) return target;
    }
    return null;
  }

  /**
   * Log performance to ia_performance_log (typed - table exists in schema)
   */
  private async logPerformance(executionTimeMs: number, inputType: string, intent: string, confidence: number) {
    try {
      await supabase.from("ia_performance_log").insert({
        module_name: "multimodal_intent_engine",
        operation_type: "intent_classification",
        execution_time_ms: executionTimeMs,
        metadata: { inputType, intent, confidence } as unknown as Json,
      });
    } catch (error) {
      logger.error("Failed to log performance", { error });
    }
  }
}

export const intentEngine = new MultimodalIntentEngine();
