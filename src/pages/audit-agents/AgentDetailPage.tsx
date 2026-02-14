/**
 * Agent Detail Page - Página de Detalhes do Agente de Auditoria
 * Chat interativo com STREAMING AI via audit-agent-chat edge function
 */
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import { useAuditAgentChat } from "@/hooks/useAuditAgentChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { toast } from "sonner";
import {
  Brain, Shield, Scale, FileCheck, ClipboardCheck, Ship, Anchor,
  AlertTriangle, Heart, Navigation, Droplet, Leaf, Users,
  MessageSquare, Send, Bot, User, Sparkles, Activity,
  CheckCircle2, Clock, Search, ExternalLink, Zap, TrendingUp,
  BarChart3, RefreshCw, Star, ChevronRight, Play, Settings,
  ArrowLeft, History, LayoutDashboard, Cog, FileText, Download,
  Loader2, Copy, ThumbsUp, ThumbsDown
} from "lucide-react";

const AGENTS_DATA: Record<string, {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  capabilities: string[];
  compliance: string[];
}> = {
  peotram: {
    id: "peotram", name: "Agente PEOTRAM", shortName: "PEOTRAM", icon: Shield,
    color: "text-warning", bgColor: "from-warning/20 to-warning/10",
    description: "Programa de Excelência Operacional Petrobras - 13 Elementos",
    capabilities: ["Auditoria dos 13 elementos", "Geração de evidências", "Análise de não conformidades", "Planos de ação corretiva", "Relatórios para ANP"],
    compliance: ["PEOTRAM", "ANP", "NORMAM"],
  },
  peodp: {
    id: "peodp", name: "Agente PEO-DP", shortName: "PEO-DP", icon: Navigation,
    color: "text-info", bgColor: "from-info/20 to-info/10",
    description: "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117",
    capabilities: ["Verificação DP Classe 2/3", "Checklist IMCA M 117", "Análise FMEA/FMECA", "Requisitos NORMAM-101"],
    compliance: ["NORMAM-101", "IMCA M 117", "IMO MSC"],
  },
  sgso: {
    id: "sgso", name: "Agente SGSO", shortName: "SGSO", icon: FileCheck,
    color: "text-success", bgColor: "from-success/20 to-success/10",
    description: "Sistema de Gestão de Segurança Operacional - ANP",
    capabilities: ["17 Práticas obrigatórias", "Dossiê ANP", "Tratamento de NCs", "CAPAs automáticas"],
    compliance: ["Resolução ANP 43/2007", "API RP 75"],
  },
  mlc: {
    id: "mlc", name: "Agente MLC 2006", shortName: "MLC", icon: Scale,
    color: "text-accent-foreground", bgColor: "from-accent/20 to-accent/10",
    description: "Maritime Labour Convention - Direitos dos Marítimos",
    capabilities: ["5 Títulos MLC", "Inspeção de conformidade", "Contratos SEA", "Horas de descanso"],
    compliance: ["MLC 2006", "ILO", "Flag State"],
  },
  ism: {
    id: "ism", name: "Agente ISM Code", shortName: "ISM", icon: ClipboardCheck,
    color: "text-destructive", bgColor: "from-destructive/20 to-destructive/10",
    description: "International Safety Management Code",
    capabilities: ["SMS - Safety Management System", "Auditoria DOC/SMC", "Gestão de emergências"],
    compliance: ["ISM Code", "SOLAS Cap IX", "IMO"],
  },
  isps: {
    id: "isps", name: "Agente ISPS Code", shortName: "ISPS", icon: AlertTriangle,
    color: "text-warning", bgColor: "from-warning/20 to-warning/10",
    description: "International Ship and Port Facility Security Code",
    capabilities: ["SSP - Ship Security Plan", "Níveis de segurança 1/2/3", "Drills de segurança"],
    compliance: ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"],
  },
  marpol: {
    id: "marpol", name: "Agente MARPOL", shortName: "MARPOL", icon: Droplet,
    color: "text-info", bgColor: "from-info/20 to-info/10",
    description: "Marine Pollution Prevention - Anexos I-VI",
    capabilities: ["IOPP Certificate", "ORB - Oil Record Book", "Gestão de resíduos"],
    compliance: ["MARPOL 73/78", "BWM Convention"],
  },
  solas: {
    id: "solas", name: "Agente SOLAS", shortName: "SOLAS", icon: Ship,
    color: "text-primary", bgColor: "from-primary/20 to-primary/10",
    description: "Safety of Life at Sea - Segurança da Vida Humana",
    capabilities: ["LSA - Life Saving Appliances", "FFE - Fire Fighting", "Navegação segura"],
    compliance: ["SOLAS 1974", "IMO Resolutions"],
  },
  stcw: {
    id: "stcw", name: "Agente STCW", shortName: "STCW", icon: Users,
    color: "text-success", bgColor: "from-success/20 to-success/10",
    description: "Standards of Training, Certification and Watchkeeping",
    capabilities: ["Certificação de tripulantes", "Competência mínima", "Horas de descanso"],
    compliance: ["STCW 1978/2010", "Manila Amendments"],
  },
  esg: {
    id: "esg", name: "Agente ESG Marítimo", shortName: "ESG", icon: Leaf,
    color: "text-success", bgColor: "from-success/20 to-success/10",
    description: "Environmental, Social and Governance para operações marítimas",
    capabilities: ["Carbon footprint", "CII Rating", "EEXI compliance"],
    compliance: ["IMO 2050", "EU MRV", "GHG Strategy"],
  }
};

