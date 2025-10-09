/**
 * Skyscanner API Service
 * Test and interact with Skyscanner API for flight search
 * Note: Skyscanner's RapidAPI integration is commonly used
 */

export interface SkyscannerTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Skyscanner API connection
 * Note: Skyscanner is typically accessed through RapidAPI
 */
export async function testSkyscanner(): Promise<SkyscannerTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_SKYSCANNER_API_KEY;
    const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    
    if (!apiKey && !rapidApiKey) {
      return {
        success: false,
        error: 'Skyscanner API key or RapidAPI key not configured',
      };
    }

    // Test with markets endpoint via RapidAPI
    const response = await fetch(
      'https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/markets',
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey || apiKey || '',
          'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
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
      message: 'Skyscanner API is connected via RapidAPI',
      data: {
        marketsAvailable: data.markets?.length || 0,
        sampleMarkets: data.markets?.slice(0, 3).map((m: any) => m.code) || [],
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
 * Search for flight quotes
 * This is a basic implementation - actual Skyscanner API has more complex endpoints
 */
export async function searchFlights(
  origin: string,
  destination: string,
  departDate: string
) {
  const apiKey = import.meta.env.VITE_SKYSCANNER_API_KEY;
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!apiKey && !rapidApiKey) {
    throw new Error('Skyscanner API key or RapidAPI key not configured');
  }

  // Note: This is a simplified version. Actual implementation would need proper endpoints
  const response = await fetch(
    `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`,
    {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': rapidApiKey || apiKey || '',
        'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          market: 'US',
          locale: 'en-US',
          currency: 'USD',
          queryLegs: [
            {
              originPlaceId: { iata: origin },
              destinationPlaceId: { iata: destination },
              date: { year: 2024, month: 1, day: 15 },
            },
          ],
          adults: 1,
          cabinClass: 'CABIN_CLASS_ECONOMY',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Skyscanner API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
