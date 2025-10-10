/**
 * Booking.com Service Integration
 * Test hotel search functionality
 */

export interface BookingTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Booking.com API connectivity
 * Note: Booking.com requires RapidAPI key or official API access
 */
export async function testBookingConnection(): Promise<BookingTestResult> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_BOOKING_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "Booking.com API key not configured",
      error: "Missing VITE_RAPIDAPI_KEY or VITE_BOOKING_API_KEY. Note: Booking.com typically requires RapidAPI subscription.",
    };
  }

  try {
    // Test with a simple locations endpoint
    const response = await fetch(
      "https://booking-com.p.rapidapi.com/v1/static/countries?locale=en-us",
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
        },
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `Booking.com API error: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status} - Check if RapidAPI subscription is active`,
      };
    }

    const data = await response.json();

    if (data) {
      return {
        success: true,
        message: "Booking.com API connection successful",
        responseTime,
        data: {
          countriesCount: Array.isArray(data) ? data.length : "N/A",
        },
      };
    }

    return {
      success: false,
      message: "Booking.com API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Booking.com API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
