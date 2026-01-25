/**
 * Voice Assistant Types
 * Shared type definitions for voice recognition system
 */

export type VoiceCommand =
  | "start_psc_inspection"
  | "open_ism_panel"
  | "open_mlc_panel"
  | "open_ovid_panel"
  | "open_lsa_panel"
  | "record_non_conformity"
  | "show_dashboard"
  | "open_reports"
  | "help"
  | "cancel";

export interface VoiceCommandConfig {
  command: VoiceCommand;
  keywords: string[];
  alternativeKeywords?: string[];
  action?: () => void | Promise<void>;
  description: string;
  route?: string;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  command?: VoiceCommand;
  timestamp: string;
}

export interface VoiceAssistantConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  autoStart: boolean;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isEnabled: boolean;
  lastTranscript: string | null;
  lastCommand: VoiceCommand | null;
  error: string | null;
}
