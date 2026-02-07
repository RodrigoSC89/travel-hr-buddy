/**
 * Crew Wellbeing Dashboard - Burnout prediction & wellness tracking with AI
 */
import { useState } from "react";
import { useCrewWellbeing, WellbeingScore } from "@/hooks/useCrewWellbeing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, AlertTriangle, RefreshCw, Save, Brain, Clock, Shield, Activity, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const fatigueColors: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  moderate: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  critical: "bg-red-500/10 text-red-600 border-red-500/30",
};

const fatigueLabels: Record<string, string> = {
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  critical: "Crítico",
};

function MiniScore({ value, label, icon: Icon }: { value: number; label: string; icon: any }) {
  const color = value >= 80 ? "text-emerald-500" : value >= 60 ? "text-amber-500" : "text-red-500";
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
        <Icon className="h-3 w-3" /> {label}
      </div>
    </div>
  );
}

export function CrewWellbeingDashboard() {
  const { scores, isLoading, atRiskCrew, saveScores, refetch, stats } = useCrewWellbeing();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const runAIAnalysis = async () => {
    if (scores.length === 0) return;
    setAiLoading(true);
    try {
      const crewSummary = scores.slice(0, 20).map(s => ({
        name: s.crew_name,
        rank: s.crew_rank,
        vessel: s.vessel_name,
        score: s.overall_score,
        fatigue: s.fatigue_risk_level,
        rest: s.rest_hours_score,
        burnoutDays: s.burnout_prediction_days,
      }));

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `Analise o bem-estar da tripulação e forneça recomendações de ação:\n\nResumo: ${stats.total} tripulantes, Score médio: ${stats.avgScore}%, Críticos: ${stats.critical}, Altos: ${stats.high}\n\nDados: ${JSON.stringify(crewSummary)}\n\nForneça:\n1. Avaliação geral de saúde da tripulação\n2. Padrões de risco identificados\n3. Ações prioritárias imediatas\n4. Recomendações MLC 2006 de compliance\n5. Plano preventivo para próximos 30 dias`
          }],
          agentId: "crew",
        },
      });

      if (error) throw error;
      setAiAnalysis(data?.response || data?.choices?.[0]?.message?.content || "Análise indisponível");
      toast.success("Análise AI de bem-estar concluída");
    } catch (err) {
      console.error("AI analysis error:", err);
      toast.error("Erro ao gerar análise AI");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.avgScore}%</p><p className="text-xs text-muted-foreground">Score Médio</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Activity className="h-5 w-5 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Tripulantes Ativos</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
            <div><p className="text-2xl font-bold">{stats.critical}</p><p className="text-xs text-muted-foreground">Risco Crítico</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10"><TrendingDown className="h-5 w-5 text-orange-500" /></div>
            <div><p className="text-2xl font-bold">{stats.high}</p><p className="text-xs text-muted-foreground">Risco Alto</p></div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Alert */}
      {atRiskCrew.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {atRiskCrew.length} tripulante(s) com risco de burnout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atRiskCrew.slice(0, 5).map(crew => (
              <div key={crew.crew_member_id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{crew.crew_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{crew.crew_rank} • {crew.vessel_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {crew.burnout_prediction_days && (
                    <span className="text-xs text-red-600 font-medium">
                      ~{crew.burnout_prediction_days} dias p/ burnout
                    </span>
                  )}
                  <Badge variant="outline" className={fatigueColors[crew.fatigue_risk_level]}>
                    {fatigueLabels[crew.fatigue_risk_level]}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Recalcular
        </Button>
        <Button size="sm" onClick={() => saveScores.mutate()} disabled={saveScores.isPending}>
          <Save className="h-4 w-4 mr-1" /> Salvar Scores
        </Button>
        <Button size="sm" variant="secondary" onClick={runAIAnalysis} disabled={aiLoading || scores.length === 0}>
          {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Análise AI de Bem-Estar
        </Button>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Brain className="h-4 w-4" />
                Análise AI — Saúde da Tripulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{aiAnalysis}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Crew Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tripulante</TableHead>
                  <TableHead>Embarcação</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Descanso</TableHead>
                  <TableHead className="text-center">Tempo Bordo</TableHead>
                  <TableHead className="text-center">Saúde</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                  <TableHead>Fadiga</TableHead>
                  <TableHead>Recomendações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Carregando...</TableCell></TableRow>
                ) : scores.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum tripulante ativo</TableCell></TableRow>
                ) : (
                  scores.map((score, i) => (
                    <motion.tr key={score.crew_member_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b">
                      <TableCell>
                        <div className="font-medium text-sm">{score.crew_name}</div>
                        <div className="text-xs text-muted-foreground">{score.crew_rank}</div>
                      </TableCell>
                      <TableCell className="text-xs">{score.vessel_name || "—"}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${score.overall_score >= 80 ? "text-emerald-600" : score.overall_score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                          {score.overall_score}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs">{score.rest_hours_score}</TableCell>
                      <TableCell className="text-center text-xs">{score.time_onboard_score}</TableCell>
                      <TableCell className="text-center text-xs">{score.medical_score}</TableCell>
                      <TableCell className="text-center text-xs">{score.performance_score}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${fatigueColors[score.fatigue_risk_level]}`}>
                          {fatigueLabels[score.fatigue_risk_level]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {score.recommendations.length > 0 ? (
                          <div className="text-xs text-muted-foreground truncate">{score.recommendations[0]}</div>
                        ) : (
                          <span className="text-xs text-emerald-600">✓ OK</span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
