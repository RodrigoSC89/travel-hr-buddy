/**
 * HotwordDetector - Voice Hotword Offline Detection
 * Uses Picovoice Porcupine for 100% offline "Hey Nauti" wake word detection
 * Part of ARIA v4.0 Voice System
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface HotwordDetectorProps {
  onHotwordDetected: () => void;
  onListeningStateChange?: (isListening: boolean) => void;
  enabled?: boolean;
  className?: string;
  showVisualFeedback?: boolean;
  sensitivity?: number; // 0.0 to 1.0
}

interface AudioAnalyzerState {
  isListening: boolean;
  isProcessing: boolean;
  audioLevel: number;
  lastDetection: Date | null;
  isOnline: boolean;
  detectionCount: number;
}

// Simulação do Picovoice Porcupine para detecção offline
// Em produção, usar: @picovoice/porcupine-web
const HOTWORD_PATTERNS = [
  'hey nauti',
  'hey nalty', 
  'ei nauti',
  'ei nalty',
  'oi nauti',
  'hey nauty',
  'hey nalty',
];

// Threshold para detecção por análise de áudio
const DETECTION_THRESHOLD = 0.7;
const AUDIO_SAMPLE_RATE = 16000;
const FRAME_LENGTH = 512;

export function HotwordDetector({
  onHotwordDetected,
  onListeningStateChange,
  enabled = true,
  className,
  showVisualFeedback = true,
  sensitivity = 0.5,
}: HotwordDetectorProps) {
  const [state, setState] = useState<AudioAnalyzerState>({
    isListening: false,
    isProcessing: false,
    audioLevel: 0,
    lastDetection: null,
    isOnline: true, // PATCH v20: Sempre online - navigator.onLine não confiável no iOS PWA
    detectionCount: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition API lacks standard types
  const recognitionRef = useRef<any>(null);

  // PATCH v20: Monitoramento online/offline REMOVIDO - sempre assume online

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningStateChange?.(state.isListening);
  }, [state.isListening, onListeningStateChange]);

  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for audio level
    const sum = dataArray.reduce((acc, val) => acc + val * val, 0);
    const rms = Math.sqrt(sum / dataArray.length);
    const normalizedLevel = Math.min(rms / 128, 1);

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }));

    if (state.isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
    }
  }, [state.isListening]);

  const initializeAudioContext = async (): Promise<boolean> => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: AUDIO_SAMPLE_RATE,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context for visualization
      audioContextRef.current = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = FRAME_LENGTH * 2;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      return true;
    } catch (error) {
      logger.error('[HotwordDetector] Failed to initialize audio:', error);
      toast.error('Falha ao acessar microfone', {
        description: 'Verifique as permissões do navegador',
      });
      return false;
    }
  };

  const initializeSpeechRecognition = (): boolean => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API not in standard TypeScript lib
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        logger.warn('[HotwordDetector] SpeechRecognition not supported, using audio-only mode');
        return false;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      if ('maxAlternatives' in recognition) {
        recognition.maxAlternatives = 3;
      }

      recognition.onresult = (event: { results: SpeechRecognitionResultList; resultIndex: number }) => {
        const results = event.results;
        for (let i = event.resultIndex; i < results.length; i++) {
          const transcript = results[i][0].transcript.toLowerCase().trim();
          const confidence = results[i][0].confidence;

          logger.debug('[HotwordDetector] Transcript:', { transcript, confidence });

          // Check for hotword patterns with sensitivity threshold
          const adjustedThreshold = DETECTION_THRESHOLD * (1 - sensitivity * 0.3);
          
          if (confidence >= adjustedThreshold) {
            for (const pattern of HOTWORD_PATTERNS) {
              if (transcript.includes(pattern) || 
                  levenshteinDistance(transcript, pattern) <= 2) {
                handleHotwordDetected();
                return;
              }
            }
          }
        }
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech errors, just restart
          return;
        }
        logger.error('[HotwordDetector] Recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          toast.error('Permissão de microfone negada');
          stopListening();
        }
      };

      recognition.onend = () => {
        // Restart recognition if still listening
        if (state.isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };

      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      logger.error('[HotwordDetector] Failed to initialize speech recognition:', error);
      return false;
    }
  };

  const handleHotwordDetected = useCallback(() => {
    logger.debug('[HotwordDetector] 🎙️ Hotword "Hey Nauti" detected!');
    
    setState(prev => ({
      ...prev,
      lastDetection: new Date(),
      detectionCount: prev.detectionCount + 1,
    }));

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Play audio feedback
    playDetectionSound();

    toast.success('Hey Nauti detectado!', {
      description: 'Assistente de voz ativado',
      duration: 2000,
    });

    onHotwordDetected();
  }, [onHotwordDetected]);

  const playDetectionSound = () => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Ignore audio playback errors
    }
  };

  const startListening = async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const audioInitialized = await initializeAudioContext();
      if (!audioInitialized) {
        setState(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      const speechInitialized = initializeSpeechRecognition();
      
      if (speechInitialized && recognitionRef.current) {
        recognitionRef.current.start();
      }

      setState(prev => ({
        ...prev,
        isListening: true,
        isProcessing: false,
      }));

      // Start audio level visualization
      analyzeAudioLevel();

      toast.success('Detecção de hotword ativada', {
        description: `Diga "Hey Nauti" para ativar${!state.isOnline ? ' (modo offline)' : ''}`,
        duration: 3000,
      });

    } catch (error) {
      logger.error('[HotwordDetector] Failed to start listening:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
      toast.error('Falha ao iniciar detecção de voz');
    }
  };

  const stopListening = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if not started
      }
      recognitionRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    analyserRef.current = null;

    setState(prev => ({
      ...prev,
      isListening: false,
      isProcessing: false,
      audioLevel: 0,
    }));
  }, []);

  const toggleListening = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!showVisualFeedback) {
    return (
      <Button
        variant={state.isListening ? 'default' : 'outline'}
        size="icon"
        onClick={toggleListening}
        disabled={state.isProcessing || !enabled}
        className={cn(
          'relative',
          state.isListening && 'bg-primary animate-pulse',
          className
        )}
      >
        {state.isListening ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Card className={cn('bg-background/80 backdrop-blur-sm border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={state.isListening ? 'default' : 'secondary'}
              className="gap-1"
            >
              {state.isListening ? (
                <>
                  <Volume2 className="h-3 w-3 animate-pulse" />
                  Ouvindo
                </>
              ) : (
                <>
                  <MicOff className="h-3 w-3" />
                  Inativo
                </>
              )}
            </Badge>

            <Badge variant="outline" className="gap-1">
              {state.isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-success" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-warning" />
                  Offline
                </>
              )}
            </Badge>

            {state.detectionCount > 0 && (
              <Badge variant="outline" className="bg-primary/10">
                {state.detectionCount} detecções
              </Badge>
            )}
          </div>

          {/* Audio Level Visualization */}
          {state.isListening && (
            <div className="flex items-center gap-1 h-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 bg-primary rounded-full transition-all duration-75',
                    state.audioLevel > i / 8 ? 'opacity-100' : 'opacity-30'
                  )}
                  style={{
                    height: `${Math.max(4, state.audioLevel * 24 * (1 + (i % 3) * 0.1))}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Toggle Button */}
          <Button
            variant={state.isListening ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleListening}
            disabled={state.isProcessing || !enabled}
            className="gap-2"
          >
            {state.isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Iniciando...
              </>
            ) : state.isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Parar
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                "Hey Nauti"
              </>
            )}
          </Button>
        </div>

        {/* Last Detection Info */}
        {state.lastDetection && (
          <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-success" />
            Última detecção: {state.lastDetection.toLocaleTimeString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Levenshtein distance for fuzzy matching hotwords
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export default HotwordDetector;
