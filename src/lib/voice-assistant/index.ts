/**
 * PATCH 628.1 - Voice Assistant (Refactored)
 * Modular voice command interface with Web Speech API
 */

import { logger } from "@/lib/logger";
import {
  VoiceCommand,
  VoiceCommandConfig,
  VoiceAssistantConfig,
  VoiceRecognitionResult,
} from "./types";
import { VoiceRecognitionEngine, isBrowserSupported } from "./recognition-engine";
import { VoiceCommandProcessor } from "./command-processor";

// Re-export types and utilities
export type { VoiceCommand, VoiceCommandConfig, VoiceRecognitionResult, VoiceAssistantConfig };
export { isBrowserSupported } from "./recognition-engine";
export { VoiceRecognitionEngine } from "./recognition-engine";
export { VoiceCommandProcessor } from "./command-processor";
export { matchesCommand, findBestMatch } from "./command-matcher";
export { defaultCommands, getCommandDefinition } from "./command-registry";

/**
 * Main Voice Assistant - Facade for the voice system
 */
export class VoiceAssistant {
  private engine: VoiceRecognitionEngine;
  private processor: VoiceCommandProcessor;
  private isEnabled: boolean = false;
  private onStatusChange?: (isListening: boolean) => void;
  private onTranscript?: (transcript: string, confidence: number) => void;
  private onCommandExecuted?: (command: VoiceCommand) => void;

  constructor(config?: Partial<VoiceAssistantConfig>) {
    this.engine = new VoiceRecognitionEngine(config);
    this.processor = new VoiceCommandProcessor();
    this.setupCallbacks();
  }

  /**
   * Setup internal callbacks
   */
  private setupCallbacks(): void {
    this.engine.onResult((result) => {
      if (this.onTranscript) {
        this.onTranscript(result.transcript, result.confidence);
      }

      // Process command
      this.processor.processTranscript(result.transcript);
    });

    this.processor.onCommand((command) => {
      if (this.onCommandExecuted) {
        this.onCommandExecuted(command);
      }
    });
  }

  /**
   * Check if voice assistant is supported
   */
  static isSupported(): boolean {
    return isBrowserSupported();
  }

  /**
   * Enable voice assistant
   */
  enable(): void {
    this.isEnabled = true;
    logger.info("Voice assistant enabled");
  }

  /**
   * Disable voice assistant
   */
  disable(): void {
    this.isEnabled = false;
    this.stop();
    logger.info("Voice assistant disabled");
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.isEnabled) {
      logger.warn("Voice assistant is not enabled");
      return;
    }

    this.engine.start();
    if (this.onStatusChange) {
      this.onStatusChange(true);
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    this.engine.stop();
    if (this.onStatusChange) {
      this.onStatusChange(false);
    }
  }

  /**
   * Register custom command
   */
  registerCommand(config: VoiceCommandConfig): void {
    this.processor.registerCommand(config);
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): VoiceCommandConfig[] {
    return this.processor.getAvailableCommands();
  }

  /**
   * Set status change callback
   */
  onStatus(callback: (isListening: boolean) => void): void {
    this.onStatusChange = callback;
  }

  /**
   * Set transcript callback
   */
  onTranscriptReceived(
    callback: (transcript: string, confidence: number) => void
  ): void {
    this.onTranscript = callback;
  }

  /**
   * Set command executed callback
   */
  onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandExecuted = callback;
  }

  /**
   * Get listening status
   */
  isListening(): boolean {
    return this.engine.isActive();
  }

  /**
   * Check if enabled
   */
  isActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Get command history
   */
  getHistory(): VoiceRecognitionResult[] {
    return this.engine.getHistory();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.engine.clearHistory();
  }
}

// Default singleton instance
export const voiceAssistant = new VoiceAssistant();
