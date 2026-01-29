/**
 * Nautilus Intelligence - Advanced AI Client
 * Unified interface for all AI operations
 */

import { supabase } from "@/integrations/supabase/client";

export type AIOperation = "chat" | "predict" | "anomaly" | "insight" | "copilot" | "scenario";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PredictionResult {
  trends: Array<{
    metric: string;
    direction: "up" | "down" | "stable";
    change: number;
    confidence: number;
  }>;
  forecasts: {
    days7: Record<string, number>;
    days30: Record<string, number>;
    days90: Record<string, number>;
  };
  risks: Array<{
    description: string;
    probability: number;
    impact: string;
  }>;
  recommendations: string[];
}

export interface AnomalyResult {
  anomalies: Array<{
    field: string;
    value: unknown;
    expected: unknown;
    deviation: number;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
  }>;
  overallRisk: number;
  summary: string;
}

export interface InsightResult {
  insights: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
    priority: number;
    actions: string[];
    category: string;
  }>;
}

export interface ScenarioResult {
  scenario: string;
  operationalImpact: {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    affectedAreas: string[];
  };
  financialImpact: {
    estimatedCost: number;
    currency: string;
    breakdown: Record<string, number>;
  };
  risks: Array<{
    description: string;
    probability: number;
    mitigation: string;
  }>;
  successProbability: number;
  recommendations: string[];
}

// Hardcoded for production stability - NEVER use VITE_* vars
const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/nauti-intelligence`;

/**
 * Chat with AI assistant
 */
export async function chatWithAI(
  messages: AIMessage[],
  context?: Record<string, unknown>,
  stream = false
): Promise<string | ReadableStream> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "chat",
      messages,
      context,
      options: { stream },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI request failed");
  }

  if (stream && response.body) {
    return response.body;
  }

  const result = await response.json();
  return result.content;
}

/**
 * Predict trends based on historical data
 */
export async function predictTrends(
  data: Record<string, unknown>,
  context?: Record<string, unknown>
): Promise<PredictionResult> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "predict",
      data,
      context,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Prediction failed");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Detect anomalies in data
 */
export async function detectAnomalies(
  data: Record<string, unknown>,
  context?: Record<string, unknown>
): Promise<AnomalyResult> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "anomaly",
      data,
      context,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Anomaly detection failed");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate actionable insights
 */
export async function generateInsights(
  data: Record<string, unknown>,
  context?: Record<string, unknown>
): Promise<InsightResult> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "insight",
      data,
      context,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Insight generation failed");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get AI copilot suggestions
 */
export async function getCopilotSuggestions(
  currentPage: string,
  userContext: Record<string, unknown>
): Promise<string> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "copilot",
      messages: [
        {
          role: "user",
          content: `O usuário está na página "${currentPage}". Sugira ações relevantes.`,
        },
      ],
      context: userContext,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Copilot failed");
  }

  const result = await response.json();
  return result.content;
}

/**
 * Simulate operational scenario
 */
export async function simulateScenario(
  scenario: string,
  parameters: Record<string, unknown>
): Promise<ScenarioResult> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "scenario",
      messages: [
        {
          role: "user",
          content: `Simule o seguinte cenário: ${scenario}`,
        },
      ],
      data: parameters,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Scenario simulation failed");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Stream chat response with token-by-token rendering
 */
export async function streamChat(
  messages: AIMessage[],
  context: Record<string, unknown>,
  onDelta: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      operation: "chat",
      messages,
      context,
      options: { stream: true },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  onDone();
}
