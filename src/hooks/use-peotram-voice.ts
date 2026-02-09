/**
 * PEOTRAM Voice Assistant Hook
 * Speech recognition + TTS for operational procedures
 */
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

// Type definitions for Web Speech API
interface SpeechRecognitionResult {
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

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function usePEOTRAMVoice() {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
  });
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const startListening = useCallback(() => {
    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined = 
      (win.SpeechRecognition || win.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;
    
    if (!SpeechRecognitionAPI) {
      toast.error('Speech recognition não suportado neste navegador');
      logger.warn('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
      logger.debug('Voice recognition started');
    };
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setState(prev => ({ ...prev, transcript, isListening: false, isProcessing: true }));
      
      try {
        // Call PEOTRAM AI via Edge Function
        const { data, error } = await supabase.functions.invoke('peotram-ai-chat', {
          body: { 
            message: transcript,
            context: 'voice_assistant',
            module: 'PEOTRAM'
          }
        });
        
        if (error) throw error;
        
        const answer = data?.response || data?.answer || 'Não foi possível processar sua solicitação.';
        
        setState(prev => ({ 
          ...prev, 
          response: answer,
          isProcessing: false 
        }));
        
        // Speak the response
        speak(answer);
        
        logger.info('Voice query processed', { query: transcript });
        
      } catch (error) {
        logger.error('Voice processing failed', error as Error);
        setState(prev => ({ 
          ...prev, 
          error: 'Erro ao processar comando de voz',
          isProcessing: false 
        }));
        toast.error('Erro ao processar comando de voz');
      }
    };
    
    recognition.onerror = (event) => {
      logger.error('Voice recognition error', new Error(event.error));
      setState(prev => ({ 
        ...prev, 
        error: event.error,
        isListening: false 
      }));
      
      if (event.error === 'not-allowed') {
        toast.error('Permissão de microfone negada');
      } else if (event.error === 'no-speech') {
        toast.warning('Nenhuma fala detectada');
      }
    };
    
    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, []);
  
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      logger.warn('Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };
    
    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };
    
    utterance.onerror = (event) => {
      logger.error('Speech synthesis error', new Error(event.error));
      setState(prev => ({ ...prev, isSpeaking: false }));
    };
    
    synthesisRef.current = utterance;
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
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    reset,
  };
}
