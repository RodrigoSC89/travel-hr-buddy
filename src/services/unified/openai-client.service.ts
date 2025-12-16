/**
 * UNIFIED OpenAI Client Service
 * Consolidates all OpenAI API calls across the system
 * 
 * Fused modules:
 * - src/services/openai.ts (embeddings, test connection)
 * - src/services/mmi/embeddingService.ts (embeddings)
 * - src/services/mmi/copilotApi.ts (chat completions)
 * - src/services/mmi/forecastService.ts (chat completions)
 * - src/services/reporting-engine.ts (AI summaries)
 * - src/services/smart-drills-engine.ts (drill scenarios)
 * - src/services/ai-training-engine.ts (explanations, quizzes)
 * - src/services/risk-operations-engine.ts (risk analysis)
 */

import { logger } from "@/lib/logger";
import OpenAI from "openai";

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

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    } | null;
  }>;
}

// ===== Constants =====

const OPENAI_ENDPOINTS = {
  completions: "https://api.openai.com/v1/chat/completions",
  embeddings: "https://api.openai.com/v1/embeddings",
} as const;

const DEFAULT_CONFIG: Required<OpenAIConfig> = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
  responseFormat: "text",
};

// ===== Core Functions =====

/**
 * Get OpenAI API key from environment
 */
export function getOpenAIApiKey(): string | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return null;
  }
  
  return apiKey;
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return getOpenAIApiKey() !== null;
}

/**
 * Get OpenAI client instance (for SDK usage)
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    logger.warn("[OpenAIClient] API key not configured");
    return null;
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

// ===== Chat Completions =====

/**
 * Send chat completion request
 */
export async function chatCompletion(
  messages: ChatMessage[],
  config: OpenAIConfig = {}
): Promise<string | null> {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    logger.error("[OpenAIClient] API key not configured");
    return null;
  }
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const response = await fetch(OPENAI_ENDPOINTS.completions, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: mergedConfig.model,
        messages,
        temperature: mergedConfig.temperature,
        max_tokens: mergedConfig.maxTokens,
        ...(mergedConfig.responseFormat === "json" && {
          response_format: { type: "json_object" },
        }),
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("[OpenAIClient] API error", new Error(`HTTP ${response.status}`), { errorData });
      return null;
    }
    
    const data = (await response.json()) as OpenAIChatResponse;
    return data.choices?.[0]?.message?.content ?? null;
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
 * Generate embeddings using OpenAI ada-002 model
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    logger.error("[OpenAIClient] API key not configured for embeddings");
    return null;
  }
  
  try {
    const response = await fetch(OPENAI_ENDPOINTS.embeddings, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("[OpenAIClient] Embedding error", new Error(`HTTP ${response.status}`), { errorData });
      return null;
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].embedding;
    }
    
    return null;
  } catch (error) {
    logger.error("[OpenAIClient] Embedding request failed", error as Error);
    return null;
  }
}

/**
 * Generate mock embedding for testing/fallback
 */
export function generateMockEmbedding(dimensions: number = 1536): number[] {
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}

// ===== Testing =====

/**
 * Test OpenAI API connectivity
 */
export async function testOpenAIConnection(): Promise<OpenAITestResult> {
  const startTime = Date.now();
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    return {
      success: false,
      message: "OpenAI API key not configured",
      error: "Missing VITE_OPENAI_API_KEY",
    };
  }
  
  try {
    const response = await fetch(OPENAI_ENDPOINTS.completions, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: 'Say "API test successful" if you can read this.',
          },
        ],
        max_tokens: 20,
      }),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `OpenAI API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: errorData.error?.message || `HTTP ${response.status}`,
      };
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        message: "OpenAI API connection successful",
        responseTime,
        data: {
          model: data.model,
          response: data.choices[0].message.content,
        },
      };
    }
    
    return {
      success: false,
      message: "OpenAI API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to OpenAI API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===== Specialized Prompts =====

/**
 * Generate AI summary for reports
 */
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
  const systemPrompt = `You are a maritime operations analyst. Generate comprehensive reports with insights.`;
  
  const userPrompt = `
Analyze the following ${reportType} data and generate:
1. A detailed summary
2. Key insights (as array)
3. Executive summary (brief)
4. Conclusions (as array)
5. Recommendations (as array)

Data: ${JSON.stringify(reportData)}

Respond in JSON format:
{
  "summary": "...",
  "insights": ["..."],
  "executiveSummary": "...",
  "conclusions": ["..."],
  "recommendations": ["..."]
}`;
  
  return simpleCompletionJSON(systemPrompt, userPrompt, {
    model: "gpt-4o-mini",
    maxTokens: 2500,
  });
}

/**
 * Generate drill scenario
 */
export async function generateDrillScenario(
  drillType: string,
  difficulty: string,
  historicalFailures: string[] = []
): Promise<Record<string, unknown> | null> {
  const systemPrompt = `You are a maritime safety expert who creates realistic emergency drill scenarios for vessel crew training.`;
  
  const failuresContext = historicalFailures.length > 0
    ? `\n\nPast failures to address:\n${historicalFailures.map(f => `- ${f}`).join("\n")}`
    : "";
  
  const userPrompt = `
Create a realistic ${drillType} emergency drill scenario.
Difficulty Level: ${difficulty}
${failuresContext}

Include:
1. Scenario title and description
2. Location, time, weather conditions
3. Challenges and complications
4. Expected crew responses with timing
5. Evaluation criteria

Respond in JSON format.`;
  
  return simpleCompletionJSON(systemPrompt, userPrompt, {
    model: "gpt-4",
    temperature: 0.9,
    maxTokens: 2500,
  });
}

/**
 * Generate noncompliance explanation
 */
export async function generateComplianceExplanation(
  finding: {
    type: string;
    code: string;
    description: string;
    severity: string;
  }
): Promise<{
  technicalExplanation: string;
  simpleExplanation: string;
  correctiveActions: Array<{
    action: string;
    priority: string;
    estimatedTime: string;
    responsible: string;
  }>;
  relatedRegulations: Array<{
    code: string;
    title: string;
    summary: string;
  }>;
  learningPoints: string[];
} | null> {
  const systemPrompt = `You are a maritime compliance expert who explains regulations in both technical and simple terms.`;
  
  const userPrompt = `
Explain this ${finding.type} compliance finding:
Code: ${finding.code}
Description: ${finding.description}
Severity: ${finding.severity}

Provide:
1. Technical explanation
2. Simple explanation for crew
3. Corrective actions with priority
4. Related regulations
5. Learning points

Respond in JSON format.`;
  
  return simpleCompletionJSON(systemPrompt, userPrompt, {
    model: "gpt-4o-mini",
    maxTokens: 2000,
  });
}

// ===== Backward Compatibility Exports =====

// Re-export for modules still using old imports
export { generateEmbedding as generateOpenAIEmbedding };
export { testOpenAIConnection as testOpenAI };
