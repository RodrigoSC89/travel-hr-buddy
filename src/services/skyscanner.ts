/**
 * Skyscanner API Service
 * Provides flight search and price comparison
 * 
 * Documentation: https://partners.skyscanner.net/
 * Note: This is a simplified implementation. Actual Skyscanner API may require
 * additional authentication steps and different endpoint structures.
 */

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
  locale?: string;
}

interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  deepLink: string;
  carrier: {
    id: string;
    name: string;
    logo?: string;
  };
  outbound: {
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops: number;
    origin: string;
    destination: string;
  };
  inbound?: {
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops: number;
    origin: string;
    destination: string;
  };
}

interface PriceAlert {
  id: string;
  route: string;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export class SkyscannerService {
  private baseUrl = 'https://partners.api.skyscanner.net';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_SKYSCANNER_API_KEY || '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for flights
   * Note: This is a simplified implementation. Real Skyscanner API uses a polling mechanism.
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    if (!this.isConfigured()) {
      throw new Error('Skyscanner API key not configured');
    }

    try {
      // Build search query
      const tripType = params.returnDate ? 'return' : 'oneway';
      const cabinClass = params.cabinClass || 'economy';
      const currency = params.currency || 'BRL';
      const locale = params.locale || 'pt-BR';

      // Create session
      const sessionResponse = await fetch(
        `${this.baseUrl}/apiservices/pricing/v1.0`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': this.apiKey,
          },
          body: new URLSearchParams({
            country: 'BR',
            currency: currency,
            locale: locale,
            originPlace: params.origin,
            destinationPlace: params.destination,
            outboundDate: params.departureDate,
            ...(params.returnDate && { inboundDate: params.returnDate }),
            adults: params.adults.toString(),
            children: (params.children || 0).toString(),
            infants: (params.infants || 0).toString(),
            cabinClass: cabinClass,
          }),
        }
      );

      if (!sessionResponse.ok) {
        throw new Error(`Skyscanner API error: ${sessionResponse.statusText}`);
      }

      // Get session location from headers
      const sessionUrl = sessionResponse.headers.get('Location');
      if (!sessionUrl) {
        throw new Error('No session URL returned');
      }

