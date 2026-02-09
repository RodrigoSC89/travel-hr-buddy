/**
 * useVoiceInput Hook
 * Provides speech recognition functionality for AI voice input
 * Uses Web Speech API with fallback support
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Type definitions for Web Speech API (local scope to avoid conflicts)
interface VoiceSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): VoiceSpeechRecognitionResult;
    [index: number]: VoiceSpeechRecognitionResult;
  };
}

interface VoiceSpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence: number };
}

interface VoiceSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: VoiceSpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Get the SpeechRecognition constructor
function getSpeechRecognition(): (new () => VoiceSpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & { SpeechRecognition?: new () => VoiceSpeechRecognitionInstance; webkitSpeechRecognition?: new () => VoiceSpeechRecognitionInstance };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

interface UseVoiceInputOptions {
  /** Language for speech recognition (default: 'pt-BR') */
  lang?: string;
  /** Callback when transcription is complete */
  onTranscript?: (text: string) => void;
  /** Callback for interim (partial) results */
  onInterimResult?: (text: string) => void;
  /** Auto-stop after silence (ms) - default: 5000 */
  silenceTimeout?: number;
  /** Continuous listening mode */
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  /** Current transcript text */
  transcript: string;
  /** Interim (partial) transcript */
  interimTranscript: string;
  /** Whether actively listening */
  isListening: boolean;
  /** Whether speech recognition is supported */
  isSupported: boolean;
  /** Error message if any */
  error: string | null;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Toggle listening state */
  toggleListening: () => void;
  /** Clear transcript */
  clearTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    lang = 'pt-BR',
    onTranscript,
    onInterimResult,
    silenceTimeout = 5000,
    continuous = false,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<VoiceSpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for browser support
  const SpeechRecognitionAPI = getSpeechRecognition();
  const isSupported = SpeechRecognitionAPI !== null;

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: VoiceSpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
        onInterimResult?.(interim);
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript('');
        onTranscript?.(finalTranscript);
        
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        if (!continuous) {
          silenceTimerRef.current = setTimeout(() => {
            recognition.stop();
          }, silenceTimeout);
        }
      }
    };

    recognition.onerror = (event: Event & { error?: string }) => {
      const errorMessage = event.error || 'Speech recognition error';
      
      // Don't show error for no-speech or aborted
      if (errorMessage !== 'no-speech' && errorMessage !== 'aborted') {
        setError(errorMessage);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [SpeechRecognitionAPI, lang, continuous, silenceTimeout, onTranscript, onInterimResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started
      setError('Failed to start speech recognition');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    
    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}

export default useVoiceInput;
