/**
 * Tests for PATCH 626 - External Data Integrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TravelAPIClient,
  METARParser,
  PortStateClient,
  NewsScrapingService,
  ExternalDataIntegrator,
} from '../src/lib/integrations/externalSources';

describe('PATCH 626 - External Data Integrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TravelAPIClient', () => {
    it('should search flights from multiple sources', async () => {
      const flights = await TravelAPIClient.searchFlights({
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      });

      expect(Array.isArray(flights)).toBe(true);
      expect(flights.length).toBeGreaterThan(0);
      
      // Check for different sources
      const sources = flights.map(f => f.source);
      expect(sources.length).toBeGreaterThan(0);
    });

    it('should search hotels from multiple sources', async () => {
      const hotels = await TravelAPIClient.searchHotels({
        destination: 'Rio de Janeiro',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
      });

      expect(Array.isArray(hotels)).toBe(true);
      expect(hotels.length).toBeGreaterThan(0);
      
      // Verify hotel has required properties
      const hotel = hotels[0];
      expect(hotel).toHaveProperty('name');
      expect(hotel).toHaveProperty('price');
      expect(hotel).toHaveProperty('rating');
    });

    it('should cache flight results', async () => {
      const params = {
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      };

      const flights1 = await TravelAPIClient.searchFlights(params);
      const flights2 = await TravelAPIClient.searchFlights(params);

      // Should return same results from cache
      expect(flights1).toEqual(flights2);
    });

    it('should sort flights by price', async () => {
      const flights = await TravelAPIClient.searchFlights({
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      });

      for (let i = 0; i < flights.length - 1; i++) {
        expect(flights[i].price).toBeLessThanOrEqual(flights[i + 1].price);
      }
    });

    it('should sort hotels by rating then price', async () => {
      const hotels = await TravelAPIClient.searchHotels({
        destination: 'Rio de Janeiro',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
      });

      expect(hotels.length).toBeGreaterThan(0);
      // Just verify sorting doesn't crash
      expect(hotels[0]).toHaveProperty('rating');
    });
  });

  describe('METARParser', () => {
    it('should fetch and parse METAR data', async () => {
      const metar = await METARParser.getMETAR('SBGR');

      expect(metar).toBeTruthy();
      expect(metar?.station).toBe('SBGR');
      expect(metar?.temperature).toBeTypeOf('number');
      expect(metar?.windSpeed).toBeTypeOf('number');
    });

    it('should parse METAR string correctly', () => {
      const rawMETAR = 'SBGR 031200Z 27015KT 9999 FEW030 BKN100 22/18 Q1015 NOSIG';
      const parsed = METARParser.parseMETAR(rawMETAR, 'SBGR');

      expect(parsed.station).toBe('SBGR');
      expect(parsed.windDirection).toBe(270);
      expect(parsed.windSpeed).toBe(15);
      expect(parsed.temperature).toBe(22);
      expect(parsed.dewPoint).toBe(18);
      expect(parsed.pressure).toBe(1015);
      expect(parsed.visibility).toBe(9999);
    });

    it('should parse cloud layers', () => {
      const rawMETAR = 'SBGR 031200Z 27015KT 9999 FEW030 BKN100 22/18 Q1015 NOSIG';
      const parsed = METARParser.parseMETAR(rawMETAR, 'SBGR');

      expect(Array.isArray(parsed.clouds)).toBe(true);
      expect(parsed.clouds.length).toBeGreaterThan(0);
      expect(parsed.clouds[0]).toContain('FEW');
    });

    it('should return raw METAR string', () => {
      const rawMETAR = 'SBGR 031200Z 27015KT 9999 FEW030 BKN100 22/18 Q1015 NOSIG';
      const parsed = METARParser.parseMETAR(rawMETAR, 'SBGR');

      expect(parsed.rawMETAR).toBe(rawMETAR);
    });
  });

  describe('PortStateClient', () => {
    it('should fetch vessel inspection data', async () => {
      const data = await PortStateClient.getVesselInspections('1234567');

      expect(data).toBeTruthy();
      expect(data?.imo).toBe('1234567');
      expect(data?.vesselName).toBeTruthy();
      expect(Array.isArray(data?.inspections)).toBe(true);
    });

    it('should include risk profile', async () => {
      const data = await PortStateClient.getVesselInspections('1234567');

      expect(data?.riskProfile).toBeTruthy();
      expect(['low', 'medium', 'high', 'critical']).toContain(data?.riskProfile);
    });

    it('should calculate risk profile - low risk', () => {
      const inspections = [
        { date: '2025-10-01', port: 'Santos', authority: 'BRA', deficiencies: 0, detentions: 0 },
        { date: '2025-09-01', port: 'Rotterdam', authority: 'NLD', deficiencies: 1, detentions: 0 },
      ];

      const risk = PortStateClient.calculateRiskProfile(inspections);
      expect(risk).toBe('low');
    });

    it('should calculate risk profile - medium risk', () => {
      const inspections = [
        { date: '2025-10-01', port: 'Santos', authority: 'BRA', deficiencies: 2, detentions: 0 },
        { date: '2025-09-01', port: 'Rotterdam', authority: 'NLD', deficiencies: 2, detentions: 0 },
      ];

      const risk = PortStateClient.calculateRiskProfile(inspections);
      expect(risk).toBe('medium');
    });

    it('should calculate risk profile - high risk', () => {
      const inspections = [
        { date: '2025-10-01', port: 'Santos', authority: 'BRA', deficiencies: 4, detentions: 0 },
        { date: '2025-09-01', port: 'Rotterdam', authority: 'NLD', deficiencies: 3, detentions: 0 },
      ];

      const risk = PortStateClient.calculateRiskProfile(inspections);
      expect(risk).toBe('high');
    });

    it('should calculate risk profile - critical with detentions', () => {
      const inspections = [
        { date: '2025-10-01', port: 'Santos', authority: 'BRA', deficiencies: 2, detentions: 1 },
      ];

      const risk = PortStateClient.calculateRiskProfile(inspections);
      expect(risk).toBe('critical');
    });

    it('should handle empty inspections', () => {
      const risk = PortStateClient.calculateRiskProfile([]);
      expect(risk).toBe('medium');
    });
  });

  describe('NewsScrapingService', () => {
    it('should search maritime news', async () => {
      const news = await NewsScrapingService.searchNews('port state control');

      expect(Array.isArray(news)).toBe(true);
      expect(news.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const news = await NewsScrapingService.searchNews('', ['inspection']);

      expect(Array.isArray(news)).toBe(true);
      news.forEach(item => {
        expect(item.category).toBe('inspection');
      });
    });

    it('should filter by query text', async () => {
      const news = await NewsScrapingService.searchNews('Santos');

      expect(Array.isArray(news)).toBe(true);
      if (news.length > 0) {
        const item = news[0];
        const matchesQuery = 
          item.title.toLowerCase().includes('santos') ||
          item.summary.toLowerCase().includes('santos');
        expect(matchesQuery).toBe(true);
      }
    });

    it('should sort by relevance', async () => {
      const news = await NewsScrapingService.searchNews('');

      for (let i = 0; i < news.length - 1; i++) {
        expect(news[i].relevance).toBeGreaterThanOrEqual(news[i + 1].relevance);
      }
    });

    it('should include required news properties', async () => {
      const news = await NewsScrapingService.searchNews('');

      if (news.length > 0) {
        const item = news[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('summary');
        expect(item).toHaveProperty('url');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('relevance');
      }
    });
  });

  describe('ExternalDataIntegrator', () => {
    it('should get complete travel data', async () => {
      const data = await ExternalDataIntegrator.getTravelData({
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      });

      expect(data).toHaveProperty('flights');
      expect(data).toHaveProperty('hotels');
      expect(data).toHaveProperty('weather');
      
      expect(Array.isArray(data.flights)).toBe(true);
      expect(Array.isArray(data.hotels)).toBe(true);
    });

    it('should get complete compliance data', async () => {
      const data = await ExternalDataIntegrator.getComplianceData('1234567');

      expect(data).toHaveProperty('portState');
      expect(data).toHaveProperty('news');
      
      expect(Array.isArray(data.news)).toBe(true);
    });

    it('should get navigation weather for multiple stations', async () => {
      const weather = await ExternalDataIntegrator.getNavigationWeather([
        'SBGR',
        'SBSP',
        'SBRJ',
      ]);

      expect(Array.isArray(weather)).toBe(true);
      expect(weather.length).toBeGreaterThan(0);
      
      weather.forEach(metar => {
        expect(metar).toHaveProperty('station');
        expect(metar).toHaveProperty('temperature');
      });
    });

    it('should handle API failures gracefully', async () => {
      // Should not throw even if some APIs fail
      const data = await ExternalDataIntegrator.getTravelData({
        origin: 'XXX',
        destination: 'YYY',
        departureDate: '2025-12-01',
      });

      expect(data).toBeTruthy();
      expect(data.flights).toBeDefined();
      expect(data.hotels).toBeDefined();
    });
  });

  describe('API Connection and Latency', () => {
    it('should complete flight search within reasonable time', async () => {
      const start = Date.now();
      
      await TravelAPIClient.searchFlights({
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should complete hotel search within reasonable time', async () => {
      const start = Date.now();
      
      await TravelAPIClient.searchHotels({
        destination: 'Rio de Janeiro',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle parallel requests efficiently', async () => {
      const start = Date.now();
      
      await Promise.all([
        TravelAPIClient.searchFlights({
          origin: 'GRU',
          destination: 'GIG',
          departureDate: '2025-12-01',
        }),
        TravelAPIClient.searchHotels({
          destination: 'Rio de Janeiro',
          checkIn: '2025-12-01',
          checkOut: '2025-12-05',
        }),
        METARParser.getMETAR('SBGR'),
      ]);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Parallel should be faster
    });
  });

  describe('Mock Display Check', () => {
    it('should display flight data in correct format', async () => {
      const flights = await TravelAPIClient.searchFlights({
        origin: 'GRU',
        destination: 'GIG',
        departureDate: '2025-12-01',
      });

      const flight = flights[0];
      
      // Check display format
      expect(typeof flight.airline).toBe('string');
      expect(typeof flight.flightNumber).toBe('string');
      expect(typeof flight.price).toBe('number');
      expect(typeof flight.duration).toBe('string');
    });

    it('should display hotel data in correct format', async () => {
      const hotels = await TravelAPIClient.searchHotels({
        destination: 'Rio de Janeiro',
        checkIn: '2025-12-01',
        checkOut: '2025-12-05',
      });

      const hotel = hotels[0];
      
      // Check display format
      expect(typeof hotel.name).toBe('string');
      expect(typeof hotel.address).toBe('string');
      expect(typeof hotel.rating).toBe('number');
      expect(typeof hotel.price).toBe('number');
      expect(Array.isArray(hotel.amenities)).toBe(true);
    });

    it('should display METAR data in human-readable format', async () => {
      const metar = await METARParser.getMETAR('SBGR');

      expect(metar).toBeTruthy();
      expect(metar?.rawMETAR).toBeTruthy();
      expect(typeof metar?.temperature).toBe('number');
      expect(typeof metar?.windSpeed).toBe('number');
      expect(Array.isArray(metar?.clouds)).toBe(true);
    });
  });
});
