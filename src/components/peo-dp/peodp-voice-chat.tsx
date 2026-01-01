/**
 * PEO-DP Voice Chat
 * Assistente de voz com IA para auditoria PEO-DP Petrobras 2021
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  MessageSquare,
  Bot,
  User,
  Anchor,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PEODP_SECTIONS = [
  { id: "all", name: "Geral (todas as seções)", critical: false },
  { id: "3.1", name: "3.1 - Regras Gerais", critical: false },
  { id: "3.2", name: "3.2 - Gestão ⭐", critical: true },
  { id: "3.3", name: "3.3 - Treinamentos", critical: false },
  { id: "3.4", name: "3.4 - Procedimentos", critical: false },
  { id: "3.5", name: "3.5 - Operação ⭐", critical: true },
  { id: "3.6", name: "3.6 - Manutenção ⭐", critical: true },
  { id: "3.7", name: "3.7 - Testes Anuais ⭐", critical: true }
];

export function PeodpVoiceChat() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
          handleQuestion(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };
    }
  }, [transcript]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
      toast.info("Escutando... Fale sua pergunta sobre PEO-DP");
    } else {
      toast.error("Reconhecimento de voz não suportado neste navegador");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleQuestion = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: VoiceMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    setTextInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('peodp-voice-chat', {
        body: {
          question: text,
          section: selectedSection === "all" ? null : selectedSection,
          context: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          language: "pt"
        }
      });

      if (error) throw error;

      const assistantMessage: VoiceMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: data?.response || "Desculpe, não consegui processar sua pergunta.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (data?.response) {
        speak(data.response.substring(0, 500)); // Limit speech length
      }
    } catch (error) {
      console.error("Voice chat error:", error);
      toast.error("Erro ao processar pergunta");
      
      const errorMessage: VoiceMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleQuestion(textInput);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Assistente PEO-DP</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Petrobras 2021
          </Badge>
        </div>
        <CardDescription>
          Pergunte sobre requisitos, indicadores e conformidade PEO-DP
        </CardDescription>
      </CardHeader>

      <div className="px-4 pb-3">
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Filtrar por seção" />
          </SelectTrigger>
          <SelectContent>
            {PEODP_SECTIONS.map(section => (
              <SelectItem key={section.id} value={section.id}>
                <div className="flex items-center gap-2">
                  {section.name}
                  {section.critical && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Inicie uma conversa sobre PEO-DP</p>
                <p className="text-xs mt-1">Pergunte sobre requisitos, IPCLV, seções críticas...</p>
              </div>
            )}
            
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-[10px] opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <p className="text-sm text-muted-foreground">Analisando...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t space-y-3">
          {/* Transcript Display */}
          {transcript && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
              <span className="font-medium">Ouvindo:</span> {transcript}
            </div>
          )}

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Digite sua pergunta sobre PEO-DP..."
              disabled={isProcessing || isListening}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isProcessing || isListening || !textInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className="rounded-full h-14 w-14"
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant={isSpeaking ? "secondary" : "outline"}
              size="icon"
              onClick={isSpeaking ? stopSpeaking : undefined}
              disabled={!isSpeaking}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {isListening ? "Escutando... Clique para parar" : "Clique no microfone ou digite sua pergunta"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
