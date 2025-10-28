// TypeScript types for complete module tables

// ============================================
// CREW MANAGEMENT TYPES
// ============================================

export interface CrewRotation {
  id: string;
  crew_member_id: string;
  vessel_id?: string;
  rotation_type: "embarkation" | "disembarkation" | "rotation" | "leave" | "emergency";
  scheduled_date: string;
  actual_date?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "delayed";
  departure_port?: string;
  arrival_port?: string;
  transportation_method?: string;
  flight_details?: Record<string, any>;
  accommodation_details?: Record<string, any>;
  documentation_status: "pending" | "verified" | "incomplete" | "expired";
  medical_clearance: boolean;
  visa_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CrewAssignment {
  id: string;
  vessel_id: string;
  crew_member_id?: string;
  role: string;
  rank?: string;
  department?: string;
  assignment_status: "active" | "on_leave" | "completed" | "terminated";
  assigned_date: string;
  end_date?: string;
  rotation_schedule?: string;
  certifications?: any[];
  emergency_contact?: Record<string, any>;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============================================
// MARITIME SYSTEM TYPES
// ============================================

export interface IoTSensorData {
  id: string;
  vessel_id: string;
  sensor_id: string;
  sensor_type: "temperature" | "pressure" | "vibration" | "fuel_level" | "engine_rpm" | "gps" | "weather" | "other";
  sensor_location?: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical" | "offline";
  threshold_min?: number;
  threshold_max?: number;
  is_alert: boolean;
  reading_timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CrewRotationLog {
  id: string;
  rotation_id: string;
  log_type: "status_change" | "notification_sent" | "document_updated" | "comment" | "system";
  description: string;
  previous_status?: string;
  new_status?: string;
  performed_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChecklistRecord {
  id: string;
  vessel_id?: string;
  checklist_type: "pre_departure" | "arrival" | "safety" | "maintenance" | "inspection" | "emergency" | "custom";
  checklist_name: string;
  items: any[];
  status: "pending" | "in_progress" | "completed" | "failed" | "expired";
  assigned_to?: string;
  completed_by?: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  completion_percentage: number;
  notes?: string;
  attachments?: any[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VesselStatus {
  id: string;
  vessel_id: string;
  status: "underway" | "at_anchor" | "moored" | "docked" | "maintenance" | "emergency" | "offline";
  speed_knots?: number;
  heading?: number;
  latitude?: number;
  longitude?: number;
  weather_condition?: string;
  sea_state?: string;
  engine_status?: string;
  fuel_level_percentage?: number;
  crew_count?: number;
  cargo_status?: string;
  last_port?: string;
  next_port?: string;
  eta_next_port?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface MaintenanceAlert {
  id: string;
  vessel_id: string;
  maintenance_id?: string;
  alert_type: "due_soon" | "overdue" | "critical" | "parts_needed" | "inspection_required";
  title: string;
  description?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  due_date?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FuelUsage {
  id: string;
  vessel_id: string;
  fuel_type: string;
  amount: number;
  unit: string;
  cost?: number;
  supplier?: string;
  recorded_at: string;
  location?: string;
  odometer_reading?: number;
  efficiency_rating?: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// COMMUNICATION HUB TYPES
// ============================================

export interface CrewMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  vessel_id?: string;
  channel_id?: string;
  message_type: "text" | "voice" | "attachment" | "system" | "alert";
  content?: string;
  subject?: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "draft" | "sent" | "delivered" | "read" | "failed";
  is_read: boolean;
  read_at?: string;
  reply_to_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  storage_path: string;
  storage_bucket: string;
  mime_type?: string;
  thumbnail_path?: string;
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CrewVoiceMessage {
  id: string;
  message_id: string;
  audio_file_path: string;
  duration_seconds?: number;
  transcription?: string;
  transcription_confidence?: number;
  audio_format: string;
  sample_rate?: number;
  storage_bucket: string;
  is_transcribed: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// VOYAGE PLANNER TYPES
// ============================================

export interface VoyagePlan {
  id: string;
  vessel_id: string;
  plan_name: string;
  departure_port: string;
  arrival_port: string;
  waypoints?: any[];
  planned_departure: string;
  planned_arrival: string;
  estimated_duration_hours?: number;
  total_distance_nm?: number;
  status: "draft" | "approved" | "active" | "completed" | "cancelled";
  weather_checked: boolean;
  fuel_optimized: boolean;
  route_type: "shortest" | "fastest" | "economical" | "safest" | "custom";
  average_speed_knots?: number;
  fuel_estimate?: number;
  crew_required?: number;
  cargo_capacity_used?: number;
  special_considerations?: string;
  approval_status: "pending" | "approved" | "rejected";
  approved_by?: string;
  approved_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface RouteForecast {
  id: string;
  voyage_plan_id: string;
  forecast_timestamp: string;
  latitude: number;
  longitude: number;
  weather_condition?: string;
  temperature_celsius?: number;
  wind_speed_knots?: number;
  wind_direction?: number;
  wave_height_meters?: number;
  sea_state?: string;
  visibility_nm?: number;
  precipitation_mm?: number;
  weather_risk_level?: "low" | "moderate" | "high" | "severe";
  recommended_action?: string;
  data_source?: string;
  confidence_level?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FuelSuggestion {
  id: string;
  voyage_plan_id: string;
  suggestion_type: "route_optimization" | "speed_adjustment" | "weather_routing" | "port_optimization";
  current_fuel_estimate: number;
  optimized_fuel_estimate: number;
  potential_savings_percentage?: number;
  potential_savings_cost?: number;
  recommendation_text: string;
  alternative_route?: Record<string, any>;
  optimized_speed_profile?: Record<string, any>;
  confidence_score?: number;
  factors_considered?: any[];
  status: "pending" | "accepted" | "rejected" | "implemented";
  implemented_at?: string;
  actual_savings?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// NOTIFICATIONS CENTER TYPES
// ============================================

export interface NotificationHistory {
  id: string;
  user_id: string;
  notification_type: "push" | "email" | "sms" | "in_app" | "webhook";
  title: string;
  message: string;
  delivery_status: "pending" | "sent" | "delivered" | "failed" | "bounced";
  delivery_method?: string;
  recipient_address?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  clicked_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  priority: "low" | "normal" | "high" | "urgent";
  category?: string;
  source_module?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserNotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  category_preferences: Record<string, any>;
  frequency_limits: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================
// CREW WELLBEING TYPES
// ============================================

export interface CrewHealthRecord {
  id: string;
  crew_member_id: string;
  vessel_id?: string;
  record_type: "daily_check" | "medical_exam" | "incident" | "vaccination" | "mental_health" | "fitness";
  record_date: string;
  overall_health_status?: "excellent" | "good" | "fair" | "poor" | "critical";
  temperature_celsius?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate_bpm?: number;
  fatigue_level?: number;
  stress_level?: number;
  sleep_hours?: number;
  sleep_quality?: "poor" | "fair" | "good" | "excellent";
  symptoms?: string[];
  medications?: string[];
  notes?: string;
  examined_by?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  is_fit_for_duty: boolean;
  restrictions?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WellbeingAlert {
  id: string;
  crew_member_id: string;
  vessel_id?: string;
  alert_type: "fatigue_risk" | "health_concern" | "stress_high" | "mental_health" | "medical_due" | "fitness_issue";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  status: "active" | "acknowledged" | "resolved" | "dismissed" | "escalated";
  detected_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  recommended_actions?: string[];
  ai_generated: boolean;
  ai_confidence_score?: number;
  related_health_record_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================
// USER MANAGEMENT TYPES
// ============================================

export interface UserRole {
  id: string;
  role_name: string;
  role_description?: string;
  permissions: any[];
  is_system_role: boolean;
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserAccessLog {
  id: string;
  user_id?: string;
  action: "login" | "logout" | "page_view" | "api_call" | "data_access" | "data_modify" | "failed_login" | "permission_denied";
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  session_id?: string;
  status?: "success" | "failure" | "blocked";
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
