/**
 * OpenAI Service Integration
 * Test chat completion functionality and embeddings generation
 */

import { logger } from "@/lib/logger";

export interface OpenAITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate embeddings using OpenAI ada-002 model
 * Used for AI Memory vector similarity search
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    logger.error("OpenAI API key not configured");
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("OpenAI embedding error", new Error(`HTTP ${response.status}`), { errorData, status: response.status });
      return null;
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0].embedding;
    }

    return null;
  } catch (error) {
    logger.error("Exception generating embedding", error as Error, { textLength: text?.length });
    return null;
  }
}

/**
 * Test OpenAI API connectivity
 */
export async function testOpenAIConnection(): Promise<OpenAITestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "OpenAI API key not configured",
      error: "Missing VITE_OPENAI_API_KEY",
    };
  }

  try {
    // Test with a simple chat completion
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say \"API test successful\" if you can read this.",
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
