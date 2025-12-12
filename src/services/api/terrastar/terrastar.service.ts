/**
 * Terrastar Ionosphere API Integration Service
 * GPS/GNSS Ionospheric Correction and Monitoring System
 * Real-time ionospheric data for precise maritime navigation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface TerrastarIonosphereData {
  timestamp: string;
  latitude: number;
  longitude: number;
  vtec: number; // Vertical Total Electron Content
  stec: number; // Slant Total Electron Content
  ionospheric_delay: number; // milliseconds
  correction_type: "L1" | "L2" | "L5";
  quality_indicator: number; // 0-100
  satellite_count: number;
}

export interface TerrastarCorrection {
  id?: string;
  vessel_id: string;
  position_lat: number;
  position_lon: number;
  timestamp: string;
  vtec_correction: number;
  horizontal_accuracy: number; // meters
  vertical_accuracy: number; // meters
  correction_age: number; // seconds
  service_level: "BASIC" | "PREMIUM" | "RTK";
  signal_quality: number;
}

export interface TerrastarAlert {
  id?: string;
  vessel_id: string;
  alert_type: "IONOSPHERIC_STORM" | "SIGNAL_DEGRADATION" | "CORRECTION_UNAVAILABLE" | "ACCURACY_WARNING";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  affected_area: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  timestamp: string;
  expires_at?: string;
  acknowledged: boolean;
}

export interface TerrastarAPIConfig {
  apiKey: string;
  apiUrl: string;
  serviceLevel: "BASIC" | "PREMIUM" | "RTK";
}

/**
 * Get Terrastar API configuration
 */
function getTerrastarConfig(): TerrastarAPIConfig {
  const apiKey = (import.meta as any).env.VITE_TERRASTAR_API_KEY as string;
  const apiUrl = (import.meta as any).env.VITE_TERRASTAR_API_URL as string || "https://api.terrastar.hexagon.com/v2";
  const serviceLevel = ((import.meta as any).env.VITE_TERRASTAR_SERVICE_LEVEL as string || "PREMIUM") as "BASIC" | "PREMIUM" | "RTK";

  if (!apiKey) {
    throw new Error("Terrastar API key not configured");
  }

  return { apiKey, apiUrl, serviceLevel };
}

/**
 * Get current ionospheric data for vessel position
 */
export async function getIonosphericData(
  latitude: number,
  longitude: number,
  altitude: number = 0
): Promise<TerrastarIonosphereData> {
  try {
    const config = getTerrastarConfig();

    const response = await fetch(`${config.apiUrl}/ionosphere/data`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
        altitude,
        service_level: config.serviceLevel,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terrastar API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    const ionosphereData: TerrastarIonosphereData = {
      timestamp: data.timestamp,
      latitude: data.position.latitude,
      longitude: data.position.longitude,
      vtec: data.ionosphere.vtec,
      stec: data.ionosphere.stec,
      ionospheric_delay: data.ionosphere.delay_ms,
      correction_type: data.correction.type,
      quality_indicator: data.quality.indicator,
      satellite_count: data.quality.satellite_count,
    };

    return ionosphereData;
  } catch (error) {
    logger.error("Error fetching ionospheric data", error as Error, { latitude, longitude, altitude });
    throw error;
  }
}

/**
 * Request position correction from Terrastar
 */
export async function requestPositionCorrection(
  vesselId: string,
  latitude: number,
  longitude: number,
  altitude: number = 0
): Promise<TerrastarCorrection> {
  try {
    const config = getTerrastarConfig();

    const response = await fetch(`${config.apiUrl}/corrections/position`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
        altitude,
        service_level: config.serviceLevel,
        request_time: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Terrastar API error: ${response.status}`);
    }

    const data = await response.json();

    const correction: TerrastarCorrection = {
      vessel_id: vesselId,
      position_lat: data.corrected_position.latitude,
      position_lon: data.corrected_position.longitude,
      timestamp: data.timestamp,
      vtec_correction: data.corrections.vtec,
      horizontal_accuracy: data.accuracy.horizontal,
      vertical_accuracy: data.accuracy.vertical,
      correction_age: data.correction_age_seconds,
      service_level: config.serviceLevel,
      signal_quality: data.signal_quality,
    };

    // Store correction in database
    await supabase
      .from("terrastar_corrections")
      .insert(correction as any);

    return correction;
  } catch (error) {
    logger.error("Error requesting position correction", error as Error, { vesselId, latitude, longitude });
    throw error;
  }
}

/**
 * Subscribe to ionospheric alerts for vessel area
 */
export async function subscribeToIonosphericAlerts(
  vesselId: string,
  boundingBox: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  }
): Promise<{ subscription_id: string }> {
  try {
    const config = getTerrastarConfig();

    const response = await fetch(`${config.apiUrl}/alerts/subscribe`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vessel_id: vesselId,
        area: boundingBox,
        alert_types: ["IONOSPHERIC_STORM", "SIGNAL_DEGRADATION", "CORRECTION_UNAVAILABLE"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Terrastar API error: ${response.status}`);
    }

    const data = await response.json();

    // Store subscription
    await (supabase as any)
      .from("terrastar_alert_subscriptions")
      .insert({
        vessel_id: vesselId,
        subscription_id: data.subscription_id,
        bounding_box: boundingBox,
        created_at: new Date().toISOString(),
      });

    return { subscription_id: data.subscription_id };
  } catch (error) {
    logger.error("Error subscribing to alerts", error as Error, { vesselId, boundingBox });
    throw error;
  }
}

