
import { VisualContext } from "../vision/copilotVision";
import { IntentOutput } from "./intentEngine";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface ContextData {
  visual?: VisualContext;
  gestural?: {
    type: string;
    confidence: number;
    data: any;
  };
  history?: Array<{
    timestamp: string;
    action: string;
    result: string;
  }>;
  currentEnvironment?: string;
  userProfile?: {
    preferences?: Record<string, any>;
    expertise?: string;
  };
}

export interface AdaptiveResponse {
  content: string;
  modality: "text" | "voice" | "visual" | "haptic" | "multimodal";
  urgency: "low" | "medium" | "high" | "critical";
  actionRequired: boolean;
  actions?: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  visualOverlay?: {
    type: string;
    data: any;
  };
  timestamp: string;
}

/**
 * Contextual Response Adapter
 * Adapts AI responses based on environment, user context, and multimodal inputs
 */
export class ContextualAdapter {
  private contextHistory: ContextData[] = [];
  private maxHistorySize = 50;

  /**
   * Adapt response based on context
   */
  async adaptResponse(
    intent: IntentOutput,
    context: ContextData
  ): Promise<AdaptiveResponse> {
    const startTime = Date.now();

    try {
      // Store context in history
      this.addToHistory(context);

      // Build contextual prompt
      const prompt = this.buildContextualPrompt(intent, context);

      // Generate adaptive response
      const response = await this.generateResponse(prompt, intent, context);

      // Log performance
      const responseTime = Date.now() - startTime;
      await this.logPerformance({
        module_name: "contextual_adapter",
        operation_type: "response_adaptation",
        response_time_ms: responseTime,
        context: {
          intent: intent.intent,
          hasVisual: !!context.visual,
          hasGestural: !!context.gestural,
          modality: response.modality,
        },
      });

      return response;
    } catch (error) {
      logger.error("Error adapting response", { error });
      throw error;
    }
  }

  /**
   * Build contextual prompt for LLM
   */
  private buildContextualPrompt(intent: IntentOutput, context: ContextData): string {
    let prompt = "You are an AI assistant in a maritime operations XR environment.\n\n";

    // Add intent context
    prompt += "User Intent:\n";
    prompt += `- Action: ${intent.intent}\n`;
    prompt += `- Target: ${intent.target || "none"}\n`;
    prompt += `- Confidence: ${(intent.confidence * 100).toFixed(1)}%\n\n`;

    // Add visual context
    if (context.visual) {
      prompt += "Visual Context:\n";
      prompt += `- Scene: ${context.visual.sceneClassification}\n`;
      prompt += `- Objects detected: ${context.visual.detectedObjects.map(o => o.class).join(", ")}\n`;
      if (context.visual.extractedText.length > 0) {
        prompt += `- Text detected: ${context.visual.extractedText.join(" ")}\n`;
      }
      prompt += "\n";
    }

    // Add gestural context
    if (context.gestural) {
      prompt += "Gestural Input:\n";
      prompt += `- Type: ${context.gestural.type}\n`;
      prompt += `- Confidence: ${(context.gestural.confidence * 100).toFixed(1)}%\n\n`;
    }

    // Add environment context
    if (context.currentEnvironment) {
      prompt += `Environment: ${context.currentEnvironment}\n\n`;
    }

    // Add history context
    if (context.history && context.history.length > 0) {
      prompt += "Recent Actions:\n";
      context.history.slice(-3).forEach(h => {
        prompt += `- ${h.action}: ${h.result}\n`;
      });
      prompt += "\n";
    }

    // Add user profile context
    if (context.userProfile) {
      prompt += "User Profile:\n";
      if (context.userProfile.expertise) {
        prompt += `- Expertise: ${context.userProfile.expertise}\n`;
      }
      prompt += "\n";
    }

    prompt += `Based on the above context, provide an appropriate response that:
1. Addresses the user's intent
2. Considers the current environment and visual context
3. Adapts the communication style to the user's expertise level
4. Suggests relevant actions if needed

Respond in JSON format with:
{
  "content": "the response message",
  "modality": "text|voice|visual|haptic|multimodal",
  "urgency": "low|medium|high|critical",
  "actionRequired": true/false,
  "actions": [{ "type": "", "target": "", "parameters": {} }],
  "visualOverlay": { "type": "", "data": {} }
}`;

    return prompt;
  }

