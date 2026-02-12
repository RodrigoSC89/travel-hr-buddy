/**
 * UNIFIED OpenAI Client Service
 * ALL AI calls route through supabase.functions.invoke("ai-proxy")
 * NO API keys in frontend - 100% server-side
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// ===== Types =====

export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface OpenAITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ===== Core: Edge Function Proxy =====

/**
 * Check if AI is configured (always true when edge function exists)
 */
export function isOpenAIConfigured(): boolean {
  return true; // Server-side key management
}

/**
 * @deprecated Use chatCompletion() instead - keys are now server-side
 */
export function getOpenAIApiKey(): string | null {
  return null; // Keys are server-side only
}

/**
 * @deprecated Use chatCompletion() instead - direct client usage is insecure
 */
export function getOpenAIClient(): null {
  logger.warn("[OpenAIClient] Direct client access deprecated. Use chatCompletion() via edge function.");
  return null;
}

// ===== Chat Completions =====

/**
 * Send chat completion via secure edge function proxy
 */
export async function chatCompletion(
  messages: ChatMessage[],
  config: OpenAIConfig = {}
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: {
        action: "chat",
        messages,
        model: config.model,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
        ...(config.responseFormat === "json" && {
          response_format: { type: "json_object" },
        }),
      },
    });

    if (error) {
      logger.error("[OpenAIClient] Edge function error", error);
      return null;
    }

    if (data?.fallback) {
      logger.warn("[OpenAIClient] AI API not configured on server");
      return null;
    }

    return data?.content ?? null;
  } catch (error) {
    logger.error("[OpenAIClient] Request failed", error as Error);
    return null;
  }
}

/**
 * Send chat completion and parse as JSON
 */
export async function chatCompletionJSON<T>(
  messages: ChatMessage[],
  config: OpenAIConfig = {}
): Promise<T | null> {
  const content = await chatCompletion(messages, {
    ...config,
    responseFormat: "json",
  });

  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    logger.error("[OpenAIClient] Failed to parse JSON response", error as Error);
    return null;
  }
}

/**
 * Simple text completion with system prompt
 */
export async function simpleCompletion(
  systemPrompt: string,
  userPrompt: string,
  config: OpenAIConfig = {}
): Promise<string | null> {
  return chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    config
  );
}

/**
 * Simple JSON completion with system prompt
 */
export async function simpleCompletionJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  config: OpenAIConfig = {}
): Promise<T | null> {
  return chatCompletionJSON<T>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    config
  );
}

// ===== Embeddings =====

/**
 * Generate embeddings via secure edge function proxy
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: {
        action: "embedding",
        text,
      },
    });

    if (error) {
      logger.error("[OpenAIClient] Embedding edge function error", error);
      return null;
    }

    if (data?.fallback) {
      logger.warn("[OpenAIClient] Embedding API not configured, using deterministic fallback");
      return generateDeterministicEmbedding();
    }

    return data?.embedding ?? null;
  } catch (error) {
    logger.error("[OpenAIClient] Embedding request failed", error as Error);
    return null;
  }
}

/**
 * Generate deterministic fallback embedding (no randomness)
 */
export function generateMockEmbedding(dimensions: number = 1536): number[] {
  return generateDeterministicEmbedding(dimensions);
}

function generateDeterministicEmbedding(dimensions: number = 1536): number[] {
  return Array.from({ length: dimensions }, (_, i) => Math.sin(i * 0.1) * 0.5);
}

// ===== Testing =====

/**
 * Test AI API connectivity via edge function
 */
export async function testOpenAIConnection(): Promise<OpenAITestResult> {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: { action: "test" },
    });

    if (error) {
      return {
        success: false,
        message: "Edge function error",
        responseTime: Date.now() - startTime,
        error: String(error),
      };
    }

    return {
      success: data?.success ?? false,
      message: data?.message ?? "Unknown",
      responseTime: data?.responseTime ?? Date.now() - startTime,
      data: { gateway: data?.gateway },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to AI proxy",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===== Specialized Prompts =====

export async function generateReportSummary(
  reportType: string,
  reportData: Record<string, unknown>
): Promise<{
  summary: string;
  insights: string[];
  executiveSummary: string;
  conclusions: string[];
  recommendations: string[];
} | null> {
  return simpleCompletionJSON(
    "You are a maritime operations analyst. Generate comprehensive reports with insights.",
    `Analyze the following ${reportType} data and generate:
1. A detailed summary
2. Key insights (as array)
3. Executive summary (brief)
4. Conclusions (as array)
5. Recommendations (as array)

Data: ${JSON.stringify(reportData)}

Respond in JSON format: { "summary": "...", "insights": ["..."], "executiveSummary": "...", "conclusions": ["..."], "recommendations": ["..."] }`,
    { model: "gpt-4o-mini", maxTokens: 2500 }
  );
}

export async function generateDrillScenario(
  drillType: string,
  difficulty: string,
  historicalFailures: string[] = []
): Promise<Record<string, unknown> | null> {
  const failuresContext = historicalFailures.length > 0
    ? `\n\nPast failures to address:\n${historicalFailures.map(f => `- ${f}`).join("\n")}`
    : "";

  return simpleCompletionJSON(
    "You are a maritime safety expert who creates realistic emergency drill scenarios for vessel crew training.",
    `Create a realistic ${drillType} emergency drill scenario.
Difficulty Level: ${difficulty}
${failuresContext}

Include: scenario title/description, location/time/weather, challenges, expected crew responses with timing, evaluation criteria. Respond in JSON format.`,
    { temperature: 0.9, maxTokens: 2500 }
  );
}

export async function generateComplianceExplanation(
  finding: { type: string; code: string; description: string; severity: string }
): Promise<{
  technicalExplanation: string;
  simpleExplanation: string;
  correctiveActions: Array<{ action: string; priority: string; estimatedTime: string; responsible: string }>;
  relatedRegulations: Array<{ code: string; title: string; summary: string }>;
  learningPoints: string[];
} | null> {
  return simpleCompletionJSON(
    "You are a maritime compliance expert who explains regulations in both technical and simple terms.",
    `Explain this ${finding.type} compliance finding:
Code: ${finding.code}
Description: ${finding.description}
Severity: ${finding.severity}

Provide: 1) Technical explanation 2) Simple explanation for crew 3) Corrective actions with priority 4) Related regulations 5) Learning points. Respond in JSON format.`,
    { maxTokens: 2000 }
  );
}

// ===== Backward Compatibility Exports =====
export { generateEmbedding as generateOpenAIEmbedding };
export { testOpenAIConnection as testOpenAI };
