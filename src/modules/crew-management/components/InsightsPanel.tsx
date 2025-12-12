import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Award,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  Target,
  Calendar,
  Heart,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CrewMemberAnalysis {
  id: string;
  name: string;
  position: string;
  fatigueScore: number;
  fatigueRisk: "low" | "medium" | "high" | "critical";
  competencyScore: number;
  performanceScore: number;
  readyForPromotion: boolean;
  hoursWorked: number;
  restHours: number;
  daysOnboard: number;
  alerts: string[];
  certificationGaps: string[];
}

interface AIInsight {
  type: "warning" | "success" | "info" | "recommendation";
  title: string;
  description: string;
  action?: string;
  priority: number;
}

// Mock data generation
const generateCrewAnalysis = (): CrewMemberAnalysis[] => [
  {
    id: "1",
    name: "João Silva",
    position: "Comandante",
    fatigueScore: 25,
    fatigueRisk: "low",
    competencyScore: 98,
    performanceScore: 95,
    readyForPromotion: false,
    hoursWorked: 48,
    restHours: 72,
    daysOnboard: 12,
    alerts: [],
    certificationGaps: [],
  },
  {
    id: "2",
    name: "Carlos Santos",
    position: "Chefe de Máquinas",
    fatigueScore: 62,
    fatigueRisk: "medium",
    competencyScore: 92,
    performanceScore: 88,
    readyForPromotion: false,
    hoursWorked: 72,
    restHours: 48,
    daysOnboard: 18,
    alerts: ["Horas extras acumuladas"],
    certificationGaps: ["HUET Reciclagem"],
  },
  {
    id: "3",
    name: "Maria Oliveira",
    position: "Oficial de Convés",
    fatigueScore: 78,
    fatigueRisk: "high",
    competencyScore: 85,
    performanceScore: 82,
    readyForPromotion: true,
    hoursWorked: 84,
    restHours: 36,
    daysOnboard: 24,
    alerts: ["Fadiga elevada", "Certificação vencendo"],
    certificationGaps: ["GMDSS", "Radar ARPA"],
  },
  {
    id: "4",
    name: "Pedro Costa",
    position: "Marinheiro",
    fatigueScore: 88,
    fatigueRisk: "critical",
    competencyScore: 75,
    performanceScore: 91,
    readyForPromotion: false,
    hoursWorked: 96,
    restHours: 24,
    daysOnboard: 26,
    alerts: ["CRÍTICO: Descanso insuficiente", "Limite MLC"],
    certificationGaps: [],
  },
];

const generateInsights = (crew: CrewMemberAnalysis[]): AIInsight[] => {
  const insights: AIInsight[] = [];

  const criticalFatigue = crew.filter(c => c.fatigueRisk === "critical" || c.fatigueRisk === "high");
  if (criticalFatigue.length > 0) {
    insights.push({
      type: "warning",
      title: `${criticalFatigue.length} tripulante(s) com fadiga elevada`,
      description: `${criticalFatigue.map(c => c.name).join(", ")} precisam de descanso conforme MLC 2006`,
      action: "Reorganizar Escala",
      priority: 1,
    });
  }

  const promotionReady = crew.filter(c => c.readyForPromotion);
  if (promotionReady.length > 0) {
    insights.push({
      type: "success",
      title: `${promotionReady.length} tripulante(s) prontos para promoção`,
      description: `Análise de performance indica que ${promotionReady.map(c => c.name).join(", ")} estão preparados`,
      action: "Ver Análise",
      priority: 3,
    });
  }

  const certGaps = crew.filter(c => c.certificationGaps.length > 0);
  if (certGaps.length > 0) {
    insights.push({
      type: "recommendation",
      title: "Gaps de certificação detectados",
      description: `${certGaps.length} tripulantes precisam de treinamentos para manter compliance`,
      action: "Planejar Treinamentos",
      priority: 2,
    });
  }

  insights.push({
    type: "info",
    title: "Otimização de escala disponível",
    description: "IA identificou oportunidade de balancear carga de trabalho, reduzindo fadiga média em 18%",
    action: "Ver Proposta",
    priority: 4,
  });

  return insights.sort((a, b) => a.priority - b.priority);
};

