import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  FileText,
  Clock,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Star,
  Award,
  Zap
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComplianceItem {
  id: string;
  category: string;
  element: string;
  requirement: string;
  status: "compliant" | "non-compliant" | "partial" | "not-assessed";
  score: number;
  maxScore: number;
  lastAssessment: string;
  nextDue: string;
  criticality: "low" | "medium" | "high" | "critical";
  trend: "improving" | "stable" | "declining";
  evidence: string[];
  recommendations: string[];
  responsible: string;
}

interface ComplianceReport {
  id: string;
  period: string;
  overallScore: number;
  complianceRate: number;
  nonConformities: number;
  criticalIssues: number;
  trends: {
    period: string;
    score: number;
    improvement: number;
  }[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  nextActions: {
    action: string;
    priority: "low" | "medium" | "high" | "critical";
    deadline: string;
    responsible: string;
  }[];
}

export const PeotramComplianceChecker: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-Q4");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, [selectedPeriod, selectedCategory]);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setComplianceItems(getMockComplianceItems());
      setComplianceReport(getMockComplianceReport());
    } catch (error) {
      console.error("Erro ao carregar dados de conformidade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockComplianceItems = (): ComplianceItem[] => [
    {
      id: "COMP_001",
      category: "Elemento 01",
      element: "Liderança e Responsabilidade",
      requirement: "Compromisso da alta administração com SMS",
      status: "compliant",
      score: 4,
      maxScore: 4,
      lastAssessment: "2024-12-15",
      nextDue: "2025-06-15",
      criticality: "high",
      trend: "stable",
      evidence: ["Política SMS assinada", "Reuniões de gestão", "Relatórios de visitas"],
      recommendations: ["Manter práticas atuais", "Documentar melhor as visitas"],
      responsible: "Diretor de Operações"
    },
    {
      id: "COMP_002",
      category: "Elemento 02",
      element: "Conformidade Legal",
      requirement: "Sistema de identificação de requisitos legais",
      status: "partial",
      score: 2,
      maxScore: 4,
      lastAssessment: "2024-12-10",
      nextDue: "2025-03-10",
      criticality: "critical",
      trend: "improving",
      evidence: ["Planilha de requisitos", "Software em implementação"],
      recommendations: ["Implementar software de gestão legal", "Treinar equipe"],
      responsible: "Gerente de Compliance"
    },
    {
      id: "COMP_003",
      category: "Elemento 03",
      element: "Gestão de Riscos",
      requirement: "Processo sistemático de análise de riscos",
      status: "non-compliant",
      score: 1,
      maxScore: 4,
      lastAssessment: "2024-12-08",
      nextDue: "2025-01-08",
      criticality: "critical",
      trend: "declining",
      evidence: ["Análises pontuais", "Falta de sistemática"],
      recommendations: ["Implementar metodologia HAZOP", "Treinar analistas"],
      responsible: "Gerente de Segurança"
    }
  ];

  const getMockComplianceReport = (): ComplianceReport => ({
    id: "REP_2024_Q4",
    period: "2024-Q4",
    overallScore: 78.5,
    complianceRate: 65.2,
    nonConformities: 8,
    criticalIssues: 2,
    trends: [
      { period: "Q1", score: 72.1, improvement: 0 },
      { period: "Q2", score: 75.3, improvement: 3.2 },
      { period: "Q3", score: 76.8, improvement: 1.5 },
      { period: "Q4", score: 78.5, improvement: 1.7 }
    ],
    riskLevel: "medium",
    recommendations: [
      "Priorizar implementação do sistema de gestão legal",
      "Desenvolver metodologia sistemática de análise de riscos",
      "Aumentar frequência de auditorias internas"
    ],
    nextActions: [
      {
        action: "Implementar software de gestão legal",
        priority: "critical",
        deadline: "2025-01-30",
        responsible: "Gerente de Compliance"
      },
      {
        action: "Desenvolver procedimento de análise de riscos",
        priority: "high",
        deadline: "2025-02-15",
        responsible: "Gerente de Segurança"
      }
    ]
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "compliant": return <CheckCircle className="w-5 h-5 text-success" />;
    case "partial": return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "non-compliant": return <XCircle className="w-5 h-5 text-destructive" />;
    default: return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "compliant": return "bg-success/20 text-success border-success/30";
    case "partial": return "bg-warning/20 text-warning border-warning/30";
    case "non-compliant": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "improving": return <TrendingUp className="w-4 h-4 text-success" />;
    case "declining": return <TrendingDown className="w-4 h-4 text-destructive" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
    case "critical": return "text-destructive";
    case "high": return "text-warning";
    case "medium": return "text-info";
    default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-success";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando verificação de conformidade...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Verificação de Conformidade PEOTRAM</h2>
            <p className="text-muted-foreground">
              Análise detalhada da conformidade com requisitos PEOTRAM
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório PDF
            </Button>
          </div>
        </div>

        {/* Resumo Executivo */}
        {complianceReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Score Geral</p>
                    <p className="text-2xl font-bold">{complianceReport.overallScore}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Conformidade</p>
                    <p className="text-2xl font-bold">{complianceReport.complianceRate}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
                    <p className="text-2xl font-bold">{complianceReport.nonConformities}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-warning/20">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Questões Críticas</p>
                    <p className="text-2xl font-bold">{complianceReport.criticalIssues}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs principais */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">Itens de Conformidade</TabsTrigger>
            <TabsTrigger value="summary">Resumo Executivo</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="actions">Plano de Ação</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(item.status)}
                          <div>
                            <h3 className="font-semibold text-foreground">{item.element}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{item.requirement}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Última avaliação: {new Date(item.lastAssessment).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Próxima: {new Date(item.nextDue).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {item.responsible}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(item.score, item.maxScore)}`}>
                            {item.score}/{item.maxScore}
                          </div>
                          <Progress 
                            value={(item.score / item.maxScore) * 100} 
                            className="w-16 h-2"
                          />
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(item.status)}
                          >
                            {item.status === "compliant" ? "Conforme" :
                              item.status === "partial" ? "Parcial" :
                                item.status === "non-compliant" ? "Não Conforme" : "Não Avaliado"}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            {getTrendIcon(item.trend)}
                            <span className={`text-xs ${getCriticalityColor(item.criticality)}`}>
                              {item.criticality === "critical" ? "Crítico" :
                                item.criticality === "high" ? "Alto" :
                                  item.criticality === "medium" ? "Médio" : "Baixo"}
                            </span>
                          </div>
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver detalhes</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {item.status !== "compliant" && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">Recomendações:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {item.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="summary">
            {complianceReport && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Executivo - {complianceReport.period}</CardTitle>
                    <CardDescription>
                      Análise consolidada da conformidade PEOTRAM
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Status Geral</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Score Geral:</span>
                            <span className="font-bold">{complianceReport.overallScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de Conformidade:</span>
                            <span className="font-bold">{complianceReport.complianceRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nível de Risco:</span>
                            <Badge className={
                              complianceReport.riskLevel === "low" ? "bg-success" :
                                complianceReport.riskLevel === "medium" ? "bg-warning" : "bg-destructive"
                            }>
                              {complianceReport.riskLevel === "low" ? "Baixo" :
                                complianceReport.riskLevel === "medium" ? "Médio" : "Alto"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Questões Identificadas</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Não Conformidades:</span>
                            <span className="font-bold text-warning">{complianceReport.nonConformities}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Questões Críticas:</span>
                            <span className="font-bold text-destructive">{complianceReport.criticalIssues}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Principais Recomendações</h3>
                      <ul className="space-y-2">
                        {complianceReport.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>
                  Evolução da conformidade ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p>Gráfico de tendências será implementado aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            {complianceReport && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plano de Ação</CardTitle>
                    <CardDescription>
                      Ações prioritárias para melhoria da conformidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceReport.nextActions.map((action, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{action.action}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(action.deadline).toLocaleDateString("pt-BR")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {action.responsible}
                                </span>
                              </div>
                            </div>
                            <Badge className={
                              action.priority === "critical" ? "bg-destructive" :
                                action.priority === "high" ? "bg-warning" :
                                  action.priority === "medium" ? "bg-info" : "bg-muted"
                            }>
                              {action.priority === "critical" ? "Crítica" :
                                action.priority === "high" ? "Alta" :
                                  action.priority === "medium" ? "Média" : "Baixa"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};