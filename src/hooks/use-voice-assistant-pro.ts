/**
 * Voice Assistant Pro Hook
 * TTS e STT com ElevenLabs + fallback para Web Speech API
 */

import { useState, useCallback, useRef } from 'react';
import { mockVoice } from '@/services/mock-voice-service';

type VoiceType = 'default' | 'male' | 'female' | 'professional' | 'friendly';

interface UseVoiceAssistantProOptions {
  voiceType?: VoiceType;
  speed?: number;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: Error) => void;
  forceMock?: boolean;
}

const BASE_URL = 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/voice-assistant-pro';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE';

export function useVoiceAssistantPro(options: UseVoiceAssistantProOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  /**
   * Fallback para Web Speech API (TTS)
   */
  const useMockTTS = async (text: string): Promise<void> => {
    setUsingMock(true);
    setIsSpeaking(true);
    options.onSpeakStart?.();
    
    try {
      await mockVoice.speak(text, {
        voiceType: options.voiceType as 'professional' | 'friendly' | 'casual' | undefined,
        rate: options.speed,
      });
    } finally {
      setIsSpeaking(false);
      options.onSpeakEnd?.();
    }
  };

  const speak = useCallback(async (text: string) => {
    if (!text.trim() || isSpeaking) return;

    setIsLoading(true);
    setError(null);

    // Se forçar mock ou Web Speech API disponível como preferência
    if (options.forceMock) {
      try {
        await useMockTTS(text);
        return;
      } catch (err) {
        console.error('[useVoiceAssistantPro] Mock TTS error:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          text,
          voiceType: options.voiceType || 'default',
          speed: options.speed || 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Clean up previous audio
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      setUsingMock(false);
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrlRef.current);
      
      audioRef.current.onplay = () => {
        setIsSpeaking(true);
        options.onSpeakStart?.();
      };

      audioRef.current.onended = () => {
        setIsSpeaking(false);
        options.onSpeakEnd?.();
      };

      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
      };

      await audioRef.current.play();

    } catch (err) {
      console.warn('[useVoiceAssistantPro] API failed, using Web Speech API:', err);
      
      // Fallback para Web Speech API
      try {
        await useMockTTS(text);
      } catch (fallbackErr) {
        const errorMessage = fallbackErr instanceof Error ? fallbackErr.message : 'Failed to generate speech';
        setError(errorMessage);
        options.onError?.(fallbackErr instanceof Error ? fallbackErr : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSpeaking, options]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
    
    // Also stop mock voice
    mockVoice.stop();
  }, []);

  /**
   * Transcrição de áudio (STT)
   */
  const transcribe = useCallback(async (audioBlob?: Blob): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    // Se não tiver blob, usar Web Speech API para gravação ao vivo
    if (!audioBlob) {
      if (!mockVoice.isRecognitionAvailable()) {
        setError('Speech recognition not available. Use Chrome or Edge browser.');
        setIsLoading(false);
        return null;
      }

      setIsListening(true);
      setUsingMock(true);
      
      try {
        const transcript = await mockVoice.transcribe();
        return transcript;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe';
        setError(errorMessage);
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setIsListening(false);
        setIsLoading(false);
      }
    }

    // Tentar API primeiro
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${BASE_URL}?action=stt`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT failed: ${response.status}`);
      }

      setUsingMock(false);
      const data = await response.json();
      return data.text || null;

    } catch (err) {
      console.warn('[useVoiceAssistantPro] STT API failed, using Web Speech:', err);
      
      // Fallback para Web Speech API
      if (mockVoice.isRecognitionAvailable()) {
        setUsingMock(true);
        setIsListening(true);
        try {
          return await mockVoice.transcribe();
        } finally {
          setIsListening(false);
        }
      } else {
        const errorMessage = 'Speech-to-text not available';
        setError(errorMessage);
        options.onError?.(new Error(errorMessage));
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Inicia gravação de voz
   */
  const startListening = useCallback(async (): Promise<string | null> => {
    return transcribe();
  }, [transcribe]);

  /**
   * Para gravação de voz
   */
  const stopListening = useCallback(() => {
    mockVoice.stopListening();
    setIsListening(false);
  }, []);

  // Clean up on unmount
  const cleanup = useCallback(() => {
    stop();
    stopListening();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, [stop, stopListening]);

  return {
    speak,
    stop,
    transcribe,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    isLoading,
    error,
    usingMock,
    cleanup,
    // Capabilities
    isTTSAvailable: true, // Always true with fallback
    isSTTAvailable: mockVoice.isRecognitionAvailable(),
  };
}
