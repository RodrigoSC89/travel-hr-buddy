/**
 * DGNSS & Precision Tracking Module Types
 * Types for GNSS tracking, devices, waypoints and alerts
 */

export interface GnssDevice {
  id: string;
  org_id?: string;
  device_name: string;
  device_type: 'gps' | 'dgps' | 'rtk' | 'ppp';
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  firmware_version?: string;
  is_active: boolean;
  is_online: boolean;
  last_seen_at?: string;
  vessel_id?: string;
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface GnssLog {
  id: string;
  org_id?: string;
  device_id?: string;
  vessel_id?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  hdop?: number;
  vdop?: number;
  pdop?: number;
  satellites_used?: number;
  fix_type: 'gps' | 'dgps' | 'rtk_float' | 'rtk_fixed' | 'ppp';
  correction_source?: 'rbmc' | 'ibge_ppp' | 'ntrip' | 'oceanix';
  correction_age_ms?: number;
  signal_quality?: number;
  raw_data?: Record<string, unknown>;
  recorded_at: string;
  created_at?: string;
}

export interface GnssWaypoint {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  waypoint_type: 'marker' | 'geofence' | 'destination' | 'origin';
  is_active: boolean;
  vessel_id?: string;
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GnssAlert {
  id: string;
  org_id?: string;
  device_id?: string;
  vessel_id?: string;
  alert_type: 'signal_loss' | 'accuracy_degraded' | 'geofence_breach' | 'route_deviation' | 'correction_loss';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  threshold_value?: number;
  actual_value?: number;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface GnssAIRecommendation {
  id: string;
  org_id?: string;
  device_id?: string;
  vessel_id?: string;
  recommendation_type: 'trajectory_prediction' | 'signal_optimization' | 'route_correction';
  title: string;
  description?: string;
  confidence: number;
  predicted_trajectory?: Array<{ lat: number; lng: number }>;
  suggested_action?: string;
  is_applied: boolean;
  applied_at?: string;
  applied_by?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface CorrectionStation {
  id: string;
  station_code: string;
  station_name: string;
  provider: 'rbmc' | 'ibge' | 'ntrip_caster';
  latitude: number;
  longitude: number;
  altitude?: number;
  is_active: boolean;
  last_data_at?: string;
  data_quality?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TrackingStats {
  totalDevices: number;
  onlineDevices: number;
  activeAlerts: number;
  avgAccuracy: number;
  lastUpdate: string;
}
