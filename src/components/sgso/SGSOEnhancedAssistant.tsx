import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Send,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  Scale,
  HelpCircle,
  Sparkles,
  ClipboardList,
  Target,
  TrendingUp,
  Search,
  FileCheck,
  AlertCircle,
  Copy,
  Download
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
  type?: string;
}

interface Citation {
  norma: string;
  artigo: string;
  link?: string;
}

// Quick actions organized by category
const QUICK_ACTIONS = {
  practices: [
    { label: "17 Práticas SGSO", query: "Quais são as 17 práticas obrigatórias do SGSO conforme Resolução ANP 43/2007?" },
    { label: "Prática 4 - Treinamento", query: "Como evidenciar a Prática 4 - Competência, Treinamento e Conscientização?" },
    { label: "Prática 13 - MOC", query: "Quais os requisitos da Prática 13 - Gestão de Mudanças (MOC)?" },
    { label: "Prática 8 - Emergências", query: "O que é exigido para a Prática 8 - Preparação e Resposta a Emergências?" }
  ],
  audits: [
    { label: "Preparar Auditoria ANP", query: "Como preparar um dossiê completo para auditoria ANP do SGSO?" },
    { label: "Trilha de Auditoria", query: "Qual a trilha de auditoria recomendada para verificar o SGSO?" },
    { label: "Checklist de Prontidão", query: "Gere um checklist de prontidão para auditoria SGSO" },
    { label: "Evidências por Prática", query: "Quais evidências são esperadas para cada prática do SGSO?" }
  ],
  indicators: [
    { label: "Indicadores TRIR/LTIR", query: "Como calcular TRIR e LTIR conforme padrões ANP?" },
    { label: "KPIs Proativos", query: "Quais são os principais indicadores proativos do SGSO?" },
    { label: "Metas de Segurança", query: "Como definir metas para indicadores de segurança operacional?" },
    { label: "Dashboard de Métricas", query: "Quais métricas devem constar no dashboard de segurança?" }
  ],
  nc: [
    { label: "Tratamento de NC", query: "Qual o prazo e fluxo para tratamento de não conformidades no SGSO?" },
    { label: "Análise Causa Raiz", query: "Como realizar análise de causa raiz para não conformidades?" },
    { label: "Plano de Ação CAPA", query: "Como estruturar um plano de ação CAPA eficaz?" },
    { label: "Verificação de Eficácia", query: "Quais os critérios para verificação de eficácia de CAPAs?" }
  ]
};

const GENERATION_TYPES = [
  { id: "query", label: "Consulta", icon: Search, description: "Dúvidas gerais sobre SGSO" },
  { id: "generate_evidence", label: "Gerar Evidência", icon: FileCheck, description: "Documento formal para auditoria" },
  { id: "audit_checklist", label: "Checklist", icon: ClipboardList, description: "Lista de verificação" },
  { id: "nc_action_plan", label: "Plano de Ação", icon: Target, description: "Tratamento de NC/CAPA" },
  { id: "incident_investigation", label: "Investigação", icon: AlertCircle, description: "Análise de incidente" }
];

export const SGSOEnhancedAssistant: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Bem-vindo ao Oficial Virtual SGSO!**

Sou seu assistente especializado em **Sistema de Gestão de Segurança Operacional** para a indústria de Petróleo e Gás.

🎯 **Posso ajudar com:**
- **Resolução ANP nº 43/2007** e 17 Práticas Obrigatórias
- **Auditorias ANP** - preparação de dossiês e checklists
- **Indicadores de Segurança** - TRIR, LTIR, proativos
- **Tratamento de NCs** e planos de ação CAPA
- **Geração de evidências** formais para auditorias

