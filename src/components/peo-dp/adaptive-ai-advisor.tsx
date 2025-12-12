import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAIAdvisor, type UserProfile } from "@/hooks/useAIAdvisor";
import {
  Brain,
  User,
  Send,
  Sparkles,
  Target,
  Shield,
  GraduationCap,
  Wrench,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Lightbulb,
  Clock,
  Star,
  RefreshCw
} from "lucide-react";

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  profile?: UserProfile;
  confidence?: number;
}

const profileConfig: Record<UserProfile, { icon: React.ElementType; label: string; color: string; description: string }> = {
  dpo: { icon: Target, label: "DPO", color: "bg-blue-500", description: "Operador de Posicionamento Dinâmico" },
  inspector: { icon: ClipboardCheck, label: "Inspetor", color: "bg-purple-500", description: "Auditor de Conformidade" },
  manager: { icon: User, label: "Gestor", color: "bg-green-500", description: "Gerente de Operações" },
  engineer: { icon: Wrench, label: "Engenheiro", color: "bg-orange-500", description: "Engenheiro de Sistemas DP" },
  auditor: { icon: Shield, label: "Auditor", color: "bg-red-500", description: "Auditor Externo" }
};

const suggestedQuestions: Record<UserProfile, string[]> = {
  dpo: [
    "Qual o procedimento de troca de turno correto?",
    "Como responder a um Drive-Off?",
    "Quais são os limites operacionais para esta operação?",
    "Explique o ASOG para condições de vento forte"
  ],
  inspector: [
    "Quais itens verificar na auditoria IMCA M117?",
    "Como avaliar conformidade do FMEA?",
    "Lista de não conformidades críticas",
    "Evidências necessárias para certificação DP Class"
  ],
  manager: [
    "Resumo executivo do status DP da frota",
    "KPIs de compliance DP este mês",
    "Análise de custos de manutenção DP",
    "ROI do programa de treinamento DP"
  ],
  engineer: [
    "Diagnóstico de falha no thruster #2",
    "Análise FMEA do sistema de referência",
    "Procedimento de troubleshooting UPS",
    "Especificações de redundância classe DP2"
  ],
  auditor: [
    "Matriz de conformidade IMCA M103",
    "Checklist de auditoria anual DP",
    "Requisitos de documentação para certificação",
    "Gaps de conformidade identificados"
  ]
};

export const AdaptiveAIAdvisor: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>("dpo");
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  
  const { ask, loading, lastResponse } = useAIAdvisor({ 
    profile: selectedProfile,
    language: "pt-BR"
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      profile: selectedProfile
    };

    setConversation(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await ask(inputMessage);
      
      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        profile: selectedProfile,
        confidence: response.confidence
      };

      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erro ao processar pergunta");
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const ProfileIcon = profileConfig[selectedProfile].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Advisor Adaptativo</h2>
            <p className="text-muted-foreground">Assistente inteligente com personalidade por perfil</p>
          </div>
        </div>
      </div>

      {/* Profile Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Selecione seu Perfil</CardTitle>
          <CardDescription>A IA adapta suas respostas conforme seu papel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {(Object.entries(profileConfig) as [UserProfile, typeof profileConfig[UserProfile]][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={key}
                  variant={selectedProfile === key ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col gap-2"
                  onClick={handleSetSelectedProfile}
                >
                  <div className={`p-2 rounded-full ${selectedProfile === key ? "bg-primary-foreground/20" : config.color + "/10"}`}>
                    <Icon className={`h-5 w-5 ${selectedProfile === key ? "" : config.color.replace("bg-", "text-")}`} />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </Button>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
            <ProfileIcon className={`h-6 w-6 ${profileConfig[selectedProfile].color.replace("bg-", "text-")}`} />
            <div>
              <p className="font-medium">{profileConfig[selectedProfile].label}</p>
              <p className="text-sm text-muted-foreground">{profileConfig[selectedProfile].description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversa com AI Advisor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-12">
                    <div>
                      <Sparkles className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Faça uma pergunta para iniciar</p>
                      <p className="text-sm text-muted-foreground">As respostas serão adaptadas ao perfil <strong>{profileConfig[selectedProfile].label}</strong></p>
                    </div>
                  </div>
                ) : (
                  conversation.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                            <Brain className="h-4 w-4" />
                            <span className="text-xs font-medium">AI Advisor</span>
                            {msg.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(msg.confidence * 100)}% confiança
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder={`Pergunte algo como ${profileConfig[selectedProfile].label}...`}
                value={inputMessage}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[60px]"
              />
              <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions & Context */}
        <div className="space-y-4">
          {/* Suggested Questions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Perguntas Sugeridas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions[selectedProfile].map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handlehandleSuggestedQuestion}
                  >
                    <span className="truncate">{q}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Context */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contexto do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {selectedProfile === "dpo" && (
                  <>
                    <p><strong>Foco:</strong> Operação prática e segurança</p>
                    <p><strong>Tom:</strong> Direto, técnico, acionável</p>
                    <p><strong>Referências:</strong> ASOG, FMEA, Manuais</p>
                  </>
                )}
                {selectedProfile === "inspector" && (
                  <>
                    <p><strong>Foco:</strong> Verificação de conformidade</p>
                    <p><strong>Tom:</strong> Metódico, normativo</p>
                    <p><strong>Referências:</strong> IMCA M117, M103, M166</p>
                  </>
                )}
                {selectedProfile === "manager" && (
                  <>
                    <p><strong>Foco:</strong> Visão estratégica e KPIs</p>
                    <p><strong>Tom:</strong> Executivo, conciso</p>
                    <p><strong>Referências:</strong> Dashboards, ROI</p>
                  </>
                )}
                {selectedProfile === "engineer" && (
                  <>
                    <p><strong>Foco:</strong> Diagnóstico técnico</p>
                    <p><strong>Tom:</strong> Analítico, detalhado</p>
                    <p><strong>Referências:</strong> FMEA, Specs, Logs</p>
                  </>
                )}
                {selectedProfile === "auditor" && (
                  <>
                    <p><strong>Foco:</strong> Conformidade regulatória</p>
                    <p><strong>Tom:</strong> Formal, documentado</p>
                    <p><strong>Referências:</strong> IMCA, IMO, Class</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Last Response Quality */}
          {lastResponse && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Qualidade da Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confiança</span>
                    <span className="font-medium">{Math.round(lastResponse.confidence * 100)}%</span>
                  </div>
                  {lastResponse.sources && lastResponse.sources.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fontes:</p>
                      <div className="flex flex-wrap gap-1">
                        {lastResponse.sources.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});
