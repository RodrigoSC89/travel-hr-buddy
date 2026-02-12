/**
 * Fleet Pulse Dashboard - World-class unified fleet overview
 * Real-time vessel status, health scores, AI fleet analysis, and next events
 */
import { useState } from "react";
import { useFleetPulse, FleetPulseVessel } from "@/hooks/useFleetPulse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, AlertTriangle, CheckCircle, Activity, RefreshCw, Search, Users, Wrench, Shield, Heart, Brain, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  moderate: "bg-warning/10 text-warning border-warning/30",
  high: "bg-warning/10 text-warning border-warning/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusEmoji: Record<string, string> = {
  Navegando: "🚢",
  "Em Porto": "⚓",
  "Em Manutenção": "🔧",
  "Em Ancoragem": "🏗️",
  unknown: "❓",
};

function ScoreRing({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) {
  const color = score >= 85 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="3" />
          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className={color} strokeWidth="3" strokeDasharray={`${score}, 100`} />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{score}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function VesselCard({ vessel }: { vessel: FleetPulseVessel }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: vessel.riskLevel === "low" ? "#10b981" : vessel.riskLevel === "moderate" ? "#f59e0b" : "#ef4444" }}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">{vessel.name}</h3>
              <p className="text-xs text-muted-foreground">{vessel.vessel_type || "Vessel"} • {vessel.flag || "N/A"}</p>
            </div>
            <Badge variant="outline" className={riskColors[vessel.riskLevel]}>
              {vessel.riskLevel.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{statusEmoji[vessel.currentActivity] || "🚢"}</span>
            <span className="text-xs font-medium">{vessel.currentActivity}</span>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> {vessel.crewCount}
              <Wrench className="h-3 w-3 ml-1" /> {vessel.pendingTasks}
            </div>
          </div>

          <div className="flex justify-between mb-3">
            <ScoreRing score={vessel.maintenanceScore} label="Maint" icon={Wrench} />
            <ScoreRing score={vessel.complianceScore} label="Compl" icon={Shield} />
            <ScoreRing score={vessel.crewScore} label="Crew" icon={Users} />
            <ScoreRing score={vessel.safetyScore} label="Safety" icon={Heart} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Health Score</span>
                <span className="font-bold">{vessel.healthScore}%</span>
              </div>
              <Progress value={vessel.healthScore} className="h-2" />
            </div>
          </div>

          {vessel.nextEvent && (
            <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
              <span className="font-medium">Próximo: </span>
              {vessel.nextEvent.type} — {vessel.nextEvent.description}
            </div>
          )}

          {vessel.alerts.length > 0 && (
            <div className="mt-2 space-y-1">
              {vessel.alerts.map((alert) => (
                <div key={alert.message} className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FleetPulseDashboard() {
  const { vessels, isLoading, stats, refetch } = useFleetPulse();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const runFleetAI = async () => {
    setAiLoading(true);
    try {
      const fleetSummary = vessels.map(v => ({
        name: v.name,
        type: v.vessel_type,
        health: v.healthScore,
        maintenance: v.maintenanceScore,
        compliance: v.complianceScore,
        crew: v.crewScore,
        safety: v.safetyScore,
        risk: v.riskLevel,
        activity: v.currentActivity,
        alerts: v.alerts.length,
        pendingTasks: v.pendingTasks,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Analise o Fleet Pulse da frota e forneça recomendações operacionais priorizadas:
              
Fleet Summary (${vessels.length} embarcações):
${JSON.stringify(fleetSummary, null, 2)}

Stats: ${stats.total} total, ${stats.active} ativos, ${stats.atRisk} em risco, ${stats.avgHealth}% health médio

Forneça:
1. Diagnóstico geral da frota (1 parágrafo)
2. Top 3 ações prioritárias
3. Embarcações que requerem atenção imediata
4. Previsão de riscos para os próximos 30 dias`
            }
          ],
          agentType: 'nauti-brain'
        }
      });

      if (error) throw error;
      const content = data?.choices?.[0]?.message?.content || data?.response || "Análise não disponível";
      setAiAnalysis(content);
      toast({ title: '🧠 Análise Fleet Pulse concluída' });
    } catch (err) {
      logger.error('Fleet AI error', err as Error);
      toast({ title: 'Erro na análise AI', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = vessels.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || v.riskLevel === filter || (filter === "active" && (v.status === "active" || v.status === "operational"));
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* KPI Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Ship className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Frota</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{stats.active}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold">{stats.atRisk}</p><p className="text-xs text-muted-foreground">Em Risco</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.avgHealth}%</p><p className="text-xs text-muted-foreground">Health Médio</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar embarcação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="high">Alto Risco</TabsTrigger>
            <TabsTrigger value="critical">Crítico</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
        <Button size="sm" onClick={runFleetAI} disabled={aiLoading || vessels.length === 0}>
          {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
          Análise AI
        </Button>
      </div>

      {/* AI Fleet Analysis */}
      {aiAnalysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Análise Fleet Pulse — Gemini AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fleet Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-4 h-48 animate-pulse bg-muted/50" /></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Ship className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma embarcação encontrada</p></CardContent></Card>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => <VesselCard key={v.id} vessel={v} />)}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
