/**
 * React Hook for Voice NLU Integration
 * Combines voice recognition with NLU processing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNLUEngine, NLUResult, NLUContext } from '@/lib/voice/nlu-engine';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceNLUOptions {
  language?: string;
  autoNavigate?: boolean;
  onResult?: (result: NLUResult) => void;
  speakResponses?: boolean;
}

// Speech Recognition types for cross-browser compatibility
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { 
    results: { 
      length: number;
      [index: number]: { 
        isFinal: boolean;
        [index: number]: { transcript: string; confidence: number };
      };
    };
  }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Get the Speech Recognition constructor safely
function getSpeechRecognitionAPI(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useVoiceNLU(options: UseVoiceNLUOptions = {}) {
  const { 
    language = 'pt', 
    autoNavigate = true, 
    onResult,
    speakResponses = true 
  } = options;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState<NLUResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const nluEngine = getNLUEngine(language);
  const synthesisRef = useRef<SpeechSynthesis | null>(
    typeof window !== 'undefined' ? window.speechSynthesis : null
  );

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'pt' ? 'pt-BR' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setError(String(event.error));
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);

      if (event.results[last].isFinal) {
        setIsProcessing(true);
        try {
          const result = await nluEngine.processCommand(text);
          setLastResult(result);
          
          // Speak response
          if (speakResponses && result.message) {
            speak(result.message);
          }
          
          // Handle navigation
          if (autoNavigate && result.navigateTo) {
            navigate(result.navigateTo);
          }
          
          // Callback
          onResult?.(result);
          
          // Show toast for feedback
          toast({
            title: result.success ? 'Comando processado' : 'Comando não reconhecido',
            description: result.message,
            variant: result.success ? 'default' : 'destructive'
          });
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language, autoNavigate, speakResponses, onResult, navigate, toast, nluEngine]);

  // Update NLU context
  const updateContext = useCallback((context: Partial<NLUContext>) => {
    nluEngine.updateContext(context);
  }, [nluEngine]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch {
      setError('Microphone access denied');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Process text command directly
  const processCommand = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await nluEngine.processCommand(text);
      setLastResult(result);
      
      if (speakResponses && result.message) {
        speak(result.message);
      }
      
      if (autoNavigate && result.navigateTo) {
        navigate(result.navigateTo);
      }
      
      onResult?.(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [nluEngine, speakResponses, autoNavigate, navigate, onResult]);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) return;

    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    synthesisRef.current.speak(utterance);
  }, [language]);

  // Get help
  const getHelp = useCallback(() => {
    const helpMessage = nluEngine.getHelpMessage();
    speak(helpMessage);
    return helpMessage;
  }, [nluEngine, speak]);

  return {
    isListening,
    isProcessing,
    transcript,
    lastResult,
    error,
    startListening,
    stopListening,
    toggleListening,
    processCommand,
    speak,
    getHelp,
    updateContext
  };
}

export default useVoiceNLU;
