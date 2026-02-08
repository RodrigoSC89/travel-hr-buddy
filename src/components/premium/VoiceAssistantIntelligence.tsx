/**
 * Voice Assistant Intelligence
 * Integrado com ai_chat_conversations e ai_audit_logs do Supabase
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, MicOff, Volume2, VolumeX, Brain, MessageSquare, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, Zap, Target, TrendingUp, HelpCircle,
  Command, Radio, Waves, Ship, Users, FileText, Anchor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Voice Commands Catalog (static reference)
const voiceCommands = [
  {
    category: "Navegação", icon: Ship,
    commands: [
      { phrase: "Mostrar status da frota", intent: "fleet.status", slots: [] },
      { phrase: "Qual a posição do [navio]", intent: "vessel.position", slots: ["vessel_name"] },
      { phrase: "Abrir mapa de tracking", intent: "navigation.tracking", slots: [] }
    ]
  },
  {
    category: "Tripulação", icon: Users,
    commands: [
      { phrase: "Quantos tripulantes embarcados", intent: "crew.count", slots: [] },
      { phrase: "Verificar certificados do [tripulante]", intent: "crew.certificates", slots: ["crew_name"] },
      { phrase: "Criar escala para [navio]", intent: "crew.schedule", slots: ["vessel_name"] }
    ]
  },
  {
    category: "Documentos", icon: FileText,
    commands: [
      { phrase: "Buscar documento [tipo]", intent: "document.search", slots: ["doc_type"] },
      { phrase: "Certificados expirando este mês", intent: "document.expiring", slots: [] },
      { phrase: "Gerar relatório de [módulo]", intent: "report.generate", slots: ["module"] }
    ]
  },
  {
    category: "Manutenção", icon: Anchor,
    commands: [
      { phrase: "Ordens de manutenção pendentes", intent: "maintenance.pending", slots: [] },
      { phrase: "Agendar manutenção para [equipamento]", intent: "maintenance.schedule", slots: ["equipment"] },
      { phrase: "Status do drydock do [navio]", intent: "drydock.status", slots: ["vessel_name"] }
    ]
  }
];

export default function VoiceAssistantIntelligence() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState("");
  const [processingStage, setProcessingStage] = useState<"idle" | "asr" | "nlu" | "response">("idle");
  const [confidence, setConfidence] = useState(0);

  // Fetch real conversations from Supabase
  const { data: conversations } = useQuery({
    queryKey: ["ai-chat-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_conversations")
        .select("*, ai_chat_messages(id, role, content, created_at, tokens_used)")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch AI audit logs for VUI metrics
  const { data: aiAuditLogs } = useQuery({
    queryKey: ["ai-audit-logs-vui"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Derive VUI metrics from real data
  const totalInteractions = aiAuditLogs?.length || 0;
  const successfulInteractions = aiAuditLogs?.filter(l => l.confidence_score && l.confidence_score > 0.7).length || 0;
  const avgConfidence = totalInteractions > 0 
    ? (aiAuditLogs!.reduce((s, l) => s + (l.confidence_score || 0), 0) / totalInteractions * 100).toFixed(1) 
    : "0";
  const avgResponseTime = totalInteractions > 0
    ? (aiAuditLogs!.reduce((s, l) => s + (l.response_time_ms || 0), 0) / totalInteractions / 1000).toFixed(1)
    : "0";
  const resolutionRate = totalInteractions > 0
    ? ((successfulInteractions / totalInteractions) * 100).toFixed(1)
    : "0";

  // Recent interactions from conversations
  const recentInteractions = (conversations || []).slice(0, 5).map(conv => {
    const messages = (conv.ai_chat_messages || []) as Array<{
      id: string; role: string; content: string; created_at: string; tokens_used: number | null;
    }>;
    const userMsg = messages.find(m => m.role === "user");
    const aiMsg = messages.find(m => m.role === "assistant");
    return {
      id: conv.id,
      timestamp: new Date(conv.updated_at).toLocaleTimeString("pt-BR"),
      user: "Usuário",
      utterance: userMsg?.content?.slice(0, 80) || conv.title || "Conversa",
      response: aiMsg?.content?.slice(0, 120) || "Resposta processada",
      module: conv.module_context || "geral",
      turns: messages.length,
      tokensUsed: messages.reduce((s, m) => s + (m.tokens_used || 0), 0),
    };
  });

  // Listening simulation
  useEffect(() => {
    if (isListening) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setConfidence(prev => Math.min(100, prev + step * 5));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setConfidence(0);
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setProcessingStage("asr");
      setTimeout(() => setProcessingStage("nlu"), 1500);
      setTimeout(() => setProcessingStage("response"), 2500);
      setTimeout(() => {
        setIsListening(false);
        setProcessingStage("idle");
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Control Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Nauti Voice Assistant
            </CardTitle>
            <CardDescription>Assistente de voz com NLU avançado para operações marítimas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col items-center justify-center py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-xl">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                {isListening && (
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, i) => {
                      const barHeight = 20 + Math.sin(i * 0.8) * 30 + 20;
                      return (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-full animate-pulse"
                          style={{
                            height: `${barHeight}px`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={toggleListening}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110" 
                    : "bg-muted hover:bg-primary/20"
                }`}
              >
                {isListening ? <Waves className="h-10 w-10 animate-pulse" /> : <Mic className="h-10 w-10" />}
              </button>

              <div className="mt-6 text-center">
                {isListening ? (
                  <div className="space-y-2">
                    <p className="font-medium text-primary">Ouvindo...</p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={processingStage === "asr" ? "default" : "secondary"}>ASR</Badge>
                      <span>→</span>
                      <Badge variant={processingStage === "nlu" ? "default" : "secondary"}>NLU</Badge>
                      <span>→</span>
                      <Badge variant={processingStage === "response" ? "default" : "secondary"}>Response</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Diga "Olá Nauti" ou clique para ativar</p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-6">
                <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><HelpCircle className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VUI Metrics from Real Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métricas VUI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Taxa de Resolução</span>
                <span className="font-semibold text-emerald-600">{resolutionRate}%</span>
              </div>
              <Progress value={parseFloat(resolutionRate)} className="h-2" />
            </div>

            <div className="p-3 bg-blue-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Confiança Média</span>
                <span className="font-semibold text-blue-600">{avgConfidence}%</span>
              </div>
              <Progress value={parseFloat(avgConfidence)} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
                <p className="text-lg font-bold">{avgResponseTime}s</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total Interações</p>
                <p className="text-lg font-bold">{totalInteractions}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Conversas</p>
                <p className="text-lg font-bold">{conversations?.length || 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Sucesso</p>
                <p className="text-lg font-bold">{successfulInteractions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commands & Interactions */}
      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commands">Comandos Disponíveis</TabsTrigger>
          <TabsTrigger value="history">Histórico ({recentInteractions.length})</TabsTrigger>
          <TabsTrigger value="training">Treinamento NLU</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceCommands.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.commands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-sm font-medium">"{cmd.phrase}"</p>
                        <p className="text-xs text-muted-foreground">Intent: {cmd.intent}</p>
                      </div>
                      {cmd.slots.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {cmd.slots.length} slot{cmd.slots.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Interações Recentes (Dados Reais)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInteractions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma conversa registrada</p>
                  <p className="text-sm">Interações com o AI Chat aparecerão aqui</p>
                </div>
              ) : recentInteractions.map((interaction) => (
                <div key={interaction.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{interaction.timestamp}</span>
                      <Badge variant="outline">{interaction.module}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {interaction.turns} msgs
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {interaction.tokensUsed} tokens
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Mic className="h-4 w-4 mt-1 text-primary" />
                      <p className="text-sm font-medium">"{interaction.utterance}"</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{interaction.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Modelo NLU
              </CardTitle>
              <CardDescription>Estatísticas do modelo baseadas em dados reais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{totalInteractions}</p>
                  <p className="text-sm text-muted-foreground">Interações Processadas</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold text-emerald-600">{conversations?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{avgConfidence}%</p>
                  <p className="text-sm text-muted-foreground">Confiança Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
