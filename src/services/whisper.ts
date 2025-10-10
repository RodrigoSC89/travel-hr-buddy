/**
 * Whisper (OpenAI) Service Integration
 * Test audio transcription functionality
 */

export interface WhisperTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Whisper API connectivity
 * Note: This only tests API key validity as audio transcription requires actual audio data
 */
export async function testWhisperConnection(): Promise<WhisperTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "OpenAI API key not configured (Whisper uses OpenAI key)",
      error: "Missing VITE_OPENAI_API_KEY",
    };
  }

  try {
    // Test by checking models endpoint - Whisper uses same OpenAI key
    const response = await fetch("https://api.openai.com/v1/models/whisper-1", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `Whisper API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: errorData.error?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.id === "whisper-1") {
      return {
        success: true,
        message: "Whisper API connection successful",
        responseTime,
        data: {
          model: data.id,
          owned_by: data.owned_by,
        },
      };
    }

    return {
      success: false,
      message: "Whisper API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Whisper API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