📋 Todas as respostas incluem **citações normativas**. Selecione uma ação rápida ou digite sua pergunta!`,
      citations: [
        { norma: "Resolução ANP nº 43/2007", artigo: "Art. 1º", link: "https://www.gov.br/anp/sgso" }
      ],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("query");
  const [activeQuickTab, setActiveQuickTab] = useState("practices");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (question?: string, type?: string) => {
    const messageText = question || input.trim();
    if (!messageText) return;

    const messageType = type || selectedType;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
      type: messageType
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sgso-assistant", {
        body: { question: messageText, type: messageType }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "Desculpe, não consegui processar sua solicitação.",
        citations: data.citations || [],
        timestamp: new Date(),
        type: data.type
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling SGSO assistant:", error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência"
    });
  });

  const getTypeIcon = (type: string) => {
    const typeConfig = GENERATION_TYPES.find(t => t.id === type);
    return typeConfig?.icon || Search;
  });

  const getTypeBadge = (type: string) => {
    const typeConfig = GENERATION_TYPES.find(t => t.id === type);
    if (!typeConfig) return null;
    
    const colors: Record<string, string> = {
      query: "bg-blue-600",
      generate_evidence: "bg-green-600",
      audit_checklist: "bg-purple-600",
      nc_action_plan: "bg-orange-600",
      incident_investigation: "bg-red-600"
    };
    
    return (
      <Badge className={`${colors[type]} text-white text-xs`}>
        {typeConfig.label}
      </Badge>
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-foreground">Oficial Virtual SGSO</h2>
              <p className="text-muted-foreground">
                Assistente IA com conhecimento em ANP 43/2007, 17 Práticas e Auditorias
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                LLM Ativa
              </Badge>
              <Badge className="bg-blue-600 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Citação Normativa
              </Badge>
              <Badge className="bg-purple-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Geração de Evidências
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Consulta SGSO com IA
                </CardTitle>
                <CardDescription>
                  Tire dúvidas, gere evidências e prepare-se para auditorias ANP
                </CardDescription>
              </div>
              
              {/* Generation Type Selector */}
              <div className="flex gap-1 flex-wrap">
                {GENERATION_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={handleSetSelectedType}
                    className="text-xs"
                    title={type.description}
                  >
                    <type.icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-[450px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-lg relative group ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {/* Type badge for user messages */}
                      {message.role === "user" && message.type && (
                        <div className="mb-2">
                          {getTypeBadge(message.type)}
                        </div>
                      )}
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">{line}</p>
                        ))}
                      </div>
                      
                      {/* Copy button */}
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => handlecopyToClipboard}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {/* Citations */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            Referências Normativas:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.citations.map((citation, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => citation.link && window.open(citation.link, "_blank"}
                              >
                                <BookOpen className="h-2 w-2 mr-1" />
                                {citation.norma} - {citation.artigo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm">Consultando base normativa ANP...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleChange}
                placeholder={`Digite sua pergunta ou solicitação de ${GENERATION_TYPES.find(t => t.id === selectedType)?.label.toLowerCase()}...`}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Sidebar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Tabs value={activeQuickTab} onValueChange={setActiveQuickTab}>
              <TabsList className="grid grid-cols-2 gap-1 h-auto p-1">
                <TabsTrigger value="practices" className="text-xs py-1.5">
                  <Shield className="h-3 w-3 mr-1" />
                  Práticas
                </TabsTrigger>
                <TabsTrigger value="audits" className="text-xs py-1.5">
                  <FileText className="h-3 w-3 mr-1" />
                  Auditorias
                </TabsTrigger>
                <TabsTrigger value="indicators" className="text-xs py-1.5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Indicadores
                </TabsTrigger>
                <TabsTrigger value="nc" className="text-xs py-1.5">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  NC/CAPA
                </TabsTrigger>
              </TabsList>
              
              {Object.entries(QUICK_ACTIONS).map(([key, actions]) => (
                <TabsContent key={key} value={key} className="mt-3 space-y-2">
                  {actions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2.5 px-3 text-xs hover:bg-primary/5"
                      onClick={() => handlehandleSendMessage}
                      disabled={isLoading}
                    >
                      <FileText className="h-3 w-3 mr-2 shrink-0 text-primary" />
                      <span className="line-clamp-2">{action.label}</span>
                    </Button>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default SGSOEnhancedAssistant;
