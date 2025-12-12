import { useCallback, useMemo, useEffect, useRef, useState } from "react";;
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Radio,
  MessageSquare,
  Activity,
  Loader2,
  Command,
  Send,
  Bot,
  User,
  Sparkles,
  Navigation,
  CheckCircle,
  AlertCircle,
  Settings,
  Waves
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface VoiceCommand {
  id: string;
  timestamp: string;
  type: "user" | "assistant";
  content: string;
  navigation?: string;
  action?: string;
  status: "pending" | "success" | "error";
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<VoiceCommand[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(1);
  const [useElevenLabs, setUseElevenLabs] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as unknown).SpeechRecognition || (window as unknown).webkitSpeechRecognition;
    
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";

    recognitionRef.current.onresult = (event: Event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        processCommand(transcriptText);
        setTranscript("");
      }
    };

    recognitionRef.current.onerror = (event: unknown: unknown: unknown) => {
      logger.error("Speech recognition error", { error: event.error });
      if (event.error !== "no-speech") {
        toast({
          title: "Erro de reconhecimento",
          description: "Houve um problema com o microfone.",
          variant: "destructive",
        });
      }
      setIsListening(false);
    });

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current?.start();
        } catch (error) {
          logger.error("Error restarting recognition", { error });
        }
      }
    };

    synthRef.current = window.speechSynthesis;
    audioRef.current = new Audio();

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
      audioRef.current?.pause();
    };
  }, [isListening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: "🎤 ARIA ativada",
          description: "Estou ouvindo. Como posso ajudar?",
        };
      } catch (error) {
        logger.error("Error starting recognition", { error });
        toast({
          title: "Erro ao iniciar",
          description: "Não foi possível acessar o microfone.",
          variant: "destructive",
        };
      }
    }
  };

  const processCommand = async (command: string) => {
    if (!command.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add user message
    const userMessage: VoiceCommand = {
      id: userMessageId,
      timestamp: new Date().toISOString(),
      type: "user",
      content: command,
      status: "success",
    };
    setMessages(prev => [...prev, userMessage]);

    // Add pending assistant message
    const pendingMessage: VoiceCommand = {
      id: assistantMessageId,
      timestamp: new Date().toISOString(),
      type: "assistant",
      content: "",
      status: "pending",
    };
    setMessages(prev => [...prev, pendingMessage]);
    setIsProcessing(true);

    try {
      // Call AI endpoint
      const { data, error } = await supabase.functions.invoke("voice-assistant-chat", {
        body: {
          message: command,
          conversationHistory,
        },
      });

      if (error) throw error;

      const response = data.response || "Desculpe, não consegui processar.";
      const navigation = data.navigation;
      const action = data.action;

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: command },
        { role: "assistant", content: response },
      ]);

      // Update assistant message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content: response,
              navigation,
              action,
              status: "success",
            }
            : msg
        )
      );

      // Speak response
      await speak(response);

      // Handle navigation
      if (navigation) {
        setTimeout(() => {
          navigate(navigation);
          toast({
            title: "Navegando",
            description: `Indo para ${navigation}`,
          });
        }, 1500);
      }

    } catch (error) {
      logger.error("Error processing command", { error });
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content: "Desculpe, ocorreu um erro. Tente novamente.",
              status: "error",
            }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = async (text: string) => {
    if (volume === 0) return;

    setIsSpeaking(true);

    try {
      if (useElevenLabs) {
        // Try ElevenLabs first
        const { data, error } = await supabase.functions.invoke("eleven-labs-voice", {
          body: {
            text,
            voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - friendly female voice
            model_id: "eleven_multilingual_v2",
          },
        };

        if (!error && data?.audioContent) {
          const audioSrc = `data:audio/mpeg;base64,${data.audioContent}`;
          if (audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.volume = volume;
            audioRef.current.onended = () => setIsSpeaking(false);
            audioRef.current.onerror = () => {
              setIsSpeaking(false);
              fallbackSpeak(text);
            });
            await audioRef.current.play();
            return;
          }
        }
      }
      
      // Fallback to browser TTS
      fallbackSpeak(text);
    } catch (error) {
      logger.error("TTS error", { error });
      fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text: string) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.volume = volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processCommand(textInput);
      setTextInput("");
    }
  };

  const toggleMute = () => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);
    toast({
      title: newVolume > 0 ? "🔊 Som ativado" : "🔇 Som desativado",
    };
  };

  const clearHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    toast({ title: "Histórico limpo" });
  };

  const quickCommands = [
    { label: "Dashboard", command: "Ir para o dashboard" },
    { label: "Frota", command: "Mostrar a frota" },
    { label: "Tripulação", command: "Ver tripulação" },
    { label: "Relatórios", command: "Abrir relatórios" },
    { label: "Status", command: "Qual o status do sistema?" },
    { label: "Ajuda", command: "O que você pode fazer?" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            {(isListening || isSpeaking) && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ARIA - Assistente de Voz
            </h1>
            <p className="text-muted-foreground">
              Assistente de Resposta Inteligente e Automação do Nautilus One
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isListening ? "default" : "secondary"} className="gap-1">
                  {isListening ? <Radio className="h-3 w-3 animate-pulse" /> : <MicOff className="h-3 w-3" />}
                  {isListening ? "Ouvindo" : "Pausado"}
                </Badge>
                <Badge variant={isSpeaking ? "default" : "secondary"} className="gap-1">
                  {isSpeaking ? <Volume2 className="h-3 w-3 animate-pulse" /> : <VolumeX className="h-3 w-3" />}
                  {isSpeaking ? "Falando" : "Mudo"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Olá! Sou a ARIA, sua assistente de voz.
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Clique no microfone ou digite uma mensagem para começar.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.type === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Pensando...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{msg.content}</p>
                            {msg.navigation && (
                              <Badge variant="outline" className="mt-2 gap-1">
                                <Navigation className="h-3 w-3" />
                                {msg.navigation}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      {msg.type === "user" && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Transcript preview */}
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end gap-3"
                  >
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary/20 border border-primary/30">
                      <p className="text-sm italic">{transcript}...</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Mic className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-4 space-y-3">
              {/* Voice Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  disabled={!isSupported || isProcessing}
                  className={`
                    h-16 w-16 rounded-full flex items-center justify-center transition-all
                    ${isListening 
      ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50" 
      : "bg-gradient-to-br from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/50"
    }
                    ${(!isSupported || isProcessing) && "opacity-50 cursor-not-allowed"}
                  `}
                >
                  {isProcessing ? (
                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                  ) : isListening ? (
                    <Waves className="h-7 w-7 text-white animate-pulse" />
                  ) : (
                    <Mic className="h-7 w-7 text-white" />
                  )}
                </motion.button>
              </div>

              {/* Text Input */}
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <Input
                  placeholder="Ou digite sua mensagem..."
                  value={textInput}
                  onChange={handleChange}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button type="submit" disabled={!textInput.trim() || isProcessing}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Commands */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Command className="h-4 w-4" />
                Comandos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickCommands.map((cmd) => (
                  <Button
                    key={cmd.label}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleprocessCommand}
                    disabled={isProcessing}
                  >
                    {cmd.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={toggleMute}
              >
                <span>Síntese de Voz</span>
                {volume > 0 ? <Volume2 className="h-4 w-4 text-green-500" /> : <VolumeX className="h-4 w-4 text-red-500" />}
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={handleSetUseElevenLabs}
              >
                <span>Voz Premium</span>
                {useElevenLabs ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={clearHistory}
              >
                Limpar Histórico
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reconhecimento</span>
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IA</span>
                  <Badge variant="default">Ativa</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensagens</span>
                  <span className="font-mono">{messages.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm mb-3">
                <strong>Dica:</strong> Experimente perguntar:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• "Qual o status do sistema?"</li>
                <li>• "Me leve para a frota"</li>
                <li>• "Quais módulos estão disponíveis?"</li>
                <li>• "Preciso criar um relatório"</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;