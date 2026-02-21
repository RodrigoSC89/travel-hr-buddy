/**
 * Defect & Work Request Manager v3 — MTBF/MTTR, Trend Lines, Vessel Heatmap
 * Benchmarks: BASSnet, DNV ShipManager, TM Master
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  AlertTriangle, Plus, Wrench, CheckCircle, Clock, Search, Filter,
  FileText, Shield, ArrowRight, Eye, Target, Download, BarChart3, TrendingUp,
  Activity, Gauge, Ship
} from 'lucide-react';
import { differenceInDays, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, Area,
} from 'recharts';

const CATEGORIES = ['mechanical', 'electrical', 'structural', 'piping', 'safety', 'navigation', 'accommodation'];
const SOURCES = ['crew-report', 'inspection', 'audit', 'incident', 'psc', 'class'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'assessed', 'work-order-created', 'in-progress', 'parts-ordered', 'completed', 'verified', 'closed'];
const COLORS = ["hsl(var(--primary))", "hsl(210,70%,55%)", "hsl(160,60%,45%)", "hsl(35,80%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)", "hsl(120,50%,50%)"];

export default function DefectWorkRequestManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const queryClient = useQueryClient();

  const defaultForm = {
    title: '', description: '', category: 'mechanical', equipment_name: '', location_onboard: '',
    priority: 'medium', source: 'crew-report', reported_by_name: '', assigned_to: '',
    assigned_department: '', target_date: '', vessel_id: '',
    root_cause: '', corrective_action: '', preventive_action: '',
  };
  const [form, setForm] = useState(defaultForm);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: vessels = [] } = useQuery({
    queryKey: ['defect-vessels'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['defect-work-requests', filterStatus, filterPriority],
    queryFn: async () => {
      let query = fromUntyped('defect_work_requests')
        .select('*, vessels:vessel_id(name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (filterStatus !== 'all') query = query.eq('status', filterStatus);
      if (filterPriority !== 'all') query = query.eq('priority', filterPriority);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const defectNum = `DWR-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await fromUntyped('defect_work_requests').insert({
        defect_number: defectNum, title: f.title, description: f.description,
        category: f.category, equipment_name: f.equipment_name || null,
        location_onboard: f.location_onboard || null, priority: f.priority,
        source: f.source, reported_by_name: f.reported_by_name || null,
        assigned_to: f.assigned_to || null, assigned_department: f.assigned_department || null,
        target_date: f.target_date || null, vessel_id: f.vessel_id || null,
        root_cause: f.root_cause || null, corrective_action: f.corrective_action || null,
        preventive_action: f.preventive_action || null, status: 'open',
        capa_status: (f.root_cause || f.corrective_action) ? 'in-progress' : 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defect-work-requests'] });
      toast.success('Defect/Work Request criado!');
      setCreateOpen(false);
      setForm(defaultForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { status };
      if (status === 'completed') update.completed_date = new Date().toISOString().split('T')[0];
      if (status === 'verified') update.verified_date = new Date().toISOString().split('T')[0];
      const { error } = await fromUntyped('defect_work_requests').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defect-work-requests'] });
      toast.success('Status atualizado!');
    },
  });

  const priorityColor: Record<string, string> = {
    critical: 'destructive', high: 'destructive', medium: 'secondary', low: 'outline'
  };

  const filtered = defects.filter((d: any) => {
    if (search && !d.title?.toLowerCase().includes(search.toLowerCase()) && !d.defect_number?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = defects.filter((d: any) => d.status === 'open').length;
  const criticalCount = defects.filter((d: any) => d.priority === 'critical' && d.status !== 'closed').length;
  const capaOpen = defects.filter((d: any) => d.capa_status === 'in-progress' || d.capa_status === 'pending').length;
  const closedCount = defects.filter((d: any) => d.status === 'closed' || d.status === 'completed' || d.status === 'verified').length;
  const closureRate = defects.length > 0 ? Math.round((closedCount / defects.length) * 100) : 0;

  // MTTR calculation (avg days open→closed)
  const mttrDays = useMemo(() => {
    const closed = defects.filter((d: any) => d.completed_date && (d.reported_date || d.created_at));
    if (closed.length === 0) return 0;
    const totalDays = closed.reduce((sum: number, d: any) => {
      return sum + differenceInDays(new Date(d.completed_date), new Date(d.reported_date || d.created_at));
    }, 0);
    return Math.round(totalDays / closed.length);
  }, [defects]);

  // Aging analysis
  const agingData = useMemo(() => {
    const openDefects = defects.filter((d: any) => !['closed', 'completed', 'verified'].includes(d.status));
    const bins = { "0-7d": 0, "8-14d": 0, "15-30d": 0, "31-60d": 0, "60+d": 0 };
    openDefects.forEach((d: any) => {
      const age = differenceInDays(new Date(), new Date(d.reported_date || d.created_at));
      if (age <= 7) bins["0-7d"]++;
      else if (age <= 14) bins["8-14d"]++;
      else if (age <= 30) bins["15-30d"]++;
      else if (age <= 60) bins["31-60d"]++;
      else bins["60+d"]++;
    });
    return Object.entries(bins).map(([name, count]) => ({ name, count }));
  }, [defects]);

  // By category
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    defects.forEach((d: any) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [defects]);

  // By priority
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    defects.forEach((d: any) => { counts[d.priority] = (counts[d.priority] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [defects]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(now, 5 - i);
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const opened = defects.filter((d: any) => {
        const dt = new Date(d.created_at);
        return dt >= mStart && dt <= mEnd;
      }).length;
      const closed = defects.filter((d: any) => {
        if (!d.completed_date) return false;
        const dt = new Date(d.completed_date);
        return dt >= mStart && dt <= mEnd;
      }).length;
      return {
        month: format(m, 'MMM yy'),
        opened,
        closed,
        net: opened - closed,
      };
    });
  }, [defects]);

  // Vessel heatmap data
  const vesselHeatmap = useMemo(() => {
    const byVessel: Record<string, { name: string; total: number; critical: number; open: number }> = {};
    defects.forEach((d: any) => {
      const vName = d.vessels?.name || 'Unassigned';
      if (!byVessel[vName]) byVessel[vName] = { name: vName, total: 0, critical: 0, open: 0 };
      byVessel[vName].total++;
      if (d.priority === 'critical' || d.priority === 'high') byVessel[vName].critical++;
      if (!['closed', 'completed', 'verified'].includes(d.status)) byVessel[vName].open++;
    });
    return Object.values(byVessel).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [defects]);

  const handleExport = () => {
    const csv = [
      ["Number", "Title", "Vessel", "Category", "Priority", "Status", "Source", "Reported", "Target"].join(","),
      ...defects.map((d: any) => [
        d.defect_number, `"${d.title}"`, `"${d.vessels?.name || ''}"`,
        d.category, d.priority, d.status, d.source,
        d.reported_date || '', d.target_date || '',
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `defects-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Defect Log & Work Requests
          </h2>
          <p className="text-muted-foreground">CAPA tracking • MTTR analytics • Vessel heatmap — Padrão BASSnet/DNV</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Defeito</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
          <div className="text-2xl font-bold">{openCount}</div>
          <div className="text-xs text-muted-foreground">Abertos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Target className="h-5 w-5 mx-auto mb-1 text-destructive" />
          <div className="text-2xl font-bold">{criticalCount}</div>
          <div className="text-xs text-muted-foreground">Críticos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-5 w-5 mx-auto mb-1 text-blue-400" />
          <div className="text-2xl font-bold">{capaOpen}</div>
          <div className="text-xs text-muted-foreground">CAPA Pendentes</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
          <div className="text-2xl font-bold">{closedCount}</div>
          <div className="text-xs text-muted-foreground">Fechados</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
          <Progress value={closureRate} className="mt-1 h-2" />
          <div className="text-sm font-bold mt-1">{closureRate}%</div>
          <div className="text-xs text-muted-foreground">Closure Rate</div>
        </CardContent></Card>
        <Card className="border-primary/30"><CardContent className="p-4 text-center">
          <Gauge className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-primary">{mttrDays}d</div>
          <div className="text-xs text-muted-foreground">MTTR (avg)</div>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Defects ({defects.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="vessels">Vessel Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Buscar por título ou número..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-10 w-10 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum defeito registrado</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filtered.map((d: any) => {
                    const age = differenceInDays(new Date(), new Date(d.reported_date || d.created_at));
                    const isOverdue = d.target_date && new Date(d.target_date) < new Date() && !['closed', 'completed', 'verified'].includes(d.status);
                    return (
                      <div key={d.id} className={`p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 cursor-pointer ${isOverdue ? "border-destructive/40" : ""}`}
                        onClick={() => setDetailOpen(d)}>
                        <div className="flex items-center gap-3">
                          <Wrench className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {d.defect_number} — {d.title}
                              {isOverdue && <Badge className="bg-destructive/20 text-destructive text-[10px]">Overdue</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {d.vessels?.name || 'N/A'} · {d.category} · {d.source} · {age}d ago
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={(priorityColor[d.priority] || 'secondary') as any}>{d.priority}</Badge>
                          <Badge variant="outline">{d.status}</Badge>
                          {d.capa_status !== 'pending' && <Badge variant="secondary" className="text-[10px]">CAPA: {d.capa_status}</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
              <CardContent>
                {categoryData.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">By Priority</CardTitle></CardHeader>
              <CardContent>
                {priorityData.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Defect Aging Analysis</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" name="Open Defects" radius={[4,4,0,0]}>
                    {agingData.map((_, i) => (
                      <Cell key={i} fill={i <= 1 ? "hsl(160,60%,45%)" : i <= 2 ? "hsl(35,80%,55%)" : "hsl(0,70%,55%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: "hsl(160,60%,45%)" }} /> Normal</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: "hsl(35,80%,55%)" }} /> Attention</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: "hsl(0,70%,55%)" }} /> Critical</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW: Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Monthly Defect Trend (6 months)</CardTitle>
              <CardDescription>Opened vs Closed defects per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opened" name="Opened" fill="hsl(0,70%,55%)" radius={[4,4,0,0]} />
                  <Bar dataKey="closed" name="Closed" fill="hsl(160,60%,45%)" radius={[4,4,0,0]} />
                  <Line type="monotone" dataKey="net" name="Net (O-C)" stroke="hsl(var(--primary))" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW: Vessel Heatmap Tab */}
        <TabsContent value="vessels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Ship className="h-4 w-4" /> Vessel Defect Heatmap</CardTitle>
              <CardDescription>Top 10 vessels by defect volume</CardDescription>
            </CardHeader>
            <CardContent>
              {vesselHeatmap.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No vessel data available</p>
              ) : (
                <div className="space-y-3">
                  {vesselHeatmap.map(v => (
                    <div key={v.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{v.name}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{v.total} total</span>
                          <span className="text-destructive">{v.critical} crit/high</span>
                          <span className="text-yellow-500">{v.open} open</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        {v.open > 0 && (
                          <div className="bg-yellow-500/70 rounded-sm" style={{ width: `${(v.open / v.total) * 100}%` }} title={`${v.open} open`} />
                        )}
                        {v.critical > 0 && (
                          <div className="bg-destructive/70 rounded-sm" style={{ width: `${(v.critical / v.total) * 100}%` }} title={`${v.critical} critical/high`} />
                        )}
                        <div className="bg-emerald-500/40 rounded-sm flex-1" title={`${v.total - v.open} resolved`} />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500/70" /> Open</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive/70" /> Critical/High</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500/40" /> Resolved</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Defeito / Work Request</DialogTitle></DialogHeader>
          <Tabs defaultValue="defect">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="defect">Defeito</TabsTrigger>
              <TabsTrigger value="capa">CAPA</TabsTrigger>
            </TabsList>
            <TabsContent value="defect" className="space-y-3 mt-4">
              <div><Label>Título *</Label><Input placeholder="Descrição breve do defeito" value={form.title} onChange={e => set('title', e.target.value)} /></div>
              <div><Label>Descrição</Label><Textarea placeholder="Detalhes do defeito..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Embarcação</Label>
                  <Select value={form.vessel_id} onValueChange={v => set('vessel_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{vessels.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Fonte</Label>
                  <Select value={form.source} onValueChange={v => set('source', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Equipamento</Label><Input placeholder="Nome do equipamento" value={form.equipment_name} onChange={e => set('equipment_name', e.target.value)} /></div>
                <div><Label>Local a Bordo</Label><Input placeholder="Ex: Praça de Máquinas" value={form.location_onboard} onChange={e => set('location_onboard', e.target.value)} /></div>
                <div><Label>Reportado por</Label><Input value={form.reported_by_name} onChange={e => set('reported_by_name', e.target.value)} /></div>
                <div><Label>Atribuído a</Label><Input value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} /></div>
                <div><Label>Departamento</Label><Input value={form.assigned_department} onChange={e => set('assigned_department', e.target.value)} /></div>
                <div><Label>Prazo</Label><Input type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} /></div>
              </div>
            </TabsContent>
            <TabsContent value="capa" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">Corrective and Preventive Action (CAPA)</p>
              <div><Label>Causa Raiz</Label><Textarea placeholder="Análise da causa raiz..." value={form.root_cause} onChange={e => set('root_cause', e.target.value)} /></div>
              <div><Label>Ação Corretiva</Label><Textarea placeholder="Ação imediata..." value={form.corrective_action} onChange={e => set('corrective_action', e.target.value)} /></div>
              <div><Label>Ação Preventiva</Label><Textarea placeholder="Medidas preventivas..." value={form.preventive_action} onChange={e => set('preventive_action', e.target.value)} /></div>
            </TabsContent>
          </Tabs>
          <Button className="w-full mt-4" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title}>
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Criando...' : 'Criar Defect/Work Request'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{detailOpen?.defect_number} — {detailOpen?.title}</DialogTitle></DialogHeader>
          {detailOpen && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Badge variant={(priorityColor[detailOpen.priority] || 'secondary') as any}>{detailOpen.priority}</Badge>
                <Badge variant="outline">{detailOpen.status}</Badge>
                {detailOpen.capa_status && <Badge variant="secondary">CAPA: {detailOpen.capa_status}</Badge>}
                {detailOpen.target_date && new Date(detailOpen.target_date) < new Date() && !['closed', 'completed', 'verified'].includes(detailOpen.status) && (
                  <Badge className="bg-destructive/20 text-destructive">Overdue</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Embarcação:</span> {detailOpen.vessels?.name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Categoria:</span> {detailOpen.category}</div>
                <div><span className="text-muted-foreground">Equipamento:</span> {detailOpen.equipment_name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Local:</span> {detailOpen.location_onboard || 'N/A'}</div>
                <div><span className="text-muted-foreground">Fonte:</span> {detailOpen.source}</div>
                <div><span className="text-muted-foreground">Reportado:</span> {detailOpen.reported_by_name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Atribuído:</span> {detailOpen.assigned_to || 'N/A'}</div>
                <div><span className="text-muted-foreground">Prazo:</span> {detailOpen.target_date || 'N/A'}</div>
                <div><span className="text-muted-foreground">Idade:</span> {differenceInDays(new Date(), new Date(detailOpen.reported_date || detailOpen.created_at))} dias</div>
              </div>
              {detailOpen.description && <div><span className="text-sm text-muted-foreground">Descrição:</span><p className="text-sm mt-1">{detailOpen.description}</p></div>}
              {detailOpen.root_cause && <div className="p-3 rounded-lg bg-muted/30"><span className="text-sm text-muted-foreground font-medium">Causa Raiz:</span><p className="text-sm mt-1">{detailOpen.root_cause}</p></div>}
              {detailOpen.corrective_action && <div className="p-3 rounded-lg bg-muted/30"><span className="text-sm text-muted-foreground font-medium">Ação Corretiva:</span><p className="text-sm mt-1">{detailOpen.corrective_action}</p></div>}
              {detailOpen.preventive_action && <div className="p-3 rounded-lg bg-muted/30"><span className="text-sm text-muted-foreground font-medium">Ação Preventiva:</span><p className="text-sm mt-1">{detailOpen.preventive_action}</p></div>}
              <div className="flex gap-2 flex-wrap pt-2 border-t">
                <span className="text-sm text-muted-foreground self-center mr-2">Avançar para:</span>
                {STATUSES.filter(s => s !== detailOpen.status).slice(0, 4).map(s => (
                  <Button key={s} variant="outline" size="sm"
                    onClick={() => { updateStatusMutation.mutate({ id: detailOpen.id, status: s }); setDetailOpen({ ...detailOpen, status: s }); }}>
                    <ArrowRight className="w-3 h-3 mr-1" />{s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