      // Poll for results (simplified - in production, implement proper polling)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const resultsResponse = await fetch(sessionUrl, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
        },
      });

      if (!resultsResponse.ok) {
        throw new Error(`Failed to fetch results: ${resultsResponse.statusText}`);
      }

      const results = await resultsResponse.json();
      return this.parseFlightResults(results);
    } catch (error) {
      console.error('Skyscanner searchFlights error:', error);
      throw error;
    }
  }

  /**
   * Get price calendar for flexible dates
   */
  async getPriceCalendar(
    origin: string,
    destination: string,
    departureMonth: string
  ): Promise<Record<string, number>> {
    if (!this.isConfigured()) {
      throw new Error('Skyscanner API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/apiservices/browsedates/v1.0/BR/BRL/pt-BR/${origin}/${destination}/${departureMonth}`,
        {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Skyscanner API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Build calendar with prices
      const calendar: Record<string, number> = {};
      
      if (data.Dates) {
        data.Dates.forEach((dateInfo: any) => {
          calendar[dateInfo.OutboundDate] = dateInfo.MinPrice;
        });
      }

      return calendar;
    } catch (error) {
      console.error('Skyscanner getPriceCalendar error:', error);
      throw error;
    }
  }

  /**
   * Get price trends and predictions
   */
  async getPriceTrends(
    origin: string,
    destination: string
  ): Promise<{
    currentAverage: number;
    trend: 'up' | 'down' | 'stable';
    recommendation: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Skyscanner API key not configured');
    }

    try {
      // This is a mock implementation. Real API might have a dedicated endpoint.
      const calendar = await this.getPriceCalendar(origin, destination, 'anytime');
      const prices = Object.values(calendar);
      
      if (prices.length === 0) {
        return {
          currentAverage: 0,
          trend: 'stable',
          recommendation: 'Dados insuficientes para análise de tendência',
        };
      }

      const currentAverage = prices.reduce((a, b) => a + b, 0) / prices.length;
      const recentPrices = prices.slice(-7);
      const olderPrices = prices.slice(0, -7);
      
      const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
      
      let trend: 'up' | 'down' | 'stable';
      let recommendation: string;
      
      if (recentAvg > olderAvg * 1.1) {
        trend = 'up';
        recommendation = 'Preços em alta. Considere comprar logo para evitar aumentos.';
      } else if (recentAvg < olderAvg * 0.9) {
        trend = 'down';
        recommendation = 'Preços em queda. Aguarde mais alguns dias para melhores ofertas.';
      } else {
        trend = 'stable';
        recommendation = 'Preços estáveis. Bom momento para comprar.';
      }

      return {
        currentAverage,
        trend,
        recommendation,
      };
    } catch (error) {
      console.error('Skyscanner getPriceTrends error:', error);
      throw error;
    }
  }

  /**
   * Create price alert
   */
  async createPriceAlert(params: {
    origin: string;
    destination: string;
    departureDate: string;
    targetPrice: number;
    email: string;
  }): Promise<PriceAlert> {
    if (!this.isConfigured()) {
      throw new Error('Skyscanner API key not configured');
    }

    // This is a mock implementation as real Skyscanner alerts might work differently
    return {
      id: `alert_${Date.now()}`,
      route: `${params.origin}-${params.destination}`,
      currentPrice: 0, // Would be fetched from current search
      targetPrice: params.targetPrice,
      currency: 'BRL',
      trend: 'stable',
      confidence: 0.8,
    };
  }

  /**
   * Parse flight results into standardized format
   */
  private parseFlightResults(rawResults: any): FlightOffer[] {
    const offers: FlightOffer[] = [];

    if (!rawResults.Itineraries || !rawResults.Legs) {
      return offers;
    }

    rawResults.Itineraries.forEach((itinerary: any) => {
      const outboundLeg = rawResults.Legs.find((leg: any) => leg.Id === itinerary.OutboundLegId);
      const inboundLeg = itinerary.InboundLegId 
        ? rawResults.Legs.find((leg: any) => leg.Id === itinerary.InboundLegId)
        : null;

      const carrier = rawResults.Carriers.find((c: any) => c.Id === outboundLeg.Carriers[0]);

      offers.push({
        id: itinerary.OutboundLegId + (itinerary.InboundLegId || ''),
        price: itinerary.PricingOptions[0].Price,
        currency: rawResults.Query.Currency,
        deepLink: itinerary.PricingOptions[0].DeeplinkUrl,
        carrier: {
          id: carrier.Id,
          name: carrier.Name,
          logo: carrier.ImageUrl,
        },
        outbound: {
          departureTime: outboundLeg.Departure,
          arrivalTime: outboundLeg.Arrival,
          duration: outboundLeg.Duration,
          stops: outboundLeg.Stops.length,
          origin: outboundLeg.OriginStation,
          destination: outboundLeg.DestinationStation,
        },
        ...(inboundLeg && {
          inbound: {
            departureTime: inboundLeg.Departure,
            arrivalTime: inboundLeg.Arrival,
            duration: inboundLeg.Duration,
            stops: inboundLeg.Stops.length,
            origin: inboundLeg.OriginStation,
            destination: inboundLeg.DestinationStation,
          },
        }),
      });
    });

    return offers;
  }

  /**
   * Get airport/city suggestions (autocomplete)
   */
  async getLocationSuggestions(query: string): Promise<Array<{
    id: string;
    name: string;
    type: 'airport' | 'city';
    country: string;
  }>> {
    if (!this.isConfigured()) {
      throw new Error('Skyscanner API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/apiservices/autosuggest/v1.0/BR/BRL/pt-BR?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Skyscanner API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.Places.map((place: any) => ({
        id: place.PlaceId,
        name: place.PlaceName,
        type: place.PlaceId.includes('-sky') ? 'airport' : 'city',
        country: place.CountryName,
      }));
    } catch (error) {
      console.error('Skyscanner getLocationSuggestions error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const skyscannerService = new SkyscannerService();
