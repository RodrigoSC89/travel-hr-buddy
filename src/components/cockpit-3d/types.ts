/**
 * Cockpit 3D Types
 * Types for immersive 3D operational visualization
 */

export interface Asset3D {
  id: string;
  name: string;
  type: 'vessel' | 'port' | 'alert' | 'route';
  position: [number, number, number];
  status: 'operational' | 'warning' | 'critical' | 'offline';
  metadata?: Record<string, unknown>;
}

export interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'vessel' | 'port' | 'incident';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>;
}

export interface KPIMetric3D {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: string;
}

export interface CockpitState {
  viewMode: 'globe' | 'fleet' | 'operations' | 'metrics';
  selectedAsset: Asset3D | null;
  cameraPosition: [number, number, number];
  zoom: number;
  showOverlays: boolean;
  autoRotate: boolean;
}

export interface AIRecommendation3D {
  id: string;
  type: 'action' | 'insight' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedAssetId?: string;
  timestamp: Date;
}
