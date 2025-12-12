/**
 * PATCH 608: Booking.com Service Integration
 * Hotel search functionality with RapidAPI integration
 */

export interface BookingTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  rooms?: number;
}

export interface HotelOffer {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating?: number;
  reviewScore?: number;
  location: string;
  imageUrl?: string;
  deepLink?: string;
}

export interface HotelSearchResult {
  success: boolean;
  offers: HotelOffer[];
  cached?: boolean;
  error?: string;
}

/**
 * Booking.com API Response Types
 */
interface BookingDestination {
  dest_id: string;
  dest_type: string;
  name: string;
}

interface BookingHotel {
  hotel_id: string;
  hotel_name: string;
  min_total_price?: number;
  price_breakdown?: {
    gross_price?: {
      value?: number;
    };
  };
  currency_code?: string;
  class?: number;
  review_score?: number;
  address?: string;
  main_photo_url?: string;
  url?: string;
}

interface BookingSearchResponse {
  result?: BookingHotel[];
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

/**
 * Search for hotels using Booking.com API
 * Implements caching to avoid rate limits
 */
export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResult> {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_BOOKING_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      offers: [],
      error: "API key not configured. Set VITE_RAPIDAPI_KEY or VITE_BOOKING_API_KEY.",
    };
  }

  // Check cache first
  const cacheKey = `booking_${JSON.stringify(params)}`;
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
      destination,
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      rooms = 1,
    } = params;

    // First, get destination ID
    const destResponse = await fetch(
      `https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${encodeURIComponent(destination)}&locale=pt-br`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
        },
      }
    );

    if (!destResponse.ok) {
      return {
        success: false,
        offers: [],
        error: `Failed to fetch destination: ${destResponse.status}`,
      };
    }

    const destData: BookingDestination[] = await destResponse.json();
    const destId = destData[0]?.dest_id;

    if (!destId) {
      return {
        success: false,
        offers: [],
        error: "Destination not found",
      };
    }

    // Search hotels
    const searchUrl = new URL("https://booking-com.p.rapidapi.com/v1/hotels/search");
    searchUrl.searchParams.append("dest_id", destId);
    searchUrl.searchParams.append("dest_type", "city");
    searchUrl.searchParams.append("checkin_date", checkIn);
    searchUrl.searchParams.append("checkout_date", checkOut);
    searchUrl.searchParams.append("adults_number", adults.toString());
    searchUrl.searchParams.append("children_number", children.toString());
    searchUrl.searchParams.append("room_number", rooms.toString());
    searchUrl.searchParams.append("locale", "pt-br");
    searchUrl.searchParams.append("currency", "BRL");
    searchUrl.searchParams.append("order_by", "popularity");

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        offers: [],
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data: BookingSearchResponse = await response.json();
    
    // Parse Booking.com response
    const offers: HotelOffer[] = [];
    
    if (data.result) {
      data.result.forEach((hotel: BookingHotel) => {
        offers.push({
          id: hotel.hotel_id,
          name: hotel.hotel_name,
          price: hotel.min_total_price || hotel.price_breakdown?.gross_price?.value || 0,
          currency: hotel.currency_code || "BRL",
          rating: hotel.class || 0,
          reviewScore: hotel.review_score || 0,
          location: hotel.address || destination,
          imageUrl: hotel.main_photo_url,
          deepLink: hotel.url,
        });
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
    };
  } catch (error) {
    return {
      success: false,
      offers: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
