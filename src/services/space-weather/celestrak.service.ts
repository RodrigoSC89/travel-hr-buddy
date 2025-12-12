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
 */

import type {
  CelesTrakGPElement,
  CelesTrakGroup,
  SatelliteVisibility,
  DOPMetrics,
  SkyplotPoint,
  SpaceWeatherAPIResponse,
} from "@/types/space-weather.types";

const CELESTRAK_BASE_URL = "https://celestrak.org";

// Cache para TLE (atualizar a cada 6 horas)
const tleCache = new Map<CelesTrakGroup, {
  data: CelesTrakGPElement[];
  timestamp: number;
  expires_at: number;
}>();

// ============================================
// Orbital Mechanics (SGP4 simplificado)
// ============================================

/**
 * Converte elementos orbitais para posição/velocidade (ECI)
 * 
 * NOTA: Para produção, use biblioteca SGP4 completa:
 * - satellite.js (JavaScript)
 * - sgp4 (Python)
 * - vallado/sgp4 (C++)
 * 
 * Esta é implementação simplificada para demonstração.
 */
function propagateSGP4Simplified(
  element: CelesTrakGPElement,
  observerTime: Date
): {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
} | null {
  // TODO: Implementar SGP4 ou usar satellite.js
  // Por ora, retorna posição estimada (circular orbit approximation)
  
  const epochDate = new Date(element.EPOCH);
  const timeSinceEpoch = (observerTime.getTime() - epochDate.getTime()) / 1000; // seconds
  
  // Simplified circular orbit (apenas para demonstração)
  const n = element.MEAN_MOTION * (2 * Math.PI / 86400); // rad/s
  const M0 = element.MEAN_ANOMALY * (Math.PI / 180); // rad
  const M = M0 + n * timeSinceEpoch;
  
  const a = Math.pow((86400 / (2 * Math.PI * element.MEAN_MOTION)), 2/3) * 6378.137; // km (aproximado)
  const i = element.INCLINATION * (Math.PI / 180);
  const omega = element.ARG_OF_PERICENTER * (Math.PI / 180);
  const Omega = element.RA_OF_ASC_NODE * (Math.PI / 180);
  
  // Assumindo órbita circular (e=0) para simplificação
  const E = M; // Em órbita circular, E = M
  const r = a;
  
  // Posição no plano orbital
  const x_orb = r * Math.cos(E);
  const y_orb = r * Math.sin(E);
  
  // Rotação para ECI
  const x = x_orb * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(i))
          - y_orb * (Math.sin(omega) * Math.cos(Omega) + Math.cos(omega) * Math.sin(Omega) * Math.cos(i));
  
  const y = x_orb * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(i))
          - y_orb * (Math.sin(omega) * Math.sin(Omega) - Math.cos(omega) * Math.cos(Omega) * Math.cos(i));
  
  const z = x_orb * Math.sin(omega) * Math.sin(i)
          + y_orb * Math.cos(omega) * Math.sin(i);
  
  return {
    position: { x, y, z },
    velocity: { x: 0, y: 0, z: 0 }, // TODO: Calculate velocity
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
  // TODO: Implementação completa de transformação ECI → ECEF → Topocentric
  // Usar biblioteca como satellite.js para produção
  
  // Simplified approximation
  const Re = 6378.137; // Earth radius (km)
  
  // Observer position em ECEF (simplified)
  const latRad = observerLat * (Math.PI / 180);
  const lonRad = observerLon * (Math.PI / 180);
  
  const obsX = (Re + observerAlt / 1000) * Math.cos(latRad) * Math.cos(lonRad);
  const obsY = (Re + observerAlt / 1000) * Math.cos(latRad) * Math.sin(lonRad);
  const obsZ = (Re + observerAlt / 1000) * Math.sin(latRad);
  
  // Relative position
  const dx = eciPos.x - obsX;
  const dy = eciPos.y - obsY;
  const dz = eciPos.z - obsZ;
  
  const range = Math.sqrt(dx*dx + dy*dy + dz*dz);
  
  // Simplified Az/El (requires proper rotation matrices)
  const elevation = Math.asin(dz / range) * (180 / Math.PI);
  const azimuth = Math.atan2(dy, dx) * (180 / Math.PI);
  
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
  group: CelesTrakGroup = "GPS-OPS",
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
        source: "celestrak",
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
        "Accept": "application/json",
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
      source: "celestrak",
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      source: "celestrak",
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
    getGNSSElements("GPS-OPS"),
    getGNSSElements("GALILEO"),
    getGNSSElements("GLONASS-OPS"),
    getGNSSElements("BEIDOU"),
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
    // Propagate to current time
    const state = propagateSGP4Simplified(element, time);
    
    if (!state) continue;
    
    // Convert to Az/El/Range
    const aer = eciToAzElRange(state.position, lat, lon, alt, time);
    
    // Determine constellation from name
    let constellation: "GPS" | "GALILEO" | "GLONASS" | "BEIDOU" = "GPS";
    if (element.OBJECT_NAME.includes("GALILEO")) constellation = "GALILEO";
    else if (element.OBJECT_NAME.includes("GLONASS")) constellation = "GLONASS";
    else if (element.OBJECT_NAME.includes("BEIDOU")) constellation = "BEIDOU";
    
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
        gps: visibleSats.filter(s => s.constellation === "GPS").length,
        galileo: visibleSats.filter(s => s.constellation === "GALILEO").length,
        glonass: visibleSats.filter(s => s.constellation === "GLONASS").length,
        beidou: visibleSats.filter(s => s.constellation === "BEIDOU").length,
      },
    });
  }
  
  // TODO: Implementar cálculo real de DOP usando matriz de geometria
  // Por ora, aproximação baseada em número e distribuição de satélites
  
  const n = visibleSats.length;
  
  // Rough approximation: DOP inversely proportional to sqrt(n)
  // e melhorado por distribuição uniforme
  const baseDOP = 6 / Math.sqrt(n);
  
  // Check azimuth distribution (queremos satélites em todas as direções)
  const azBuckets = new Array(8).fill(0); // 8 sectors de 45°
  for (const sat of visibleSats) {
    const bucket = Math.floor(sat.azimuth / 45);
    azBuckets[bucket]++;
  }
  const azUniformity = Math.min(...azBuckets) / Math.max(...azBuckets);
  const geometryFactor = 0.5 + 0.5 * azUniformity; // 0.5-1.0
  
  const pdop = baseDOP / geometryFactor;
  const hdop = pdop * 0.7; // Aproximação: HDOP ~70% de PDOP
  const vdop = pdop * 1.2; // VDOP tipicamente pior que HDOP
  const tdop = pdop * 0.5; // Time DOP geralmente melhor
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
      gps: visibleSats.filter(s => s.constellation === "GPS").length,
      galileo: visibleSats.filter(s => s.constellation === "GALILEO").length,
      glonass: visibleSats.filter(s => s.constellation === "GLONASS").length,
      beidou: visibleSats.filter(s => s.constellation === "BEIDOU").length,
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
  constellations: CelesTrakGroup[] = ["GPS-OPS", "GALILEO"]
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
