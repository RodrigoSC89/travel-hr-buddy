/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * PEO-DP AI Chat Component
 * LLM integrada para geração de evidências e consultas sobre:
 * - Auditoria PEO-DP Petrobras
 * - Legislações sobre Posicionamento Dinâmico
 * - Normas IMCA, IMO, MTS, OCIMF, Nautical Institute
 * - NORMAM (Normas da Autoridade Marítima Brasileira)
 * - Procedimentos de DP
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  BookOpen,
  Scale,
  Shield,
  ClipboardCheck,
  Download,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Anchor,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
  rating?: "positive" | "negative";
  category?: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: "auditoria" | "legislacao" | "procedimentos" | "evidencias";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "req-gestao",
    label: "Requisitos de Gestão (3.2)",
    prompt: "Explique os requisitos de Gestão do PEO-DP Petrobras (seção 3.2), incluindo gestão de riscos, plano de ação e indicadores IPCLV.",
    icon: <ClipboardCheck className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "req-treinamento",
    label: "Requisitos de Treinamento (3.3)",
    prompt: "Quais são os requisitos de Treinamento do PEO-DP (seção 3.3)? Inclua informações sobre certificação DPO, bow-ties e competências.",
    icon: <BookOpen className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "req-procedimentos",
    label: "Procedimentos DP (3.4)",
    prompt: "Detalhe os requisitos de Procedimentos do PEO-DP (seção 3.4), incluindo análise de desvios, FMEA e configuração de referências.",
    icon: <FileText className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "req-operacao",
    label: "Requisitos de Operação (3.5)",
    prompt: "Explique os requisitos de Operação do PEO-DP (seção 3.5), incluindo configuração UTC, exercícios de blackout e ASOG.",
    icon: <Anchor className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "req-manutencao",
    label: "Manutenção DP (3.6)",
    prompt: "Quais são os requisitos de Manutenção do PEO-DP (seção 3.6)? Inclua plano anual, software/hardware e sistemas críticos.",
    icon: <Shield className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "req-testes",
    label: "Testes Anuais DP (3.7)",
    prompt: "Detalhe os requisitos de Testes Anuais DP do PEO-DP (seção 3.7), incluindo DP Trials, CAMO, ASOG e cronograma.",
    icon: <ClipboardCheck className="h-4 w-4" />,
    category: "auditoria"
  },
  {
    id: "imca-m117",
    label: "IMCA M117 - Treinamento DPO",
    prompt: "Explique os requisitos da IMCA M117 para treinamento e certificação de pessoal DP, incluindo Company DP Authority.",
    icon: <Scale className="h-4 w-4" />,
    category: "legislacao"
  },
  {
    id: "imca-m190",
    label: "IMCA M190 - Incidentes DP",
    prompt: "Quais são as diretrizes da IMCA M190 para reporte de incidentes DP, incluindo drift-off, drive-off e blackout?",
    icon: <AlertTriangle className="h-4 w-4" />,
    category: "legislacao"
  },
  {
    id: "normam",
    label: "NORMAM-01/13 - Brasil",
    prompt: "Explique os requisitos das NORMAM-01 e NORMAM-13 da Autoridade Marítima Brasileira aplicáveis a embarcações DP.",
    icon: <Scale className="h-4 w-4" />,
    category: "legislacao"
  },
  {
    id: "asog-definicao",
    label: "O que é ASOG?",
    prompt: "Explique o que é ASOG (Activity Specific Operating Guidelines), seus níveis de status (verde, azul, amarelo, vermelho) e como elaborar.",
    icon: <HelpCircle className="h-4 w-4" />,
    category: "procedimentos"
  },
  {
    id: "fmea-dp",
    label: "FMEA para DP",
    prompt: "Explique o FMEA (Failure Mode and Effect Analysis) aplicado a sistemas DP, requisitos de teste e atualização.",
    icon: <Shield className="h-4 w-4" />,
    category: "procedimentos"
  },
  {
    id: "gerar-evidencia",
    label: "Gerar Evidência de Conformidade",
    prompt: "Gere um modelo de evidência de conformidade para auditoria PEO-DP, incluindo cabeçalho, descrição da verificação, resultados e conclusão.",
    icon: <FileText className="h-4 w-4" />,
    category: "evidencias"
  }
];

