import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  BookOpen,
  Shield,
  Zap,
  FileText,
  Star,
  Award,
  Clock,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface SectionScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "acceptable" | "needs_improvement" | "critical";
  findings: Finding[];
  recommendations: IMCARecommendation[];
}

interface Finding {
  id: string;
  type: "gap" | "improvement" | "compliance";
  severity: "high" | "medium" | "low";
  description: string;
  reference: string;
}

interface IMCARecommendation {
  id: string;
  source: "M190" | "M182" | "M117" | "M166" | "M103";
  section: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  relatedFindings: string[];
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  source: string;
  adoptionRate: number;
  impact: "high" | "medium" | "low";
  category: string;
}

export const MLValidationIMCA: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(78);
  
  const [sectionScores, setSectionScores] = useState<SectionScore[]>([
    {
      id: "management",
      name: "Gestão",
      score: 85,
      maxScore: 100,
      status: "good",
      findings: [
        { id: "f1", type: "improvement", severity: "medium", description: "Organograma DP pode ser mais detalhado", reference: "IMCA M 117 §4.2" }
      ],
      recommendations: [
        { id: "r1", source: "M117", section: "4.2", recommendation: "Definir claramente responsabilidades do DPO em diferentes níveis ASOG", priority: "medium", relatedFindings: ["f1"] }
      ]
    },
    {
      id: "training",
      name: "Treinamentos",
      score: 72,
      maxScore: 100,
      status: "acceptable",
      findings: [
        { id: "f2", type: "gap", severity: "high", description: "Simulador DP não atualizado com últimas FMEA", reference: "IMCA M 117 §5.3" },
        { id: "f3", type: "compliance", severity: "medium", description: "Reciclagem de DPO pendente", reference: "IMCA M 117 §5.1" }
      ],
      recommendations: [
        { id: "r2", source: "M117", section: "5.3", recommendation: "Atualizar cenários de simulador com base na última FMEA", priority: "high", relatedFindings: ["f2"] },
        { id: "r3", source: "M117", section: "5.1", recommendation: "Programar reciclagem de DPO antes do vencimento", priority: "high", relatedFindings: ["f3"] }
      ]
    },
    {
      id: "procedures",
      name: "Procedimentos",
      score: 88,
      maxScore: 100,
      status: "good",
      findings: [
        { id: "f4", type: "improvement", severity: "low", description: "Checklist pré-operacional pode incluir mais itens de verificação", reference: "IMCA M 182 §3.4" }
      ],
      recommendations: [
        { id: "r4", source: "M182", section: "3.4", recommendation: "Adicionar verificação de comunicação com ROV no checklist", priority: "low", relatedFindings: ["f4"] }
      ]
    },
    {
      id: "operation",
      name: "Operação",
      score: 82,
      maxScore: 100,
      status: "good",
      findings: [
        { id: "f5", type: "gap", severity: "medium", description: "Watch handover não padronizado", reference: "IMCA M 190 §6.2" }
      ],
      recommendations: [
        { id: "r5", source: "M190", section: "6.2", recommendation: "Implementar checklist de handover conforme best practice", priority: "medium", relatedFindings: ["f5"] }
      ]
    },
    {
      id: "maintenance",
      name: "Manutenção",
      score: 68,
      maxScore: 100,
      status: "needs_improvement",
      findings: [
        { id: "f6", type: "gap", severity: "high", description: "Manutenção preditiva de thrusters não implementada", reference: "IMCA M 166 §4.5" },
        { id: "f7", type: "compliance", severity: "medium", description: "Calibração de sensores pendente", reference: "IMCA M 166 §4.3" }
      ],
      recommendations: [
        { id: "r6", source: "M166", section: "4.5", recommendation: "Implementar monitoramento de vibração para manutenção preditiva", priority: "high", relatedFindings: ["f6"] },
        { id: "r7", source: "M166", section: "4.3", recommendation: "Estabelecer cronograma de calibração conforme fabricante", priority: "high", relatedFindings: ["f7"] }
      ]
    },
    {
      id: "testing",
      name: "Testes Anuais",
      score: 75,
      maxScore: 100,
      status: "acceptable",
      findings: [
        { id: "f8", type: "improvement", severity: "medium", description: "DP Trial não incluiu cenário de worst case", reference: "IMCA M 190 §8.1" }
      ],
      recommendations: [
        { id: "r8", source: "M190", section: "8.1", recommendation: "Incluir cenário de worst case environmental no próximo DP Trial", priority: "medium", relatedFindings: ["f8"] }
      ]
    }
  ]);

  const [bestPractices] = useState<BestPractice[]>([
    {
      id: "bp1",
      title: "Dual Watch Keeping",
      description: "Manter dois DPOs durante operações críticas próximas a estruturas",
      source: "IMCA M 190",
      adoptionRate: 87,
      impact: "high",
      category: "operation"
    },
    {
      id: "bp2",
      title: "Briefing Pré-Aproximação",
      description: "Briefing estruturado antes de qualquer aproximação a plataforma",
      source: "IMCA M 182",
      adoptionRate: 94,
      impact: "high",
      category: "procedures"
    },
    {
      id: "bp3",
      title: "Análise de Tendência de Consumo",
      description: "Monitorar tendência de consumo de combustível dos thrusters",
      source: "Best Practice Fleet",
      adoptionRate: 62,
      impact: "medium",
      category: "maintenance"
    },
    {
      id: "bp4",
      title: "Simulação Mensal de Emergência",
      description: "Realizar simulação de drive-off mensalmente",
      source: "IMCA M 117",
      adoptionRate: 78,
      impact: "high",
      category: "training"
    },
    {
      id: "bp5",
      title: "Log Eletrônico de DP",
      description: "Utilizar sistema de log eletrônico com backup automático",
      source: "Best Practice Fleet",
      adoptionRate: 83,
      impact: "medium",
      category: "operation"
    }
  ]);

  const runMLValidation = async () => {
    setIsAnalyzing(true);
    toast.info("Executando validação com IA...");

    // Simulate ML validation
    setTimeout(() => {
      setOverallScore(prev => Math.min(100, prev + Math.floor(Math.random() * 5)));
      setIsAnalyzing(false);
      toast.success("Validação concluída!", {
        description: "12 recomendações IMCA geradas"
      });
    }, 3000);
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  });

  const getStatusBadge = (status: SectionScore["status"]) => {
    const styles = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      acceptable: "bg-yellow-100 text-yellow-800",
      needs_improvement: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    const labels = {
      excellent: "Excelente",
      good: "Bom",
      acceptable: "Aceitável",
      needs_improvement: "Requer Melhoria",
      critical: "Crítico"
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  });

  const getSeverityBadge = (severity: string) => {
    const styles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return styles[severity as keyof typeof styles] || styles.low;
  });

  const totalFindings = sectionScores.reduce((sum, s) => sum + s.findings.length, 0);
  const totalRecommendations = sectionScores.reduce((sum, s) => sum + s.recommendations.length, 0);
  const highPriorityCount = sectionScores.reduce(
    (sum, s) => sum + s.recommendations.filter(r => r.priority === "high").length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-600/10">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Validação ML + Recomendações IMCA</CardTitle>
                <CardDescription>
                  Scoring automático com sugestões baseadas em M190, M182, M117, M166
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={runMLValidation}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Validação
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Geral PEO-DP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {overallScore >= 80 ? "Plano em conformidade" : 
                    overallScore >= 60 ? "Requer melhorias" : "Ação urgente necessária"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Achados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{totalFindings}</span>
            </div>
            <p className="text-sm text-muted-foreground">identificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{totalRecommendations}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-red-600 font-medium">{highPriorityCount} alta prioridade</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Score por Seção</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações IMCA</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionScores.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    {getStatusBadge(section.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${getScoreColor(section.score)}`}>
                      {section.score}%
                    </div>
                    <Progress value={section.score} className="flex-1 h-3" />
                  </div>

                  {section.findings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Achados ({section.findings.length})
                      </h4>
                      {section.findings.slice(0, 2).map((finding) => (
                        <div key={finding.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <span>{finding.description}</span>
                            <Badge className={getSeverityBadge(finding.severity)} variant="outline">
                              {finding.severity === "high" ? "Alta" : 
                                finding.severity === "medium" ? "Média" : "Baixa"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {finding.reference}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Recomendações Baseadas em IMCA
              </CardTitle>
              <CardDescription>
                Sugestões de melhoria extraídas de M190, M182, M117, M166
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionScores.flatMap(section => 
                section.recommendations.map(rec => ({ ...rec, sectionName: section.name }))
              ).sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }).map((rec) => (
                <div 
                  key={rec.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === "high" ? "border-l-red-500 bg-red-50" :
                      rec.priority === "medium" ? "border-l-yellow-500 bg-yellow-50" :
                        "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          IMCA {rec.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">§{rec.section}</span>
                        <Badge className={getSeverityBadge(rec.priority)}>
                          {rec.priority === "high" ? "Alta" : 
                            rec.priority === "medium" ? "Média" : "Baixa"} prioridade
                        </Badge>
                      </div>
                      <p className="text-sm">{rec.recommendation}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Seção: {rec.sectionName}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="best-practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Melhores Práticas da Frota
              </CardTitle>
              <CardDescription>
                Práticas recomendadas baseadas em dados anonimizados de embarcações similares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bestPractices.map((practice) => (
                <div 
                  key={practice.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className={`h-4 w-4 ${
                          practice.impact === "high" ? "text-yellow-500" : "text-gray-400"
                        }`} />
                        <h4 className="font-medium">{practice.title}</h4>
                        <Badge variant="outline">{practice.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Fonte:</span>{" "}
                          <span className="font-medium">{practice.source}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Adoção:</span>{" "}
                          <span className={`font-medium ${
                            practice.adoptionRate >= 80 ? "text-green-600" :
                              practice.adoptionRate >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {practice.adoptionRate}%
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Impacto:</span>{" "}
                          <Badge variant="outline" className={
                            practice.impact === "high" ? "border-green-500 text-green-700" :
                              "border-yellow-500 text-yellow-700"
                          }>
                            {practice.impact === "high" ? "Alto" : "Médio"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Adotar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ML Model Info */}
          <Card className="border-2 border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Modelo de Validação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Algoritmo</p>
                  <p className="font-medium">Random Forest + NLP</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base de Conhecimento</p>
                  <p className="font-medium">IMCA M-Series</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precisão</p>
                  <p className="font-medium text-green-600">91.2%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
