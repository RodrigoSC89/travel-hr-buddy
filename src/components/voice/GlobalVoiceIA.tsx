/**
 * Global Voice IA Component - AI-powered voice interface
 * Integrates ElevenLabs + Web Speech API for voice commands
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Web Speech API types
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventType {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

interface GlobalVoiceIAProps {
  className?: string;
  onCommand?: (command: string, response: string) => void;
}

export function GlobalVoiceIA({ className, onCommand }: GlobalVoiceIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: "",
    response: "",
    error: null,
  });
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass() as SpeechRecognitionInstance;
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "pt-BR";

      recognitionRef.current.onresult = (event: SpeechRecognitionEventType) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        setVoiceState(prev => ({ ...prev, transcript }));

        if (event.results[0]?.isFinal) {
          processCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventType) => {
        console.error("Speech recognition error:", event.error);
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Erro de reconhecimento: ${event.error}`,
        }));
      };

      recognitionRef.current.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    setVoiceState(prev => ({
      ...prev,
      isListening: true,
      transcript: "",
      error: null,
    }));

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  const processCommand = async (command: string) => {
    setVoiceState(prev => ({ ...prev, isProcessing: true }));

    try {
      const { data, error } = await supabase.functions.invoke("nauti-brain", {
        body: {
          message: command,
          context: "voice_assistant",
          options: {
            stream: false,
            max_tokens: 500,
          },
        },
      });

      if (error) throw error;

      const response = data?.response || data?.message || "Comando processado com sucesso";
      
      setVoiceState(prev => ({
        ...prev,
        isProcessing: false,
        response,
      }));

      speak(response);
      onCommand?.(command, response);

    } catch (error) {
      console.error("Error processing command:", error);
      const errorMsg = "Desculpe, não consegui processar o comando. Tente novamente.";
      setVoiceState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMsg,
      }));
      speak(errorMsg);
    }
  };

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1;

    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes("pt"));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setVoiceState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const quickCommands = [
    { label: "Status da frota", command: "Qual o status atual da frota?" },
    { label: "Alertas críticos", command: "Quais são os alertas críticos ativos?" },
    { label: "Resumo do dia", command: "Faça um resumo das operações de hoje" },
    { label: "Próximas manutenções", command: "Quais são as próximas manutenções programadas?" },
  ];

  return (
    <>
      {/* Floating Voice Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-primary to-primary/80",
          "hover:scale-110 transition-all duration-300",
          voiceState.isListening && "animate-pulse ring-4 ring-primary/30",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Mic className="h-6 w-6 text-primary-foreground" />
      </Button>

      {/* Voice Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg mx-4"
            >
              <Card className="p-6 relative overflow-hidden">
                {/* Background glow effect */}
                <div 
                  className={cn(
                    "absolute inset-0 opacity-20 transition-all duration-500",
                    voiceState.isListening && "bg-gradient-to-br from-green-500 to-emerald-500",
                    voiceState.isProcessing && "bg-gradient-to-br from-blue-500 to-cyan-500",
                    voiceState.isSpeaking && "bg-gradient-to-br from-purple-500 to-pink-500"
                  )}
                />

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Assistente de Voz IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Fale comandos ou perguntas em português
                    </p>
                  </div>
                </div>

                {/* Voice visualization */}
                <div className="flex justify-center mb-6 relative z-10">
                  <div className="relative">
                    <Button
                      variant={voiceState.isListening ? "destructive" : "default"}
                      size="lg"
                      className={cn(
                        "h-24 w-24 rounded-full transition-all duration-300",
                        voiceState.isListening && "animate-pulse"
                      )}
                      onClick={voiceState.isListening ? stopListening : startListening}
                      disabled={voiceState.isProcessing}
                    >
                      {voiceState.isProcessing ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : voiceState.isListening ? (
                        <MicOff className="h-10 w-10" />
                      ) : (
                        <Mic className="h-10 w-10" />
                      )}
                    </Button>

                    {/* Sound waves animation */}
                    {voiceState.isListening && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping" style={{ animationDelay: "0.5s" }} />
                      </>
                    )}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex justify-center gap-2 mb-4 relative z-10">
                  <Badge variant={voiceState.isListening ? "default" : "outline"}>
                    {voiceState.isListening ? "Ouvindo..." : "Pronto"}
                  </Badge>
                  {voiceState.isProcessing && (
                    <Badge variant="secondary">Processando IA...</Badge>
                  )}
                  {voiceState.isSpeaking && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Falando
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={stopSpeaking}
                      >
                        <VolumeX className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>

                {/* Transcript display */}
                {voiceState.transcript && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg relative z-10">
                    <p className="text-sm text-muted-foreground mb-1">Você disse:</p>
                    <p className="font-medium">{voiceState.transcript}</p>
                  </div>
                )}

                {/* Response display */}
                {voiceState.response && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg relative z-10">
                    <p className="text-sm text-muted-foreground mb-1">Resposta:</p>
                    <p className="font-medium text-sm">{voiceState.response}</p>
                  </div>
                )}

                {/* Error display */}
                {voiceState.error && (
                  <div className="mb-4 p-3 bg-destructive/10 rounded-lg relative z-10">
                    <p className="text-sm text-destructive">{voiceState.error}</p>
                  </div>
                )}

                {/* Quick commands */}
                <div className="relative z-10">
                  <p className="text-sm text-muted-foreground mb-2">Comandos rápidos:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickCommands.map((cmd, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVoiceState(prev => ({ ...prev, transcript: cmd.command }));
                          processCommand(cmd.command);
                        }}
                        disabled={voiceState.isProcessing || voiceState.isListening}
                      >
                        {cmd.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GlobalVoiceIA;
