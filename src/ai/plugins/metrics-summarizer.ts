/**
 * PATCH 633: Metrics Summarizer Plugin
 * Summarizes system metrics and generates insights
 */

import { BaseAIPlugin, AIPluginInput, AIPluginOutput, AIPluginMetadata } from "./types";

export class MetricsSummarizerPlugin extends BaseAIPlugin {
  metadata: AIPluginMetadata = {
    name: "metrics-summarizer",
    version: "1.0.0",
    description: "Analyzes and summarizes system metrics to generate actionable insights",
    author: "Nautilus One AI",
    enabled: true,
    requiredFeatureFlag: "ai_plugins",
  };

  async run(input: AIPluginInput): Promise<AIPluginOutput> {
    try {
      const metrics = input.data as any[];
      
      if (!Array.isArray(metrics) || metrics.length === 0) {
        return {
          success: false,
          error: "No metrics data provided",
        };
      }

      // Calculate summary statistics
      const summary = {
        total: metrics.length,
        average: metrics.reduce((sum, m) => sum + (m.value || 0), 0) / metrics.length,
        max: Math.max(...metrics.map(m => m.value || 0)),
        min: Math.min(...metrics.map(m => m.value || 0)),
        trend: this.calculateTrend(metrics),
        insights: this.generateInsights(metrics),
      };

      return {
        success: true,
        result: summary,
        metadata: {
          processingTime: Date.now(),
          dataPoints: metrics.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private calculateTrend(metrics: any[]): "increasing" | "decreasing" | "stable" {
    if (metrics.length < 2) return "stable";
    
    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + (m.value || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + (m.value || 0), 0) / secondHalf.length;
    
    const difference = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (difference > 10) return "increasing";
    if (difference < -10) return "decreasing";
    return "stable";
  }

  private generateInsights(metrics: any[]): string[] {
    const insights: string[] = [];
    const trend = this.calculateTrend(metrics);
    
    if (trend === "increasing") {
      insights.push("Metrics show an upward trend - monitor for potential capacity issues");
    } else if (trend === "decreasing") {
      insights.push("Metrics show a downward trend - investigate potential performance degradation");
    } else {
      insights.push("Metrics are stable within normal parameters");
    }
    
    return insights;
  }
}

// Register the plugin
import { pluginRegistry } from "./types";
pluginRegistry.register(new MetricsSummarizerPlugin());
