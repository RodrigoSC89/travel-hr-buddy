/**
 * Voice Assistant Pro Hook
 * TTS e STT com ElevenLabs
 */

import { useState, useCallback, useRef } from 'react';

type VoiceType = 'default' | 'male' | 'female' | 'professional' | 'friendly';

interface UseVoiceAssistantProOptions {
  voiceType?: VoiceType;
  speed?: number;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: Error) => void;
}

const BASE_URL = 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/voice-assistant-pro';

export function useVoiceAssistantPro(options: UseVoiceAssistantProOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text.trim() || isSpeaking) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          text,
          voiceType: options.voiceType || 'default',
          speed: options.speed || 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Clean up previous audio
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

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

      audioRef.current.onerror = (e) => {
        console.error('[useVoiceAssistantPro] Audio error:', e);
        setIsSpeaking(false);
        setError('Failed to play audio');
      };

      await audioRef.current.play();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
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
  }, []);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${BASE_URL}?action=stt`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `STT failed: ${response.status}`);
      }

      const data = await response.json();
      return data.text || null;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Clean up on unmount
  const cleanup = useCallback(() => {
    stop();
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, [stop]);

  return {
    speak,
    stop,
    transcribe,
    isSpeaking,
    isLoading,
    error,
    cleanup,
  };
}
