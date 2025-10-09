/**
 * MarineTraffic Service Integration
 * Test ship location and tracking functionality
 */

export interface MarineTrafficTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}

/**
 * Test MarineTraffic API connectivity
 */
export async function testMarineTrafficConnection(): Promise<MarineTrafficTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_MARINETRAFFIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "MarineTraffic API key not configured",
      error: "Missing VITE_MARINETRAFFIC_API_KEY. Note: MarineTraffic requires paid subscription.",
    };
  }

  try {
    // Test with a simple vessel details endpoint
    // Using a sample MMSI (Maritime Mobile Service Identity)
    const response = await fetch(
      `https://services.marinetraffic.com/api/exportvessel/v:8/${apiKey}/timespan:10/protocol:json`,
      {
        method: "GET",
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `MarineTraffic API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status} - Check if API subscription is active`,
      };
    }

    const data = await response.json();

    // MarineTraffic returns different formats based on subscription
    if (data) {
      return {
        success: true,
        message: "MarineTraffic API connection successful",
        responseTime,
        data: {
          vesselsCount: Array.isArray(data) ? data.length : "N/A",
        },
      };
    }

    return {
      success: false,
      message: "MarineTraffic API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to MarineTraffic API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
