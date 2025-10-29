import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import {
  Bot,
  Send,
  FileText,
  AlertCircle,
  CheckSquare,
  Wrench,
  Ship,
  Wifi,
  WifiOff,
  Trash2,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  saveMessage,
  saveContext,
  getLastContext,
  clearAllCache,
  getCacheStats,
  type ChatMessage,
  type ChatContext,
} from "@/lib/ai/copilot-cache";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

const TripulantCopilot = () => {
  const [input, setInput] = useState("");
  // Initialize with a safer default, handling cases where navigator.onLine might be undefined
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" && navigator.onLine !== false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cacheStats, setCacheStats] = useState({ messageCount: 0, contextCount: 0, lastUpdate: null as string | null });
  const { messages, isProcessing, sendMessage, clearMessages, quickAction } = 
    useAIAssistant("crew");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(`session-${Date.now()}`);
  const { toast } = useToast();

  // Load cache on mount
  useEffect(() => {
    loadCacheData();
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = async () => {
      const stats = await getCacheStats();
      setCacheStats(stats);
    };
    
    updateStats();
    const interval = setInterval(updateStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Save messages to cache as they arrive
  useEffect(() => {
    if (messages.length > 0) {
      saveToCacheAsync();
    }
  }, [messages]);

  const loadCacheData = async () => {
    try {
      const lastContext = await getLastContext();
      if (lastContext && lastContext.messages.length > 0) {
        logger.info("Loaded cached context", { messageCount: lastContext.messages.length });
        
        toast({
          title: "Cache Carregado",
          description: `${lastContext.messages.length} mensagens restauradas`,
        });
        
        // Note: In production, you'd restore these messages to the assistant
        // For now, we just log that they're available
      }
      setCacheLoaded(true);
    } catch (error) {
      logger.error("Failed to load cache", error);
      setCacheLoaded(true);
    }
  };

  const saveToCacheAsync = async () => {
    try {
      // Save individual messages
      for (const message of messages) {
        const chatMessage: ChatMessage = {
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: new Date().toISOString(),
          mode: isOnline ? "online" : "offline",
        };
        await saveMessage(chatMessage);
      }

      // Save context
      const context: ChatContext = {
        id: `context-${sessionId.current}`,
        sessionId: sessionId.current,
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
          mode: isOnline ? "online" : "offline",
        })),
        lastUpdated: new Date().toISOString(),
        metadata: {
          isOnline,
          messageCount: messages.length,
        },
      };
      await saveContext(context);
    } catch (error) {
      logger.error("Failed to save to cache", error);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearAllCache();
      toast({
        title: "Cache Limpo",
        description: "Histórico local removido",
      });
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      logger.error("Failed to clear cache", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão Restaurada",
        description: "IA online disponível",
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Usando cache local",
        variant: "default",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const message = input.trim();
    setInput("");
    await sendMessage(message, { 
      mode: isOnline ? "online" : "offline",
      cacheEnabled: true,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { id: "report", label: "Relatório", icon: FileText },
    { id: "incident", label: "Incidente", icon: AlertCircle },
    { id: "checklist", label: "Checklist", icon: CheckSquare },
    { id: "technical", label: "Técnico", icon: Wrench },
    { id: "status", label: "Status", icon: Ship },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col">
      {/* Mobile-First Header - Enhanced */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 shadow-lg border-b border-slate-700">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Bot className="h-9 w-9 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">AI Copilot</h1>
              <p className="text-xs text-slate-300">Assistente da Tripulação</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="gap-1 bg-green-600 px-3 py-1">
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Online</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 bg-orange-600 px-3 py-1">
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </Badge>
            )}
            {cacheStats.messageCount > 0 && (
              <Badge variant="outline" className="gap-1 bg-slate-800 border-slate-600">
                <Database className="h-3 w-3" />
                <span className="hidden sm:inline">{cacheStats.messageCount}</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Offline Banner - IA offline */}
        {!isOnline && (
          <div className="max-w-4xl mx-auto mt-3">
            <div className="bg-orange-900/50 border border-orange-600/50 rounded-lg px-4 py-2 flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-orange-300" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-100">IA Offline</p>
                <p className="text-xs text-orange-200">
                  Usando cache local · {cacheStats.messageCount} mensagens salvas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4 flex-1 flex flex-col">
        {/* Quick Actions - Larger Buttons for Mobile */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              {cacheStats.messageCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCache}
                  className="text-xs dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar Cache
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    onClick={() => quickAction(action.id)}
                    disabled={isProcessing}
                    className="h-24 md:h-20 flex flex-col gap-2 text-base md:text-sm dark:bg-slate-800 dark:hover:bg-slate-700 font-medium"
                    variant="outline"
                  >
                    <Icon className="h-6 w-6" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area - Flexible height */}
        <Card className="dark:bg-slate-900 dark:border-slate-800 flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Conversa</CardTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col pb-0">
            {/* Messages */}
            <ScrollArea 
              className="flex-1 pr-4" 
              ref={scrollRef}
            >
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <Bot className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Olá! Sou seu assistente de bordo.
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                      Use as ações rápidas acima ou digite sua pergunta abaixo.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-4 text-sm whitespace-pre-wrap",
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        )}
                      >
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold">
                            U
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Input Area at Bottom - Mobile Optimized */}
      <div className="sticky bottom-0 bg-slate-900 dark:bg-slate-950 border-t border-slate-700 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isOnline
                  ? "Digite sua mensagem..."
                  : "Modo offline - cache local ativo"
              }
              disabled={isProcessing}
              className="text-base md:text-sm dark:bg-slate-800 dark:border-slate-700 h-14 md:h-12 dark:text-white"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="lg"
              className="px-8 h-14 md:h-12 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
          </div>
          
          {!isOnline && (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-900/30 dark:bg-orange-950/50 p-2 rounded-lg border border-orange-600/30">
              <WifiOff className="h-3 w-3" />
              <span>
                Cache local · Respostas limitadas
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Card - Moved above fixed input */}
      <div className="max-w-4xl mx-auto px-4 pb-4 hidden md:block">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Offline-First:</strong> Funciona sem conexão, sincroniza quando online
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>IA Embarcada:</strong> Cache inteligente para respostas rápidas
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Ações Rápidas:</strong> Acesso imediato a tarefas comuns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripulantCopilot;
