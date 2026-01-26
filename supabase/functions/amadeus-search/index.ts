/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { edgeLogger } from "../_shared/edge-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}

interface HotelSearchParams {
  cityName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}

interface SearchRequest {
  searchType: "flights" | "hotels";
  origin?: string;
  destination?: string;
  departureDate?: string;
  cityName?: string;
  checkIn?: string;
  checkOut?: string;
  adults: number;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
  
  if (!apiKey) {
    throw new Error("Amadeus API key not configured");
  }
  if (!apiSecret) {
    throw new Error("Amadeus API secret not configured");
  }

  let lastError: Error | null = null;
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const tokenResponse = await fetch("https://api.amadeus.com/v1/security/oauth2/token", {
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

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get Amadeus token: ${tokenResponse.statusText}`);
      }

      const tokenData: AmadeusToken = await tokenResponse.json();
      
      tokenCache = {
        token: tokenData.access_token,
        expiresAt: Date.now() + ((tokenData.expires_in - 60) * 1000),
      };

      return tokenData.access_token;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      edgeLogger.warn("amadeus-search", `Token fetch attempt ${attempt + 1} failed`, { error: lastError.message });
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error("Failed to get Amadeus token after retries");
}

async function searchFlights(searchParams: FlightSearchParams): Promise<unknown> {
  const token = await getAmadeusToken();
  
  const params = new URLSearchParams({
    originLocationCode: searchParams.origin,
    destinationLocationCode: searchParams.destination,
    departureDate: searchParams.departureDate,
    adults: searchParams.adults.toString(),
    max: "10",
  });

  const response = await fetch(`https://api.amadeus.com/v2/shopping/flight-offers?${params}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Flight search failed: ${response.statusText}`);
  }

  return await response.json();
}

async function searchHotels(searchParams: HotelSearchParams): Promise<unknown> {
  const token = await getAmadeusToken();
  
  const cityResponse = await fetch(`https://api.amadeus.com/v1/reference-data/locations/cities?keyword=${encodeURIComponent(searchParams.cityName)}&max=1`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!cityResponse.ok) {
    throw new Error(`City search failed: ${cityResponse.statusText}`);
  }

  const cityData = await cityResponse.json();
  if (!cityData.data || cityData.data.length === 0) {
    throw new Error("City not found");
  }

  const cityCode = cityData.data[0].iataCode;

  const params = new URLSearchParams({
    cityCode: cityCode,
    checkInDate: searchParams.checkIn,
    checkOutDate: searchParams.checkOut,
    adults: searchParams.adults.toString(),
    radius: "20",
    radiusUnit: "KM",
    hotelSource: "ALL",
  });

  const hotelResponse = await fetch(`https://api.amadeus.com/v3/shopping/hotel-offers?${params}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!hotelResponse.ok) {
    throw new Error(`Hotel search failed: ${hotelResponse.statusText}`);
  }

  return await hotelResponse.json();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: SearchRequest = await req.json();
    const { searchType, ...searchParams } = requestData;
    
    edgeLogger.info("amadeus-search", `Processing ${searchType} search`, searchParams);
    
    let result: unknown;
    
    if (searchType === "flights") {
      result = await searchFlights(searchParams as FlightSearchParams);
    } else if (searchType === "hotels") {
      result = await searchHotels(searchParams as HotelSearchParams);
    } else {
      throw new Error("Invalid search type. Use \"flights\" or \"hotels\"");
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    edgeLogger.error("amadeus-search", "Search failed", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: "Check function logs for more details"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
