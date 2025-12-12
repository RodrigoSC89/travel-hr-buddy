/**
 * PATCH 608: Skyscanner Service Integration
 * Flight search functionality with RapidAPI integration
 */

import { logger } from "@/lib/logger";

export interface SkyscannerTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  cabinClass?: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  deepLink?: string;
}

export interface FlightSearchResult {
  success: boolean;
  offers: FlightOffer[];
  cached?: boolean;
  error?: string;
}

/**
 * Skyscanner API v3 Response Types
 */
interface SkyscannerItinerary {
  id: string;
  legs?: Array<{
    carriers?: {
      marketing?: Array<{ name: string }>;
    };
    durationInMinutes?: number;
    stopCount?: number;
    departure?: string;
    arrival?: string;
  }>;
  pricingOptions?: Array<{
    price: {
      amount: number;
      unit: string;
    };
    items?: Array<{
      deepLink?: string;
    }>;
  }>;
}

interface SkyscannerSearchResponse {
  content?: {
    results?: {
      itineraries?: Record<string, SkyscannerItinerary>;
    };
  };
}

/**
 * Helper function to parse date string into components
 */
function parseDateToComponents(dateString: string): { year: number; month: number; day: number } | null {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    logger.error("Invalid date format. Expected YYYY-MM-DD", new Error("Invalid date format"), { dateString });
    return null;
  }
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    logger.error("Invalid date components", new Error("Invalid date components"), { year, month, day });
    return null;
  }
  
  return { year, month, day };
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
      message: "Skyscanner API key not configured",
      error: "Missing VITE_RAPIDAPI_KEY or VITE_SKYSCANNER_API_KEY. Note: Skyscanner typically requires RapidAPI subscription.",
    };
  }

  try {
    // Test with a simple markets endpoint
    const response = await fetch("https://skyscanner-api.p.rapidapi.com/v3/markets", {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
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
        message: "Skyscanner API connection successful",
        responseTime,
        data: {
          marketsCount: Array.isArray(data) ? data.length : "N/A",
        },
      };
    }

    return {
      success: false,
      message: "Skyscanner API returned unexpected data",
      responseTime,
      error: "Invalid response format",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Skyscanner API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search for flights using Skyscanner API
 * Implements caching to avoid rate limits
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_SKYSCANNER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      offers: [],
      error: "API key not configured. Set VITE_RAPIDAPI_KEY or VITE_SKYSCANNER_API_KEY.",
    };
  }

  // Check cache first
  const cacheKey = `skyscanner_${JSON.stringify(params)}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const cachedData = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        return {
          success: true,
          offers: cachedData.offers,
          cached: true,
        };
      }
    } catch {
      // Invalid cache, continue with API call
    }
  }

  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      cabinClass = "economy",
    } = params;

    // Using Skyscanner API v3 search endpoint
    const searchUrl = "https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create";
    
    const requestBody = {
      query: {
        market: "BR",
        locale: "pt-BR",
        currency: "BRL",
        queryLegs: [] as Array<{
          originPlaceId: { iata: string };
          destinationPlaceId: { iata: string };
          date: { year: number; month: number; day: number };
        }>,
        cabinClass: cabinClass.toUpperCase(),
        adults,
        children,
      },
    };

    const departureComponents = parseDateToComponents(departureDate);
    if (!departureComponents) {
      return {
        success: false,
        offers: [],
        error: "Invalid departure date format. Use YYYY-MM-DD.",
      };
    }

    requestBody.query.queryLegs.push({
      originPlaceId: { iata: origin },
      destinationPlaceId: { iata: destination },
      date: departureComponents,
    });

    if (returnDate) {
      const returnComponents = parseDateToComponents(returnDate);
      if (!returnComponents) {
        return {
          success: false,
          offers: [],
          error: "Invalid return date format. Use YYYY-MM-DD.",
        });
      }
      
      requestBody.query.queryLegs.push({
        originPlaceId: { iata: destination },
        destinationPlaceId: { iata: origin },
        date: returnComponents,
      });
    }

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        success: false,
        offers: [],
        error: `API error: ${response.status} ${response.statusText}`,
      });
    }

    const data: SkyscannerSearchResponse = await response.json();
    
    // Parse Skyscanner response
    const offers: FlightOffer[] = [];
    
    if (data.content?.results?.itineraries) {
      Object.values(data.content.results.itineraries).forEach((itinerary: SkyscannerItinerary) => {
        if (itinerary.pricingOptions && itinerary.pricingOptions.length > 0) {
          const pricing = itinerary.pricingOptions[0];
          offers.push({
            id: itinerary.id,
            airline: itinerary.legs?.[0]?.carriers?.marketing?.[0]?.name || "Unknown",
            price: pricing.price.amount,
            currency: pricing.price.unit,
            duration: itinerary.legs?.[0]?.durationInMinutes ? `${Math.floor(itinerary.legs[0].durationInMinutes / 60)}h ${itinerary.legs[0].durationInMinutes % 60}m` : "N/A",
            stops: itinerary.legs?.[0]?.stopCount || 0,
            departureTime: itinerary.legs?.[0]?.departure || "",
            arrivalTime: itinerary.legs?.[0]?.arrival || "",
            deepLink: pricing.items?.[0]?.deepLink,
          });
        }
      });
    }

    // Cache the result
    sessionStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      offers,
    }));

    return {
      success: true,
      offers,
      cached: false,
    });
  } catch (error) {
    return {
      success: false,
      offers: [],
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
