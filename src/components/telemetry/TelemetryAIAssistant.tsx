/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * Telemetry AI Assistant Component
 * Interactive LLM-powered assistant for telemetry analysis
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { useTelemetryAI } from "@/hooks/useTelemetryAI";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TelemetryAIAssistantProps {
  weatherData?: unknown[];
  satelliteData?: unknown[];
  syncStatus?: unknown[];
}

export const TelemetryAIAssistant = memo(function({ 
  weatherData, 
  satelliteData, 
  syncStatus 
}: TelemetryAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isLoading, streamingText, analyzeData, askQuestion, response } = useTelemetryAI();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleAnalyze = async () => {
    const userMsg: Message = {
      role: "user",
      content: "Analise os dados de telemetria atuais e forneça um relatório completo.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      await analyzeData({ weatherData, satelliteData, syncStatus });
      
      if (streamingText) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: streamingText,
          timestamp: new Date(),
        }]);
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const response = await askQuestion(input, { weatherData, satelliteData, syncStatus });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }]);
    } catch {
      // Error handled in hook
    }
  };

  const quickActions = [
    { label: "Analisar Riscos", icon: AlertTriangle, action: "Quais são os principais riscos operacionais atuais?" },
    { label: "Previsão", icon: TrendingUp, action: "Qual a previsão para as próximas 24 horas?" },
    { label: "Segurança", icon: Shield, action: "Há alguma preocupação de segurança nas operações atuais?" },
    { label: "Otimização", icon: Zap, action: "Como posso otimizar as operações com base nos dados atuais?" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Assistente de Telemetria IA
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Gemini 2.5
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(action.action);
              }}
              disabled={isLoading}
              className="text-xs"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
          <Button
            variant="default"
            size="sm"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="ml-auto"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Análise Completa
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef as unknown}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString("pt-BR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming Response */}
            {isLoading && streamingText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                  <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
                  <Loader2 className="h-4 w-4 animate-spin mt-2" />
                </div>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analisando...</span>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Faça uma pergunta ou clique em "Análise Completa"</p>
                <p className="text-xs mt-1">para obter insights sobre os dados de telemetria</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* AI Response Summary */}
        {response && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  response.riskAssessment === "critical" ? "destructive" :
                    response.riskAssessment === "high" ? "default" :
                      response.riskAssessment === "medium" ? "secondary" :
                        "outline"
                }
              >
                Risco: {response.riskAssessment.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                Confiança: {(response.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            {response.recommendations.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <strong>Principais recomendações:</strong>
                <ul className="list-disc list-inside mt-1">
                  {response.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleChange}
            placeholder="Pergunte sobre os dados de telemetria..."
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
