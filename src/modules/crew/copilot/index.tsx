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
} from "lucide-react";
import { cn } from "@/lib/utils";

const TripulantCopilot = () => {
  const [input, setInput] = useState("");
  // Initialize with a safer default, handling cases where navigator.onLine might be undefined
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' && navigator.onLine !== false);
  const { messages, isProcessing, sendMessage, clearMessages, quickAction } = 
    useAIAssistant("crew");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">AI Copilot</h1>
              <p className="text-xs text-slate-300">Assistente da Tripulação</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <Wifi className="h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 bg-orange-600">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Quick Actions - Large Buttons for Mobile */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
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
                    className="h-20 flex flex-col gap-2 text-sm dark:bg-slate-800 dark:hover:bg-slate-700"
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

        {/* Chat Area */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
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
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea 
              className="h-[400px] pr-4" 
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

            {/* Input Area - Large for Mobile */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isOnline
                    ? "Digite sua mensagem..."
                    : "Modo offline - funcionalidade limitada"
                }
                disabled={isProcessing}
                className="text-base dark:bg-slate-800 dark:border-slate-700 h-12"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                size="lg"
                className="px-6 h-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {!isOnline && (
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                <WifiOff className="h-4 w-4" />
                <span>
                  Modo offline ativo. Respostas baseadas em cache local.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
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
