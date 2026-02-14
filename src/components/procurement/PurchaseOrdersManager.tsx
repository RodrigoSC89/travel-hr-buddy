/**
 * Purchase Orders Manager - World-Class
 * Full lifecycle: Draft → Approval → Ordered → Shipped → Received
 * Supera Fluig e TM Master em UX e funcionalidade
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Truck, Package, Clock, CheckCircle2, XCircle, AlertTriangle,
  Plus, Search, Filter, Download, Eye, Edit, Send, BarChart3,
  ArrowRight, MapPin, Calendar, DollarSign, FileText, ShoppingCart,
  Anchor, Ship, ChevronRight, Loader2
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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: <FileText className="h-3 w-3" /> },
  pending: { label: 'Aguardando Aprovação', color: 'bg-warning/20 text-warning border-warning/30', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Aprovado', color: 'bg-primary/20 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  ordered: { label: 'Pedido Enviado', color: 'bg-info/20 text-info border-info/30', icon: <Send className="h-3 w-3" /> },
  shipped: { label: 'Em Trânsito', color: 'bg-accent text-accent-foreground', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Entregue', color: 'bg-success/20 text-success border-success/30', icon: <Package className="h-3 w-3" /> },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Média', color: 'bg-info/20 text-info' },
  high: { label: 'Alta', color: 'bg-warning/20 text-warning' },
  critical: { label: 'Crítica', color: 'bg-destructive/20 text-destructive' },
};

export function PurchaseOrdersManager() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPODialog, setShowNewPODialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [newPO, setNewPO] = useState({
    supplier_name: '',
    delivery_port: '',
    priority: 'medium',
    order_type: 'standard',
    items_description: '',
    total_amount: 0,
    currency: 'USD',
    notes: '',
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

  const createOrderMutation = useMutation({
    mutationFn: async (order: typeof newPO) => {
      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .insert({
          order_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          order_type: order.order_type,
          status: order.total_amount > 50000 ? 'pending' : 'approved',
          priority: order.priority,
          supplier_name: order.supplier_name,
          delivery_port: order.delivery_port,
          total_amount: order.total_amount,
          currency: order.currency,
          items: [{ description: order.items_description, quantity: 1, unit_price: order.total_amount }],
          notes: order.notes,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(`Pedido ${data.order_number} criado!`, {
        description: data.status === 'pending'
          ? 'Aguardando aprovação (valor > $50.000)'
          : 'Aprovado automaticamente',
      });
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      setShowNewPODialog(false);
      setNewPO({ supplier_name: '', delivery_port: '', priority: 'medium', order_type: 'standard', items_description: '', total_amount: 0, currency: 'USD', notes: '' });
    },
    onError: () => toast.error('Erro ao criar pedido'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }
      const { error } = await (supabase.from as Function)('procurement_orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      setSelectedPO(null);
    },
  });

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.supplier_name?.toLowerCase().includes(q) ||
        o.delivery_port?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inTransit: orders.filter(o => o.status === 'shipped' || o.status === 'ordered').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      draft: 'pending',
      pending: 'approved',
      approved: 'ordered',
      ordered: 'shipped',
      shipped: 'delivered',
    };
    return flow[current] || null;
  };

  const getNextAction = (status: string): string => {
    const actions: Record<string, string> = {
      draft: 'Enviar para Aprovação',
      pending: 'Aprovar',
      approved: 'Enviar Pedido',
      ordered: 'Marcar em Trânsito',
      shipped: 'Confirmar Recebimento',
    };
    return actions[status] || '';
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Pedidos', value: stats.total, icon: <ShoppingCart className="h-4 w-4" />, color: 'text-primary' },
          { label: 'Aguardando Aprovação', value: stats.pending, icon: <Clock className="h-4 w-4" />, color: 'text-warning' },
          { label: 'Em Trânsito', value: stats.inTransit, icon: <Truck className="h-4 w-4" />, color: 'text-info' },
          { label: 'Entregues', value: stats.delivered, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-success' },
          { label: 'Valor Total', value: `$${(stats.totalValue / 1000).toFixed(0)}k`, icon: <DollarSign className="h-4 w-4" />, color: 'text-primary' },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <span className={kpi.color}>{kpi.icon}</span>
                {kpi.label}
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nº do pedido, fornecedor ou porto..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowNewPODialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Pipeline View */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['pending', 'approved', 'ordered', 'shipped', 'delivered'].map((status) => {
          const count = orders.filter(o => o.status === status).length;
          const cfg = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all",
                filterStatus === status ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              {cfg.icon}
              {cfg.label}
              <Badge variant="secondary" className="ml-1">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum pedido encontrado</p>
              <Button variant="link" className="mt-2" onClick={() => setShowNewPODialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Criar Primeiro Pedido
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {filteredOrders.map((po, idx) => {
                  const sc = statusConfig[po.status] || statusConfig.draft;
                  const pc = priorityConfig[po.priority] || priorityConfig.medium;
                  const nextStatus = getNextStatus(po.status);
                  return (
                    <motion.div
                      key={po.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedPO(po)}
                    >
                      {/* Status indicator */}
                      <div className={cn("w-1.5 h-14 rounded-full flex-shrink-0", sc.color.split(' ')[0])} />

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{po.order_number}</span>
                          <Badge className={cn("text-xs border", sc.color)}>
                            {sc.icon}
                            <span className="ml-1">{sc.label}</span>
                          </Badge>
                          <Badge className={cn("text-xs", pc.color)}>{pc.label}</Badge>
                        </div>
                        <p className="text-sm text-foreground font-medium truncate">
                          {po.supplier_name || 'Fornecedor não definido'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {po.delivery_port && (
                            <span className="flex items-center gap-1">
                              <Anchor className="h-3 w-3" />
                              {po.delivery_port}
                            </span>
                          )}
                          {po.delivery_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(po.delivery_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(po.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold">
                          {po.currency} {Number(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(po.items || []).length} {(po.items || []).length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>

                      {/* Quick action */}
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ id: po.id, status: nextStatus });
                          }}
                        >
                          {getNextAction(po.status)}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Dialog open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPO && (() => {
            const sc = statusConfig[selectedPO.status] || statusConfig.draft;
            const nextStatus = getNextStatus(selectedPO.status);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="font-mono">{selectedPO.order_number}</span>
                    <Badge className={cn("border", sc.color)}>
                      {sc.icon}
                      <span className="ml-1">{sc.label}</span>
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>Detalhes completos do pedido de compra</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Progresso do Pedido</p>
                    <div className="flex items-center gap-1">
                      {['draft', 'pending', 'approved', 'ordered', 'shipped', 'delivered'].map((s, i) => {
                        const idx = ['draft', 'pending', 'approved', 'ordered', 'shipped', 'delivered'].indexOf(selectedPO.status);
                        return (
                          <React.Fragment key={s}>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                              i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              {i + 1}
                            </div>
                            {i < 5 && (
                              <div className={cn("flex-1 h-1 rounded", i < idx ? "bg-primary" : "bg-muted")} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                      <span>Rascunho</span><span>Aprovação</span><span>Aprovado</span><span>Pedido</span><span>Trânsito</span><span>Entregue</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fornecedor</p>
                      <p className="font-medium">{selectedPO.supplier_name || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Porto de Entrega</p>
                      <p className="font-medium">{selectedPO.delivery_port || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Valor Total</p>
                      <p className="text-xl font-bold text-primary">
                        {selectedPO.currency} {Number(selectedPO.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Data de Entrega</p>
                      <p className="font-medium">{selectedPO.delivery_date ? new Date(selectedPO.delivery_date).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">{selectedPO.order_type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Criado em</p>
                      <p className="font-medium">{new Date(selectedPO.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {(selectedPO.items || []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Itens do Pedido</p>
                      <div className="border rounded-lg divide-y">
                        {(selectedPO.items || []).map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 text-sm">
                            <span>{item.description || item.name || `Item ${i + 1}`}</span>
                            <span className="font-medium">
                              {item.quantity || 1}x — ${Number(item.unit_price || item.total || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approval info */}
                  {selectedPO.total_amount > 50000 && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">Requer aprovação gerencial</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pedidos acima de $50.000 necessitam aprovação de nível gerencial.
                        {selectedPO.approved_at && ` Aprovado em ${new Date(selectedPO.approved_at).toLocaleDateString('pt-BR')}.`}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedPO.status !== 'cancelled' && selectedPO.status !== 'delivered' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedPO.id, status: 'cancelled' })}
                    >
                      Cancelar Pedido
                    </Button>
                  )}
                  {nextStatus && (
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: selectedPO.id, status: nextStatus })}
                    >
                      {getNextAction(selectedPO.status)}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* New PO Dialog */}
      <Dialog open={showNewPODialog} onOpenChange={setShowNewPODialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Compra</DialogTitle>
            <DialogDescription>
              Pedidos acima de $50.000 seguem para aprovação gerencial automaticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Input
                value={newPO.supplier_name}
                onChange={(e) => setNewPO({ ...newPO, supplier_name: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Porto de Entrega</Label>
                <Input
                  value={newPO.delivery_port}
                  onChange={(e) => setNewPO({ ...newPO, delivery_port: e.target.value })}
                  placeholder="Santos, Rio de Janeiro..."
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={newPO.priority} onValueChange={(v) => setNewPO({ ...newPO, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição dos Itens *</Label>
              <Textarea
                value={newPO.items_description}
                onChange={(e) => setNewPO({ ...newPO, items_description: e.target.value })}
                placeholder="Descreva os itens do pedido..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total *</Label>
                <Input
                  type="number"
                  value={newPO.total_amount || ''}
                  onChange={(e) => setNewPO({ ...newPO, total_amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Select value={newPO.currency} onValueChange={(v) => setNewPO({ ...newPO, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newPO.total_amount > 50000 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2 text-warning" />
                Este pedido será encaminhado para aprovação gerencial
              </div>
            )}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={newPO.notes}
                onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                placeholder="Notas adicionais..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPODialog(false)}>Cancelar</Button>
            <Button
              onClick={() => createOrderMutation.mutate(newPO)}
              disabled={!newPO.supplier_name || !newPO.items_description || newPO.total_amount <= 0 || createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
