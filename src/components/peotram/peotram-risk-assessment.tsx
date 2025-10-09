import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  Eye,
  Plus,
  Save,
  FileText,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface RiskFactor {
  id: string;
  category: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  riskLevel: "baixo" | "medio" | "alto" | "critico";
  mitigation: string;
  responsible: string;
  dueDate: string;
  status: "aberto" | "em_andamento" | "mitigado" | "fechado";
}

interface RiskAssessment {
  id: string;
  title: string;
  vessel: string;
  assessor: string;
  date: string;
  overallRisk: number;
  factors: RiskFactor[];
  recommendations: string[];
  status: "rascunho" | "em_revisao" | "aprovado" | "implementado";
}

export const PeotramRiskAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [isNewAssessment, setIsNewAssessment] = useState(false);

  const getDemoAssessments = (): RiskAssessment[] => [
    {
      id: "RISK_001",
      title: "Avaliação de Risco - Terminal Santos",
      vessel: "MV Atlantic Explorer",
      assessor: "João Silva",
      date: "2024-12-20",
      overallRisk: 3.2,
      factors: [
        {
          id: "RF_001",
          category: "Operacional",
          description: "Condições meteorológicas adversas durante carregamento",
          probability: 3,
          impact: 4,
          riskLevel: "alto",
          mitigation: "Implementar protocolo de monitoramento meteorológico",
          responsible: "Oficial de Náutica",
          dueDate: "2024-12-30",
          status: "em_andamento"
        },
        {
          id: "RF_002",
          category: "Ambiental",
          description: "Derramamento durante transferência de combustível",
          probability: 2,
          impact: 5,
          riskLevel: "alto",
          mitigation: "Revisão dos procedimentos de contenção",
          responsible: "Oficial de Máquinas",
          dueDate: "2025-01-15",
          status: "aberto"
        }
      ],
      recommendations: [
        "Intensificar treinamentos de resposta a emergências",
        "Atualizar equipamentos de contenção",
        "Implementar sistema de monitoramento contínuo"
      ],
      status: "aprovado"
    }
  ];

  const [assessments, setAssessments] = useState<RiskAssessment[]>(getDemoAssessments());

  const getRiskColor = (level: string) => {
    switch (level) {
    case "baixo": return "bg-success/20 text-success border-success/30";
    case "medio": return "bg-warning/20 text-warning border-warning/30";
    case "alto": return "bg-destructive/20 text-destructive border-destructive/30";
    case "critico": return "bg-destructive/30 text-destructive border-destructive/40";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
    case "baixo": return "Baixo";
    case "medio": return "Médio";
    case "alto": return "Alto";
    case "critico": return "Crítico";
    default: return level;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "fechado": return <CheckCircle className="w-4 h-4 text-success" />;
    case "mitigado": return <CheckCircle className="w-4 h-4 text-info" />;
    case "em_andamento": return <Clock className="w-4 h-4 text-warning" />;
    case "aberto": return <AlertCircle className="w-4 h-4 text-destructive" />;
    default: return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const calculateRiskScore = (probability: number, impact: number) => {
    return probability * impact;
  };

  const getRiskMatrix = () => {
    const matrix = [];
    for (let impact = 5; impact >= 1; impact--) {
      const row = [];
      for (let probability = 1; probability <= 5; probability++) {
        const score = probability * impact;
        let level = "baixo";
        if (score >= 15) level = "critico";
        else if (score >= 10) level = "alto";
        else if (score >= 6) level = "medio";
        
        row.push({ probability, impact, score, level });
      }
      matrix.push(row);
    }
    return matrix;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avaliação de Riscos PEOTRAM</h2>
          <p className="text-muted-foreground">
            Identificação, análise e mitigação de riscos operacionais
          </p>
        </div>
        <Button 
          onClick={() => setIsNewAssessment(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Matriz de Risco
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-accent/5"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <Badge variant="outline" className={getRiskColor(
                      assessment.overallRisk >= 15 ? "critico" :
                        assessment.overallRisk >= 10 ? "alto" :
                          assessment.overallRisk >= 6 ? "medio" : "baixo"
                    )}>
                      Risco {assessment.overallRisk.toFixed(1)}
                    </Badge>
                  </div>
                  <CardDescription>{assessment.vessel}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {assessment.assessor}
                    </span>
                    <span className="text-muted-foreground">{assessment.date}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fatores de Risco</span>
                      <span className="font-medium">{assessment.factors.length}</span>
                    </div>
                    <Progress 
                      value={(assessment.factors.filter(f => f.status === "mitigado" || f.status === "fechado").length / assessment.factors.length) * 100}
                      className="h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {assessment.factors.filter(f => f.status === "mitigado" || f.status === "fechado").length} de {assessment.factors.length} mitigados
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Save className="w-3 h-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Risco 5x5</CardTitle>
              <CardDescription>
                Matriz de avaliação baseada em probabilidade vs impacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-1 min-w-[600px]">
                  {/* Header */}
                  <div className="p-3 text-center font-semibold"></div>
                  {[1, 2, 3, 4, 5].map(prob => (
                    <div key={prob} className="p-3 text-center font-semibold text-sm">
                      Probabilidade {prob}
                    </div>
                  ))}
                  
                  {/* Matrix */}
                  {getRiskMatrix().map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      <div className="p-3 text-center font-semibold text-sm">
                        Impacto {5 - rowIndex}
                      </div>
                      {row.map((cell, cellIndex) => (
                        <div
                          key={cellIndex}
                          className={`p-3 text-center text-sm font-medium border rounded ${getRiskColor(cell.level)}`}
                        >
                          {cell.score}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success/40 rounded"></div>
                  <span className="text-sm">Baixo (1-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warning/40 rounded"></div>
                  <span className="text-sm">Médio (6-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/40 rounded"></div>
                  <span className="text-sm">Alto (10-14)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/60 rounded"></div>
                  <span className="text-sm">Crítico (15-25)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Riscos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde última semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riscos Críticos</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <p className="text-xs text-muted-foreground">
                  Requer ação imediata
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Mitigação</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">78%</div>
                <p className="text-xs text-muted-foreground">
                  +5% este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">5</div>
                <p className="text-xs text-muted-foreground">
                  Para esta semana
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Risco</CardTitle>
              <CardDescription>
                Gere relatórios detalhados de avaliação de riscos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  Relatório Executivo
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Análise Estatística
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Tendências de Risco
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Shield className="w-6 h-6" />
                  Plano de Mitigação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};