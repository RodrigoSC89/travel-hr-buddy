/**
 * Amadeus Travel API Service
 * Test and interact with Amadeus API for travel data
 */

export interface AmadeusTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: AmadeusToken | null = null;
let tokenExpiry: number = 0;

/**
 * Get Amadeus access token
 */
async function getAccessToken(): Promise<string> {
  const apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
  const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken.access_token;
  }

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  const data: AmadeusToken = await response.json();
  cachedToken = data;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

  return data.access_token;
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
        error: 'Amadeus API key not configured',
      };
    }

    if (!apiSecret) {
      return {
        success: false,
        error: 'Amadeus API secret not configured',
      };
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Test with airport search endpoint
    const response = await fetch(
      'https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=RIO&page[limit]=1',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Amadeus API is connected and authenticated',
      data: {
        testQuery: 'RIO airports',
        resultCount: data.data?.length || 0,
        sampleResult: data.data?.[0]?.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Search for airports by keyword
 */
export async function searchAirports(keyword: string, limit: number = 10) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}&page[limit]=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
