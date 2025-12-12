import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Zap, 
  Shield, 
  Activity, 
  Clock,
  TrendingUp,
  Database,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  nautilusRespond, 
  nautilusQuickCommand, 
  getIAStats,
  type NautilusMode 
} from "@/lib/ai/nautilusLLM";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidenceScore?: number;
  executionTime?: number;
  model?: string;
}

const NautilusLLM: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<NautilusMode>("safe");
  const [stats, setStats] = useState({
    totalRequests: 0,
    averageConfidence: 0,
    averageExecutionTime: 0,
    cacheHitRate: 0
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const iaStats = await getIAStats();
    setStats(iaStats);
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await nautilusRespond({
        prompt: userMessage.content,
        mode
      };

      const assistantMessage: Message = {
        id: response.sessionId,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        confidenceScore: response.confidenceScore,
        executionTime: response.executionTime,
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);
      loadStats();

    } catch (error) {
      toast({
        title: "Erro na IA",
        description: "Não foi possível obter resposta da IA. Tentando fallback...",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = async (command: string) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `[Comando Rápido: ${command}]`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await nautilusQuickCommand(command);

      const assistantMessage: Message = {
        id: response.sessionId,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        confidenceScore: response.confidenceScore,
        executionTime: response.executionTime,
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);
      loadStats();

    } catch (error) {
      toast({
        title: "Erro no Comando",
        description: "Não foi possível executar o comando rápido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickCommands = [
    { id: "status", label: "Status Geral", icon: Activity },
    { id: "diagnostico", label: "Diagnóstico", icon: Shield },
    { id: "resumo", label: "Resumo 10min", icon: Clock },
    { id: "modulos-lentos", label: "Módulos Lentos", icon: AlertTriangle },
  ];

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Nautilus LLM Core"
        description="IA Embarcada - Sistema de Inteligência Artificial Integrado"
        gradient="purple"
        badges={[
          { icon: Zap, label: "GPT-4o-mini" },
          { icon: Shield, label: "Modo Seguro" },
          { icon: Database, label: "Memória Ativa" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Estatísticas da IA - Últimas 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Requisições</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Confiança Média</span>
                </div>
                <div className="text-2xl font-bold">{(stats.averageConfidence * 100).toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Tempo Médio</span>
                </div>
                <div className="text-2xl font-bold">{stats.averageExecutionTime.toFixed(0)}ms</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">Taxa de Cache</span>
                </div>
                <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Console de IA
            </CardTitle>
            <CardDescription>
              Interaja com a IA embarcada usando linguagem natural
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as NautilusMode}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deterministic">Determinístico</TabsTrigger>
                <TabsTrigger value="safe">Seguro</TabsTrigger>
                <TabsTrigger value="creative">Criativo</TabsTrigger>
              </TabsList>
            </Tabs>

            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Brain className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma conversa iniciada</p>
                  <p className="text-sm mt-2">Use comandos rápidos ou digite uma pergunta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-2 ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.confidenceScore && (
                          <Badge variant="secondary" className="text-xs">
                            Confiança: {(msg.confidenceScore * 100).toFixed(0)}%
                          </Badge>
                        )}
                        {msg.executionTime && (
                          <Badge variant="outline" className="text-xs">
                            {msg.executionTime}ms
                          </Badge>
                        )}
                        {msg.model && (
                          <Badge variant="outline" className="text-xs">
                            {msg.model}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta ou comando..."
                value={prompt}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !prompt.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Comandos Rápidos</CardTitle>
            <CardDescription>
              Ações pré-definidas para diagnósticos comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlehandleQuickCommand}
                  disabled={isLoading}
                >
                  <cmd.icon className="h-4 w-4 mr-2" />
                  {cmd.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
});

export default NautilusLLM;
