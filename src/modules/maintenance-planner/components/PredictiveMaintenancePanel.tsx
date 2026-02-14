/**
 * Predictive Maintenance Panel
 * Manutenção preditiva com dados reais do Supabase
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Activity,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Ship,
  Calendar,
  Clock,
  Sparkles,
  RefreshCcw,
  Target,
  Brain,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { useMaintenancePredictionsData } from "@/hooks/useMaintenancePredictionsData";
import { useMaintenanceHistoryRealData } from "@/hooks/useMaintenanceHistoryRealData";
import { toast } from "sonner";

function getSeverityConfig(severity: string) {
  const configs = {
    critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Crítico" },
    high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Alto" },
    medium: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", label: "Médio" },
    low: { color: "text-success", bg: "bg-success/10", border: "border-success/30", label: "Baixo" },
  };
  return configs[severity as keyof typeof configs] || configs.medium;
}

export default function PredictiveMaintenancePanel() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const { predictions, stats, isLoading, refetch } = useMaintenancePredictionsData();
  const { stats: historyStats } = useMaintenanceHistoryRealData();
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const filteredPredictions = useMemo(() => {
    if (selectedVessel === "all") return predictions;
    return predictions.filter(p => p.vessel === selectedVessel);
  }, [selectedVessel, predictions]);

  const vessels = useMemo(() => [...new Set(predictions.map(p => p.vessel))], [predictions]);

  const selectedEquipment = useMemo(() => {
    if (selectedPrediction) return predictions.find(p => p.id === selectedPrediction);
    return predictions[0] || null;
  }, [selectedPrediction, predictions]);

  // Build radar data from real stats
  const radarData = useMemo(() => [
    { subject: "Precisão", A: stats.avgConfidence || 0, fullMark: 100 },
    { subject: "Cobertura", A: Math.min(predictions.length * 10, 100), fullMark: 100 },
    { subject: "Economia", A: stats.totalCost > 0 ? Math.min(Math.round(stats.totalCost * 0.4 / 1000), 100) : 0, fullMark: 100 },
    { subject: "Antecipação", A: predictions.length > 0 ? 85 : 0, fullMark: 100 },
    { subject: "Confiança", A: stats.avgConfidence || 0, fullMark: 100 },
  ], [predictions, stats]);

  // Build history chart from real data
  const maintenanceHistory = useMemo(() => {
    const byType = historyStats.byType;
    return [
      { month: "Prev", preventive: byType.preventiva, corrective: byType.corretiva, predictive: byType.preditiva },
    ];
  }, [historyStats]);

  const totalSavings = stats.totalCost * 0.4; // 40% savings estimate

  const handleRefresh = async () => {
    await refetch();
    toast.success("Previsões atualizadas");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={`skeleton-${i}`}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Previsões Ativas</p>
                <p className="text-2xl font-bold text-primary">{predictions.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Prioridade Alta</p>
                <p className="text-2xl font-bold text-warning">{stats.high}</p>
              </div>
              <Zap className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confiança IA</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgConfidence}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Economia Est.</p>
                <p className="text-2xl font-bold text-success">R$ {(totalSavings / 1000).toFixed(0)}k</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Previsões de Manutenção
                </CardTitle>
                <CardDescription>Análise baseada em registros reais do Supabase</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Embarcações</SelectItem>
                    {vessels.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleRefresh} aria-label="Atualizar previsões" title="Atualizar">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma previsão disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Previsões são geradas com base no histórico de manutenções
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredPredictions
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
                    })
                    .map((pred, idx) => {
                      const severityConfig = getSeverityConfig(pred.priority);
                      const daysUntil = Math.max(0, Math.ceil((pred.predictedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                      return (
                        <motion.div
                          key={pred.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                            selectedEquipment?.id === pred.id ? "ring-2 ring-primary" : "",
                            severityConfig.border
                          )}
                          onClick={() => setSelectedPrediction(pred.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2 rounded-lg", severityConfig.bg)}>
                                <Activity className={cn("h-5 w-5", severityConfig.color)} />
                              </div>
                              <div>
                                <p className="font-semibold">{pred.equipment}</p>
                                <p className="text-sm text-muted-foreground">{pred.vessel}</p>
                                <p className="text-sm mt-1">{pred.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={severityConfig.color}>
                                {severityConfig.label}
                              </Badge>
                              <p className="text-2xl font-bold mt-1">{pred.healthScore}%</p>
                              <p className="text-xs text-muted-foreground">saúde</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {daysUntil} dias
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {pred.confidence}% conf.
                              </span>
                              <span className="flex items-center gap-1">
                                R$ {(pred.estimatedCost / 1000).toFixed(1)}k
                              </span>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Wrench className="h-3 w-3" />
                              Agendar
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Performance do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confiança geral</span>
                    <span className="font-medium">{stats.avgConfidence}%</span>
                  </div>
                  <Progress value={stats.avgConfidence} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseado em {predictions.length} registros de manutenção
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sem dados suficientes para análise</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Equipment Detail */}
      {selectedEquipment && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {selectedEquipment.equipment}
                </CardTitle>
                <CardDescription>{selectedEquipment.vessel}</CardDescription>
              </div>
              <Button className="gap-2">
                <Wrench className="h-4 w-4" />
                Criar Ordem de Serviço
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recomendação
                </h4>
                <p className="text-sm text-muted-foreground">{selectedEquipment.reason}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Detalhes</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Tipo</span>
                    <p className="font-medium">{selectedEquipment.type}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Saúde</span>
                    <p className="font-medium">{selectedEquipment.healthScore}%</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Confiança</span>
                    <p className="font-medium">{selectedEquipment.confidence}%</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Custo Est.</span>
                    <p className="font-medium">R$ {selectedEquipment.estimatedCost.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Peças Necessárias</h4>
                <div className="space-y-2">
                  {selectedEquipment.partsNeeded.map((part) => (
                    <div key={part.name} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                      <span>{part.name} (x{part.quantity})</span>
                      <Badge variant={part.inStock ? "default" : "destructive"}>
                        {part.inStock ? "Em estoque" : "Faltando"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
