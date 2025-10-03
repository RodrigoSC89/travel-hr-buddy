/**
 * Weather Integration Types for Nautilus One
 * Comprehensive maritime weather system with Windy.com integration
 */

// Geographical location
export interface GeoLocation {
  lat: number;
  lon: number;
  name?: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

// Maritime Weather Data (from Windy and other sources)
export interface MaritimeWeatherData {
  windSpeed: number; // knots
  windDirection: number; // degrees
  waveHeight: number; // meters
  wavePeriod: number; // seconds
  waveDirection: number; // degrees
  currentSpeed: number; // knots
  currentDirection: number; // degrees
  visibility: number; // nautical miles
  barometricPressure: number; // mbar
  temperature: number; // °C
  seaTemperature: number; // °C
  swellHeight: number; // meters
  swellPeriod: number; // seconds
  swellDirection: number; // degrees
  precipitationRate: number; // mm/h
  cloudCover: number; // %
  thunderstormProbability: number; // %
}

// Windy Weather Data Structure
export interface WindyWeatherData {
  location: GeoLocation;
  current: MaritimeWeatherData;
  forecast: WindyForecastItem[];
  timestamp: string;
  source: 'windy';
}

export interface WindyForecastItem {
  timestamp: string;
  weather: MaritimeWeatherData;
}

// Extended Forecast
export interface ExtendedForecast {
  location: GeoLocation;
  days: ForecastDay[];
  generatedAt: string;
}

export interface ForecastDay {
  date: string;
  conditions: MaritimeWeatherData;
  hourly: HourlyForecast[];
}

export interface HourlyForecast {
  hour: number;
  conditions: MaritimeWeatherData;
}

// Maritime Conditions Summary
export interface MaritimeConditions {
  location: GeoLocation;
  current: MaritimeWeatherData;
  operabilityStatus: 'excellent' | 'good' | 'marginal' | 'poor' | 'critical';
  alerts: WeatherAlert[];
  timestamp: string;
}

// Weather Alerts
export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: 'info' | 'warning' | 'severe' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  affectedOperations: string[];
  validFrom: string;
  validUntil: string;
}

export type WeatherAlertType = 
  | 'high_wind'
  | 'high_waves'
  | 'poor_visibility'
  | 'thunderstorm'
  | 'low_pressure'
  | 'ice_formation'
  | 'heavy_precipitation'
  | 'extreme_temperature';

// ASOG Limits
export interface ASGOLimits {
  maxWindSpeed: number; // knots
  maxWaveHeight: number; // meters
  minVisibility: number; // nautical miles
  maxCurrentSpeed: number; // knots
  operationType: OperationType;
}

export type OperationType = 
  | 'dp_operations'
  | 'cargo_transfer'
  | 'diving_operations'
  | 'helicopter_operations'
  | 'crew_transfer'
  | 'navigation';

// Vessel Specifications
export interface VesselSpecs {
  type: string;
  length: number;
  beam: number;
  draft: number;
  dpClass?: 'DP1' | 'DP2' | 'DP3';
  operationalLimits: ASGOLimits[];
}

// Validation Results
export interface ValidationResult {
  compliant: boolean;
  violations: LimitViolation[];
  warnings: string[];
  operabilityIndex: number;
  timestamp: string;
}

export interface LimitViolation {
  parameter: string;
  currentValue: number;
  limitValue: number;
  severity: 'warning' | 'critical';
  impact: string;
}

// Operability Index
export interface OperabilityIndex {
  overall: number; // 0-100
  factors: {
    wind: number;
    waves: number;
    visibility: number;
    currentSpeed: number;
  };
  status: 'excellent' | 'good' | 'marginal' | 'poor' | 'critical';
  recommendations: string[];
}

// Operational Window
export interface OperationalWindow {
  start: string;
  end: string;
  duration: number; // hours
  confidence: number; // 0-100
  conditions: MaritimeWeatherData;
  risks: string[];
}

