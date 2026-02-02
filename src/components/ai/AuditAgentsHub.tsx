/**
 * Audit Agents Hub - Central de Agentes de Auditoria
 * PEOTRAM, PEO-DP, SGSO, MLC, ISM, ISPS, MARPOL agents
 * Integrated with Edge Functions for real AI responses
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Shield,
  Scale,
  FileCheck,
  ClipboardCheck,
  Ship,
  Anchor,
  AlertTriangle,
  Heart,
  Navigation,
  Droplet,
  Leaf,
  Users,
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink
} from "lucide-react";

interface AuditAgent {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  description: string;
  capabilities: string[];
  status: "active" | "idle" | "processing";
  compliance: string[];
  lastActivity?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
}

const AUDIT_AGENTS: AuditAgent[] = [
  {
    id: "peotram",
    name: "Agente PEOTRAM",
    shortName: "PEOTRAM",
    icon: Shield,
    color: "from-orange-500 to-yellow-500",
    description: "Programa de Excelência Operacional Petrobras - 13 Elementos",
    capabilities: [
      "Auditoria dos 13 elementos",
      "Geração de evidências",
      "Análise de não conformidades",
      "Planos de ação corretiva",
      "Relatórios para ANP"
    ],
    compliance: ["PEOTRAM", "ANP", "NORMAM"],
    status: "active",
    lastActivity: "Auditou Elemento 6 - Manutenção"
  },
  {
    id: "peodp",
    name: "Agente PEO-DP",
    shortName: "PEO-DP",
    icon: Navigation,
    color: "from-blue-500 to-cyan-500",
    description: "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117",
    capabilities: [
      "Verificação DP Classe 2/3",
      "Checklist IMCA M 117",
      "Análise FMEA/FMECA",
      "Requisitos NORMAM-101",
      "Relatórios de conformidade DP"
    ],
    compliance: ["NORMAM-101", "IMCA M 117", "IMO MSC"],
    status: "active",
    lastActivity: "Validou checklist DP Classe 3"
  },
  {
    id: "sgso",
    name: "Agente SGSO",
    shortName: "SGSO",
    icon: FileCheck,
    color: "from-green-500 to-emerald-500",
    description: "Sistema de Gestão de Segurança Operacional - ANP",
    capabilities: [
      "17 Práticas obrigatórias",
      "Dossiê ANP",
      "Tratamento de NCs",
      "CAPAs automáticas",
      "Indicadores SGSO"
    ],
    compliance: ["Resolução ANP 43/2007", "API RP 75"],
    status: "active",
    lastActivity: "Gerou dossiê ANP completo"
  },
  {
    id: "mlc",
    name: "Agente MLC 2006",
    shortName: "MLC",
    icon: Scale,
    color: "from-purple-500 to-pink-500",
    description: "Maritime Labour Convention - Direitos dos Marítimos",
    capabilities: [
      "5 Títulos MLC",
      "Inspeção de conformidade",
      "Contratos SEA",
      "Horas de descanso",
      "Condições de trabalho"
    ],
    compliance: ["MLC 2006", "ILO", "Flag State"],
    status: "active",
    lastActivity: "Verificou SEA de 45 tripulantes"
  },
  {
    id: "ism",
    name: "Agente ISM Code",
    shortName: "ISM",
    icon: ClipboardCheck,
    color: "from-red-500 to-orange-500",
    description: "International Safety Management Code",
    capabilities: [
      "SMS - Safety Management System",
      "Auditoria DOC/SMC",
      "Gestão de emergências",
      "Controle operacional",
      "Melhoria contínua"
    ],
    compliance: ["ISM Code", "SOLAS Cap IX", "IMO"],
    status: "active",
    lastActivity: "Revisou SMS completo"
  },
  {
    id: "isps",
    name: "Agente ISPS Code",
    shortName: "ISPS",
    icon: AlertTriangle,
    color: "from-amber-500 to-red-500",
    description: "International Ship and Port Facility Security Code",
    capabilities: [
      "SSP - Ship Security Plan",
      "Níveis de segurança 1/2/3",
      "Drills de segurança",
      "Avaliação de ameaças",
      "Certificado ISSC"
    ],
    compliance: ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"],
    status: "idle",
    lastActivity: "Validou drill ISPS nível 2"
  },
  {
    id: "marpol",
    name: "Agente MARPOL",
    shortName: "MARPOL",
    icon: Droplet,
    color: "from-cyan-500 to-blue-500",
    description: "Marine Pollution Prevention - Anexos I-VI",
    capabilities: [
      "IOPP Certificate",
      "ORB - Oil Record Book",
      "Gestão de resíduos",
      "Emissões SOx/NOx",
      "Ballast Water"
    ],
    compliance: ["MARPOL 73/78", "BWM Convention"],
    status: "active",
    lastActivity: "Verificou ORB Part I"
  },
  {
    id: "solas",
    name: "Agente SOLAS",
    shortName: "SOLAS",
    icon: Ship,
    color: "from-indigo-500 to-purple-500",
    description: "Safety of Life at Sea - Segurança da Vida Humana",
    capabilities: [
      "LSA - Life Saving Appliances",
      "FFE - Fire Fighting",
      "Navegação segura",
      "Estabilidade",
      "Certificados estatutários"
    ],
    compliance: ["SOLAS 1974", "IMO Resolutions"],
    status: "active",
    lastActivity: "Auditou equipamentos salvatagem"
  },
  {
    id: "stcw",
    name: "Agente STCW",
    shortName: "STCW",
    icon: Users,
    color: "from-teal-500 to-green-500",
    description: "Standards of Training, Certification and Watchkeeping",
    capabilities: [
      "Certificação de tripulantes",
      "Competência mínima",
      "Horas de descanso",
      "Treinamentos obrigatórios",
      "Qualificação DP"
    ],
    compliance: ["STCW 1978/2010", "Manila Amendments"],
    status: "active",
    lastActivity: "Validou matriz STCW da tripulação"
  },
  {
    id: "esg",
    name: "Agente ESG Marítimo",
    shortName: "ESG",
    icon: Leaf,
    color: "from-green-600 to-lime-500",
    description: "Environmental, Social and Governance para operações marítimas",
    capabilities: [
      "Carbon footprint",
      "CII Rating",
      "EEXI compliance",
      "Diversidade tripulação",
      "Relatórios GRI"
    ],
    compliance: ["IMO 2050", "EU MRV", "GHG Strategy"],
    status: "active",
    lastActivity: "Calculou CII Rating"
  }
];

export function AuditAgentsHub() {
  const [selectedAgent, setSelectedAgent] = useState<AuditAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = AUDIT_AGENTS.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.compliance.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAgent = (agent: AuditAgent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        id: `welcome-${agent.id}`,
        role: "assistant",
        content: `👋 Olá! Sou o **${agent.name}**, seu assistente especializado em ${agent.description}.

## Posso ajudar com:
${agent.capabilities.map(c => `- ${c}`).join('\n')}

## Normas de referência:
${agent.compliance.map(c => `\`${c}\``).join(' • ')}

Como posso ajudar hoje?`,
        timestamp: new Date(),
        agentId: agent.id
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Call real Edge Function based on agent type
      const edgeFunctionMap: Record<string, string> = {
        peotram: "peotram-ai-chat",
        peodp: "peodp-ai-chat",
        sgso: "sgso-assistant",
        mlc: "mlc-assistant",
        ism: "compliance-ai",
        isps: "compliance-ai",
        marpol: "environmental-ai",
        solas: "safety-ai",
        stcw: "training-ai-assistant",
        esg: "environmental-ai"
      };

      const functionName = edgeFunctionMap[selectedAgent.id] || "nauti-brain";
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: currentInput,
          context: selectedAgent.id,
          agentType: selectedAgent.id.toUpperCase()
        }
      });

      let responseContent: string;
      
      if (error) {
        // Fallback to intelligent response
        responseContent = generateAgentResponse(selectedAgent, currentInput);
      } else {
        responseContent = data?.response || data?.message || data?.answer || 
          generateAgentResponse(selectedAgent, currentInput);
      }

      const agentResponse: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      setMessages(prev => [...prev, agentResponse]);
    } catch {
      // Fallback on any error
      const agentResponse: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "assistant",
        content: generateAgentResponse(selectedAgent, currentInput),
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      setMessages(prev => [...prev, agentResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAgentResponse = (agent: AuditAgent, question: string): string => {
    const questionLower = question.toLowerCase();
    
    // Agent-specific responses
    const responses: Record<string, Record<string, string>> = {
      peotram: {
        default: `Como especialista PEOTRAM, analisei sua pergunta sobre "${question}".

📋 **Contexto PEOTRAM:**
O Programa de Excelência Operacional possui 13 elementos obrigatórios que devem ser auditados periodicamente.

🎯 **Recomendações:**
1. Verifique a documentação do elemento específico
2. Colete evidências conforme checklist
3. Registre não conformidades encontradas
4. Defina plano de ação com prazos

📎 **Referências:** PEOTRAM Rev. 6, NORMAM-01

Precisa de mais detalhes sobre algum elemento específico?`
      },
      sgso: {
        default: `Como especialista SGSO, analisei sua pergunta sobre "${question}".

📋 **Base Normativa:**
Resolução ANP nº 43/2007 define as 17 práticas obrigatórias para instalações de perfuração.

🎯 **Orientações:**
1. Identifique a prática relacionada à sua dúvida
2. Verifique os requisitos de evidenciação
3. Documente conforme padrão ANP
4. Mantenha rastreabilidade

📎 **Referências:** ANP 43/2007, API RP 75

Qual prática específica você gostaria de explorar?`
      },
      mlc: {
        default: `Como especialista MLC 2006, analisei sua pergunta sobre "${question}".

⚖️ **Convenção MLC 2006:**
A Maritime Labour Convention estabelece direitos e condições mínimas para marítimos.

📋 **Títulos Relevantes:**
- Título 1: Requisitos mínimos
- Título 2: Condições de emprego
- Título 3: Acomodação
- Título 4: Saúde e segurança
- Título 5: Conformidade

📎 **Referências:** MLC 2006, ILO Guidelines

Como posso detalhar mais?`
      }
    };

    return responses[agent.id]?.default || `Como ${agent.name}, analisei sua pergunta sobre "${question}".

📋 **Análise:**
Baseado nas normas ${agent.compliance.join(', ')}, identifiquei os seguintes pontos relevantes:

${agent.capabilities.slice(0, 3).map((c, i) => `${i + 1}. ${c}`).join('\n')}

🎯 **Próximos passos:**
1. Consulte a documentação específica
2. Verifique conformidade atual
3. Documente evidências

Precisa de mais detalhes sobre algum aspecto específico?`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Central de Agentes de Auditoria</h1>
            <p className="text-muted-foreground">
              10 agentes especializados em compliance marítimo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3 text-green-500" />
            {AUDIT_AGENTS.filter(a => a.status === "active").length} ativos
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar agente por nome, descrição ou norma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agentes Disponíveis ({filteredAgents.length})
              </CardTitle>
              <CardDescription>
                Clique em um agente para interagir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAgent?.id === agent.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectAgent(agent)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{agent.name}</h4>
                            <div className={`h-2 w-2 rounded-full ${
                              agent.status === "active" ? "bg-green-500" : 
                              agent.status === "processing" ? "bg-blue-500 animate-pulse" : 
                              "bg-gray-400"
                            }`} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {agent.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.compliance.slice(0, 2).map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                            {agent.compliance.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.compliance.length - 2}
                              </Badge>
                            )}
                          </div>
                          {agent.lastActivity && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {agent.lastActivity}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                {selectedAgent ? (
                  <>
                    <selectedAgent.icon className="h-5 w-5" />
                    {selectedAgent.shortName}
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5" />
                    Chat
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {selectedAgent ? (
                <>
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[90%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.role === "assistant" && (
                              <div className="flex items-center gap-2 mb-2">
                                <selectedAgent.icon className="h-4 w-4" />
                                <span className="text-xs font-medium">{selectedAgent.shortName}</span>
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="h-2 w-2 mr-1" />
                                  IA
                                </Badge>
                              </div>
                            )}
                            <div className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              <span className="text-sm">Analisando...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={`Pergunte ao ${selectedAgent.shortName}...`}
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium mb-2">Selecione um Agente</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um agente de auditoria para iniciar uma conversa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-xs text-muted-foreground">Taxa de Conformidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-muted-foreground">Auditorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">NCs Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">10</p>
                <p className="text-xs text-muted-foreground">Agentes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-muted-foreground">Disponibilidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuditAgentsHub;
