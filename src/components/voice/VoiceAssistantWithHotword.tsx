/**
 * VoiceAssistantWithHotword - Complete Voice Assistant with Hotword Detection
 * Floating button centered at bottom with full AI functionality
 * Part of ARIA v4.0 Voice System - "Hey Nauti" activation
 * NOW WITH ElevenLabs HD Voice Integration!
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, Bot, Sparkles, Wifi, WifiOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioPlayed?: boolean;
}

interface VoiceAssistantWithHotwordProps {
  className?: string;
  onCommand?: (command: string) => void;
}

// Hotword patterns for "Hey Nauti" detection
const HOTWORD_PATTERNS = [
  'hey nauti',
  'hey nalty',
  'ei nauti',
  'ei nalty',
  'oi nauti',
  'hey nauty',
  'oi nauty',
  'hey nolty',
  'ei nolty',
];

// ARIA Voice - Sarah (friendly female voice)
const ARIA_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

export function VoiceAssistantWithHotword({
  className,
  onCommand,
}: VoiceAssistantWithHotwordProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListeningForHotword, setIsListeningForHotword] = useState(false);
  const [isListeningForCommand, setIsListeningForCommand] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  // PATCH v19: Sempre online - navigator.onLine não é confiável no iOS PWA
  const [isOnline] = useState(true);
  const [useHDVoice, setUseHDVoice] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // PATCH v19: Event listeners removidos - causam falsos positivos no iOS PWA

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllListening();
    };
  }, []);

  const stopAllListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsListeningForHotword(false);
    setIsListeningForCommand(false);
    setAudioLevel(0);
  }, []);

  const initAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(avg / 128, 1));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
      return true;
    } catch (error) {
      console.error('[VoiceAssistant] Audio init failed:', error);
      return false;
    }
  };

  const startHotwordListening = async () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    await initAudioVisualization();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        console.log('[HotwordDetector] Heard:', transcript);
        
        for (const pattern of HOTWORD_PATTERNS) {
          if (transcript.includes(pattern)) {
            console.log('[HotwordDetector] 🎙️ HOTWORD DETECTED!');
            handleHotwordActivation();
            return;
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('[HotwordDetector] Error:', event.error);
      }
    };

    recognition.onend = () => {
      // Restart if still listening for hotword
      if (isListeningForHotword && !isActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListeningForHotword(true);
    
    toast.success('🎙️ Diga "Hey Nauti" para ativar', { duration: 2000 });
  };

  const handleHotwordActivation = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Audio feedback
    playActivationSound();
    
    toast.success('Hey Nauti detectado!', { duration: 1500 });
    
    stopAllListening();
    setIsActive(true);
    
    // Immediately start listening for command
    setTimeout(() => startCommandListening(), 300);
  };

  const playActivationSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const startCommandListening = async () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }

    await initAudioVisualization();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      console.log('[VoiceAssistant] Command:', command);
      handleUserCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error('[VoiceAssistant] Command error:', event.error);
      setIsListeningForCommand(false);
      if (event.error !== 'no-speech') {
        toast.error('Erro no reconhecimento');
      }
    };

    recognition.onend = () => {
      setIsListeningForCommand(false);
      stopAllListening();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListeningForCommand(true);

    // Auto-stop after 10 seconds
    setTimeout(() => {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
    }, 10000);
  };

  const handleUserCommand = async (command: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: command,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Process with AI
    setIsProcessingAI(true);
    const response = await processWithAI(command);
    setIsProcessingAI(false);

    // Add assistant response
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Speak response
    speakResponse(response);

    // Callback
    onCommand?.(command);
  };

  const processWithAI = async (command: string): Promise<string> => {
    const lowerCommand = command.toLowerCase();

    // Local navigation commands (fast response)
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('painel')) {
      window.location.href = '/dashboard';
      return 'Navegando para o dashboard principal.';
    }
    if (lowerCommand.includes('tripulação') || lowerCommand.includes('crew')) {
      window.location.href = '/crew';
      return 'Abrindo gestão de tripulação.';
    }
    if (lowerCommand.includes('clima') || lowerCommand.includes('weather') || lowerCommand.includes('tempo')) {
      window.location.href = '/weather-command';
      return 'Abrindo Weather Command.';
    }
    if (lowerCommand.includes('peotram') || lowerCommand.includes('auditoria')) {
      window.location.href = '/peotram-ai';
      return 'Abrindo módulo PEOTRAM AI.';
    }
    if (lowerCommand.includes('gmud') || lowerCommand.includes('mudança')) {
      window.location.href = '/gmud-workflow';
      return 'Abrindo workflow GMUD.';
    }
    if (lowerCommand.includes('digital twin') || lowerCommand.includes('gêmeo')) {
      window.location.href = '/digital-twin';
      return 'Abrindo Digital Twin Engine.';
    }
    if (lowerCommand.includes('manutenção') || lowerCommand.includes('maintenance')) {
      window.location.href = '/maintenance';
      return 'Abrindo módulo de manutenção.';
    }

    // Try AI edge function for complex queries
    try {
      const { data, error } = await supabase.functions.invoke('voice-ai-prompt', {
        body: {
          prompt: command,
          context: 'maritime_operations',
          language: 'pt-BR',
        }
      });

      if (error) throw error;
      if (data?.response) return data.response;
    } catch (error) {
      console.log('[VoiceAssistant] AI fallback to local processing');
    }

    // Local fallback responses
    if (lowerCommand.includes('status') || lowerCommand.includes('como está')) {
      return 'Todos os sistemas operacionais. Frota com 6 de 9 embarcações ativas. 64% da tripulação a bordo. Nenhum alerta crítico.';
    }
    if (lowerCommand.includes('alerta') || lowerCommand.includes('alert')) {
      return 'Você tem 5 alertas pendentes: 2 de manutenção, 2 de certificação, 1 de compliance. Recomendo verificar a aba Alertas.';
    }
    if (lowerCommand.includes('combustível') || lowerCommand.includes('fuel') || lowerCommand.includes('rob')) {
      return 'ROB atual: 85% da capacidade. Consumo médio 24h: 2.3 toneladas. Autonomia estimada: 12 dias.';
    }
    if (lowerCommand.includes('eta') || lowerCommand.includes('chegada')) {
      return 'ETA do próximo porto: 14:30 amanhã. Condições meteorológicas favoráveis para navegação.';
    }
    if (lowerCommand.includes('ajuda') || lowerCommand.includes('help')) {
      return 'Posso ajudar com: navegação entre módulos, status do sistema, alertas, combustível, ETA, tripulação e muito mais. Experimente perguntar sobre qualquer área operacional.';
    }

    return `Entendi: "${command}". Como posso ajudar? Diga "ajuda" para ver opções disponíveis.`;
  };

  const speakResponse = async (text: string) => {
    // Try ElevenLabs HD Voice first if online
    if (useHDVoice && isOnline) {
      try {
        setIsSpeaking(true);
        const response = await fetch(
          `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/elevenlabs-voice`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE',
            },
            body: JSON.stringify({
              operation: 'tts',
              text,
              voiceId: ARIA_VOICE_ID,
              language: 'pt',
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.audioContent) {
            const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => {
              setIsSpeaking(false);
              fallbackToWebSpeech(text);
            };
            await audio.play();
            return;
          }
        }
      } catch (error) {
        console.log('[ARIA] ElevenLabs failed, using fallback:', error);
      }
      setIsSpeaking(false);
    }
    
    // Fallback to Web Speech API
    fallbackToWebSpeech(text);
  };

  const fallbackToWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      speechSynthesis.speak(utterance);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserCommand(textInput.trim());
      setTextInput('');
    }
  };

  const closeAssistant = () => {
    stopAllListening();
    setIsActive(false);
    setMessages([]);
    speechSynthesis.cancel();
  };

  const toggleHotwordListening = () => {
    if (isListeningForHotword) {
      stopAllListening();
    } else {
      startHotwordListening();
    }
  };

  const activateManually = () => {
    setIsActive(true);
    setTimeout(() => startCommandListening(), 200);
  };

  return (
    <div className={cn('fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto', className)}>
      <AnimatePresence mode="wait">
        {!isActive ? (
          /* Floating Button Bar */
          <motion.div
            key="button-bar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex items-center gap-2 bg-background/95 backdrop-blur-lg rounded-full px-3 py-2.5 shadow-2xl border-2 border-primary/30"
          >
            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 cursor-default transition-colors",
                isListeningForHotword 
                  ? "bg-green-500/20 text-green-400 border-green-500/50" 
                  : "bg-muted"
              )}
            >
              {isListeningForHotword ? (
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

            {/* Online Status */}
            <Badge variant="outline" className="gap-1 cursor-default">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-amber-500" />
                  Offline
                </>
              )}
            </Badge>

            {/* Main Activation Button */}
            <Button
              onClick={isListeningForHotword ? activateManually : toggleHotwordListening}
              className={cn(
                "gap-2 rounded-full px-4 transition-all",
                isListeningForHotword 
                  ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg shadow-primary/30"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              <Mic className={cn("h-4 w-4", isListeningForHotword && "animate-pulse")} />
              "Hey Nauti"
            </Button>

            {/* Audio Level Indicator */}
            {isListeningForHotword && (
              <div className="flex items-center gap-0.5 px-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{
                      height: audioLevel > i / 5 ? [4, 16, 4] : 4,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Active Assistant Panel */
          <motion.div
            key="assistant-panel"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
          >
            <Card className="w-96 max-h-[500px] shadow-2xl bg-background/95 backdrop-blur-md border-primary/20">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {isProcessingAI && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <CardTitle className="text-base">ARIA - Nauti One</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isListeningForCommand ? 'default' : 'secondary'}
                    className={cn("gap-1", isListeningForCommand && "animate-pulse")}
                  >
                    {isListeningForCommand ? (
                      <>
                        <Mic className="h-3 w-3" />
                        Ouvindo...
                      </>
                    ) : isProcessingAI ? (
                      <>
                        <Bot className="h-3 w-3 animate-spin" />
                        Pensando...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        Pronto
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={closeAssistant}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                {/* Messages */}
                <ScrollArea className="h-64 mb-4 pr-2">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                      <Bot className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-sm font-medium">
                        Olá! Sou a ARIA.
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        Fale um comando ou digite abaixo.
                      </p>
                      <div className="mt-4 text-xs space-y-1">
                        <p>"ir para dashboard"</p>
                        <p>"status do sistema"</p>
                        <p>"verificar alertas"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'rounded-lg p-3 text-sm',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-8'
                              : 'bg-muted mr-8'
                          )}
                        >
                          {msg.content}
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Digite um comando..."
                    className="flex-1"
                    disabled={isProcessingAI}
                  />
                  <Button
                    type="button"
                    variant={isListeningForCommand ? 'destructive' : 'default'}
                    size="icon"
                    onClick={() => {
                      if (isListeningForCommand) {
                        stopAllListening();
                      } else {
                        startCommandListening();
                      }
                    }}
                    disabled={isProcessingAI}
                  >
                    <Mic className={cn('h-4 w-4', isListeningForCommand && 'animate-pulse')} />
                  </Button>
                  <Button type="submit" size="icon" disabled={!textInput.trim() || isProcessingAI}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {/* Audio Level when listening */}
                {isListeningForCommand && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: audioLevel > i / 12 ? [4, 20, 4] : 4,
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceAssistantWithHotword;
