/**
 * PEOTRAM AI Assistant Component
 * LLM integrada para geração de evidências, análise de conformidade e
 * consultas sobre auditorias PEOTRAM, legislação marítima e melhores práticas.
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
import { createSafeHTML } from "@/lib/utils/safe-html";
import { logger } from '@/lib/logger';
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
  Ship,
  Anchor,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Wrench,
  FileCheck,
  GraduationCap
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
  rating?: "positive" | "negative";
  action?: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: "elementos" | "evidencias" | "legislacao" | "treinamentos";
  action?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  // Elementos PEOTRAM
  {
    id: "el-01",
    label: "Elemento 1 - Liderança",
    prompt: "Explique os requisitos do Elemento 1 (Liderança, Gerenciamento e Responsabilidade) do PEOTRAM, incluindo política de segurança e estrutura organizacional.",
    icon: <Users className="h-4 w-4" />,
    category: "elementos"
  },
  {
    id: "el-02",
    label: "Elemento 2 - Conformidade Legal",
    prompt: "Quais são os requisitos do Elemento 2 (Conformidade Legal) do PEOTRAM? Inclua NRs aplicáveis, STCW e ISM Code.",
    icon: <Scale className="h-4 w-4" />,
    category: "elementos"
  },
  {
    id: "el-03",
    label: "Elemento 3 - Gestão de Riscos",
    prompt: "Detalhe os requisitos do Elemento 3 (Gestão de Riscos), incluindo metodologias de identificação e avaliação de riscos.",
    icon: <AlertTriangle className="h-4 w-4" />,
    category: "elementos"
  },
  {
    id: "el-06",
    label: "Elemento 6 - Manutenção",
    prompt: "Explique os requisitos do Elemento 6 (Manutenção) do PEOTRAM, incluindo manutenção preventiva, corretiva e preditiva.",
    icon: <Wrench className="h-4 w-4" />,
    category: "elementos"
  },
  {
    id: "el-11",
    label: "Elemento 11 - Emergências",
    prompt: "Quais são os requisitos do Elemento 11 (Preparação e Respostas à Emergências)? Inclua planos de contingência e exercícios.",
    icon: <Shield className="h-4 w-4" />,
    category: "elementos"
  },
  // Evidências
  {
    id: "evidencia-conformidade",
    label: "Gerar Evidência de Conformidade",
    prompt: "Gere um modelo de evidência de conformidade para auditoria PEOTRAM, com cabeçalho, verificação realizada, evidências encontradas e conclusão.",
    icon: <FileCheck className="h-4 w-4" />,
    category: "evidencias",
    action: "generate_evidence"
  },
  {
    id: "plano-acao-nc",
    label: "Plano de Ação para NC",
    prompt: "Crie um plano de ação estruturado para tratar uma não conformidade do PEOTRAM, incluindo análise de causa raiz, ações corretivas e prazos.",
    icon: <Target className="h-4 w-4" />,
    category: "evidencias",
    action: "non_conformity_plan"
  },
  {
    id: "relatorio-auditoria",
    label: "Modelo de Relatório",
    prompt: "Forneça um modelo de relatório de auditoria PEOTRAM com sumário executivo, findings, recomendações e plano de ação.",
    icon: <FileText className="h-4 w-4" />,
    category: "evidencias"
  },
  // Legislação
  {
    id: "stcw",
    label: "STCW - Certificação",
    prompt: "Explique os requisitos da Convenção STCW aplicáveis ao PEOTRAM, incluindo certificação de tripulantes e horas de descanso.",
    icon: <BookOpen className="h-4 w-4" />,
    category: "legislacao"
  },
  {
    id: "ism-code",
    label: "ISM Code",
    prompt: "Quais são os requisitos do ISM Code relevantes para auditoria PEOTRAM? Explique SMS (Safety Management System).",
    icon: <Shield className="h-4 w-4" />,
    category: "legislacao"
  },
  {
    id: "nr-30",
    label: "NR-30 - Trabalho Aquaviário",
    prompt: "Explique os principais requisitos da NR-30 (Segurança e Saúde no Trabalho Aquaviário) aplicáveis ao PEOTRAM.",
    icon: <Scale className="h-4 w-4" />,
    category: "legislacao"
  },
  // Treinamentos
  {
    id: "matriz-treinamentos",
    label: "Matriz de Treinamentos",
    prompt: "Crie uma matriz de treinamentos obrigatórios para tripulantes conforme PEOTRAM, STCW e NR-30, com periodicidade.",
    icon: <GraduationCap className="h-4 w-4" />,
    category: "treinamentos",
    action: "training_matrix"
  },
  {
    id: "plano-capacitacao",
    label: "Plano de Capacitação",
    prompt: "Desenvolva um plano de capacitação anual para tripulantes, incluindo treinamentos regulamentares e específicos.",
    icon: <Users className="h-4 w-4" />,
    category: "treinamentos"
  }
];

export function PeotramAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `# Bem-vindo ao Assistente IA PEOTRAM 🚢

Sou seu especialista no **Programa de Excelência Operacional para Transporte Aéreo e Marítimo** da Petrobras.

## Posso ajudar com:
- **Elementos PEOTRAM**: Requisitos dos 13 elementos de auditoria
- **Evidências**: Geração de documentos de conformidade
- **Legislação**: STCW, ISM Code, NRs, NORMAM
- **Treinamentos**: Matriz de capacitação de tripulantes

Use as **ações rápidas** ou faça sua pergunta diretamente!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("elementos");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string, action?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
      action
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('peotram-ai-chat', {
        body: { 
          messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          action
        }
      });

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
      logger.error("Error calling AI:", error);
      
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: "assistant",
        content: `Desculpe, ocorreu um erro ao processar sua pergunta.

**Sua pergunta:** ${messageText}

Por favor, tente novamente ou consulte:
- Documentação PEOTRAM Petrobras
- ISM Code Guidelines (IMO)
- STCW Convention

*Dica: Verifique sua conexão ou tente uma pergunta mais específica.*`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt, action.action);
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
    a.download = `peotram-chat-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exportado com sucesso!");
  };

  const filteredActions = QUICK_ACTIONS.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg">
            <Brain className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Assistente IA PEOTRAM
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Lovable AI
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Auditoria, Conformidade e Geração de Evidências
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportChat}>
          <Download className="h-4 w-4 mr-2" /> Exportar
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
                  <TabsTrigger value="elementos" className="text-xs px-2 py-1">Elementos</TabsTrigger>
                  <TabsTrigger value="evidencias" className="text-xs px-2 py-1">Evidências</TabsTrigger>
                  <TabsTrigger value="legislacao" className="text-xs px-2 py-1">Legislação</TabsTrigger>
                  <TabsTrigger value="treinamentos" className="text-xs px-2 py-1">Treinam.</TabsTrigger>
                </TabsList>
                <div className="mt-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {filteredActions.map(action => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleQuickAction(action)}
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
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">Normas incluídas:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">ISM Code</Badge>
                <Badge variant="secondary" className="text-xs">STCW</Badge>
                <Badge variant="secondary" className="text-xs">SOLAS</Badge>
                <Badge variant="secondary" className="text-xs">NR-30</Badge>
                <Badge variant="secondary" className="text-xs">NR-34</Badge>
                <Badge variant="secondary" className="text-xs">NORMAM</Badge>
                <Badge variant="secondary" className="text-xs">MARPOL</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="h-[550px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                        <div className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`p-2 rounded-full shrink-0 ${message.role === "user" ? "bg-primary" : "bg-orange-500/20"}`}>
                            {message.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-orange-500" />}
                          </div>
                          <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-sm"
                              dangerouslySetInnerHTML={createSafeHTML(message.content)} 
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
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handleRating(message.id, "positive")}>
                                  <ThumbsUp className={`h-3 w-3 ${message.rating === "positive" ? "text-green-500 fill-green-500" : ""}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handleRating(message.id, "negative")}>
                                  <ThumbsDown className={`h-3 w-3 ${message.rating === "negative" ? "text-red-500 fill-red-500" : ""}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handleCopy(message.content)}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
                        <span className="text-sm">Analisando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input */}
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre PEOTRAM, legislação ou peça para gerar evidências..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PeotramAIAssistant;
