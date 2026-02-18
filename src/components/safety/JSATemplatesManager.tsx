/**
 * JSA Templates Manager — Wave 5 QHSE Quick Win
 * Job Safety Analysis templates por tipo de trabalho
 * BEATS: ToolKitX (JSA + standardized templates)
 */
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateJSATemplate } from '@/hooks/useModuleHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, Plus, FileCheck, AlertTriangle, HardHat } from 'lucide-react';

const JOB_TYPES = [
  { value: 'hot_work', label: 'Hot Work', icon: '🔥' },
  { value: 'confined_space', label: 'Confined Space', icon: '🚪' },
  { value: 'working_at_height', label: 'Working at Height', icon: '🏗️' },
  { value: 'lifting', label: 'Lifting Operations', icon: '🏋️' },
  { value: 'diving', label: 'Diving', icon: '🤿' },
  { value: 'electrical', label: 'Electrical Work', icon: '⚡' },
  { value: 'painting', label: 'Painting/Coating', icon: '🎨' },
  { value: 'tank_cleaning', label: 'Tank Cleaning', icon: '🧹' },
  { value: 'mooring', label: 'Mooring Operations', icon: '⚓' },
  { value: 'cargo_operations', label: 'Cargo Operations', icon: '📦' },
];

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

export function JSATemplatesManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['jsa-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('jsa_templates')
        .select('*')
        .order('job_type');
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useCreateJSATemplate();

  const filtered = selectedType === 'all' ? templates : templates.filter((t: Record<string, unknown>) => t.job_type === selectedType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            JSA — Job Safety Analysis
          </h3>
          <p className="text-sm text-muted-foreground">{templates.length} templates • {JOB_TYPES.length} tipos de trabalho</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Novo Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo JSA Template</DialogTitle></DialogHeader>
            <CreateJSAForm onSubmit={(f) => createMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Job Type */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={selectedType === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedType('all')}>
          Todos ({templates.length})
        </Badge>
        {JOB_TYPES.map(jt => {
          const count = templates.filter((t: Record<string, unknown>) => t.job_type === jt.value).length;
          return (
            <Badge
              key={jt.value}
              variant={selectedType === jt.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedType(jt.value)}
            >
              {jt.icon} {jt.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((tpl: Record<string, unknown>) => {
          const jobType = JOB_TYPES.find(j => j.value === tpl.job_type);
          const hazards = (tpl.hazards as Array<Record<string, string>>) || [];
          const controls = (tpl.control_measures as Array<Record<string, string>>) || [];
          const ppe = (tpl.ppe_required as string[]) || [];

          return (
            <Card key={tpl.id as string}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span>{jobType?.icon}</span> {tpl.title as string}
                  </CardTitle>
                  <Badge className={RISK_COLORS[tpl.risk_level as string]}>{tpl.risk_level as string}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{String(tpl.description || '')}</p>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-destructive" /> {hazards.length} perigos
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3 text-primary" /> {controls.length} controles
                  </span>
                  <span className="flex items-center gap-1">
                    <HardHat className="h-3 w-3 text-warning" /> {ppe.length} EPI
                  </span>
                </div>
                {(tpl.regulatory_reference as string) && (
                  <p className="text-xs text-muted-foreground">Ref: {String(tpl.regulatory_reference)}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && !isLoading && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum template JSA encontrado</CardContent></Card>
      )}
    </div>
  );
}

function CreateJSAForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    title: '', job_type: 'hot_work', description: '', risk_level: 'medium',
    regulatory_reference: '', hazards_text: '', controls_text: '', ppe_text: '',
  });
  return (
    <div className="space-y-3">
      <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo de Trabalho</Label>
          <Select value={form.job_type} onValueChange={v => setForm(f => ({ ...f, job_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{JOB_TYPES.map(j => <SelectItem key={j.value} value={j.value}>{j.icon} {j.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nível de Risco</Label>
          <Select value={form.risk_level} onValueChange={v => setForm(f => ({ ...f, risk_level: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixo</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div><Label>Perigos (um por linha)</Label><Textarea value={form.hazards_text} onChange={e => setForm(f => ({ ...f, hazards_text: e.target.value }))} placeholder="Ex: Burns, Electrocution" /></div>
      <div><Label>Medidas de Controle (um por linha)</Label><Textarea value={form.controls_text} onChange={e => setForm(f => ({ ...f, controls_text: e.target.value }))} placeholder="Ex: Fire watch, Gas free certificate" /></div>
      <div><Label>EPI (separado por vírgula)</Label><Input value={form.ppe_text} onChange={e => setForm(f => ({ ...f, ppe_text: e.target.value }))} placeholder="Helmet, Gloves, Safety glasses" /></div>
      <div><Label>Referência Regulatória</Label><Input value={form.regulatory_reference} onChange={e => setForm(f => ({ ...f, regulatory_reference: e.target.value }))} placeholder="Ex: SOLAS Ch. II-2, IMO MSC.1/Circ.1321" /></div>
      <Button className="w-full" onClick={() => onSubmit({
        title: form.title,
        job_type: form.job_type,
        description: form.description,
        risk_level: form.risk_level,
        regulatory_reference: form.regulatory_reference,
        hazards: form.hazards_text.split('\n').filter(Boolean).map(h => ({ hazard: h.trim() })),
        control_measures: form.controls_text.split('\n').filter(Boolean).map(c => ({ measure: c.trim() })),
        ppe_required: form.ppe_text.split(',').map(p => p.trim()).filter(Boolean),
        is_active: true,
      })}>Criar Template JSA</Button>
    </div>
  );
}
