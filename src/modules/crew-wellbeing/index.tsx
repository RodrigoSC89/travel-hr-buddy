import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, Brain, Users, Clock, AlertTriangle, CheckCircle2,
  Moon, Sun, Activity, Thermometer, Coffee, RefreshCw,
  TrendingUp, TrendingDown, Shield, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface CrewWellbeing {
  id: string;
  name: string;
  position: string;
  vessel: string;
  fatigueLevel: "low" | "moderate" | "high" | "critical";
  hoursWorked: number;
  restHours: number;
  daysOnboard: number;
  healthScore: number;
  recommendations: string[];
  alerts: string[];
}

const sampleCrew: CrewWellbeing[] = [
  {
    id: "1",
    name: "Carlos Silva",
    position: "Comandante",
    vessel: "MV Atlântico Sul",
    fatigueLevel: "low",
    hoursWorked: 42,
    restHours: 56,
    daysOnboard: 14,
    healthScore: 92,
    recommendations: [
      "Manter rotina atual de descanso",
      "Próxima folga programada em 7 dias"
    ],
    alerts: []
  },
  {
    id: "2",
    name: "Maria Santos",
    position: "1º Oficial",
    vessel: "MV Atlântico Sul",
    fatigueLevel: "moderate",
    hoursWorked: 58,
    restHours: 42,
    daysOnboard: 21,
    healthScore: 78,
    recommendations: [
      "Reduzir turnos extras esta semana",
      "Considerar troca de turno para melhor recuperação"
    ],
    alerts: [
      "Horas trabalhadas acima da média semanal"
    ]
  },
  {
    id: "3",
    name: "João Oliveira",
    position: "Engenheiro Chefe",
    vessel: "PSV Oceano Azul",
    fatigueLevel: "high",
    hoursWorked: 72,
    restHours: 28,
    daysOnboard: 28,
    healthScore: 65,
    recommendations: [
      "⚠️ Descanso obrigatório recomendado",
      "Redistribuir tarefas para equipe",
      "Agendar folga antecipada"
    ],
    alerts: [
      "Nível de fadiga elevado detectado",
      "28 dias sem descanso em terra"
    ]
  },
  {
    id: "4",
    name: "Ana Costa",
    position: "Oficial de Segurança",
    vessel: "AHTS Maré Alta",
    fatigueLevel: "critical",
    hoursWorked: 85,
    restHours: 15,
    daysOnboard: 35,
    healthScore: 52,
    recommendations: [
      "🚨 AÇÃO IMEDIATA: Substituição recomendada",
      "Risco de fadiga crítica identificado",
      "Notificar gestão de tripulação"
    ],
    alerts: [
      "CRÍTICO: 35 dias contínuos embarcada",
      "Horas de descanso abaixo do mínimo regulatório",
      "Risco elevado para segurança operacional"
    ]
  }
];

