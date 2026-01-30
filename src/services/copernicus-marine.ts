/**
 * Copernicus Marine Service Integration
 * Access to satellite ocean data and marine environmental information
 * PATCH: Roadmap v3.2.0 - External APIs
 */

import { supabase } from "@/integrations/supabase/client";

export interface CopernicusMarineData {
  seaSurfaceTemperature: number;
  salinity: number;
  chlorophyll: number;
  seaIceConcentration: number;
  currentSpeed: number;
  currentDirection: number;
  waveHeight: number;
  wavePeriod: number;
  timestamp: string;
  source: string;
}

export interface CopernicusRequest {
  lat: number;
  lng: number;
  variables?: string[];
  startDate?: string;
  endDate?: string;
}

class CopernicusService {
  private cache = new Map<string, { data: CopernicusMarineData; timestamp: number }>();
  private cacheDuration = 60 * 60 * 1000; // 1 hour cache

  /**
   * Get marine environmental data for a location
   */
  async getMarineData(request: CopernicusRequest): Promise<CopernicusMarineData | null> {
    const cacheKey = `${request.lat},${request.lng}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log("[Copernicus] Returning cached data");
      return cached.data;
    }

    try {
      const { data, error } = await supabase.functions.invoke("copernicus-marine", {
        body: request,
      });

      if (error) throw error;

      const marineData = this.parseResponse(data);

      if (marineData) {
        this.cache.set(cacheKey, { data: marineData, timestamp: Date.now() });
      }

      return marineData;
    } catch (error) {
      console.error("[Copernicus] Error fetching marine data:", error);
      // Return fallback/demo data
      return this.getFallbackData(request);
    }
  }

  /**
   * Get sea surface temperature for a region
   */
  async getSeaSurfaceTemperature(lat: number, lng: number): Promise<number | null> {
    const data = await this.getMarineData({ lat, lng, variables: ["sst"] });
    return data?.seaSurfaceTemperature ?? null;
  }

  /**
   * Get ocean current data for navigation planning
   */
  async getOceanCurrents(lat: number, lng: number): Promise<{ speed: number; direction: number } | null> {
    const data = await this.getMarineData({ lat, lng, variables: ["currents"] });
    if (!data) return null;

    return {
      speed: data.currentSpeed,
      direction: data.currentDirection,
    };
  }

  /**
   * Assess environmental conditions for maritime operations
   */
  assessOperationalConditions(data: CopernicusMarineData): {
    suitable: boolean;
    concerns: string[];
    recommendations: string[];
  } {
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Sea temperature assessment
    if (data.seaSurfaceTemperature > 30) {
      concerns.push("Temperatura do mar elevada - risco de ciclones");
      recommendations.push("Monitorar boletins meteorológicos tropicais");
    }

    // Current assessment
    if (data.currentSpeed > 2) {
      concerns.push(`Corrente forte: ${data.currentSpeed.toFixed(1)} m/s`);
      recommendations.push("Ajustar rota para compensar deriva");
    }

    // Wave assessment
    if (data.waveHeight > 4) {
      concerns.push(`Ondas altas: ${data.waveHeight.toFixed(1)}m`);
      recommendations.push("Considerar adiamento de operações de carga");
    }

    // Ice assessment
    if (data.seaIceConcentration > 15) {
      concerns.push(`Presença de gelo: ${data.seaIceConcentration}%`);
      recommendations.push("Verificar classe de gelo da embarcação");
    }

    return {
      suitable: concerns.length === 0,
      concerns,
      recommendations,
    };
  }

  private parseResponse(response: unknown): CopernicusMarineData | null {
    if (!response || typeof response !== "object") return null;

    const data = response as Record<string, unknown>;

    return {
      seaSurfaceTemperature: Number(data.sst || data.seaSurfaceTemperature || 0),
      salinity: Number(data.salinity || 35),
      chlorophyll: Number(data.chlorophyll || 0.5),
      seaIceConcentration: Number(data.seaIce || data.seaIceConcentration || 0),
      currentSpeed: Number(data.currentSpeed || 0),
      currentDirection: Number(data.currentDirection || 0),
      waveHeight: Number(data.waveHeight || data.swh || 0),
      wavePeriod: Number(data.wavePeriod || 0),
      timestamp: String(data.timestamp || new Date().toISOString()),
      source: "Copernicus Marine Service",
    };
  }

  private getFallbackData(request: CopernicusRequest): CopernicusMarineData {
    // Generate realistic demo data based on location
    const baseTemp = 25 - Math.abs(request.lat) * 0.4;

    return {
      seaSurfaceTemperature: baseTemp + (Math.random() * 4 - 2),
      salinity: 35 + (Math.random() * 2 - 1),
      chlorophyll: 0.3 + Math.random() * 0.5,
      seaIceConcentration: request.lat > 60 || request.lat < -60 ? Math.random() * 30 : 0,
      currentSpeed: 0.3 + Math.random() * 0.8,
      currentDirection: Math.random() * 360,
      waveHeight: 1 + Math.random() * 2,
      wavePeriod: 6 + Math.random() * 4,
      timestamp: new Date().toISOString(),
      source: "Copernicus Marine Service (Demo)",
    };
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const copernicusService = new CopernicusService();
