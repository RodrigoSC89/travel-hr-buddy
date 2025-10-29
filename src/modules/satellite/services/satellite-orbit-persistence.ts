// @ts-nocheck
/**
 * PATCH 274 - Satellite Orbit Persistence Service
 * Persists satellite orbital data to Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import { SatelliteOrbitData } from "./satellite-orbit-service";

export class SatelliteOrbitPersistence {
  
  async saveSatelliteOrbits(orbits: SatelliteOrbitData[]) {
    try {
      const upsertData = orbits.map(orbit => ({
        norad_id: parseInt(orbit.noradId),
        name: orbit.name,
        latitude: orbit.latitude,
        longitude: orbit.longitude,
        altitude: orbit.altitude,
        velocity: orbit.velocity,
        orbital_period: orbit.orbitalPeriod,
        inclination: orbit.inclination,
        eccentricity: orbit.eccentricity,
        tle_line1: orbit.tleLine1,
        tle_line2: orbit.tleLine2,
        last_updated: orbit.lastUpdated.toISOString()
      }));

      const { data, error } = await supabase
        .from("satellite_orbits")
        .upsert(upsertData, { onConflict: "norad_id" })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving satellite orbits:", error);
      throw error;
    }
  }

  async getSatelliteOrbits(): Promise<SatelliteOrbitData[]> {
    try {
      const { data, error } = await supabase
        .from("satellite_orbits")
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        noradId: row.norad_id.toString(),
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        altitude: row.altitude,
        velocity: row.velocity,
        orbitalPeriod: row.orbital_period || 90,
        inclination: row.inclination || 0,
        eccentricity: row.eccentricity || 0,
        tleLine1: row.tle_line1 || "",
        tleLine2: row.tle_line2 || "",
        lastUpdated: new Date(row.last_updated)
      }));
    } catch (error) {
      console.error("Error fetching satellite orbits:", error);
      return [];
    }
  }

  async getSatelliteByNoradId(noradId: string): Promise<SatelliteOrbitData | null> {
    try {
      const { data, error } = await supabase
        .from("satellite_orbits")
        .select("*")
        .eq("norad_id", parseInt(noradId))
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        noradId: data.norad_id.toString(),
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
        orbitalPeriod: data.orbital_period || 90,
        inclination: data.inclination || 0,
        eccentricity: data.eccentricity || 0,
        tleLine1: data.tle_line1 || "",
        tleLine2: data.tle_line2 || "",
        lastUpdated: new Date(data.last_updated)
      };
    } catch (error) {
      console.error("Error fetching satellite by NORAD ID:", error);
      return null;
    }
  }
}

export const satelliteOrbitPersistence = new SatelliteOrbitPersistence();
