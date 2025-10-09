/**
 * Voice Service
 * Consolidates voice recognition and synthesis capabilities
 * Supports: Web Speech API, OpenAI Whisper, and ElevenLabs TTS
 */

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

interface VoiceSynthesisOptions {
  text: string;
  voice?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

type RecognitionEngine = 'browser' | 'whisper';
type SynthesisEngine = 'browser' | 'elevenlabs';

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private recognitionEngine: RecognitionEngine = 'browser';
  private synthesisEngine: SynthesisEngine = 'browser';

  constructor() {
    this.initializeBrowserAPIs();
  }

  /**
   * Initialize browser-native speech APIs
   */
  private initializeBrowserAPIs() {
    // Initialize Web Speech API for recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';
    }

    // Initialize Web Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if browser speech recognition is available
   */
  isBrowserRecognitionAvailable(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if browser speech synthesis is available
   */
  isBrowserSynthesisAvailable(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Check if OpenAI Whisper is configured
   */
  isWhisperConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  /**
   * Check if ElevenLabs is configured
   */
  isElevenLabsConfigured(): boolean {
    return !!import.meta.env.VITE_ELEVENLABS_API_KEY;
  }

  /**
   * Set recognition engine
   */
  setRecognitionEngine(engine: RecognitionEngine) {
    this.recognitionEngine = engine;
  }

  /**
   * Set synthesis engine
   */
  setSynthesisEngine(engine: SynthesisEngine) {
    this.synthesisEngine = engine;
  }

  /**
   * Start listening for voice input
   */
  async startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    if (this.recognitionEngine === 'browser') {
      return this.startBrowserRecognition(onResult, onError);
    } else {
      throw new Error('Whisper recognition requires audio stream processing');
    }
  }

  /**
   * Start browser-based speech recognition
   */
  private startBrowserRecognition(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = new Error('Speech recognition not available in this browser');
        onError?.(error);
        reject(error);
        return;
      }

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        onResult({
          transcript,
          confidence,
          isFinal: result.isFinal,
          alternatives: Array.from(result).map((alt: any) => ({
            transcript: alt.transcript,
            confidence: alt.confidence,
          })),
        });
      };

      this.recognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`);
        onError?.(error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Transcribe audio file using Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Speak text using selected synthesis engine
   */
  async speak(options: VoiceSynthesisOptions): Promise<void> {
    if (this.synthesisEngine === 'browser') {
      return this.speakBrowser(options);
    } else if (this.synthesisEngine === 'elevenlabs') {
      return this.speakElevenLabs(options);
    }
  }

  /**
   * Speak using browser TTS
   */
  private speakBrowser(options: VoiceSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = options.lang || 'pt-BR';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Speak using ElevenLabs TTS
   */
  private async speakElevenLabs(options: VoiceSynthesisOptions): Promise<void> {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const voiceId = options.voice || 'Aria';
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: options.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play();
      });
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  /**
   * Get Portuguese voices
   */
  getPortugueseVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.startsWith('pt')
    );
  }

  /**
   * Cancel ongoing speech
   */
  cancelSpeech(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Record audio for Whisper transcription
   */
  async recordAudio(durationMs: number): Promise<Blob> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      mediaRecorder.onerror = reject;

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), durationMs);
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      browserRecognition: this.isBrowserRecognitionAvailable(),
      browserSynthesis: this.isBrowserSynthesisAvailable(),
      whisper: this.isWhisperConfigured(),
      elevenlabs: this.isElevenLabsConfigured(),
      currentRecognitionEngine: this.recognitionEngine,
      currentSynthesisEngine: this.synthesisEngine,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking(),
    };
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
