/**
 * Space Weather Monitoring Service
 * 
 * Agregador central que combina:
 * - NOAA SWPC (Kp, alertas, vento solar)
 * - CelesTrak (GNSS visibility, DOP)
 * - Madrigal (TEC - opcional)
 * 
 * Fornece status Green/Amber/Red para gates ASOG/DP
 */

import NOAASWPC from './noaa-swpc.service';
import CelesTrak from './celestrak.service';
import type {
  SpaceWeatherStatus,
  SpaceWeatherRiskLevel,
  GNSSPlanningRequest,
  GNSSPlanningWindow,
} from '@/types/space-weather.types';

// ============================================
// Configuration & Thresholds
// ============================================

export interface SpaceWeatherThresholds {
  // Kp index thresholds
  kp_amber: number; // default: 5 (Minor storm G1)
  kp_red: number; // default: 7 (Strong storm G3)
  
  // Solar wind thresholds
  solar_wind_speed_amber: number; // km/s, default: 500
  solar_wind_speed_red: number; // km/s, default: 700
  
  // Bz GSM thresholds (southward component)
  bz_amber: number; // nT, default: -10
  bz_red: number; // nT, default: -20
  
  // GNSS/DOP thresholds
  pdop_amber: number; // default: 6
  pdop_red: number; // default: 10
  min_satellites_amber: number; // default: 6
  min_satellites_red: number; // default: 4
  
  // TEC anomaly factor (future)
  tec_anomaly_factor: number; // default: 1.5 (150% of expected)
}

const DEFAULT_THRESHOLDS: SpaceWeatherThresholds = {
  kp_amber: 5,
  kp_red: 7,
  solar_wind_speed_amber: 500,
  solar_wind_speed_red: 700,
  bz_amber: -10,
  bz_red: -20,
  pdop_amber: 6,
  pdop_red: 10,
  min_satellites_amber: 6,
  min_satellites_red: 4,
  tec_anomaly_factor: 1.5,
};

// ============================================
// Main Space Weather Status Function
// ============================================

/**
 * Get comprehensive space weather status
 * 
 * Combines all data sources and returns aggregated risk assessment
 * 
 * @param lat - Observer latitude (for GNSS calculations)
 * @param lon - Observer longitude
 * @param alt - Observer altitude (meters)
 * @param thresholds - Custom thresholds (optional)
 */
