import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Ship,
  Award,
  Clock,
  Users,
  Target,
  BarChart3,
  Download,
  Eye,
  Edit,
  Calendar,
  Shield,
  Zap,
  Leaf,
  Settings,
  HelpCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PeotramMetrics {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  complianceScore: number;
  nonConformities: number;
  criticalIssues: number;
  tasoScore: number;
  idembScore: number;
  innovationScore: number;
  certificationStatus: string;
  supplierPerformance: number;
}

interface AuditProgress {
  elementId: string;
  elementName: string;
  progress: number;
  status: "completed" | "in-progress" | "pending" | "overdue";
  dueDate: string;
  assignedTo: string;
  lastUpdate: string;
}

interface ComplianceTrend {
  period: string;
  score: number;
  nonConformities: number;
  target: number;
}

const PEOTRAM_ELEMENTS = [
  { id: "ELEMENTO_01", name: "Liderança, Gerenciamento e Responsabilidade", icon: Users },
  { id: "ELEMENTO_02", name: "Conformidade Legal", icon: Shield },
  { id: "ELEMENTO_03", name: "Gestão de Riscos e Análise de Perigos", icon: AlertTriangle },
  { id: "ELEMENTO_04", name: "Competência e Treinamento", icon: Award },
  { id: "ELEMENTO_05", name: "Segurança Técnica e Eficiência Energética", icon: Zap },
  { id: "ELEMENTO_06", name: "Manutenção e Confiabilidade", icon: Settings },
  { id: "ELEMENTO_07", name: "Gestão de Emergências e Contingências", icon: AlertTriangle },
  { id: "ELEMENTO_08", name: "Segurança Operacional", icon: Shield },
  { id: "ELEMENTO_09", name: "Meio Ambiente", icon: Leaf },
  { id: "ELEMENTO_10", name: "Monitoramento e Análise Crítica", icon: BarChart3 },
];

const COMPLIANCE_COLORS = {
  excellent: "hsl(var(--success))",
  good: "hsl(var(--info))",
  fair: "hsl(var(--warning))",
  poor: "hsl(var(--destructive))",
};

