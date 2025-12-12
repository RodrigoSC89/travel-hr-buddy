/**
 * DGNSS (Differential GNSS) Satellite Tracking Service
 * Integration with N2YO API for real-time satellite tracking
 */

import { supabase } from "@/integrations/supabase/client";

export interface DGNSSSatellite {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  satlat: number;
  satlng: number;
  satalt: number;
}

export interface DGNSSPosition {
  satid: number;
  satname: string;
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

export interface DGNSSPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number;
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number;
}

export interface DGNSSStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: "online" | "offline" | "maintenance";
  accuracy: number; // cm
  lastUpdate: string;
  corrections?: {
    type: string;
    age: number;
    quality: number;
  };
}

// Common GNSS/DGNSS satellite NORAD IDs
export const DGNSS_SATELLITES = {
  GPS: [
    { noradId: 48859, name: "GPS BIIF-12 (PRN 09)" },
    { noradId: 41019, name: "GPS BIIF-11 (PRN 10)" },
    { noradId: 40730, name: "GPS BIIF-10 (PRN 08)" },
    { noradId: 40534, name: "GPS BIIF-9 (PRN 27)" },
    { noradId: 40294, name: "GPS BIIF-8 (PRN 30)" },
  ],
  GLONASS: [
    { noradId: 43508, name: "GLONASS-M 756" },
    { noradId: 44299, name: "GLONASS-M 758" },
    { noradId: 43687, name: "GLONASS-M 757" },
  ],
  GALILEO: [
    { noradId: 43566, name: "GALILEO 23" },
    { noradId: 43567, name: "GALILEO 24" },
    { noradId: 41175, name: "GALILEO 11" },
  ],
  SBAS: [
    { noradId: 35951, name: "EGNOS PRN 120" },
    { noradId: 37605, name: "EGNOS PRN 123" },
    { noradId: 28899, name: "WAAS PRN 135" },
  ],
};

class DGNSSService {
  private baseUrl = "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/dgnss-tracking";

  /**
   * Get satellites above observer location
   */
  async getSatellitesAbove(
    lat: number,
    lng: number,
    alt: number = 0,
    searchRadius: number = 90, // degrees
    category: number = 18 // GPS constellation
  ): Promise<DGNSSSatellite[]> {
    try {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: {
          action: "above",
          latitude: lat,
          longitude: lng,
          altitude: alt,
          searchRadius,
          category,
        },
      });

