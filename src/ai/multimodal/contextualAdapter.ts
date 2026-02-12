import { VisualContext } from "../vision/copilotVision";
import { IntentOutput } from "./intentEngine";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface GesturalInput {
  type: string;
  confidence: number;
  data: Record<string, unknown>;
}

export interface ContextData {
  visual?: VisualContext;
  gestural?: GesturalInput;
  history?: Array<{
    timestamp: string;
    action: string;
    result: string;
  }>;
  currentEnvironment?: string;
  userProfile?: {
    preferences?: Record<string, unknown>;
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
    parameters: Record<string, unknown>;
  }>;
  visualOverlay?: {
    type: string;
    data: Record<string, unknown>;
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

  async adaptResponse(
    intent: IntentOutput,
    context: ContextData
  ): Promise<AdaptiveResponse> {
    const startTime = Date.now();

    try {
      this.addToHistory(context);
      const prompt = this.buildContextualPrompt(intent, context);
      const response = await this.generateResponse(prompt, intent, context);

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

  private buildContextualPrompt(intent: IntentOutput, context: ContextData): string {
    let prompt = "You are an AI assistant in a maritime operations XR environment.\n\n";

    prompt += "User Intent:\n";
    prompt += `- Action: ${intent.intent}\n`;
    prompt += `- Target: ${intent.target || "none"}\n`;
    prompt += `- Confidence: ${(intent.confidence * 100).toFixed(1)}%\n\n`;

    if (context.visual) {
      prompt += "Visual Context:\n";
      prompt += `- Scene: ${context.visual.sceneClassification}\n`;
      prompt += `- Objects detected: ${context.visual.detectedObjects.map(o => o.class).join(", ")}\n`;
      if (context.visual.extractedText.length > 0) {
        prompt += `- Text detected: ${context.visual.extractedText.join(" ")}\n`;
      }
      prompt += "\n";
    }

    if (context.gestural) {
      prompt += "Gestural Input:\n";
      prompt += `- Type: ${context.gestural.type}\n`;
      prompt += `- Confidence: ${(context.gestural.confidence * 100).toFixed(1)}%\n\n`;
    }

    if (context.currentEnvironment) {
      prompt += `Environment: ${context.currentEnvironment}\n\n`;
    }

    if (context.history && context.history.length > 0) {
      prompt += "Recent Actions:\n";
      context.history.slice(-3).forEach(h => {
        prompt += `- ${h.action}: ${h.result}\n`;
      });
      prompt += "\n";
    }

    if (context.userProfile) {
      prompt += "User Profile:\n";
      if (context.userProfile.expertise) {
        prompt += `- Expertise: ${context.userProfile.expertise}\n`;
      }
      prompt += "\n";
    }

    prompt += `Based on the above context, provide an appropriate response.`;
    return prompt;
  }

  private async generateResponse(
    prompt: string,
    intent: IntentOutput,
    context: ContextData
  ): Promise<AdaptiveResponse> {
    try {
      const response = this.generateRuleBasedResponse(intent, context);
      return response;
    } catch (error) {
      logger.error("Error generating response", { error });
      return {
        content: "I understand your request. How can I assist you?",
        modality: "text",
        urgency: "low",
        actionRequired: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private generateRuleBasedResponse(
    intent: IntentOutput,
    context: ContextData
  ): AdaptiveResponse {
    const modality = this.determineModality(context);
    const urgency = this.determineUrgency(intent, context);

    const response: AdaptiveResponse = {
      content: "",
      modality,
      urgency,
      actionRequired: false,
      timestamp: new Date().toISOString(),
    };

    switch (intent.intent) {
    case "navigate":
      response.content = `Navigating to ${intent.target || "requested location"}.`;
      response.actionRequired = true;
      response.actions = [{ type: "navigate", target: intent.target || "unknown", parameters: {} }];
      break;
    case "query":
      response.content = this.generateQueryResponse(intent, context);
      response.actionRequired = false;
      break;
    case "command":
      response.content = `Executing ${intent.action} on ${intent.target || "target"}.`;
      response.actionRequired = true;
      response.actions = [{ type: intent.action, target: intent.target || "unknown", parameters: intent.parameters }];
      break;
    default:
      response.content = "How can I assist you with your maritime operations?";
      response.actionRequired = false;
    }

    if (context.currentEnvironment === "xr" && context.visual) {
      response.visualOverlay = {
        type: "highlight",
        data: {
          objects: context.visual.detectedObjects as unknown as Record<string, unknown>,
          scene: context.visual.sceneClassification,
        },
      };
    }

    return response;
  }

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

  private determineModality(context: ContextData): "text" | "voice" | "visual" | "haptic" | "multimodal" {
    if (context.currentEnvironment === "xr") return "multimodal";
    if (context.visual) return "visual";
    if (context.gestural) return "multimodal";
    return "text";
  }

  private determineUrgency(
    intent: IntentOutput,
    context: ContextData
  ): "low" | "medium" | "high" | "critical" {
    const criticalKeywords = ["emergency", "critical", "urgent", "danger", "alert"];
    const intentString = JSON.stringify(intent).toLowerCase();
    if (criticalKeywords.some(kw => intentString.includes(kw))) return "critical";

    const highPriorityActions = ["stop", "abort", "shutdown", "override"];
    if (highPriorityActions.includes(intent.action.toLowerCase())) return "high";
    if (intent.confidence < 0.5) return "medium";
    return "low";
  }

  private addToHistory(context: ContextData) {
    this.contextHistory.push(context);
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory.shift();
    }
  }

  getContextHistory(): ContextData[] {
    return this.contextHistory;
  }

  clearHistory() {
    this.contextHistory = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic insert shape for ia_performance_log
  private async logPerformance(data: Record<string, unknown>) {
    try {
      await (supabase.from("ia_performance_log").insert as Function)(data);
    } catch (error) {
      logger.error("Failed to log performance", { error });
    }
  }
}

export const contextualAdapter = new ContextualAdapter();
