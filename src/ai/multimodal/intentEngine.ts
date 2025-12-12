// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface IntentInput {
  voiceCommand?: string;
  gestureInput?: {
    type: string;
    confidence: number;
    data: any;
  };
  typedQuery?: string;
  context?: Record<string, any>;
}

export interface IntentOutput {
  intent: string;
  target: string | null;
  confidence: number;
  action: string;
  parameters: Record<string, any>;
  inputType: "voice" | "gesture" | "text" | "multimodal";
  timestamp: string;
}

/**
 * Multimodal Intent Engine
 * Processes voice, gesture, and text inputs to determine user intent
 * Uses GPT-4o with context-aware prompting
 */
export class MultimodalIntentEngine {
  private isInitialized = false;
  private recognitionService: any = null;
  
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize Web Speech API if available
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognitionService = new SpeechRecognition();
        this.recognitionService.continuous = false;
        this.recognitionService.interimResults = false;
        this.recognitionService.lang = "pt-BR";
      }
      
      this.isInitialized = true;
      logger.info("Multimodal Intent Engine initialized");
    } catch (error) {
      logger.error("Failed to initialize Intent Engine", { error });
    }
  }

  /**
   * Process multimodal input and determine intent
   */
  async processIntent(input: IntentInput): Promise<IntentOutput> {
    const startTime = Date.now();
    
    try {
      // Determine input type
      const inputType = this.determineInputType(input);
      
      // Build context-aware prompt
      const prompt = this.buildIntentPrompt(input, inputType);
      
      // Call AI service to classify intent
      const intentResult = await this.classifyIntent(prompt, input.context);
      
      // Log performance
      const responseTime = Date.now() - startTime;
      await this.logPerformance({
        module_name: "multimodal_intent_engine",
        operation_type: "intent_classification",
        response_time_ms: responseTime,
        context: {
          inputType,
          intent: intentResult.intent,
          confidence: intentResult.confidence,
        },
      });
      
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

  /**
   * Process voice command using Web Speech API
   */
  async processVoiceCommand(
    onResult: (transcript: string) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    if (!this.recognitionService) {
      throw new Error("Speech recognition not available");
    }

    return new Promise((resolve, reject) => {
      this.recognitionService.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        resolve();
      };

      this.recognitionService.onerror = (event: any) => {
        if (onError) onError(event.error);
        reject(event.error);
      };

      this.recognitionService.onend = () => {
        resolve();
      };

      this.recognitionService.start();
    });
  }

  /**
   * Process gesture input from MediaPipe or other gesture recognition
   */
  async processGesture(gestureData: any): Promise<IntentOutput> {
    return this.processIntent({
      gestureInput: gestureData,
    });
  }

  /**
   * Process typed text query
   */
  async processTextQuery(query: string, context?: Record<string, any>): Promise<IntentOutput> {
    return this.processIntent({
      typedQuery: query,
      context,
    });
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
    
    if (input.voiceCommand) {
      prompt += `Voice Command: "${input.voiceCommand}"\n`;
    }
    
    if (input.gestureInput) {
      prompt += `Gesture Input: ${input.gestureInput.type} (confidence: ${input.gestureInput.confidence})\n`;
    }
    
    if (input.typedQuery) {
      prompt += `Text Query: "${input.typedQuery}"\n`;
    }
    
    if (input.context) {
      prompt += `\nContext: ${JSON.stringify(input.context, null, 2)}\n`;
    }
    
    prompt += `\nBased on the input above, determine the user's intent and respond with a JSON object containing:
{
  "intent": "the primary intent (e.g., 'navigate', 'query', 'command', 'create', 'update')",
  "target": "the target object or entity (if applicable)",
  "confidence": 0.95,
  "action": "specific action to take",
  "parameters": {
    // relevant parameters extracted from the input
  }
}`;
    
    return prompt;
  }

  private async classifyIntent(prompt: string, context?: Record<string, any>): Promise<Omit<IntentOutput, "inputType" | "timestamp">> {
    try {
      // In a real implementation, this would call GPT-4o or another LLM
      // For now, we'll use a simple pattern matching approach
      const intent = this.extractIntentFromPrompt(prompt);
      
      return {
        intent: intent.intent,
        target: intent.target,
        confidence: intent.confidence,
        action: intent.action,
        parameters: intent.parameters,
      };
    } catch (error) {
      logger.error("Error classifying intent", { error });
      
      // Return default intent on error
      return {
        intent: "unknown",
        target: null,
        confidence: 0,
        action: "none",
        parameters: {},
      };
    }
  }

  private extractIntentFromPrompt(prompt: string): {
    intent: string;
    target: string | null;
    confidence: number;
    action: string;
    parameters: Record<string, any>;
  } {
    // Simple pattern matching for common intents
    const lowerPrompt = prompt.toLowerCase();
    
    // Navigation intents
    if (lowerPrompt.includes("navigate") || lowerPrompt.includes("go to") || lowerPrompt.includes("open")) {
      return {
        intent: "navigate",
        target: this.extractTarget(prompt),
        confidence: 0.85,
        action: "navigate_to",
        parameters: {},
      };
    }
    
    // Query intents
    if (lowerPrompt.includes("show") || lowerPrompt.includes("display") || lowerPrompt.includes("what") || lowerPrompt.includes("how")) {
      return {
        intent: "query",
        target: this.extractTarget(prompt),
        confidence: 0.80,
        action: "fetch_data",
        parameters: {},
      };
    }
    
    // Command intents
    if (lowerPrompt.includes("create") || lowerPrompt.includes("add") || lowerPrompt.includes("new")) {
      return {
        intent: "command",
        target: this.extractTarget(prompt),
        confidence: 0.90,
        action: "create",
        parameters: {},
      };
    }
    
    // Update intents
    if (lowerPrompt.includes("update") || lowerPrompt.includes("edit") || lowerPrompt.includes("change")) {
      return {
        intent: "command",
        target: this.extractTarget(prompt),
        confidence: 0.85,
        action: "update",
        parameters: {},
      };
    }
    
    // Default
    return {
      intent: "query",
      target: null,
      confidence: 0.50,
      action: "process",
      parameters: {},
    };
  }

  private extractTarget(prompt: string): string | null {
    // Extract potential targets from prompt
    const targets = ["dashboard", "report", "incident", "task", "document", "vessel", "crew"];
    
    for (const target of targets) {
      if (prompt.toLowerCase().includes(target)) {
        return target;
      }
    }
    
    return null;
  }

  private async logPerformance(data: any) {
    try {
      await (supabase as any).from("ia_performance_log").insert(data);
    } catch (error) {
      logger.error("Failed to log performance", { error });
    }
  }
}

// Singleton instance
export const intentEngine = new MultimodalIntentEngine();
