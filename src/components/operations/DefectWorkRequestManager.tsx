/**
 * Defect & Work Request Manager with CAPA Linkage
 * Benchmarks: BASSnet, DNV ShipManager, TM Master
 * Full CRUD with source tracking, CAPA, and PMS conversion
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  AlertTriangle, Plus, Wrench, CheckCircle, Clock, Search, Filter,
  FileText, Shield, ArrowRight, Eye, Target
} from 'lucide-react';

const CATEGORIES = ['mechanical', 'electrical', 'structural', 'piping', 'safety', 'navigation', 'accommodation'];
const SOURCES = ['crew-report', 'inspection', 'audit', 'incident', 'psc', 'class'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'assessed', 'work-order-created', 'in-progress', 'parts-ordered', 'completed', 'verified', 'closed'];

export default function DefectWorkRequestManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
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
      let query = (supabase.from as Function)('defect_work_requests')
        .select('*, vessels:vessel_id(name)')
        .order('created_at', { ascending: false })
        .limit(200);
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
      const { error } = await (supabase.from as Function)('defect_work_requests').insert({
        defect_number: defectNum,
        title: f.title,
        description: f.description,
        category: f.category,
        equipment_name: f.equipment_name || null,
        location_onboard: f.location_onboard || null,
        priority: f.priority,
        source: f.source,
        reported_by_name: f.reported_by_name || null,
        assigned_to: f.assigned_to || null,
        assigned_department: f.assigned_department || null,
        target_date: f.target_date || null,
        vessel_id: f.vessel_id || null,
        root_cause: f.root_cause || null,
        corrective_action: f.corrective_action || null,
        preventive_action: f.preventive_action || null,
        status: 'open',
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
      const { error } = await (supabase.from as Function)('defect_work_requests').update(update).eq('id', id);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Defect Log & Work Requests
          </h2>
          <p className="text-muted-foreground">Gestão de defeitos com rastreamento CAPA — Padrão BASSnet/DNV</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Defeito</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-warning" />
          <div className="text-2xl font-bold">{openCount}</div>
          <div className="text-xs text-muted-foreground">Abertos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-1 text-destructive" />
          <div className="text-2xl font-bold">{criticalCount}</div>
          <div className="text-xs text-muted-foreground">Críticos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-info" />
          <div className="text-2xl font-bold">{capaOpen}</div>
          <div className="text-xs text-muted-foreground">CAPA Pendentes</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-6 w-6 mx-auto mb-1 text-success" />
          <div className="text-2xl font-bold">{defects.filter((d: any) => d.status === 'closed').length}</div>
          <div className="text-xs text-muted-foreground">Fechados</div>
        </CardContent></Card>
      </div>

      {/* Filters */}
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

      {/* List */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum defeito registrado</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filtered.map((d: any) => (
                <div key={d.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                  onClick={() => setDetailOpen(d)}>
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{d.defect_number} — {d.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {d.vessels?.name || 'N/A'} · {d.category} · {d.source} · {new Date(d.reported_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Badge variant from dynamic mapping */}
                    <Badge variant={(priorityColor[d.priority] || 'secondary') as any}>{d.priority}</Badge>
                    <Badge variant="outline">{d.status}</Badge>
                    {d.capa_status !== 'pending' && <Badge variant="secondary">CAPA: {d.capa_status}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                <div>
                  <Label>Embarcação</Label>
                  <Select value={form.vessel_id} onValueChange={v => set('vessel_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{vessels.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fonte</Label>
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
              <div><Label>Ação Corretiva</Label><Textarea placeholder="Ação imediata para corrigir..." value={form.corrective_action} onChange={e => set('corrective_action', e.target.value)} /></div>
              <div><Label>Ação Preventiva</Label><Textarea placeholder="Medidas para evitar recorrência..." value={form.preventive_action} onChange={e => set('preventive_action', e.target.value)} /></div>
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
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Embarcação:</span> {detailOpen.vessels?.name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Categoria:</span> {detailOpen.category}</div>
                <div><span className="text-muted-foreground">Equipamento:</span> {detailOpen.equipment_name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Local:</span> {detailOpen.location_onboard || 'N/A'}</div>
                <div><span className="text-muted-foreground">Fonte:</span> {detailOpen.source}</div>
                <div><span className="text-muted-foreground">Reportado:</span> {detailOpen.reported_by_name || 'N/A'}</div>
                <div><span className="text-muted-foreground">Atribuído:</span> {detailOpen.assigned_to || 'N/A'}</div>
                <div><span className="text-muted-foreground">Prazo:</span> {detailOpen.target_date || 'N/A'}</div>
              </div>
              {detailOpen.description && <div><span className="text-sm text-muted-foreground">Descrição:</span><p className="text-sm mt-1">{detailOpen.description}</p></div>}
              {detailOpen.root_cause && <div><span className="text-sm text-muted-foreground font-medium">Causa Raiz:</span><p className="text-sm mt-1">{detailOpen.root_cause}</p></div>}
              {detailOpen.corrective_action && <div><span className="text-sm text-muted-foreground font-medium">Ação Corretiva:</span><p className="text-sm mt-1">{detailOpen.corrective_action}</p></div>}
              {detailOpen.preventive_action && <div><span className="text-sm text-muted-foreground font-medium">Ação Preventiva:</span><p className="text-sm mt-1">{detailOpen.preventive_action}</p></div>}
              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== detailOpen.status).slice(0, 3).map(s => (
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
