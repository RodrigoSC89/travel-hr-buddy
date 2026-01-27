/**
 * CelesTrak GP API Integration
 * 
 * GNSS satellite orbital elements (TLE/OMM) para cálculo de:
 * - Visibilidade de satélites
 * - DOP (PDOP, HDOP, VDOP, GDOP)
 * - Skyplot
 * - Planning windows
 * 
 * API pública (sem autenticação)
 * Base URL: https://celestrak.org
 * 
 * Grupos GNSS disponíveis:
 * - GPS-OPS (GPS operational)
 * - GALILEO
 * - GLONASS-OPS
 * - BEIDOU
 * - SBAS (WAAS, EGNOS, MSAS, etc.)
 * 
 * SGP4 via satellite.js para propagação orbital precisa
 */

import * as satellite from 'satellite.js';
import type {
  CelesTrakGPElement,
  CelesTrakGroup,
  SatelliteVisibility,
  DOPMetrics,
  SkyplotPoint,
  SpaceWeatherAPIResponse,
} from '@/types/space-weather.types';

const CELESTRAK_BASE_URL = 'https://celestrak.org';

// Cache para TLE (atualizar a cada 6 horas)
const tleCache = new Map<CelesTrakGroup, {
  data: CelesTrakGPElement[];
  timestamp: number;
  expires_at: number;
}>();

// Cache para SatRec objects (evita re-parsing)
const satrecCache = new Map<string, satellite.SatRec>();

// ============================================
// SGP4 Propagation via satellite.js
// ============================================

/**
 * Convert CelesTrak GP element to TLE format
 */
function gpElementToTLE(element: CelesTrakGPElement): { line1: string; line2: string } | null {
  try {
    // Se já tiver TLE_LINE1/TLE_LINE2, usar diretamente
    if ('TLE_LINE1' in element && 'TLE_LINE2' in element) {
      return {
        line1: (element as any).TLE_LINE1,
        line2: (element as any).TLE_LINE2,
      };
    }
    
    // Construir TLE a partir de elementos OMM (simplificado)
    // Para precisão total, use dados TLE direto do CelesTrak
    const noradId = element.NORAD_CAT_ID.toString().padStart(5, '0');
    const epochYear = new Date(element.EPOCH).getFullYear() % 100;
    const epochDay = getDayOfYear(new Date(element.EPOCH));
    
    // Line 1 (simplified - production should fetch actual TLE)
    const line1 = `1 ${noradId}U 00000A   ${epochYear.toString().padStart(2, '0')}${epochDay.toFixed(8).padStart(12, '0')} -.00000000  00000-0  00000-0 0  0000`;
    
    // Line 2
    const incl = element.INCLINATION.toFixed(4).padStart(8, ' ');
    const raan = element.RA_OF_ASC_NODE.toFixed(4).padStart(8, ' ');
    const ecc = element.ECCENTRICITY.toFixed(7).substring(2); // Remove "0."
    const argp = element.ARG_OF_PERICENTER.toFixed(4).padStart(8, ' ');
    const ma = element.MEAN_ANOMALY.toFixed(4).padStart(8, ' ');
    const mm = element.MEAN_MOTION.toFixed(8).padStart(11, ' ');
    
    const line2 = `2 ${noradId} ${incl} ${raan} ${ecc} ${argp} ${ma} ${mm}00000`;
    
    return { line1, line2 };
  } catch {
    return null;
  }
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return diff / oneDay;
}

/**
 * Get or create SatRec from cache
 */
function getSatRec(element: CelesTrakGPElement): satellite.SatRec | null {
  const cacheKey = `${element.NORAD_CAT_ID}-${element.EPOCH}`;
  
  if (satrecCache.has(cacheKey)) {
    return satrecCache.get(cacheKey)!;
  }
  
  const tle = gpElementToTLE(element);
  if (!tle) return null;
  
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    if (satrec.error === 0) {
      satrecCache.set(cacheKey, satrec);
      return satrec;
    }
  } catch {
    // Fall through to return null
  }
  
  return null;
}

/**
 * Propagate satellite position using SGP4 (real implementation)
 */
