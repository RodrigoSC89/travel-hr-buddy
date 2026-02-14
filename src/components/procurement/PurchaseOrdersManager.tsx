/**
 * Purchase Orders Manager - REVOLUTIONARY V2.0
 * Full lifecycle: Draft → Approval → Ordered → Shipped → Received
 * Premium UI with inline editing, drag status, advanced filters
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Truck, Package, Clock, CheckCircle2, XCircle, AlertTriangle,
  Plus, Search, Download, Send, BarChart3,
  ArrowRight, Calendar, DollarSign, FileText, ShoppingCart,
  Anchor, ChevronRight, Loader2, Trash2, Edit, Copy, Eye,
  ArrowUpDown, TrendingUp, Ship, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  priority: string;
  supplier_name: string | null;
  delivery_port: string | null;
  delivery_date: string | null;
  total_amount: number;
  currency: string;
  items: any[] | null;
  vessel_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bgClass: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: <FileText className="h-3 w-3" />, bgClass: 'border-muted' },
  pending: { label: 'Aguard. Aprovação', color: 'bg-warning/20 text-warning border-warning/30', icon: <Clock className="h-3 w-3" />, bgClass: 'border-warning/30' },
  approved: { label: 'Aprovado', color: 'bg-primary/20 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" />, bgClass: 'border-primary/30' },
  ordered: { label: 'Enviado ao Fornecedor', color: 'bg-info/20 text-info border-info/30', icon: <Send className="h-3 w-3" />, bgClass: 'border-info/30' },
  shipped: { label: 'Em Trânsito', color: 'bg-accent text-accent-foreground', icon: <Truck className="h-3 w-3" />, bgClass: 'border-accent' },
  delivered: { label: 'Entregue', color: 'bg-success/20 text-success border-success/30', icon: <Package className="h-3 w-3" />, bgClass: 'border-success/30' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" />, bgClass: 'border-destructive/30' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Média', color: 'bg-info/20 text-info' },
  high: { label: 'Alta', color: 'bg-warning/20 text-warning' },
  critical: { label: 'Crítica', color: 'bg-destructive/20 text-destructive animate-pulse' },
};

const CURRENCIES = ['USD', 'EUR', 'BRL', 'GBP', 'NOK', 'SGD'];
const ORDER_TYPES = [
  { value: 'standard', label: 'Compra Padrão' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'blanket', label: 'Contrato Aberto' },
  { value: 'consignment', label: 'Consignação' },
];

export function PurchaseOrdersManager() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'priority'>('date');
  const [showNewPODialog, setShowNewPODialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unit: 'un', unit_price: 0 }]);
  const [newPO, setNewPO] = useState({
    supplier_name: '', delivery_port: '', delivery_date: '',
    priority: 'medium', order_type: 'standard',
    total_amount: 0, currency: 'USD', notes: '',
  });

  // Fetch vessels for delivery context
  const { data: vessels = [] } = useQuery({
    queryKey: ['po-vessels'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name').order('name').limit(50);
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch suppliers for dropdown
  const { data: suppliersList = [] } = useQuery({
    queryKey: ['po-suppliers-list'],
    queryFn: async () => {
      const { data } = await supabase.from('suppliers').select('id, company_name, rating').eq('is_active', true).order('rating', { ascending: false }).limit(50);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['procurement-orders-full'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as PurchaseOrder[];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Calculate line items total
  const lineItemsTotal = useMemo(() =>
    lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    [lineItems]
  );

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const items = lineItems.filter(i => i.description.trim());
      const totalAmount = items.length > 0 ? items.reduce((s, i) => s + i.quantity * i.unit_price, 0) : newPO.total_amount;
      const autoApproveThreshold = 5000;

      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .insert({
          order_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          order_type: newPO.order_type,
          status: newPO.order_type === 'emergency' ? 'approved' : totalAmount > autoApproveThreshold ? 'pending' : 'approved',
          priority: newPO.order_type === 'emergency' ? 'critical' : newPO.priority,
          supplier_name: newPO.supplier_name,
          delivery_port: newPO.delivery_port,
          delivery_date: newPO.delivery_date || null,
          total_amount: totalAmount,
          currency: newPO.currency,
          items: items.length > 0 ? items : [{ description: 'Item', quantity: 1, unit_price: totalAmount }],
          notes: newPO.notes,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const isEmergency = newPO.order_type === 'emergency';
      toast.success(`Pedido ${data.order_number} criado!`, {
        description: isEmergency
          ? '🚨 Emergência — Aprovado automaticamente'
          : data.status === 'pending' ? 'Aguardando aprovação (valor > $5.000)' : 'Aprovado automaticamente',
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      resetForm();
    },
    onError: () => toast.error('Erro ao criar pedido'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'approved') updates.approved_at = new Date().toISOString();
      const { error } = await (supabase.from as Function)('procurement_orders').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      setSelectedPO(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)('procurement_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pedido removido');
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      setSelectedPO(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (po: PurchaseOrder) => {
      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .insert({
          order_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          order_type: po.order_type,
          status: 'draft',
          priority: po.priority,
          supplier_name: po.supplier_name,
          delivery_port: po.delivery_port,
          total_amount: po.total_amount,
          currency: po.currency,
          items: po.items,
          notes: `Cópia de ${po.order_number}`,
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(`Pedido duplicado: ${data.order_number}`);
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
    },
  });

  const resetForm = useCallback(() => {
    setShowNewPODialog(false);
    setNewPO({ supplier_name: '', delivery_port: '', delivery_date: '', priority: 'medium', order_type: 'standard', total_amount: 0, currency: 'USD', notes: '' });
    setLineItems([{ description: '', quantity: 1, unit: 'un', unit_price: 0 }]);
  }, []);

  const addLineItem = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unit: 'un', unit_price: 0 }]);
  const removeLineItem = (idx: number) => setLineItems(prev => prev.filter((_, i) => i !== idx));
  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Sorting & Filtering
  const sortedOrders = useMemo(() => {
    let filtered = orders.filter(o => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return o.order_number?.toLowerCase().includes(q) || o.supplier_name?.toLowerCase().includes(q) || o.delivery_port?.toLowerCase().includes(q);
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'amount') return (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0);
      if (sortBy === 'priority') {
        const p: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (p[b.priority] || 0) - (p[a.priority] || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders, filterStatus, searchQuery, sortBy]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inTransit: orders.filter(o => o.status === 'shipped' || o.status === 'ordered').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    avgValue: orders.length > 0 ? orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0) / orders.length : 0,
  }), [orders]);

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = { draft: 'pending', pending: 'approved', approved: 'ordered', ordered: 'shipped', shipped: 'delivered' };
    return flow[current] || null;
  };
  const getNextAction = (status: string): string => {
    const actions: Record<string, string> = { draft: 'Enviar para Aprovação', pending: 'Aprovar', approved: 'Enviar Pedido', ordered: 'Marcar em Trânsito', shipped: 'Confirmar Recebimento' };
    return actions[status] || '';
  };

  const exportCSV = () => {
    const headers = 'Nº Pedido,Fornecedor,Status,Prioridade,Valor,Moeda,Porto,Data Criação\n';
    const rows = orders.map(o => `${o.order_number},${o.supplier_name || ''},${o.status},${o.priority},${o.total_amount},${o.currency},${o.delivery_port || ''},${o.created_at}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('CSV exportado!');
  };

  return (
    <div className="space-y-6">
      {/* KPI Row - Premium */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Pedidos', value: stats.total, icon: <ShoppingCart className="h-4 w-4" />, color: 'text-primary', gradient: 'from-primary/5' },
          { label: 'Aguard. Aprovação', value: stats.pending, icon: <Clock className="h-4 w-4" />, color: 'text-warning', gradient: 'from-warning/5' },
          { label: 'Em Trânsito', value: stats.inTransit, icon: <Truck className="h-4 w-4" />, color: 'text-info', gradient: 'from-info/5' },
          { label: 'Entregues', value: stats.delivered, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-success', gradient: 'from-success/5' },
          { label: 'Valor Total', value: `$${(stats.totalValue / 1000).toFixed(0)}k`, icon: <DollarSign className="h-4 w-4" />, color: 'text-primary', gradient: 'from-primary/5' },
          { label: 'Ticket Médio', value: `$${(stats.avgValue / 1000).toFixed(1)}k`, icon: <TrendingUp className="h-4 w-4" />, color: 'text-accent-foreground', gradient: 'from-accent/5' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="relative overflow-hidden border-border/50 hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} to-transparent`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                  <span className={kpi.color}>{kpi.icon}</span>
                  {kpi.label}
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar - Enhanced */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido, fornecedor, porto..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]"><ArrowUpDown className="h-3 w-3 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Mais Recentes</SelectItem>
            <SelectItem value="amount">Maior Valor</SelectItem>
            <SelectItem value="priority">Prioridade</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={exportCSV} title="Exportar CSV"><Download className="h-4 w-4" /></Button>
        <Button onClick={() => setShowNewPODialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Pedido</Button>
      </div>

      {/* Pipeline Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['pending', 'approved', 'ordered', 'shipped', 'delivered'].map((status) => {
          const count = orders.filter(o => o.status === status).length;
          const cfg = statusConfig[status];
          return (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all",
                filterStatus === status ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border hover:bg-muted"
              )}>
              {cfg.icon} {cfg.label}
              <Badge variant="secondary" className="ml-1 text-[10px]">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-1.5 h-14 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-muted animate-pulse rounded" /><div className="h-3 w-48 bg-muted animate-pulse rounded" /></div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Crie o primeiro pedido de compra</p>
              <Button className="mt-4" onClick={() => setShowNewPODialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Pedido</Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {sortedOrders.map((po, idx) => {
                  const sc = statusConfig[po.status] || statusConfig.draft;
                  const pc = priorityConfig[po.priority] || priorityConfig.medium;
                  const nextStatus = getNextStatus(po.status);
                  return (
                    <motion.div key={po.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedPO(po)}>
                      <div className={cn("w-1.5 h-14 rounded-full flex-shrink-0", sc.color.split(' ')[0])} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold">{po.order_number}</span>
                          <Badge className={cn("text-[10px] border", sc.color)}>{sc.icon}<span className="ml-1">{sc.label}</span></Badge>
                          <Badge className={cn("text-[10px]", pc.color)}>{pc.label}</Badge>
                          {po.order_type === 'emergency' && <Badge className="bg-destructive/20 text-destructive text-[10px] animate-pulse">🚨 EMERGÊNCIA</Badge>}
                        </div>
                        <p className="text-sm font-medium truncate">{po.supplier_name || 'Fornecedor não definido'}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {po.delivery_port && <span className="flex items-center gap-1"><Anchor className="h-3 w-3" />{po.delivery_port}</span>}
                          {po.delivery_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(po.delivery_date).toLocaleDateString('pt-BR')}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(po.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold">{po.currency} {Number(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">{(po.items || []).length} {(po.items || []).length === 1 ? 'item' : 'itens'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {nextStatus && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: po.id, status: nextStatus }); }}>
                            {getNextAction(po.status)}<ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(po); }}><Copy className="h-3 w-3" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== DETAIL DRAWER ========== */}
      <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          {selectedPO && (() => {
            const sc = statusConfig[selectedPO.status] || statusConfig.draft;
            const nextStatus = getNextStatus(selectedPO.status);
            const progressSteps = ['draft', 'pending', 'approved', 'ordered', 'shipped', 'delivered'];
            const currentIdx = progressSteps.indexOf(selectedPO.status);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="font-mono text-lg">{selectedPO.order_number}</span>
                    <Badge className={cn("border", sc.color)}>{sc.icon}<span className="ml-1">{sc.label}</span></Badge>
                  </DialogTitle>
                  <DialogDescription>Detalhes completos do pedido de compra</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 py-4">
                    {/* Progress Steps */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                      <div className="flex items-center gap-1">
                        {progressSteps.map((s, i) => (
                          <React.Fragment key={s}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                              i <= currentIdx ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                            )}>{i + 1}</div>
                            {i < progressSteps.length - 1 && <div className={cn("flex-1 h-1 rounded", i < currentIdx ? "bg-primary" : "bg-muted")} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField label="Fornecedor" value={selectedPO.supplier_name} icon={<Ship className="h-4 w-4" />} />
                      <DetailField label="Porto de Entrega" value={selectedPO.delivery_port} icon={<MapPin className="h-4 w-4" />} />
                      <DetailField label="Data de Entrega" value={selectedPO.delivery_date ? new Date(selectedPO.delivery_date).toLocaleDateString('pt-BR') : null} icon={<Calendar className="h-4 w-4" />} />
                      <DetailField label="Valor Total" value={`${selectedPO.currency} ${Number(selectedPO.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="h-4 w-4" />} />
                    </div>

                    {/* Line Items */}
                    {selectedPO.items && selectedPO.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Itens do Pedido</p>
                        <div className="space-y-2">
                          {selectedPO.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                              <span className="text-sm">{item.description || 'Item'}</span>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">{item.quantity || 1}x</span>
                                <span className="font-medium">{selectedPO.currency} {Number(item.unit_price || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPO.notes && (
                      <div><p className="text-sm font-medium mb-1">Observações</p><p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{selectedPO.notes}</p></div>
                    )}

                    {selectedPO.approved_at && (
                      <p className="text-xs text-muted-foreground">Aprovado em: {new Date(selectedPO.approved_at).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {selectedPO.status === 'draft' && (
                    <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(selectedPO.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />Excluir
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate(selectedPO)}><Copy className="h-4 w-4 mr-1" />Duplicar</Button>
                  <div className="flex-1" />
                  <Button variant="outline" onClick={() => setSelectedPO(null)}>Fechar</Button>
                  {nextStatus && (
                    <Button onClick={() => updateStatusMutation.mutate({ id: selectedPO.id, status: nextStatus })} disabled={updateStatusMutation.isPending}>
                      {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {getNextAction(selectedPO.status)}<ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ========== NEW PO DIALOG - Multi-step ========== */}
      <Dialog open={showNewPODialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />Novo Pedido de Compra</DialogTitle>
            <DialogDescription>Preencha os dados do pedido. Itens com valor acima de $5.000 requerem aprovação.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-2">
              {/* Header Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor *</Label>
                  <Select value={newPO.supplier_name} onValueChange={v => setNewPO(p => ({ ...p, supplier_name: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                    <SelectContent>
                      {suppliersList.map(s => <SelectItem key={s.id} value={s.company_name}>{s.company_name} ⭐{(s.rating || 0).toFixed(1)}</SelectItem>)}
                      <SelectItem value="__other">Outro (digitar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {newPO.supplier_name === '__other' && <Input placeholder="Nome do fornecedor" onChange={e => setNewPO(p => ({ ...p, supplier_name: e.target.value }))} />}
                </div>
                <div className="space-y-2">
                  <Label>Porto de Entrega</Label>
                  <Input placeholder="Ex: Santos, Rotterdam..." value={newPO.delivery_port} onChange={e => setNewPO(p => ({ ...p, delivery_port: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Pedido</Label>
                  <Select value={newPO.order_type} onValueChange={v => setNewPO(p => ({ ...p, order_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={newPO.priority} onValueChange={v => setNewPO(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🟠 Alta</SelectItem>
                      <SelectItem value="critical">🔴 Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Entrega</Label>
                  <Input type="date" value={newPO.delivery_date} onChange={e => setNewPO(p => ({ ...p, delivery_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select value={newPO.currency} onValueChange={v => setNewPO(p => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Itens do Pedido</Label>
                  <Button variant="outline" size="sm" onClick={addLineItem}><Plus className="h-3 w-3 mr-1" />Adicionar Item</Button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        {idx === 0 && <Label className="text-xs text-muted-foreground">Descrição</Label>}
                        <Input placeholder="Descrição do item" value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <Label className="text-xs text-muted-foreground">Qtd</Label>}
                        <Input type="number" min="1" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))} />
                      </div>
                      <div className="col-span-1">
                        {idx === 0 && <Label className="text-xs text-muted-foreground">Un</Label>}
                        <Input value={item.unit} onChange={e => updateLineItem(idx, 'unit', e.target.value)} />
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && <Label className="text-xs text-muted-foreground">Preço Unit.</Label>}
                        <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateLineItem(idx, 'unit_price', Number(e.target.value))} />
                      </div>
                      <div className="col-span-1">
                        {lineItems.length > 1 && <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeLineItem(idx)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 p-3 bg-muted/30 rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{newPO.currency} {lineItemsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    {lineItemsTotal > 5000 && <p className="text-xs text-warning mt-1">⚠️ Requer aprovação (valor &gt; $5.000)</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Instruções especiais, condições de entrega..." value={newPO.notes} onChange={e => setNewPO(p => ({ ...p, notes: e.target.value }))} rows={2} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={() => createOrderMutation.mutate()} disabled={!newPO.supplier_name || createOrderMutation.isPending}>
              {createOrderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailField({ label, value, icon }: { label: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}
