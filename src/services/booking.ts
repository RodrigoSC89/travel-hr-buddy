/**
 * Booking.com API Service
 * Provides hotel search and accommodation booking
 * 
 * Documentation: https://www.booking.com/affiliate-program
 * Note: This is a simplified implementation. Actual Booking.com API requires
 * partnership approval and may have different endpoint structures.
 */

interface HotelSearchParams {
  cityName?: string;
  cityId?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  currency?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
}

interface HotelOffer {
  id: string;
  name: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  pricePerNight: number;
  deepLink: string;
  images: string[];
  location: {
    lat: number;
    lon: number;
    address: string;
    city: string;
    country: string;
    distance?: number; // Distance from search center in km
  };
  amenities: string[];
  description: string;
  cancellationPolicy: string;
  breakfastIncluded: boolean;
}

interface RoomOffer {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxOccupancy: number;
  beds: Array<{
    type: string;
    count: number;
  }>;
  price: number;
  currency: string;
  cancellationPolicy: string;
  facilities: string[];
  photos: string[];
}

export class BookingService {
  private baseUrl = 'https://distribution-xml.booking.com';
  private affiliateId: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_BOOKING_API_KEY || '';
    this.affiliateId = import.meta.env.VITE_BOOKING_AFFILIATE_ID || '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for hotels
   */
  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    if (!this.isConfigured()) {
      throw new Error('Booking.com API key not configured');
    }

    try {
      // Build search parameters
      const searchParams = new URLSearchParams({
        checkin: params.checkIn,
        checkout: params.checkOut,
        adults: params.adults.toString(),
        children: (params.children || 0).toString(),
        room_qty: (params.rooms || 1).toString(),
        currency: params.currency || 'BRL',
        language: params.language || 'pt',
        ...(params.cityName && { city: params.cityName }),
        ...(params.cityId && { city_id: params.cityId }),
        ...(params.minStars && { min_stars: params.minStars.toString() }),
        ...(params.minPrice && { min_price: params.minPrice.toString() }),
        ...(params.maxPrice && { max_price: params.maxPrice.toString() }),
      });

      // If coordinates provided, use proximity search
      if (params.coordinates) {
        searchParams.append('latitude', params.coordinates.lat.toString());
        searchParams.append('longitude', params.coordinates.lon.toString());
        searchParams.append('radius', '10'); // 10km radius
      }

      const response = await fetch(
        `${this.baseUrl}/2.7/json/hotels?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseHotelResults(data);
    } catch (error) {
      console.error('Booking.com searchHotels error:', error);
      throw error;
    }
  }

  /**
   * Get hotel details by ID
   */
  async getHotelDetails(hotelId: string): Promise<HotelOffer | null> {
    if (!this.isConfigured()) {
      throw new Error('Booking.com API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/2.7/json/hotels/${hotelId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseHotelData(data);
    } catch (error) {
      console.error('Booking.com getHotelDetails error:', error);
      throw error;
    }
  }

  /**
   * Get available rooms for a hotel
   */
  async getAvailableRooms(
    hotelId: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ): Promise<RoomOffer[]> {
    if (!this.isConfigured()) {
      throw new Error('Booking.com API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/2.7/json/hotels/${hotelId}/rooms?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseRoomResults(data, hotelId);
    } catch (error) {
      console.error('Booking.com getAvailableRooms error:', error);
      throw error;
    }
  }

  /**
   * Search hotels by city name
   */
  async searchByCity(
    cityName: string,
    checkIn: string,
    checkOut: string,
    adults: number = 2
  ): Promise<HotelOffer[]> {
    return this.searchHotels({
      cityName,
      checkIn,
      checkOut,
      adults,
    });
  }

  /**
   * Search hotels near coordinates
   */
  async searchNearLocation(
    lat: number,
    lon: number,
    checkIn: string,
    checkOut: string,
    adults: number = 2
  ): Promise<HotelOffer[]> {
    return this.searchHotels({
      coordinates: { lat, lon },
      checkIn,
      checkOut,
      adults,
    });
  }

  /**
   * Get city/destination suggestions (autocomplete)
   */
  async getCitySuggestions(query: string): Promise<Array<{
    id: string;
    name: string;
    country: string;
    type: 'city' | 'region' | 'landmark';
  }>> {
    if (!this.isConfigured()) {
      throw new Error('Booking.com API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/2.7/json/autocomplete?text=${encodeURIComponent(query)}&language=pt`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((item: any) => ({
        id: item.dest_id,
        name: item.label,
        country: item.country,
        type: item.dest_type,
      }));
    } catch (error) {
      console.error('Booking.com getCitySuggestions error:', error);
      throw error;
    }
  }