const SYSTEM_PROMPT = `Você é um especialista em Posicionamento Dinâmico (DP) e no Programa de Excelência em Operações DP (PEO-DP) da Petrobras. Seu conhecimento abrange:

**PEO-DP - Programa de Excelência em Operações DP (Petrobras DC&L/LOEP/LOFF/EO - 2021)**
Os 7 pilares estratégicos:
1. Gestão (3.2) - Gestão de riscos, plano de ação, indicadores IPCLV, Company DP Authority
2. Treinamentos (3.3) - Capacitação em DP, bow-ties, FMEA, competências técnicas e comportamentais
3. Procedimentos (3.4) - Análise de desvios, incidentes, manual de operações, configuração de referências
4. Operação (3.5) - Sistema DP, FMEA, configuração UTC, exercícios de blackout, ASOG
5. Manutenção (3.6) - Plano anual, software/hardware, sistemas críticos
6. Testes Anuais DP (3.7) - DP Trials, CAMO, ASOG, cronograma de testes

**Normas e Regulamentos:**
- IMCA M103, M109, M115, M117, M166, M182, M190, M196, M206, M220
- IMO MSC/Circ.645, 738, 1580
- ISO 9001, ISO 31000
- MTS DP Operations Guidance
- OCIMF DP Assurance Framework
- NORMAM-01, NORMAM-13, NR-30
- PE-2LEP-00001, PP-2LEP-00002

**ASOG (Activity Specific Operating Guidelines):**
- Verde (GREEN): Operações normais, todos os sistemas dentro dos parâmetros
- Azul (BLUE): Advisory, condições requerem atenção e monitoramento aumentado
- Amarelo (YELLOW): Degradado, operação com restrições, contingência ativa
- Vermelho (RED): Emergência, operação suspensa, procedimentos de emergência

**Termos Técnicos:**
- Drift Off: Empuxo insuficiente após falha
- Drive Off: Empuxo excede requisitos ou direção errada após falha
- Large Excursion: Desvio inaceitavelmente grande ao retornar ao ponto
- Loss of Position: Perda de posição/aproamento fora dos limites
- TAM: Thruster Assisted Mooring
- CAM: Critical Activity Mode
- WCF: Worst Case Failure

Responda em português brasileiro, de forma técnica mas acessível. Inclua referências normativas quando aplicável. Formate suas respostas com markdown para melhor legibilidade.`;

