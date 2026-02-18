/**
 * Enhanced Weather Service with GFS/NOAA Data
 * Provides 7-14 day marine forecasts for voyage optimization
 */

import { logger } from "@/lib/logger";

export interface MarineWeatherForecast {
  timestamp: string;
  lat: number;
  lon: number;
  wind_speed_kts: number;
  wind_direction_deg: number;
  wave_height_m: number;
  wave_period_s: number;
  wave_direction_deg: number;
  swell_height_m: number;
  current_speed_kts: number;
  current_direction_deg: number;
  visibility_nm: number;
  pressure_hpa: number;
  temperature_c: number;
  precipitation_mm: number;
  sea_state: SeaState;
}

export type SeaState = "calm" | "smooth" | "slight" | "moderate" | "rough" | "very_rough" | "high" | "phenomenal";

export interface RouteWeatherResult {
  waypoints: MarineWeatherForecast[];
  overall_risk: "low" | "moderate" | "high" | "extreme";
  recommended_speed_reduction_pct: number;
  estimated_delay_hours: number;
  eca_zones_crossed: ECAZone[];
  weather_windows: WeatherWindow[];
}

export interface ECAZone {
  name: string;
  type: "SECA" | "NECA" | "ECA";
  entry_lat: number;
  entry_lon: number;
  exit_lat: number;
  exit_lon: number;
  fuel_switch_required: boolean;
}

export interface WeatherWindow {
  start: string;
  end: string;
  condition: "favorable" | "marginal" | "adverse";
  description: string;
}

// Known ECA zones worldwide
const ECA_ZONES: ECAZone[] = [
  { name: "Baltic Sea SECA", type: "SECA", entry_lat: 57.0, entry_lon: 10.0, exit_lat: 65.0, exit_lon: 30.0, fuel_switch_required: true },
  { name: "North Sea SECA", type: "SECA", entry_lat: 48.0, entry_lon: -5.0, exit_lat: 62.0, exit_lon: 10.0, fuel_switch_required: true },
  { name: "North America ECA", type: "ECA", entry_lat: 25.0, entry_lon: -80.0, exit_lat: 50.0, exit_lon: -60.0, fuel_switch_required: true },
  { name: "US Caribbean ECA", type: "ECA", entry_lat: 15.0, entry_lon: -85.0, exit_lat: 30.0, exit_lon: -60.0, fuel_switch_required: true },
  { name: "Mediterranean SECA", type: "SECA", entry_lat: 30.0, entry_lon: -6.0, exit_lat: 46.0, exit_lon: 36.0, fuel_switch_required: true },
  { name: "China Coastal ECA", type: "ECA", entry_lat: 20.0, entry_lon: 110.0, exit_lat: 40.0, exit_lon: 125.0, fuel_switch_required: true },
];

/**
 * Get sea state classification from wave height (Douglas Scale)
 */
export function getSeaState(waveHeight: number): SeaState {
  if (waveHeight < 0.1) return "calm";
  if (waveHeight < 0.5) return "smooth";
  if (waveHeight < 1.25) return "slight";
  if (waveHeight < 2.5) return "moderate";
  if (waveHeight < 4.0) return "rough";
  if (waveHeight < 6.0) return "very_rough";
  if (waveHeight < 9.0) return "high";
  return "phenomenal";
}

/**
 * Calculate speed reduction based on head seas (Beaufort correction)
 */
export function calculateSpeedReduction(
  windSpeed: number,
  waveHeight: number,
  headingRelativeToWind: number
): number {
  // Head sea factor (1.0 = head sea, 0.0 = following sea)
  const headSeaFactor = Math.max(0, Math.cos((headingRelativeToWind * Math.PI) / 180));

  // Base reduction from wave height
  let reduction = 0;
  if (waveHeight > 1.5) reduction += (waveHeight - 1.5) * 2;
  if (waveHeight > 3.0) reduction += (waveHeight - 3.0) * 3;
  if (waveHeight > 5.0) reduction += (waveHeight - 5.0) * 5;

  // Wind penalty
  if (windSpeed > 20) reduction += (windSpeed - 20) * 0.3;

  return Math.min(50, reduction * headSeaFactor); // Max 50% reduction
}

/**
 * Detect ECA zones crossed by a route
 */
export function detectECAZones(
  waypoints: Array<{ lat: number; lon: number }>
): ECAZone[] {
  const crossed: ECAZone[] = [];

  for (const eca of ECA_ZONES) {
    const inZone = waypoints.some(
      (wp) =>
        wp.lat >= eca.entry_lat &&
        wp.lat <= eca.exit_lat &&
        wp.lon >= eca.entry_lon &&
        wp.lon <= eca.exit_lon
    );
    if (inZone) crossed.push(eca);
  }

  return crossed;
}

/**
 * Calculate consumption based on speed/power curve
 * Uses cubic relationship between speed and fuel consumption
 */
export function calculateConsumption(
  speed: number,
  designSpeed: number,
  designConsumption: number,
  displacement: number,
  waveHeight: number
): number {
  // Admiralty coefficient method
  const speedRatio = speed / designSpeed;
  const baseFuel = designConsumption * Math.pow(speedRatio, 3);

  // Sea state penalty (added resistance)
  const seaMargin = waveHeight > 1.5 ? 1 + (waveHeight - 1.5) * 0.05 : 1;

  return baseFuel * seaMargin;
}

