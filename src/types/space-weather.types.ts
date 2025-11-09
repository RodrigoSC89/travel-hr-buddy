/**
 * Space Weather & Ionosphere API Types
 * 
 * Tipos para integração com APIs espaciais reais:
 * - NOAA SWPC (Space Weather)
 * - CelesTrak (GNSS TLE/Ephemeris)
 * - Madrigal (TEC Data)
 * - WAM-IPE (Ionosphere Forecast)
 * - BOM Space Weather
 */

// ============================================
// NOAA SWPC Types
// ============================================

/**
 * NOAA Planetary K-index (Kp)
 * Endpoint: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
 */
export interface NOAAKpIndex {
  time_tag: string; // ISO timestamp
  kp: number; // 0-9 scale
  observed: 'observed' | 'estimated';
  noaa_scale: string; // "G0", "G1", etc.
}

/**
 * NOAA Space Weather Alert
 * Endpoint: https://services.swpc.noaa.gov/products/alerts.json
 */
export interface NOAAAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
  space_weather_message_code: string;
}

/**
 * NOAA Solar Wind Plasma
 * Endpoint: https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json
 */
export interface NOAASolarWind {
  time_tag: string;
  density: number; // protons/cm³
  speed: number; // km/s
  temperature: number; // Kelvin
}

/**
 * NOAA GOES Magnetometer
 * Endpoint: https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json
 */
export interface NOAAMagnetometer {
  time_tag: string;
  bx_gsm: number; // nT
  by_gsm: number; // nT
  bz_gsm: number; // nT
  bt: number; // total field (nT)
}

// ============================================
// CelesTrak Types
// ============================================

/**
 * CelesTrak GP Element (GNSS Satellite)
 * Endpoint: https://celestrak.org/NORAD/elements/gp.php?GROUP=GPS-OPS&FORMAT=JSON
 */
export interface CelesTrakGPElement {
  OBJECT_NAME: string; // "GPS BIIA-10 (PRN 32)"
  OBJECT_ID: string; // "1992-079A"
  EPOCH: string; // "2024-12-01T12:34:56.789012"
  MEAN_MOTION: number; // revs/day
  ECCENTRICITY: number;
  INCLINATION: number; // degrees
  RA_OF_ASC_NODE: number; // degrees
  ARG_OF_PERICENTER: number; // degrees
  MEAN_ANOMALY: number; // degrees
  EPHEMERIS_TYPE: number;
  CLASSIFICATION_TYPE: string; // "U" (unclassified)
  NORAD_CAT_ID: number;
  ELEMENT_SET_NO: number;
  REV_AT_EPOCH: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
}

/**
 * Grupos de satélites disponíveis no CelesTrak
 */
export type CelesTrakGroup = 
  | 'GPS-OPS' 
  | 'GALILEO'
  | 'GLONASS-OPS'
  | 'BEIDOU'
  | 'SBAS'
  | 'GNSS';

// ============================================
// Madrigal Types
// ============================================

/**
 * Madrigal TEC Data Point
 * MIT Haystack - Global TEC via Remote API
 */
export interface MadrigalTECPoint {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  latitude: number; // degrees
  longitude: number; // degrees
  tec: number; // Total Electron Content (TECU)
  dtec: number; // TEC error/uncertainty
  receiver_bias: number; // ns
  satellite_bias: number; // ns
}

/**
 * Madrigal Experiment Info
 */
export interface MadrigalExperiment {
  id: number;
  url: string;
  name: string;
  siteid: number;
  sitename: string;
  instcode: number;
  instname: string;
  startyear: number;
  startmonth: number;
  startday: number;
  starthour: number;
  startmin: number;
  startsec: number;
  endyear: number;
  endmonth: number;
  endday: number;
  endhour: number;
  endmin: number;
  endsec: number;
  isLocal: boolean;
  pi: string;
  piEmail: string;
  uttimestamp: number;
  access: number;
  version: string;
}

// ============================================
// WAM-IPE Types
// ============================================

/**
 * WAM-IPE Ionosphere Forecast
 * NOAA Operational Model (48h forecast)
 */
export interface WAMIPEForecast {
  forecast_time: string; // ISO timestamp
  forecast_hour: number; // 0-48
  latitude: number;
  longitude: number;
  tec: number; // TECU
  nmf2: number; // Peak electron density (cm⁻³)
  hmf2: number; // Peak height (km)
  muf: number; // Maximum Usable Frequency (MHz)
}

/**
 * WAM-IPE Product Metadata
 */
export interface WAMIPEProduct {
  cycle: string; // "00", "06", "12", "18"
  forecast_date: string; // "20241201"
  product_type: 'tec' | 'nmf2' | 'hmf2' | 'muf' | 'foF2';
  grid_resolution: string; // "2.5deg"
  format: 'netcdf';
  file_url: string;
}