/**
 * Get active ionospheric alerts for vessel
 */
export async function getActiveAlerts(vesselId: string): Promise<TerrastarAlert[]> {
  try {
    const { data: alerts, error } = await (supabase as any)
      .from("terrastar_alerts")
      .select("*")
      .eq("vessel_id", vesselId)
      .eq("acknowledged", false)
      .gte("expires_at", new Date().toISOString())
      .order("severity", { ascending: false });

    if (error) throw error;

    return (alerts || []) as TerrastarAlert[];
  } catch (error) {
    logger.error("Error fetching active alerts", error as Error, { vesselId });
    return [];
  }
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from("terrastar_alerts")
      .update({ acknowledged: true })
      .eq("id", alertId);

    if (error) throw error;

    return true;
  } catch (error) {
    logger.error("Error acknowledging alert", error as Error, { alertId });
    return false;
  }
}

/**
 * Get ionospheric conditions forecast
 */
export async function getIonosphericForecast(
  latitude: number,
  longitude: number,
  hours: number = 24
): Promise<{
  forecast: Array<{
    timestamp: string;
    vtec_predicted: number;
    confidence: number;
    condition: "quiet" | "unsettled" | "active" | "storm";
  }>;
}> {
  try {
    const config = getTerrastarConfig();

    const response = await fetch(`${config.apiUrl}/ionosphere/forecast`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude,
        longitude,
        forecast_hours: hours,
      }),
    });

    if (!response.ok) {
      throw new Error(`Terrastar API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error fetching ionospheric forecast", error as Error, { latitude, longitude, hours });
    throw error;
  }
}

/**
 * Get correction statistics for vessel
 */
export async function getCorrectionStatistics(
  vesselId: string,
  days: number = 7
): Promise<{
  total_corrections: number;
  average_accuracy: number;
  max_accuracy: number;
  min_accuracy: number;
  average_correction_age: number;
  signal_quality_avg: number;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: corrections, error } = await supabase
      .from("terrastar_corrections")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte("timestamp", startDate.toISOString());

    if (error || !corrections || corrections.length === 0) {
      return {
        total_corrections: 0,
        average_accuracy: 0,
        max_accuracy: 0,
        min_accuracy: 0,
        average_correction_age: 0,
        signal_quality_avg: 0,
      };
    }

    const accuracies = corrections.map((c: any) => c.horizontal_accuracy);
    const correctionAges = corrections.map((c: any) => c.correction_age);
    const signalQualities = corrections.map((c: any) => c.signal_quality);

    return {
      total_corrections: corrections.length,
      average_accuracy: accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length,
      max_accuracy: Math.max(...accuracies),
      min_accuracy: Math.min(...accuracies),
      average_correction_age: correctionAges.reduce((a: number, b: number) => a + b, 0) / correctionAges.length,
      signal_quality_avg: signalQualities.reduce((a: number, b: number) => a + b, 0) / signalQualities.length,
    };
  } catch (error) {
    logger.error("Error getting correction statistics", error as Error, { vesselId, days });
    throw error;
  }
}

/**
 * Validate Terrastar service status
 */
export async function validateServiceStatus(): Promise<{
  available: boolean;
  service_level: string;
  latency_ms: number;
  message?: string;
}> {
  try {
    const config = getTerrastarConfig();
    const startTime = Date.now();

    const response = await fetch(`${config.apiUrl}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        available: false,
        service_level: config.serviceLevel,
        latency_ms: latency,
        message: `Service unavailable: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      available: data.status === "operational",
      service_level: config.serviceLevel,
      latency_ms: latency,
      message: data.message,
    };
  } catch (error) {
    return {
      available: false,
      service_level: "UNKNOWN",
      latency_ms: 0,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
