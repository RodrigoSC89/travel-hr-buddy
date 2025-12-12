/**
 * Crew AI Analysis - Advanced crew analytics with fatigue detection and competency gaps
 * PATCH 549 - Crew Management 2.0
 */

import { useEffect, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Brain,
  AlertTriangle,
  TrendingUp,
  Clock,
  Award,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  ChevronRight,
  Calendar,
  GraduationCap,
  Heart,
  Moon,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CrewMemberAnalysis {
  id: string;
  name: string;
  position: string;
  fatigueScore: number;
  fatigueRisk: "low" | "medium" | "high" | "critical";
  hoursWorked: number;
  restHours: number;
  competencyScore: number;
  certificationGaps: string[];
  performanceScore: number;
  readyForPromotion: boolean;
  alerts: string[];
  lastRestPeriod: Date;
  daysOnboard: number;
}

interface CompetencyGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  affectedCrew: number;
  priority: "low" | "medium" | "high";
  trainingRecommendation: string;
}

interface AIInsight {
  type: "warning" | "info" | "success" | "recommendation";
  title: string;
  description: string;
  action?: string;
  crewId?: string;
}

// Simulated data generation
const generateCrewAnalysis = (): CrewMemberAnalysis[] => [
  {
    id: "1",
    name: "Carlos Silva",
    position: "Capitão",
    fatigueScore: 25,
    fatigueRisk: "low",
    hoursWorked: 48,
    restHours: 72,
    competencyScore: 98,
    certificationGaps: [],
    performanceScore: 95,
    readyForPromotion: false,
    alerts: [],
    lastRestPeriod: new Date(Date.now() - 8 * 60 * 60 * 1000),
    daysOnboard: 12
  },
  {
    id: "2",
    name: "André Oliveira",
    position: "Chefe de Máquinas",
    fatigueScore: 62,
    fatigueRisk: "medium",
    hoursWorked: 72,
    restHours: 48,
    competencyScore: 92,
    certificationGaps: ["HUET Reciclagem"],
    performanceScore: 88,
    readyForPromotion: false,
    alerts: ["Hora extra acumulada"],
    lastRestPeriod: new Date(Date.now() - 12 * 60 * 60 * 1000),
    daysOnboard: 18
  },
  {
    id: "3",
    name: "Roberto Santos",
    position: "1º Oficial",
    fatigueScore: 78,
    fatigueRisk: "high",
    hoursWorked: 84,
    restHours: 36,
    competencyScore: 85,
    certificationGaps: ["GMDSS", "Radar ARPA"],
    performanceScore: 82,
    readyForPromotion: true,
    alerts: ["Fadiga elevada", "Certificação vencendo"],
    lastRestPeriod: new Date(Date.now() - 16 * 60 * 60 * 1000),
    daysOnboard: 24
  },
  {
    id: "4",
    name: "Marcos Lima",
    position: "2º Engenheiro",
    fatigueScore: 45,
    fatigueRisk: "low",
    hoursWorked: 56,
    restHours: 64,
    competencyScore: 78,
    certificationGaps: ["ERM Avançado", "Automação"],
    performanceScore: 90,
    readyForPromotion: true,
    alerts: [],
    lastRestPeriod: new Date(Date.now() - 7 * 60 * 60 * 1000),
    daysOnboard: 8
  },
  {
    id: "5",
    name: "Paulo Ferreira",
    position: "DPO",
    fatigueScore: 88,
    fatigueRisk: "critical",
    hoursWorked: 96,
    restHours: 24,
    competencyScore: 94,
    certificationGaps: [],
    performanceScore: 91,
    readyForPromotion: false,
    alerts: ["CRÍTICO: Descanso insuficiente", "Horas limite MLC"],
    lastRestPeriod: new Date(Date.now() - 20 * 60 * 60 * 1000),
    daysOnboard: 26
  }
];