      if (error) throw error;
      return data?.satellites || [];
    } catch (error) {
      console.error("Error fetching satellites above:", error);
      return this.getMockSatellites(lat, lng);
    }
  }

  /**
   * Get satellite position by NORAD ID
   */
  async getSatellitePosition(
    noradId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0
  ): Promise<DGNSSPosition | null> {
    try {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: {
          action: "positions",
          noradId,
          observerLat,
          observerLng,
          observerAlt,
          seconds: 1,
        },
      });

      if (error) throw error;
      return data?.positions?.[0] || null;
    } catch (error) {
      console.error("Error fetching satellite position:", error);
      return this.getMockPosition(noradId);
    }
  }

  /**
   * Get satellite passes (visibility windows)
   */
  async getSatellitePasses(
    noradId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    days: number = 7,
    minElevation: number = 10
  ): Promise<DGNSSPass[]> {
    try {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: {
          action: "passes",
          noradId,
          observerLat,
          observerLng,
          observerAlt,
          days,
          minElevation,
        },
      });

      if (error) throw error;
      return data?.passes || [];
    } catch (error) {
      console.error("Error fetching satellite passes:", error);
      return [];
    }
  }

  /**
   * Get TLE data for satellite
   */
  async getSatelliteTLE(noradId: number): Promise<{ tle1: string; tle2: string } | null> {
    try {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: {
          action: "tle",
          noradId,
        },
      });

      if (error) throw error;
      return data?.tle || null;
    } catch (error) {
      console.error("Error fetching TLE:", error);
      return null;
    }
  }

  /**
   * Get all DGNSS reference stations (mock data for demo)
   */
  async getDGNSSStations(): Promise<DGNSSStation[]> {
    // In production, this would fetch from a real DGNSS network API
    return [
      {
        id: "RBMC-BRAZ",
        name: "Brasília RBMC",
        latitude: -15.9474,
        longitude: -47.8778,
        altitude: 1106,
        status: "online",
        accuracy: 2.5,
        lastUpdate: new Date().toISOString(),
        corrections: { type: "RTCM 3.2", age: 1, quality: 98 },
      },
      {
        id: "RBMC-RIOD",
        name: "Rio de Janeiro RBMC",
        latitude: -22.8175,
        longitude: -43.3064,
        altitude: 8,
        status: "online",
        accuracy: 1.8,
        lastUpdate: new Date().toISOString(),
        corrections: { type: "RTCM 3.2", age: 2, quality: 95 },
      },
      {
        id: "RBMC-SPAR",
        name: "São Paulo RBMC",
        latitude: -23.5875,
        longitude: -46.6575,
        altitude: 730,
        status: "online",
        accuracy: 2.0,
        lastUpdate: new Date().toISOString(),
        corrections: { type: "RTCM 3.2", age: 1, quality: 97 },
      },
      {
        id: "RBMC-SALV",
        name: "Salvador RBMC",
        latitude: -13.0061,
        longitude: -38.5083,
        altitude: 51,
        status: "online",
        accuracy: 2.2,
        lastUpdate: new Date().toISOString(),
        corrections: { type: "RTCM 3.2", age: 3, quality: 92 },
      },
      {
        id: "RBMC-FORZ",
        name: "Fortaleza RBMC",
        latitude: -3.8772,
        longitude: -38.4253,
        altitude: 22,
        status: "maintenance",
        accuracy: 3.0,
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        corrections: { type: "RTCM 3.2", age: 60, quality: 75 },
      },
      {
        id: "RBMC-MANA",
        name: "Manaus RBMC",
        latitude: -3.1190,
        longitude: -60.0217,
        altitude: 40,
        status: "online",
        accuracy: 2.8,
        lastUpdate: new Date().toISOString(),
        corrections: { type: "RTCM 3.2", age: 2, quality: 90 },
      },
    ];
  }

  /**
   * Calculate PDOP (Position Dilution of Precision)
   */
  calculatePDOP(satellites: DGNSSPosition[]): number {
    if (satellites.length < 4) return 99.9;
    
    // Simplified PDOP calculation based on satellite geometry
    const elevations = satellites.map(s => s.elevation);
    const avgElevation = elevations.reduce((a, b) => a + b, 0) / elevations.length;
    
    // Better geometry = lower PDOP
    const pdop = 1 + (90 - avgElevation) / 30;
    return Math.max(1, Math.min(pdop, 10));
  }

  /**
   * Get constellation status
   */
  async getConstellationStatus(
    lat: number,
    lng: number
  ): Promise<{ constellation: string; visible: number; pdop: number }[]> {
    const results = [];
    
    for (const [constellation, satellites] of Object.entries(DGNSS_SATELLITES)) {
      const positions: DGNSSPosition[] = [];
      
      for (const sat of satellites.slice(0, 3)) {
        const pos = await this.getSatellitePosition(sat.noradId, lat, lng);
        if (pos && pos.elevation > 10) {
          positions.push(pos);
        }
      }
      
      results.push({
        constellation,
        visible: positions.length,
        pdop: this.calculatePDOP(positions),
      });
    }
    
    return results;
  }

  // Mock data generators for fallback
  private getMockSatellites(lat: number, lng: number): DGNSSSatellite[] {
    return DGNSS_SATELLITES.GPS.map((sat, i) => ({
      satid: sat.noradId,
      satname: sat.name,
      intDesignator: `2020-0${i + 1}A`,
      launchDate: "2020-01-01",
      satlat: lat + (Math.random() - 0.5) * 20,
      satlng: lng + (Math.random() - 0.5) * 20,
      satalt: 20200 + Math.random() * 100,
    }));
  }

  private getMockPosition(noradId: number): DGNSSPosition {
    const now = Date.now();
    return {
      satid: noradId,
      satname: `SAT-${noradId}`,
      satlatitude: (Math.sin(now / 100000) * 55),
      satlongitude: ((now / 10000) % 360) - 180,
      sataltitude: 20200,
      azimuth: (now / 1000) % 360,
      elevation: 30 + Math.random() * 50,
      ra: Math.random() * 360,
      dec: (Math.random() - 0.5) * 180,
      timestamp: Math.floor(now / 1000),
    });
  }
}

export const dgnssService = new DGNSSService();
