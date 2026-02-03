/**
 * Satellite Types - P0 CORRIGIDO
 * Tipos para dados reais de satélites
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
  orbit_type: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  status: 'active' | 'inactive' | 'maintenance';
  visibility: 'visible' | 'eclipsed' | 'daylight';
  timestamp: string;
  inclination_deg: number;
  period_min: number;
  launch_date: string;
  country: string;
  purpose: string;
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
