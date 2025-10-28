/**
 * PATCH 399 - Satellite Tracker Service
 * Real-time satellite tracking with N2YO API integration
 */

import { supabase } from "@/integrations/supabase/client";

export interface SatellitePosition {
  satelliteId: string;
  satelliteName: string;
  lat: number;
  lng: number;
  altitudeKm: number;
  velocityKmh: number;
  azimuth: number;
  elevation: number;
  orbitType?: string;
  visibility: "visible" | "eclipsed" | "unknown";
  signalStrength?: number;
  trackedAt: string;
}

export interface SatelliteStatus {
  satelliteId: string;
  satelliteName: string;
  status: "operational" | "degraded" | "offline" | "decommissioned";
  lastContact?: string;
  nextPass?: string;
  passDuration?: string;
  currentRegion?: string;
  coverageRegions: string[];
  healthScore: number;
  activeConnections: number;
}

export class SatelliteTrackerService {
  private apiKey: string | null = null;
  private apiEndpoint = "https://api.n2yo.com/rest/v1/satellite";
  
  constructor() {
    // Get API key from environment
    this.apiKey = import.meta.env.VITE_N2YO_API_KEY || null;
  }

  /**
   * Track satellite by NORAD ID
   */
  async trackSatellite(
    noradId: string,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    seconds: number = 300
  ): Promise<SatellitePosition | null> {
    try {
      // If no API key, use mock data
      if (!this.apiKey) {
        console.warn("N2YO API key not configured, using mock data");
        return this.getMockSatellitePosition(noradId);
      }

      // Call N2YO API
      const url = `${this.apiEndpoint}/positions/${noradId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}/&apiKey=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.positions || data.positions.length === 0) {
        throw new Error("No position data received");
      }

      // Get the most recent position
      const position = data.positions[0];

      const satellitePosition: SatellitePosition = {
        satelliteId: noradId,
        satelliteName: data.info.satname,
        lat: position.satlatitude,
        lng: position.satlongitude,
        altitudeKm: position.sataltitude,
        velocityKmh: 0, // N2YO doesn't provide this directly
        azimuth: position.azimuth,
        elevation: position.elevation,
        visibility: position.eclipsed ? "eclipsed" : "visible",
        trackedAt: new Date(position.timestamp * 1000).toISOString(),
      };

      // Store tracking log
      await this.logSatelliteTracking(satellitePosition);

      return satellitePosition;
    } catch (error) {
      console.error("Error tracking satellite:", error);
      return this.getMockSatellitePosition(noradId);
    }
  }

  /**
   * Get satellite TLE (Two-Line Element) data
   */
  async getSatelliteTLE(noradId: string): Promise<{ line1: string; line2: string } | null> {
    try {
      if (!this.apiKey) {
        return this.getMockTLE(noradId);
      }

      const url = `${this.apiEndpoint}/tle/${noradId}&apiKey=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TLE request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        line1: data.tle.split('\n')[1],
        line2: data.tle.split('\n')[2],
      };
    } catch (error) {
      console.error("Error fetching TLE:", error);
      return this.getMockTLE(noradId);
    }
  }

  /**
   * Get satellites above a location
   */
  async getSatellitesAbove(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    searchRadius: number = 70,
    categoryId: number = 0
  ): Promise<SatellitePosition[]> {
    try {
      if (!this.apiKey) {
        return this.getMockSatellitesAbove();
      }

      const url = `${this.apiEndpoint}/above/${observerLat}/${observerLng}/${observerAlt}/${searchRadius}/${categoryId}&apiKey=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.above || data.above.length === 0) {
        return [];
      }

      return data.above.map((sat: any) => ({
        satelliteId: sat.satid.toString(),
        satelliteName: sat.satname,
        lat: sat.satlat,
        lng: sat.satlng,
        altitudeKm: sat.satalt,
        velocityKmh: 0,
        azimuth: 0,
        elevation: 0,
        visibility: "visible" as const,
        trackedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting satellites above:", error);
      return this.getMockSatellitesAbove();
    }
  }

  /**
   * Update satellite status
   */
  async updateSatelliteStatus(status: SatelliteStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("satellite_status")
        .upsert({
          satellite_id: status.satelliteId,
          satellite_name: status.satelliteName,
          status: status.status,
          last_contact: status.lastContact,
          next_pass: status.nextPass,
          pass_duration: status.passDuration,
          current_region: status.currentRegion,
          coverage_regions: status.coverageRegions,
          health_score: status.healthScore,
          active_connections: status.activeConnections,
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error updating satellite status:", error);
      return false;
    }
  }

  /**
   * Get satellite status from database
   */
  async getSatelliteStatus(satelliteId: string): Promise<SatelliteStatus | null> {
    try {
      const { data, error } = await supabase
        .from("satellite_status")
        .select("*")
        .eq("satellite_id", satelliteId)
        .single();

      if (error) throw error;

      return {
        satelliteId: data.satellite_id,
        satelliteName: data.satellite_name,
        status: data.status,
        lastContact: data.last_contact,
        nextPass: data.next_pass,
        passDuration: data.pass_duration,
        currentRegion: data.current_region,
        coverageRegions: data.coverage_regions || [],
        healthScore: data.health_score,
        activeConnections: data.active_connections,
      };
    } catch (error) {
      console.error("Error fetching satellite status:", error);
      return null;
    }
  }

  /**
   * Get all satellite statuses
   */
  async getAllSatelliteStatuses(): Promise<SatelliteStatus[]> {
    try {
      const { data, error } = await supabase
        .from("satellite_status")
        .select("*")
        .order("satellite_name");

      if (error) throw error;

      return (data || []).map((item) => ({
        satelliteId: item.satellite_id,
        satelliteName: item.satellite_name,
        status: item.status,
        lastContact: item.last_contact,
        nextPass: item.next_pass,
        passDuration: item.pass_duration,
        currentRegion: item.current_region,
        coverageRegions: item.coverage_regions || [],
        healthScore: item.health_score,
        activeConnections: item.active_connections,
      }));
    } catch (error) {
      console.error("Error fetching satellite statuses:", error);
      return [];
    }
  }

  /**
   * Get tracking history for a satellite
   */
  async getTrackingHistory(
    satelliteId: string,
    limit: number = 100
  ): Promise<SatellitePosition[]> {
    try {
      const { data, error } = await supabase
        .from("satellite_tracking_logs")
        .select("*")
        .eq("satellite_id", satelliteId)
        .order("tracked_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        satelliteId: item.satellite_id,
        satelliteName: item.satellite_name,
        lat: parseFloat(item.position_lat),
        lng: parseFloat(item.position_lng),
        altitudeKm: parseFloat(item.altitude_km),
        velocityKmh: parseFloat(item.velocity_kmh) || 0,
        azimuth: parseFloat(item.azimuth) || 0,
        elevation: parseFloat(item.elevation) || 0,
        orbitType: item.orbit_type,
        visibility: item.visibility || "unknown",
        signalStrength: item.signal_strength,
        trackedAt: item.tracked_at,
      }));
    } catch (error) {
      console.error("Error fetching tracking history:", error);
      return [];
    }
  }

  /**
   * Log satellite tracking data to database
   */
  private async logSatelliteTracking(position: SatellitePosition): Promise<void> {
    try {
      await supabase.from("satellite_tracking_logs").insert({
        satellite_id: position.satelliteId,
        satellite_name: position.satelliteName,
        position_lat: position.lat,
        position_lng: position.lng,
        altitude_km: position.altitudeKm,
        velocity_kmh: position.velocityKmh,
        azimuth: position.azimuth,
        elevation: position.elevation,
        orbit_type: position.orbitType,
        visibility: position.visibility,
        signal_strength: position.signalStrength,
        tracked_at: position.trackedAt,
        api_source: this.apiKey ? "N2YO" : "MOCK",
      });
    } catch (error) {
      console.error("Error logging satellite tracking:", error);
    }
  }

  /**
   * Mock satellite position data
   */
  private getMockSatellitePosition(noradId: string): SatellitePosition {
    return {
      satelliteId: noradId,
      satelliteName: `SAT-${noradId}`,
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      altitudeKm: 400 + Math.random() * 200,
      velocityKmh: 27000 + Math.random() * 1000,
      azimuth: Math.random() * 360,
      elevation: Math.random() * 90,
      orbitType: "LEO",
      visibility: "visible",
      signalStrength: 70 + Math.floor(Math.random() * 30),
      trackedAt: new Date().toISOString(),
    };
  }

  /**
   * Mock TLE data
   */
  private getMockTLE(noradId: string): { line1: string; line2: string } {
    return {
      line1: `1 ${noradId}U 98067A   21001.00000000  .00000000  00000-0  00000-0 0  0000`,
      line2: `2 ${noradId}  51.6400 000.0000 0000000   0.0000 000.0000 15.00000000000000`,
    };
  }

  /**
   * Mock satellites above data
   */
  private getMockSatellitesAbove(): SatellitePosition[] {
    const mockSatellites = ["25544", "48274", "43013"];
    return mockSatellites.map((id) => this.getMockSatellitePosition(id));
  }
}

export const satelliteTrackerService = new SatelliteTrackerService();