export const InsightsPanel = memo(function() {
  const [crewData, setCrewData] = useState<CrewMemberAnalysis[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const crew = generateCrewAnalysis();
    setCrewData(crew);
    setInsights(generateInsights(crew));
    setIsAnalyzing(false);
  };

  const avgFatigue = crewData.reduce((acc, c) => acc + c.fatigueScore, 0) / crewData.length || 0;
  const criticalCount = crewData.filter(c => c.fatigueRisk === "critical" || c.fatigueRisk === "high").length;
  const avgCompetency = crewData.reduce((acc, c) => acc + c.competencyScore, 0) / crewData.length || 0;

  const getFatigueColor = (risk: string) => {
    switch (risk) {
    case "low": return "bg-emerald-500";
    case "medium": return "bg-amber-500";
    case "high": return "bg-orange-500";
    case "critical": return "bg-rose-500";
    default: return "bg-muted";
    }
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
    case "warning": return { bg: "bg-rose-500/10 border-rose-500/20", icon: AlertTriangle, color: "text-rose-500" };
    case "success": return { bg: "bg-emerald-500/10 border-emerald-500/20", icon: TrendingUp, color: "text-emerald-500" };
    case "recommendation": return { bg: "bg-blue-500/10 border-blue-500/20", icon: Target, color: "text-blue-500" };
    case "info": return { bg: "bg-primary/10 border-primary/20", icon: Zap, color: "text-primary" };
    default: return { bg: "bg-muted", icon: Zap, color: "text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Análise IA 2.0</h2>
            <p className="text-sm text-muted-foreground">
              Monitoramento inteligente de fadiga, competência e performance
            </p>
          </div>
        </div>
        <Button onClick={loadData} disabled={isAnalyzing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* AI Insights */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              const IconComponent = styles.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start justify-between p-4 rounded-lg border ${styles.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${styles.color}`} />
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs">
                      {insight.action}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary opacity-50" />
            <div>
              <p className="text-2xl font-bold">{crewData.length}</p>
              <p className="text-xs text-muted-foreground">Tripulantes</p>
            </div>
          </div>
        </Card>
        <Card className={`p-4 ${criticalCount > 0 ? "border-rose-500/50" : ""}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-8 w-8 ${criticalCount > 0 ? "text-rose-500" : "text-muted-foreground"} opacity-50`} />
            <div>
              <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-rose-500" : ""}`}>
                {criticalCount}
              </p>
              <p className="text-xs text-muted-foreground">Em Risco</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-emerald-500 opacity-50" />
            <div>
              <p className="text-2xl font-bold">{(100 - avgFatigue).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Bem-estar</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-500 opacity-50" />
            <div>
              <p className="text-2xl font-bold">
                {crewData.filter(c => c.readyForPromotion).length}
              </p>
              <p className="text-xs text-muted-foreground">Para Promoção</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Crew Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {crewData.map((crew, index) => (
          <motion.div
            key={crew.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 border-l-4 ${
              crew.fatigueRisk === "critical" ? "border-l-rose-500 bg-rose-500/5" :
                crew.fatigueRisk === "high" ? "border-l-orange-500 bg-orange-500/5" :
                  crew.fatigueRisk === "medium" ? "border-l-amber-500" :
                    "border-l-emerald-500"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{crew.name}</h4>
                    {crew.readyForPromotion && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Promoção
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{crew.position}</p>
                </div>
                <Badge variant={
                  crew.fatigueRisk === "critical" ? "destructive" :
                    crew.fatigueRisk === "high" ? "default" :
                      crew.fatigueRisk === "medium" ? "secondary" : "outline"
                }>
                  {crew.fatigueRisk === "critical" ? "Crítico" :
                    crew.fatigueRisk === "high" ? "Alerta" :
                      crew.fatigueRisk === "medium" ? "Atenção" : "OK"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fadiga</span>
                    <span className={crew.fatigueRisk === "critical" ? "text-rose-500" : ""}>{crew.fatigueScore}%</span>
                  </div>
                  <Progress value={crew.fatigueScore} className={`h-2 ${getFatigueColor(crew.fatigueRisk)}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Competência</span>
                    <span>{crew.competencyScore}%</span>
                  </div>
                  <Progress value={crew.competencyScore} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{crew.hoursWorked}h trab.</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="h-3 w-3" />
                  <span>{crew.restHours}h desc.</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{crew.daysOnboard} dias</span>
                </div>
              </div>

              {crew.alerts.length > 0 && (
                <div className="space-y-1">
                  {crew.alerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-rose-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
