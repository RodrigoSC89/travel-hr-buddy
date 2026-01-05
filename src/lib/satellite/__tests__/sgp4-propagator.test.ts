/**
 * SGP4 Propagator Tests
 * Validates orbital calculations with real TLE data
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  createSatelliteRecord,
  propagateToTime,
  calculateLookAngles,
  getSatellitePositionWithAngles,
  trackSatellite,
  type TLEData,
} from '../sgp4-propagator';

// Real TLE data for ISS (ZARYA) - Update periodically
const ISS_TLE: TLEData = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  29715-3 0  9993',
  line2: '2 25544  51.6416 208.5481 0005973 117.4303 242.7320 15.49922348484830',
};

// Real TLE for GPS satellite
const GPS_TLE: TLEData = {
  name: 'GPS BIIR-2 (PRN 13)',
  line1: '1 24876U 97035A   24001.50000000 -.00000013  00000-0  00000-0 0  9994',
  line2: '2 24876  55.7266 142.2291 0066516  56.9456 303.7692  2.00561995193871',
};

// Observer location: São Paulo, Brazil
const OBSERVER = {
  lat: -23.5505,
  lon: -46.6333,
  alt: 760, // meters
};

describe('SGP4 Propagator', () => {
  describe('createSatelliteRecord', () => {
    it('should parse valid ISS TLE data', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      expect(satrec?.error).toBe(0);
    });

    it('should parse valid GPS TLE data', () => {
      const satrec = createSatelliteRecord(GPS_TLE);
      expect(satrec).not.toBeNull();
      expect(satrec?.error).toBe(0);
    });

    it('should return null for invalid TLE', () => {
      const invalidTLE: TLEData = {
        line1: 'invalid line 1',
        line2: 'invalid line 2',
      };
      const satrec = createSatelliteRecord(invalidTLE);
      expect(satrec).toBeNull();
    });
  });

  describe('propagateToTime', () => {
    it('should calculate ISS position at current time', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      const position = propagateToTime(satrec!, new Date());
      expect(position).not.toBeNull();
      
      // ISS orbits at ~400-420 km altitude
      expect(position!.altitude).toBeGreaterThan(300);
      expect(position!.altitude).toBeLessThan(500);
      
      // Latitude should be within ISS inclination (~51.6°)
      expect(Math.abs(position!.latitude)).toBeLessThanOrEqual(52);
      
      // Longitude should be valid
      expect(position!.longitude).toBeGreaterThanOrEqual(-180);
      expect(position!.longitude).toBeLessThanOrEqual(180);
      
      // ISS velocity ~7.66 km/s
      expect(position!.velocity).toBeGreaterThan(7);
      expect(position!.velocity).toBeLessThan(8);
    });

    it('should calculate GPS satellite position', () => {
      const satrec = createSatelliteRecord(GPS_TLE);
      expect(satrec).not.toBeNull();
      
      const position = propagateToTime(satrec!, new Date());
      expect(position).not.toBeNull();
      
      // GPS orbits at ~20,200 km altitude
      expect(position!.altitude).toBeGreaterThan(19000);
      expect(position!.altitude).toBeLessThan(22000);
      
      // GPS velocity ~3.87 km/s
      expect(position!.velocity).toBeGreaterThan(3);
      expect(position!.velocity).toBeLessThan(5);
    });

    it('should propagate to specific future time', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      
      const position = propagateToTime(satrec!, futureTime);
      expect(position).not.toBeNull();
      expect(position!.altitude).toBeGreaterThan(300);
    });
  });

  describe('calculateLookAngles', () => {
    it('should calculate look angles from observer to ISS', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      const lookAngles = calculateLookAngles(
        satrec!,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt,
        new Date()
      );
      
      expect(lookAngles).not.toBeNull();
      
      // Azimuth should be 0-360
      expect(lookAngles!.azimuth).toBeGreaterThanOrEqual(0);
      expect(lookAngles!.azimuth).toBeLessThanOrEqual(360);
      
      // Elevation can be negative (below horizon)
      expect(lookAngles!.elevation).toBeGreaterThanOrEqual(-90);
      expect(lookAngles!.elevation).toBeLessThanOrEqual(90);
      
      // Range should be positive
      expect(lookAngles!.range).toBeGreaterThan(0);
    });

    it('should calculate GPS satellite visibility', () => {
      const satrec = createSatelliteRecord(GPS_TLE);
      expect(satrec).not.toBeNull();
      
      const lookAngles = calculateLookAngles(
        satrec!,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt,
        new Date()
      );
      
      expect(lookAngles).not.toBeNull();
      
      // GPS range should be ~20,000-26,000 km
      expect(lookAngles!.range).toBeGreaterThan(19000);
      expect(lookAngles!.range).toBeLessThan(30000);
    });
  });

  describe('getSatellitePositionWithAngles', () => {
    it('should return complete position with visibility', () => {
      const result = getSatellitePositionWithAngles(
        ISS_TLE,
        OBSERVER.lat,
        OBSERVER.lon,
        OBSERVER.alt
      );
      
      expect(result).not.toBeNull();
      expect(result!.position).toBeDefined();
      expect(result!.timestamp).toBeInstanceOf(Date);
      expect(typeof result!.visible).toBe('boolean');
      
      // Should have look angles
      expect(result!.position.azimuth).toBeDefined();
      expect(result!.position.elevation).toBeDefined();
      expect(result!.position.range).toBeDefined();
    });
  });

  describe('trackSatellite', () => {
    it('should track ISS over 1 hour with 5-minute intervals', () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour
      
      const track = trackSatellite(ISS_TLE, startTime, endTime, 300); // 5 min intervals
      
      // Should have ~12 points (60 min / 5 min)
      expect(track.length).toBeGreaterThanOrEqual(12);
      expect(track.length).toBeLessThanOrEqual(14);
      
      // Each point should have valid data
      track.forEach((point) => {
        expect(point.position.altitude).toBeGreaterThan(300);
        expect(point.position.altitude).toBeLessThan(500);
        expect(point.timestamp).toBeInstanceOf(Date);
      });
      
      // Positions should change over time
      const firstPoint = track[0];
      const lastPoint = track[track.length - 1];
      expect(firstPoint.position.longitude).not.toBe(lastPoint.position.longitude);
    });

    it('should handle short tracking intervals', () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 10 * 60 * 1000); // 10 minutes
      
      const track = trackSatellite(ISS_TLE, startTime, endTime, 60); // 1 min intervals
      
      expect(track.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle epoch boundary propagation', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      // Propagate far into the future (30 days)
      const futureTime = new Date();
      futureTime.setDate(futureTime.getDate() + 30);
      
      const position = propagateToTime(satrec!, futureTime);
      // May return null or degraded accuracy, but shouldn't crash
      if (position) {
        expect(position.altitude).toBeGreaterThan(0);
      }
    });

    it('should handle polar observer location', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      // North Pole observer
      const lookAngles = calculateLookAngles(
        satrec!,
        89.0, // Near North Pole
        0,
        0,
        new Date()
      );
      
      expect(lookAngles).not.toBeNull();
    });

    it('should handle equatorial observer location', () => {
      const satrec = createSatelliteRecord(ISS_TLE);
      expect(satrec).not.toBeNull();
      
      // Equator observer
      const lookAngles = calculateLookAngles(
        satrec!,
        0, // Equator
        0, // Prime Meridian
        0,
        new Date()
      );
      
      expect(lookAngles).not.toBeNull();
    });
  });
});
