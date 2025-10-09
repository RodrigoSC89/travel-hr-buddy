/**
 * Skyscanner API Service
 * Provides flight search and comparison
 */

export interface SkyscannerTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Skyscanner API connection
 */
export async function testSkyscanner(): Promise<SkyscannerTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_SKYSCANNER_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Skyscanner API key not configured'
      };
    }

    // Test with a simple markets request
    const response = await fetch(
      'https://partners.api.skyscanner.net/apiservices/reference/v1.0/countries/en-US',
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Skyscanner API is working correctly',
      data: {
        countriesAvailable: data.Countries?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get Skyscanner API status
 */
export function getSkyscannerStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_SKYSCANNER_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