/**
 * Estimate optimal speed for CII target
 */
export function calculateOptimalSpeedForCII(
  currentCII: number,
  targetCII: number,
  currentSpeed: number,
  remainingDistance: number,
  deadweight: number
): { optimalSpeed: number; etaChangeHours: number } {
  if (currentCII <= targetCII) {
    return { optimalSpeed: currentSpeed, etaChangeHours: 0 };
  }

  // CII is proportional to fuel consumption / (DWT × distance)
  // Fuel is proportional to speed^3
  // So CII ∝ speed^3 / distance, meaning lower speed = lower CII
  const reductionNeeded = (currentCII - targetCII) / currentCII;
  const speedReduction = 1 - Math.pow(1 - reductionNeeded, 1 / 3);
  const optimalSpeed = Math.max(currentSpeed * (1 - speedReduction), currentSpeed * 0.6);

  const currentEta = remainingDistance / currentSpeed;
  const newEta = remainingDistance / optimalSpeed;
  const etaChangeHours = newEta - currentEta;

  return { optimalSpeed: Math.round(optimalSpeed * 10) / 10, etaChangeHours: Math.round(etaChangeHours * 10) / 10 };
}

/**
 * Generate simulated GFS forecast for a route
 * In production, this would call NOAA GFS or ECMWF API
 */
export function generateRouteForecast(
  waypoints: Array<{ lat: number; lon: number; eta: string }>,
  days: number = 7
): MarineWeatherForecast[] {
  // Deterministic simulation based on coordinates and time
  return waypoints.map((wp) => {
    const seed = Math.abs(wp.lat * 1000 + wp.lon * 100) % 100;
    const windSpeed = 5 + (seed % 30);
    const waveHeight = 0.5 + (seed % 40) / 10;

    return {
      timestamp: wp.eta,
      lat: wp.lat,
      lon: wp.lon,
      wind_speed_kts: windSpeed,
      wind_direction_deg: (seed * 37) % 360,
      wave_height_m: waveHeight,
      wave_period_s: 4 + (seed % 8),
      wave_direction_deg: (seed * 53) % 360,
      swell_height_m: waveHeight * 0.7,
      current_speed_kts: 0.2 + (seed % 20) / 10,
      current_direction_deg: (seed * 71) % 360,
      visibility_nm: Math.max(1, 10 - (seed % 8)),
      pressure_hpa: 1000 + (seed % 30),
      temperature_c: 15 + (seed % 20),
      precipitation_mm: seed > 60 ? (seed % 20) / 2 : 0,
      sea_state: getSeaState(waveHeight),
    };
  });
}

/**
 * Analyze route weather and return recommendations
 */
export function analyzeRouteWeather(
  forecasts: MarineWeatherForecast[],
  waypoints: Array<{ lat: number; lon: number }>
): RouteWeatherResult {
  const maxWind = Math.max(...forecasts.map((f) => f.wind_speed_kts));
  const maxWave = Math.max(...forecasts.map((f) => f.wave_height_m));
  const avgReduction = forecasts.reduce(
    (sum, f) => sum + calculateSpeedReduction(f.wind_speed_kts, f.wave_height_m, 0),
    0
  ) / forecasts.length;

  let overall_risk: "low" | "moderate" | "high" | "extreme";
  if (maxWave > 6 || maxWind > 45) overall_risk = "extreme";
  else if (maxWave > 4 || maxWind > 30) overall_risk = "high";
  else if (maxWave > 2.5 || maxWind > 20) overall_risk = "moderate";
  else overall_risk = "low";

  const eca_zones_crossed = detectECAZones(waypoints);

  // Identify weather windows
  const weather_windows: WeatherWindow[] = [];
  let currentCondition: "favorable" | "marginal" | "adverse" | null = null;
  let windowStart = "";

  for (const f of forecasts) {
    let condition: "favorable" | "marginal" | "adverse";
    if (f.wave_height_m <= 1.5 && f.wind_speed_kts <= 15) condition = "favorable";
    else if (f.wave_height_m <= 3.0 && f.wind_speed_kts <= 25) condition = "marginal";
    else condition = "adverse";

    if (condition !== currentCondition) {
      if (currentCondition && windowStart) {
        weather_windows.push({
          start: windowStart,
          end: f.timestamp,
          condition: currentCondition,
          description: `${currentCondition} - Hs: ${f.wave_height_m.toFixed(1)}m, Wind: ${f.wind_speed_kts}kts`,
        });
      }
      currentCondition = condition;
      windowStart = f.timestamp;
    }
  }

  return {
    waypoints: forecasts,
    overall_risk,
    recommended_speed_reduction_pct: Math.round(avgReduction * 10) / 10,
    estimated_delay_hours: Math.round(avgReduction * 0.5 * 10) / 10,
    eca_zones_crossed,
    weather_windows,
  };
}

logger.info("[WeatherGFS] Maritime weather service initialized");
