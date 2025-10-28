/**
 * PATCH 350: Satellite Tracker v2 - Global Coverage Type Definitions
 * Types for satellite tracking, orbits, and mission integration
 */

export type SatelliteType = 'communication' | 'navigation' | 'observation' | 'weather';
export type SatelliteStatus = 'active' | 'inactive' | 'deorbited' | 'lost';
export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'HEO'; // Low/Medium/Geostationary/Highly Elliptical
export type AlertType = 'coverage_lost' | 'low_battery' | 'orbital_decay' | 'collision_risk' | 'malfunction';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type LinkType = 'primary' | 'backup' | 'relay';
export type LinkStatus = 'active' | 'standby' | 'inactive';
export type HealthStatus = 'nominal' | 'degraded' | 'critical';
export type Visibility = 'visible' | 'daylight' | 'shadow';
export type PassQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type DataSource = 'api' | 'manual' | 'calculated';

export interface SatellitePosition {
  id: string;
  satellite_id: string;
  satellite_name: string;
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
  altitude_km: number;
  velocity_kmh?: number;
  heading?: number; // 0-360 degrees
  orbital_period_minutes?: number;
  inclination_degrees?: number;
  eccentricity?: number;
  perigee_km?: number;
  apogee_km?: number;
  tle_line1?: string; // Two-Line Element set
  tle_line2?: string;
  timestamp: string;
  next_update_at?: string;
  data_source: DataSource;
  metadata?: Record<string, unknown>;
}

export interface Satellite {
  id: string;
  satellite_id: string;
  satellite_name: string;
  satellite_type: SatelliteType;
  operator?: string;
  launch_date?: string;
  status: SatelliteStatus;
  mission_ids?: string[];
  coverage_zones?: CoverageZone[];
  capabilities?: string[];
  frequency_bands?: string[];
  orbit_type: OrbitType;
  is_tracked: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CoverageZone {
  name: string;
  type: 'circle' | 'polygon';
  coordinates: number[][]; // [lat, lon] pairs
  radius_km?: number;
  min_elevation_angle?: number;
}

export interface SatelliteAlert {
  id: string;
  satellite_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  status: AlertStatus;
  affected_missions?: string[];
  affected_areas?: CoverageZone[];
  current_position?: {
    latitude: number;
    longitude: number;
    altitude_km: number;
  };
  predicted_impact?: Record<string, unknown>;
  recommended_actions?: string[];
  triggered_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  metadata?: Record<string, unknown>;
}

export interface SatelliteCoverageMap {
  id: string;
  satellite_id: string;
  timestamp: string;
  coverage_geojson: GeoJSON.Feature | GeoJSON.FeatureCollection;
  elevation_angle_degrees?: number;
  coverage_radius_km?: number;
  visibility_duration_minutes?: number;
  next_pass_at?: string;
  quality_score?: number; // 0-1
  metadata?: Record<string, unknown>;
}

export interface SatelliteMissionLink {
  id: string;
  satellite_id: string;
  mission_id: string;
  link_type: LinkType;
  status: LinkStatus;
  priority: number;
  bandwidth_allocated_mbps?: number;
  uptime_percentage?: number;
  last_contact_at?: string;
  next_contact_at?: string;
  contact_schedule?: ContactWindow[];
  performance_metrics?: PerformanceMetrics;
  created_at: string;
  updated_at: string;
}

export interface ContactWindow {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  type: 'scheduled' | 'opportunistic';
  priority: number;
}

export interface PerformanceMetrics {
  signal_strength_dbm?: number;
  data_rate_mbps?: number;
  error_rate_percentage?: number;
  latency_ms?: number;
  packet_loss_percentage?: number;
}

export interface SatellitePass {
  id: string;
  satellite_id: string;
  location_name?: string;
  location_latitude: number;
  location_longitude: number;
  rise_time: string;
  set_time: string;
  max_elevation_time?: string;
  max_elevation_degrees?: number;
  duration_minutes?: number;
  visibility: Visibility;
  pass_quality: PassQuality;
  created_at: string;
}

export interface SatelliteTelemetry {
  id: string;
  satellite_id: string;
  timestamp: string;
  battery_percentage?: number;
  power_generation_watts?: number;
  temperature_celsius?: number;
  signal_strength_dbm?: number;
  data_rate_mbps?: number;
  health_status: HealthStatus;
  subsystem_status?: Record<string, string>;
  anomalies?: string[];
  metadata?: Record<string, unknown>;
}

export interface SatelliteTrackingView {
  satellite: Satellite;
  latest_position?: SatellitePosition;
  active_alerts: SatelliteAlert[];
  mission_links: SatelliteMissionLink[];
  latest_telemetry?: SatelliteTelemetry;
  upcoming_passes: SatellitePass[];
}

export interface GlobalSatelliteView {
  satellites: Satellite[];
  positions: SatellitePosition[];
  active_alerts: SatelliteAlert[];
  coverage_maps: SatelliteCoverageMap[];
}

export interface SatelliteSearchFilters {
  satellite_type?: SatelliteType[];
  status?: SatelliteStatus[];
  orbit_type?: OrbitType[];
  is_tracked?: boolean;
  mission_id?: string;
}

export interface OrbitCalculationParams {
  satellite_id: string;
  timestamp?: string;
  steps?: number; // Number of positions to calculate
  interval_seconds?: number;
}

export interface VisibilityCalculation {
  satellite_id: string;
  observer_latitude: number;
  observer_longitude: number;
  observer_altitude_m?: number;
  start_time: string;
  end_time: string;
  min_elevation?: number; // Minimum elevation angle in degrees
}