  /**
   * Generate deep link for hotel booking
   */
  generateDeepLink(hotelId: string, checkIn: string, checkOut: string): string {
    const baseUrl = 'https://www.booking.com/hotel';
    const params = new URLSearchParams({
      hotel_id: hotelId,
      checkin: checkIn,
      checkout: checkOut,
      ...(this.affiliateId && { aid: this.affiliateId }),
    });
    return `${baseUrl}?${params}`;
  }

  /**
   * Parse hotel results into standardized format
   */
  private parseHotelResults(rawResults: any): HotelOffer[] {
    if (!rawResults || !rawResults.result) {
      return [];
    }

    return rawResults.result.map((hotel: any) => this.parseHotelData(hotel));
  }

  /**
   * Parse individual hotel data
   */
  private parseHotelData(hotel: any): HotelOffer {
    return {
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      stars: hotel.class || 0,
      rating: hotel.review_score || 0,
      reviewCount: hotel.review_nr || 0,
      price: hotel.min_total_price || 0,
      currency: hotel.currency_code || 'BRL',
      pricePerNight: hotel.price || 0,
      deepLink: this.generateDeepLink(
        hotel.hotel_id,
        hotel.checkin,
        hotel.checkout
      ),
      images: hotel.main_photo_url ? [hotel.main_photo_url] : [],
      location: {
        lat: parseFloat(hotel.latitude),
        lon: parseFloat(hotel.longitude),
        address: hotel.address,
        city: hotel.city,
        country: hotel.country_trans,
        distance: hotel.distance ? parseFloat(hotel.distance) : undefined,
      },
      amenities: hotel.hotel_facilities || [],
      description: hotel.hotel_description || '',
      cancellationPolicy: hotel.cancellation_type || 'standard',
      breakfastIncluded: hotel.is_free_cancellable === '1',
    };
  }

  /**
   * Parse room results
   */
  private parseRoomResults(rawResults: any, hotelId: string): RoomOffer[] {
    if (!rawResults || !rawResults.rooms) {
      return [];
    }

    return rawResults.rooms.map((room: any) => ({
      id: room.room_id,
      hotelId: hotelId,
      name: room.room_name,
      description: room.room_info,
      maxOccupancy: room.max_persons || 2,
      beds: room.bed_configurations || [],
      price: room.min_price,
      currency: room.currency_code,
      cancellationPolicy: room.cancellation_type,
      facilities: room.room_facilities || [],
      photos: room.photos || [],
    }));
  }

  /**
   * Calculate nights between dates
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Filter hotels by price range
   */
  filterByPrice(hotels: HotelOffer[], minPrice: number, maxPrice: number): HotelOffer[] {
    return hotels.filter(hotel => hotel.price >= minPrice && hotel.price <= maxPrice);
  }

  /**
   * Sort hotels by rating
   */
  sortByRating(hotels: HotelOffer[], ascending: boolean = false): HotelOffer[] {
    return [...hotels].sort((a, b) => 
      ascending ? a.rating - b.rating : b.rating - a.rating
    );
  }

  /**
   * Sort hotels by price
   */
  sortByPrice(hotels: HotelOffer[], ascending: boolean = true): HotelOffer[] {
    return [...hotels].sort((a, b) => 
      ascending ? a.price - b.price : b.price - a.price
    );
  }
}

// Export singleton instance
export const bookingService = new BookingService();
