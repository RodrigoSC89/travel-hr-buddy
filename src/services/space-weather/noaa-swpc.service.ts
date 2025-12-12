/**
 * NOAA SWPC (Space Weather Prediction Center) Integration
 * 
 * APIs públicas (sem autenticação):
 * - Planetary K-index (Kp) - observado e previsto
 * - Space Weather Alerts
 * - Solar Wind Plasma
 * - Magnetometer (GOES)
 * 
 * Base URL: https://services.swpc.noaa.gov
 * Documentação: https://www.swpc.noaa.gov/products
 */

import type {
  NOAAKpIndex,
  NOAAAlert,
  NOAASolarWind,
  NOAAMagnetometer,
  SpaceWeatherAPIResponse,
} from "@/types/space-weather.types";

const NOAA_BASE_URL = "https://services.swpc.noaa.gov";

// Cache simples em memória (15 min default)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires_at: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Generic fetch com cache
 */
async function fetchWithCache<T>(
  endpoint: string,
  cacheTTL: number = 15 * 60 * 1000 // 15 minutos
): Promise<SpaceWeatherAPIResponse<T>> {
  const now = Date.now();
  const cacheKey = endpoint;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expires_at > now) {
    return {
      success: true,
      data: cached.data,
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: true,
      cache_expires_at: new Date(cached.expires_at).toISOString(),
    };
  }
  
  // Fetch from API
  try {
    const response = await fetch(`${NOAA_BASE_URL}${endpoint}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: now,
      expires_at: now + cacheTTL,
    });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  }
}

// ============================================
// NOAA SWPC API Functions
// ============================================

/**
 * Get current and forecast Planetary K-index (Kp)
 * 
 * Kp scale (geomagnetic activity):
 * - 0-2: Quiet
 * - 3-4: Unsettled
 * - 5: Minor storm (G1)
 * - 6: Moderate storm (G2)
 * - 7: Strong storm (G3)
 * - 8: Severe storm (G4)
 * - 9: Extreme storm (G5)
 * 
 * @returns Array of Kp values (last 3 days + forecast)
 */
export async function getKpIndex(): Promise<SpaceWeatherAPIResponse<NOAAKpIndex[]>> {
  return fetchWithCache<NOAAKpIndex[]>(
    "/products/noaa-planetary-k-index.json",
    10 * 60 * 1000 // 10 min cache
  );
}

/**
 * Get current Kp value (most recent)
 */
export async function getCurrentKp(): Promise<number | null> {
  const response = await getKpIndex();
  
  if (!response.success || !response.data || response.data.length === 0) {
    return null;
  }
  
  // Last entry is most recent
  const latest = response.data[response.data.length - 1];
  return latest.kp;
}

/**
 * Get 3-hour Kp forecast
 */
export async function getKpForecast3h(): Promise<number | null> {
  const response = await fetchWithCache<number[][]>(
    "/products/noaa-estimated-planetary-k-index-1-minute.json",
    10 * 60 * 1000
  );
  
  if (!response.success || !response.data) {
    return null;
  }
  
  // Format: [[timestamp, kp], ...]
  // Get entry 3 hours ahead (180 minutes)
  const now = new Date();
  const target = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
  // Find closest entry
  let closestEntry = response.data[0];
  let minDiff = Math.abs(new Date(closestEntry[0]).getTime() - target.getTime());
  
  for (const entry of response.data) {
    const diff = Math.abs(new Date(entry[0]).getTime() - target.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestEntry = entry;
    }
  }
  
  return closestEntry[1];
}

/**
 * Get Space Weather Alerts
 * 
 * Tipos de alerts:
 * - WATA: Watch
 * - WARP: Warning  
 * - ALTP: Alert
 * - SUMO: Summary
 */
export async function getAlerts(): Promise<SpaceWeatherAPIResponse<NOAAAlert[]>> {
  return fetchWithCache<NOAAAlert[]>(
    "/products/alerts.json",
    5 * 60 * 1000 // 5 min cache (alerts são urgentes)
  );
}

/**
 * Get active critical alerts only
 */
export async function getCriticalAlerts(): Promise<NOAAAlert[]> {
  const response = await getAlerts();
  
  if (!response.success || !response.data) {
    return [];
  }
  
  // Filter para alertas críticos (Warning/Alert, não Watch ou Summary)
  return response.data.filter(alert => 
    alert.space_weather_message_code.includes("WARP") || 
    alert.space_weather_message_code.includes("ALTP")
  );
}

/**
 * Get Solar Wind Plasma data (1-day)
 * 
 * Densidade e velocidade do vento solar são indicadores
 * importantes de potenciais tempestades geomagnéticas.
 * 
 * High-speed streams (>500 km/s) podem causar atividade geomagnética.
 */
export async function getSolarWind(): Promise<SpaceWeatherAPIResponse<NOAASolarWind[]>> {
  return fetchWithCache<NOAASolarWind[]>(
    "/products/solar-wind/plasma-1-day.json",
    15 * 60 * 1000 // 15 min cache
  );
}

/**
 * Get current solar wind speed
 */
export async function getCurrentSolarWindSpeed(): Promise<number | null> {
  const response = await getSolarWind();
  
  if (!response.success || !response.data || response.data.length === 0) {
    return null;
  }
  
  // Last valid entry
  for (let i = response.data.length - 1; i >= 0; i--) {
    const entry = response.data[i];
    if (entry.speed > 0) { // valid data
      return entry.speed;
    }
  }
  
  return null;
}

/**
 * Get Magnetometer data (GOES satellite)
 * 
 * Bz component (southward) é crítico:
 * - Bz < -10 nT: Favorece reconexão magnética → tempestades
 * - Bz < -20 nT: Alto risco de tempestade geomagnética
 */
export async function getMagnetometer(): Promise<SpaceWeatherAPIResponse<NOAAMagnetometer[]>> {
  return fetchWithCache<NOAAMagnetometer[]>(
    "/products/solar-wind/mag-1-day.json",
    15 * 60 * 1000
  );
}

/**
 * Get current Bz GSM (critical for storms)
 */
export async function getCurrentBzGSM(): Promise<number | null> {
  const response = await getMagnetometer();
  
  if (!response.success || !response.data || response.data.length === 0) {
    return null;
  }
  
  // Last valid entry
  for (let i = response.data.length - 1; i >= 0; i--) {
    const entry = response.data[i];
    if (entry.bz_gsm !== null && entry.bz_gsm !== undefined) {
      return entry.bz_gsm;
    }
  }
  
  return null;
}

/**
 * Get 3-day Kp forecast
 * Endpoint: /products/noaa-planetary-k-index-forecast.txt (text format)
 */
export async function getKpForecast3Day(): Promise<SpaceWeatherAPIResponse<{
  day1: number[];
  day2: number[];
  day3: number[];
}>> {
  try {
    const response = await fetch(`${NOAA_BASE_URL}/products/noaa-planetary-k-index-forecast.txt`);
    
    if (!response.ok) {
      throw new Error(`NOAA forecast error: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Parse text format (8 values per day)
    // Format: "NOAA Kp index forecast <date>\n<day1 values>\n<day2 values>\n<day3 values>"
    const lines = text.split("\n").filter(line => line.trim() && !line.startsWith("#") && !line.startsWith("NOAA"));
    
    const parseKpLine = (line: string): number[] => {
      return line.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    };
    
    return {
      success: true,
      data: {
        day1: lines[0] ? parseKpLine(lines[0]) : [],
        day2: lines[1] ? parseKpLine(lines[1]) : [],
        day3: lines[2] ? parseKpLine(lines[2]) : [],
      },
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  }
}

/**
 * Get 27-day Outlook (long-term forecast)
 * Útil para planejamento de operações DP
 */
export async function get27DayOutlook(): Promise<SpaceWeatherAPIResponse<string>> {
  try {
    const response = await fetch(`${NOAA_BASE_URL}/products/27-day-outlook.json`);
    
    if (!response.ok) {
      throw new Error(`NOAA 27-day outlook error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      source: "noaa",
      cached: false,
    };
  }
}

// ============================================
// Aggregated Status Functions
// ============================================

/**
 * Get comprehensive space weather summary
 * Combina Kp, alerts, solar wind, magnetometer
 */
export async function getSpaceWeatherSummary(): Promise<{
  timestamp: string;
  kp_current: number | null;
  kp_forecast_3h: number | null;
  kp_max_24h: number | null;
  solar_wind_speed: number | null;
  bz_gsm: number | null;
  active_alerts: NOAAAlert[];
  critical_alerts: NOAAAlert[];
  risk_level: "GREEN" | "AMBER" | "RED";
  warnings: string[];
}> {
  // Fetch all data in parallel
  const [kpCurrent, kpForecast3h, alerts, solarWindSpeed, bzGsm, kpForecast3day] = await Promise.all([
    getCurrentKp(),
    getKpForecast3h(),
    getAlerts(),
    getCurrentSolarWindSpeed(),
    getCurrentBzGSM(),
    getKpForecast3Day(),
  ]);
  
  const activeAlerts = alerts.success && alerts.data ? alerts.data : [];
  const criticalAlerts = activeAlerts.filter(alert => 
    alert.space_weather_message_code.includes("WARP") || 
    alert.space_weather_message_code.includes("ALTP")
  );
  
  // Calculate max Kp in next 24h
  let kpMax24h: number | null = null;
  if (kpForecast3day.success && kpForecast3day.data) {
    const allKp = [...kpForecast3day.data.day1, ...kpForecast3day.data.day2.slice(0, 2)];
    kpMax24h = allKp.length > 0 ? Math.max(...allKp) : null;
  }
  
  // Determine risk level
  let riskLevel: "GREEN" | "AMBER" | "RED" = "GREEN";
  const warnings: string[] = [];
  
  // Kp-based risk
  if (kpCurrent !== null) {
    if (kpCurrent >= 7) {
      riskLevel = "RED";
      warnings.push(`CRITICAL: Kp=${kpCurrent} (Strong geomagnetic storm)`);
    } else if (kpCurrent >= 5) {
      riskLevel = "AMBER";
      warnings.push(`WARNING: Kp=${kpCurrent} (Minor geomagnetic storm)`);
    }
  }
  
  // Solar wind speed
  if (solarWindSpeed !== null && solarWindSpeed > 600) {
    if (riskLevel === "GREEN") riskLevel = "AMBER";
    warnings.push(`High solar wind speed: ${solarWindSpeed.toFixed(0)} km/s`);
  }
  
  // Bz southward component
  if (bzGsm !== null && bzGsm < -10) {
    if (riskLevel === "GREEN") riskLevel = "AMBER";
    if (bzGsm < -20) riskLevel = "RED";
    warnings.push(`Southward Bz: ${bzGsm.toFixed(1)} nT (favors magnetic reconnection)`);
  }
  
  // Critical alerts
  if (criticalAlerts.length > 0) {
    riskLevel = "RED";
    warnings.push(`${criticalAlerts.length} active critical space weather alert(s)`);
  }
  
  return {
    timestamp: new Date().toISOString(),
    kp_current: kpCurrent,
    kp_forecast_3h: kpForecast3h,
    kp_max_24h: kpMax24h,
    solar_wind_speed: solarWindSpeed,
    bz_gsm: bzGsm,
    active_alerts: activeAlerts,
    critical_alerts: criticalAlerts,
    risk_level: riskLevel,
    warnings,
  };
}

/**
 * Check if conditions are safe for DP operations
 * 
 * Returns PROCEED/CAUTION/HOLD based on space weather
 */
export async function checkDPGateStatus(): Promise<{
  status: "PROCEED" | "CAUTION" | "HOLD";
  reason: string;
  details: any;
}> {
  const summary = await getSpaceWeatherSummary();
  
  if (summary.risk_level === "RED") {
    return {
      status: "HOLD",
      reason: "Critical space weather conditions detected",
      details: summary,
    };
  }
  
  if (summary.risk_level === "AMBER") {
    return {
      status: "CAUTION",
      reason: "Elevated space weather activity - monitor closely",
      details: summary,
    };
  }
  
  return {
    status: "PROCEED",
    reason: "Space weather conditions normal",
    details: summary,
  };
}

// ============================================
// Export all
// ============================================

export const NOAASWPC = {
  // Basic data
  getKpIndex,
  getCurrentKp,
  getKpForecast3h,
  getKpForecast3Day,
  getAlerts,
  getCriticalAlerts,
  getSolarWind,
  getCurrentSolarWindSpeed,
  getMagnetometer,
  getCurrentBzGSM,
  get27DayOutlook,
  
  // Aggregated
  getSpaceWeatherSummary,
  checkDPGateStatus,
};

export default NOAASWPC;
