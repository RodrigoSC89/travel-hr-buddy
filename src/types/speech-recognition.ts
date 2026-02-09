/**
 * Shared SpeechRecognition type definitions for Web Speech API
 * Used across voice components to avoid `as any` casts
 */

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string; readonly confidence: number };
  readonly length: number;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

export interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

/** Helper to get SpeechRecognition constructor from window */
export function getSpeechRecognitionAPI(): (new () => SpeechRecognitionInstance) | null {
  const win = window as unknown as Record<string, unknown>;
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  return (Ctor as (new () => SpeechRecognitionInstance)) || null;
}
