/**
 * Type Definitions for PATCHES 536-540
 * Maritime AI Systems Enhancement
 */

// ============================================================================
// PATCH 536: Coordination AI Engine
// ============================================================================

export type AgentType = 'llm' | 'copilot' | 'sensor' | 'drone' | 'analyzer' | 'executor' | 'coordinator';
export type AgentStatus = 'registered' | 'active' | 'idle' | 'busy' | 'offline' | 'error';
export type TaskStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'failed' | 'timeout' | 'cancelled';

export interface CoordinationAgent {
  id: string;
  agent_name: string;
  agent_type: AgentType;
  capabilities: string[];
  status: AgentStatus;
  priority_level: number;
  max_concurrent_tasks: number;
  current_task_count: number;
  metadata: Record<string, any>;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
}

export interface CoordinationTask {
  id: string;
  task_name: string;
  task_type: string;
  priority: number;
  required_capabilities: string[];
  status: TaskStatus;
  assigned_agent_id?: string;
  payload: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  timeout_seconds: number;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CoordinationDecision {
  id: string;
  task_id?: string;
  agent_id?: string;
  decision_type: string;
  decision_data: Record<string, any>;
  reasoning?: string;
  confidence_score?: number;
  timestamp: string;
}

export interface CoordinationMissionLink {
  id: string;
  mission_id?: string;
  coordination_task_id?: string;
  integration_status: 'linked' | 'synced' | 'completed' | 'failed';
  sync_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PATCH 537: Deep Risk AI with ONNX
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskForecast {
  id: string;
  forecast_name: string;
  risk_score: number;
  risk_level?: RiskLevel;
  risk_factors: Array<{
    factor: string;
    weight: number;
    value: number;
    description?: string;
  }>;
  input_data: Record<string, any>;
  model_version?: string;
  model_confidence?: number;
  inference_time_ms?: number;
  recommendations: Array<{
    priority: string;
    action: string;
    description: string;
  }>;
  metadata: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export interface ONNXModel {
  id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  model_url?: string;
  input_shape?: Record<string, any>;
  output_shape?: Record<string, any>;
  status: 'active' | 'deprecated' | 'testing';
  performance_metrics: {
    avg_inference_time_ms?: number;
    accuracy?: number;
    last_updated?: string;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PATCH 538: Sensors Hub
// ============================================================================

export type SensorType = 'temperature' | 'pressure' | 'humidity' | 'motion' | 'gps' | 'depth' | 'speed' | 'wind' | 'wave' | 'current' | 'other';
export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SensorLog {
  id: string;
  sensor_id: string;
  sensor_name: string;
  sensor_type: SensorType;
  reading_value: number;
  reading_unit: string;
  location?: {
    lat?: number;
    lon?: number;
    depth?: number;
    altitude?: number;
  };
  status: SensorStatus;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface SensorConfiguration {
  id: string;
  sensor_id: string;
  sensor_name: string;
  sensor_type: SensorType;
  mqtt_topic?: string;
  http_endpoint?: string;
  polling_interval_seconds: number;
  alert_thresholds: {
    warning?: number;
    critical?: number;
    min?: number;
    max?: number;
  };
  calibration_data: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorAlert {
  id: string;
  sensor_id: string;
  alert_type: string;
  severity: AlertSeverity;
  message: string;
  reading_value?: number;
  threshold_value?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

// ============================================================================
// PATCH 539: Ocean Sonar AI
// ============================================================================

export type SonarScanType = 'active' | 'passive' | 'side-scan' | 'multi-beam';
export type DetectionStatus = 'new' | 'investigating' | 'classified' | 'dismissed';

export interface SonarData {
  id: string;
  scan_id: string;
  scan_type?: SonarScanType;
  raw_data: Record<string, any>;
  frequency_khz?: number;
  range_meters?: number;
  depth_meters?: number;
  location?: {
    lat: number;
    lon: number;
    depth?: number;
  };
  timestamp: string;
  created_at: string;
}

export interface SonarAIAnalysis {
  id: string;
  scan_id: string;
  sonar_data_id?: string;
  detected_patterns: Array<{
    pattern_type: string;
    confidence: number;
    location: any;
    characteristics: Record<string, any>;
  }>;
  anomalies: Array<{
    anomaly_type: string;
    severity: string;
    confidence: number;
    location: any;
    description: string;
  }>;
  zones_of_interest: Array<{
    zone_id: string;
    priority: string;
    area: any;
    reason: string;
  }>;
  ai_confidence?: number;
  interpretation?: string;
  recommendations?: string;
  model_used?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface SonarDetectionLog {
  id: string;
  scan_id: string;
  detection_type: string;
  confidence: number;
  location: {
    lat: number;
    lon: number;
    depth?: number;
  };
  characteristics: Record<string, any>;
  status: DetectionStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PATCH 540: Navigation Copilot v3
// ============================================================================

export type RouteStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled' | 'replanning';
export type AutonomyLevel = 'manual' | 'assisted' | 'conditional' | 'full';
export type NavigationAlertType = 'obstacle' | 'weather' | 'traffic' | 'mechanical' | 'route_deviation' | 'fuel' | 'other';
export type NavigationAlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface AutonomousRoute {
  id: string;
  route_name: string;
  origin: {
    lat: number;
    lon: number;
    name?: string;
  };
  destination: {
    lat: number;
    lon: number;
    name?: string;
  };
  waypoints: Array<{
    lat: number;
    lon: number;
    order: number;
    name?: string;
  }>;
  status: RouteStatus;
  autonomy_level: AutonomyLevel;
  current_position?: {
    lat: number;
    lon: number;
    heading?: number;
    speed?: number;
  };
  obstacles_detected: Array<{
    id: string;
    type: string;
    location: any;
    severity: string;
    detected_at: string;
  }>;
  environmental_conditions: {
    weather?: string;
    visibility?: number;
    wind_speed?: number;
    wave_height?: number;
    sea_state?: string;
  };
  eta?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NavigationAlert {
  id: string;
  route_id?: string;
  alert_type: NavigationAlertType;
  severity: AlertSeverity | 'emergency';
  message: string;
  location?: {
    lat: number;
    lon: number;
  };
  visual_notification: boolean;
  audio_notification: boolean;
  status: NavigationAlertStatus;
  response_action?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface RouteReplanHistory {
  id: string;
  route_id?: string;
  replan_reason: string;
  original_route: Record<string, any>;
  new_route: Record<string, any>;
  trigger_data: Record<string, any>;
  autonomous: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface NavigationEnvironment {
  id: string;
  route_id?: string;
  location: {
    lat: number;
    lon: number;
  };
  weather_conditions: {
    condition?: string;
    temperature?: number;
    humidity?: number;
    precipitation?: number;
  };
  sea_state: {
    state?: string;
    wave_height?: number;
    wave_period?: number;
    swell_direction?: number;
  };
  visibility_meters?: number;
  wind_speed_knots?: number;
  wave_height_meters?: number;
  obstacles: Array<{
    type: string;
    distance: number;
    bearing: number;
    severity: string;
  }>;
  risk_assessment: {
    overall_risk: string;
    risk_factors: Array<{
      factor: string;
      level: string;
    }>;
  };
  timestamp: string;
}
