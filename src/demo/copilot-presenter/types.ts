/**
 * PATCH 566 - Copilot Presenter Types
 * Types for interactive demo with narrative voice
 */

export interface DemoStep {
  id: string;
  module: string;
  title: string;
  description: string;
  narrative: string;
  highlightSelector?: string;
  duration?: number;
  route?: string;
}

export interface DemoState {
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  userFeedback: DemoFeedback[];
}

export interface DemoFeedback {
  stepId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
  voice?: SpeechSynthesisVoice;
}
