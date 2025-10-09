/**
 * Amadeus API Service
 * Provides travel booking and flight information
 */

export interface AmadeusTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Test Amadeus API connection
 */
export async function testAmadeus(): Promise<AmadeusTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
    const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Amadeus API key not configured'
      };
    }

    // Get access token first
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');
    tokenParams.append('client_id', apiKey);
    if (apiSecret) {
      tokenParams.append('client_secret', apiSecret);
    }

    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      return {
        success: false,
        error: `Authentication failed: ${tokenResponse.status} ${tokenResponse.statusText}`
      };
    }

    const tokenData: AmadeusTokenResponse = await tokenResponse.json();

    // Test with a simple location search
    const response = await fetch(
      'https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=LON&page[limit]=1',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
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
      message: 'Amadeus API is working correctly',
      data: {
        locationsFound: data.data?.length || 0,
        tokenExpires: `${tokenData.expires_in}s`
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
 * Get Amadeus API status
 */
export function getAmadeusStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_AMADEUS_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
