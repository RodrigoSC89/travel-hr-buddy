/**
 * Hull Integrity & Inspections Manager
 * Benchmarks: DNV ShipManager, BASSnet, ClassNK
 * Thickness readings, coating condition, zone-based inspections
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
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Shield, Plus, Eye, AlertTriangle, CheckCircle, Search, Ruler,
  Camera, Anchor, Layers
} from 'lucide-react';

const ZONES = ['deck', 'bottom', 'port-side', 'starboard', 'bow', 'stern', 'ballast-tanks', 'cargo-hold'];
const INSPECTION_TYPES = ['general', 'close-up', 'thickness', 'underwater', 'coating'];
const CONDITIONS = ['good', 'fair', 'poor', 'critical'];
const FINDING_TYPES = ['corrosion', 'crack', 'dent', 'coating-breakdown', 'wastage', 'buckling', 'pitting'];

export default function HullIntegrityManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [findingOpen, setFindingOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const defaultInspection = { vessel_id: '', inspection_type: 'general', zone: 'deck', inspector_name: '', overall_condition: 'good', notes: '', class_requirement: false };
  const [inspForm, setInspForm] = useState(defaultInspection);

  const defaultFinding = { finding_type: 'corrosion', zone: 'deck', frame_number: '', thickness_reading: '', original_thickness: '', priority: 'medium', notes: '', repair_method: '' };
  const [findForm, setFindForm] = useState(defaultFinding);

  const { data: vessels = [] } = useQuery({
    queryKey: ['hull-vessels'],
    queryFn: async () => { const { data } = await supabase.from('vessels').select('id, name').order('name'); return data || []; },
  });

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['hull-inspections'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('hull_integrity_records')
        .select('*, vessels:vessel_id(name)')
        .order('inspection_date', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        ...r,
        overall_condition: r.coating_condition || 'good',
        class_requirement: false,
      }));
    },
  });

  // Findings are embedded in the same table — filter by severity
  const findings = inspections.filter((i: Record<string, unknown>) => i.findings);

  const createInspMutation = useMutation({
    mutationFn: async (f: typeof inspForm) => {
      const { error } = await (supabase.from as Function)('hull_integrity_records').insert({
        vessel_id: f.vessel_id || null,
        inspection_type: f.inspection_type,
        zone: f.zone,
        inspector_name: f.inspector_name || null,
        coating_condition: f.overall_condition,
        findings: f.notes || null,
        status: 'open',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hull-inspections'] });
      toast.success('Inspeção registrada!');
      setCreateOpen(false);
      setInspForm(defaultInspection);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createFindingMutation = useMutation({
    mutationFn: async ({ inspectionId, f }: { inspectionId: string; f: typeof findForm }) => {
      const wastage = f.original_thickness && f.thickness_reading
        ? (((Number(f.original_thickness) - Number(f.thickness_reading)) / Number(f.original_thickness)) * 100).toFixed(1)
        : null;
      const { error } = await (supabase.from as Function)('hull_integrity_records').insert({
        inspection_type: 'thickness',
        zone: f.zone,
        location: f.frame_number || null,
        plate_thickness_mm: f.thickness_reading ? Number(f.thickness_reading) : null,
        original_thickness_mm: f.original_thickness ? Number(f.original_thickness) : null,
        diminution_percent: wastage ? Number(wastage) : null,
        corrosion_type: f.finding_type,
        severity: f.priority,
        findings: f.notes || null,
        recommended_action: f.repair_method || null,
        status: 'open',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hull-inspections'] });
      toast.success('Achado registrado!');
      setFindingOpen(null);
      setFindForm(defaultFinding);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const conditionColor: Record<string, string> = { good: 'default', fair: 'secondary', poor: 'destructive', critical: 'destructive' };
  const openFindings = findings.filter((f: any) => f.status === 'open').length;
  const criticalFindings = findings.filter((f: any) => f.priority === 'critical').length;
  const avgWastage = findings.filter((f: any) => f.wastage_percent).length > 0
    ? (findings.filter((f: any) => f.wastage_percent).reduce((s: number, f: any) => s + Number(f.wastage_percent), 0) / findings.filter((f: any) => f.wastage_percent).length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Hull Integrity & Inspections
          </h2>
          <p className="text-muted-foreground">Espessura, coating, defeitos estruturais — Padrão DNV/ClassNK</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Nova Inspeção</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Eye className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{inspections.length}</div>
          <div className="text-xs text-muted-foreground">Inspeções</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-warning" />
          <div className="text-2xl font-bold">{openFindings}</div>
          <div className="text-xs text-muted-foreground">Achados Abertos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-destructive" />
          <div className="text-2xl font-bold">{criticalFindings}</div>
          <div className="text-xs text-muted-foreground">Críticos</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Ruler className="h-6 w-6 mx-auto mb-1 text-info" />
          <div className="text-2xl font-bold">{avgWastage}%</div>
          <div className="text-xs text-muted-foreground">Wastage Médio</div>
        </CardContent></Card>
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader><CardTitle>Inspeções Registradas</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : inspections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma inspeção registrada</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {inspections.map((insp: any) => {
                const inspFindings = findings.filter((f: any) => f.inspection_id === insp.id);
                return (
                  <div key={insp.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{insp.vessels?.name || 'N/A'} — {insp.inspection_type} ({insp.zone})</div>
                        <div className="text-sm text-muted-foreground">
                          {insp.inspection_date} · {insp.inspector_name || 'N/A'}
                          {insp.class_requirement && ' · Classe'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Badge variant from dynamic mapping */}
                        <Badge variant={(conditionColor[insp.overall_condition] || 'secondary') as "default" | "secondary" | "destructive" | "outline"}>{insp.overall_condition}</Badge>
                        <Badge variant="outline">{inspFindings.length} achados</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setFindingOpen(insp.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {inspFindings.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-muted space-y-1">
                        {inspFindings.slice(0, 3).map((f: any) => (
                          <div key={f.id} className="text-sm flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{f.finding_type}</Badge>
                            {f.thickness_reading && <span>Espessura: {f.thickness_reading}mm</span>}
                            {f.wastage_percent && <span className="text-destructive">({f.wastage_percent}% wastage)</span>}
                          </div>
                        ))}
                        {inspFindings.length > 3 && <p className="text-xs text-muted-foreground">+{inspFindings.length - 3} mais</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Inspection Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Inspeção de Casco</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Embarcação</Label>
              <Select value={inspForm.vessel_id} onValueChange={v => setInspForm(p => ({ ...p, vessel_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{vessels.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={inspForm.inspection_type} onValueChange={v => setInspForm(p => ({ ...p, inspection_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INSPECTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Zona</Label>
                <Select value={inspForm.zone} onValueChange={v => setInspForm(p => ({ ...p, zone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspetor</Label><Input value={inspForm.inspector_name} onChange={e => setInspForm(p => ({ ...p, inspector_name: e.target.value }))} /></div>
              <div>
                <Label>Condição</Label>
                <Select value={inspForm.overall_condition} onValueChange={v => setInspForm(p => ({ ...p, overall_condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notas</Label><Textarea value={inspForm.notes} onChange={e => setInspForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => createInspMutation.mutate(inspForm)} disabled={createInspMutation.isPending || !inspForm.vessel_id}>
              {createInspMutation.isPending ? 'Salvando...' : 'Registrar Inspeção'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Finding Dialog */}
      <Dialog open={!!findingOpen} onOpenChange={() => setFindingOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Adicionar Achado</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={findForm.finding_type} onValueChange={v => setFindForm(p => ({ ...p, finding_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FINDING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Zona</Label>
                <Select value={findForm.zone} onValueChange={v => setFindForm(p => ({ ...p, zone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Frame / Caverna</Label><Input placeholder="Ex: FR 45-50" value={findForm.frame_number} onChange={e => setFindForm(p => ({ ...p, frame_number: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Espessura Medida (mm)</Label><Input type="number" step="0.01" value={findForm.thickness_reading} onChange={e => setFindForm(p => ({ ...p, thickness_reading: e.target.value }))} /></div>
              <div><Label>Espessura Original (mm)</Label><Input type="number" step="0.01" value={findForm.original_thickness} onChange={e => setFindForm(p => ({ ...p, original_thickness: e.target.value }))} /></div>
            </div>
            {findForm.thickness_reading && findForm.original_thickness && (
              <div className="p-2 bg-muted rounded text-sm">
                Wastage: <strong className="text-destructive">
                  {(((Number(findForm.original_thickness) - Number(findForm.thickness_reading)) / Number(findForm.original_thickness)) * 100).toFixed(1)}%
                </strong>
              </div>
            )}
            <div>
              <Label>Prioridade</Label>
              <Select value={findForm.priority} onValueChange={v => setFindForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['low','medium','high','critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Método de Reparo</Label><Input value={findForm.repair_method} onChange={e => setFindForm(p => ({ ...p, repair_method: e.target.value }))} /></div>
            <div><Label>Notas</Label><Textarea value={findForm.notes} onChange={e => setFindForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => findingOpen && createFindingMutation.mutate({ inspectionId: findingOpen, f: findForm })} disabled={createFindingMutation.isPending}>
              {createFindingMutation.isPending ? 'Salvando...' : 'Adicionar Achado'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
