/**
import { useCallback, useEffect, useRef, useState } from "react";;
 * REVOLUTIONARY AI - Natural Language Command Interface
 * Funcionalidade 1: Comando Universal por Linguagem Natural
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Sparkles, Command, Loader2, CheckCircle, AlertCircle, Brain, Ship } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNautilusBrain } from "@/hooks/useNautilusBrain";
import { toast } from "sonner";

interface CommandSuggestion {
  text: string;
  category: "maintenance" | "inventory" | "crew" | "compliance" | "analytics";
  confidence: number;
}

const COMMAND_EXAMPLES = [
  { text: "Agende inspeção preventiva para o motor do Navio Sirius até sexta", category: "maintenance" as const },
  { text: "Quantos extintores temos vencendo no mês que vem?", category: "inventory" as const },
  { text: "Liste tripulantes com certificação STCW vencendo", category: "crew" as const },
  { text: "Gere relatório de compliance da última semana", category: "compliance" as const },
  { text: "Qual o consumo médio de combustível da frota?", category: "analytics" as const },
];

export function NaturalLanguageCommand() {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; result: string; timestamp: Date; success: boolean }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, isLoading, sendMessage } = useNautilusBrain({
    vessels: { total: 12, active: 10, maintenance: 2 },
    alerts: { count: 5, critical: 1 },
    maintenance: { pending: 8, upcoming: 15 }
  });

  // Generate suggestions based on input
  useEffect(() => {
    if (command.length > 3) {
      const filtered = COMMAND_EXAMPLES.filter(ex => 
        ex.text.toLowerCase().includes(command.toLowerCase()) ||
        command.toLowerCase().includes(ex.category)
      ).map(ex => ({
        ...ex,
        confidence: Math.random() * 0.3 + 0.7
      }));
      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [command]);

  const handleVoiceToggle = useCallback(async () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Reconhecimento de voz desativado");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Reconhecimento de voz não suportado neste navegador");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Ouvindo... Fale seu comando");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Erro no reconhecimento de voz");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      toast.error("Erro ao iniciar reconhecimento de voz");
    }
  }, [isListening]);

  const handleSubmit = async () => {
    if (!command.trim() || isLoading) return;

    const currentCommand = command;
    setCommand("");
    
    try {
      await sendMessage(currentCommand);
      setCommandHistory(prev => [{
        command: currentCommand,
        result: "Processando...",
        timestamp: new Date(),
        success: true
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      setCommandHistory(prev => [{
        command: currentCommand,
        result: "Erro ao processar comando",
        timestamp: new Date(),
        success: false
      }, ...prev.slice(0, 9)]);
    }
  };

  const handleSuggestionClick = (suggestion: CommandSuggestion) => {
    setCommand(suggestion.text);
    textareaRef.current?.focus();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      inventory: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      crew: "bg-green-500/20 text-green-400 border-green-500/30",
      compliance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      analytics: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Main Command Interface */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Command className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl">Comando Universal</span>
              <p className="text-sm text-muted-foreground font-normal mt-0.5">
                Fale ou digite comandos em linguagem natural
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1" />
              IA Ativa
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Area */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Ex: 'Agende manutenção preventiva para o motor principal do Navio Atlas na próxima semana'"
              className="min-h-[100px] pr-24 resize-none bg-background/50 border-border/50 focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceToggle}
                className={isListening ? "bg-red-500/20 border-red-500/50 text-red-400" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!command.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Sugestões
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all hover:scale-105 ${getCategoryColor(suggestion.category)}`}
                    >
                      {suggestion.text.substring(0, 40)}...
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Examples */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Exemplos de comandos:</p>
            <div className="flex flex-wrap gap-2">
              {COMMAND_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setCommand(ex.text)}
                  className="text-xs px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {ex.text.substring(0, 35)}...
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Area */}
      {messages.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              Resposta do Nautilus Brain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg ${
                      msg.role === "user" 
                        ? "bg-primary/10 ml-8" 
                        : "bg-muted/50 mr-8"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {msg.role === "user" ? "Você" : "Nautilus Brain"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Command History */}
      {commandHistory.length > 0 && (
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Histórico de Comandos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commandHistory.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30">
                  {item.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground">{item.command}</p>
                    <p className="text-muted-foreground">
                      {item.timestamp.toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NaturalLanguageCommand;
