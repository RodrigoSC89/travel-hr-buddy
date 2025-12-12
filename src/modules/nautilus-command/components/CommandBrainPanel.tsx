/**
import { useEffect, useRef, useState } from "react";;
 * Command Brain Panel - Painel de Chat com IA otimizado
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Brain, Send, Loader2, Sparkles, Mic, MicOff, Copy, 
  ThumbsUp, ThumbsDown, Lightbulb, Volume2, VolumeX,
  Trash2, Download, History, Settings
} from "lucide-react";
import { useNautilusCommandAI, CommandMessage, SystemContext } from "../hooks/useNautilusCommandAI";

interface CommandBrainPanelProps {
  context: SystemContext;
  onSettingsClick?: () => void;
}

export const CommandBrainPanel = memo(function({ context, onSettingsClick }: CommandBrainPanelProps) {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    setFeedback,
    exportConversation
  } = useNautilusCommandAI();
  
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput("");
    await sendMessage(message, context);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown).webkitSpeechRecognition || (window as unknown).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Erro no reconhecimento de voz");
    };
    recognition.onresult = (event: Event) => {
      const transcript = Array.from(event.results)
        .map((result: unknown) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.start();
  };

  const speakMessage = (content: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Síntese de voz não suportada");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "pt-BR";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Mensagem copiada!");
  };

  const exportChat = () => {
    exportConversation();
  };

  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    setFeedback(messageId, type);
  };

  const suggestions = [
    "Qual o status atual da frota?",
    "Mostre certificados expirando",
    "Previsão de manutenção",
    "Alertas críticos ativos",
    "Gere um briefing executivo",
    "Analise riscos operacionais"
  ];

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card to-primary/5 border-primary/20">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base">Nautilus Brain</span>
              <Badge variant="outline" className="ml-2 text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Central
              </Badge>
            </div>
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Histórico em desenvolvimento")}>
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportChat}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={clearMessages}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary/30" />
              <p className="text-muted-foreground mb-4">
                Pergunte qualquer coisa sobre a operação
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-3 w-3 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600">Nautilus Brain</span>
                          {message.status === "pending" && (
                            <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                          )}
                        </div>
                      )}
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content || (message.status === "pending" ? "Analisando..." : "")}
                      </div>

                      {message.role === "assistant" && message.status === "complete" && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => speakMessage(message.content)}
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-6 px-2 ${message.feedback === "positive" ? "text-green-500 bg-green-50" : ""}`}
                            onClick={() => handleFeedback(message.id, "positive")}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-6 px-2 ${message.feedback === "negative" ? "text-red-500 bg-red-50" : ""}`}
                            onClick={() => handleFeedback(message.id, "negative")}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-3 flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className={`shrink-0 ${isListening ? "bg-red-100 text-red-600 border-red-300" : ""}`}
            onClick={handleVoiceInput}
          >
            {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte ao Nautilus Brain..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
