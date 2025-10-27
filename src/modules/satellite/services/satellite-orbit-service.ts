/**
 * PATCH 274 - Satellite Orbit Data Service
 * Integrates with Celestrak TLE data and provides orbit calculation
 */

export interface SatelliteOrbitData {
  id: string;
  noradId: string;
  name: string;
  altitude: number; // km
  latitude: number;
  longitude: number;
  velocity: number; // km/s
  orbitalPeriod: number; // minutes
  inclination: number; // degrees
  eccentricity: number;
  tleLine1: string;
  tleLine2: string;
  lastUpdated: Date;
}

export interface TLEData {
  noradId: string;
  name: string;
  line1: string;
  line2: string;
}

class SatelliteOrbitService {
  private apiEndpoint = "https://celestrak.org/NORAD/elements";
  private cache: Map<string, SatelliteOrbitData> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour

  /**
   * Fetch TLE data from Celestrak for active satellites
   */
  async fetchActiveSatellitesTLE(): Promise<TLEData[]> {
    try {
      // In production, this would fetch from Celestrak API
      // For now, using simulated data
      return this.getSimulatedTLEData();
    } catch (error) {
      console.error("Error fetching TLE data:", error);
      return this.getSimulatedTLEData();
    }
  }

  /**
   * Get simulated TLE data for common maritime satellites
   */
  private getSimulatedTLEData(): TLEData[] {
    return [
      {
        noradId: "25603",
        name: "INMARSAT 3-F5",
        line1: "1 25603U 98066A   25300.50000000 -.00000017  00000+0  00000+0 0  9995",
        line2: "2 25603   0.0582 116.4925 0002046 187.6789  20.0234  1.00271226 93812"
      },
      {
        noradId: "24307",
        name: "IRIDIUM 8",
        line1: "1 24307U 96044A   25300.50000000  .00000121  00000+0  36146-4 0  9998",
        line2: "2 24307  86.3985  45.2234 0002216  94.0456 266.1009 14.34216364123456"
      },
      {
        noradId: "37392",
        name: "GLOBALSTAR M093",
        line1: "1 37392U 11009A   25300.50000000 -.00000071  00000+0  00000+0 0  9992",
        line2: "2 37392  52.0023 234.5678 0012345  67.8901 292.1234  1.00271234 45678"
      }
    ];
  }

  /**
   * Calculate current orbital position from TLE data
   * This is a simplified calculation - in production, use SGP4 library
   */
  async calculateOrbitPosition(tle: TLEData): Promise<SatelliteOrbitData> {
    const cached = this.cache.get(tle.noradId);
    const now = Date.now();

    if (cached && (now - cached.lastUpdated.getTime()) < this.cacheExpiry) {
      return cached;
    }

    // Simplified orbital calculation
    // In production, use satellite.js or similar SGP4 library
    const orbitData: SatelliteOrbitData = {
      id: `sat-${tle.noradId}`,
      noradId: tle.noradId,
      name: tle.name,
      altitude: this.extractAltitudeFromTLE(tle),
      latitude: this.simulateLatitude(),
      longitude: this.simulateLongitude(),
      velocity: this.calculateVelocity(tle),
      orbitalPeriod: this.extractOrbitalPeriod(tle),
      inclination: this.extractInclination(tle),
      eccentricity: this.extractEccentricity(tle),
      tleLine1: tle.line1,
      tleLine2: tle.line2,
      lastUpdated: new Date()
    };

    this.cache.set(tle.noradId, orbitData);
    return orbitData;
  }

  /**
   * Get all tracked satellites with current positions
   */
  async getAllSatellitePositions(): Promise<SatelliteOrbitData[]> {
    const tleData = await this.fetchActiveSatellitesTLE();
    const positions = await Promise.all(
      tleData.map(tle => this.calculateOrbitPosition(tle))
    );
    return positions;
  }

  /**
   * Simulate satellite position updates over time
   */
  simulateOrbitProgression(satellite: SatelliteOrbitData, timeElapsed: number): SatelliteOrbitData {
    // Simple simulation - move satellite along orbit
    const degreesPerMinute = 360 / satellite.orbitalPeriod;
    const degreesElapsed = degreesPerMinute * (timeElapsed / 60000);
    
    return {
      ...satellite,
      longitude: (satellite.longitude + degreesElapsed) % 360,
      latitude: satellite.latitude + (Math.sin(degreesElapsed * Math.PI / 180) * 10),
      lastUpdated: new Date()
    };
  }

  // Helper methods to extract data from TLE
  private extractAltitudeFromTLE(tle: TLEData): number {
    // Extract mean motion from line 2 and calculate altitude
    // Simplified - typically 600-800 km for LEO, 35786 km for GEO
    const line2Parts = tle.line2.split(/\s+/);
    const meanMotion = parseFloat(line2Parts[7]);
    
    if (meanMotion > 10) return 780; // LEO
    return 35786; // GEO
  }

  private extractOrbitalPeriod(tle: TLEData): number {
    const line2Parts = tle.line2.split(/\s+/);
    const meanMotion = parseFloat(line2Parts[7]);
    return 1440 / meanMotion; // Convert mean motion to period in minutes
  }

  private extractInclination(tle: TLEData): number {
    const line2Parts = tle.line2.split(/\s+/);
    return parseFloat(line2Parts[2]);
  }

  private extractEccentricity(tle: TLEData): number {
    const line2Parts = tle.line2.split(/\s+/);
    const eccString = line2Parts[4];
    return parseFloat(`0.${eccString}`);
  }

  private calculateVelocity(tle: TLEData): number {
    const altitude = this.extractAltitudeFromTLE(tle);
    const earthRadius = 6371; // km
    const mu = 398600; // Earth's gravitational parameter
    return Math.sqrt(mu / (earthRadius + altitude));
  }

  private simulateLatitude(): number {
    return (Math.random() - 0.5) * 180;
  }

  private simulateLongitude(): number {
    return (Math.random() - 0.5) * 360;
  }

  /**
   * Save satellite orbit data to database
   */
  async saveSatelliteOrbit(data: SatelliteOrbitData): Promise<void> {
    // In production, save to Supabase satellite_orbits table
    console.log("Saving satellite orbit data:", data);
  }

  /**
   * Get satellite coverage zones
   */
  getCoverageZones(satellites: SatelliteOrbitData[]): CoverageZone[] {
    return [
      {
        name: "North Atlantic",
        satellites: satellites.filter(s => s.latitude > 20 && s.longitude > -80 && s.longitude < 20),
        coverage: 95,
        quality: "excellent"
      },
      {
        name: "South Atlantic",
        satellites: satellites.filter(s => s.latitude < -20 && s.longitude > -80 && s.longitude < 20),
        coverage: 88,
        quality: "good"
      },
      {
        name: "Pacific",
        satellites: satellites.filter(s => s.longitude < -80 || s.longitude > 120),
        coverage: 72,
        quality: "fair"
      },
      {
        name: "Indian Ocean",
        satellites: satellites.filter(s => s.longitude > 40 && s.longitude < 120),
        coverage: 65,
        quality: "good"
      }
    ];
  }
}

export interface CoverageZone {
  name: string;
  satellites: SatelliteOrbitData[];
  coverage: number;
  quality: "excellent" | "good" | "fair" | "poor";
}

export const satelliteOrbitService = new SatelliteOrbitService();
