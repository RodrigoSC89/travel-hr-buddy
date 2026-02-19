/**
 * QHSE Incident & Investigation Manager v3
 * BEATS: DNV ShipManager — Safety Radar, Safety Flash, LTIR/TRIR, root cause waterfall, investigation timeline
 */
import React, { useState, useMemo } from 'react';
import { motion } from "framer-motion";
import { staggerContainer, kpiCard } from "@/lib/animations/motion-variants";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ShieldAlert, Plus, Search, AlertTriangle, CheckCircle,
  Activity, TrendingDown, Download, BarChart3, Clock, PieChart as PieIcon, Eye,
  Zap, FileWarning, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'serious' | 'fatal';

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string }> = {
  near_miss: { label: 'Quase Acidente', color: 'bg-info/20 text-info' },
  minor: { label: 'Menor', color: 'bg-muted text-muted-foreground' },
  moderate: { label: 'Moderado', color: 'bg-warning/20 text-warning' },
  serious: { label: 'Sério', color: 'bg-destructive/20 text-destructive' },
  fatal: { label: 'Fatal', color: 'bg-destructive/40 text-destructive' },
};

const CATEGORIES: Record<string, string> = {
  injury: 'Lesão Pessoal', illness: 'Doença Ocupacional', environmental: 'Ambiental',
  property_damage: 'Dano Material', security: 'Segurança', navigational: 'Navegação',
  machinery: 'Maquinário', other: 'Outros',
};

const CHART_COLORS = ['hsl(var(--info))', 'hsl(var(--muted-foreground))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--primary))'];

const ROOT_CAUSES = [
  'human_error', 'equipment_failure', 'procedure_violation', 'environmental',
  'design_deficiency', 'maintenance_lapse', 'training_gap', 'communication', 'fatigue', 'other',
];
const ROOT_CAUSE_LABELS: Record<string, string> = {
  human_error: 'Erro Humano', equipment_failure: 'Falha de Equipamento',
  procedure_violation: 'Violação de Procedimento', environmental: 'Ambiental',
  design_deficiency: 'Deficiência de Projeto', maintenance_lapse: 'Falha de Manutenção',
  training_gap: 'Gap de Treinamento', communication: 'Comunicação', fatigue: 'Fadiga', other: 'Outros',
};

