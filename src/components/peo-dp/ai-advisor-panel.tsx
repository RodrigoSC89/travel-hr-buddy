/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * AI Advisor Panel - Copiloto Adaptativo para PEO-DP
 * Interface de chat com personalidade baseada no perfil do usuário
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Brain,
  Send,
  User,
  Bot,
  Sparkles,
  FileText,
  Shield,
  Settings,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Anchor,
  ClipboardCheck,
  BarChart3,
  Wrench
} from "lucide-react";
import { useAIAdvisor, UserProfile } from "@/hooks/useAIAdvisor";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  recommendations?: string[];
}

const profileConfig: Record<UserProfile, { label: string; icon: React.ReactNode; color: string }> = {
  dpo: { label: "DPO Operador", icon: <Anchor className="h-4 w-4" />, color: "bg-blue-500" },
  inspector: { label: "Inspetor", icon: <ClipboardCheck className="h-4 w-4" />, color: "bg-green-500" },
  manager: { label: "Gestor", icon: <BarChart3 className="h-4 w-4" />, color: "bg-purple-500" },
  engineer: { label: "Engenheiro", icon: <Wrench className="h-4 w-4" />, color: "bg-orange-500" },
  auditor: { label: "Auditor", icon: <Shield className="h-4 w-4" />, color: "bg-red-500" },
};

const quickActions: Record<UserProfile, string[]> = {
  dpo: [
    "Quais são os limites ASOG atuais?",
    "Procedimento para perda de referência",
    "Checklist de troca de turno",
    "Como proceder em TAM/CAM?"
  ],
  inspector: [
    "Checklist de auditoria IMCA M117",
    "Requisitos de conformidade DP-2",
    "Gap analysis PEOTRAM",
    "Evidências necessárias para DOC"
  ],
  manager: [
    "KPIs operacionais da frota",
    "Análise de risco consolidada",
    "Relatório executivo mensal",
    "ROI de manutenção preditiva"
  ],
  engineer: [
    "Diagnóstico de falha thruster",
    "Análise FMEA do sistema DP",
    "Manutenção preditiva MRU",
    "Troubleshooting giroscópio"
  ],
  auditor: [
    "Requisitos PEOTRAM Elemento 3",
    "Matriz de conformidade IMCA",
    "Documentação para Lloyd's",
    "Evidências para certificação"
  ],
};

export const AIAdvisorPanel: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>("dpo");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { ask, loading, error } = useAIAdvisor({
    profile,
    language: "pt-BR",
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await ask(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
        recommendations: response.recommendations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      toast.error("Erro ao processar sua pergunta");
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência");
  };

  const exportChat = () => {
    const content = messages
      .map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-advisor-chat-${Date.now()}.txt`;
    a.click();
    toast.success("Chat exportado");
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Chat limpo");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Advisor</h2>
            <p className="text-muted-foreground">Copiloto inteligente adaptativo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={profile} onValueChange={(v) => setProfile(v as UserProfile}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(profileConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge className={profileConfig[profile].color}>
            {profileConfig[profile].icon}
            <span className="ml-1">{profileConfig[profile].label}</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />Chat
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />Ações Rápidas
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Assistente {profileConfig[profile].label}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={exportChat} disabled={messages.length === 0}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Olá! Sou seu assistente especializado para {profileConfig[profile].label}.</p>
                      <p className="text-sm mt-2">Como posso ajudar hoje?</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className={`p-2 rounded-full ${profileConfig[profile].color} text-white`}>
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.sources.map((source, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {message.recommendations && message.recommendations.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Recomendações:</p>
                            <ul className="text-xs space-y-1">
                              {message.recommendations.map((rec, i) => (
                                <li key={i}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handlecopyToClipboard}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="p-2 rounded-full bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-full ${profileConfig[profile].color} text-white`}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Input
                  value={input}
                  onChange={handleChange}
                  placeholder={`Pergunte ao assistente ${profileConfig[profile].label}...`}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas - {profileConfig[profile].label}</CardTitle>
              <CardDescription>Perguntas frequentes para seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions[profile].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 px-4 text-left justify-start"
                    onClick={() => {
                      handleQuickAction(action);
                      setActiveTab("chat");
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2 shrink-0" />
                    <span className="text-sm">{action}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
              <CardDescription>Sessão atual: {messages.length} mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma conversa nesta sessão</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {messages.filter(m => m.role === "user").map((message, i) => (
                      <div key={message.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">Pergunta {i + 1}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
