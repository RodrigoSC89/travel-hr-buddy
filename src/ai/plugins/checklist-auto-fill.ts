/**
 * PATCH 633: Checklist Auto-Fill Plugin
 * Intelligently fills checklist items based on historical data and context
 */

import { BaseAIPlugin, AIPluginInput, AIPluginOutput, AIPluginMetadata } from "./types";

export class ChecklistAutoFillPlugin extends BaseAIPlugin {
  metadata: AIPluginMetadata = {
    name: "checklist-auto-fill",
    version: "1.0.0",
    description: "Automatically fills checklist items based on historical patterns and context",
    author: "Nautilus One AI",
    enabled: true,
    requiredFeatureFlag: "ai_plugins",
  };

  async run(input: AIPluginInput): Promise<AIPluginOutput> {
    try {
      const { checklistTemplate, historicalData, context } = input.data || {};
      
      if (!checklistTemplate) {
        return {
          success: false,
          error: "Checklist template is required",
        };
      }

      const filledItems = await this.autoFillItems(
        checklistTemplate,
        historicalData || [],
        context || {}
      );

      return {
        success: true,
        result: {
          checklistId: checklistTemplate.id,
          filledItems,
          confidence: this.calculateConfidence(filledItems),
          suggestions: this.generateSuggestions(filledItems),
        },
        metadata: {
          itemsFilled: filledItems.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async autoFillItems(
    template: any,
    historicalData: any[],
    context: Record<string, any>
  ): Promise<any[]> {
    const filledItems: any[] = [];

    for (const item of template.items || []) {
      const historicalValue = this.findHistoricalValue(item, historicalData);
      const contextValue = this.extractContextValue(item, context);
      
      const value = contextValue || historicalValue || item.default_value;
      
      if (value !== undefined) {
        filledItems.push({
          itemId: item.id,
          name: item.name,
          value,
          autoFilled: true,
          source: contextValue ? "context" : historicalValue ? "historical" : "default",
        });
      }
    }

    return filledItems;
  }

  private findHistoricalValue(item: any, historicalData: any[]): any {
    // Find most common value from historical data
    const matchingEntries = historicalData.filter(
      entry => entry.itemId === item.id || entry.name === item.name
    );
    
    if (matchingEntries.length === 0) return null;
    
    // Return most recent value
    return matchingEntries[matchingEntries.length - 1]?.value;
  }

  private extractContextValue(item: any, context: Record<string, any>): any {
    // Extract value from context based on item mapping
    if (item.contextKey && context[item.contextKey]) {
      return context[item.contextKey];
    }
    return null;
  }

  private calculateConfidence(filledItems: any[]): number {
    if (filledItems.length === 0) return 0;
    
    const sourceCounts = filledItems.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Higher confidence for context-based fills
    const score = 
      (sourceCounts.context || 0) * 1.0 +
      (sourceCounts.historical || 0) * 0.7 +
      (sourceCounts.default || 0) * 0.3;
    
    return Math.min(score / filledItems.length, 1.0);
  }

  private generateSuggestions(filledItems: any[]): string[] {
    const suggestions: string[] = [];
    
    const defaultCount = filledItems.filter(i => i.source === "default").length;
    if (defaultCount > 0) {
      suggestions.push(`${defaultCount} items filled with default values - review for accuracy`);
    }
    
    const historicalCount = filledItems.filter(i => i.source === "historical").length;
    if (historicalCount > 0) {
      suggestions.push(`${historicalCount} items filled from historical data - verify current relevance`);
    }
    
    return suggestions;
  }
}

// Register the plugin
import { pluginRegistry } from "./types";
pluginRegistry.register(new ChecklistAutoFillPlugin());
