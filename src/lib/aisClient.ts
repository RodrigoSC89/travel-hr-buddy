/**
 * AIS (Automatic Identification System) Client
 * Integrates with MarineTraffic API for real-time vessel tracking
 * Patch 141.0
 */

export interface VesselPosition {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  timestamp: string;
  status: "underway" | "at_anchor" | "moored" | "not_under_command" | "restricted_maneuverability";
  type: string;
}

export interface AISClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * AIS Client for vessel tracking
 * Can be configured to use MarineTraffic or OpenAIS APIs
 */
export class AISClient {
  private config: Required<AISClientConfig>;

  constructor(config: AISClientConfig = {}) {
    this.config = {
      apiKey: config.apiKey || "",
      baseUrl: config.baseUrl || "https://api.marinetraffic.com/api/exportvessel/v:5",
      timeout: config.timeout || 10000,
    };
  }

  /**
   * Fetches vessel positions in a given area
   * @param bounds Geographic bounds {minLat, maxLat, minLon, maxLon}
   * @returns Array of vessel positions
   */
  async getVesselsInArea(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }): Promise<VesselPosition[]> {
    // For demo purposes, return mock data when no API key is configured
    if (!this.config.apiKey) {
      return this.getMockVessels(bounds);
    }

    try {
      const url = `${this.config.baseUrl}/${this.config.apiKey}/MINLAT:${bounds.minLat}/MAXLAT:${bounds.maxLat}/MINLON:${bounds.minLon}/MAXLON:${bounds.maxLon}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AIS API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseVesselData(data);
    } catch (error) {
      console.error("Error fetching AIS data:", error);
      // Fallback to mock data on error
      return this.getMockVessels(bounds);
    }
  }

  /**
   * Gets a specific vessel by MMSI
   * @param mmsi Maritime Mobile Service Identity
   */
  async getVesselByMMSI(mmsi: string): Promise<VesselPosition | null> {
    if (!this.config.apiKey) {
      const mockVessels = this.getMockVessels({
        minLat: -90,
        maxLat: 90,
        minLon: -180,
        maxLon: 180,
      });
      return mockVessels.find(v => v.mmsi === mmsi) || null;
    }

    try {
      const url = `${this.config.baseUrl}/${this.config.apiKey}/MMSI:${mmsi}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const vessels = this.parseVesselData(data);
      return vessels[0] || null;
    } catch (error) {
      console.error("Error fetching vessel by MMSI:", error);
      return null;
    }
  }

  /**
   * Parses raw API data into VesselPosition format
   */
  private parseVesselData(data: any): VesselPosition[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((vessel: any) => ({
      mmsi: vessel.MMSI || vessel.mmsi || "",
      name: vessel.SHIPNAME || vessel.shipname || "Unknown Vessel",
      latitude: parseFloat(vessel.LAT || vessel.latitude || 0),
      longitude: parseFloat(vessel.LON || vessel.longitude || 0),
      speed: parseFloat(vessel.SPEED || vessel.speed || 0),
      course: parseFloat(vessel.COURSE || vessel.course || 0),
      heading: parseFloat(vessel.HEADING || vessel.heading || 0),
      timestamp: vessel.TIMESTAMP || vessel.timestamp || new Date().toISOString(),
      status: this.parseStatus(vessel.STATUS || vessel.status || 0),
      type: vessel.TYPE || vessel.type || "Unknown",
    }));
  }

  /**
   * Converts numeric status codes to readable status
   */
  private parseStatus(statusCode: number | string): VesselPosition["status"] {
    const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode;
    
    if (code === 0 || code === 5) return "underway";
    if (code === 1 || code === 5) return "at_anchor";
    if (code === 2) return "not_under_command";
    if (code === 3) return "restricted_maneuverability";
    if (code === 5) return "moored";
    
    return "underway";
  }

  /**
   * Generates mock vessel data for testing/demo purposes
   */
  private getMockVessels(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }): VesselPosition[] {
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;
    
    return [
      {
        mmsi: "211234567",
        name: "MV Atlantic Pioneer",
        latitude: centerLat + 0.5,
        longitude: centerLon + 0.5,
        speed: 12.5,
        course: 45,
        heading: 45,
        timestamp: new Date().toISOString(),
        status: "underway",
        type: "Cargo",
      },
      {
        mmsi: "211234568",
        name: "Pacific Explorer",
        latitude: centerLat - 0.3,
        longitude: centerLon + 0.8,
        speed: 8.2,
        course: 180,
        heading: 180,
        timestamp: new Date().toISOString(),
        status: "underway",
        type: "Tanker",
      },
      {
        mmsi: "211234569",
        name: "Ocean Spirit",
        latitude: centerLat + 0.8,
        longitude: centerLon - 0.4,
        speed: 0,
        course: 0,
        heading: 270,
        timestamp: new Date().toISOString(),
        status: "at_anchor",
        type: "Passenger",
      },
      {
        mmsi: "211234570",
        name: "Coastal Guardian",
        latitude: centerLat - 0.6,
        longitude: centerLon - 0.7,
        speed: 15.8,
        course: 315,
        heading: 315,
        timestamp: new Date().toISOString(),
        status: "underway",
        type: "Service Vessel",
      },
    ];
  }
}

// Export singleton instance with default config
export const aisClient = new AISClient();
