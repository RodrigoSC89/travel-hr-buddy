/**
 * AI Telemetry Bridge
 * Routes through secure edge function proxy - NO browser-side API keys
 */

import { PerformanceMetrics } from "@/lib/telemetry/performance-monitor";
import { logger } from "@/lib/logger";
import { chatCompletionJSON } from "@/services/unified/openai-client.service";

export interface PerformanceInsights {
  summary: string;
  recommendations: string[];
  severity: "low" | "medium" | "high";
  timestamp: string;
}

export async function analyzePerformanceMetrics(
  metrics: PerformanceMetrics
): Promise<PerformanceInsights> {
  try {
    const result = await chatCompletionJSON<{
      summary: string;
      recommendations: string[];
      severity: string;
    }>(
      [
        {
          role: "system",
          content: "You are a performance optimization expert. Provide concise, actionable technical insights.",
        },
        {
          role: "user",
          content: `Analyze these performance metrics and provide technical insights:
- CPU Usage: ${metrics.cpu}%
- Memory: ${metrics.memory} MB
- FPS: ${metrics.fps}

Provide JSON with keys: summary, recommendations (array), severity (low/medium/high)`,
        },
      ],
      { temperature: 0.3, maxTokens: 300, responseFormat: "json" }
    );

    if (!result) {
      return {
        summary: "AI insights unavailable (server not configured)",
        recommendations: ["Configure AI API key on the server to enable analysis"],
        severity: "low",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      summary: result.summary || "Performance analysis completed",
      recommendations: result.recommendations || [],
      severity: (result.severity as "low" | "medium" | "high") || "low",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to analyze performance metrics", error as Error);
    return {
      summary: "Performance analysis failed",
      recommendations: ["Check server configuration"],
      severity: "low",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function generatePerformanceReport(
  metricsHistory: PerformanceMetrics[]
): Promise<string> {
  if (metricsHistory.length === 0) {
    return "Insufficient data for historical report";
  }

  try {
    const avgCPU = metricsHistory.reduce((sum, m) => sum + m.cpu, 0) / metricsHistory.length;
    const avgMemory = metricsHistory.reduce((sum, m) => sum + m.memory, 0) / metricsHistory.length;
    const avgFPS = metricsHistory.reduce((sum, m) => sum + m.fps, 0) / metricsHistory.length;

    const { chatCompletion } = await import("@/services/unified/openai-client.service");
    const result = await chatCompletion(
      [
        { role: "system", content: "You are a technical writer specializing in performance reports." },
        {
          role: "user",
          content: `Generate a brief performance report based on these averages from ${metricsHistory.length} samples:
- Avg CPU: ${avgCPU.toFixed(1)}%
- Avg Memory: ${avgMemory.toFixed(1)} MB
- Avg FPS: ${avgFPS.toFixed(0)}

Provide a 3-4 sentence executive summary.`,
        },
      ],
      { temperature: 0.5, maxTokens: 200 }
    );

    return result || "Report generation unavailable - AI not configured on server";
  } catch (error) {
    logger.error("Failed to generate performance report", error as Error);
    return "Failed to generate performance report";
  }
}
