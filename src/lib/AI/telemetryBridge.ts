/**
 * AI Telemetry Bridge
 * OpenAI GPT-3.5-turbo integration for performance analysis
 */

import OpenAI from "openai";
import { PerformanceMetrics } from "@/lib/telemetry/performance-monitor";
import { logger } from "@/lib/logger";

export interface PerformanceInsights {
  summary: string;
  recommendations: string[];
  severity: "low" | "medium" | "high";
  timestamp: string;
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn("VITE_OPENAI_API_KEY not set, AI insights disabled");
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    return openaiClient;
  } catch (error) {
    logger.error("Failed to initialize OpenAI client", error as Error);
    return null;
  }
}

export async function analyzePerformanceMetrics(
  metrics: PerformanceMetrics
): Promise<PerformanceInsights> {
  const client = getOpenAIClient();

  // Graceful degradation when API key is missing
  if (!client) {
    return {
      summary: "AI insights unavailable (API key not configured)",
      recommendations: ["Configure VITE_OPENAI_API_KEY to enable AI analysis"],
      severity: "low",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const prompt = `Analyze these performance metrics and provide technical insights:
- CPU Usage: ${metrics.cpu}%
- Memory: ${metrics.memory} MB
- FPS: ${metrics.fps}

Provide:
1. A brief technical summary (max 2 sentences)
2. Up to 3 specific recommendations
3. Severity level (low/medium/high)

Format your response as JSON with keys: summary, recommendations (array), severity`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a performance optimization expert. Provide concise, actionable technical insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Try to parse as JSON, fallback to structured text
    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || "Performance analysis completed",
        recommendations: parsed.recommendations || [],
        severity: parsed.severity || "low",
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fallback: extract information from text
      return {
        summary: content.substring(0, 200),
        recommendations: ["Review the detailed analysis above"],
        severity: "medium",
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    logger.error("Failed to analyze performance metrics", error as Error, { 
      cpu: metrics.cpu, 
      memory: metrics.memory, 
      fps: metrics.fps 
    });
    return {
      summary: "Performance analysis failed",
      recommendations: ["Check API configuration", "Review console logs"],
      severity: "low",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function generatePerformanceReport(
  metricsHistory: PerformanceMetrics[]
): Promise<string> {
  const client = getOpenAIClient();

  if (!client || metricsHistory.length === 0) {
    return "Insufficient data for historical report";
  }

  try {
    const avgCPU =
      metricsHistory.reduce((sum, m) => sum + m.cpu, 0) / metricsHistory.length;
    const avgMemory =
      metricsHistory.reduce((sum, m) => sum + m.memory, 0) / metricsHistory.length;
    const avgFPS =
      metricsHistory.reduce((sum, m) => sum + m.fps, 0) / metricsHistory.length;

    const prompt = `Generate a brief performance report based on these averages from ${metricsHistory.length} samples:
- Avg CPU: ${avgCPU.toFixed(1)}%
- Avg Memory: ${avgMemory.toFixed(1)} MB
- Avg FPS: ${avgFPS.toFixed(0)}

Provide a 3-4 sentence executive summary.`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a technical writer specializing in performance reports.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "Report generation failed";
  } catch (error) {
    logger.error("Failed to generate performance report", error as Error, { 
      samples: metricsHistory.length 
    });
    return "Failed to generate performance report";
  }
}
