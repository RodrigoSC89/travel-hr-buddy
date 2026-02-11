/**
 * 🔮 Predictive Audit Dashboard
 * AI-powered audit prediction and analysis
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, AlertTriangle, CheckCircle2, Clock, TrendingUp, 
  Target, Shield, Activity, Zap, ChevronRight, Sparkles,
  BarChart3, PieChart, Calendar, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePredictiveAudit, useAuditAnalytics, AuditPrediction, PredictedIssue, RecommendedAction } from "../hooks/usePredictiveAudit";
import { cn } from "@/lib/utils";

const AUDIT_TYPES = [
  { value: "ISM", label: "ISM Code Audit" },
  { value: "ISPS", label: "ISPS Security Audit" },
  { value: "MLC", label: "MLC 2006 Inspection" },
  { value: "PSC", label: "Port State Control" },
  { value: "SIRE", label: "SIRE Inspection" },
  { value: "CDI", label: "CDI Inspection" },
  { value: "INTERNAL", label: "Internal Audit" },
];

export function PredictiveAuditDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  
  const { predictAudit, isPredicting, prediction } = usePredictiveAudit();
  const { data: analytics, isLoading: analyticsLoading } = useAuditAnalytics();

  const handlePredict = () => {
    if (selectedVessel && selectedType) {
      predictAudit({ vesselId: selectedVessel, auditType: selectedType });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
            <Brain className="h-8 w-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Auditoria Preditiva com IA
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                World-Class
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Preveja resultados de auditorias antes que aconteçam
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Controls */}
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent-foreground" />
            Iniciar Análise Preditiva
          </CardTitle>
          <CardDescription>
            Selecione a embarcação e tipo de auditoria para predição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vessel-1">MV Atlantic Star</SelectItem>
                <SelectItem value="vessel-2">MV Pacific Dream</SelectItem>
                <SelectItem value="vessel-3">MV Ocean Spirit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de auditoria" />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handlePredict}
              disabled={!selectedVessel || !selectedType || isPredicting}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {isPredicting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Prever Auditoria
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      <AnimatePresence mode="wait">
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Risk Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <RiskCard 
                riskLevel={prediction.riskLevel}
                score={prediction.overallScore}
              />
              <StatCard
                title="Confiança da IA"
                value={`${prediction.confidence}%`}
                icon={Brain}
                color="purple"
                subtitle={prediction.aiConsensus ? "Consenso Multi-IA" : "Análise Única"}
              />
              <StatCard
                title="Problemas Previstos"
                value={prediction.predictedIssues.length.toString()}
                icon={AlertTriangle}
                color="orange"
                subtitle="Itens de atenção"
              />
              <StatCard
                title="Ações Recomendadas"
                value={prediction.recommendedActions.length.toString()}
                icon={CheckCircle2}
                color="green"
                subtitle="Para mitigar riscos"
              />
            </div>

            {/* Predicted Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Problemas Previstos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prediction.predictedIssues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                  ))}
                  {prediction.predictedIssues.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                      <p>Nenhum problema significativo previsto</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-success" />
                  Ações Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prediction.recommendedActions.map((action, index) => (
                    <ActionCard key={index} action={action} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historical Patterns */}
            {prediction.historicalPatterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Padrões Históricos Identificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prediction.historicalPatterns.map((pattern, index) => (
                      <PatternCard key={index} pattern={pattern} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Overview */}
      {!prediction && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Auditorias"
            value={analytics.totalAudits.toString()}
            icon={BarChart3}
            color="blue"
            subtitle="Histórico completo"
          />
          <StatCard
            title="Score Médio"
            value={`${analytics.averageScore}%`}
            icon={Target}
            color="green"
            subtitle="Todas as auditorias"
          />
          <StatCard
            title="Tipos de Auditoria"
            value={analytics.byType.length.toString()}
            icon={PieChart}
            color="purple"
            subtitle="Categorias"
          />
          <StatCard
            title="Última Auditoria"
            value={analytics.trend[0]?.date ? 
              new Date(analytics.trend[0].date).toLocaleDateString('pt-BR') : 
              'N/A'
            }
            icon={Calendar}
            color="orange"
            subtitle={analytics.trend[0]?.type || ''}
          />
        </div>
      )}
    </div>
  );
}

// Sub-components
function RiskCard({ riskLevel, score }: { riskLevel: string; score: number }) {
  const config = {
    low: { color: "green", bg: "from-green-500/20 to-emerald-500/20", text: "Baixo" },
    medium: { color: "yellow", bg: "from-yellow-500/20 to-amber-500/20", text: "Médio" },
    high: { color: "orange", bg: "from-orange-500/20 to-red-500/20", text: "Alto" },
    critical: { color: "red", bg: "from-red-500/20 to-rose-500/20", text: "Crítico" },
  }[riskLevel] || { color: "gray", bg: "from-gray-500/20 to-slate-500/20", text: "N/A" };

  return (
    <Card className={cn("bg-gradient-to-br", config.bg)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nível de Risco</p>
            <p className="text-3xl font-bold">{config.text}</p>
          </div>
          <Shield className={cn("h-12 w-12", `text-${config.color}-400`)} />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Score Previsto</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={cn("p-3 rounded-lg", `bg-${color}-500/20`)}>
            <Icon className={cn("h-6 w-6", `text-${color}-400`)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueCard({ issue }: { issue: PredictedIssue }) {
  const severityConfig = {
    low: { color: "green", label: "Baixa" },
    medium: { color: "yellow", label: "Média" },
    high: { color: "orange", label: "Alta" },
    critical: { color: "red", label: "Crítica" },
  }[issue.severity];

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
      <div className={cn(
        "p-2 rounded-full",
        `bg-${severityConfig.color}-500/20`
      )}>
        <AlertTriangle className={cn("h-5 w-5", `text-${severityConfig.color}-400`)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{issue.area}</h4>
          <Badge variant="outline" className={cn(`border-${severityConfig.color}-400`)}>
            {severityConfig.label}
          </Badge>
          <Badge variant="secondary">
            {issue.probability}% probabilidade
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{issue.description}</p>
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: RecommendedAction }) {
  const priorityConfig = {
    low: { color: "green", label: "Baixa" },
    medium: { color: "yellow", label: "Média" },
    high: { color: "orange", label: "Alta" },
    urgent: { color: "red", label: "Urgente" },
  }[action.priority];

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <div className={cn(
        "p-2 rounded-full",
        `bg-${priorityConfig.color}-500/20`
      )}>
        <Zap className={cn("h-5 w-5", `text-${priorityConfig.color}-400`)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{action.action}</h4>
          <Badge className={cn(`bg-${priorityConfig.color}-500`)}>
            {priorityConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{action.estimatedImpact}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(action.deadline).toLocaleDateString('pt-BR')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {action.responsible}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: { description: string; occurrences: number; trend: string } }) {
  const trendConfig = {
    improving: { color: "green", icon: TrendingUp, label: "Melhorando" },
    stable: { color: "blue", icon: Activity, label: "Estável" },
    worsening: { color: "red", icon: TrendingUp, label: "Piorando" },
  }[pattern.trend] || { color: "gray", icon: Activity, label: "N/A" };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <trendConfig.icon className={cn("h-4 w-4", `text-${trendConfig.color}-400`)} />
          <Badge variant="outline">{trendConfig.label}</Badge>
        </div>
        <p className="text-sm">{pattern.description}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {pattern.occurrences} ocorrências identificadas
        </p>
      </CardContent>
    </Card>
  );
}

export default PredictiveAuditDashboard;