export async function getSpaceWeatherStatus(
  lat: number = 0,
  lon: number = 0,
  alt: number = 0,
  thresholds: Partial<SpaceWeatherThresholds> = {}
): Promise<SpaceWeatherStatus> {
  const config = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  // Fetch all data in parallel
  const [noaaSummary, gnssElements] = await Promise.all([
    NOAASWPC.getSpaceWeatherSummary(),
    CelesTrak.getAllGNSSConstellations(),
  ]);
  
  // Calculate current GNSS performance
  const allElements = [
    ...gnssElements.gps,
    ...gnssElements.galileo,
    ...gnssElements.glonass,
    ...gnssElements.beidou,
  ];
  
  const currentTime = new Date();
  const visibility = CelesTrak.calculateVisibility(allElements, lat, lon, alt, currentTime);
  const dop = CelesTrak.calculateDOP(visibility, lat, lon);
  
  // Determine overall risk level
  let riskLevel: SpaceWeatherRiskLevel = 'GREEN';
  const recommendations: string[] = [];
  
  // 1. Space weather risk (Kp, solar wind, Bz)
  if (noaaSummary.kp_current !== null) {
    if (noaaSummary.kp_current >= config.kp_red) {
      riskLevel = 'RED';
      recommendations.push('🔴 CRITICAL: Strong geomagnetic storm in progress. Consider postponing critical DP operations.');
    } else if (noaaSummary.kp_current >= config.kp_amber) {
      if (riskLevel === 'GREEN') riskLevel = 'AMBER';
      recommendations.push('🟡 WARNING: Minor geomagnetic storm. Monitor GNSS performance closely.');
    }
  }
  
  if (noaaSummary.solar_wind_speed !== null) {
    if (noaaSummary.solar_wind_speed >= config.solar_wind_speed_red) {
      riskLevel = 'RED';
      recommendations.push(`🔴 High-speed solar wind (${noaaSummary.solar_wind_speed.toFixed(0)} km/s). Expect geomagnetic disturbances.`);
    } else if (noaaSummary.solar_wind_speed >= config.solar_wind_speed_amber) {
      if (riskLevel === 'GREEN') riskLevel = 'AMBER';
      recommendations.push(`🟡 Elevated solar wind speed (${noaaSummary.solar_wind_speed.toFixed(0)} km/s).`);
    }
  }
  
  if (noaaSummary.bz_gsm !== null && noaaSummary.bz_gsm < config.bz_amber) {
    if (noaaSummary.bz_gsm < config.bz_red) {
      riskLevel = 'RED';
      recommendations.push(`🔴 Strong southward Bz (${noaaSummary.bz_gsm.toFixed(1)} nT). High risk of magnetic reconnection and storm intensification.`);
    } else {
      if (riskLevel === 'GREEN') riskLevel = 'AMBER';
      recommendations.push(`🟡 Southward Bz component detected (${noaaSummary.bz_gsm.toFixed(1)} nT). Monitor for storm development.`);
    }
  }
  
  // 2. GNSS performance risk (DOP, satellite count)
  if (dop.pdop >= config.pdop_red || dop.visible_satellites <= config.min_satellites_red) {
    riskLevel = 'RED';
    recommendations.push(`🔴 Poor GNSS geometry (PDOP=${dop.pdop}, Sats=${dop.visible_satellites}). Position accuracy degraded.`);
  } else if (dop.pdop >= config.pdop_amber || dop.visible_satellites <= config.min_satellites_amber) {
    if (riskLevel === 'GREEN') riskLevel = 'AMBER';
    recommendations.push(`🟡 Marginal GNSS geometry (PDOP=${dop.pdop}, Sats=${dop.visible_satellites}). Monitor position accuracy.`);
  }
  
  // 3. Active alerts
  if (noaaSummary.critical_alerts.length > 0) {
    riskLevel = 'RED';
    recommendations.push(`🔴 ${noaaSummary.critical_alerts.length} active critical space weather alert(s).`);
  }
  
  // 4. Forecast warnings
  if (noaaSummary.kp_max_24h !== null && noaaSummary.kp_max_24h >= config.kp_amber) {
    recommendations.push(`⚠️ Kp forecast: ${noaaSummary.kp_max_24h} expected in next 24h. Plan accordingly.`);
  }
  
  // Determine scintillation risk (primarily latitude-dependent)
  let scintillationRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  const absLat = Math.abs(lat);
  
  if (absLat < 30) { // Equatorial region
    if (noaaSummary.kp_current !== null && noaaSummary.kp_current >= 5) {
      scintillationRisk = 'HIGH';
      recommendations.push('⚠️ Equatorial scintillation risk HIGH. Post-sunset hours most affected.');
    } else if (noaaSummary.kp_current !== null && noaaSummary.kp_current >= 3) {
      scintillationRisk = 'MODERATE';
    }
  } else if (absLat > 60) { // Polar region
    if (noaaSummary.kp_current !== null && noaaSummary.kp_current >= 4) {
      scintillationRisk = 'HIGH';
      recommendations.push('⚠️ Polar scintillation risk HIGH during geomagnetic activity.');
    }
  }
  
  // Determine DP gate status
  let dpGateStatus: 'PROCEED' | 'CAUTION' | 'HOLD' = 'PROCEED';
  
  if (riskLevel === 'RED') {
    dpGateStatus = 'HOLD';
    recommendations.push('🛑 DP GATE: HOLD - Critical conditions detected. Postpone operations if possible.');
  } else if (riskLevel === 'AMBER') {
    dpGateStatus = 'CAUTION';
    recommendations.push('⚠️ DP GATE: CAUTION - Elevated risk. Increase monitoring frequency, prepare contingencies.');
  } else {
    recommendations.push('✅ DP GATE: PROCEED - Conditions nominal.');
  }
  
  // Add general recommendations
  if (riskLevel !== 'GREEN') {
    recommendations.push('📊 Recommendation: Increase GNSS monitoring frequency to 1-minute intervals.');
    recommendations.push('🔧 Recommendation: Verify backup positioning systems (INS, Radar, etc.) are operational.');
    recommendations.push('📡 Recommendation: Consider enabling dual-frequency or multi-constellation mode if available.');
  }
  
  // Calculate forecast risk levels (simplified)
  const forecast6h = noaaSummary.kp_forecast_3h !== null && noaaSummary.kp_forecast_3h >= config.kp_amber 
    ? 'AMBER' 
    : 'GREEN';
  
  const forecast24h = noaaSummary.kp_max_24h !== null && noaaSummary.kp_max_24h >= config.kp_red
    ? 'RED'
    : noaaSummary.kp_max_24h !== null && noaaSummary.kp_max_24h >= config.kp_amber
    ? 'AMBER'
    : 'GREEN';
  
  const forecast48h = forecast24h; // Simplified (would need WAM-IPE for real 48h forecast)
  
  return {
    timestamp: new Date().toISOString(),
    risk_level: riskLevel,
    
    // NOAA Data
    kp_current: noaaSummary.kp_current || 0,
    kp_forecast_3h: noaaSummary.kp_forecast_3h || 0,
    kp_forecast_24h: noaaSummary.kp_max_24h || 0,
    active_alerts: noaaSummary.active_alerts,
    
    // Solar Wind
    solar_wind_speed: noaaSummary.solar_wind_speed || 0,
    solar_wind_density: 0, // TODO: Add from NOAA data
    bz_gsm: noaaSummary.bz_gsm || 0,
    
    // Ionosphere
    tec_current: 0, // TODO: Add Madrigal integration
    tec_anomaly: false,
    scintillation_risk: scintillationRisk,
    
    // GNSS Performance
    pdop_current: dop.pdop,
    visible_satellites: dop.visible_satellites,
    
    // Forecast
    forecast_6h: forecast6h,
    forecast_24h: forecast24h,
    forecast_48h: forecast48h,
    
    // Recommendations
    recommendations,
    dp_gate_status: dpGateStatus,
  };
}

