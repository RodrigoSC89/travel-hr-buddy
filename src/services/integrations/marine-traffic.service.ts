/**
 * MarineTraffic AIS Integration Service
 * Real-time vessel tracking via MarineTraffic API
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface VesselAISData {
  mmsi: string;
  imo: string;
  name: string;
  shipType: number;
  shipTypeName: string;
  callsign: string;
  flag: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  navStatus: number;
  navStatusName: string;
  destination: string;
  eta: string;
  draught: number;
  lastUpdate: string;
}

export interface AISSearchParams {
  mmsi?: string;
  imo?: string;
  name?: string;
  area?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

/**
 * Fetch vessel position from AIS via Edge Function
 */
export async function getVesselPosition(imo: string): Promise<VesselAISData | null> {
  try {
    const { data, error } = await supabase.functions.invoke("marine-traffic", {
      body: { action: "position", imo },
    });

    if (error) throw error;
    return data?.vessel || null;
  } catch (err) {
    logger.error("[AIS] Failed to fetch vessel position", { imo, error: err });
    return null;
  }
}

/**
 * Fetch multiple vessels in an area
 */
export async function getVesselsInArea(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): Promise<VesselAISData[]> {
  try {
    const { data, error } = await supabase.functions.invoke("marine-traffic", {
      body: {
        action: "area",
        area: { minLat, maxLat, minLon, maxLon },
      },
    });

    if (error) throw error;
    return data?.vessels || [];
  } catch (err) {
    logger.error("[AIS] Failed to fetch vessels in area", { error: err });
    return [];
  }
}

/**
 * Get vessel track history
 */
export async function getVesselTrack(
  imo: string,
  days: number = 7
): Promise<Array<{ lat: number; lon: number; timestamp: string }>> {
  try {
    const { data, error } = await supabase.functions.invoke("marine-traffic", {
      body: { action: "track", imo, days },
    });

    if (error) throw error;
    return data?.track || [];
  } catch (err) {
    logger.error("[AIS] Failed to fetch vessel track", { imo, error: err });
    return [];
  }
}

/**
 * Calculate ETA to destination
 */
export function calculateETA(
  currentLat: number,
  currentLon: number,
  destLat: number,
  destLon: number,
  speedKnots: number
): Date | null {
  if (speedKnots <= 0) return null;

  // Haversine formula for distance
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((destLat - currentLat) * Math.PI) / 180;
  const dLon = ((destLon - currentLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((currentLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  const hoursToArrival = distance / speedKnots;
  const eta = new Date();
  eta.setHours(eta.getHours() + hoursToArrival);

  return eta;
}

/**
 * Get navigation status description
 */
export function getNavStatusName(status: number): string {
  const statuses: Record<number, string> = {
    0: "Em navegação (motor)",
    1: "Fundeado",
    2: "Sem comando",
    3: "Manobrabilidade restrita",
    4: "Restrito por calado",
    5: "Atracado",
    6: "Encalhado",
    7: "Pescando",
    8: "Em navegação (vela)",
    9: "Reservado",
    10: "Reservado",
    11: "Em reboque",
    12: "Reservado",
    13: "Reservado",
    14: "AIS-SART (emergência)",
    15: "Indefinido",
  };
  return statuses[status] || "Indefinido";
}

/**
 * Check if API is available
 */
export async function checkAISAvailability(): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("marine-traffic", {
      body: { action: "health" },
    });
    return !error;
  } catch {
    return false;
  }
}

export default {
  getVesselPosition,
  getVesselsInArea,
  getVesselTrack,
  calculateETA,
  getNavStatusName,
  checkAISAvailability,
};
