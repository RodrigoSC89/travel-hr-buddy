/**
 * Port Call Manager - Full Supabase Integration
 * Complete port call lifecycle management with real persistence
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Anchor, Plus, Search, Edit, Trash2, Calendar, Clock,
  Ship, MapPin, FileText, CheckCircle, AlertTriangle,
  Play, StopCircle, Download, Filter
} from 'lucide-react';

interface PortCallForm {
  vessel_name: string;
  port_name: string;
  port_code: string;
  purpose: string;
  status: string;
  eta: string;
  etd: string;
  ata: string;
  atd: string;
  berth: string;
  agent: string;
  pilot_required: boolean;
  tug_required: boolean;
  cargo_operations: string;
  notes: string;
}

const emptyForm: PortCallForm = {
  vessel_name: '', port_name: '', port_code: '', purpose: 'loading',
  status: 'planned', eta: '', etd: '', ata: '', atd: '',
  berth: '', agent: '', pilot_required: true, tug_required: false,
  cargo_operations: '', notes: ''
};

const dynamicFrom = supabase.from as Function;

export function PortCallManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortCallForm>(emptyForm);
  const queryClient = useQueryClient();

  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ['port-calls'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('port_calls')
        .select('*')
        .order('eta', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (form: PortCallForm & { id?: string }) => {
      const payload = {
        vessel_name: form.vessel_name,
        port_name: form.port_name,
        port_code: form.port_code,
        purpose: form.purpose,
        status: form.status,
        eta: form.eta || null,
        etd: form.etd || null,
        ata: form.ata || null,
        atd: form.atd || null,
        berth: form.berth || null,
        agent: form.agent || null,
        pilot_required: form.pilot_required,
        tug_required: form.tug_required,
        cargo_operations: form.cargo_operations || null,
        notes: form.notes || null,
        call_id: `PC-${Date.now().toString(36).toUpperCase()}`,
        updated_at: new Date().toISOString(),
      };
      if (form.id) {
        const { error } = await dynamicFrom('port_calls').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await dynamicFrom('port_calls').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['port-calls'] });
      toast.success(editingId ? 'Escala atualizada' : 'Escala criada');
      setIsFormOpen(false);
      setEditingId(null);
    },
    onError: () => toast.error('Erro ao salvar escala'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dynamicFrom('port_calls').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['port-calls'] });
      toast.success('Escala excluída');
      setIsDeleteOpen(false);
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status, extras }: { id: string; status: string; extras?: Record<string, unknown> }) => {
      const { error } = await dynamicFrom('port_calls')
        .update({ status, ...extras, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['port-calls'] });
      toast.success('Status atualizado');
    },
  });

  const activeStatuses = ['planned', 'approaching', 'berthed', 'operations'];

  const filteredCalls = useMemo(() => portCalls.filter((call: Record<string, unknown>) => {
    const name = String(call.vessel_name || '').toLowerCase();
    const port = String(call.port_name || '').toLowerCase();
    const callId = String(call.call_id || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    const matchesSearch = name.includes(s) || port.includes(s) || callId.includes(s);
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const status = String(call.status);
    const matchesTab = activeTab === 'active'
      ? activeStatuses.includes(status)
      : ['completed', 'cancelled'].includes(status);
    return matchesSearch && matchesStatus && matchesTab;
  }), [portCalls, searchTerm, statusFilter, activeTab]);

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setIsFormOpen(true); };
  const openEdit = (call: Record<string, unknown>) => {
    setEditingId(String(call.id));
    setFormData({
      vessel_name: String(call.vessel_name || ''),
      port_name: String(call.port_name || ''),
      port_code: String(call.port_code || ''),
      purpose: String(call.purpose || 'loading'),
      status: String(call.status || 'planned'),
      eta: String(call.eta || '').slice(0, 16),
      etd: String(call.etd || '').slice(0, 16),
      ata: String(call.ata || '').slice(0, 16),
      atd: String(call.atd || '').slice(0, 16),
      berth: String(call.berth || ''),
      agent: String(call.agent || ''),
      pilot_required: Boolean(call.pilot_required),
      tug_required: Boolean(call.tug_required),
      cargo_operations: String(call.cargo_operations || ''),
      notes: String(call.notes || ''),
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.vessel_name || !formData.port_name || !formData.eta) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    saveMutation.mutate({ ...formData, id: editingId || undefined });
  };

  const handleStatusChange = (call: Record<string, unknown>, newStatus: string) => {
    const extras: Record<string, unknown> = {};
    if (newStatus === 'berthed' && !call.ata) extras.ata = new Date().toISOString();
    if (newStatus === 'completed' && !call.atd) extras.atd = new Date().toISOString();
    statusUpdateMutation.mutate({ id: String(call.id), status: newStatus, extras });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Calendar }> = {
      planned: { label: 'Planejada', variant: 'secondary', icon: Calendar },
      approaching: { label: 'Aproximando', variant: 'default', icon: Ship },
      berthed: { label: 'Atracado', variant: 'default', icon: Anchor },
      operations: { label: 'Em Operação', variant: 'default', icon: Play },
      completed: { label: 'Concluída', variant: 'outline', icon: CheckCircle },
      cancelled: { label: 'Cancelada', variant: 'destructive', icon: StopCircle },
    };
    const c = config[status] || { label: status, variant: 'outline' as const, icon: Calendar };
    const Icon = c.icon;
    return <Badge variant={c.variant} className="flex items-center gap-1"><Icon className="h-3 w-3" />{c.label}</Badge>;
  };

  const purposeLabels: Record<string, string> = {
    loading: 'Carregamento', discharge: 'Descarga', bunkering: 'Abastecimento',
    repairs: 'Reparos', crew_change: 'Troca de Tripulação', provisions: 'Provisões', mixed: 'Misto'
  };

  const activeCount = portCalls.filter((c: Record<string, unknown>) => activeStatuses.includes(String(c.status))).length;
  const historyCount = portCalls.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />Gestão de Escalas Portuárias
          </h2>
          <p className="text-muted-foreground">{activeCount} escalas ativas</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Escala</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativas ({activeCount})</TabsTrigger>
          <TabsTrigger value="completed">Histórico ({historyCount})</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="planned">Planejada</SelectItem>
              <SelectItem value="approaching">Aproximando</SelectItem>
              <SelectItem value="berthed">Atracado</SelectItem>
              <SelectItem value="operations">Em Operação</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filteredCalls.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma escala encontrada</p>
              {activeTab === 'active' && <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Escala</Button>}
            </CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {filteredCalls.map((call: Record<string, unknown>) => (
                <Card key={String(call.id)}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono font-bold text-sm">{String(call.call_id || '')}</span>
                          {getStatusBadge(String(call.status))}
                          <Badge variant="outline">{purposeLabels[String(call.purpose)] || String(call.purpose)}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Embarcação</p>
                            <p className="font-medium text-sm flex items-center gap-1"><Ship className="h-3.5 w-3.5" />{String(call.vessel_name)}</p>
                          </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Porto</p>
                            <p className="font-medium text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{String(call.port_name)} {call.port_code ? `(${String(call.port_code)})` : ''}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ETA</p>
                            <p className="font-medium text-sm">{call.eta ? new Date(String(call.eta)).toLocaleString('pt-BR') : '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ETD</p>
                            <p className="font-medium text-sm">{call.etd ? new Date(String(call.etd)).toLocaleString('pt-BR') : '—'}</p>
                          </div>
                        </div>
                        {call.cargo_operations ? <p className="text-xs bg-muted p-2 rounded mb-2">📦 {String(call.cargo_operations)}</p> : null}
                        <div className="flex gap-2 flex-wrap">
                          {Boolean(call.pilot_required) && <Badge variant="secondary" className="text-xs">Piloto</Badge>}
                          {Boolean(call.tug_required) && <Badge variant="secondary" className="text-xs">Rebocador</Badge>}
                          {call.agent ? <Badge variant="outline" className="text-xs">{'👤 ' + String(call.agent)}</Badge> : null}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 ml-4">
                        {String(call.status) === 'planned' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'approaching')}><Ship className="h-3 w-3 mr-1" />Aproximar</Button>
                        )}
                        {String(call.status) === 'approaching' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'berthed')}><Anchor className="h-3 w-3 mr-1" />Atracar</Button>
                        )}
                        {String(call.status) === 'berthed' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'operations')}><Play className="h-3 w-3 mr-1" />Operar</Button>
                        )}
                        {String(call.status) === 'operations' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'completed')}><CheckCircle className="h-3 w-3 mr-1" />Concluir</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(call)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeletingId(String(call.id)); setIsDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Editar Escala' : 'Nova Escala'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Embarcação *</Label><Input value={formData.vessel_name} onChange={e => setFormData(p => ({ ...p, vessel_name: e.target.value }))} /></div>
              <div><Label>Porto *</Label><Input value={formData.port_name} onChange={e => setFormData(p => ({ ...p, port_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código Porto</Label><Input value={formData.port_code} onChange={e => setFormData(p => ({ ...p, port_code: e.target.value }))} placeholder="BRSSZ" /></div>
              <div>
                <Label>Propósito</Label>
                <Select value={formData.purpose} onValueChange={v => setFormData(p => ({ ...p, purpose: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(purposeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ETA *</Label><Input type="datetime-local" value={formData.eta} onChange={e => setFormData(p => ({ ...p, eta: e.target.value }))} /></div>
              <div><Label>ETD</Label><Input type="datetime-local" value={formData.etd} onChange={e => setFormData(p => ({ ...p, etd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Berço</Label><Input value={formData.berth} onChange={e => setFormData(p => ({ ...p, berth: e.target.value }))} /></div>
              <div><Label>Agente</Label><Input value={formData.agent} onChange={e => setFormData(p => ({ ...p, agent: e.target.value }))} /></div>
            </div>
            <div><Label>Operações de Carga</Label><Textarea value={formData.cargo_operations} onChange={e => setFormData(p => ({ ...p, cargo_operations: e.target.value }))} /></div>
            <div><Label>Notas</Label><Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Tem certeza que deseja excluir esta escala?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate(deletingId)} disabled={deleteMutation.isPending}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