/**
 * Monitor space weather with periodic updates
 * 
 * Returns an async generator that yields status updates
 * 
 * @param lat - Observer latitude
 * @param lon - Observer longitude
 * @param intervalMinutes - Update interval (default 15 min)
 */
export async function* monitorSpaceWeather(
  lat: number,
  lon: number,
  alt: number = 0,
  intervalMinutes: number = 15
): AsyncGenerator<SpaceWeatherStatus, void, unknown> {
  while (true) {
    const status = await getSpaceWeatherStatus(lat, lon, alt);
    yield status;
    
    // Wait for next interval
    await new Promise(resolve => setTimeout(resolve, intervalMinutes * 60 * 1000));
  }
}

// ============================================
// GNSS Planning Functions
// ============================================

/**
 * Plan GNSS observation window
 * 
 * Calculates:
 * - DOP timeline
 * - Satellite visibility
 * - Best/worst windows
 * - Space weather overlay
 * 
 * @param request - Planning parameters
 */
export async function planGNSSWindow(
  request: GNSSPlanningRequest
): Promise<GNSSPlanningWindow> {
  const {
    start_time,
    end_time,
    latitude,
    longitude,
    altitude_m = 0,
    mask_angle_deg = 5,
    constellations = ['GPS-OPS', 'GALILEO'],
  } = request;
  
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  
  // Calculate DOP timeline (30-min intervals)
  const dopTimeline = await CelesTrak.calculateDOPTimeline(
    latitude,
    longitude,
    altitude_m,
    startDate,
    endDate,
    30,
    constellations as any
  );
  
  if (dopTimeline.length === 0) {
    throw new Error('Failed to calculate DOP timeline');
  }
  
  // Find best and worst windows
  const bestWindow = CelesTrak.findBestWindow(dopTimeline, 1);
  
  // Find worst window (highest PDOP)
  let worstAvgPDOP = 0;
  let worstStart = 0;
  const windowSamples = 2; // 1 hour window
  
  for (let i = 0; i <= dopTimeline.length - windowSamples; i++) {
    const window = dopTimeline.slice(i, i + windowSamples);
    const avgPDOP = window.reduce((sum, dop) => sum + dop.pdop, 0) / window.length;
    
    if (avgPDOP > worstAvgPDOP) {
      worstAvgPDOP = avgPDOP;
      worstStart = i;
    }
  }
  
  const worstWindow = dopTimeline.slice(worstStart, worstStart + windowSamples);
  const worstAvgSats = worstWindow.reduce((sum, dop) => sum + dop.visible_satellites, 0) / worstWindow.length;
  
  // Generate skyplots at key times
  const gnssElements = await CelesTrak.getAllGNSSConstellations();
  const allElements = [
    ...gnssElements.gps,
    ...gnssElements.galileo,
    ...gnssElements.glonass,
    ...gnssElements.beidou,
  ];
  
  const skyplotTimes = [
    startDate,
    new Date((startDate.getTime() + endDate.getTime()) / 2), // midpoint
    endDate,
  ];
  
  const skyplots = skyplotTimes.map(time => {
    const visibility = CelesTrak.calculateVisibility(allElements, latitude, longitude, altitude_m, time, mask_angle_deg);
    const skyplot = CelesTrak.generateSkyplot(visibility);
    
    return {
      timestamp: time.toISOString(),
      satellites: skyplot,
    };
  });
  
  // Overlay space weather risk (simplified - would fetch real data in production)
  const spaceWeatherRisk: SpaceWeatherRiskLevel[] = dopTimeline.map(dop => {
    if (dop.pdop >= 10) return 'RED';
    if (dop.pdop >= 6) return 'AMBER';
    return 'GREEN';
  });
  
  // Generate recommended windows (PDOP < 4, > 8 satellites)
  const recommendedWindows: { start_time: string; end_time: string; reason: string; }[] = [];
  
  for (let i = 0; i < dopTimeline.length - 1; i++) {
    const current = dopTimeline[i];
    const next = dopTimeline[i + 1];
    
    if (current.pdop < 4 && current.visible_satellites >= 8) {
      recommendedWindows.push({
        start_time: current.timestamp,
        end_time: next.timestamp,
        reason: `Excellent geometry: PDOP=${current.pdop}, ${current.visible_satellites} satellites visible`,
      });
    }
  }
  
  return {
    start_time: start_time,
    end_time: end_time,
    location: {
      latitude,
      longitude,
      altitude_m,
    },
    dop_timeline: dopTimeline,
    best_window: bestWindow || {
      start_time: start_time,
      end_time: end_time,
      avg_pdop: 999,
      avg_satellites: 0,
    },
    worst_window: {
      start_time: worstWindow[0].timestamp,
      end_time: worstWindow[worstWindow.length - 1].timestamp,
      avg_pdop: parseFloat(worstAvgPDOP.toFixed(2)),
      avg_satellites: Math.round(worstAvgSats),
    },
    skyplots,
    space_weather_risk: spaceWeatherRisk,
    recommended_windows: recommendedWindows.slice(0, 5), // Top 5
  };
}

