/**
 * AI Telemetry Bridge
 * 
 * Integrates with OpenAI GPT-3.5-turbo to analyze performance metrics
 * and generate technical insights and recommendations.
 * 
 * @module TelemetryBridge
 * @version 1.0.0 (Nautilus v3.3)
 */

import OpenAI from "openai";
import type { PerformanceMetrics } from "@/lib/telemetry/performance-monitor";

export interface AIInsight {
  summary: string;
  recommendations: string[];
  severity: "low" | "medium" | "high";
  timestamp: number;
}

/**
 * Analyze performance metrics using AI
 * 
 * @param metrics - Performance metrics to analyze
 * @returns AI-generated insights and recommendations
 */
export async function analyzePerformanceMetrics(
  metrics: PerformanceMetrics
): Promise<AIInsight> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OpenAI API key not configured. Skipping AI analysis.");
    return {
      summary: "AI analysis unavailable - API key not configured",
      recommendations: [],
      severity: "low",
      timestamp: Date.now(),
    };
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const prompt = `Analyze the following performance metrics and provide technical insights:

CPU Usage: ${metrics.cpu}%
Memory Usage: ${metrics.memory} MB
FPS: ${metrics.fps}

Provide:
1. A brief summary of the system's health
2. Specific recommendations for improvement
3. Severity level (low, medium, or high)

Format your response as JSON with keys: summary, recommendations (array), severity`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a performance analysis expert. Provide concise, actionable insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || "Analysis completed",
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        severity: parsed.severity || "low",
        timestamp: Date.now(),
      };
    } catch {
      // Fallback if not JSON
      return {
        summary: content,
        recommendations: [],
        severity: "low",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error("Failed to analyze metrics with AI:", error);
    return {
      summary: "AI analysis failed - see console for details",
      recommendations: [],
      severity: "low",
      timestamp: Date.now(),
    };
  }
}

/**
 * Generate performance report with AI insights
 * 
 * @param metricsHistory - Array of historical performance metrics
 * @returns Comprehensive AI-generated report
 */
export async function generatePerformanceReport(
  metricsHistory: PerformanceMetrics[]
): Promise<string> {
  if (metricsHistory.length === 0) {
    return "No metrics available for analysis";
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return "AI report generation unavailable - API key not configured";
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Calculate statistics
    const avgCpu = metricsHistory.reduce((sum, m) => sum + m.cpu, 0) / metricsHistory.length;
    const avgMemory = metricsHistory.reduce((sum, m) => sum + m.memory, 0) / metricsHistory.length;
    const avgFps = metricsHistory.reduce((sum, m) => sum + m.fps, 0) / metricsHistory.length;

    const prompt = `Generate a performance report based on these statistics:

Average CPU Usage: ${avgCpu.toFixed(1)}%
Average Memory Usage: ${avgMemory.toFixed(1)} MB
Average FPS: ${avgFps.toFixed(0)}
Sample count: ${metricsHistory.length}

Provide a comprehensive analysis including trends, issues, and recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a performance analysis expert. Provide detailed technical reports.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "Report generation failed";
  } catch (error) {
    console.error("Failed to generate performance report:", error);
    return "Report generation failed - see console for details";
  }
}
