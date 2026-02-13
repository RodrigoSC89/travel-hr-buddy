/**
 * M034 - Fleet Intelligence Panel
 * Cross-voyage benchmarking and fleet performance analytics
 */
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, Ship, TrendingUp, Award, RefreshCw, Loader2, 
  Brain, Fuel, Clock, Target 
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  FleetIntelligenceService, 
  type FleetBenchmark 
} from "@/services/operations/voyage-optimizer.service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function FleetIntelligencePanel() {
  const { toast } = useToast();
  const [benchmarks, setBenchmarks] = useState<FleetBenchmark[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [benchmarkData, analyticsData] = await Promise.all([
        FleetIntelligenceService.getFleetBenchmarks(),
        FleetIntelligenceService.getVoyageAnalytics(),
      ]);
      setBenchmarks(benchmarkData.sort((a, b) => b.avg_tce - a.avg_tce));
      setAnalytics(analyticsData);
    } catch (err) {
      logger.error('Fleet intelligence error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAIBenchmark = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [{
            role: "user",
            content: `Analise o benchmarking da frota e forneça insights acionáveis:

Fleet Benchmarks (${benchmarks.length} navios):
${JSON.stringify(benchmarks.slice(0, 10), null, 2)}

Analytics: ${JSON.stringify(analytics)}

Forneça:
1. Top performers e por quê
2. Navios que precisam de atenção
3. Tendências de TCE e eficiência
4. Recomendações para melhorar performance da frota
5. Best practices identificadas`
          }],
          agentType: "nauti-brain"
        }
      });
      if (error) throw error;
      setAiInsight(data?.choices?.[0]?.message?.content || data?.response || "");
      toast({ title: "🧠 Benchmarking AI concluído" });
    } catch {
      toast({ title: "Erro na análise AI", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const rankColors = ["text-amber-500", "text-slate-400", "text-orange-600"];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={`fleet-intel-skel-${i}`}><CardContent className="p-6 h-20 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Fleet Intelligence
          </h2>
          <p className="text-sm text-muted-foreground">Benchmarking cross-voyage e ranking de performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleAIBenchmark} disabled={aiLoading || benchmarks.length === 0}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
            Análise AI
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Ship className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{benchmarks.length}</p>
            <p className="text-xs text-muted-foreground">Navios na Frota</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSignIcon className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">
              ${benchmarks.length > 0 ? Math.round(benchmarks.reduce((s, b) => s + b.avg_tce, 0) / benchmarks.length).toLocaleString() : 0}
            </p>
            <p className="text-xs text-muted-foreground">TCE Médio ($/dia)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Fuel className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">
              {benchmarks.length > 0 ? (benchmarks.reduce((s, b) => s + b.avg_fuel_efficiency, 0) / benchmarks.length).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Eficiência Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{analytics?.total_simulations || 0}</p>
            <p className="text-xs text-muted-foreground">Simulações</p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Performance Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {benchmarks.map((vessel, i) => (
            <motion.div
              key={vessel.vessel_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors"
            >
              <span className={`w-6 text-center font-bold ${i < 3 ? rankColors[i] : "text-muted-foreground"}`}>
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{vessel.vessel_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{vessel.total_voyages} viagens</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{vessel.avg_utilization}% utilização</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>Eficiência</span>
                    <span>{vessel.avg_fuel_efficiency}%</span>
                  </div>
                  <Progress value={vessel.avg_fuel_efficiency} className="h-1.5" />
                </div>
                <Badge variant="outline" className="font-mono">
                  ${vessel.avg_tce.toLocaleString()}/d
                </Badge>
              </div>
            </motion.div>
          ))}

          {benchmarks.length === 0 && (
            <div className="text-center p-6 text-muted-foreground text-sm">
              <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma embarcação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insight */}
      {aiInsight && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Fleet Intelligence AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{aiInsight}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return <TrendingUp {...props} />;
}
