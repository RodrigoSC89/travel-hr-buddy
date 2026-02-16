/**
 * PEOTRAM Voice Assistant Hook v2
 * Speech recognition + TTS + text fallback
 */
import { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

// Check Speech API support once
const getSpeechRecognitionAPI = (): (new () => SpeechRecognitionType) | undefined => {
  const win = window as unknown as Record<string, unknown>;
  return (win.SpeechRecognition || win.webkitSpeechRecognition) as (new () => SpeechRecognitionType) | undefined;
};

export function usePEOTRAMVoice() {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const speechSupported = useMemo(() => !!getSpeechRecognitionAPI(), []);

  // Process a text query (used by both voice and text input)
  const processQuery = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, transcript: text, isProcessing: true, error: null, response: '' }));

    try {
      const { data, error } = await supabase.functions.invoke('peotram-ai-chat', {
        body: {
          messages: [{ role: 'user', content: text }],
          action: 'voice_assistant'
        }
      });

      if (error) {
        // Edge function returned an error
        const errMsg = typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : 'Erro ao processar comando';
        throw new Error(errMsg);
      }

      const answer = data?.response || data?.answer || 'Não foi possível processar sua solicitação.';

      setState(prev => ({
        ...prev,
        response: answer,
        isProcessing: false
      }));

      // Try to speak the response
      speak(answer);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar comando de voz';
      setState(prev => ({
        ...prev,
        error: message,
        isProcessing: false
      }));
      toast.error(message);
    }
  }, []);

  // Text input handler
  const processText = useCallback((text: string) => {
    processQuery(text);
  }, [processQuery]);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();

    if (!SpeechRecognitionAPI) {
      toast.error('Reconhecimento de voz não suportado neste navegador. Use o campo de texto.');
      setState(prev => ({ ...prev, error: 'Reconhecimento de voz não suportado. Use o campo de texto abaixo.' }));
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null, response: '', transcript: '' }));
      };

      recognition.onresult = (event: SpeechRecognitionType) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({ ...prev, isListening: false }));
        processQuery(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionType) => {
        setState(prev => ({ ...prev, isListening: false }));
        
        if (event.error === 'not-allowed') {
          const msg = 'Permissão de microfone negada. Verifique as permissões do navegador.';
          setState(prev => ({ ...prev, error: msg }));
          toast.error(msg);
        } else if (event.error === 'no-speech') {
          toast.warning('Nenhuma fala detectada. Tente novamente.');
        } else if (event.error === 'aborted') {
          // User cancelled, no error needed
        } else {
          const msg = `Erro de reconhecimento: ${event.error}. Use o campo de texto.`;
          setState(prev => ({ ...prev, error: msg }));
          toast.error(msg);
        }
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
      toast.info('🎤 Ouvindo... fale agora');
    } catch (err) {
      const msg = 'Erro ao iniciar reconhecimento de voz. Use o campo de texto.';
      setState(prev => ({ ...prev, error: msg }));
      toast.error(msg);
    }
  }, [processQuery]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => setState(prev => ({ ...prev, isSpeaking: true }));
    utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));
    utterance.onerror = () => setState(prev => ({ ...prev, isSpeaking: false }));

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const reset = useCallback(() => {
    stopListening();
    stopSpeaking();
    setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      transcript: '',
      response: '',
      error: null,
    });
  }, [stopListening, stopSpeaking]);

  return {
    ...state,
    speechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processText,
    reset,
  };
}
