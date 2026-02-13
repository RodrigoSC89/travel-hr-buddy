/**
 * Voice Recognition Engine
 * Handles Web Speech API interactions
 */

import { logger } from "@/lib/logger";
import { VoiceAssistantConfig, VoiceRecognitionResult } from "./types";

const DEFAULT_CONFIG: VoiceAssistantConfig = {
  language: "pt-BR",
  continuous: false,
  interimResults: false,
  maxAlternatives: 1,
  autoStart: false,
};

/**
 * Check if browser supports Web Speech API
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- Web Speech API vendor-prefixed */

interface SpeechRecognitionResultEvent {
  results: { length: number; [index: number]: { [index: number]: { transcript: string; confidence: number } } };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionLike) => void) | null;
  onend: ((this: SpeechRecognitionLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export function isBrowserSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export class VoiceRecognitionEngine {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening: boolean = false;
  private commandHistory: VoiceRecognitionResult[] = [];
  private config: VoiceAssistantConfig;
  private onResultCallback?: (result: VoiceRecognitionResult) => void;

  constructor(config?: Partial<VoiceAssistantConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech API
   */
  private initializeRecognition(): void {
    if (!isBrowserSupported()) {
      logger.debug("Web Speech API not supported in this browser");
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    this.recognition = new Ctor();
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      logger.info("Voice recognition started");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      logger.info("Voice recognition ended");
    };

    this.recognition.onerror = (event: { error: string }) => {
      logger.warn("Voice recognition error", { error: event.error });
      this.isListening = false;
    };

    this.recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      this.handleResult(event);
    };
  }

  /**
   * Handle recognition result
   */
  private handleResult(event: SpeechRecognitionResultEvent): void {
    const results = event.results;
    const lastResult = results[results.length - 1];
    const transcript = lastResult[0].transcript.trim();
    const confidence = lastResult[0].confidence;

    const result: VoiceRecognitionResult = {
      transcript,
      confidence,
      timestamp: new Date().toISOString(),
    };

    this.commandHistory.push(result);
    logger.debug("Voice transcript captured", { transcript, confidence });

    if (this.onResultCallback) {
      this.onResultCallback(result);
    }
  }

  /**
   * Set result callback
   */
  onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.recognition) {
      logger.warn("Speech recognition not available");
      return;
    }

    if (this.isListening) {
      logger.debug("Voice recognition already active");
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      logger.error("Failed to start voice recognition", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch {
      // Silent fail - already stopped
    }
  }

  /**
   * Abort recognition
   */
  abort(): void {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
      this.isListening = false;
    } catch {
      // Silent fail
    }
  }

  /**
   * Get listening status
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Get command history
   */
  getHistory(): VoiceRecognitionResult[] {
    return [...this.commandHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.commandHistory = [];
  }

  /**
   * Check if browser supports speech recognition
   */
  isBrowserSupported(): boolean {
    return isBrowserSupported();
  }
}
