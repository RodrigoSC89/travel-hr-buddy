import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { streamCommandChat, Message, SystemContext } from "@/lib/ai/nautilus-command";
import { Brain, Send, Loader2, Trash2, Cpu, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AICommandCenter = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSystemContext = (): SystemContext => {
    // Get current system status
    return {
      activeModules: ["crew-wellbeing", "insight-dashboard", "autonomy-engine"],
      systemHealth: 87,
      alerts: [],
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 
              ? { ...m, content: assistantContent }
              : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() }];
      });
    };

    try {
      await streamCommandChat({
        messages: [...messages, userMessage],
        context: getSystemContext(),
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({
            title: "Erro",
            description: "Não foi possível processar o comando",
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat limpo",
      description: "Histórico de conversação removido",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Centro de comando inteligente do Nautilus One
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat}>
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saúde</span>
                <span className="font-semibold">87%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Módulos Ativos</span>
                <span className="font-semibold">23</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Autonomy: 3 ações
              </Badge>
              <Badge variant="outline" className="text-xs">
                Insights: 2 relatórios
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Online</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gemini 2.5 Flash
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle>Chat com Nautilus AI</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Brain className="h-16 w-16 text-muted-foreground opacity-50" />
                <div>
                  <h3 className="font-semibold text-lg">Nautilus Command AI</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pergunte sobre o sistema, solicite análises ou execute comandos
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetInput}
                  >
                    Status do sistema
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetInput}
                  >
                    Verificar alertas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetInput}
                  >
                    Decisões recentes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetInput}
                  >
                    Performance
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === "assistant" && (
                          <Brain className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {msg.role === "user" ? "Você" : "Nautilus AI"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={handleChange}
                placeholder="Digite um comando ou pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICommandCenter;
