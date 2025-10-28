/**
 * PATCH 349: Voice Assistant v2 - Multi-Platform Type Definitions
 * Types for voice commands, sessions, and offline support
 */

export type Platform = "web" | "mobile_ios" | "mobile_android" | "desktop";
export type VoiceMode = "online" | "offline" | "hybrid";
export type VoiceEngine = "web_speech_api" | "native" | "fallback";
export type CommandType = "navigation" | "query" | "action" | "unknown";
export type CommandStatus = "processing" | "executed" | "failed" | "rejected";
export type VoiceTone = "professional" | "friendly" | "casual";

export interface VoiceSession {
  id: string;
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  platform: Platform;
  mode: VoiceMode;
  language: string;
  voice_engine?: VoiceEngine;
  commands_count: number;
  successful_commands: number;
  failed_commands: number;
  avg_recognition_confidence?: number;
  device_info?: Record<string, unknown>;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface VoiceCommand {
  id: string;
  session_id: string;
  user_id?: string;
  command_text: string; // Transcribed text
  command_type?: CommandType;
  intent?: string; // e.g., 'fleet_status', 'create_mission'
  entities?: Record<string, unknown>; // Extracted entities
  confidence_score?: number; // 0-1
  status: CommandStatus;
  audio_duration_ms?: number;
  processing_time_ms?: number;
  response_text?: string;
  response_audio_url?: string;
  executed_action?: string;
  execution_result?: Record<string, unknown>;
  error_message?: string;
  is_offline: boolean;
  synced_at?: string; // When offline command was synced
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface VoiceCommandTemplate {
  id: string;
  command_pattern: string; // Pattern matching template
  intent: string;
  description?: string;
  response_template: string;
  action?: string; // Action to execute
  requires_online: boolean;
  popularity_score: number;
  language: string;
  parameters?: Record<string, unknown>; // Parameter extraction rules
  examples?: string[]; // Example phrases
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoicePersonality {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  voice_id?: string; // Voice synthesis ID
  language: string;
  tone: VoiceTone;
  response_style?: {
    verbosity?: "concise" | "normal" | "detailed";
    formality?: "informal" | "neutral" | "formal";
    emoji_enabled?: boolean;
  };
  avatar_url?: string;
  is_default: boolean;
  is_enabled: boolean;
  created_at: string;
}

export interface VoiceCommandCache {
  id: string;
  user_id: string;
  command_pattern: string;
  intent: string;
  cached_response: string;
  cached_data?: Record<string, unknown>;
  last_used_at: string;
  usage_count: number;
  expires_at?: string;
}

export interface VoiceSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  language: string;
  personality_id?: string;
  offline_mode_enabled: boolean;
  auto_sync: boolean;
  voice_speed: number; // 0.5 - 2.0
  voice_pitch: number; // 0.5 - 2.0
  wake_word: string;
  wake_word_enabled: boolean;
  notification_sounds: boolean;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  is_final: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface VoiceSynthesisOptions {
  text: string;
  voice?: string;
  language?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
}

export interface CommandExecutionResult {
  success: boolean;
  response_text: string;
  data?: Record<string, unknown>;
  error?: string;
  executed_action?: string;
}

export interface VoiceAnalytics {
  total_sessions: number;
  total_commands: number;
  success_rate: number;
  avg_confidence: number;
  most_used_intents: Array<{
    intent: string;
    count: number;
  }>;
  commands_by_platform: Record<Platform, number>;
  avg_processing_time_ms: number;
}

export interface OfflineCacheConfig {
  max_cached_commands: number;
  cache_expiry_hours: number;
  auto_cache_popular: boolean;
  min_popularity_score: number;
}

export interface VoiceCommandRequest {
  session_id: string;
  command_text: string;
  confidence_score?: number;
  is_offline?: boolean;
}

export interface StartSessionRequest {
  platform: Platform;
  mode?: VoiceMode;
  language?: string;
  device_info?: Record<string, unknown>;
}
