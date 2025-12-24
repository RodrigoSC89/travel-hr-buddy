/**
 * Conversational Interface Types
 * Types for natural language command system
 */

export type IntentType = 
  | 'navigate'
  | 'query'
  | 'action'
  | 'report'
  | 'help'
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  entities: IntentEntity[];
  suggestedRoute?: string;
  suggestedAction?: string;
  rawQuery: string;
}

export interface IntentEntity {
  type: 'module' | 'vessel' | 'crew' | 'date' | 'metric' | 'status';
  value: string;
  normalized?: string;
}

export interface ConversationalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: ParsedIntent;
  actions?: SuggestedAction[];
  isStreaming?: boolean;
}

export interface SuggestedAction {
  id: string;
  label: string;
  type: 'navigate' | 'execute' | 'query';
  target: string;
  icon?: string;
}

export interface ConversationalContext {
  currentModule: string;
  recentActions: string[];
  userPreferences: Record<string, unknown>;
  sessionHistory: ConversationalMessage[];
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error?: string;
}
