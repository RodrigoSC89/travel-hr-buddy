/**
 * DP Analytics Dashboard - Predictive compliance and system health
 * PATCH 549 - Advanced Maritime Intelligence
 */

import { useEffect, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Shield,
  RefreshCw,
  BarChart3,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemHealth {
  id: string;
  name: string;
  health: number;
  trend: "up" | "down" | "stable";
  lastMaintenance: string;
  nextMaintenance: string;
  predictedIssue?: string;
  riskLevel: "low" | "medium" | "high";
}

interface ComplianceMetric {
  category: string;
  score: number;
  target: number;
  trend: "improving" | "declining" | "stable";
  issues: number;
}

interface AIInsight {
  type: "prediction" | "recommendation" | "alert";
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

const generateSystemHealth = (): SystemHealth[] => [
  {
    id: "thruster-bow",
    name: "Bow Thruster",
    health: 92,
    trend: "stable",
    lastMaintenance: "2024-11-15",
    nextMaintenance: "2025-02-15",
    riskLevel: "low"
  },
  {
    id: "thruster-stern",
    name: "Stern Thruster",
    health: 78,
    trend: "down",
    lastMaintenance: "2024-10-20",
    nextMaintenance: "2025-01-20",
    predictedIssue: "Desgaste de selo hidráulico detectado",
    riskLevel: "medium"
  },
  {
    id: "dgps-1",
    name: "DGPS Primary",
    health: 98,
    trend: "stable",
    lastMaintenance: "2024-12-01",
    nextMaintenance: "2025-06-01",
    riskLevel: "low"
  },
  {
    id: "dgps-2",
    name: "DGPS Secondary",
    health: 95,
    trend: "stable",
    lastMaintenance: "2024-12-01",
    nextMaintenance: "2025-06-01",
    riskLevel: "low"
  },
  {
    id: "gyro-1",
    name: "Gyrocompass #1",
    health: 85,
    trend: "down",
    lastMaintenance: "2024-09-10",
    nextMaintenance: "2025-03-10",
    predictedIssue: "Drift aumentando gradualmente",
    riskLevel: "medium"
  },
  {
    id: "hpu",
    name: "HPU Main",
    health: 65,
    trend: "down",
    lastMaintenance: "2024-08-01",
    nextMaintenance: "2024-12-15",
    predictedIssue: "Filtro de óleo próximo da saturação",
    riskLevel: "high"
  },
  {
    id: "ups",
    name: "UPS System",
    health: 88,
    trend: "stable",
    lastMaintenance: "2024-11-01",
    nextMaintenance: "2025-05-01",
    riskLevel: "low"
  },
  {
    id: "vms",
    name: "Vessel Management System",
    health: 100,
    trend: "up",
    lastMaintenance: "2024-12-01",
    nextMaintenance: "2025-12-01",
    riskLevel: "low"
  }
];

const generateComplianceMetrics = (): ComplianceMetric[] => [
  { category: "NORMAM-101", score: 94, target: 95, trend: "improving", issues: 2 },
  { category: "IMCA M 117", score: 92, target: 90, trend: "stable", issues: 3 },
  { category: "ASOG Compliance", score: 98, target: 100, trend: "stable", issues: 1 },
  { category: "Maintenance Schedule", score: 85, target: 95, trend: "declining", issues: 5 },
  { category: "Training Currency", score: 96, target: 95, trend: "improving", issues: 1 },
  { category: "Documentation", score: 88, target: 90, trend: "improving", issues: 4 }
];

const generateAIInsights = (): AIInsight[] => [
  {
    type: "prediction",
    title: "Manutenção HPU Crítica em 5 dias",
    description: "Baseado no padrão de degradação do filtro de óleo, recomendamos manutenção preventiva antes da próxima operação DP crítica.",
    confidence: 89,
    action: "Agendar manutenção"
  },
  {
    type: "recommendation",
    title: "Otimização de Redundância",
    description: "Análise indica que configurar DGPS terciário durante operações em águas profundas aumentaria confiabilidade em 12%.",
    confidence: 78,
    action: "Ver análise"
  },
  {
    type: "alert",
    title: "Gyrocompass drift acima do normal",
    description: "Gyro #1 apresenta drift de 0.3°/hora, acima do limite de 0.2°/hora. Calibração recomendada.",
    confidence: 95,
    action: "Criar OS"
  },
  {
    type: "prediction",
    title: "Score IMCA pode cair para 88% em 30 dias",
    description: "Sem ação corretiva nos itens pendentes, projeção indica queda de compliance.",
    confidence: 72,
    action: "Ver pendências"
  }
];

export default function DPAnalyticsDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [compliance, setCompliance] = useState<ComplianceMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSystemHealth(generateSystemHealth());
    setCompliance(generateComplianceMetrics());
    setInsights(generateAIInsights());
    setIsLoading(false);
  };

  const overallHealth = systemHealth.length > 0
    ? systemHealth.reduce((acc, s) => acc + s.health, 0) / systemHealth.length
    : 0;

  const overallCompliance = compliance.length > 0
    ? compliance.reduce((acc, c) => acc + c.score, 0) / compliance.length
    : 0;

  const criticalSystems = systemHealth.filter(s => s.riskLevel === "high");
  const predictedIssues = systemHealth.filter(s => s.predictedIssue);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral DP</p>
                <p className={`text-2xl font-bold ${overallHealth >= 85 ? "text-green-500" : overallHealth >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                  {overallHealth.toFixed(0)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
            <Progress value={overallHealth} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Médio</p>
                <p className={`text-2xl font-bold ${overallCompliance >= 90 ? "text-green-500" : overallCompliance >= 80 ? "text-yellow-500" : "text-red-500"}`}>
                  {overallCompliance.toFixed(0)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <Progress value={overallCompliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className={criticalSystems.length > 0 ? "border-red-500/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistemas Críticos</p>
                <p className={`text-2xl font-bold ${criticalSystems.length > 0 ? "text-red-500" : "text-green-500"}`}>
                  {criticalSystems.length}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalSystems.length > 0 ? "text-red-500" : "text-muted-foreground"} opacity-50`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previsões IA</p>
                <p className="text-2xl font-bold">{predictedIssues.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Insights Preditivos da IA
          </CardTitle>
          <CardDescription>
            Análise preditiva baseada em dados históricos e padrões de falha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  insight.type === "alert" ? "bg-red-500/10 border-red-500/30" :
                    insight.type === "prediction" ? "bg-purple-500/10 border-purple-500/30" :
                      "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.type === "alert" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {insight.type === "prediction" && <TrendingUp className="h-4 w-4 text-purple-500" />}
                    {insight.type === "recommendation" && <Zap className="h-4 w-4 text-blue-500" />}
                    <span className="font-medium text-sm">{insight.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% conf.
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{insight.description}</p>
                {insight.action && (
                  <Button variant="outline" size="sm" className="w-full">
                    {insight.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Saúde dos Sistemas DP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map(system => (
                <div key={system.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{system.name}</span>
                      {system.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {system.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    </div>
                    <Badge variant={
                      system.riskLevel === "low" ? "outline" :
                        system.riskLevel === "medium" ? "secondary" : "destructive"
                    }>
                      {system.health}%
                    </Badge>
                  </div>
                  <Progress value={system.health} className="h-1.5 mb-2" />
                  {system.predictedIssue && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      {system.predictedIssue}
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Última: {new Date(system.lastMaintenance).toLocaleDateString("pt-BR")}</span>
                    <span>Próxima: {new Date(system.nextMaintenance).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas de Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {compliance.map((metric, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{metric.category}</span>
                      {metric.trend === "improving" && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {metric.trend === "declining" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.issues > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {metric.issues} pendências
                        </Badge>
                      )}
                      <span className={`text-sm font-bold ${
                        metric.score >= metric.target ? "text-green-500" : "text-amber-500"
                      }`}>
                        {metric.score}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-muted-foreground/30"
                      style={{ width: `${metric.target}%` }}
                    />
                    <div
                      className={`absolute h-full ${metric.score >= metric.target ? "bg-green-500" : "bg-amber-500"}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Meta: {metric.target}%</span>
                    <span className={metric.score >= metric.target ? "text-green-500" : "text-amber-500"}>
                      {metric.score >= metric.target ? "✓ Atingido" : `${metric.target - metric.score}% faltando`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