// ============================================
// Simplified API for Quick Checks
// ============================================

/**
 * Quick DP gate check - returns simple GO/NO-GO
 */
export async function quickDPCheck(lat: number = 0, lon: number = 0): Promise<{
  status: 'GO' | 'CAUTION' | 'NO-GO';
  kp: number;
  pdop: number;
  message: string;
}> {
  const spaceWeather = await getSpaceWeatherStatus(lat, lon);
  
  let status: 'GO' | 'CAUTION' | 'NO-GO' = 'GO';
  let message = 'All systems nominal';
  
  if (spaceWeather.dp_gate_status === 'HOLD') {
    status = 'NO-GO';
    message = 'Critical space weather or GNSS conditions';
  } else if (spaceWeather.dp_gate_status === 'CAUTION') {
    status = 'CAUTION';
    message = 'Elevated risk - monitor closely';
  }
  
  return {
    status,
    kp: spaceWeather.kp_current,
    pdop: spaceWeather.pdop_current,
    message,
  };
}

// ============================================
// Export all
// ============================================

export const SpaceWeatherMonitoring = {
  // Status
  getSpaceWeatherStatus,
  monitorSpaceWeather,
  quickDPCheck,
  
  // Planning
  planGNSSWindow,
  
  // Defaults
  DEFAULT_THRESHOLDS,
};

export default SpaceWeatherMonitoring;
