import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Brain,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  Search,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Sparkles,
  Ship,
  Anchor,
  Settings,
  HelpCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
  rating?: "positive" | "negative";
}

interface QuickQuestion {
  id: string;
  category: string;
  question: string;
  icon: React.ReactNode;
}

const quickQuestions: QuickQuestion[] = [
  { id: "q1", category: "Procedimentos", question: "O que é modo TAM e quando devo usar?", icon: <Settings className="w-4 h-4" /> },
  { id: "q2", category: "ASOG", question: "Quais são os limites ambientais típicos para operação ROV?", icon: <FileText className="w-4 h-4" /> },
  { id: "q3", category: "Falhas", question: "Como devo responder a uma perda de referência PRS?", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "q4", category: "Normas", question: "Quais são os requisitos IMCA M117 para DPO?", icon: <BookOpen className="w-4 h-4" /> },
  { id: "q5", category: "Configuração", question: "Como configurar corretamente o ganho e bias?", icon: <Settings className="w-4 h-4" /> },
  { id: "q6", category: "Emergência", question: "Procedimento para blackout parcial durante operação DP", icon: <AlertTriangle className="w-4 h-4" /> }
];

const knowledgeBase = {
  "tam": {
    answer: `**TAM (Thruster Assisted Mooring)** é um modo de operação DP onde o sistema utiliza os propulsores para assistir a amarração, mantendo a embarcação em posição enquanto reduz a carga nas linhas de amarração.

**Quando usar:**
- Durante operações em terminais com amarração
- Quando há necessidade de reduzir tensão nas amarras
- Em condições ambientais moderadas onde amarração pura seria insuficiente

**Referências:**
- IMCA M 103 - Guidelines for the Design and Operation of DP Vessels
- DPOM Seção 4.3 - Modos de Operação`,
    references: ["IMCA M103", "DPOM"]
  },
  "rov": {
    answer: `**Limites Ambientais Típicos para Operação ROV:**

| Parâmetro | Limite Verde | Limite Amarelo | Limite Vermelho |
|-----------|--------------|----------------|-----------------|
| Vento | < 20 kn | 20-25 kn | > 25 kn |
| Hs (Onda) | < 2.0 m | 2.0-2.5 m | > 2.5 m |
| Corrente | < 1.3 kn | 1.3-1.8 kn | > 1.8 kn |
| Visibilidade | > 5 nm | 3-5 nm | < 3 nm |

**Nota:** Estes são valores típicos. Sempre consulte o ASOG específico da embarcação e operação.

**Referências:**
- IMCA M 182 - Guidelines for the Safe & Efficient Operation of Offshore Support Vessels
- ASOG específico da embarcação`,
    references: ["IMCA M182", "ASOG"]
  },
  "prs": {
    answer: `**Resposta à Perda de Referência PRS:**

**Ações Imediatas:**
1. Verificar se o sistema ativou fallback automático para referência secundária
2. Confirmar posição atual com referências redundantes (DGPS, HPR, Radar)
3. Monitorar desvio de posição e heading
4. Notificar Master/OIM sobre a situação

**Se o fallback NÃO ativar:**
1. Assumir controle manual temporariamente se necessário
2. Ativar referência secundária manualmente
3. Verificar comunicação e integridade do sensor PRS
4. Considerar pausa em operações críticas

**Registro:**
- Documentar evento no Logbook DP
- Reportar ao fabricante se necessário
- Incluir em relatório de turno

**Referências:**
- IMCA M190 - Guidance for DP Incidents
- ASOG Seção de Contingência`,
    references: ["IMCA M190", "ASOG", "DPOM"]
  },
  "m117": {
    answer: `**Requisitos IMCA M117 para DPO (DP Operator):**

**Treinamento Obrigatório:**
- Curso de Indução DP aprovado
- Curso de Simulador DP (mínimo 5 dias)
- Curso Refresher a cada 5 anos

**Experiência:**
- Mínimo 12 meses de sea time em embarcação DP
- Registro de horas DP em logbook pessoal
- CPD (Continuing Professional Development) documentado

**Competências Requeridas:**
- Conhecimento do sistema DP específico
- Procedimentos de emergência e contingência
- Análise de condições ambientais
- Comunicação e CRM

**Certificações:**
- Certificado NI (Nautical Institute) ou equivalente
- STCW válido
- Certificados médicos atualizados

**Referências:**
- IMCA M 117 Rev.3 - The Training and Experience of Key DP Personnel`,
    references: ["IMCA M117"]
  },
  "ganho": {
    answer: `**Configuração de Ganho e Bias no Sistema DP:**

**Ganho (Gain):**
- Controla a sensibilidade de resposta do sistema
- Ganho alto = resposta mais agressiva (mais consumo, mais estabilidade)
- Ganho baixo = resposta suave (menos consumo, maior tolerância a desvios)

**Recomendações:**
- Usar ganho conservador em condições desconhecidas
- Aumentar ganho gradualmente se necessário
- Documentar ajustes no logbook

**Bias:**
- Compensa forças externas constantes (vento, corrente)
- Permite ao sistema "descansar" os thrusters
- Deve ser ajustado com base na observação das condições

**Procedimento de Ajuste:**
1. Estabilizar embarcação em posição
2. Observar tendência de deriva por 5-10 minutos
3. Ajustar bias para compensar forças identificadas
4. Monitorar resposta e refinar se necessário

**Referências:**
- Manual do Sistema DP (Kongsberg/Navis)
- IMCA M103`,
    references: ["Manual Sistema DP", "IMCA M103"]
  },
  "blackout": {
    answer: `**Procedimento para Blackout Parcial durante Operação DP:**

**Ações Imediatas (primeiros 30 segundos):**
1. Verificar automaticamente se sistema DP mantém posição
2. Confirmar redundância ativa (geradores, thrusters)
3. Comunicar à praça de máquinas
4. Alertar Master/OIM

**Avaliação (1-5 minutos):**
- Verificar qual barramento foi afetado
- Confirmar capacidade restante de propulsão
- Avaliar se operação pode continuar com segurança
- Verificar status do WCF (Worst Case Failure)

**Decisão:**
- Se redundância adequada: continuar com monitoramento intensivo
- Se redundância comprometida: iniciar procedimento de recuo controlado
- Se operação crítica (ROV, mergulho): suspender imediatamente

**Documentação:**
- Registro detalhado no Logbook DP
- Notificação ao cliente/contratante
- Relatório de evento para análise

**Referências:**
- IMCA M190 - DP Incident Reporting
- Procedimento de Emergência da Embarcação
- ASOG Seção de Blackout`,
    references: ["IMCA M190", "Emergency Procedures", "ASOG"]
  }
};