export function QHSEIncidentManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainTab, setMainTab] = useState('incidents');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '', description: '', severity: 'near_miss' as IncidentSeverity,
    category: 'injury', location: '', vessel_id: '', root_cause: '',
    immediate_action: '', corrective_action: '', preventive_action: '',
    witnesses: '', equipment_involved: '',
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['qhse-vessels'],
    queryFn: async () => { const { data } = await supabase.from('vessels').select('id, name').order('name'); return data || []; },
  });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['qhse-incidents', searchTerm],
    queryFn: async () => {
      let query = supabase.from('soc_alerts').select('*, vessels:vessel_id(name)').order('created_at', { ascending: false });
      if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
      const { data } = await query;
      return data || [];
    },
  });

  const createIncident = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('soc_alerts').insert({
        title: form.title,
        alert_type: form.category,
        severity: form.severity === 'fatal' || form.severity === 'serious' ? 'critical' : form.severity === 'moderate' ? 'high' : 'medium',
        message: `[${form.severity.toUpperCase()}] ${form.description}`,
        vessel_id: form.vessel_id || null,
        source_module: 'qhse_report',
        metadata: {
          incident_severity: form.severity, incident_category: form.category,
          location: form.location, root_cause: form.root_cause,
          immediate_action: form.immediate_action, corrective_action: form.corrective_action,
          preventive_action: form.preventive_action, witnesses: form.witnesses,
          equipment_involved: form.equipment_involved, investigation_status: 'reported',
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Incidente reportado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['qhse-incidents'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', severity: 'near_miss', category: 'injury', location: '', vessel_id: '', root_cause: '', immediate_action: '', corrective_action: '', preventive_action: '', witnesses: '', equipment_involved: '' });
    },
    onError: () => toast.error('Erro ao reportar incidente'),
  });

  const filtered = useMemo(() => {
    return incidents.filter(i => {
      const meta = (i.metadata as Record<string, unknown>) || {};
      const sev = (meta.incident_severity as string) || 'minor';
      if (filterSeverity !== 'all' && sev !== filterSeverity) return false;
      return true;
    });
  }, [incidents, filterSeverity]);

  const analytics = useMemo(() => {
    const total = incidents.length;
    const nearMisses = incidents.filter(i => { const m = i.metadata as Record<string, unknown> | null; return m?.incident_severity === 'near_miss'; }).length;
    const open = incidents.filter(i => !i.acknowledged_at).length;
    const resolved = incidents.filter(i => !!i.resolved_at).length;

    // LTIR = (Lost Time Incidents / Exposure Hours) × 1,000,000 — simplified
    const lostTimeIncidents = incidents.filter(i => { const m = i.metadata as Record<string, unknown> | null; return m?.incident_severity === 'serious' || m?.incident_severity === 'fatal'; }).length;
    const exposureHours = Math.max(total * 2000, 1); // simplified
    const ltir = ((lostTimeIncidents / exposureHours) * 1000000).toFixed(2);

    // TRIR = (Total Recordable Incidents / Exposure Hours) × 1,000,000
    const recordable = total - nearMisses;
    const trir = ((recordable / exposureHours) * 1000000).toFixed(2);

    // By severity
    const bySeverity = Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => ({
      name: cfg.label,
      count: incidents.filter(i => { const m = i.metadata as Record<string, unknown> | null; return (m?.incident_severity as string) === key; }).length,
    })).filter(d => d.count > 0);

    // By category
    const byCategory = Object.entries(CATEGORIES).map(([key, label]) => ({
      name: label.substring(0, 12),
      count: incidents.filter(i => { const m = i.metadata as Record<string, unknown> | null; return (m?.incident_category as string) === key; }).length,
    })).filter(d => d.count > 0);

    // By root cause
    const byRootCause = ROOT_CAUSES.map(key => ({
      name: (ROOT_CAUSE_LABELS[key] || key).substring(0, 15),
      count: incidents.filter(i => { const m = i.metadata as Record<string, unknown> | null; return (m?.root_cause as string) === key; }).length,
    })).filter(d => d.count > 0);

    // Monthly trend
    const monthly: Record<string, { total: number; nearMiss: number; serious: number }> = {};
    incidents.forEach(i => {
      const m = (i.created_at || '').substring(0, 7);
      if (!m) return;
      if (!monthly[m]) monthly[m] = { total: 0, nearMiss: 0, serious: 0 };
      monthly[m].total++;
      const meta = i.metadata as Record<string, unknown> | null;
      if (meta?.incident_severity === 'near_miss') monthly[m].nearMiss++;
      if (meta?.incident_severity === 'serious' || meta?.incident_severity === 'fatal') monthly[m].serious++;
    });
    const monthlyTrend = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, d]) => ({ month: month.substring(5), total: d.total, nearMiss: d.nearMiss, serious: d.serious }));

    // Resolution time (days)
    const resolvedIncidents = incidents.filter(i => i.resolved_at && i.created_at);
    const avgResolutionDays = resolvedIncidents.length > 0
      ? Math.round(resolvedIncidents.reduce((s, i) => s + (new Date(i.resolved_at!).getTime() - new Date(i.created_at).getTime()) / 86400000, 0) / resolvedIncidents.length)
      : 0;

    return { total, nearMisses, open, resolved, ltir, trir, bySeverity, byCategory, byRootCause, monthlyTrend, avgResolutionDays, lostTimeIncidents };
  }, [incidents]);

  const exportCSV = () => {
    const headers = ['Título', 'Severidade', 'Categoria', 'Local', 'Causa Raiz', 'Status', 'Data'];
    const rows = filtered.map(i => {
      const meta = (i.metadata as Record<string, unknown>) || {};
      return [i.title, meta.incident_severity, meta.incident_category, meta.location, meta.root_cause, i.resolved_at ? 'Resolvido' : 'Aberto', i.created_at].join(',');
    });
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'qhse-incidents.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const detailIncident = detailOpen ? incidents.find(i => i.id === detailOpen) : null;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" />QHSE Incident Manager</h2>
          <p className="text-muted-foreground">Gestão de incidentes, investigação e KPIs de segurança</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Reportar</Button>
        </div>
      </div>

      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-7 gap-3" variants={staggerContainer}>
        {[
          { label: 'Total', value: analytics.total, icon: ShieldAlert, color: 'text-primary' },
          { label: 'Quase Acidentes', value: analytics.nearMisses, icon: Activity, color: 'text-info' },
          { label: 'Em Aberto', value: analytics.open, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Resolvidos', value: analytics.resolved, icon: CheckCircle, color: 'text-success' },
          { label: 'LTIR', value: analytics.ltir, icon: TrendingDown, color: 'text-primary' },
          { label: 'TRIR', value: analytics.trir, icon: BarChart3, color: 'text-warning' },
          { label: 'Resolução (dias)', value: analytics.avgResolutionDays, icon: Clock, color: 'text-info' },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={kpiCard}><Card><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card></motion.div>
        ))}
      </motion.div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rootcause">Causa Raiz</TabsTrigger>
          <TabsTrigger value="radar">Safety Radar</TabsTrigger>
          <TabsTrigger value="flash">Safety Flash</TabsTrigger>
        </TabsList>

        {/* Incidents */}
        <TabsContent value="incidents">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar incidentes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-qhse-${i}`} className="h-20 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhum incidente registrado</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map(inc => {
                const meta = (inc.metadata as Record<string, unknown>) || {};
                const severity = (meta.incident_severity as IncidentSeverity) || 'minor';
                const category = (meta.incident_category as string) || 'other';
                const vessel = (inc.vessels as Record<string, unknown> | null)?.name as string | undefined;
                const rootCause = meta.root_cause as string | undefined;
                const daysSinceCreation = Math.floor((Date.now() - new Date(inc.created_at).getTime()) / 86400000);
                const isOverdue = !inc.resolved_at && daysSinceCreation > 30;
                return (
                  <Card key={inc.id} className={cn("hover:border-primary/30 transition-colors cursor-pointer", severity === 'fatal' || severity === 'serious' ? 'border-destructive/40' : '', isOverdue ? 'border-warning/50' : '')}
                    onClick={() => setDetailOpen(inc.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={SEVERITY_CONFIG[severity]?.color}>{SEVERITY_CONFIG[severity]?.label}</Badge>
                            <Badge variant="outline">{CATEGORIES[category] || category}</Badge>
                            {vessel && <span className="text-xs text-muted-foreground">🚢 {vessel}</span>}
                            {inc.resolved_at ? <Badge className="bg-success/20 text-success">Resolvido</Badge> : <Badge className="bg-muted text-muted-foreground">Aberto</Badge>}
                            {isOverdue && <Badge variant="outline" className="bg-warning/10 text-warning text-[10px]">⚠ &gt;30 dias</Badge>}
                            {rootCause && <Badge variant="outline" className="text-[10px]">{ROOT_CAUSE_LABELS[rootCause] || rootCause}</Badge>}
                          </div>
                          <p className="font-semibold text-sm">{inc.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(inc.created_at).toLocaleDateString('pt-BR')} {meta.location ? `| 📍 ${meta.location}` : ''}</p>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tendência Mensal</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" radius={[4,4,0,0]} />
                      <Bar dataKey="nearMiss" fill="hsl(var(--info))" name="Quase Acidentes" radius={[4,4,0,0]} />
                      <Bar dataKey="serious" fill="hsl(var(--destructive))" name="Sérios/Fatais" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Severidade</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.bySeverity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={analytics.bySeverity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {analytics.bySeverity.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Incidentes por Categoria</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--warning))" name="Incidentes" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Root Cause */}
        <TabsContent value="rootcause">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Análise de Causa Raiz</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.byRootCause.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byRootCause} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={110} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Ocorrências" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados de causa raiz. Preencha ao reportar.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Indicadores de Segurança</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 py-4">
                  {[
                    { label: 'LTIR (Lost Time Injury Rate)', value: analytics.ltir, desc: 'Incidentes com perda de tempo por 1M horas', color: Number(analytics.ltir) > 1 ? 'text-destructive' : 'text-success' },
                    { label: 'TRIR (Total Recordable Incident Rate)', value: analytics.trir, desc: 'Incidentes registráveis por 1M horas', color: Number(analytics.trir) > 5 ? 'text-destructive' : 'text-success' },
                    { label: 'Tempo Médio de Resolução', value: `${analytics.avgResolutionDays} dias`, desc: 'Meta: < 30 dias', color: analytics.avgResolutionDays > 30 ? 'text-warning' : 'text-success' },
                    { label: 'Near Miss Ratio', value: `${analytics.total > 0 ? ((analytics.nearMisses / analytics.total) * 100).toFixed(0) : 0}%`, desc: 'Meta: > 60% (cultura de reporte)', color: analytics.total > 0 && (analytics.nearMisses / analytics.total) > 0.6 ? 'text-success' : 'text-warning' },
                  ].map(ind => (
                    <div key={ind.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{ind.label}</p>
                        <p className="text-xs text-muted-foreground">{ind.desc}</p>
                      </div>
                      <span className={`text-xl font-bold ${ind.color}`}>{ind.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Safety Performance Radar */}
        <TabsContent value="radar">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Safety Performance Radar</CardTitle></CardHeader>
              <CardContent className="h-80">
                {(() => {
                  const total = Math.max(analytics.total, 1);
                  const radarData = [
                    { dimension: 'Near Miss\nReporting', value: Math.min(100, (analytics.nearMisses / total) * 150), benchmark: 60 },
                    { dimension: 'Resolution\nSpeed', value: Math.min(100, analytics.avgResolutionDays > 0 ? Math.max(0, 100 - analytics.avgResolutionDays * 2) : 80), benchmark: 70 },
                    { dimension: 'Investigation\nDepth', value: Math.min(100, (analytics.byRootCause.length / 10) * 100), benchmark: 50 },
                    { dimension: 'LTIR\nPerformance', value: Math.min(100, Number(analytics.ltir) < 1 ? 90 : Math.max(0, 100 - Number(analytics.ltir) * 20)), benchmark: 75 },
                    { dimension: 'Closure\nRate', value: analytics.total > 0 ? Math.round((analytics.resolved / analytics.total) * 100) : 0, benchmark: 80 },
                  ];
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid className="stroke-border" />
                        <PolarAngleAxis dataKey="dimension" className="text-[10px]" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                        <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        <Radar name="Benchmark" dataKey="benchmark" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} strokeDasharray="5 5" />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Safety Culture Scorecard</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 py-2">
                  {(() => {
                    const total = Math.max(analytics.total, 1);
                    const nearMissRatio = analytics.nearMisses / total;
                    const closureRate = analytics.resolved / total;
                    const avgRes = analytics.avgResolutionDays;
                    const overallScore = Math.round(
                      (nearMissRatio > 0.6 ? 25 : nearMissRatio * 40) +
                      (closureRate * 25) +
                      (avgRes < 15 ? 25 : avgRes < 30 ? 15 : 5) +
                      (Number(analytics.ltir) < 1 ? 25 : Number(analytics.ltir) < 3 ? 15 : 5)
                    );
                    const grade = overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'D';
                    const gradeColor = grade === 'A' ? 'text-success' : grade === 'B' ? 'text-primary' : grade === 'C' ? 'text-warning' : 'text-destructive';
                    return (
                      <>
                        <div className="text-center py-4">
                          <div className={`text-6xl font-black ${gradeColor}`}>{grade}</div>
                          <div className="text-2xl font-bold mt-1">{overallScore}/100</div>
                          <p className="text-xs text-muted-foreground mt-1">Safety Culture Score</p>
                        </div>
                        {[
                          { label: 'Near Miss Reporting Culture', score: Math.round(nearMissRatio * 100), target: 60 },
                          { label: 'Incident Closure Rate', score: Math.round(closureRate * 100), target: 80 },
                          { label: 'Investigation Quality', score: Math.min(100, Math.round((analytics.byRootCause.length / 10) * 100)), target: 50 },
                          { label: 'Response Time', score: avgRes < 15 ? 95 : avgRes < 30 ? 60 : 30, target: 70 },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-sm">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={item.score >= item.target ? 'default' : 'destructive'} className="text-xs">
                                {item.score}%
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">meta: {item.target}%</span>
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Safety Flash Generator */}
        <TabsContent value="flash">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />Safety Flash - Incidentes Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incidents.filter(i => {
                  const m = i.metadata as Record<string, unknown> | null;
                  return m?.incident_severity === 'serious' || m?.incident_severity === 'fatal' || m?.incident_severity === 'moderate';
                }).slice(0, 5).map((inc, idx) => {
                  const meta = (inc.metadata as Record<string, unknown>) || {};
                  const severity = (meta.incident_severity as IncidentSeverity) || 'minor';
                  return (
                    <div key={inc.id} className="p-3 border-l-4 border-destructive/60 bg-muted/30 rounded-r mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FileWarning className="h-4 w-4 text-destructive" />
                        <Badge className={SEVERITY_CONFIG[severity]?.color}>{SEVERITY_CONFIG[severity]?.label}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(inc.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="font-semibold text-sm">{inc.title}</p>
                      {meta.root_cause ? <p className="text-xs mt-1"><span className="text-muted-foreground">Causa:</span> {ROOT_CAUSE_LABELS[meta.root_cause as string] || String(meta.root_cause)}</p> : null}
                      {meta.corrective_action ? <p className="text-xs mt-1"><span className="text-muted-foreground">Ação:</span> {String(meta.corrective_action).slice(0, 100)}</p> : null}
                    </div>
                  );
                })}
                {incidents.filter(i => {
                  const m = i.metadata as Record<string, unknown> | null;
                  return m?.incident_severity === 'serious' || m?.incident_severity === 'fatal' || m?.incident_severity === 'moderate';
                }).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum incidente grave para Safety Flash</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lessons Learned Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.byRootCause.slice(0, 5).map((rc, i) => (
                    <div key={rc.name} className="p-3 bg-muted/30 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{rc.name}</span>
                        <Badge variant="outline">{rc.count} ocorrências</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rc.name.includes('Humano') ? 'Reforçar treinamento e procedimentos operacionais. Implementar dupla verificação.'
                          : rc.name.includes('Equipamento') ? 'Revisar plano de manutenção preventiva. Verificar running hours e calibração.'
                          : rc.name.includes('Procedimento') ? 'Atualizar SMS/ISM manual. Realizar drill de conformidade.'
                          : rc.name.includes('Fadiga') ? 'Revisar escala MLC 2.3. Implementar monitoramento de work/rest hours.'
                          : 'Analisar tendências e implementar medidas preventivas específicas.'}
                      </p>
                    </div>
                  ))}
                  {analytics.byRootCause.length === 0 && (
                    <p className="text-center py-6 text-muted-foreground text-sm">Preencha causa raiz nos incidentes para gerar lições aprendidas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailIncident} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailIncident && (() => {
            const meta = (detailIncident.metadata as Record<string, unknown>) || {};
            const severity = (meta.incident_severity as IncidentSeverity) || 'minor';
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    {detailIncident.title}
                    <Badge className={SEVERITY_CONFIG[severity]?.color}>{SEVERITY_CONFIG[severity]?.label}</Badge>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Categoria:</span> <span className="font-medium">{CATEGORIES[(meta.incident_category as string)] || String(meta.incident_category || '—')}</span></div>
                    <div><span className="text-muted-foreground">Local:</span> <span className="font-medium">{String(meta.location || '—')}</span></div>
                    <div><span className="text-muted-foreground">Causa Raiz:</span> <span className="font-medium">{ROOT_CAUSE_LABELS[(meta.root_cause as string)] || String(meta.root_cause || '—')}</span></div>
                    <div><span className="text-muted-foreground">Data:</span> <span className="font-medium">{new Date(detailIncident.created_at).toLocaleDateString('pt-BR')}</span></div>
                    <div><span className="text-muted-foreground">Equipamento:</span> <span className="font-medium">{String(meta.equipment_involved || '—')}</span></div>
                    <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{detailIncident.resolved_at ? 'Resolvido' : 'Aberto'}</span></div>
                  </div>
                  {detailIncident.message && <div><Label className="text-muted-foreground">Descrição</Label><p className="text-sm bg-muted/30 p-3 rounded mt-1">{detailIncident.message}</p></div>}
                  {meta.immediate_action ? <div><Label className="text-muted-foreground">Ação Imediata</Label><p className="text-sm bg-muted/30 p-3 rounded mt-1">{String(meta.immediate_action)}</p></div> : null}
                  {meta.corrective_action ? <div><Label className="text-muted-foreground">Ação Corretiva</Label><p className="text-sm bg-muted/30 p-3 rounded mt-1">{String(meta.corrective_action)}</p></div> : null}
                  {meta.preventive_action ? <div><Label className="text-muted-foreground">Ação Preventiva</Label><p className="text-sm bg-muted/30 p-3 rounded mt-1">{String(meta.preventive_action)}</p></div> : null}
                  {meta.witnesses ? <div><Label className="text-muted-foreground">Testemunhas</Label><p className="text-sm bg-muted/30 p-3 rounded mt-1">{String(meta.witnesses)}</p></div> : null}

                  {/* Investigation Timeline */}
                  <div>
                    <Label className="text-muted-foreground">Timeline da Investigação</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        { date: detailIncident.created_at, label: 'Incidente Reportado', done: true },
                        { date: detailIncident.acknowledged_at, label: 'Reconhecido', done: !!detailIncident.acknowledged_at },
                        { date: null, label: 'Investigação Iniciada', done: !!meta.root_cause },
                        { date: detailIncident.resolved_at, label: 'Resolvido / Encerrado', done: !!detailIncident.resolved_at },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", step.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                          <div className="flex-1">
                            <p className={cn("text-sm", step.done ? "font-medium" : "text-muted-foreground")}>{step.label}</p>
                            {step.date && <p className="text-xs text-muted-foreground">{new Date(step.date).toLocaleString('pt-BR')}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Reportar Incidente QHSE</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Breve descrição" /></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label>Severidade</Label>
                <Select value={form.severity} onValueChange={v => setForm(p => ({...p, severity: v as IncidentSeverity}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SEVERITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({...p, category: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Embarcação</Label>
                <Select value={form.vessel_id} onValueChange={v => setForm(p => ({...p, vessel_id: v}))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Local</Label><Input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Casa de Máquinas" /></div>
              <div>
                <Label>Causa Raiz</Label>
                <Select value={form.root_cause} onValueChange={v => setForm(p => ({...p, root_cause: v}))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{ROOT_CAUSES.map(k => <SelectItem key={k} value={k}>{ROOT_CAUSE_LABELS[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Equipamento Envolvido</Label><Input value={form.equipment_involved} onChange={e => setForm(p => ({...p, equipment_involved: e.target.value}))} placeholder="Motor principal, guindaste..." /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} /></div>
            <div><Label>Ação Imediata</Label><Textarea value={form.immediate_action} onChange={e => setForm(p => ({...p, immediate_action: e.target.value}))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ação Corretiva</Label><Textarea value={form.corrective_action} onChange={e => setForm(p => ({...p, corrective_action: e.target.value}))} rows={2} /></div>
              <div><Label>Ação Preventiva</Label><Textarea value={form.preventive_action} onChange={e => setForm(p => ({...p, preventive_action: e.target.value}))} rows={2} /></div>
            </div>
            <div><Label>Testemunhas</Label><Input value={form.witnesses} onChange={e => setForm(p => ({...p, witnesses: e.target.value}))} placeholder="Nomes" /></div>
            <Button onClick={() => createIncident.mutate()} disabled={!form.title || createIncident.isPending} className="w-full">
              {createIncident.isPending ? 'Registrando...' : 'Registrar Incidente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
