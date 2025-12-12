/**
 * Demo satellite data for Satellite Live Integrator
 */

export interface DemoSatellite {
  id: string;
  satellite_id: string;
  satellite_name: string;
  norad_id: number;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  orbit_type: "LEO" | "MEO" | "GEO" | "HEO";
  status: "active" | "inactive" | "maintenance";
  visibility: "visible" | "eclipsed" | "daylight";
  timestamp: string;
  inclination_deg: number;
  period_min: number;
  launch_date: string;
  country: string;
  purpose: string;
}

// Generate realistic satellite positions
function generatePosition(baseLat: number, baseLon: number, range: number = 5) {
  return {
    latitude: baseLat + (Math.random() - 0.5) * range,
    longitude: baseLon + (Math.random() - 0.5) * range
  };
}

export const DEMO_SATELLITES: DemoSatellite[] = [
  {
    id: "1",
    satellite_id: "ISS",
    satellite_name: "International Space Station (ISS)",
    norad_id: 25544,
    ...generatePosition(-15.3, -48.2),
    altitude_km: 408 + Math.random() * 10,
    velocity_kmh: 27600 + Math.random() * 100,
    orbit_type: "LEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 51.64,
    period_min: 92.68,
    launch_date: "1998-11-20",
    country: "Multinacional",
    purpose: "Pesquisa científica e habitação"
  },
  {
    id: "2",
    satellite_id: "HUBBLE",
    satellite_name: "Hubble Space Telescope",
    norad_id: 20580,
    ...generatePosition(28.5, -80.6),
    altitude_km: 540 + Math.random() * 10,
    velocity_kmh: 27300 + Math.random() * 100,
    orbit_type: "LEO",
    status: "active",
    visibility: "eclipsed",
    timestamp: new Date().toISOString(),
    inclination_deg: 28.47,
    period_min: 95.42,
    launch_date: "1990-04-24",
    country: "USA",
    purpose: "Observação astronômica"
  },
  {
    id: "3",
    satellite_id: "GPS-III-1",
    satellite_name: "GPS III SV01 (Vespucci)",
    norad_id: 43873,
    ...generatePosition(35.0, -95.0, 10),
    altitude_km: 20200 + Math.random() * 100,
    velocity_kmh: 14000 + Math.random() * 100,
    orbit_type: "MEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 55.0,
    period_min: 718,
    launch_date: "2018-12-23",
    country: "USA",
    purpose: "Navegação GPS"
  },
  {
    id: "4",
    satellite_id: "STARLINK-1007",
    satellite_name: "Starlink-1007",
    norad_id: 44713,
    ...generatePosition(-23.5, -46.6),
    altitude_km: 550 + Math.random() * 5,
    velocity_kmh: 27400 + Math.random() * 50,
    orbit_type: "LEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 53.0,
    period_min: 95.5,
    launch_date: "2020-01-07",
    country: "USA",
    purpose: "Internet banda larga"
  },
  {
    id: "5",
    satellite_id: "GOES-16",
    satellite_name: "GOES-16 (GOES-East)",
    norad_id: 41866,
    ...generatePosition(0, -75.2, 2),
    altitude_km: 35786 + Math.random() * 10,
    velocity_kmh: 11000 + Math.random() * 50,
    orbit_type: "GEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 0.04,
    period_min: 1436,
    launch_date: "2016-11-19",
    country: "USA",
    purpose: "Meteorologia"
  },
  {
    id: "6",
    satellite_id: "CBERS-4A",
    satellite_name: "CBERS-4A",
    norad_id: 44883,
    ...generatePosition(-10.0, -55.0),
    altitude_km: 628 + Math.random() * 5,
    velocity_kmh: 27200 + Math.random() * 50,
    orbit_type: "LEO",
    status: "active",
    visibility: "daylight",
    timestamp: new Date().toISOString(),
    inclination_deg: 98.5,
    period_min: 97.2,
    launch_date: "2019-12-20",
    country: "Brasil/China",
    purpose: "Observação da Terra"
  },
  {
    id: "7",
    satellite_id: "GLONASS-M",
    satellite_name: "GLONASS-M 754",
    norad_id: 40001,
    ...generatePosition(55.0, 37.0, 15),
    altitude_km: 19140 + Math.random() * 100,
    velocity_kmh: 14500 + Math.random() * 50,
    orbit_type: "MEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 64.8,
    period_min: 676,
    launch_date: "2014-06-14",
    country: "Rússia",
    purpose: "Navegação GLONASS"
  },
  {
    id: "8",
    satellite_id: "SENTINEL-2A",
    satellite_name: "Sentinel-2A",
    norad_id: 40697,
    ...generatePosition(45.0, 10.0),
    altitude_km: 786 + Math.random() * 5,
    velocity_kmh: 26900 + Math.random() * 50,
    orbit_type: "LEO",
    status: "active",
    visibility: "daylight",
    timestamp: new Date().toISOString(),
    inclination_deg: 98.62,
    period_min: 100.6,
    launch_date: "2015-06-23",
    country: "ESA",
    purpose: "Observação da Terra (Copernicus)"
  },
  {
    id: "9",
    satellite_id: "LANDSAT-9",
    satellite_name: "Landsat 9",
    norad_id: 49260,
    ...generatePosition(40.0, -100.0),
    altitude_km: 705 + Math.random() * 5,
    velocity_kmh: 27000 + Math.random() * 50,
    orbit_type: "LEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 98.2,
    period_min: 99.0,
    launch_date: "2021-09-27",
    country: "USA",
    purpose: "Observação da Terra"
  },
  {
    id: "10",
    satellite_id: "TIANGONG",
    satellite_name: "Tiangong (China Space Station)",
    norad_id: 48274,
    ...generatePosition(25.0, 110.0),
    altitude_km: 390 + Math.random() * 10,
    velocity_kmh: 27700 + Math.random() * 100,
    orbit_type: "LEO",
    status: "active",
    visibility: "visible",
    timestamp: new Date().toISOString(),
    inclination_deg: 41.47,
    period_min: 92.0,
    launch_date: "2021-04-29",
    country: "China",
    purpose: "Estação espacial tripulada"
  }
];

