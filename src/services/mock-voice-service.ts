/**
 * Mock Voice Service
 * TTS e STT simulados sem API keys externas
 * Usa Web Speech API nativa do navegador
 */

// Type declarations for Web Speech API
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export class MockVoiceService {
  private static instance: MockVoiceService;
  private synthesis: SpeechSynthesis | null = null;
  private recognition: SpeechRecognitionInstance | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  static getInstance(): MockVoiceService {
    if (!MockVoiceService.instance) {
      MockVoiceService.instance = new MockVoiceService();
    }
    return MockVoiceService.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      if (this.synthesis) {
        this.voices = this.synthesis.getVoices();
        this.synthesis.onvoiceschanged = () => {
          this.voices = this.synthesis?.getVoices() || [];
        };
      }

      // Setup speech recognition if available
      const SpeechRecognitionAPI = (window as unknown as { 
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      }).SpeechRecognition || 
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';
      }
    }
  }

  /**
   * Text-to-Speech usando Web Speech API
   */
  async speak(text: string, options?: {
    voiceType?: 'professional' | 'friendly' | 'casual';
    rate?: number;
    pitch?: number;
  }): Promise<void> {
    if (!this.synthesis) {
      console.warn('[MockVoiceService] Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a Portuguese voice
      const ptVoice = this.voices.find(v => 
        v.lang.startsWith('pt') || v.lang.includes('BR')
      );
      
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.lang = 'pt-BR';
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      
      // Adjust based on voice type
      switch (options?.voiceType) {
        case 'professional':
          utterance.rate = 0.95;
          utterance.pitch = 0.95;
          break;
        case 'friendly':
          utterance.rate = 1.05;
          utterance.pitch = 1.05;
          break;
        case 'casual':
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
          break;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Speech-to-Text using Web Speech API
   */
  async transcribe(): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available. Use Chrome or Edge browser.');
    }

    return new Promise((resolve, reject) => {
      let finalTranscript = '';

      this.recognition!.onresult = (event: SpeechRecognitionEventType) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
      };

      this.recognition!.onend = () => {
        resolve(finalTranscript || '');
      };

      this.recognition!.onerror = (event: SpeechRecognitionErrorEventType) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition!.start();
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check if speech recognition is available
   */
  isRecognitionAvailable(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if speech synthesis is available
   */
  isSynthesisAvailable(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

export const mockVoice = MockVoiceService.getInstance();
