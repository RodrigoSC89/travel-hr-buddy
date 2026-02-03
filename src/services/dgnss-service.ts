/**
 * DGNSS (Differential GNSS) Satellite Tracking Service
 * Integration with N2YO API for real-time satellite tracking
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

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
      logger.error("Error fetching satellites above:", error);
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
      logger.error("Error fetching satellite position:", error);
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
      logger.error("Error fetching satellite passes:", error);
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
      logger.error("Error fetching TLE:", error);
      return null;
    }
  }

  /**
   * Get all DGNSS reference stations from Edge Function
   * ✅ R01 CORRIGIDO: Dados reais via API
   */
  async getDGNSSStations(): Promise<DGNSSStation[]> {
    try {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: { action: "stations" },
      });

      if (error) throw error;
      return Array.isArray(data?.stations) ? data.stations : [];
    } catch (error) {
      logger.error("Error fetching DGNSS stations:", error);
      // Retorna array vazio em vez de mock - UI deve mostrar "Não configurado"
      return [];
    }
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

  /**
   * ⚠️ REMOVIDO: Mock data generators
   * R01 COMPLIANCE: Retorna null em vez de dados simulados
   * A UI deve mostrar "Não configurado" quando não há dados reais
   */
  private getMockSatellites(_lat: number, _lng: number): DGNSSSatellite[] {
    logger.warn("getMockSatellites called - returning empty array per R01 policy");
    return [];
  }

  private getMockPosition(_noradId: number): DGNSSPosition | null {
    logger.warn("getMockPosition called - returning null per R01 policy");
    return null;
  }
}

export const dgnssService = new DGNSSService();