export const EnhancedPeotramDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [auditType, setAuditType] = useState<"all" | "vessel" | "shore">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - será substituído por dados reais da API
  const metrics: PeotramMetrics = {
    totalAudits: 25,
    completedAudits: 18,
    pendingAudits: 7,
    complianceScore: 87.5,
    nonConformities: 12,
    criticalIssues: 2,
    tasoScore: 92.3,
    idembScore: 88.7,
    innovationScore: 75.2,
    certificationStatus: "Válida",
    supplierPerformance: 89.1,
  };

  const auditProgress: AuditProgress[] = PEOTRAM_ELEMENTS.map((element, index) => ({
    elementId: element.id,
    elementName: element.name,
    progress: Math.floor(Math.random() * 100),
    status: ["completed", "in-progress", "pending", "overdue"][
      Math.floor(Math.random() * 4)
    ] as any,
    dueDate: `2024-${String(12 - (index % 12)).padStart(2, "0")}-15`,
    assignedTo: `Auditor ${index + 1}`,
    lastUpdate: `2024-12-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  }));

  const complianceTrend: ComplianceTrend[] = [
    { period: "Jan 2024", score: 85.2, nonConformities: 15, target: 90 },
    { period: "Fev 2024", score: 86.1, nonConformities: 13, target: 90 },
    { period: "Mar 2024", score: 87.3, nonConformities: 11, target: 90 },
    { period: "Abr 2024", score: 88.7, nonConformities: 9, target: 90 },
    { period: "Mai 2024", score: 87.9, nonConformities: 10, target: 90 },
    { period: "Jun 2024", score: 89.1, nonConformities: 8, target: 90 },
    { period: "Jul 2024", score: 88.5, nonConformities: 9, target: 90 },
    { period: "Ago 2024", score: 90.2, nonConformities: 7, target: 90 },
    { period: "Set 2024", score: 89.8, nonConformities: 8, target: 90 },
    { period: "Out 2024", score: 91.1, nonConformities: 6, target: 90 },
    { period: "Nov 2024", score: 88.9, nonConformities: 9, target: 90 },
    { period: "Dez 2024", score: 87.5, nonConformities: 12, target: 90 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "hsl(var(--success))";
      case "in-progress":
        return "hsl(var(--info))";
      case "pending":
        return "hsl(var(--warning))";
      case "overdue":
        return "hsl(var(--destructive))";
      default:
        return "hsl(var(--muted))";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Clock;
      case "pending":
        return Target;
      case "overdue":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 95) return { level: "Excelente", color: "hsl(var(--success))" };
    if (score >= 85) return { level: "Bom", color: "hsl(var(--info))" };
    if (score >= 70) return { level: "Regular", color: "hsl(var(--warning))" };
    return { level: "Insuficiente", color: "hsl(var(--destructive))" };
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header com filtros e ações */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard PEOTRAM</h1>
            <p className="text-muted-foreground">
              Programa de Excelência Operacional no Transporte Aéreo e Marítimo
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <FileCheck className="w-4 h-4 mr-2" />
              Nova Auditoria
            </Button>
          </div>
        </div>

        {/* Filtros expansíveis */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Período</label>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Auditoria</label>
                <select
                  value={auditType}
                  onChange={e => setAuditType(e.target.value as any)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="all">Todas</option>
                  <option value="vessel">Embarcação</option>
                  <option value="shore">Base Terrestre</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Pesquisar</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar auditorias..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* KPIs principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score de Conformidade</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.complianceScore}%</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getComplianceLevel(metrics.complianceScore).color + "20",
                        color: getComplianceLevel(metrics.complianceScore).color,
                      }}
                    >
                      {getComplianceLevel(metrics.complianceScore).level}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-success/20">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-info/5 border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TASO (Segurança)</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.tasoScore}</p>
                  <UITooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground cursor-help">
                        <HelpCircle className="w-3 h-3" />
                        Taxa de Acidentes de Segurança Operacional
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Indicador que mede a taxa de acidentes de segurança operacional por horas
                        trabalhadas
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="p-3 rounded-xl bg-info/20">
                  <Shield className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    IDEMB (Disponibilidade)
                  </p>
                  <p className="text-3xl font-bold text-foreground">{metrics.idembScore}</p>
                  <UITooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground cursor-help">
                        <HelpCircle className="w-3 h-3" />
                        Índice de Disponibilidade de Embarcação
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentual de tempo que a embarcação está disponível para operação</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="p-3 rounded-xl bg-warning/20">
                  <Ship className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.nonConformities}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">
                      {metrics.criticalIssues} Críticas
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-destructive/20">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="audits">Auditorias</TabsTrigger>
            <TabsTrigger value="compliance">Conformidade</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de tendência de conformidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Tendência de Conformidade
                  </CardTitle>
                  <CardDescription>
                    Evolução do score de conformidade ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={complianceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "hsl(var(--success))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progresso por elemento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Progresso por Elemento
                  </CardTitle>
                  <CardDescription>Status de auditoria dos 10 elementos PEOTRAM</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {auditProgress.slice(0, 6).map(element => {
                      const StatusIcon = getStatusIcon(element.status);
                      return (
                        <div key={element.elementId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className="w-4 h-4"
                                style={{ color: getStatusColor(element.status) }}
                              />
                              <span className="text-sm font-medium truncate max-w-48">
                                {element.elementName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {element.progress}%
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: getStatusColor(element.status),
                                  color: getStatusColor(element.status),
                                }}
                              >
                                {element.status}
                              </Badge>
                            </div>
                          </div>
                          <Progress
                            value={element.progress}
                            className="h-2"
                            style={{
                              background: getStatusColor(element.status) + "20",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver Todos os Elementos
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Indicadores adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-warning" />
                    Inovação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{metrics.innovationScore}</span>
                      <Badge
                        variant="outline"
                        className="bg-warning/10 text-warning border-warning/30"
                      >
                        Em Desenvolvimento
                      </Badge>
                    </div>
                    <Progress value={metrics.innovationScore} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Pontuação baseada em práticas inovadoras implementadas
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Certificação Petrobras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{metrics.certificationStatus}</span>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/30"
                      >
                        Ativa
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Válida até: 31/12/2024</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Certificado
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-info" />
                    Performance Fornecedores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{metrics.supplierPerformance}</span>
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                        Excelente
                      </Badge>
                    </div>
                    <Progress value={metrics.supplierPerformance} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Avaliação média dos fornecedores cadastrados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audits">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cronograma de Auditorias</CardTitle>
                  <CardDescription>
                    Acompanhe o progresso e status de todas as auditorias PEOTRAM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditProgress.map(audit => {
                      const StatusIcon = getStatusIcon(audit.status);
                      return (
                        <div
                          key={audit.elementId}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
                        >
                          <div className="flex items-center gap-4">
                            <StatusIcon
                              className="w-5 h-5"
                              style={{ color: getStatusColor(audit.status) }}
                            />
                            <div>
                              <h4 className="font-medium">{audit.elementName}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Prazo: {audit.dueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {audit.assignedTo}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{audit.progress}%</div>
                              <Progress value={audit.progress} className="w-24 h-2" />
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Não Conformidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={complianceTrend.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="nonConformities" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status de Conformidade por Elemento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PEOTRAM_ELEMENTS.slice(0, 5).map((element, index) => {
                      const score = 85 + Math.random() * 15;
                      const compliance = getComplianceLevel(score);
                      return (
                        <div key={element.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <element.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate max-w-48">
                              {element.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{score.toFixed(1)}%</span>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: compliance.color + "20",
                                color: compliance.color,
                                borderColor: compliance.color + "40",
                              }}
                            >
                              {compliance.level}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Eficiência Energética</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">-12.3%</div>
                      <p className="text-sm text-muted-foreground">
                        Redução no consumo de combustível
                      </p>
                      <Progress value={87.7} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Emissões GEE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">-8.5%</div>
                      <p className="text-sm text-muted-foreground">Redução nas emissões</p>
                      <Progress value={91.5} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Disponibilidade Frota</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">96.8%</div>
                      <p className="text-sm text-muted-foreground">Tempo de operação</p>
                      <Progress value={96.8} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados de conformidade e performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <FileCheck className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <div className="font-medium">Relatório de Auditoria</div>
                      <div className="text-sm text-muted-foreground">
                        Relatório completo PEOTRAM
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart3 className="w-8 h-8 text-info" />
                    <div className="text-center">
                      <div className="font-medium">Dashboard Executivo</div>
                      <div className="text-sm text-muted-foreground">KPIs e indicadores</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-warning" />
                    <div className="text-center">
                      <div className="font-medium">Não Conformidades</div>
                      <div className="text-sm text-muted-foreground">Listagem detalhada</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
