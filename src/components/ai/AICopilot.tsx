/**
 * AI Copilot - Proactive assistant that guides users
 * Features: contextual suggestions, natural language commands
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Play,
  Loader2,
  MessageSquare,
  Minimize2,
  Maximize2,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { VoiceInput } from "./VoiceInput";
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  title: string;
  action: string;
  icon: React.ReactNode;
}

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [suggestions] = useState<Suggestion[]>([
    {
      id: "1",
      title: "Analisar tendências",
      action: "Mostre as tendências de manutenção da frota",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: "2",
      title: "Detectar anomalias",
      action: "Verifique anomalias nos dados operacionais",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      id: "3",
      title: "Gerar insights",
      action: "Gere insights sobre a operação atual",
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      id: "4",
      title: "Simular cenário",
      action: "Simule o impacto de uma parada de manutenção",
      icon: <Play className="h-4 w-4" />,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { chat, analyze, predict, isLoading } = useNautilusAI();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    try {
      // Determine the best action based on input
      let response;
      if (currentInput.toLowerCase().includes("tendência") || currentInput.toLowerCase().includes("prever")) {
        response = await predict("command", currentInput);
      } else if (currentInput.toLowerCase().includes("analis") || currentInput.toLowerCase().includes("anomalia")) {
        response = await analyze("command", currentInput);
      } else {
        response = await chat("command", currentInput);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response?.response || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      logger.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle voice transcription
  const handleVoiceTranscription = useCallback((text: string) => {
    setInput(text);
    // Auto-send after voice input
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder="Digite sua mensagem..."]') as HTMLInputElement;
      if (inputEl) {
        inputEl.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  }, []);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-success" />
        </span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed z-50 shadow-2xl ${
          isMinimized
            ? "bottom-6 right-6 w-72"
            : "bottom-6 right-6 w-96 h-[600px]"
        }`}
      >
        <Card className="h-full flex flex-col bg-background/95 backdrop-blur-lg border-primary/20">
          {/* Header */}
          <CardHeader className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    Nautilus Co-Pilot
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Assistente IA Proativo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Expandir copilot" : "Minimizar copilot"}
                  title={isMinimized ? "Expandir" : "Minimizar"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar copilot"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Content */}
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                  <TabsList className="mx-4 mt-2 grid grid-cols-2">
                    <TabsTrigger value="chat" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Sugestões
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              Olá! Como posso ajudar você hoje?
                            </p>
                            <p className="text-xs mt-1">
                              Pergunte sobre operações, análises ou peça sugestões.
                            </p>
                          </div>
                        )}

                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <p className="text-[10px] opacity-50 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-muted">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <VoiceInput
                          onTranscription={handleVoiceTranscription}
                          disabled={isLoading}
                        />
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua mensagem..."
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={isLoading || !input.trim()}
                          size="icon"
                          aria-label="Enviar mensagem"
                          title="Enviar"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="suggestions" className="flex-1 m-0 p-4">
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-4">
                          Sugestões baseadas no seu contexto atual:
                        </p>
                        {suggestions.map((suggestion) => (
                          <motion.button
                            key={suggestion.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full p-3 rounded-lg border bg-card hover:bg-accent text-left transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {suggestion.icon}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {suggestion.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {suggestion.action}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICopilot;
