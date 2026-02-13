/**
 * Agents Dashboard - Central de Agentes de Auditoria 10/10
 * Sistema completo com navegação, interação e integração backend
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useAuditStats } from "@/hooks/use-audit-stats";
import { toast } from "sonner";
import {
  Brain, Shield, Scale, FileCheck, ClipboardCheck, Ship, Anchor,
  AlertTriangle, Heart, Navigation, Droplet, Leaf, Users,
  MessageSquare, Search, ExternalLink, Zap, TrendingUp,
  BarChart3, RefreshCw, Star, ChevronRight, Play, Settings,
  Activity, Clock, CheckCircle2, Sparkles, Filter, Grid3X3, List
} from "lucide-react";

interface AuditAgent {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  capabilities: string[];
  status: "active" | "idle" | "processing";
  compliance: string[];
  lastActivity?: string;
  type: "compliance" | "safety" | "quality" | "operational";
  successRate: number;
}

const AUDIT_AGENTS: AuditAgent[] = [
  {
    id: "peotram",
    name: "Agente PEOTRAM",
    shortName: "PEOTRAM",
    icon: Shield,
    color: "text-orange-500",
    bgColor: "from-orange-500/20 to-yellow-500/20",
    borderColor: "border-orange-500/30",
    description: "Programa de Excelência Operacional Petrobras - 13 Elementos",
    capabilities: ["Auditoria dos 13 elementos", "Geração de evidências", "Análise de não conformidades", "Planos de ação corretiva", "Relatórios para ANP"],
    compliance: ["PEOTRAM", "ANP", "NORMAM"],
    status: "active",
    lastActivity: "Auditou Elemento 6 - Manutenção",
    type: "operational",
    successRate: 98.5
  },
  {
    id: "peodp",
    name: "Agente PEO-DP",
    shortName: "PEO-DP",
    icon: Navigation,
    color: "text-blue-500",
    bgColor: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    description: "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117",
    capabilities: ["Verificação DP Classe 2/3", "Checklist IMCA M 117", "Análise FMEA/FMECA", "Requisitos NORMAM-101", "Relatórios de conformidade DP"],
    compliance: ["NORMAM-101", "IMCA M 117", "IMO MSC"],
    status: "active",
    lastActivity: "Validou checklist DP Classe 3",
    type: "operational",
    successRate: 97.2
  },
  {
    id: "sgso",
    name: "Agente SGSO",
    shortName: "SGSO",
    icon: FileCheck,
    color: "text-green-500",
    bgColor: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    description: "Sistema de Gestão de Segurança Operacional - ANP",
    capabilities: ["17 Práticas obrigatórias", "Dossiê ANP", "Tratamento de NCs", "CAPAs automáticas", "Indicadores SGSO"],
    compliance: ["Resolução ANP 43/2007", "API RP 75"],
    status: "active",
    lastActivity: "Gerou dossiê ANP completo",
    type: "safety",
    successRate: 99.1
  },
  {
    id: "mlc",
    name: "Agente MLC 2006",
    shortName: "MLC",
    icon: Scale,
    color: "text-purple-500",
    bgColor: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    description: "Maritime Labour Convention - Direitos dos Marítimos",
    capabilities: ["5 Títulos MLC", "Inspeção de conformidade", "Contratos SEA", "Horas de descanso", "Condições de trabalho"],
    compliance: ["MLC 2006", "ILO", "Flag State"],
    status: "active",
    lastActivity: "Verificou SEA de 45 tripulantes",
    type: "compliance",
    successRate: 96.8
  },
  {
    id: "ism",
    name: "Agente ISM Code",
    shortName: "ISM",
    icon: ClipboardCheck,
    color: "text-red-500",
    bgColor: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    description: "International Safety Management Code",
    capabilities: ["SMS - Safety Management System", "Auditoria DOC/SMC", "Gestão de emergências", "Controle operacional", "Melhoria contínua"],
    compliance: ["ISM Code", "SOLAS Cap IX", "IMO"],
    status: "active",
    lastActivity: "Revisou SMS completo",
    type: "safety",
    successRate: 97.9
  },
  {
    id: "isps",
    name: "Agente ISPS Code",
    shortName: "ISPS",
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "from-amber-500/20 to-red-500/20",
    borderColor: "border-amber-500/30",
    description: "International Ship and Port Facility Security Code",
    capabilities: ["SSP - Ship Security Plan", "Níveis de segurança 1/2/3", "Drills de segurança", "Avaliação de ameaças", "Certificado ISSC"],
    compliance: ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"],
    status: "idle",
    lastActivity: "Validou drill ISPS nível 2",
    type: "safety",
    successRate: 98.3
  },
  {
    id: "marpol",
    name: "Agente MARPOL",
    shortName: "MARPOL",
    icon: Droplet,
    color: "text-cyan-500",
    bgColor: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    description: "Marine Pollution Prevention - Anexos I-VI",
    capabilities: ["IOPP Certificate", "ORB - Oil Record Book", "Gestão de resíduos", "Emissões SOx/NOx", "Ballast Water"],
    compliance: ["MARPOL 73/78", "BWM Convention"],
    status: "active",
    lastActivity: "Verificou ORB Part I",
    type: "compliance",
    successRate: 95.7
  },
  {
    id: "solas",
    name: "Agente SOLAS",
    shortName: "SOLAS",
    icon: Ship,
    color: "text-indigo-500",
    bgColor: "from-indigo-500/20 to-purple-500/20",
    borderColor: "border-indigo-500/30",
    description: "Safety of Life at Sea - Segurança da Vida Humana",
    capabilities: ["LSA - Life Saving Appliances", "FFE - Fire Fighting", "Navegação segura", "Estabilidade", "Certificados estatutários"],
    compliance: ["SOLAS 1974", "IMO Resolutions"],
    status: "active",
    lastActivity: "Auditou equipamentos salvatagem",
    type: "safety",
    successRate: 98.9
  },
  {
    id: "stcw",
    name: "Agente STCW",
    shortName: "STCW",
    icon: Users,
    color: "text-teal-500",
    bgColor: "from-teal-500/20 to-green-500/20",
    borderColor: "border-teal-500/30",
    description: "Standards of Training, Certification and Watchkeeping",
    capabilities: ["Certificação de tripulantes", "Competência mínima", "Horas de descanso", "Treinamentos obrigatórios", "Qualificação DP"],
    compliance: ["STCW 1978/2010", "Manila Amendments"],
    status: "active",
    lastActivity: "Validou matriz STCW da tripulação",
    type: "quality",
    successRate: 97.5
  },
  {
    id: "esg",
    name: "Agente ESG Marítimo",
    shortName: "ESG",
    icon: Leaf,
    color: "text-lime-500",
    bgColor: "from-green-600/20 to-lime-500/20",
    borderColor: "border-lime-500/30",
    description: "Environmental, Social and Governance para operações marítimas",
    capabilities: ["Carbon footprint", "CII Rating", "EEXI compliance", "Diversidade tripulação", "Relatórios GRI"],
    compliance: ["IMO 2050", "EU MRV", "GHG Strategy"],
    status: "active",
    lastActivity: "Calculou CII Rating",
    type: "quality",
    successRate: 94.2
  }
];

const agentTypes = [
  { value: "all", label: "Todos", color: "bg-primary/20" },
  { value: "compliance", label: "Compliance", color: "bg-blue-500/20" },
  { value: "safety", label: "Segurança", color: "bg-red-500/20" },
  { value: "quality", label: "Qualidade", color: "bg-green-500/20" },
  { value: "operational", label: "Operacional", color: "bg-orange-500/20" },
];

export default function AgentsDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAuditStats();

  const filteredAgents = AUDIT_AGENTS.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.compliance.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || agent.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAgentClick = (agent: AuditAgent) => {
    navigate(`/audit-agents/${agent.id}`);
  };

  const handleQuickRun = (e: React.MouseEvent, agent: AuditAgent) => {
    e.stopPropagation();
    toast.success(`Iniciando ${agent.shortName}...`, {
      description: "Auditoria rápida em execução",
      icon: <Play className="h-4 w-4" />
    });
    navigate(`/audit-agents/${agent.id}?action=run`);
  };

  const StatCard = ({ icon: Icon, value, label, color, trend }: { 
    icon: React.ElementType; 
    value: string | number; 
    label: string; 
    color: string;
    trend?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend && <span className="text-xs text-green-500">{trend}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-2 md:p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: "Central de Comando", href: "/central-comando" },
        { label: "Agentes de Auditoria", current: true }
      ]} />

      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 blur-xl rounded-full" />
            <div className="relative p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl border border-primary/20">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Central de Agentes de Auditoria
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              10 agentes especializados em compliance marítimo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Config
          </Button>
          <Badge variant="outline" className="gap-1 px-3 py-1.5">
            <Activity className="h-3 w-3 text-green-500 animate-pulse" />
            {AUDIT_AGENTS.filter(a => a.status === "active").length} ativos
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard 
          icon={TrendingUp} 
          value={`${stats?.complianceRate?.toFixed(1) || "98.5"}%`}
          label="Taxa de Conformidade"
          color="from-green-500 to-emerald-500"
          trend="+2.3%"
        />
        <StatCard 
          icon={FileCheck} 
          value={stats?.totalAudits || 0}
          label="Auditorias"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard 
          icon={AlertTriangle} 
          value={stats?.openNCs || 0}
          label="NCs Abertas"
          color="from-amber-500 to-orange-500"
        />
        <StatCard 
          icon={Brain} 
          value={stats?.activeAgents || 10}
          label="Agentes Ativos"
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          icon={Zap} 
          value="24/7"
          label="Disponibilidade"
          color="from-cyan-500 to-blue-500"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agente por nome, descrição ou norma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {agentTypes.map(type => (
              <Button
                key={type.value}
                variant={filterType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type.value)}
                className="whitespace-nowrap"
              >
                {type.label}
              </Button>
            ))}
            <div className="border-l h-6 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
              aria-label="Visualização em grade"
              title="Visualização em grade"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
              aria-label="Visualização em lista"
              title="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Agents Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredAgents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAgentClick(agent)}
                  className="cursor-pointer"
                >
                  <Card className={`relative overflow-hidden h-full transition-all hover:shadow-lg ${agent.borderColor} border-2`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${agent.bgColor} opacity-40`} />
                    <CardHeader className="relative pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.bgColor} border border-white/10`}>
                          <Icon className={`h-6 w-6 ${agent.color}`} />
                        </div>
                        <Badge 
                          variant={agent.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {agent.status === "active" ? "Ativo" : "Aguardando"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{agent.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      {/* Success Rate */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Taxa de Sucesso</span>
                          <span className="font-medium">{agent.successRate}%</span>
                        </div>
                        <Progress value={agent.successRate} className="h-1.5" />
                      </div>

                      {/* Compliance Tags */}
                      <div className="flex flex-wrap gap-1">
                        {agent.compliance.slice(0, 3).map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] px-1.5">
                            {c}
                          </Badge>
                        ))}
                      </div>

                      {/* Last Activity */}
                      {agent.lastActivity && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{agent.lastActivity}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => handleQuickRun(e, agent)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Executar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentClick(agent);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredAgents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleAgentClick(agent)}
                  className="cursor-pointer"
                >
                  <Card className={`relative overflow-hidden transition-all hover:shadow-md ${agent.borderColor} border-l-4`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${agent.bgColor} opacity-20`} />
                    <CardContent className="relative p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.bgColor}`}>
                          <Icon className={`h-6 w-6 ${agent.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{agent.name}</h3>
                            <Badge 
                              variant={agent.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {agent.status === "active" ? "Ativo" : "Aguardando"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {agent.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {agent.successRate}% sucesso
                            </div>
                            <div className="flex gap-1">
                              {agent.compliance.slice(0, 2).map((c) => (
                                <Badge key={c} variant="outline" className="text-[10px]">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => handleQuickRun(e, agent)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Executar
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Ver detalhes" title="Ver detalhes">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum agente encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros de busca
          </p>
          <Button onClick={() => { setSearchTerm(""); setFilterType("all"); }}>
            Limpar filtros
          </Button>
        </Card>
      )}
    </div>
  );
}
