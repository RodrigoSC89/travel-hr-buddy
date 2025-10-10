/**
 * Skyscanner Service Integration
 * Test flight search functionality
 */

export interface SkyscannerTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Skyscanner API connectivity
 * Note: Skyscanner requires RapidAPI key
 */
export async function testSkyscannerConnection(): Promise<SkyscannerTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_SKYSCANNER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "Skyscanner API key not configured",
      error:
        "Missing VITE_RAPIDAPI_KEY or VITE_SKYSCANNER_API_KEY. Note: Skyscanner typically requires RapidAPI subscription.",
    };
  }

  try {
    // Test with a simple markets endpoint
    const response = await fetch("https://skyscanner-api.p.rapidapi.com/v3/markets", {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `Skyscanner API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status} - Check if RapidAPI subscription is active`,
      };
    }

    const data = await response.json();

    if (data) {
      return {
        success: true,
        message: "Skyscanner API connection successful",
        responseTime,
        data: {
          marketsCount: Array.isArray(data) ? data.length : "N/A",
        },
      };
    }

    return {
      success: false,
      message: "Skyscanner API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Skyscanner API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
