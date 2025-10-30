/**
 * PATCH 531 - Speech Recognition Service
 * Wake word detection and speech-to-text for Navigation Copilot
 */

import { logger } from "@/lib/logger";

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  timestamp: number;
  containsWakeWord: boolean;
}

export interface SpeechCommand {
  action: string;
  parameters?: Record<string, any>;
  rawText: string;
}

class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private wakeWord: string = "copilot";
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      logger.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "pt-BR"; // Portuguese
    
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      const confidence = event.results[last][0].confidence;
      const isFinal = event.results[last].isFinal;

      if (isFinal) {
        const containsWakeWord = transcript.includes(this.wakeWord);
        
        const result: SpeechRecognitionResult = {
          transcript,
          confidence,
          timestamp: Date.now(),
          containsWakeWord,
        };

        logger.info("Speech recognized", { transcript, confidence, containsWakeWord });

        if (this.onResultCallback) {
          this.onResultCallback(result);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      logger.error("Speech recognition error", event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we're still supposed to be listening
        this.recognition.start();
      }
    };
  }

  public startListening(onResult: (result: SpeechRecognitionResult) => void): boolean {
    if (!this.recognition) {
      logger.warn("Speech recognition not available");
      return false;
    }

    if (this.isListening) {
      logger.warn("Already listening");
      return false;
    }

    try {
      this.onResultCallback = onResult;
      this.isListening = true;
      this.recognition.start();
      logger.info("Started listening for speech");
      return true;
    } catch (error) {
      logger.error("Failed to start speech recognition", error);
      this.isListening = false;
      return false;
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.isListening = false;
      this.recognition.stop();
      this.onResultCallback = null;
      logger.info("Stopped listening for speech");
    } catch (error) {
      logger.error("Failed to stop speech recognition", error);
    }
  }

  public isActive(): boolean {
    return this.isListening;
  }

  public setWakeWord(word: string): void {
    this.wakeWord = word.toLowerCase();
    logger.info("Wake word updated", { wakeWord: this.wakeWord });
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