export const PEODPAIChat = memo(function() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `# Bem-vindo ao Assistente PEO-DP 🚢

Sou seu especialista em **Posicionamento Dinâmico** e no **Programa de Excelência em Operações DP** da Petrobras.

## Posso ajudar com:
- **Auditoria PEO-DP**: Requisitos dos 7 pilares, checklist de conformidade
- **Legislação**: IMCA, IMO, NORMAM, OCIMF, MTS, Nautical Institute
- **Procedimentos**: ASOG, FMEA, blackout recovery, configuração DP
- **Evidências**: Geração de documentos para auditoria

Use as **ações rápidas** abaixo ou faça sua pergunta diretamente!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("auditoria");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Usar Supabase Edge Function com Lovable AI
      const { data: functionData, error: functionError } = await supabase.functions.invoke("peodp-ai-chat", {
        body: { 
          messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt: SYSTEM_PROMPT
        }
      };

      if (functionError) {
        throw new Error(functionError.message);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: functionData?.response || "Desculpe, não consegui processar sua pergunta. Por favor, tente novamente.",
        timestamp: new Date(),
        references: functionData?.references || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI:", error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: "assistant",
        content: `Desculpe, ocorreu um erro ao processar sua pergunta. 

**Sua pergunta:** ${messageText}

Por favor, tente novamente ou consulte diretamente:
- IMCA Guidelines (www.imca-int.com)
- IMO MSC Circulars
- NORMAM-01 e NORMAM-13 (Marinha do Brasil)

*Dica: Verifique sua conexão ou tente uma pergunta mais específica.*`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
  };

  const handleRating = (messageId: string, rating: "positive" | "negative") => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating } : m));
    toast.success(rating === "positive" ? "Feedback positivo registrado!" : "Feedback registrado. Vamos melhorar!");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência");
  };

  const handleExportChat = () => {
    const chatContent = messages
      .filter(m => m.id !== "welcome")
      .map(m => `[${m.role.toUpperCase()}] ${m.timestamp.toLocaleString("pt-BR")}\n${m.content}`)
      .join("\n\n---\n\n");
    
    const blob = new Blob([chatContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peodp-chat-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exportado com sucesso!");
  };

  const filteredActions = QUICK_ACTIONS.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
            <Brain className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Assistente IA PEO-DP
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Powered by Lovable AI
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Auditoria, Legislação e Evidências de Conformidade
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportChat}>
          <Download className="h-4 w-4 mr-2" /> Exportar Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid grid-cols-2 gap-1 h-auto">
                  <TabsTrigger value="auditoria" className="text-xs px-2 py-1">Auditoria</TabsTrigger>
                  <TabsTrigger value="legislacao" className="text-xs px-2 py-1">Legislação</TabsTrigger>
                  <TabsTrigger value="procedimentos" className="text-xs px-2 py-1">Proced.</TabsTrigger>
                  <TabsTrigger value="evidencias" className="text-xs px-2 py-1">Evidências</TabsTrigger>
                </TabsList>
                <div className="mt-2 space-y-1">
                  {filteredActions.map(action => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handlehandleQuickAction}
                      disabled={isLoading}
                    >
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <span className="text-xs">{action.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Base de Conhecimento</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <p className="text-muted-foreground">Normas incluídas:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">IMCA M117</Badge>
                <Badge variant="secondary" className="text-xs">IMCA M190</Badge>
                <Badge variant="secondary" className="text-xs">IMO MSC.1580</Badge>
                <Badge variant="secondary" className="text-xs">NORMAM-01</Badge>
                <Badge variant="secondary" className="text-xs">PEO-DP 2021</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                        <div className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`p-2 rounded-full shrink-0 ${message.role === "user" ? "bg-primary" : "bg-blue-500/20"}`}>
                            {message.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-sm"
                              dangerouslySetInnerHTML={{ 
                                __html: message.content
                                  .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                                  .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                                  .replace(/^# (.*$)/gim, "<h1>$1</h1>")
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                  .replace(/\n- /g, "<br/>• ")
                                  .replace(/\n/g, "<br/>") 
                              }} 
                            />
                            {message.references && message.references.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Referências:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.references.map((ref, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{ref}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {message.role === "assistant" && message.id !== "welcome" && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handlehandleRating}>
                                  <ThumbsUp className={`h-3 w-3 ${message.rating === "positive" ? "text-green-500 fill-green-500" : ""}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handlehandleRating}>
                                  <ThumbsDown className={`h-3 w-3 ${message.rating === "negative" ? "text-red-500 fill-red-500" : ""}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handlehandleCopy}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${message.role === "user" ? "text-right" : ""}`}>
                          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm">Consultando base de conhecimento PEO-DP...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Pergunte sobre PEO-DP, ASOG, IMCA, NORMAM..."
                    value={input}
                    onChange={handleChange}
                    onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                    disabled={isLoading}
                    className="text-sm"
                  />
                  <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PEODPAIChat;