export default function AgentDetailPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agentId ? AGENTS_DATA[agentId] : null;
  const { messages, isStreaming, sendMessage: streamSend, setInitialMessage } = useAuditAgentChat(agent?.id || "ism");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (agent) {
      setInitialMessage(`👋 Olá! Sou o **${agent.name}**, especializado em ${agent.description}.

## Como posso ajudar?
${agent.capabilities.map(c => `✅ ${c}`).join('\n')}

## Normas de referência:
${agent.compliance.map(c => `\`${c}\``).join(' • ')}

Faça sua pergunta sobre compliance, auditoria ou regulamentações!`);

      if (searchParams.get("action") === "run") {
        setActiveTab("chat");
      }
    }
  }, [agent?.id]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Agente não encontrado</h3>
          <p className="text-muted-foreground mb-4">O agente "{agentId}" não existe.</p>
          <Button onClick={() => navigate("/audit-agents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = agent.icon;

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const currentInput = input;
    setInput("");
    await streamSend(currentInput);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Mensagem copiada!");
  };

  const handleExportChat = () => {
    const content = messages.map(m => 
      `[${m.role === "user" ? "Você" : agent.shortName}] ${m.content}`
    ).join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${agent.id}-${Date.now()}.txt`;
    a.click();
    toast.success("Conversa exportada!");
  };

  return (
    <div className="space-y-4 p-2 md:p-6">
      <Breadcrumbs items={[
        { label: "Central de Comando", href: "/central-comando" },
        { label: "Agentes de Auditoria", href: "/audit-agents" },
        { label: agent.name, current: true }
      ]} />

      {/* Agent Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/audit-agents")} aria-label="Voltar" title="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${agent.bgColor} border border-white/10`}>
          <Icon className={`h-10 w-10 ${agent.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <Badge variant="default" className="gap-1">
              <Activity className="h-3 w-3 animate-pulse" />Ativo
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />Streaming AI
            </Badge>
          </div>
          <p className="text-muted-foreground">{agent.description}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {agent.compliance.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportChat}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" /><span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /><span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Cog className="h-4 w-4" /><span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab - STREAMING */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[60vh] flex flex-col">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className={`h-5 w-5 ${agent.color}`} />
                  <span className="font-medium">Conversa com {agent.shortName}</span>
                  {isStreaming && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />Streaming
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {messages.length} mensagens
                </Badge>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.bgColor} h-fit`}>
                          <Bot className={`h-4 w-4 ${agent.color}`} />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                        <div className={`rounded-xl p-3 ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-1 mt-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => handleCopyMessage(message.content)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="p-2 rounded-lg bg-primary h-fit">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.bgColor}`}>
                      <Bot className={`h-4 w-4 ${agent.color}`} />
                    </div>
                    <div className="bg-muted rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Processando...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Pergunte ao ${agent.shortName}...`}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isStreaming || !input.trim()}>
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
              <CardDescription>Últimas auditorias realizadas por este agente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={`agent-audit-${i}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.bgColor}`}>
                        <FileCheck className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">Auditoria #{100 - i}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() - i * 86400000).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={i === 1 ? "default" : "secondary"}>
                        {i === 1 ? "Concluído" : "Arquivado"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">97.8%</div>
                <Progress value={97.8} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Auditorias no Mês</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">42</div>
                <p className="text-sm text-muted-foreground">+12% vs mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">NCs Identificadas</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">7</div>
                <p className="text-sm text-muted-foreground">3 críticas, 4 menores</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Agente</CardTitle>
              <CardDescription>Personalize o comportamento do {agent.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modo de Resposta</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Detalhado</Button>
                  <Button variant="default" size="sm">Resumido</Button>
                  <Button variant="outline" size="sm">Técnico</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Notificações</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alertar sobre NCs críticas</span>
                  <Button variant="outline" size="sm">Ativado</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}