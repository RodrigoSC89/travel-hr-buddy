/**
 * PATCH 165.0 - Mobile AI Core
 * Contextual AI assistant with offline support and GPT-4o-mini fallback
 */

import OpenAI from "openai";
import { localMemory } from "./localMemory";
import { intentParser, Intent } from "./intentParser";
import { logger } from "@/lib/logger";

interface AIResponse {
  content: string;
  intent?: Intent;
  source: "local" | "gpt4";
  confidence: number;
}

interface QueryContext {
  mission?: any;
  location?: any;
  weather?: any;
  checklists?: any[];
  isOnline: boolean;
}

class MobileAICore {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize OpenAI client
   */
  private initialize(): void {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
      this.isInitialized = true;
    } else {
      logger.warn("OpenAI API key not configured. Using offline mode only.");
    }
  }

  /**
   * Process user query with context awareness
   */
  async query(
    userInput: string,
    context: QueryContext
  ): Promise<AIResponse> {
    // Parse intent
    const intent = intentParser.parse(userInput);

    // Store user message
    await localMemory.storeMessage({
      role: "user",
      content: userInput,
      context: { intent, ...context }
    });

    // Try offline-first approach
    if (!context.isOnline || intent.confidence > 0.7) {
      const offlineResponse = await this.handleOfflineQuery(intent, context);
      
      if (offlineResponse) {
        // Store assistant response
        await localMemory.storeMessage({
          role: "assistant",
          content: offlineResponse.content
        });
        
        return offlineResponse;
      }
    }

    // Fallback to GPT-4o-mini if online
    if (context.isOnline && this.openai) {
      try {
        const gptResponse = await this.queryGPT4(userInput, context);
        
        // Store assistant response
        await localMemory.storeMessage({
          role: "assistant",
          content: gptResponse.content
        });
        
        return gptResponse;
      } catch (error) {
        logger.error("GPT-4 query failed:", error);
        
        // Fallback to offline if GPT fails
        const fallbackResponse = await this.handleOfflineQuery(intent, context);
        if (fallbackResponse) {
          return fallbackResponse;
        }
      }
    }

    // Ultimate fallback
    return {
      content: "I'm currently operating in offline mode. I can help with basic queries about mission status, location, weather, and checklists based on cached data.",
      source: "local",
      confidence: 0.3
    };
  }

  /**
   * Handle query using offline data
   */
  private async handleOfflineQuery(
    intent: Intent,
    context: QueryContext
  ): Promise<AIResponse | null> {
    let response = "";

    switch (intent.action) {
    case "get_mission_status":
      if (context.mission) {
        response = "Mission Status:\n";
        response += `- Name: ${context.mission.name}\n`;
        response += `- Status: ${context.mission.status}\n`;
        response += `- Progress: ${context.mission.progress}%\n`;
        response += `- Checklists: ${context.mission.checklistsCompleted}/${context.mission.checklistsTotal}\n`;
          
        if (context.mission.criticalItems > 0) {
          response += `\n⚠️ ${context.mission.criticalItems} critical items require attention.`;
        }
      } else {
        response = "No active mission data available offline.";
      }
      break;

    case "get_route_info":
      if (context.location) {
        response = "Current Location:\n";
        response += `- Latitude: ${context.location.lat.toFixed(4)}°\n`;
        response += `- Longitude: ${context.location.lng.toFixed(4)}°\n`;
          
        if (context.location.speed) {
          response += `- Speed: ${context.location.speed.toFixed(1)} knots\n`;
        }
          
        if (context.location.heading) {
          response += `- Heading: ${context.location.heading}°\n`;
        }
      } else {
        response = "Location data not available offline.";
      }
      break;

    case "get_weather":
      if (context.weather) {
        response = "Weather Conditions:\n";
        response += `- Conditions: ${context.weather.conditions}\n`;
        response += `- Temperature: ${context.weather.temperature}°C\n`;
        response += `- Wind: ${Math.round(context.weather.windSpeed)} knots from ${context.weather.windDirection}°\n`;
        response += `- Visibility: ${context.weather.visibility}km\n`;
          
        if (context.weather.severity !== "safe") {
          response += `\n⚠️ Weather severity: ${context.weather.severity.toUpperCase()}`;
        }
      } else {
        response = "Weather data not available offline. Last sync required.";
      }
      break;

    case "show_checklist":
      if (context.checklists && context.checklists.length > 0) {
        response = `Active Checklists (${context.checklists.length}):\n\n`;
          
        context.checklists.forEach((checklist, index) => {
          const completed = checklist.items.filter((i: any) => i.checked).length;
          const total = checklist.items.length;
          const percent = Math.round((completed / total) * 100);
            
          response += `${index + 1}. ${checklist.title}\n`;
          response += `   Progress: ${completed}/${total} (${percent}%)\n`;
          response += `   Status: ${checklist.completed ? "✓ Complete" : "○ In Progress"}\n\n`;
        });
      } else {
        response = "No active checklists found.";
      }
      break;

    case "get_system_status":
      response = "System Status:\n";
      response += `- Mode: ${context.isOnline ? "Online" : "Offline"}\n`;
      response += `- Active Mission: ${context.mission ? "Yes" : "No"}\n`;
      response += "- Cached Data: Available\n";
        
      if (!context.isOnline) {
        response += "\n📡 Operating in offline mode. Some features may be limited.";
      }
      break;

    default:
      // Try to answer based on conversation history
      const history = await localMemory.searchHistory(intent.entities.subject || "");
      if (history.length > 0) {
        const lastRelevant = history[0];
        response = `Based on recent conversation: ${lastRelevant.content}`;
      } else {
        return null; // Can't handle offline
      }
    }

    return {
      content: response,
      intent,
      source: "local",
      confidence: intent.confidence
    };
  }

  /**
   * Query GPT-4o-mini with context
   */
  private async queryGPT4(
    userInput: string,
    context: QueryContext
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error("OpenAI not initialized");
    }

    // Build context for GPT
    const systemPrompt = this.buildSystemPrompt(context);
    
    // Get conversation history
    const history = await localMemory.getHistory(10);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      })),
      { role: "user", content: userInput }
    ];

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const content = completion.choices[0]?.message?.content || "No response generated.";

    return {
      content,
      source: "gpt4",
      confidence: 0.95
    };
  }

  /**
   * Build system prompt with current context
   */
  private buildSystemPrompt(context: QueryContext): string {
    let prompt = `You are Nautilus AI Assistant, an intelligent maritime operations assistant. You provide concise, accurate information about missions, navigation, weather, and operations.

Current Context:
`;

    if (context.mission) {
      prompt += `\nMission: ${context.mission.name} (${context.mission.status})
Progress: ${context.mission.progress}%
Checklists: ${context.mission.checklistsCompleted}/${context.mission.checklistsTotal}`;
    }

    if (context.location) {
      prompt += `\n\nLocation: ${context.location.lat.toFixed(2)}°, ${context.location.lng.toFixed(2)}°`;
      if (context.location.speed) {
        prompt += `\nSpeed: ${context.location.speed.toFixed(1)} knots`;
      }
    }

    if (context.weather) {
      prompt += `\n\nWeather: ${context.weather.conditions}
Temperature: ${context.weather.temperature}°C
Wind: ${Math.round(context.weather.windSpeed)} knots`;
    }

    if (context.checklists && context.checklists.length > 0) {
      prompt += `\n\nActive Checklists: ${context.checklists.length}`;
    }

    prompt += `\n\nMode: ${context.isOnline ? "Online" : "Offline"}

Provide helpful, professional responses. Keep answers concise and actionable. Focus on maritime safety and operational efficiency.`;

    return prompt;
  }

  /**
   * Get conversation history
   */
  async getHistory(limit?: number) {
    return localMemory.getHistory(limit);
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    return localMemory.clearHistory();
  }

  /**
   * Update context
   */
  async updateContext(context: any) {
    return localMemory.updateContext(context);
  }
}

export const mobileAICore = new MobileAICore();
