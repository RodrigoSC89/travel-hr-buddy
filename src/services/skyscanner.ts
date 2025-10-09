/**
 * Skyscanner Service Integration
 * Test flight search functionality
 */

export interface SkyscannerTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}

export interface SkyscannerTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
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
      message: 'Skyscanner API key not configured',
      error: 'Missing VITE_RAPIDAPI_KEY or VITE_SKYSCANNER_API_KEY. Note: Skyscanner typically requires RapidAPI subscription.',
    };
  }

  try {
    // Test with a simple markets endpoint
    const response = await fetch('https://skyscanner-api.p.rapidapi.com/v3/markets', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
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
        message: 'Skyscanner API connection successful',
        responseTime,
        data: {
          marketsCount: Array.isArray(data) ? data.length : 'N/A',
        },
      };
    }

    return {
      success: false,
      message: 'Skyscanner API returned unexpected data',
      responseTime,
      error: 'Invalid response format',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to Skyscanner API',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Skyscanner API connection (simplified version for API test panel)
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