  /**
   * Generate adaptive response
   */
  private async generateResponse(
    prompt: string,
    intent: IntentOutput,
    context: ContextData
  ): Promise<AdaptiveResponse> {
    try {
      // In production, this would call an LLM API (GPT-4o, Claude, etc.)
      // For now, we'll use rule-based logic

      const response = this.generateRuleBasedResponse(intent, context);
      return response;
    } catch (error) {
      logger.error("Error generating response", { error });
      
      // Fallback response
      return {
        content: "I understand your request. How can I assist you?",
        modality: "text",
        urgency: "low",
        actionRequired: false,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Generate rule-based response (fallback when LLM is not available)
   */
  private generateRuleBasedResponse(
    intent: IntentOutput,
    context: ContextData
  ): AdaptiveResponse {
    const modality = this.determineModality(context);
    const urgency = this.determineUrgency(intent, context);

    // Base response structure
    const response: AdaptiveResponse = {
      content: "",
      modality,
      urgency,
      actionRequired: false,
      timestamp: new Date().toISOString(),
    };

    // Generate content based on intent
    switch (intent.intent) {
    case "navigate":
      response.content = `Navigating to ${intent.target || "requested location"}.`;
      response.actionRequired = true;
      response.actions = [{
        type: "navigate",
        target: intent.target || "unknown",
        parameters: {},
      }];
      break;

    case "query":
      response.content = this.generateQueryResponse(intent, context);
      response.actionRequired = false;
      break;

    case "command":
      response.content = `Executing ${intent.action} on ${intent.target || "target"}.`;
      response.actionRequired = true;
      response.actions = [{
        type: intent.action,
        target: intent.target || "unknown",
        parameters: intent.parameters,
      }];
      break;

    default:
      response.content = "How can I assist you with your maritime operations?";
      response.actionRequired = false;
    }

    // Add visual overlay if in XR mode
    if (context.currentEnvironment === "xr" && context.visual) {
      response.visualOverlay = {
        type: "highlight",
        data: {
          objects: context.visual.detectedObjects,
          scene: context.visual.sceneClassification,
        },
      };
    }

    return response;
  }

  /**
   * Generate query-specific response
   */
  private generateQueryResponse(intent: IntentOutput, context: ContextData): string {
    if (context.visual) {
      const scene = context.visual.sceneClassification;
      const objects = context.visual.detectedObjects;

      if (objects.length > 0) {
        const objectList = objects.map(o => o.class).join(", ");
        return `I can see ${objectList} in the current ${scene} scene. What would you like to know about them?`;
      } else {
        return `The current scene appears to be ${scene}. How can I assist you?`;
      }
    }

    return "What information would you like to query?";
  }

  /**
   * Determine optimal output modality
   */
  private determineModality(context: ContextData): "text" | "voice" | "visual" | "haptic" | "multimodal" {
    // If in XR environment, prefer multimodal
    if (context.currentEnvironment === "xr") {
      return "multimodal";
    }

    // If visual context is present, prefer visual
    if (context.visual) {
      return "visual";
    }

    // If gestural input, prefer multimodal
    if (context.gestural) {
      return "multimodal";
    }

    // Default to text
    return "text";
  }

  /**
   * Determine response urgency
   */
  private determineUrgency(
    intent: IntentOutput,
    context: ContextData
  ): "low" | "medium" | "high" | "critical" {
    // Check for critical keywords
    const criticalKeywords = ["emergency", "critical", "urgent", "danger", "alert"];
    const intentString = JSON.stringify(intent).toLowerCase();
    
    if (criticalKeywords.some(kw => intentString.includes(kw))) {
      return "critical";
    }

    // Check for high priority actions
    const highPriorityActions = ["stop", "abort", "shutdown", "override"];
    if (highPriorityActions.includes(intent.action.toLowerCase())) {
      return "high";
    }

    // Check confidence level
    if (intent.confidence < 0.5) {
      return "medium"; // Lower confidence requires user confirmation
    }

    return "low";
  }

  /**
   * Add context to history
   */
  private addToHistory(context: ContextData) {
    this.contextHistory.push(context);
    
    // Keep only recent history
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory.shift();
    }
  }

  /**
   * Get context history
   */
  getContextHistory(): ContextData[] {
    return this.contextHistory;
  }

  /**
   * Clear context history
   */
  clearHistory() {
    this.contextHistory = [];
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
export const contextualAdapter = new ContextualAdapter();