// Update positions with realistic movement simulation
export function updateSatellitePositions(satellites: DemoSatellite[]): DemoSatellite[] {
  const now = new Date();
  
  return satellites.map(sat => {
    // Calculate movement based on orbital period
    const timeFactorMs = now.getTime();
    const orbitalSpeedFactor = sat.orbit_type === "LEO" ? 0.001 : 
      sat.orbit_type === "MEO" ? 0.0003 : 0.00001;
    
    // Simulate orbit movement
    const newLon = (sat.longitude + Math.sin(timeFactorMs * orbitalSpeedFactor) * 2) % 360;
    const adjustedLon = newLon > 180 ? newLon - 360 : newLon < -180 ? newLon + 360 : newLon;
    
    // LEO satellites move more in latitude (orbital inclination)
    const latVariation = sat.orbit_type === "LEO" 
      ? Math.sin(timeFactorMs * orbitalSpeedFactor * 1.5) * sat.inclination_deg * 0.5
      : 0;
    
    const newLat = Math.max(-90, Math.min(90, sat.latitude + latVariation * 0.01));
    
    return {
      ...sat,
      latitude: newLat,
      longitude: adjustedLon,
      altitude_km: sat.altitude_km + (Math.random() - 0.5) * 0.5,
      velocity_kmh: sat.velocity_kmh + (Math.random() - 0.5) * 10,
      timestamp: now.toISOString()
    };
  });
}

export interface SyncLog {
  id: string;
  api_provider: string;
  satellites_updated: number;
  success: boolean;
  timestamp: string;
  response_time_ms: number;
  error_message?: string;
}

export function createSyncLog(
  provider: string, 
  count: number, 
  success: boolean, 
  responseTime: number,
  error?: string
): SyncLog {
  return {
    id: `log-${Date.now()}`,
    api_provider: provider,
    satellites_updated: count,
    success,
    timestamp: new Date().toISOString(),
    response_time_ms: responseTime,
    error_message: error
  };
}