const generateCompetencyGaps = (): CompetencyGap[] => [
  {
    skill: "Operação DP Avançada",
    currentLevel: 65,
    requiredLevel: 85,
    affectedCrew: 3,
    priority: "high",
    trainingRecommendation: "Curso DP Unlimited + Simulador 40h"
  },
  {
    skill: "Gestão de Emergências",
    currentLevel: 72,
    requiredLevel: 90,
    affectedCrew: 5,
    priority: "high",
    trainingRecommendation: "Treinamento OPITO + Drill prático"
  },
  {
    skill: "Manutenção Preditiva",
    currentLevel: 55,
    requiredLevel: 75,
    affectedCrew: 4,
    priority: "medium",
    trainingRecommendation: "Certificação CBM + Análise de vibração"
  },
  {
    skill: "Comunicação GMDSS",
    currentLevel: 80,
    requiredLevel: 95,
    affectedCrew: 2,
    priority: "medium",
    trainingRecommendation: "Reciclagem GOC + Prática"
  }
];

const generateAIInsights = (crew: CrewMemberAnalysis[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  
  const criticalFatigue = crew.filter(c => c.fatigueRisk === "critical");
  if (criticalFatigue.length > 0) {
    insights.push({
      type: "warning",
      title: `${criticalFatigue.length} tripulante(s) em fadiga crítica`,
      description: `${criticalFatigue.map(c => c.name).join(", ")} precisam de descanso imediato conforme MLC 2006.`,
      action: "Reorganizar escala",
      crewId: criticalFatigue[0].id
    });
  }

  const promotionReady = crew.filter(c => c.readyForPromotion);
  if (promotionReady.length > 0) {
    insights.push({
      type: "success",
      title: `${promotionReady.length} tripulante(s) prontos para promoção`,
      description: `Análise de performance indica que ${promotionReady.map(c => c.name).join(", ")} estão preparados para upgrade.`,
      action: "Ver análise"
    });
  }

  const certGaps = crew.filter(c => c.certificationGaps.length > 0);
  if (certGaps.length > 0) {
    insights.push({
      type: "recommendation",
      title: "Gaps de certificação detectados",
      description: `${certGaps.length} tripulantes precisam de treinamentos para manter compliance.`,
      action: "Planejar treinamentos"
    });
  }

  insights.push({
    type: "info",
    title: "Otimização de escala sugerida",
    description: "IA identificou oportunidade de balancear carga de trabalho entre turnos, reduzindo fadiga média em 18%.",
    action: "Ver proposta"
  });

  return insights;
};

const FatigueIndicator = ({ score, risk }: { score: number; risk: string }) => {
  const getColor = () => {
    switch (risk) {
    case "low": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high": return "bg-orange-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Fadiga</span>
        <span className={`font-medium ${risk === "critical" ? "text-red-500" : ""}`}>
          {score}%
        </span>
      </div>
      <Progress value={score} className={`h-2 ${getColor()}`} />
    </div>
  );
};

const CrewCard = ({ crew }: { crew: CrewMemberAnalysis }) => {
  const getRiskBadge = () => {
    const variants: Record<string, "outline" | "default" | "destructive" | "secondary"> = {
      low: "outline",
      medium: "secondary",
      high: "default",
      critical: "destructive"
    };
    const labels: Record<string, string> = {
      low: "OK",
      medium: "Atenção",
      high: "Alerta",
      critical: "Crítico"
    };
    return (
      <Badge variant={variants[crew.fatigueRisk]}>
        {labels[crew.fatigueRisk]}
      </Badge>
    );
  };

  return (
    <Card className={`border-l-4 ${
      crew.fatigueRisk === "critical" ? "border-l-red-500 bg-red-500/5" :
        crew.fatigueRisk === "high" ? "border-l-orange-500 bg-orange-500/5" :
          crew.fatigueRisk === "medium" ? "border-l-yellow-500" :
            "border-l-green-500"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{crew.name}</h4>
            <p className="text-sm text-muted-foreground">{crew.position}</p>
          </div>
          <div className="flex items-center gap-2">
            {crew.readyForPromotion && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Promoção
              </Badge>
            )}
            {getRiskBadge()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <FatigueIndicator score={crew.fatigueScore} risk={crew.fatigueRisk} />
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Competência</span>
              <span className="font-medium">{crew.competencyScore}%</span>
            </div>
            <Progress value={crew.competencyScore} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{crew.hoursWorked}h trab.</span>
          </div>
          <div className="flex items-center gap-1">
            <Moon className="h-3 w-3 text-muted-foreground" />
            <span>{crew.restHours}h desc.</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{crew.daysOnboard} dias</span>
          </div>
        </div>

        {crew.alerts.length > 0 && (
          <div className="mt-3 space-y-1">
            {crew.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}

        {crew.certificationGaps.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Certificações pendentes:</p>
            <div className="flex flex-wrap gap-1">
              {crew.certificationGaps.map((cert, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CrewAIAnalysis() {
  const [crewData, setCrewData] = useState<CrewMemberAnalysis[]>([]);
  const [competencyGaps, setCompetencyGaps] = useState<CompetencyGap[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const crew = generateCrewAnalysis();
    setCrewData(crew);
    setCompetencyGaps(generateCompetencyGaps());
    setInsights(generateAIInsights(crew));
    setIsAnalyzing(false);
  };

  const getOverallFatigueRisk = () => {
    const avgFatigue = crewData.reduce((acc, c) => acc + c.fatigueScore, 0) / crewData.length || 0;
    return avgFatigue;
  };

  const criticalCount = crewData.filter(c => c.fatigueRisk === "critical" || c.fatigueRisk === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Análise IA da Tripulação</h3>
            <p className="text-xs text-muted-foreground">
              Monitoramento de fadiga, competência e performance
            </p>
          </div>
        </div>
        <Button onClick={loadData} disabled={isAnalyzing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
          Atualizar Análise
        </Button>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between p-3 rounded-lg ${
                    insight.type === "warning" ? "bg-red-500/10 border border-red-500/20" :
                      insight.type === "success" ? "bg-green-500/10 border border-green-500/20" :
                        insight.type === "recommendation" ? "bg-blue-500/10 border border-blue-500/20" :
                          "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {insight.type === "success" && <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />}
                    {insight.type === "recommendation" && <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {insight.type === "info" && <Activity className="h-4 w-4 text-primary mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      {insight.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary opacity-50" />
              <div>
                <p className="text-2xl font-bold">{crewData.length}</p>
                <p className="text-xs text-muted-foreground">Tripulantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-red-500/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-8 w-8 ${criticalCount > 0 ? "text-red-500" : "text-muted-foreground"} opacity-50`} />
              <div>
                <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-red-500" : ""}`}>
                  {criticalCount}
                </p>
                <p className="text-xs text-muted-foreground">Em Risco</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-green-500 opacity-50" />
              <div>
                <p className="text-2xl font-bold">{(100 - getOverallFatigueRisk()).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Bem-estar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500 opacity-50" />
              <div>
                <p className="text-2xl font-bold">
                  {crewData.filter(c => c.readyForPromotion).length}
                </p>
                <p className="text-xs text-muted-foreground">Para Promoção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="fatigue" className="w-full">
        <TabsList>
          <TabsTrigger value="fatigue" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Fadiga
          </TabsTrigger>
          <TabsTrigger value="competency" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Competências
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fatigue" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crewData
                .sort((a, b) => b.fatigueScore - a.fatigueScore)
                .map(crew => (
                  <CrewCard key={crew.id} crew={crew} />
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="competency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gaps de Competência Identificados</CardTitle>
              <CardDescription>
                Análise automática de treinamentos necessários para a equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competencyGaps.map((gap, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{gap.skill}</h4>
                        <p className="text-xs text-muted-foreground">
                          {gap.affectedCrew} tripulante(s) afetados
                        </p>
                      </div>
                      <Badge variant={
                        gap.priority === "high" ? "destructive" :
                          gap.priority === "medium" ? "default" : "outline"
                      }>
                        {gap.priority === "high" ? "Alta" :
                          gap.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Nível atual: {gap.currentLevel}%</span>
                        <span>Requerido: {gap.requiredLevel}%</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-primary/30"
                          style={{ width: `${gap.requiredLevel}%` }}
                        />
                        <div
                          className="absolute h-full bg-primary"
                          style={{ width: `${gap.currentLevel}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <strong>Recomendação:</strong> {gap.trainingRecommendation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ranking de Performance</CardTitle>
              <CardDescription>
                Avaliação baseada em competência, pontualidade e feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewData
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .map((crew, i) => (
                    <div key={crew.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        i === 0 ? "bg-yellow-500 text-yellow-950" :
                          i === 1 ? "bg-gray-300 text-gray-700" :
                            i === 2 ? "bg-amber-600 text-amber-50" :
                              "bg-muted"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{crew.name}</p>
                        <p className="text-xs text-muted-foreground">{crew.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{crew.performanceScore}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                      {crew.readyForPromotion && (
                        <Badge variant="outline" className="text-green-600">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Pronto
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
