/**
 * Global Voice Command Button
 * Fixed button for voice interaction across the entire application
 */

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { SpeechRecognition as SpeechRecognitionType, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "@/types/speech-recognition";

interface VoiceCommandResult {
  command: string;
  action: "navigate" | "execute" | "search" | "ask" | "unknown";
  target?: string;
  response?: string;
}

// Voice command patterns
const COMMAND_PATTERNS: { pattern: RegExp; action: string; target?: string }[] = [
  { pattern: /^(ir para|abrir|navegar para|mostrar)\s*(dashboard|painel)/i, action: "navigate", target: "/dashboard" },
  { pattern: /^(ir para|abrir|mostrar)\s*(telemetria|sensores)/i, action: "navigate", target: "/telemetria" },
  { pattern: /^(ir para|abrir|mostrar)\s*(segurança|security)/i, action: "navigate", target: "/security-center" },
  { pattern: /^(ir para|abrir|mostrar)\s*(ia|inteligência|ai)/i, action: "navigate", target: "/ai-operations-center" },
  { pattern: /^(ir para|abrir|mostrar)\s*(frota|fleet)/i, action: "navigate", target: "/fleet-command" },
  { pattern: /^(ir para|abrir|mostrar)\s*(tripulação|crew)/i, action: "navigate", target: "/crew-management" },
  { pattern: /^(ir para|abrir|mostrar)\s*(manutenção|maintenance)/i, action: "navigate", target: "/maintenance-command" },
  { pattern: /^(ir para|abrir|mostrar)\s*(compliance|conformidade)/i, action: "navigate", target: "/compliance-hub" },
  { pattern: /^(ir para|abrir|mostrar)\s*(simulador|treinamento)/i, action: "navigate", target: "/simulador" },
  { pattern: /^(ir para|abrir|mostrar)\s*(voz|voice)/i, action: "navigate", target: "/voice-assistant" },
  { pattern: /^(gerar|criar)\s*(relatório|report)/i, action: "execute", target: "report" },
  { pattern: /^(buscar|procurar|pesquisar)\s*(.+)/i, action: "search" },
  { pattern: /^(perguntar|qual|como|onde|quando|quem|o que)/i, action: "ask" }
];

export function GlobalVoiceButton() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return;
      const recognitionInstance = new SpeechRecognitionClass();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "pt-BR";

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Permissão de microfone negada");
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const processCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    setShowPanel(true);

    try {
      // Try to match local patterns first
      for (const { pattern, action, target } of COMMAND_PATTERNS) {
        const match = command.match(pattern);
        if (match) {
          if (action === "navigate" && target) {
            speak(`Navegando para ${target.replace("/", "")}`);
            navigate(target);
            setIsProcessing(false);
            return;
          }
        }
      }

      // If no local match, ask AI
      const { data, error } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "copilot",
          messages: [
            {
              role: "user",
              content: `Comando de voz do usuário: "${command}". Responda de forma breve e acionável.`
            }
          ],
          context: {
            type: "voice_command",
            path: window.location.pathname
          }
        }
      });

      if (data?.content) {
        speak(data.content);
      } else {
        speak("Desculpe, não entendi o comando. Tente novamente.");
      }
    } catch (error) {
      console.error("Command processing error:", error);
      speak("Ocorreu um erro ao processar seu comando.");
    } finally {
      setIsProcessing(false);
    }
  }, [navigate]);

  const speak = useCallback(async (text: string) => {
    setIsSpeaking(true);

    try {
      // Use ElevenLabs via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            operation: "tts",
            text,
            voiceId: "JBFqnCBsd6RMkjVDRZzb", // George voice - professional
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            console.error("Audio playback error");
            setIsSpeaking(false);
            // Fallback to Web Speech API
            speakWithWebAPI(text);
          };
          await audio.play();
          return;
        }
      }
    } catch {
      // Fallback silently to Web Speech API
    }

    // Fallback to Web Speech API
    speakWithWebAPI(text);
  }, []);

  const speakWithWebAPI = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setShowPanel(true);
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  return (
    <>
      {/* Floating Voice Button - Now uses relative positioning in container */}
      <div className="relative">
        <Button
          size="lg"
          className={`rounded-full h-14 w-14 shadow-lg transition-all ${
            isListening 
              ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
              : isSpeaking
              ? "bg-success hover:bg-success/90"
              : "bg-primary hover:bg-primary/90"
          }`}
          onClick={toggleListening}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : isSpeaking ? (
            <Volume2 className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Voice Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-6 z-[60] w-80"
          >
            <Card className="shadow-2xl border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mic className={`h-4 w-4 ${isListening ? "text-destructive animate-pulse" : "text-primary"}`} />
                    <span className="text-sm font-medium">
                      {isListening ? "Ouvindo..." : isProcessing ? "Processando..." : isSpeaking ? "Falando..." : "Comando de Voz"}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPanel(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <div className="p-3 bg-muted rounded-lg mb-3">
                    <p className="text-sm italic">"{transcript}"</p>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="flex items-center gap-2">
                  {isListening && (
                    <Badge variant="destructive" className="animate-pulse">
                      <span className="mr-1">●</span> Gravando
                    </Badge>
                  )}
                  {isProcessing && (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processando
                    </Badge>
                  )}
                  {isSpeaking && (
                    <Badge variant="default" className="bg-success">
                      <Volume2 className="h-3 w-3 mr-1" /> Falando
                    </Badge>
                  )}
                </div>

                {/* Quick Commands */}
                {!isListening && !isProcessing && !isSpeaking && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Comandos rápidos:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => processCommand("Ir para dashboard")}
                      >
                        Dashboard
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => processCommand("Ir para telemetria")}
                      >
                        Telemetria
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => processCommand("Ir para segurança")}
                      >
                        Segurança
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