// ============================================
// BOM Space Weather Types
// ============================================

/**
 * BOM Space Weather Data Request
 * Australia Bureau of Meteorology
 */
export interface BOMSpaceWeatherRequest {
  api_key: string;
  start_time: string; // ISO
  end_time: string; // ISO
  data_type: 'ionosonde' | 'scintillation' | 't-index' | 'kp';
  station?: string; // e.g., "Learmonth", "Townsville"
}

/**
 * BOM Ionosonde Data
 */
export interface BOMIonosondeData {
  timestamp: string;
  station: string;
  foF2: number; // MHz - critical frequency
  foE: number; // MHz
  M3000F2: number; // propagation factor
  hmF2: number; // km - peak height
}

/**
 * BOM T-Index (ionospheric activity)
 */
export interface BOMTIndex {
  timestamp: string;
  t_index: number; // 0-9 scale (similar to Kp)
  description: string;
}

// ============================================
// GNSS Planning Types
// ============================================

/**
 * Satellite Visibility Calculation
 */
export interface SatelliteVisibility {
  satellite_id: string; // NORAD_CAT_ID or PRN
  satellite_name: string;
  constellation: 'GPS' | 'GALILEO' | 'GLONASS' | 'BEIDOU';
  elevation: number; // degrees
  azimuth: number; // degrees
  range: number; // km
  doppler: number; // Hz
  visible: boolean; // elevation > mask angle
  timestamp: string;
}

/**
 * DOP (Dilution of Precision) Metrics
 */
export interface DOPMetrics {
  timestamp: string;
  latitude: number;
  longitude: number;
  pdop: number; // Position DOP
  hdop: number; // Horizontal DOP
  vdop: number; // Vertical DOP
  tdop: number; // Time DOP
  gdop: number; // Geometric DOP
  visible_satellites: number;
  constellations: {
    gps: number;
    galileo: number;
    glonass: number;
    beidou: number;
  };
}

/**
 * Skyplot Point (azimuth/elevation for visualization)
 */
export interface SkyplotPoint {
  satellite_id: string;
  constellation: 'GPS' | 'GALILEO' | 'GLONASS' | 'BEIDOU';
  azimuth: number; // 0-360 degrees
  elevation: number; // 0-90 degrees
  snr?: number; // Signal-to-Noise Ratio (dB-Hz)
}

// ============================================
// Scintillation Types
// ============================================

/**
 * GNSS Scintillation Index (S4)
 * From eSWua, INPE/LISN, or similar networks
 */
export interface ScintillationIndex {
  timestamp: string;
  station: string;
  latitude: number;
  longitude: number;
  s4: number; // 0-1 scale (amplitude scintillation)
  sigma_phi: number; // radians (phase scintillation)
  satellite_prn: string;
  elevation: number;
  frequency: 'L1' | 'L2' | 'L5';
}

/**
 * ROTI (Rate of TEC Index) - TEC variability indicator
 */
export interface ROTIData {
  timestamp: string;
  latitude: number;
  longitude: number;
  roti: number; // TECU/min
  tec: number; // TECU
  station?: string;
}

// ============================================
// Aggregated Space Weather Status
// ============================================

/**
 * Space Weather Risk Level (para ASOG/DP gates)
 */
export type SpaceWeatherRiskLevel = 'GREEN' | 'AMBER' | 'RED';

/**
 * Space Weather Status (agregado de todas as fontes)
 */
export interface SpaceWeatherStatus {
  timestamp: string;
  risk_level: SpaceWeatherRiskLevel;
  
  // NOAA Data
  kp_current: number;
  kp_forecast_3h: number;
  kp_forecast_24h: number;
  active_alerts: NOAAAlert[];
  
  // Solar Wind
  solar_wind_speed: number; // km/s
  solar_wind_density: number; // protons/cm³
  bz_gsm: number; // Southward component (critical for storms)
  
  // Ionosphere
  tec_current: number; // TECU (average over region)
  tec_anomaly: boolean; // TEC > expected threshold
  scintillation_risk: 'LOW' | 'MODERATE' | 'HIGH';
  
  // GNSS Performance
  pdop_current: number;
  visible_satellites: number;
  
  // Forecast
  forecast_6h: SpaceWeatherRiskLevel;
  forecast_24h: SpaceWeatherRiskLevel;
  forecast_48h: SpaceWeatherRiskLevel;
  
  // Recommendations
  recommendations: string[];
  dp_gate_status: 'PROCEED' | 'CAUTION' | 'HOLD';
}

// ============================================
// API Configuration Types
// ============================================

/**
 * NOAA SWPC API Config (sem auth - público)
 */
export interface NOAASWPCConfig {
  base_url: 'https://services.swpc.noaa.gov';
  enabled: boolean;
  cache_ttl_minutes: number; // cache duration
}

/**
 * CelesTrak API Config (sem auth - público)
 */