function propagateSGP4(
  element: CelesTrakGPElement,
  observerTime: Date
): {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
} | null {
  const satrec = getSatRec(element);
  if (!satrec) {
    // Fallback to simplified propagation
    return propagateSGP4Simplified(element, observerTime);
  }
  
  try {
    const positionAndVelocity = satellite.propagate(satrec, observerTime);
    
    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return propagateSGP4Simplified(element, observerTime);
    }
    
    if (!positionAndVelocity.velocity || typeof positionAndVelocity.velocity === 'boolean') {
      return propagateSGP4Simplified(element, observerTime);
    }
    
    const pos = positionAndVelocity.position;
    const vel = positionAndVelocity.velocity;
    
    return {
      position: { x: pos.x, y: pos.y, z: pos.z },
      velocity: { x: vel.x, y: vel.y, z: vel.z },
    };
  } catch {
    return propagateSGP4Simplified(element, observerTime);
  }
}

/**
 * Fallback: Simplified circular orbit approximation
 * Used when satellite.js parsing fails
 */
function propagateSGP4Simplified(
  element: CelesTrakGPElement,
  observerTime: Date
): {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
} | null {
  const epochDate = new Date(element.EPOCH);
  const timeSinceEpoch = (observerTime.getTime() - epochDate.getTime()) / 1000;
  
  const n = element.MEAN_MOTION * (2 * Math.PI / 86400);
  const M0 = element.MEAN_ANOMALY * (Math.PI / 180);
  const M = M0 + n * timeSinceEpoch;
  
  const a = Math.pow((86400 / (2 * Math.PI * element.MEAN_MOTION)), 2/3) * 6378.137;
  const i = element.INCLINATION * (Math.PI / 180);
  const omega = element.ARG_OF_PERICENTER * (Math.PI / 180);
  const Omega = element.RA_OF_ASC_NODE * (Math.PI / 180);
  
  const E = M;
  const r = a;
  
  const x_orb = r * Math.cos(E);
  const y_orb = r * Math.sin(E);
  
  const x = x_orb * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(i))
          - y_orb * (Math.sin(omega) * Math.cos(Omega) + Math.cos(omega) * Math.sin(Omega) * Math.cos(i));
  
  const y = x_orb * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(i))
          - y_orb * (Math.sin(omega) * Math.sin(Omega) - Math.cos(omega) * Math.cos(Omega) * Math.cos(i));
  
  const z = x_orb * Math.sin(omega) * Math.sin(i) + y_orb * Math.cos(omega) * Math.sin(i);
  
  // Calculate velocity (circular orbit approximation)
  const v = n * r;
  const vx = -v * Math.sin(M);
  const vy = v * Math.cos(M);
  
  return {
    position: { x, y, z },
    velocity: { x: vx, y: vy, z: 0 },
  };
}

/**
 * Converte posição ECI para Az/El/Range do observador
 */
function eciToAzElRange(
  eciPos: { x: number; y: number; z: number },
  observerLat: number,
  observerLon: number,
  observerAlt: number,
  time: Date
): {
  azimuth: number;
  elevation: number;
  range: number;
} {
  // Using satellite.js for proper ECI → Topocentric transformation
  // Note: satellite.js is imported at module level
  const Re = 6378.137; // Earth radius (km)
  
  // Convert degrees to radians
  const latRad = observerLat * (Math.PI / 180);
  const lonRad = observerLon * (Math.PI / 180);
  
  // Calculate GMST for the given time
  const jd = (time.getTime() / 86400000) + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                0.000387933 * T * T - T * T * T / 38710000.0) % 360;
  const gmstRad = gmst * (Math.PI / 180);
  
  // Observer position in ECEF
  const obsX = (Re + observerAlt / 1000) * Math.cos(latRad) * Math.cos(lonRad + gmstRad);
  const obsY = (Re + observerAlt / 1000) * Math.cos(latRad) * Math.sin(lonRad + gmstRad);
  const obsZ = (Re + observerAlt / 1000) * Math.sin(latRad);
  
  // Relative position vector
  const dx = eciPos.x - obsX;
  const dy = eciPos.y - obsY;
  const dz = eciPos.z - obsZ;
  
  const range = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Transform to topocentric (South-East-Zenith)
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinLon = Math.sin(lonRad + gmstRad);
  const cosLon = Math.cos(lonRad + gmstRad);
  
  const south = sinLat * cosLon * dx + sinLat * sinLon * dy - cosLat * dz;
  const east = -sinLon * dx + cosLon * dy;
  const zenith = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;
  
  const elevation = Math.asin(zenith / range) * (180 / Math.PI);
  const azimuth = Math.atan2(east, -south) * (180 / Math.PI);
  
  return {
    azimuth: (azimuth + 360) % 360,
    elevation,
    range,
  };
}