export const DPAIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o **DP AI Advisor**, seu assistente técnico especializado em operações de Posicionamento Dinâmico. Posso ajudar com:\n\n- Procedimentos operacionais e de emergência\n- Normas IMCA, IMO e NI\n- Configuração de sistemas DP\n- Análise de falhas e respostas\n- Dúvidas técnicas sobre ASOG, FMEA, DPOM\n\nComo posso ajudar você hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findAnswer = (question: string): { answer: string; references: string[] } => {
    const q = question.toLowerCase();
    if (q.includes("tam") || q.includes("thruster assisted")) return knowledgeBase.tam;
    if (q.includes("rov") || q.includes("limite") && q.includes("ambiental")) return knowledgeBase.rov;
    if (q.includes("prs") || q.includes("referência") || q.includes("perda")) return knowledgeBase.prs;
    if (q.includes("m117") || q.includes("dpo") && q.includes("requisito")) return knowledgeBase.m117;
    if (q.includes("ganho") || q.includes("bias") || q.includes("gain")) return knowledgeBase.ganho;
    if (q.includes("blackout") || q.includes("apagão")) return knowledgeBase.blackout;
    
    return {
      answer: `Entendi sua pergunta sobre "${question}". Baseado no meu conhecimento das normas IMCA e práticas de DP, posso sugerir:\n\n1. Consulte o DPOM (DP Operations Manual) da embarcação\n2. Verifique o ASOG específico para a operação\n3. Revise as guidelines IMCA relevantes (M103, M117, M182, M190)\n\nPosso ajudar a detalhar algum desses pontos específicos?`,
      references: ["DPOM", "ASOG", "IMCA Guidelines"]
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const { answer, references } = findAnswer(input);
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        references
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const handleRating = (messageId: string, rating: "positive" | "negative") => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating } : m));
    toast.success(rating === "positive" ? "Obrigado pelo feedback positivo!" : "Feedback registrado. Vamos melhorar!");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">DP AI Advisor</h2>
            <p className="text-muted-foreground">Assistente técnico inteligente para operações DP</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Chat Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : ""}`}>
                        <div className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`p-2 rounded-full ${message.role === "user" ? "bg-primary" : "bg-purple-500/20"}`}>
                            {message.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
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
                        <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                        <span className="text-sm">Analisando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua pergunta sobre DP..."
                    value={input}
                    onChange={handleChange}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Questions Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((q) => (
                <Button
                  key={q.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handlehandleQuickQuestion}
                >
                  <div className="flex items-start gap-2">
                    {q.icon}
                    <div>
                      <p className="text-xs text-muted-foreground">{q.category}</p>
                      <p className="text-sm">{q.question}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>IMCA M103, M117, M182, M190</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>IMO MSC.1/Circ.1580</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>NI DP Operator's Handbook</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Lições Aprendidas Internas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DPAIAdvisor;
