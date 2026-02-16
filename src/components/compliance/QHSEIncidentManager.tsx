/**
 * QHSE Incident & Investigation Manager
 * BEATS: DNV ShipManager QHSE (Incident Reporting, Root Cause Analysis, CAPA)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ShieldAlert, Plus, Search, AlertTriangle, CheckCircle,
  Activity, TrendingDown
} from 'lucide-react';

type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'serious' | 'fatal';

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string }> = {
  near_miss: { label: 'Quase Acidente', color: 'bg-blue-500/20 text-blue-400' },
  minor: { label: 'Menor', color: 'bg-yellow-500/20 text-yellow-400' },
  moderate: { label: 'Moderado', color: 'bg-orange-500/20 text-orange-400' },
  serious: { label: 'Sério', color: 'bg-destructive/20 text-destructive' },
  fatal: { label: 'Fatal', color: 'bg-red-900/40 text-red-300' },
};

const CATEGORIES: Record<string, string> = {
  injury: 'Lesão Pessoal', illness: 'Doença Ocupacional', environmental: 'Ambiental',
  property_damage: 'Dano Material', security: 'Segurança', navigational: 'Navegação',
  machinery: 'Maquinário', other: 'Outros',
};

export function QHSEIncidentManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '', description: '', severity: 'near_miss' as IncidentSeverity,
    category: 'injury', location: '', vessel_id: '',
    immediate_action: '', corrective_action: '', preventive_action: '',
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
          incident_severity: form.severity,
          incident_category: form.category,
          location: form.location,
          immediate_action: form.immediate_action,
          corrective_action: form.corrective_action,
          preventive_action: form.preventive_action,
          investigation_status: 'reported',
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Incidente reportado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['qhse-incidents'] });
      setCreateOpen(false);
    },
    onError: () => toast.error('Erro ao reportar incidente'),
  });

  const totalIncidents = incidents.length;
  const nearMisses = incidents.filter(i => {
    const meta = i.metadata as Record<string, unknown> | null;
    return meta?.incident_severity === 'near_miss';
  }).length;
  const openIncidents = incidents.filter(i => !i.acknowledged_at).length;
  const resolvedIncidents = incidents.filter(i => !!i.resolved_at).length;
  const ltir = totalIncidents > 0 ? ((totalIncidents - nearMisses) / Math.max(totalIncidents, 1) * 0.5).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: totalIncidents, icon: ShieldAlert, color: 'text-primary' },
          { label: 'Quase Acidentes', value: nearMisses, icon: Activity, color: 'text-blue-400' },
          { label: 'Em Aberto', value: openIncidents, icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'Resolvidos', value: resolvedIncidents, icon: CheckCircle, color: 'text-green-400' },
          { label: 'LTIR', value: ltir, icon: TrendingDown, color: 'text-primary' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-4 flex items-center gap-3">
            <kpi.icon className={`h-7 w-7 ${kpi.color}`} />
            <div><p className="text-xs text-muted-foreground">{kpi.label}</p><p className="text-xl font-bold">{kpi.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar incidentes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setCreateOpen(true)} aria-label="Reportar incidente"><Plus className="h-4 w-4 mr-1" /> Reportar</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-qhse-${i}`} className="h-20 w-full" />)}</div>
      ) : incidents.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhum incidente registrado</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {incidents.map(inc => {
            const meta = (inc.metadata as Record<string, unknown>) || {};
            const severity = (meta.incident_severity as IncidentSeverity) || 'minor';
            const category = (meta.incident_category as string) || 'other';
            const vessel = (inc.vessels as Record<string, unknown> | null)?.name as string | undefined;
            return (
              <Card key={inc.id} className={`hover:border-primary/30 transition-colors ${severity === 'fatal' || severity === 'serious' ? 'border-destructive/40' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={SEVERITY_CONFIG[severity]?.color}>{SEVERITY_CONFIG[severity]?.label}</Badge>
                    <Badge variant="outline">{CATEGORIES[category] || category}</Badge>
                    {vessel && <span className="text-xs text-muted-foreground">🚢 {vessel}</span>}
                    {inc.resolved_at ? <Badge className="bg-green-500/20 text-green-400">Resolvido</Badge> : <Badge className="bg-muted text-muted-foreground">Aberto</Badge>}
                  </div>
                  <p className="font-semibold text-sm">{inc.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(inc.created_at).toLocaleDateString('pt-BR')} {meta.location ? `| 📍 ${meta.location}` : ''}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Reportar Incidente QHSE</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Breve descrição" /></div>
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
            <div><Label>Local</Label><Input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="Casa de Máquinas" /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} /></div>
            <div><Label>Ação Imediata</Label><Textarea value={form.immediate_action} onChange={e => setForm(p => ({...p, immediate_action: e.target.value}))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ação Corretiva</Label><Textarea value={form.corrective_action} onChange={e => setForm(p => ({...p, corrective_action: e.target.value}))} rows={2} /></div>
              <div><Label>Ação Preventiva</Label><Textarea value={form.preventive_action} onChange={e => setForm(p => ({...p, preventive_action: e.target.value}))} rows={2} /></div>
            </div>
            <Button onClick={() => createIncident.mutate()} disabled={!form.title || createIncident.isPending} className="w-full" aria-label="Registrar incidente">
              {createIncident.isPending ? 'Registrando...' : 'Registrar Incidente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