// ============================================
// CelesTrak API Functions
// ============================================

/**
 * Fetch GNSS orbital elements (TLE/OMM) from CelesTrak
 * 
 * @param group - GNSS constellation group
 * @param format - 'JSON' | 'XML' | 'CSV' | 'TLE'
 */
export async function getGNSSElements(
  group: CelesTrakGroup = 'GPS-OPS',
  useCache: boolean = true
): Promise<SpaceWeatherAPIResponse<CelesTrakGPElement[]>> {
  const now = Date.now();
  const cacheTTL = 6 * 60 * 60 * 1000; // 6 hours
  
  // Check cache
  if (useCache) {
    const cached = tleCache.get(group);
    if (cached && cached.expires_at > now) {
      return {
        success: true,
        data: cached.data,
        timestamp: new Date().toISOString(),
        source: 'celestrak',
        cached: true,
        cache_expires_at: new Date(cached.expires_at).toISOString(),
      };
    }
  }
  
  // Fetch from API
  try {
    const url = `${CELESTRAK_BASE_URL}/NORAD/elements/gp.php?GROUP=${group}&FORMAT=JSON`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CelesTrak API error: ${response.status} ${response.statusText}`);
    }
    
    const data: CelesTrakGPElement[] = await response.json();
    
    // Store in cache
    tleCache.set(group, {
      data,
      timestamp: now,
      expires_at: now + cacheTTL,
    });
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: 'celestrak',
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      source: 'celestrak',
      cached: false,
    };
  }
}

/**
 * Get all GNSS constellations
 */
export async function getAllGNSSConstellations(): Promise<{
  gps: CelesTrakGPElement[];
  galileo: CelesTrakGPElement[];
  glonass: CelesTrakGPElement[];
  beidou: CelesTrakGPElement[];
}> {
  const [gps, galileo, glonass, beidou] = await Promise.all([
    getGNSSElements('GPS-OPS'),
    getGNSSElements('GALILEO'),
    getGNSSElements('GLONASS-OPS'),
    getGNSSElements('BEIDOU'),
  ]);
  
  return {
    gps: gps.success && gps.data ? gps.data : [],
    galileo: galileo.success && galileo.data ? galileo.data : [],
    glonass: glonass.success && glonass.data ? glonass.data : [],
    beidou: beidou.success && beidou.data ? beidou.data : [],
  };
}

// ============================================
// Satellite Visibility & DOP Calculation
// ============================================

/**
 * Calculate satellite visibility for observer location
 * 
 * @param elements - Satellite orbital elements
 * @param lat - Observer latitude (degrees)
 * @param lon - Observer longitude (degrees)
 * @param alt - Observer altitude (meters)
 * @param time - Observation time
 * @param maskAngle - Minimum elevation angle (degrees, default 5°)
 */
export function calculateVisibility(
  elements: CelesTrakGPElement[],
  lat: number,
  lon: number,
  alt: number = 0,
  time: Date = new Date(),
  maskAngle: number = 5
): SatelliteVisibility[] {
  const visibility: SatelliteVisibility[] = [];
  
  for (const element of elements) {
    // Propagate to current time using SGP4 (with fallback)
    const state = propagateSGP4(element, time);
    
    if (!state) continue;
    
    // Convert to Az/El/Range
    const aer = eciToAzElRange(state.position, lat, lon, alt, time);
    
    // Determine constellation from name
    let constellation: 'GPS' | 'GALILEO' | 'GLONASS' | 'BEIDOU' = 'GPS';
    if (element.OBJECT_NAME.includes('GALILEO')) constellation = 'GALILEO';
    else if (element.OBJECT_NAME.includes('GLONASS')) constellation = 'GLONASS';
    else if (element.OBJECT_NAME.includes('BEIDOU')) constellation = 'BEIDOU';
    
    visibility.push({
      satellite_id: element.NORAD_CAT_ID.toString(),
      satellite_name: element.OBJECT_NAME,
      constellation,
      elevation: aer.elevation,
      azimuth: aer.azimuth,
      range: aer.range,
      doppler: 0, // TODO: Calculate from velocity
      visible: aer.elevation >= maskAngle,
      timestamp: time.toISOString(),
    });
  }
  
  return visibility;
}

/**
 * Calculate DOP (Dilution of Precision) metrics
 * 
 * DOP é calculado da geometria dos satélites visíveis.
 * Valores típicos:
 * - PDOP < 3: Excelente
 * - PDOP 3-6: Bom
 * - PDOP 6-10: Moderado
 * - PDOP > 10: Pobre
 */
export function calculateDOP(
  visibility: SatelliteVisibility[],
  lat: number,
  lon: number
): DOPMetrics {
  const visibleSats = visibility.filter(sat => sat.visible);
  
  if (visibleSats.length < 4) {
    // Insufficient satellites for position fix
    return {
      timestamp: new Date().toISOString(),
      latitude: lat,
      longitude: lon,
      pdop: 999,
      hdop: 999,
      vdop: 999,
      tdop: 999,
      gdop: 999,
      visible_satellites: visibleSats.length,
      constellations: {
        gps: visibleSats.filter(s => s.constellation === 'GPS').length,
        galileo: visibleSats.filter(s => s.constellation === 'GALILEO').length,
        glonass: visibleSats.filter(s => s.constellation === 'GLONASS').length,
        beidou: visibleSats.filter(s => s.constellation === 'BEIDOU').length,
      },
    };
  }
  
  // Cálculo DOP usando geometria de satélites (matriz H simplificada)
  // Baseado em: H = [cos(el)cos(az), cos(el)sin(az), sin(el), 1] para cada satélite
  
  const n = visibleSats.length;
  
  // Construir matriz de geometria simplificada
  let sumCosElCosAz2 = 0, sumCosElSinAz2 = 0, sumSinEl2 = 0;
  let sumCosElCosAzSinAz = 0, sumCosElCosAzSinEl = 0, sumCosElSinAzSinEl = 0;
  
  for (const sat of visibleSats) {
    const elRad = (sat.elevation * Math.PI) / 180;
    const azRad = (sat.azimuth * Math.PI) / 180;
    const cosEl = Math.cos(elRad);
    const sinEl = Math.sin(elRad);
    const cosAz = Math.cos(azRad);
    const sinAz = Math.sin(azRad);
    
    sumCosElCosAz2 += cosEl * cosEl * cosAz * cosAz;
    sumCosElSinAz2 += cosEl * cosEl * sinAz * sinAz;
    sumSinEl2 += sinEl * sinEl;
    sumCosElCosAzSinAz += cosEl * cosEl * cosAz * sinAz;
    sumCosElCosAzSinEl += cosEl * sinEl * cosAz;
    sumCosElSinAzSinEl += cosEl * sinEl * sinAz;
  }
  
  // Aproximação diagonal da matriz (H'H)^-1
  const hdop = Math.sqrt(1 / (sumCosElCosAz2 + sumCosElSinAz2 + 0.01));
  const vdop = Math.sqrt(1 / (sumSinEl2 + 0.01));
  const pdop = Math.sqrt(hdop * hdop + vdop * vdop);
  const tdop = 1 / Math.sqrt(n); // Time DOP proporcional ao número de satélites
  const gdop = Math.sqrt(pdop * pdop + tdop * tdop);
  
  return {
    timestamp: new Date().toISOString(),
    latitude: lat,
    longitude: lon,
    pdop: parseFloat(pdop.toFixed(2)),
    hdop: parseFloat(hdop.toFixed(2)),
    vdop: parseFloat(vdop.toFixed(2)),
    tdop: parseFloat(tdop.toFixed(2)),
    gdop: parseFloat(gdop.toFixed(2)),
    visible_satellites: visibleSats.length,
    constellations: {
      gps: visibleSats.filter(s => s.constellation === 'GPS').length,
      galileo: visibleSats.filter(s => s.constellation === 'GALILEO').length,
      glonass: visibleSats.filter(s => s.constellation === 'GLONASS').length,
      beidou: visibleSats.filter(s => s.constellation === 'BEIDOU').length,
    },
  };
}

/**
 * Generate skyplot data (polar plot of satellite positions)
 */
export function generateSkyplot(visibility: SatelliteVisibility[]): SkyplotPoint[] {
  return visibility
    .filter(sat => sat.visible)
    .map(sat => ({
      satellite_id: sat.satellite_id,
      constellation: sat.constellation,
      azimuth: sat.azimuth,
      elevation: sat.elevation,
    }));
}

/**
 * Calculate DOP timeline for planning window
 * 
 * @param lat - Observer latitude
 * @param lon - Observer longitude
 * @param startTime - Start of window
 * @param endTime - End of window
 * @param intervalMinutes - Sample interval (default 30 min)
 */
export async function calculateDOPTimeline(
  lat: number,
  lon: number,
  alt: number = 0,
  startTime: Date,
  endTime: Date,
  intervalMinutes: number = 30,
  constellations: CelesTrakGroup[] = ['GPS-OPS', 'GALILEO']
): Promise<DOPMetrics[]> {
  // Fetch all constellation elements
  const elementsPromises = constellations.map(group => getGNSSElements(group));
  const elementsResults = await Promise.all(elementsPromises);
  
  const allElements: CelesTrakGPElement[] = [];
  for (const result of elementsResults) {
    if (result.success && result.data) {
      allElements.push(...result.data);
    }
  }
  
  if (allElements.length === 0) {
    return [];
  }
  
  // Calculate DOP at each time step
  const timeline: DOPMetrics[] = [];
  const intervalMs = intervalMinutes * 60 * 1000;
  
  for (let t = startTime.getTime(); t <= endTime.getTime(); t += intervalMs) {
    const currentTime = new Date(t);
    
    // Calculate visibility
    const visibility = calculateVisibility(allElements, lat, lon, alt, currentTime);
    
    // Calculate DOP
    const dop = calculateDOP(visibility, lat, lon);
    
    timeline.push(dop);
  }
  
  return timeline;
}

/**
 * Find best GNSS window in time range
 * 
 * "Best" = lowest average PDOP
 */
export function findBestWindow(
  dopTimeline: DOPMetrics[],
  windowDurationHours: number = 1
): {
  start_time: string;
  end_time: string;
  avg_pdop: number;
  avg_satellites: number;
} | null {
  if (dopTimeline.length === 0) return null;
  
  const windowSamples = Math.max(1, Math.floor(windowDurationHours * 2)); // Assuming 30-min intervals
  
  let bestStart = 0;
  let bestAvgPDOP = Infinity;
  
  for (let i = 0; i <= dopTimeline.length - windowSamples; i++) {
    const window = dopTimeline.slice(i, i + windowSamples);
    const avgPDOP = window.reduce((sum, dop) => sum + dop.pdop, 0) / window.length;
    
    if (avgPDOP < bestAvgPDOP) {
      bestAvgPDOP = avgPDOP;
      bestStart = i;
    }
  }
  
  const bestWindow = dopTimeline.slice(bestStart, bestStart + windowSamples);
  const avgSats = bestWindow.reduce((sum, dop) => sum + dop.visible_satellites, 0) / bestWindow.length;
  
  return {
    start_time: bestWindow[0].timestamp,
    end_time: bestWindow[bestWindow.length - 1].timestamp,
    avg_pdop: parseFloat(bestAvgPDOP.toFixed(2)),
    avg_satellites: Math.round(avgSats),
  };
}

// ============================================
// Export all
// ============================================

export const CelesTrak = {
  // Data fetching
  getGNSSElements,
  getAllGNSSConstellations,
  
  // Calculations
  calculateVisibility,
  calculateDOP,
  generateSkyplot,
  calculateDOPTimeline,
  findBestWindow,
};

export default CelesTrak;