export default function CrewWellbeing() {
  const { toast } = useToast();
  const [crew, setCrew] = useState<CrewWellbeing[]>(sampleCrew);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    toast({ title: "Analisando bem-estar...", description: "IA avaliando indicadores de fadiga" });
    
    await new Promise(r => setTimeout(r, 2000));
    
    toast({ 
      title: "Análise concluída", 
      description: "2 alertas críticos identificados" 
    });
    setIsAnalyzing(false);
  };

  const handleRecommendRealocation = (crewId: string) => {
    toast({ 
      title: "Realocação sugerida", 
      description: "Notificação enviada para gestão de tripulação" 
    });
  };

  const getFatigueColor = (level: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500/10 text-green-600",
      moderate: "bg-amber-500/10 text-amber-600",
      high: "bg-orange-500/10 text-orange-600",
      critical: "bg-red-500/10 text-red-600"
    };
    return colors[level] || colors.low;
  };

  const getFatigueLabel = (level: string) => {
    const labels: Record<string, string> = {
      low: "Baixo",
      moderate: "Moderado",
      high: "Alto",
      critical: "Crítico"
    };
    return labels[level] || "Desconhecido";
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const criticalCount = crew.filter(c => c.fatigueLevel === "critical").length;
  const highCount = crew.filter(c => c.fatigueLevel === "high").length;
  const avgHealth = crew.reduce((acc, c) => acc + c.healthScore, 0) / crew.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/80 to-destructive text-destructive-foreground">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Bem-estar da Tripulação
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Monitored
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Monitoramento de fadiga e saúde com IA preditiva
            </p>
          </div>
        </div>
        <Button onClick={handleAIAnalysis} disabled={isAnalyzing}>
          <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Análise IA
        </Button>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  {criticalCount} tripulante(s) com nível de fadiga CRÍTICO
                </p>
                <p className="text-sm text-red-600 dark:text-red-500">
                  Ação imediata recomendada para garantir segurança operacional
                </p>
              </div>
              <Button variant="destructive" size="sm" className="ml-auto">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Monitorados</p>
                <p className="text-2xl font-bold">{crew.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-red-500" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : ''}`}>
                  {criticalCount}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalCount > 0 ? 'text-red-500' : 'text-gray-300'} opacity-80`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fadiga Alta</p>
                <p className="text-2xl font-bold text-amber-600">{highCount}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Média</p>
                <p className={`text-2xl font-bold ${getHealthColor(avgHealth)}`}>
                  {avgHealth.toFixed(0)}%
                </p>
              </div>
              <Heart className="h-8 w-8 text-pink-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {crew.map(member => (
          <Card 
            key={member.id} 
            className={`overflow-hidden ${member.fatigueLevel === "critical" ? 'border-red-500 shadow-red-100' : member.fatigueLevel === "high" ? 'border-amber-500' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getFatigueColor(member.fatigueLevel)}`}>
                    <span className="font-bold text-lg">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.position} • {member.vessel}</CardDescription>
                  </div>
                </div>
                <Badge className={getFatigueColor(member.fatigueLevel)}>
                  {member.fatigueLevel === "critical" && "🚨 "}
                  {getFatigueLabel(member.fatigueLevel)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-muted/30 rounded">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Horas Trab.</p>
                  <p className="font-bold">{member.hoursWorked}h</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <Moon className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Descanso</p>
                  <p className="font-bold">{member.restHours}h</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <Sun className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Dias a Bordo</p>
                  <p className="font-bold">{member.daysOnboard}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <Heart className="h-4 w-4 mx-auto mb-1 text-pink-500" />
                  <p className="text-xs text-muted-foreground">Saúde</p>
                  <p className={`font-bold ${getHealthColor(member.healthScore)}`}>{member.healthScore}%</p>
                </div>
              </div>

              {/* Health Score Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Índice de Bem-estar</span>
                  <span className={`font-medium ${getHealthColor(member.healthScore)}`}>{member.healthScore}%</span>
                </div>
                <Progress 
                  value={member.healthScore} 
                  className={`h-2 ${member.healthScore >= 80 ? '[&>div]:bg-green-500' : member.healthScore >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
                />
              </div>

              {/* Alerts */}
              {member.alerts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm text-red-700 dark:text-red-400">Alertas</span>
                  </div>
                  <ul className="space-y-1">
                    {member.alerts.map((alert, idx) => (
                      <li key={idx} className="text-sm text-red-600 dark:text-red-400">
                        • {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Recomendações IA</span>
                </div>
                <ul className="space-y-1">
                  {member.recommendations.map((rec, idx) => (
                    <li key={idx} className={`text-sm ${rec.startsWith('⚠️') || rec.startsWith('🚨') ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {!rec.startsWith('⚠️') && !rec.startsWith('🚨') && <CheckCircle2 className="h-3 w-3 inline mr-1 text-green-500" />}
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              {(member.fatigueLevel === "high" || member.fatigueLevel === "critical") && (
                <div className="flex gap-2">
                  <Button 
                    variant={member.fatigueLevel === "critical" ? "destructive" : "outline"}
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleRecommendRealocation(member.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sugerir Realocação
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Histórico
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
