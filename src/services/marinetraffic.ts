/**
 * MarineTraffic API Service
 * Provides real-time vessel tracking, AIS data, and ship information
 * 
 * Documentation: https://www.marinetraffic.com/en/ais-api-services
 */

interface VesselPosition {
  mmsi: number;
  imo?: number;
  shipName?: string;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  heading?: number;
  status: number;
  lastUpdate: string;
  destination?: string;
  eta?: string;
  shipType?: number;
  length?: number;
  width?: number;
  draft?: number;
}

interface VesselDetails {
  mmsi: number;
  imo?: number;
  shipName: string;
  shipType: string;
  flag: string;
  callSign?: string;
  length: number;
  width: number;
  yearBuilt?: number;
  grossTonnage?: number;
  deadweight?: number;
  homePort?: string;
  owner?: string;
}

interface PortInfo {
  portId: number;
  portName: string;
  country: string;
  lat: number;
  lon: number;
  arrivals?: number;
  departures?: number;
}

export class MarineTrafficService {
  private baseUrl = 'https://services.marinetraffic.com/api';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_MARINETRAFFIC_API_KEY || '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get vessel position by MMSI
   */
  async getVesselPosition(mmsi: number): Promise<VesselPosition | null> {
    if (!this.isConfigured()) {
      throw new Error('MarineTraffic API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/exportvessel/v:8/${this.apiKey}/protocol:json/mmsi:${mmsi}`
      );

      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }

      const vessel = data[0];
      return {
        mmsi: vessel.MMSI,
        imo: vessel.IMO,
        shipName: vessel.SHIPNAME,
        lat: parseFloat(vessel.LAT),
        lon: parseFloat(vessel.LON),
        speed: parseFloat(vessel.SPEED),
        course: parseFloat(vessel.COURSE),
        heading: vessel.HEADING ? parseFloat(vessel.HEADING) : undefined,
        status: parseInt(vessel.STATUS),
        lastUpdate: vessel.TIMESTAMP,
        destination: vessel.DESTINATION,
        eta: vessel.ETA,
        shipType: vessel.TYPE,
        length: vessel.LENGTH,
        width: vessel.WIDTH,
        draft: vessel.DRAUGHT,
      };
    } catch (error) {
      console.error('MarineTraffic getVesselPosition error:', error);
      throw error;
    }
  }

  /**
   * Get vessels in area (bounding box)
   */
  async getVesselsInArea(
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number
  ): Promise<VesselPosition[]> {
    if (!this.isConfigured()) {
      throw new Error('MarineTraffic API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/exportvessels/v:8/${this.apiKey}/protocol:json` +
        `/minlat:${minLat}/minlon:${minLon}/maxlat:${maxLat}/maxlon:${maxLon}`
      );

      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((vessel: any) => ({
        mmsi: vessel.MMSI,
        imo: vessel.IMO,
        shipName: vessel.SHIPNAME,
        lat: parseFloat(vessel.LAT),
        lon: parseFloat(vessel.LON),
        speed: parseFloat(vessel.SPEED),
        course: parseFloat(vessel.COURSE),
        heading: vessel.HEADING ? parseFloat(vessel.HEADING) : undefined,
        status: parseInt(vessel.STATUS),
        lastUpdate: vessel.TIMESTAMP,
        destination: vessel.DESTINATION,
        shipType: vessel.TYPE,
      }));
    } catch (error) {
      console.error('MarineTraffic getVesselsInArea error:', error);
      throw error;
    }
  }

  /**
   * Get vessel details by MMSI or IMO
   */
  async getVesselDetails(identifier: number, useImo: boolean = false): Promise<VesselDetails | null> {
    if (!this.isConfigured()) {
      throw new Error('MarineTraffic API key not configured');
    }

    try {
      const param = useImo ? `imo:${identifier}` : `mmsi:${identifier}`;
      const response = await fetch(
        `${this.baseUrl}/vessel-particulars/v:8/${this.apiKey}/protocol:json/${param}`
      );

      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }

      const vessel = data[0];
      return {
        mmsi: vessel.MMSI,
        imo: vessel.IMO,
        shipName: vessel.SHIPNAME,
        shipType: vessel.TYPE_NAME,
        flag: vessel.FLAG,
        callSign: vessel.CALLSIGN,
        length: vessel.LENGTH,
        width: vessel.WIDTH,
        yearBuilt: vessel.YEAR_BUILT,
        grossTonnage: vessel.GT,
        deadweight: vessel.DWT,
        homePort: vessel.HOME_PORT,
        owner: vessel.OWNER_NAME,
      };
    } catch (error) {
      console.error('MarineTraffic getVesselDetails error:', error);
      throw error;
    }
  }

  /**
   * Get vessels near a point
   */
  async getVesselsNearPoint(
    lat: number,
    lon: number,
    radiusKm: number = 10
  ): Promise<VesselPosition[]> {
    // Calculate bounding box from center point and radius
    const latDelta = radiusKm / 111; // 1 degree lat ≈ 111 km
    const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return this.getVesselsInArea(
      lat - latDelta,
      lon - lonDelta,
      lat + latDelta,
      lon + lonDelta
    );
  }

  /**
   * Get port information
   */
  async getPortInfo(portId: number): Promise<PortInfo | null> {
    if (!this.isConfigured()) {
      throw new Error('MarineTraffic API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/portcalls/v:8/${this.apiKey}/protocol:json/portid:${portId}`
      );

      if (!response.ok) {
        throw new Error(`MarineTraffic API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }

      const port = data[0];
      return {
        portId: port.PORT_ID,
        portName: port.PORT_NAME,
        country: port.COUNTRY,
        lat: parseFloat(port.LAT),
        lon: parseFloat(port.LON),
        arrivals: port.ARRIVALS,
        departures: port.DEPARTURES,
      };
    } catch (error) {
      console.error('MarineTraffic getPortInfo error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between vessel and point (in km)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get vessel status description
   */
  getStatusDescription(status: number): string {
    const statuses: Record<number, string> = {
      0: 'Em Navegação (Motor)',
      1: 'Ancorado',
      2: 'Fora de Controle',
      3: 'Manobrabilidade Restrita',
      4: 'Restrito por Calado',
      5: 'Atracado',
      6: 'Encalhado',
      7: 'Pesca',
      8: 'Navegação a Vela',
      11: 'Rebocando',
      12: 'Empurrando',
      15: 'Não Definido',
    };
    return statuses[status] || 'Desconhecido';
  }

  /**
   * Check for collision risk between vessels
   */
  checkCollisionRisk(
    vessel1: VesselPosition,
    vessel2: VesselPosition,
    timeMinutes: number = 30
  ): {
    risk: boolean;
    closestApproach: number;
    timeToClosestApproach: number;
  } {
    // Calculate predicted positions after timeMinutes
    const hoursAhead = timeMinutes / 60;
    
    // Convert speed from knots to km/h and calculate distance traveled
    const dist1 = (vessel1.speed * 1.852) * hoursAhead;
    const dist2 = (vessel2.speed * 1.852) * hoursAhead;
    
    // Calculate future positions (simplified linear projection)
    const lat1Future = vessel1.lat + (dist1 / 111) * Math.cos(vessel1.course * Math.PI / 180);
    const lon1Future = vessel1.lon + (dist1 / 111) * Math.sin(vessel1.course * Math.PI / 180);
    const lat2Future = vessel2.lat + (dist2 / 111) * Math.cos(vessel2.course * Math.PI / 180);
    const lon2Future = vessel2.lon + (dist2 / 111) * Math.sin(vessel2.course * Math.PI / 180);
    
    const closestApproach = this.calculateDistance(lat1Future, lon1Future, lat2Future, lon2Future);
    
    // Risk if vessels will be within 1 nautical mile (1.852 km)
    const risk = closestApproach < 1.852;
    
    return {
      risk,
      closestApproach,
      timeToClosestApproach: timeMinutes,
    };
  }
}

// Export singleton instance
export const marineTrafficService = new MarineTrafficService();
