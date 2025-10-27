/**
 * VoiceFeedback
 * Provides voice output using Web Speech API
 */
export class VoiceFeedback {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        
        // Load voices
        this.loadVoices();
        
        // Voices might not be loaded immediately
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => {
            this.loadVoices();
          };
        }

        this.isInitialized = true;
        console.log('VoiceFeedback initialized');
      } else {
        console.warn('Speech Synthesis not supported');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Failed to initialize VoiceFeedback:', error);
      this.isInitialized = false;
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
      console.log(`Loaded ${this.voices.length} voices`);
    }
  }

  /**
   * Speak text with optional configuration
   */
  speak(
    text: string,
    options?: {
      voice?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      lang?: string;
      onEnd?: () => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.synth) {
        reject(new Error('VoiceFeedback not initialized'));
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Set voice
      if (options?.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Try to find Portuguese voice
        const ptVoice = this.voices.find(v => v.lang.startsWith('pt'));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
      }

      // Set parameters
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;
      utterance.lang = options?.lang ?? 'pt-BR';

      // Set event handlers
      utterance.onend = () => {
        this.currentUtterance = null;
        if (options?.onEnd) {
          options.onEnd();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        if (options?.onError) {
          options.onError(event);
        }
        reject(event);
      };

      // Speak
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synth?.paused || false;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Get voices by language
   */
  getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith(lang));
  }

  /**
   * Speak with emotion/urgency adjustment
   */
  async speakWithEmotion(
    text: string,
    emotion: 'calm' | 'urgent' | 'warning' | 'critical' | 'success'
  ): Promise<void> {
    const emotionConfig = {
      calm: { rate: 0.9, pitch: 1.0, volume: 0.8 },
      urgent: { rate: 1.2, pitch: 1.1, volume: 1.0 },
      warning: { rate: 1.0, pitch: 1.2, volume: 0.9 },
      critical: { rate: 1.3, pitch: 1.3, volume: 1.0 },
      success: { rate: 0.95, pitch: 0.9, volume: 0.85 },
    };

    const config = emotionConfig[emotion];
    return this.speak(text, config);
  }

  /**
   * Speak with visual overlay notification
   */
  async speakWithOverlay(
    text: string,
    overlayConfig?: {
      backgroundColor?: string;
      textColor?: string;
      duration?: number;
    }
  ): Promise<void> {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.backgroundColor = overlayConfig?.backgroundColor || 'rgba(0, 0, 0, 0.8)';
    overlay.style.color = overlayConfig?.textColor || '#fff';
    overlay.style.padding = '12px 24px';
    overlay.style.borderRadius = '8px';
    overlay.style.zIndex = '9999';
    overlay.style.fontSize = '16px';
    overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    overlay.style.maxWidth = '80%';
    overlay.style.textAlign = 'center';
    overlay.textContent = text;

    document.body.appendChild(overlay);

    try {
      await this.speak(text);
    } finally {
      // Remove overlay after speech or timeout
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, overlayConfig?.duration || 3000);
    }
  }

  /**
   * Check if voice feedback is available
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const voiceFeedback = new VoiceFeedback();
