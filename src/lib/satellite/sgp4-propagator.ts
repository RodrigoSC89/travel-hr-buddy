/**
 * SGP4 Propagator using satellite.js
 * Real orbital mechanics for satellite tracking
 */

import * as satellite from 'satellite.js';

export interface TLEData {
  line1: string;
  line2: string;
  name?: string;
}

export interface SatellitePosition {
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/s
  azimuth?: number;
  elevation?: number;
  range?: number; // km
}

export interface PropagationResult {
  position: SatellitePosition;
  timestamp: Date;
  visible: boolean;
}

/**
 * Parse TLE and create satellite record
 */
export function createSatelliteRecord(tle: TLEData): satellite.SatRec | null {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    if (satrec.error !== 0) {
      console.error('TLE parsing error:', satrec.error);
      return null;
    }
    return satrec;
  } catch (error) {
    console.error('Failed to parse TLE:', error);
    return null;
  }
}

/**
 * Propagate satellite position to a specific time
 */
export function propagateToTime(
  satrec: satellite.SatRec,
  time: Date
): SatellitePosition | null {
  try {
    const positionAndVelocity = satellite.propagate(satrec, time);
    
    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    if (!positionAndVelocity.velocity || typeof positionAndVelocity.velocity === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;
    
    // Convert ECI to geodetic
    const gmst = satellite.gstime(time);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
    
    // Calculate velocity magnitude
    const velocity = Math.sqrt(
      velocityEci.x ** 2 + 
      velocityEci.y ** 2 + 
      velocityEci.z ** 2
    );

    return {
      latitude: satellite.degreesLat(positionGd.latitude),
      longitude: satellite.degreesLong(positionGd.longitude),
      altitude: positionGd.height,
      velocity,
    };
  } catch (error) {
    console.error('Propagation error:', error);
    return null;
  }
}

/**
 * Calculate look angles from observer to satellite
 */
export function calculateLookAngles(
  satrec: satellite.SatRec,
  observerLat: number,
  observerLon: number,
  observerAlt: number,
  time: Date
): { azimuth: number; elevation: number; range: number } | null {
  try {
    const positionAndVelocity = satellite.propagate(satrec, time);
    
    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    
    const observerGd: satellite.GeodeticLocation = {
      latitude: satellite.degreesToRadians(observerLat),
      longitude: satellite.degreesToRadians(observerLon),
      height: observerAlt / 1000, // Convert to km
    };
    
    const observerEcf = satellite.geodeticToEcf(observerGd);
    const positionEcf = satellite.eciToEcf(positionEci, gmst);
    
    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

    return {
      azimuth: satellite.radiansToDegrees(lookAngles.azimuth),
      elevation: satellite.radiansToDegrees(lookAngles.elevation),
      range: lookAngles.rangeSat,
    };
  } catch (error) {
    console.error('Look angles calculation error:', error);
    return null;
  }
}

/**
 * Get satellite position with look angles from observer
 */
export function getSatellitePositionWithAngles(
  tle: TLEData,
  observerLat: number,
  observerLon: number,
  observerAlt: number = 0,
  time: Date = new Date()
): PropagationResult | null {
  const satrec = createSatelliteRecord(tle);
  if (!satrec) return null;

  const position = propagateToTime(satrec, time);
  if (!position) return null;

  const lookAngles = calculateLookAngles(satrec, observerLat, observerLon, observerAlt, time);
  if (lookAngles) {
    position.azimuth = lookAngles.azimuth;
    position.elevation = lookAngles.elevation;
    position.range = lookAngles.range;
  }

  return {
    position,
    timestamp: time,
    visible: (lookAngles?.elevation ?? 0) > 0,
  };
}

/**
 * Track satellite over time interval
 */
export function trackSatellite(
  tle: TLEData,
  startTime: Date,
  endTime: Date,
  intervalSeconds: number = 60
): PropagationResult[] {
  const satrec = createSatelliteRecord(tle);
  if (!satrec) return [];

  const results: PropagationResult[] = [];
  const current = new Date(startTime);

  while (current <= endTime) {
    const position = propagateToTime(satrec, current);
    if (position) {
      results.push({
        position,
        timestamp: new Date(current),
        visible: true,
      });
    }
    current.setSeconds(current.getSeconds() + intervalSeconds);
  }

  return results;
}
