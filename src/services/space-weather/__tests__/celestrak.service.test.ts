/**
 * CelesTrak Service Tests
 * Validates GNSS orbital calculations and API integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getGNSSElements,
  calculateVisibility,
  calculateDOP,
  generateSkyplot,
} from '../celestrak.service';
import type { CelesTrakGPElement } from '@/types/space-weather.types';

// Mock GPS satellite elements
const mockGPSElements: CelesTrakGPElement[] = [
  {
    OBJECT_NAME: 'GPS BIIR-2 (PRN 13)',
    OBJECT_ID: '1997-035A',
    EPOCH: '2024-01-01T12:00:00.000Z',
    MEAN_MOTION: 2.00561995,
    ECCENTRICITY: 0.0066516,
    INCLINATION: 55.7266,
    RA_OF_ASC_NODE: 142.2291,
    ARG_OF_PERICENTER: 56.9456,
    MEAN_ANOMALY: 303.7692,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 24876,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 19387,
    BSTAR: 0,
    MEAN_MOTION_DOT: -0.00000013,
    MEAN_MOTION_DDOT: 0,
  },
  {
    OBJECT_NAME: 'GPS BIIR-3 (PRN 11)',
    OBJECT_ID: '1999-055A',
    EPOCH: '2024-01-01T12:00:00.000Z',
    MEAN_MOTION: 2.00563091,
    ECCENTRICITY: 0.0136723,
    INCLINATION: 51.0285,
    RA_OF_ASC_NODE: 262.0453,
    ARG_OF_PERICENTER: 84.3102,
    MEAN_ANOMALY: 276.6051,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 25933,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 17521,
    BSTAR: 0,
    MEAN_MOTION_DOT: -0.00000016,
    MEAN_MOTION_DDOT: 0,
  },
  {
    OBJECT_NAME: 'GPS BIIF-1 (PRN 25)',
    OBJECT_ID: '2010-022A',
    EPOCH: '2024-01-01T12:00:00.000Z',
    MEAN_MOTION: 2.00565294,
    ECCENTRICITY: 0.0044283,
    INCLINATION: 55.0361,
    RA_OF_ASC_NODE: 82.9127,
    ARG_OF_PERICENTER: 43.5687,
    MEAN_ANOMALY: 316.6714,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 36585,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 10123,
    BSTAR: 0,
    MEAN_MOTION_DOT: -0.00000011,
    MEAN_MOTION_DDOT: 0,
  },
  {
    OBJECT_NAME: 'GPS BIIF-2 (PRN 01)',
    OBJECT_ID: '2011-036A',
    EPOCH: '2024-01-01T12:00:00.000Z',
    MEAN_MOTION: 2.00559382,
    ECCENTRICITY: 0.0098765,
    INCLINATION: 56.1234,
    RA_OF_ASC_NODE: 322.5678,
    ARG_OF_PERICENTER: 123.4567,
    MEAN_ANOMALY: 234.5678,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 37753,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 9456,
    BSTAR: 0,
    MEAN_MOTION_DOT: -0.00000009,
    MEAN_MOTION_DDOT: 0,
  },
];

// Observer location: Rio de Janeiro, Brazil
const OBSERVER = {
  lat: -22.9068,
  lon: -43.1729,
  alt: 11, // meters (sea level)
};

describe('CelesTrak Service', () => {
  describe('calculateVisibility', () => {
    it('should calculate visibility for GPS satellites', () => {
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );

      expect(visibility).toHaveLength(mockGPSElements.length);

      visibility.forEach((sat) => {
        // Each satellite should have valid visibility data
        expect(sat.satellite_id).toBeDefined();
        expect(sat.satellite_name).toBeDefined();
        expect(sat.constellation).toBe('GPS');
        
        // Azimuth: 0-360 degrees
        expect(sat.azimuth).toBeGreaterThanOrEqual(0);
        expect(sat.azimuth).toBeLessThanOrEqual(360);
        
        // Elevation: -90 to 90 degrees
        expect(sat.elevation).toBeGreaterThanOrEqual(-90);
        expect(sat.elevation).toBeLessThanOrEqual(90);
        
        // Range should be positive
        expect(sat.range).toBeGreaterThan(0);
        
        // Visibility boolean based on mask angle
        expect(typeof sat.visible).toBe('boolean');
      });
    });

    it('should filter visible satellites with mask angle', () => {
      const maskAngle = 10; // 10 degrees
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt,
        new Date(),
        maskAngle
      );

      // Check that visible flag matches elevation vs mask
      visibility.forEach((sat) => {
        expect(sat.visible).toBe(sat.elevation >= maskAngle);
      });
    });

    it('should identify constellation from satellite name', () => {
      const galileoElement: CelesTrakGPElement = {
        ...mockGPSElements[0],
        OBJECT_NAME: 'GALILEO-FM2',
        NORAD_CAT_ID: 99001,
      };

      const glonassElement: CelesTrakGPElement = {
        ...mockGPSElements[0],
        OBJECT_NAME: 'GLONASS-M 730',
        NORAD_CAT_ID: 99002,
      };

      const beidouElement: CelesTrakGPElement = {
        ...mockGPSElements[0],
        OBJECT_NAME: 'BEIDOU-3 M1',
        NORAD_CAT_ID: 99003,
      };

      const mixed = [galileoElement, glonassElement, beidouElement, mockGPSElements[0]];
      const visibility = calculateVisibility(mixed, OBSERVER.lat, OBSERVER.lon, OBSERVER.alt);

      expect(visibility[0].constellation).toBe('GALILEO');
      expect(visibility[1].constellation).toBe('GLONASS');
      expect(visibility[2].constellation).toBe('BEIDOU');
      expect(visibility[3].constellation).toBe('GPS');
    });
  });

  describe('calculateDOP', () => {
    it('should calculate DOP metrics for visible satellites', () => {
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );

      const visibleSats = visibility.filter((s) => s.visible);
      
      // Always returns DOP (999 if insufficient satellites)
      const dop = calculateDOP(visibility, OBSERVER.lat, OBSERVER.lon);

      expect(dop).not.toBeNull();
      expect(dop.pdop).toBeGreaterThan(0);
      expect(dop.hdop).toBeGreaterThan(0);
      expect(dop.vdop).toBeGreaterThan(0);
      expect(dop.tdop).toBeGreaterThan(0);
      expect(dop.gdop).toBeGreaterThan(0);

      // GDOP should be >= PDOP
      expect(dop.gdop).toBeGreaterThanOrEqual(dop.pdop);
      
      // Should have visible satellite count
      expect(dop.visible_satellites).toBeDefined();
      expect(dop.constellations).toBeDefined();
    });

    it('should return high DOP with insufficient satellites', () => {
      const visibility = calculateVisibility(
        [mockGPSElements[0]], // Only 1 satellite
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );

      const dop = calculateDOP(visibility, OBSERVER.lat, OBSERVER.lon);
      
      // Should return 999 for insufficient satellites
      expect(dop.pdop).toBe(999);
      expect(dop.visible_satellites).toBeLessThan(4);
    });

    it('should track constellation breakdown', () => {
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );

      const dop = calculateDOP(visibility, OBSERVER.lat, OBSERVER.lon);
      
      expect(dop.constellations).toBeDefined();
      expect(typeof dop.constellations.gps).toBe('number');
      expect(typeof dop.constellations.galileo).toBe('number');
      expect(typeof dop.constellations.glonass).toBe('number');
      expect(typeof dop.constellations.beidou).toBe('number');
    });
  });

  describe('generateSkyplot', () => {
    it('should generate skyplot points for visible satellites', () => {
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );

      const skyplot = generateSkyplot(visibility);

      // Only visible satellites in skyplot
      const visibleCount = visibility.filter(v => v.visible).length;
      expect(skyplot).toHaveLength(visibleCount);

      skyplot.forEach((point) => {
        // Should have satellite info
        expect(point.satellite_id).toBeDefined();
        expect(point.constellation).toBeDefined();
        
        // Azimuth: 0-360 degrees
        expect(point.azimuth).toBeGreaterThanOrEqual(0);
        expect(point.azimuth).toBeLessThanOrEqual(360);
        
        // Elevation should be positive (visible)
        expect(point.elevation).toBeGreaterThanOrEqual(0);
        expect(point.elevation).toBeLessThanOrEqual(90);
      });
    });

    it('should only include visible satellites', () => {
      // Create visibility with some below horizon
      const visibility = calculateVisibility(
        mockGPSElements,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt,
        new Date(),
        45 // High mask angle to exclude some
      );

      const skyplot = generateSkyplot(visibility);
      
      // All skyplot points should be from visible satellites
      skyplot.forEach((point) => {
        expect(point.elevation).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getGNSSElements (API)', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should fetch GPS elements from CelesTrak', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGPSElements),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await getGNSSElements('GPS-OPS', false);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(mockGPSElements.length);
      expect(result.source).toBe('celestrak');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('GROUP=GPS-OPS'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await getGNSSElements('GPS-OPS', false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should use cache when available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGPSElements),
      });
      vi.stubGlobal('fetch', mockFetch);

      // First call - should fetch
      await getGNSSElements('GPS-OPS', true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with cache - should not fetch
      const cachedResult = await getGNSSElements('GPS-OPS', true);
      expect(cachedResult.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1
    });
  });
});
