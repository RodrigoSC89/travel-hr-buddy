/**
 * Operations Command Center - Tab Content Components
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  Ship, Users, Activity, BarChart3, Navigation, Gauge, AlertCircle,
  Brain, CheckCircle2, Bell, Fuel, Anchor, ArrowUpRight, ArrowDownRight,
  Sparkles, ShieldCheck, Lightbulb, AlertTriangle, DollarSign,
  PieChart, TrendingUp, Zap, Eye, Play, Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AreaChart, Area, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { OperationsData, Insight } from "./types";
import { CHART_COLORS, stagger, tabFade, trends } from "./types";

// ─── Overview Tab ────────────────────────────────
interface OverviewTabProps {
  performanceData: { day: string; efficiency: number; fuel: number; voyages: number }[];
  vesselDistribution: { name: string; value: number; color: string }[];
  businessKpis: { title: string; value: string; change: string; trend: string; icon: React.ElementType }[];
}

export function OverviewTab({ performanceData, vesselDistribution, businessKpis }: OverviewTabProps) {
  return (
    <motion.div {...tabFade} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PremiumCard glowColor="cyan" delay={0}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Performance Semanal</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="gradEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradVoy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                <Legend />
                <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-1))" fill="url(#gradEff)" strokeWidth={2.5} name="Eficiência (%)" />
                <Area type="monotone" dataKey="voyages" stroke="hsl(var(--chart-2))" fill="url(#gradVoy)" strokeWidth={2.5} name="Viagens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard glowColor="primary" delay={1}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Distribuição da Frota</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={vesselDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {vesselDistribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      <PremiumCard glowColor="success" delay={2}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="font-semibold">Indicadores de Negócio</h3>
        </div>
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessKpis.map((kpi) => (
            <motion.div key={kpi.title} variants={stagger.item} whileHover={{ scale: 1.02 }} className="p-4 rounded-xl bg-muted/40 border border-border/30 transition-colors hover:bg-muted/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                    <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>{kpi.change}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/5"><kpi.icon className="h-5 w-5 text-primary/70" /></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </PremiumCard>
    </motion.div>
  );
}

// ─── Operations Tab ────────────────────────────────
interface OperationsTabProps { data: OperationsData; }

export function OperationsTab({ data }: OperationsTabProps) {
  const cards = [
    { label: "Em Operação", value: data.vesselsInOperation, icon: Navigation, glow: "cyan" as const, sub: "Embarcações navegando" },
    { label: "No Porto", value: data.vesselsAtPort, icon: Anchor, glow: "success" as const, sub: "Embarcações atracadas" },
    { label: "Manutenção", value: data.vesselsInMaintenance, icon: Gauge, glow: "warning" as const, sub: "Em manutenção" },
  ];
  const statusItems = [
    { label: "Alertas Ativos", value: data.activeAlerts, icon: Bell, bg: "bg-destructive/5 border-destructive/10" },
    { label: "Manutenções Pendentes", value: data.maintenancePending, icon: Gauge, bg: "bg-warning/5 border-warning/10" },
    { label: "Consumo Combustível", value: data.fuelConsumption, icon: Fuel, bg: "bg-primary/5 border-primary/10", suffix: "L" },
  ];

  return (
    <motion.div {...tabFade} className="space-y-4">
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((item, idx) => (
          <motion.div key={item.label} variants={stagger.item}>
            <PremiumCard glowColor={item.glow} delay={idx}>
              <div className="flex items-center gap-2 mb-3"><item.icon className="h-5 w-5 text-primary" /><h3 className="font-semibold text-sm">{item.label}</h3></div>
              <p className="text-4xl font-bold tracking-tight"><AnimatedCounter value={item.value} /></p>
              <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
              <Progress value={(item.value / (data.totalVessels || 1)) * 100} className="h-1.5 mt-4" />
            </PremiumCard>
          </motion.div>
        ))}
      </motion.div>
      <PremiumCard glowColor="warning" delay={3}>
        <div className="flex items-center gap-2 mb-4"><AlertCircle className="h-5 w-5 text-warning" /><h3 className="font-semibold">Status Operacional</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusItems.map(item => (
            <motion.div key={item.label} whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border ${item.bg} transition-all`}>
              <div className="flex items-center gap-2 mb-2"><item.icon className="h-4 w-4 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">{item.label}</span></div>
              <p className="text-2xl font-bold"><AnimatedCounter value={item.value} />{"suffix" in item && <span className="text-sm text-muted-foreground ml-0.5">{(item as { suffix: string }).suffix}</span>}</p>
            </motion.div>
          ))}
        </div>
      </PremiumCard>
    </motion.div>
  );
}

// ─── Insights Tab ────────────────────────────────
interface InsightsTabProps {
  insights: Insight[];
  onAnalyze: (insight: Insight) => void;
  onImplement: (insight: Insight) => void;
}

export function InsightsTab({ insights, onAnalyze, onImplement }: InsightsTabProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <Lightbulb className="h-5 w-5 text-warning" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-success" />;
      default: return <Activity className="h-5 w-5 text-primary" />;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case "in_progress": return <Badge className="bg-primary/10 text-primary border-primary/20">Em Progresso</Badge>;
      default: return <Badge className="bg-warning/10 text-warning border-warning/20">Pendente</Badge>;
    }
  };

  return (
    <motion.div {...tabFade} className="space-y-3">
      {insights.map((insight, idx) => (
        <motion.div key={insight.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06, duration: 0.35 }}>
          <PremiumCard glowColor={insight.type === "opportunity" ? "warning" : insight.type === "warning" ? "destructive" : "success"} delay={idx} className="p-0">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-muted/50">{getTypeIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3 className="font-semibold text-sm">{insight.title}</h3><p className="text-xs text-muted-foreground mt-1">{insight.description}</p></div>
                    {getStatusBadge(insight.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                    <Badge className={`text-xs ${insight.impact === "Crítico" ? "bg-destructive/10 text-destructive border-destructive/20" : insight.impact === "Alto" ? "bg-warning/10 text-warning border-warning/20" : "bg-primary/10 text-primary border-primary/20"}`}>{insight.impact}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> {insight.confidence}%</span>
                    <span className="text-xs font-medium text-success flex items-center gap-1"><Zap className="h-3 w-3" /> {insight.estimatedValue}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="default" className="h-7 text-xs active:scale-95 transition-transform" onClick={() => onAnalyze(insight)}><Eye className="h-3 w-3 mr-1" /> Analisar</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs active:scale-95 transition-transform" onClick={() => onImplement(insight)}><Play className="h-3 w-3 mr-1" /> Implementar</Button>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Trends Tab ────────────────────────────────
interface TrendsTabProps { insights: Insight[]; }

export function TrendsTab({ insights }: TrendsTabProps) {
  return (
    <motion.div {...tabFade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PremiumCard glowColor="primary" delay={0}>
        <div className="flex items-center gap-2 mb-5"><BarChart3 className="h-5 w-5 text-primary" /><h3 className="font-semibold">Performance por Área</h3></div>
        <div className="space-y-4">
          {trends.map((trend, idx) => (
            <motion.div key={trend.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{trend.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold"><AnimatedCounter value={trend.score} suffix="%" /></span>
                  <span className={`text-xs font-medium ${trend.change >= 0 ? "text-success" : "text-destructive"}`}>{trend.change >= 0 ? "+" : ""}{trend.change}%</span>
                </div>
              </div>
              <Progress value={trend.score} className="h-2" />
            </motion.div>
          ))}
        </div>
      </PremiumCard>
      <PremiumCard glowColor="success" delay={1}>
        <div className="flex items-center gap-2 mb-5"><PieChart className="h-5 w-5 text-primary" /><h3 className="font-semibold">Distribuição de Insights</h3></div>
        <div className="space-y-3">
          {[
            { label: "Oportunidades", icon: Lightbulb, count: insights.filter(i => i.type === "opportunity").length, bg: "bg-warning/5 border-warning/15", iconColor: "text-warning" },
            { label: "Alertas", icon: AlertTriangle, count: insights.filter(i => i.type === "warning").length, bg: "bg-destructive/5 border-destructive/15", iconColor: "text-destructive" },
            { label: "Sucessos", icon: CheckCircle2, count: insights.filter(i => i.type === "success").length, bg: "bg-success/5 border-success/15", iconColor: "text-success" },
          ].map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.01 }} className={`flex items-center justify-between p-3.5 rounded-xl border ${item.bg} transition-all`}>
              <div className="flex items-center gap-2.5"><item.icon className={`h-5 w-5 ${item.iconColor}`} /><span className="font-medium text-sm">{item.label}</span></div>
              <span className="text-lg font-bold"><AnimatedCounter value={item.count} /></span>
            </motion.div>
          ))}
        </div>
      </PremiumCard>
    </motion.div>
  );
}

// ─── Predictions Tab ────────────────────────────────
export function PredictionsTab() {
  const predictions = [
    { title: "Previsão de Receita", value: "R$ 4.8M", sub: "Próximo trimestre", change: "+22% vs atual", confidence: 78, icon: DollarSign, glow: "success" as const },
    { title: "Demanda de Frota", value: "+3 embarcações", sub: "Necessidade estimada", change: "Em 6 meses", confidence: 85, icon: Ship, glow: "cyan" as const },
    { title: "Necessidade de Pessoal", value: "+45 tripulantes", sub: "Contratação prevista", change: "Expansão Q2", confidence: 72, icon: Users, glow: "primary" as const },
  ];
  return (
    <motion.div {...tabFade}>
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((pred, idx) => (
          <motion.div key={pred.title} variants={stagger.item}>
            <PremiumCard glowColor={pred.glow} delay={idx}>
              <div className="flex items-center gap-2 mb-3"><pred.icon className="h-5 w-5 text-primary" /><h3 className="font-semibold text-sm">{pred.title}</h3></div>
              <p className="text-3xl font-bold tracking-tight">{pred.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{pred.sub}</p>
              <div className="flex items-center gap-1.5 mt-2"><ArrowUpRight className="h-3.5 w-3.5 text-success" /><span className="text-xs text-success font-medium">{pred.change}</span></div>
              <Progress value={pred.confidence} className="h-1.5 mt-4" />
              <p className="text-xs text-muted-foreground mt-1.5">{pred.confidence}% de confiança</p>
            </PremiumCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── AI Tab ────────────────────────────────
interface AITabProps { aiInsight: string | null; isAnalyzing: boolean; onGenerate: () => void; }

export function AITab({ aiInsight, isAnalyzing, onGenerate }: AITabProps) {
  return (
    <motion.div {...tabFade}>
      <PremiumCard glowColor="cyan" delay={0}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h3 className="font-semibold">Análise Integrada com IA</h3></div>
            <p className="text-xs text-muted-foreground mt-1">Insights operacionais e de negócio gerados por inteligência artificial</p>
          </div>
          <Button onClick={onGenerate} disabled={isAnalyzing} size="sm" className="active:scale-95 transition-transform">
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar Análise
          </Button>
        </div>
        {aiInsight ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-5 rounded-xl border border-border/30 leading-relaxed">{aiInsight}</pre>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}><Brain className="h-14 w-14 mx-auto mb-4 opacity-20" /></motion.div>
            <p className="text-sm">Clique em "Gerar Análise" para obter insights detalhados</p>
            <p className="text-xs mt-1 text-muted-foreground/70">A IA analisará dados operacionais e de negócio em conjunto</p>
          </div>
        )}
      </PremiumCard>
    </motion.div>
  );
}

// ─── Insight Dialogs ────────────────────────────────
interface InsightDialogsProps {
  selectedInsight: Insight | null;
  isAnalyzeDialogOpen: boolean;
  isImplementDialogOpen: boolean;
  analysisNotes: string;
  implementationPlan: string;
  isProcessing: boolean;
  onAnalyzeOpenChange: (open: boolean) => void;
  onImplementOpenChange: (open: boolean) => void;
  onAnalysisNotesChange: (v: string) => void;
  onImplementationPlanChange: (v: string) => void;
  onSubmitAnalysis: () => void;
  onSubmitImplementation: () => void;
}

export function InsightDialogs(props: InsightDialogsProps) {
  const { selectedInsight, isAnalyzeDialogOpen, isImplementDialogOpen, analysisNotes, implementationPlan, isProcessing } = props;
  return (
    <>
      <Dialog open={isAnalyzeDialogOpen} onOpenChange={props.onAnalyzeOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Analisar Insight</DialogTitle>
            <DialogDescription>{selectedInsight?.title}</DialogDescription>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-sm">{selectedInsight.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{selectedInsight.category}</Badge>
                  <Badge className="text-xs bg-primary/10 text-primary">{selectedInsight.confidence}% confiança</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notas de Análise</Label>
                <Textarea placeholder="Suas observações..." value={analysisNotes} onChange={e => props.onAnalysisNotesChange(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.onAnalyzeOpenChange(false)}>Cancelar</Button>
            <Button onClick={props.onSubmitAnalysis} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar Análise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImplementDialogOpen} onOpenChange={props.onImplementOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-success" /> Implementar Insight</DialogTitle>
            <DialogDescription>{selectedInsight?.title}</DialogDescription>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-success" /><span className="text-sm font-medium text-success">{selectedInsight.estimatedValue}</span></div>
                <p className="text-sm">{selectedInsight.description}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Plano de Implementação</Label>
                <Textarea placeholder="Descreva o plano..." value={implementationPlan} onChange={e => props.onImplementationPlanChange(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => props.onImplementOpenChange(false)}>Cancelar</Button>
            <Button onClick={props.onSubmitImplementation} disabled={isProcessing} className="bg-success text-success-foreground hover:bg-success/90">
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Implementar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
