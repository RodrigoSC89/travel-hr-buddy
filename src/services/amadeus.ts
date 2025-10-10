/**
 * Amadeus Service Integration
 * Test travel and flight data API
 */

export interface AmadeusTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Amadeus API connectivity
 * Amadeus requires OAuth2 authentication with client_credentials flow
 */
export async function testAmadeusConnection(): Promise<AmadeusTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
  const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      message: "Amadeus API credentials not configured",
      error: "Missing VITE_AMADEUS_API_KEY or VITE_AMADEUS_API_SECRET",
    };
  }

  try {
    // Test OAuth2 token endpoint
    const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Check for specific error types
      let errorMessage = `HTTP ${response.status}`;
      if (response.status === 401) {
        errorMessage = "Invalid API credentials - unauthorized";
      } else if (response.status === 403) {
        errorMessage = "API credentials expired or forbidden";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded";
      }

      return {
        success: false,
        message: `Amadeus API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: errorData.error_description || errorMessage,
      };
    }

    const data = await response.json();

    if (data.access_token) {
      return {
        success: true,
        message: "Amadeus API connection successful",
        responseTime,
        data: {
          token_type: data.token_type,
          expires_in: `${data.expires_in}s`,
          state: data.state || "authenticated",
        },
      };
    }

    return {
      success: false,
      message: "Amadeus API returned unexpected data",
      responseTime,
      error: "Invalid response format - missing access_token",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Amadeus API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