export interface CelesTrakConfig {
  base_url: 'https://celestrak.org';
  enabled: boolean;
  update_interval_hours: number; // TLE update frequency
  groups: CelesTrakGroup[];
}

/**
 * Madrigal API Config
 */
export interface MadrigalConfig {
  base_url: 'http://cedar.openmadrigal.org' | 'http://millstonehill.haystack.mit.edu';
  enabled: boolean;
  user_fullname: string;
  user_email: string;
  user_affiliation: string;
}

/**
 * BOM Space Weather Config (requer API key)
 */
export interface BOMConfig {
  base_url: 'https://sws-data.sws.bom.gov.au';
  api_key?: string;
  enabled: boolean;
}

/**
 * Space Weather Service Configuration
 */
export interface SpaceWeatherConfig {
  noaa: NOAASWPCConfig;
  celestrak: CelesTrakConfig;
  madrigal: MadrigalConfig;
  bom: BOMConfig;
  
  // Thresholds para risk assessment
  thresholds: {
    kp_amber: number; // e.g., 5
    kp_red: number; // e.g., 7
    tec_anomaly_factor: number; // e.g., 1.5 (150% of expected)
    s4_moderate: number; // e.g., 0.3
    s4_high: number; // e.g., 0.6
    pdop_caution: number; // e.g., 6
    pdop_critical: number; // e.g., 10
  };
  
  // Location para cálculos (pode ser dinâmico por vessel)
  default_location: {
    latitude: number;
    longitude: number;
    altitude_m: number;
  };
  
  // Cache settings
  cache_enabled: boolean;
  cache_ttl_minutes: number;
}

// ============================================
// Response Types
// ============================================

/**
 * Generic API Response Wrapper
 */
export interface SpaceWeatherAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source: 'noaa' | 'celestrak' | 'madrigal' | 'bom' | 'wam-ipe';
  cached: boolean;
  cache_expires_at?: string;
}

/**
 * Batch Data Response (múltiplas fontes)
 */
export interface SpaceWeatherBatchResponse {
  timestamp: string;
  kp_data?: SpaceWeatherAPIResponse<NOAAKpIndex[]>;
  alerts?: SpaceWeatherAPIResponse<NOAAAlert[]>;
  solar_wind?: SpaceWeatherAPIResponse<NOAASolarWind[]>;
  gnss_elements?: SpaceWeatherAPIResponse<CelesTrakGPElement[]>;
  tec_data?: SpaceWeatherAPIResponse<MadrigalTECPoint[]>;
  status: SpaceWeatherStatus;
}

// ============================================
// Planning Window Types
// ============================================

/**
 * GNSS Planning Window Request
 */
export interface GNSSPlanningRequest {
  start_time: string; // ISO
  end_time: string; // ISO
  latitude: number;
  longitude: number;
  altitude_m?: number;
  mask_angle_deg?: number; // default 5°
  constellations?: ('GPS' | 'GALILEO' | 'GLONASS' | 'BEIDOU')[];
}

/**
 * GNSS Planning Window Result
 */
export interface GNSSPlanningWindow {
  start_time: string;
  end_time: string;
  location: {
    latitude: number;
    longitude: number;
    altitude_m: number;
  };
  
  // DOP metrics over time
  dop_timeline: DOPMetrics[];
  
  // Best/worst windows
  best_window: {
    start_time: string;
    end_time: string;
    avg_pdop: number;
    avg_satellites: number;
  };
  worst_window: {
    start_time: string;
    end_time: string;
    avg_pdop: number;
    avg_satellites: number;
  };
  
  // Skyplot snapshots
  skyplots: {
    timestamp: string;
    satellites: SkyplotPoint[];
  }[];
  
  // Space weather overlay
  space_weather_risk: SpaceWeatherRiskLevel[];
  
  // Recommendations
  recommended_windows: {
    start_time: string;
    end_time: string;
    reason: string;
  }[];
}

// ============================================
// Database Types (para armazenamento histórico)
// ============================================

/**
 * Space Weather Log (histórico)
 */
export interface SpaceWeatherLog {
  id: string;
  timestamp: string;
  vessel_id?: string;
  latitude?: number;
  longitude?: number;
  
  kp_index: number;
  solar_wind_speed: number;
  bz_gsm: number;
  tec: number;
  pdop: number;
  
  risk_level: SpaceWeatherRiskLevel;
  active_alerts_count: number;
  
  created_at: string;
}

/**
 * GNSS Performance Log
 */
export interface GNSSPerformanceLog {
  id: string;
  timestamp: string;
  vessel_id?: string;
  latitude: number;
  longitude: number;
  
  pdop: number;
  hdop: number;
  vdop: number;
  visible_satellites: number;
  
  gps_count: number;
  galileo_count: number;
  glonass_count: number;
  beidou_count: number;
  
  position_accuracy_m: number;
  
  created_at: string;
}