// Weather Briefing
export interface WeatherBriefing {
  summary: string;
  currentConditions: string;
  forecast24h: string;
  forecast72h: string;
  operationalRecommendations: string[];
  alerts: WeatherAlert[];
  generatedAt: string;
}

// Weather Layer Configuration (for maps)
export interface WeatherLayerConfig {
  wind: boolean;
  waves: boolean;
  swell: boolean;
  precipitation: boolean;
  clouds: boolean;
  pressure: boolean;
  temperature: boolean;
  currents: boolean;
  lightning: boolean;
  visibility: boolean;
}

// Windy Map Configuration
export interface WindyMapConfig {
  location: GeoLocation;
  zoom: number;
  layers: WeatherLayerConfig;
  overlay?: string;
  forecast?: boolean;
}

// Multi-source weather validation
export interface WeatherSource {
  name: 'windy' | 'openweather' | 'satellite' | 'buoy';
  data: MaritimeWeatherData;
  reliability: number;
  timestamp: string;
}

export interface ValidationMatrix {
  sources: WeatherSource[];
  consensus: MaritimeWeatherData;
  discrepancies: SourceDiscrepancy[];
  reliability: number;
}

export interface SourceDiscrepancy {
  parameter: string;
  sources: {
    name: string;
    value: number;
  }[];
  variance: number;
}

// Weather Dashboard Data
export interface WeatherDashboardData {
  current: MaritimeConditions;
  forecast: ExtendedForecast;
  alerts: WeatherAlert[];
  asogCompliance: ValidationResult;
  multiSourceValidation: ValidationMatrix;
  lastUpdate: string;
}

// API Response Types
export interface WeatherAPIResponse {
  success: boolean;
  data?: WindyWeatherData | MaritimeConditions;
  error?: string;
  timestamp: string;
}

export interface WindyAPIConfig {
  apiKey: string;
  baseUrl: string;
}

// Historical Weather Data
export interface HistoricalWeatherData {
  location: GeoLocation;
  period: DateRange;
  data: MaritimeWeatherData[];
  statistics: WeatherStatistics;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface WeatherStatistics {
  avgWindSpeed: number;
  maxWindSpeed: number;
  avgWaveHeight: number;
  maxWaveHeight: number;
  avgVisibility: number;
  stormDays: number;
  operableDays: number;
}

// AI Weather Analysis
export interface AIWeatherAnalysis {
  summary: string;
  riskAssessment: string;
  recommendations: string[];
  patterns: string[];
  confidence: number;
  generatedAt: string;
}

// Voice Alert
export interface VoiceAlert {
  id: string;
  alert: WeatherAlert;
  audioUrl?: string;
  spoken: boolean;
  timestamp: string;
}

// Real-time notification
export interface WeatherNotification {
  id: string;
  type: 'alert' | 'update' | 'briefing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: WeatherAlert | WeatherBriefing;
  timestamp: string;
  read: boolean;
}

// Satellite Data
export interface SatelliteData {
  timestamp: string;
  imageUrl?: string;
  cloudCover: number;
  stormSystems: StormSystem[];
  oceanData: OceanData;
}

export interface StormSystem {
  id: string;
  type: 'tropical' | 'extratropical' | 'thunderstorm';
  location: GeoLocation;
  intensity: number;
  movement: {
    direction: number;
    speed: number;
  };
  forecast: StormForecast[];
}

export interface StormForecast {
  timestamp: string;
  location: GeoLocation;
  intensity: number;
  confidence: number;
}

export interface OceanData {
  seaSurfaceTemperature: number;
  waveSpectrum: WaveSpectrum[];
  currentVectors: CurrentVector[];
}

export interface WaveSpectrum {
  frequency: number;
  energy: number;
  direction: number;
}

export interface CurrentVector {
  location: GeoLocation;
  speed: number;
  direction: number;
}
