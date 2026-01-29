/**
 * PEOTRAM Voice Chat Component
 * Voice interface for PEOTRAM audit element explanations
 * Focus on critical elements 4 (Execução Operacional) and 6 (Gestão de Risco)
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  Sparkles,
  RotateCcw,
  Star,
  HelpCircle,
  Zap
} from "lucide-react";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

interface PeotramElement {
  number: number;
  name: string;
  critical: boolean;
  description: string;
}

// 13 ELEMENTOS REAIS DO PEOTRAM 2024 - PETROBRAS
const PEOTRAM_ELEMENTS: PeotramElement[] = [
  { number: 1, name: "Liderança, Gerenciamento e Responsabilidade", critical: false, description: "Compromisso da alta administração e gestão de SMS" },
  { number: 2, name: "Conformidade Legal", critical: false, description: "Requisitos legais, normativos e contratuais" },
  { number: 3, name: "Avaliação e Gestão de Riscos", critical: false, description: "Identificação, análise e controle de riscos" },
  { number: 4, name: "Informação, Documentação e Controle", critical: true, description: "Gestão de documentos e registros do SGI" },
  { number: 5, name: "Pessoal, Capacitação e Competência", critical: false, description: "Gestão de pessoas, treinamento STCW" },
  { number: 6, name: "Integridade Mecânica e Qualidade", critical: true, description: "Manutenção de equipamentos críticos e PMS" },
  { number: 7, name: "Gestão de Contratadas", critical: false, description: "Qualificação e monitoramento de contratadas" },
  { number: 8, name: "Gestão de Operações", critical: false, description: "Procedimentos e controles operacionais" },
  { number: 9, name: "Gestão de Mudanças", critical: false, description: "Controle de mudanças em processos" },
  { number: 10, name: "Tratamento de Anomalias", critical: false, description: "Registro e investigação de incidentes" },
  { number: 11, name: "Preparação e Resposta a Emergências", critical: true, description: "Planos de emergência e exercícios" },
  { number: 12, name: "Comunicação e Consulta", critical: true, description: "Comunicação interna e externa de SMS" },
  { number: 13, name: "Auditoria e Melhoria Contínua", critical: false, description: "Programa de auditorias e análise crítica" },
];

export function PeotramVoiceChat() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [useElevenLabs, setUseElevenLabs] = useState(true); // ElevenLabs por padrão
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleVoiceInput(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };
    }
  }, [transcript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
      toast.info("Escutando... Fale sua pergunta");
    } else {
      toast.error("Reconhecimento de voz não suportado neste navegador");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: VoiceMessage = {
      id: `voice-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('peotram-voice-chat', {
        body: {
          question: text,
          element_number: selectedElement,
          context: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          language: "pt"
        }
      });

      if (error) throw error;

      const assistantMessage: VoiceMessage = {
        id: `voice-${Date.now()}-response`,
        role: "assistant",
        content: data?.response || "Desculpe, não consegui processar sua pergunta.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (data?.response) {
        speak(data.response);
      }
    } catch (error) {
      console.error("Voice chat error:", error);
      toast.error("Erro ao processar pergunta");
      
      const errorMessage: VoiceMessage = {
        id: `voice-${Date.now()}-error`,
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ElevenLabs TTS - High quality voice
  const speakWithElevenLabs = useCallback(async (text: string) => {
    setIsLoadingAudio(true);
    setIsSpeaking(true);
    
    try {
      const supabaseUrl = "https://vnbptmixvwropvanyhdb.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";
      const response = await fetch(
        `${supabaseUrl}/functions/v1/eleven-labs-voice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            text, 
            voice_name: "george", // Clear voice for Portuguese
            model_id: "eleven_multilingual_v2"
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audioContent) {
        // Use data URI for playback - browser handles base64 decoding natively
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        
        // Stop any previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          toast.error("Erro ao reproduzir áudio");
        };
        
        setIsLoadingAudio(false);
        await audio.play();
      }
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      toast.error("Erro no ElevenLabs, usando voz nativa");
      // Fallback to browser TTS
      speakWithBrowser(text);
    }
  }, []);

  // Browser native TTS - Fallback
  const speakWithBrowser = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Main speak function - chooses between ElevenLabs and Browser
  const speak = useCallback((text: string) => {
    if (useElevenLabs) {
      speakWithElevenLabs(text);
    } else {
      speakWithBrowser(text);
    }
  }, [useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

  const stopSpeaking = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  }, []);

  const handleElementSelect = (elementNumber: number) => {
    setSelectedElement(selectedElement === elementNumber ? null : elementNumber);
    const element = PEOTRAM_ELEMENTS.find(e => e.number === elementNumber);
    if (element) {
      toast.info(`Elemento ${elementNumber}: ${element.name}${element.critical ? ' (CRÍTICO)' : ''}`);
    }
  };

  const askAboutElement = async (element: PeotramElement) => {
    const prompt = `Explique de forma didática o Elemento ${element.number} (${element.name}) do PEOTRAM. ${element.critical ? 'Este é um elemento CRÍTICO.' : ''} Inclua: requisitos principais, evidências esperadas e dicas para auditoria.`;
    
    const userMessage: VoiceMessage = {
      id: `voice-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('peotram-voice-chat', {
        body: {
          question: prompt,
          element_number: element.number,
          language: "pt"
        }
      });

      if (error) throw error;

      const assistantMessage: VoiceMessage = {
        id: `voice-${Date.now()}-response`,
        role: "assistant",
        content: data?.response || "Desculpe, não consegui processar.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data?.response) {
        speak(data.response);
      }
    } catch (error) {
      console.error("Element query error:", error);
      toast.error("Erro ao consultar elemento");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedElement(null);
    toast.success("Chat limpo");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg">
            <Mic className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Voice Chat PEOTRAM
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-secondary/10 to-accent/10">
                <Sparkles className="h-3 w-3 mr-1" /> IA de Voz
              </Badge>
              {useElevenLabs && (
                <Badge className="text-xs bg-gradient-to-r from-success to-info">
                  <Zap className="h-3 w-3 mr-1" /> ElevenLabs HD
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Pergunte sobre elementos críticos 4 e 6
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="elevenlabs-toggle"
              checked={useElevenLabs}
              onCheckedChange={setUseElevenLabs}
            />
            <Label htmlFor="elevenlabs-toggle" className="text-xs cursor-pointer">
              {useElevenLabs ? "ElevenLabs HD" : "Voz Nativa"}
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <RotateCcw className="h-4 w-4 mr-2" /> Limpar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Elements Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Elementos PEOTRAM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PEOTRAM_ELEMENTS.map((element) => (
              <div 
                key={element.number}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  selectedElement === element.number 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                } ${element.critical ? 'ring-1 ring-orange-500/30' : ''}`}
                onClick={() => handleElementSelect(element.number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {element.number}
                    </span>
                    <span className="text-sm font-medium">{element.name}</span>
                  </div>
                  {element.critical && (
                    <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{element.description}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    askAboutElement(element);
                  }}
                  disabled={isProcessing}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Perguntar sobre este elemento
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Voice Chat Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[400px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                      <Mic className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm">Pressione o botão do microfone e faça sua pergunta</p>
                      <p className="text-xs mt-2">Ou selecione um elemento para perguntar sobre ele</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                            <span className="text-xs opacity-60">
                              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.role === "assistant" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => speak(message.content)}
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">Processando...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {transcript && isListening && (
                    <div className="flex justify-end">
                      <div className="bg-primary/20 text-primary p-3 rounded-lg">
                        <p className="text-sm italic">{transcript}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                {/* Stop Speaking Button */}
                {isSpeaking && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full h-14 w-14"
                    onClick={stopSpeaking}
                  >
                    <VolumeX className="h-6 w-6" />
                  </Button>
                )}

                {/* Main Mic Button */}
                <Button
                  size="lg"
                  className={`rounded-full h-20 w-20 transition-all ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>

                {/* Speak Last Response */}
                {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full h-14 w-14"
                    onClick={() => speak(messages[messages.length - 1].content)}
                    disabled={isSpeaking}
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                )}
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Escutando... Fale sua pergunta" : 
                   isProcessing ? "Processando resposta..." : 
                   isSpeaking ? "Reproduzindo resposta..." : 
                   "Clique no microfone para começar"}
                </p>
                {selectedElement && (
                  <Badge className="mt-2" variant="secondary">
                    Contexto: Elemento {selectedElement}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
