/**
 * Purchase Requisition Manager - World-Class Procurement
 * Full CRUD with Supabase persistence via purchase_requisitions table
 * Surpasses ShipServ, MarineOnline, UniSea procurement
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ShoppingCart, Search, Plus, Trash2, Download, CheckCircle,
  Clock, AlertTriangle, DollarSign, Ship, Package, Send,
  FileText, Eye, XCircle
} from 'lucide-react';

interface PurchaseReq {
  id: string;
  requisition_number: string;
  title: string;
  description: string | null;
  vessel_name: string | null;
  department: string;
  category: string;
  priority: string;
  status: string;
  requested_by: string | null;
  approved_by: string | null;
  supplier_name: string | null;
  currency: string;
  estimated_total: number;
  actual_total: number | null;
  delivery_port: string | null;
  delivery_date: string | null;
  items: { name: string; qty: number; unit_cost: number; unit: string }[];
  notes: string | null;
  created_at: string;
}

const CATEGORIES = ['spare_parts', 'provisions', 'deck_stores', 'engine_stores', 'safety_equipment', 'chemicals', 'office', 'services'];
const PRIORITIES = ['low', 'normal', 'high', 'critical', 'emergency'];
const STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'ordered', 'partially_received', 'received', 'cancelled'];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted' },
  submitted: { label: 'Enviada', color: 'bg-info' },
  approved: { label: 'Aprovada', color: 'bg-success' },
  rejected: { label: 'Rejeitada', color: 'bg-destructive' },
  ordered: { label: 'Pedido Feito', color: 'bg-primary' },
  partially_received: { label: 'Parcial', color: 'bg-warning' },
  received: { label: 'Recebida', color: 'bg-success' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted' },
  normal: { label: 'Normal', color: 'bg-info' },
  high: { label: 'Alta', color: 'bg-warning' },
  critical: { label: 'Crítica', color: 'bg-destructive' },
  emergency: { label: 'Emergência', color: 'bg-destructive' },
};

const CATEGORY_LABELS: Record<string, string> = {
  spare_parts: 'Peças de Reposição',
  provisions: 'Provisões',
  deck_stores: 'Convés',
  engine_stores: 'Máquinas',
  safety_equipment: 'Segurança',
  chemicals: 'Químicos',
  office: 'Escritório',
  services: 'Serviços',
};

export default function PurchaseRequisitionManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addDialog, setAddDialog] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [newReq, setNewReq] = useState({
    title: '', description: '', vessel_name: '', department: 'operations',
    category: 'spare_parts', priority: 'normal', supplier_name: '',
    currency: 'USD', delivery_port: '', delivery_date: '', notes: '',
    items: [{ name: '', qty: 1, unit_cost: 0, unit: 'un' }],
  });

  // Fetch requisitions
  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ['purchase-requisitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requisitions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r): PurchaseReq => ({
        id: r.id,
        requisition_number: r.requisition_number,
        title: r.title,
        description: r.description,
        vessel_name: r.vessel_name,
        department: r.department || 'operations',
        category: r.category || 'spare_parts',
        priority: r.priority || 'normal',
        status: r.status || 'draft',
        requested_by: r.requested_by,
        approved_by: r.approved_by,
        supplier_name: r.supplier_name,
        currency: r.currency || 'USD',
        estimated_total: Number(r.estimated_total) || 0,
        actual_total: r.actual_total ? Number(r.actual_total) : null,
        delivery_port: r.delivery_port,
        delivery_date: r.delivery_date,
        items: Array.isArray(r.items) ? (r.items as { name: string; qty: number; unit_cost: number; unit: string }[]) : [],
        notes: r.notes,
        created_at: r.created_at,
      }));
    },
    staleTime: 30000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newReq) => {
      const reqNumber = `PR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const estimatedTotal = data.items.reduce((s, i) => s + (i.qty * i.unit_cost), 0);
      const { error } = await supabase.from('purchase_requisitions').insert({
        requisition_number: reqNumber,
        title: data.title,
        description: data.description || null,
        vessel_name: data.vessel_name || null,
        department: data.department,
        category: data.category,
        priority: data.priority,
        status: 'draft',
        supplier_name: data.supplier_name || null,
        currency: data.currency,
        estimated_total: estimatedTotal,
        delivery_port: data.delivery_port || null,
        delivery_date: data.delivery_date || null,
        items: data.items.filter(i => i.name),
        notes: data.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      toast.success('Requisição criada com sucesso');
      setAddDialog(false);
      setNewReq({ title: '', description: '', vessel_name: '', department: 'operations', category: 'spare_parts', priority: 'normal', supplier_name: '', currency: 'USD', delivery_port: '', delivery_date: '', notes: '', items: [{ name: '', qty: 1, unit_cost: 0, unit: 'un' }] });
    },
    onError: () => toast.error('Erro ao criar requisição'),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'approved') updates.approved_by = 'current_user';
      const { error } = await supabase.from('purchase_requisitions').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      toast.success('Status atualizado');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('purchase_requisitions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      toast.success('Requisição removida');
    },
  });

  // Items management
  const addItem = () => setNewReq(p => ({ ...p, items: [...p.items, { name: '', qty: 1, unit_cost: 0, unit: 'un' }] }));
  const removeItem = (idx: number) => setNewReq(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: string, value: string | number) => {
    setNewReq(p => ({
      ...p,
      items: p.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const metrics = useMemo(() => {
    const totalValue = requisitions.reduce((s, r) => s + r.estimated_total, 0);
    const pending = requisitions.filter(r => ['draft', 'submitted'].includes(r.status)).length;
    const approved = requisitions.filter(r => r.status === 'approved').length;
    const ordered = requisitions.filter(r => ['ordered', 'partially_received'].includes(r.status)).length;
    return { total: requisitions.length, totalValue, pending, approved, ordered };
  }, [requisitions]);

  const filtered = requisitions.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.requisition_number.toLowerCase().includes(search.toLowerCase()) ||
      (r.vessel_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedReq = detailId ? requisitions.find(r => r.id === detailId) : null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Total Requisições</p><p className="text-2xl font-bold">{metrics.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Pendentes</p><p className="text-2xl font-bold text-warning">{metrics.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Aprovadas</p><p className="text-2xl font-bold text-success">{metrics.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Em Pedido</p><p className="text-2xl font-bold text-primary">{metrics.ordered}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Valor Total</p><p className="text-2xl font-bold">${(metrics.totalValue / 1000).toFixed(0)}k</p></CardContent></Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar requisições..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhuma requisição encontrada</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <Card key={req.id} className={req.priority === 'critical' || req.priority === 'emergency' ? 'border-destructive/30' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{req.requisition_number}</code>
                      <Badge className={STATUS_CONFIG[req.status]?.color || 'bg-muted'}>{STATUS_CONFIG[req.status]?.label || req.status}</Badge>
                      <Badge className={PRIORITY_CONFIG[req.priority]?.color || 'bg-muted'} variant="outline">{PRIORITY_CONFIG[req.priority]?.label || req.priority}</Badge>
                      <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[req.category] || req.category}</Badge>
                    </div>
                    <p className="font-medium mt-1">{req.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      {req.vessel_name && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{req.vessel_name}</span>}
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{req.currency} {req.estimated_total.toLocaleString()}</span>
                      <span>{req.items.length} item(ns)</span>
                      <span>{new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                      {req.supplier_name && <span>Fornecedor: {req.supplier_name}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {req.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'submitted' })}>
                        <Send className="h-3 w-3 mr-1" />Enviar
                      </Button>
                    )}
                    {req.status === 'submitted' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'approved' })}>
                          <CheckCircle className="h-3 w-3 mr-1" />Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'rejected' })}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'ordered' })}>
                        <Package className="h-3 w-3 mr-1" />Pedir
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDetailId(req.id)}><Eye className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                      if (window.confirm('Excluir requisição?')) deleteMutation.mutate(req.id);
                    }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Detalhes da Requisição</DialogTitle></DialogHeader>
          {selectedReq && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">{selectedReq.requisition_number}</code>
                <Badge className={STATUS_CONFIG[selectedReq.status]?.color}>{STATUS_CONFIG[selectedReq.status]?.label}</Badge>
              </div>
              <p className="font-medium">{selectedReq.title}</p>
              {selectedReq.description && <p className="text-sm text-muted-foreground">{selectedReq.description}</p>}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/30"><th className="p-2 text-left">Item</th><th className="p-2 text-center">Qtd</th><th className="p-2 text-right">Custo Unit.</th><th className="p-2 text-right">Total</th></tr></thead>
                  <tbody>
                    {selectedReq.items.map((item, i) => (
                      <tr key={i} className="border-t"><td className="p-2">{item.name}</td><td className="p-2 text-center">{item.qty} {item.unit}</td><td className="p-2 text-right">${item.unit_cost}</td><td className="p-2 text-right font-medium">${(item.qty * item.unit_cost).toLocaleString()}</td></tr>
                    ))}
                    <tr className="border-t bg-muted/20"><td colSpan={3} className="p-2 text-right font-bold">Total Estimado</td><td className="p-2 text-right font-bold">${selectedReq.estimated_total.toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
              {selectedReq.notes && <p className="text-sm text-muted-foreground border-t pt-2">{selectedReq.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Nova Requisição de Compra</DialogTitle>
            <DialogDescription>Crie uma requisição para aprovação e compra</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={newReq.title} onChange={e => setNewReq(p => ({ ...p, title: e.target.value }))} placeholder="Peças para motor principal" /></div>
            <div><Label>Descrição</Label><Textarea value={newReq.description} onChange={e => setNewReq(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da requisição..." rows={2} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Embarcação</Label><Input value={newReq.vessel_name} onChange={e => setNewReq(p => ({ ...p, vessel_name: e.target.value }))} placeholder="MV Explorer" /></div>
              <div><Label>Categoria</Label>
                <Select value={newReq.category} onValueChange={v => setNewReq(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Prioridade</Label>
                <Select value={newReq.priority} onValueChange={v => setNewReq(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p]?.label || p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Fornecedor</Label><Input value={newReq.supplier_name} onChange={e => setNewReq(p => ({ ...p, supplier_name: e.target.value }))} placeholder="Opcional" /></div>
              <div><Label>Porto de Entrega</Label><Input value={newReq.delivery_port} onChange={e => setNewReq(p => ({ ...p, delivery_port: e.target.value }))} placeholder="Santos" /></div>
              <div><Label>Data Entrega</Label><Input type="date" value={newReq.delivery_date} onChange={e => setNewReq(p => ({ ...p, delivery_date: e.target.value }))} /></div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Itens</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Adicionar Item</Button>
              </div>
              <div className="space-y-2">
                {newReq.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input className="flex-1" placeholder="Descrição do item" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                    <Input className="w-20" type="number" placeholder="Qtd" value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} />
                    <Input className="w-24" type="number" placeholder="Custo" value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', Number(e.target.value))} />
                    {newReq.items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                ))}
                <p className="text-sm text-right text-muted-foreground">
                  Total Estimado: <strong>${newReq.items.reduce((s, i) => s + (i.qty * i.unit_cost), 0).toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div><Label>Observações</Label><Textarea value={newReq.notes} onChange={e => setNewReq(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <Button className="w-full" onClick={() => createMutation.mutate(newReq)} disabled={!newReq.title || createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Requisição'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
