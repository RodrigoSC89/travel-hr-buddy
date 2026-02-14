/**
 * Compliance Voice Chat - Reusable AI voice assistant for compliance modules
 * Supports ISM, ISPS, PEOTRAM, SOLAS, MARPOL, etc.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getSpeechRecognitionAPI, type SpeechRecognitionInstance } from "@/types/speech-recognition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Mic, MicOff, Volume2, VolumeX, Send, Loader2,
  Bot, User, Brain, Sparkles, Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ComplianceVoiceChatProps {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  systemContext: string;
  suggestedQuestions?: string[];
  icon?: React.ReactNode;
}

export function ComplianceVoiceChat({
  moduleId,
  moduleName,
  moduleDescription,
  systemContext,
  suggestedQuestions = [],
  icon,
}: ComplianceVoiceChatProps) {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "pt-BR";

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        const text = result[0].transcript;
        setTranscript(text);
        if (result.isFinal) {
          handleSendMessage(text);
          setTranscript("");
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não disponível neste navegador");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setTextInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um especialista em ${moduleName}. ${systemContext}. Responda em português de forma clara e técnica, referenciando normas e regulamentos quando aplicável.`,
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: text.trim() },
          ],
        },
      });

      if (error) throw error;

      const responseText = data?.choices?.[0]?.message?.content ||
        data?.response || data?.content ||
        "Desculpe, não consegui processar sua pergunta.";

      const assistantMsg: VoiceMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      speakText(responseText);
    } catch (err) {
      logger.error(`[ComplianceVoiceChat:${moduleId}]`, err);
      setMessages(prev => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "Erro ao processar. Verifique a conexão e tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, moduleId, moduleName, systemContext]);

  const defaultQuestions = suggestedQuestions.length > 0
    ? suggestedQuestions
    : [
        `Quais são os requisitos principais do ${moduleName}?`,
        `Como preparar uma auditoria de ${moduleName}?`,
        `Quais são as não conformidades mais comuns em ${moduleName}?`,
        `Como gerar evidências para ${moduleName}?`,
      ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon || <Brain className="h-6 w-6 text-primary" />}
            <div>
              <CardTitle className="text-lg">Assistente IA - {moduleName}</CardTitle>
              <CardDescription>{moduleDescription}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini 3 Flash
            </Badge>
            {messages.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested Questions */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {defaultQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                className="text-left text-xs h-auto py-2 px-3 justify-start"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="h-[350px] border rounded-lg p-3">
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            {transcript && (
              <div className="flex gap-2 justify-end opacity-60">
                <div className="bg-primary/20 rounded-lg px-3 py-2 text-sm italic">
                  {transcript}...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          {isSpeaking && (
            <Button size="icon" variant="outline" onClick={() => window.speechSynthesis.cancel()}>
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
          <Input
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage(textInput)}
            placeholder={`Pergunte sobre ${moduleName}...`}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(textInput)}
            disabled={!textInput.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComplianceVoiceChat;
