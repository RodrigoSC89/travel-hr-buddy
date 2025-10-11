/**
 * OpenAI Service Integration
 * Test chat completion functionality
 */

export interface OpenAITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface GenerateChecklistResult {
  success: boolean;
  items?: string[];
  error?: string;
}

/**
 * Generate checklist items using OpenAI based on a prompt
 */
export async function generateChecklistItems(prompt: string): Promise<GenerateChecklistResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  try {
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
            role: "system",
            content: "You are a helpful assistant that creates detailed checklist items. Generate a list of 5-10 practical, actionable tasks based on the user's description. Return only the task items, one per line, without numbering or bullet points.",
          },
          {
            role: "user",
            content: `Create a checklist for: ${prompt}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      // Split by newlines and filter out empty lines
      const items = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => {
          // Remove common prefixes like "1.", "-", "*", etc.
          return line.replace(/^[\d\-*.)]+\s*/, "");
        });

      return {
        success: true,
        items,
      };
    }

    return {
      success: false,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
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
