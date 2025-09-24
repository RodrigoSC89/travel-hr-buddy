import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  
  if (!apiKey) {
    throw new Error('Amadeus API key not configured');
  }
  if (!apiSecret) {
    throw new Error('Amadeus API secret not configured');
  }

  const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
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

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get Amadeus token: ${tokenResponse.statusText}`);
  }

  const tokenData: AmadeusToken = await tokenResponse.json();
  
  // Cache the token (subtract 60 seconds for safety)
  tokenCache = {
    token: tokenData.access_token,
    expiresAt: Date.now() + ((tokenData.expires_in - 60) * 1000),
  };

  return tokenData.access_token;
}

async function searchFlights(searchParams: any) {
  const token = await getAmadeusToken();
  
  const params = new URLSearchParams({
    originLocationCode: searchParams.origin,
    destinationLocationCode: searchParams.destination,
    departureDate: searchParams.departureDate,
    adults: searchParams.adults.toString(),
    max: '10', // Limit results
  });

  const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Flight search failed: ${response.statusText}`);
  }

  return await response.json();
}

async function searchHotels(searchParams: any) {
  const token = await getAmadeusToken();
  
  // First, get city code from city name
  const cityResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${encodeURIComponent(searchParams.cityName)}&max=1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!cityResponse.ok) {
    throw new Error(`City search failed: ${cityResponse.statusText}`);
  }

  const cityData = await cityResponse.json();
  if (!cityData.data || cityData.data.length === 0) {
    throw new Error('City not found');
  }

  const cityCode = cityData.data[0].iataCode;

  // Search for hotels in the city
  const params = new URLSearchParams({
    cityCode: cityCode,
    checkInDate: searchParams.checkIn,
    checkOutDate: searchParams.checkOut,
    adults: searchParams.adults.toString(),
    radius: '20',
    radiusUnit: 'KM',
    hotelSource: 'ALL',
  });

  const hotelResponse = await fetch(`https://test.api.amadeus.com/v3/shopping/hotel-offers?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!hotelResponse.ok) {
    throw new Error(`Hotel search failed: ${hotelResponse.statusText}`);
  }

  return await hotelResponse.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchType, ...searchParams } = await req.json()
    
    console.log(`Amadeus ${searchType} search:`, searchParams)
    
    let result;
    
    if (searchType === 'flights') {
      result = await searchFlights(searchParams);
    } else if (searchType === 'hotels') {
      result = await searchHotels(searchParams);
    } else {
      throw new Error('Invalid search type. Use "flights" or "hotels"');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Amadeus search error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})