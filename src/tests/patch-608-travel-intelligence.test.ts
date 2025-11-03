import { describe, it, expect, vi } from 'vitest';
import { 
  buildGoogleFlightsLink, 
  buildLatamLink, 
  buildGolLink,
  buildAzulLink,
  buildMaxMilhasLink,
  generateAllFlightLinks,
  type FlightSearchParams 
} from '@/lib/travel/deepLinkBuilder';

describe('PATCH 608 - Deep Link Builder', () => {
  const mockFlightParams: FlightSearchParams = {
    origin: 'GRU',
    destination: 'MRS',
    departureDate: '2025-03-10',
    returnDate: '2025-03-17',
    adults: 1,
    children: 0,
    cabinClass: 'economy',
  };

  describe('buildGoogleFlightsLink', () => {
    it('should build valid Google Flights URL', () => {
      const url = buildGoogleFlightsLink(mockFlightParams);
      expect(url).toContain('google.com/travel/flights');
      expect(url).toContain('GRU');
      expect(url).toContain('MRS');
    });

    it('should handle one-way flights', () => {
      const params = { ...mockFlightParams, returnDate: undefined };
      const url = buildGoogleFlightsLink(params);
      expect(url).toContain('google.com/travel/flights');
      expect(url).not.toContain('returning');
    });
  });

  describe('buildLatamLink', () => {
    it('should build valid LATAM URL with UTM parameters', () => {
      const url = buildLatamLink(mockFlightParams);
      expect(url).toContain('latamairlines.com');
      expect(url).toContain('origin=GRU');
      expect(url).toContain('destination=MRS');
      expect(url).toContain('utm_source=travel-hr-buddy');
      expect(url).toContain('utm_medium=deeplink');
    });

    it('should handle cabin class mapping', () => {
      const businessParams = { ...mockFlightParams, cabinClass: 'business' as const };
      const url = buildLatamLink(businessParams);
      expect(url).toContain('cabin=Business');
    });
  });

  describe('buildGolLink', () => {
    it('should build valid GOL URL', () => {
      const url = buildGolLink(mockFlightParams);
      expect(url).toContain('voegol.com.br');
      expect(url).toContain('originCode=GRU');
      expect(url).toContain('destinationCode=MRS');
    });
  });

  describe('buildAzulLink', () => {
    it('should build valid AZUL URL', () => {
      const url = buildAzulLink(mockFlightParams);
      expect(url).toContain('voeazul.com.br');
      expect(url).toContain('from=GRU');
      expect(url).toContain('to=MRS');
    });
  });

  describe('buildMaxMilhasLink', () => {
    it('should build valid MaxMilhas URL', () => {
      const url = buildMaxMilhasLink(mockFlightParams);
      expect(url).toContain('maxmilhas.com.br');
      expect(url).toContain('origem=GRU');
      expect(url).toContain('destino=MRS');
    });
  });

  describe('generateAllFlightLinks', () => {
    it('should generate all deep links', () => {
      const links = generateAllFlightLinks(mockFlightParams);
      expect(links).toHaveProperty('googleFlights');
      expect(links).toHaveProperty('latam');
      expect(links).toHaveProperty('gol');
      expect(links).toHaveProperty('azul');
      expect(links).toHaveProperty('maxmilhas');
      
      // Verify all links are valid URLs
      Object.values(links).forEach(link => {
        expect(() => new URL(link)).not.toThrow();
      });
    });
  });
});

describe('PATCH 608 - LLM Flight Advisor', () => {
  const { analyzeFlightOffers } = await import('@/lib/travel/LLMFlightAdvisor');
  const { FlightOffer } = await import('@/services/skyscanner');

  const mockOffers: FlightOffer[] = [
    {
      id: '1',
      airline: 'LATAM',
      price: 1500,
      currency: 'BRL',
      duration: '2h 30m',
      stops: 0,
      departureTime: '10:00',
      arrivalTime: '12:30',
    },
    {
      id: '2',
      airline: 'GOL',
      price: 1200,
      currency: 'BRL',
      duration: '3h 15m',
      stops: 1,
      departureTime: '08:00',
      arrivalTime: '11:15',
    },
    {
      id: '3',
      airline: 'AZUL',
      price: 1350,
      currency: 'BRL',
      duration: '2h 45m',
      stops: 0,
      departureTime: '14:00',
      arrivalTime: '16:45',
    },
  ];

  describe('analyzeFlightOffers', () => {
    it('should identify best price offer', async () => {
      const result = await analyzeFlightOffers(mockOffers);
      expect(result.bestPrice).toBeDefined();
      expect(result.bestPrice?.price).toBe(1200);
      expect(result.bestPrice?.airline).toBe('GOL');
    });

    it('should identify best duration offer', async () => {
      const result = await analyzeFlightOffers(mockOffers);
      expect(result.bestDuration).toBeDefined();
      expect(result.bestDuration?.duration).toBe('2h 30m');
    });

    it('should provide recommendation', async () => {
      const result = await analyzeFlightOffers(mockOffers);
      expect(result.recommended).toBeDefined();
      expect(result.reasoning).toBeTruthy();
      expect(typeof result.reasoning).toBe('string');
    });

    it('should generate insights', async () => {
      const result = await analyzeFlightOffers(mockOffers);
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should handle empty offers', async () => {
      const result = await analyzeFlightOffers([]);
      expect(result.bestPrice).toBeNull();
      expect(result.bestDuration).toBeNull();
      expect(result.recommended).toBeNull();
      expect(result.reasoning).toContain('No flight offers');
    });

    it('should respect user preferences for price', async () => {
      const result = await analyzeFlightOffers(mockOffers, { priorityPrice: true });
      expect(result.recommended?.id).toBe(result.bestPrice?.id);
    });

    it('should respect user preferences for speed', async () => {
      const result = await analyzeFlightOffers(mockOffers, { prioritySpeed: true });
      expect(result.recommended?.id).toBe(result.bestDuration?.id);
    });
  });
});

describe('PATCH 608 - API Integration', () => {
  describe('Skyscanner Service', () => {
    it('should export searchFlights function', async () => {
      const { searchFlights } = await import('@/services/skyscanner');
      expect(typeof searchFlights).toBe('function');
    });

    it('should handle missing API key gracefully', async () => {
      const { searchFlights } = await import('@/services/skyscanner');
      
      // Mock environment without API key
      vi.stubEnv('VITE_RAPIDAPI_KEY', '');
      vi.stubEnv('VITE_SKYSCANNER_API_KEY', '');
      
      const result = await searchFlights({
        origin: 'GRU',
        destination: 'MRS',
        departureDate: '2025-03-10',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');
      vi.unstubAllEnvs();
    });
  });

  describe('Booking Service', () => {
    it('should export searchHotels function', async () => {
      const { searchHotels } = await import('@/services/booking');
      expect(typeof searchHotels).toBe('function');
    });

    it('should handle missing API key gracefully', async () => {
      const { searchHotels } = await import('@/services/booking');
      
      // Mock environment without API key
      vi.stubEnv('VITE_RAPIDAPI_KEY', '');
      vi.stubEnv('VITE_BOOKING_API_KEY', '');
      
      const result = await searchHotels({
        destination: 'Paris',
        checkIn: '2025-03-10',
        checkOut: '2025-03-17',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');
      vi.unstubAllEnvs();
    });
  });
});
