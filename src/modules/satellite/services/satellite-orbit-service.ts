/**
 * PATCH 495 - Satellite Orbit Data Service (Enhanced with Real TLE API)
 * Integrates with N2YO API for real-time satellite tracking
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
  status: "online" | "offline"; // PATCH 495
  nextPass?: string; // PATCH 495
  type?: string; // PATCH 495: communication, navigation, weather, etc.
}

export interface TLEData {
  noradId: string;
  name: string;
  line1: string;
  line2: string;
}

// PATCH 495: N2YO API Response types
interface N2YOPosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

interface N2YOSatellite {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  positions?: N2YOPosition[];
}

class SatelliteOrbitService {
  // PATCH 495: N2YO API configuration
  private n2yoApiKey = import.meta.env.VITE_N2YO_API_KEY || "DEMO-KEY"; // Use environment variable
  private n2yoEndpoint = "https://api.n2yo.com/rest/v1/satellite";
  
  private celestrakEndpoint = "https://celestrak.org/NORAD/elements";
  private cache: Map<string, SatelliteOrbitData> = new Map();
  private cacheExpiry = 15 * 1000; // PATCH 495: 15 seconds for real-time updates

  // PATCH 495: Common maritime and communication satellites
  private readonly TRACKED_SATELLITES = [
    { noradId: "25603", name: "INMARSAT 3-F5", type: "communication" },
    { noradId: "24307", name: "IRIDIUM 8", type: "communication" },
    { noradId: "37392", name: "GLOBALSTAR M093", type: "communication" },
    { noradId: "28626", name: "IRIDIUM 33", type: "communication" },
    { noradId: "25777", name: "INMARSAT 4-F1", type: "communication" },
  ];

  /**
   * PATCH 495: Fetch real satellite position from N2YO API
   */
  async fetchSatellitePositionFromN2YO(noradId: string): Promise<N2YOSatellite | null> {
    try {
      // Observer coordinates (example: Atlantic Ocean)
      const observerLat = 0;
      const observerLng = -30;
      const observerAlt = 0;
      const seconds = 1; // Get current position

      const url = `${this.n2yoEndpoint}/positions/${noradId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}/&apiKey=${this.n2yoApiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`N2YO API error for satellite ${noradId}, falling back to simulation`);
        return null;
      }

      const data = await response.json();
      return data.info ? {
        satid: data.info.satid,
        satname: data.info.satname,
        intDesignator: data.info.intDesignator,
        launchDate: data.info.launchDate,
        positions: data.positions
      } : null;
    } catch (error) {
      console.error(`Error fetching satellite ${noradId} from N2YO:`, error);
      return null;
    }
  }

  /**
   * PATCH 495: Fetch TLE data from Celestrak for active satellites
   */
  async fetchActiveSatellitesTLE(): Promise<TLEData[]> {
    try {
      // Try to fetch from Celestrak
      const response = await fetch(`${this.celestrakEndpoint}/gp.php?GROUP=active&FORMAT=json`);
      
      if (response.ok) {
        const data = await response.json();
        return data.map((sat: any) => ({
          noradId: sat.NORAD_CAT_ID.toString(),
          name: sat.OBJECT_NAME,
          line1: sat.TLE_LINE1,
          line2: sat.TLE_LINE2
        }));
      }
      
      // Fallback to simulated data
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
   * PATCH 495: Calculate current orbital position from TLE data
   * Attempts to use N2YO API first, falls back to TLE calculation
   */
  async calculateOrbitPosition(tle: TLEData, satType: string = "communication"): Promise<SatelliteOrbitData> {
    const cached = this.cache.get(tle.noradId);
    const now = Date.now();

    if (cached && (now - cached.lastUpdated.getTime()) < this.cacheExpiry) {
      return cached;
    }

    // PATCH 495: Try to get real-time position from N2YO
    const n2yoData = await this.fetchSatellitePositionFromN2YO(tle.noradId);
    
    let orbitData: SatelliteOrbitData;
    
    if (n2yoData && n2yoData.positions && n2yoData.positions.length > 0) {
      // Use real data from N2YO
      const pos = n2yoData.positions[0];
      orbitData = {
        id: `sat-${tle.noradId}`,
        noradId: tle.noradId,
        name: n2yoData.satname || tle.name,
        altitude: pos.sataltitude,
        latitude: pos.satlatitude,
        longitude: pos.satlongitude,
        velocity: this.calculateVelocity(tle),
        orbitalPeriod: this.extractOrbitalPeriod(tle),
        inclination: this.extractInclination(tle),
        eccentricity: this.extractEccentricity(tle),
        tleLine1: tle.line1,
        tleLine2: tle.line2,
        lastUpdated: new Date(pos.timestamp * 1000),
        status: "online",
        type: satType,
        nextPass: this.calculateNextPass(pos.satlatitude, pos.satlongitude)
      };
    } else {
      // Fallback to simulated calculation
      orbitData = {
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
        lastUpdated: new Date(),
        status: "offline", // Mark as offline if using simulated data
        type: satType
      };
    }

    this.cache.set(tle.noradId, orbitData);
    return orbitData;
  }

  /**
   * PATCH 495: Calculate next pass time (simplified)
   */
  private calculateNextPass(lat: number, lng: number): string {
    // Simplified calculation - in production use proper orbital mechanics
    const minutesUntilPass = Math.floor(Math.random() * 90) + 10;
    const nextPass = new Date(Date.now() + minutesUntilPass * 60 * 1000);
    return nextPass.toISOString();
  }

  /**
   * PATCH 495: Get all tracked satellites with current positions
   */
  async getAllSatellitePositions(): Promise<SatelliteOrbitData[]> {
    const positions: SatelliteOrbitData[] = [];
    
    // Fetch positions for tracked satellites
    for (const sat of this.TRACKED_SATELLITES) {
      try {
        const tleData = await this.fetchActiveSatellitesTLE();
        const tle = tleData.find(t => t.noradId === sat.noradId) || {
          noradId: sat.noradId,
          name: sat.name,
          line1: this.getSimulatedTLEData().find(s => s.noradId === sat.noradId)?.line1 || "",
          line2: this.getSimulatedTLEData().find(s => s.noradId === sat.noradId)?.line2 || ""
        };
        
        const position = await this.calculateOrbitPosition(tle, sat.type);
        positions.push(position);
      } catch (error) {
        console.error(`Error fetching satellite ${sat.noradId}:`, error);
      }
    }
    
    return positions;
  }

  /**
   * Simulate satellite position updates over time
   */
  simulateOrbitProgression(satellite: SatelliteOrbitData, timeElapsed: number): SatelliteOrbitData {
    // Simple simulation - move satellite along orbit
    const degreesPerMinute = 360 / satellite.orbitalPeriod;
    const degreesElapsed = degreesPerMinute * (timeElapsed / 60000);
    
    // Keep longitude within -180 to 180 range
    let newLongitude = (satellite.longitude + degreesElapsed) % 360;
    if (newLongitude > 180) newLongitude -= 360;
    if (newLongitude < -180) newLongitude += 360;
    
    // Keep latitude within valid range (-90 to 90)
    const latitudeVariation = Math.sin(degreesElapsed * Math.PI / 180) * satellite.inclination / 10;
    let newLatitude = satellite.latitude + latitudeVariation;
    newLatitude = Math.max(-90, Math.min(90, newLatitude));
    
    return {
      ...satellite,
      longitude: newLongitude,
      latitude: newLatitude,
      lastUpdated: new Date()
    };
  }

  // Helper methods to extract data from TLE
  private extractAltitudeFromTLE(tle: TLEData): number {
    // TLE Line 2 has mean motion at columns 52-63
    // Simplified extraction - typically 600-800 km for LEO, 35786 km for GEO
    try {
      const line2 = tle.line2;
      // Mean motion is in revolutions per day at positions 52-63
      const meanMotionStr = line2.substring(52, 63).trim();
      const meanMotion = parseFloat(meanMotionStr);
      
      if (isNaN(meanMotion)) return 780; // Default LEO
      if (meanMotion > 10) return 780; // LEO
      return 35786; // GEO
    } catch {
      return 780; // Default to LEO
    }
  }

  private extractOrbitalPeriod(tle: TLEData): number {
    try {
      const line2 = tle.line2;
      const meanMotionStr = line2.substring(52, 63).trim();
      const meanMotion = parseFloat(meanMotionStr);
      return 1440 / meanMotion; // Convert mean motion to period in minutes
    } catch {
      return 90; // Default ~90 minutes
    }
  }

  private extractInclination(tle: TLEData): number {
    try {
      const line2 = tle.line2;
      // Inclination is at columns 8-16
      const inclinationStr = line2.substring(8, 16).trim();
      return parseFloat(inclinationStr);
    } catch {
      return 51.6; // Default ISS-like inclination
    }
  }

  private extractEccentricity(tle: TLEData): number {
    try {
      const line2 = tle.line2;
      // Eccentricity is at columns 26-33 (decimal point assumed)
      const eccString = line2.substring(26, 33).trim();
      return parseFloat(`0.${eccString}`);
    } catch {
      return 0.0001; // Near-circular orbit
    }
  }

  private calculateVelocity(tle: TLEData): number {
    const altitude = this.extractAltitudeFromTLE(tle);
    const earthRadius = 6371; // km
    const mu = 398600; // Earth's gravitational parameter
    return Math.sqrt(mu / (earthRadius + altitude));
  }

  private simulateLatitude(): number {
    // Realistic satellite latitudes based on common orbital inclinations
    // Most satellites are in LEO with inclinations between 0 and ~98 degrees
    const inclination = Math.random() * 98; // 0 to 98 degrees
    return (Math.random() - 0.5) * inclination;
  }

  private simulateLongitude(): number {
    // Longitude can be anywhere from -180 to 180
    return (Math.random() * 360) - 180;
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
