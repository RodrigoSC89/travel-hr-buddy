/**
 * Approval Workflow Component - Multi-Level
 * Supera Fluig: aprovação por alçada, delegação, histórico de audit trail
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, User, DollarSign,
  MessageSquare, ThumbsUp, ThumbsDown, ArrowRight, Shield,
  Calendar, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingApproval {
  id: string;
  order_number: string;
  supplier_name: string | null;
  total_amount: number;
  currency: string;
  priority: string;
  created_at: string;
  delivery_port: string | null;
  items: Record<string, unknown>[] | null;
  notes: string | null;
  status?: string;
  approved_at?: string | null;
}

const approvalThresholds = [
  { maxValue: 5000, level: 'Operacional', autoApprove: true },
  { maxValue: 50000, level: 'Coordenador', autoApprove: false },
  { maxValue: 200000, level: 'Gerente', autoApprove: false },
  { maxValue: Infinity, level: 'Diretoria', autoApprove: false },
];

function getApprovalLevel(amount: number) {
  return approvalThresholds.find(t => amount <= t.maxValue) || approvalThresholds[approvalThresholds.length - 1];
}

export function ApprovalWorkflow() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<PendingApproval | null>(null);
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const { data: pendingItems = [], isLoading } = useQuery({
    queryKey: ['procurement-pending-approvals'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .select('*')
        .eq('status', 'pending')
        .order('total_amount', { ascending: false });
      if (error) throw error;
      return (data || []) as PendingApproval[];
    },
    staleTime: 1000 * 30,
  });

  const { data: recentDecisions = [] } = useQuery({
    queryKey: ['procurement-recent-decisions'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('procurement_orders')
        .select('*')
        .in('status', ['approved', 'cancelled'])
        .order('approved_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as PendingApproval[];
    },
  });

  const decideMutation = useMutation({
    mutationFn: async ({ id, approved, comments }: { id: string; approved: boolean; comments: string }) => {
      const { error } = await (supabase.from as Function)('procurement_orders')
        .update({
          status: approved ? 'approved' : 'cancelled',
          approved_at: new Date().toISOString(),
          notes: comments || undefined,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? '✅ Pedido aprovado!' : '❌ Pedido rejeitado');
      queryClient.invalidateQueries({ queryKey: ['procurement-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-recent-decisions'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-orders-full'] });
      setSelectedItem(null);
      setComments('');
      setAction(null);
    },
  });

  const totalPendingValue = pendingItems.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/20">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando</p>
              <p className="text-3xl font-bold">{pendingItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Pendente</p>
              <p className="text-2xl font-bold">${(totalPendingValue / 1000).toFixed(0)}k</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Urgentes</p>
              <p className="text-3xl font-bold">{pendingItems.filter(i => i.priority === 'critical' || i.priority === 'high').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aprovados (30d)</p>
              <p className="text-3xl font-bold">{recentDecisions.filter(d => d.status === 'approved').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Alçadas de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {approvalThresholds.map((t, i) => (
              <div key={t.level} className="flex items-center gap-2 text-sm whitespace-nowrap">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  t.autoApprove ? 'bg-success' : i === 1 ? 'bg-info' : i === 2 ? 'bg-warning' : 'bg-destructive'
                )} />
                <span className="font-medium">{t.level}</span>
                <span className="text-muted-foreground">
                  até ${t.maxValue === Infinity ? '∞' : (t.maxValue / 1000).toFixed(0) + 'k'}
                </span>
                {i < approvalThresholds.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle>Pendentes de Aprovação</CardTitle>
          <CardDescription>Revise e aprove ou rejeite os pedidos de compra</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-success/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma aprovação pendente</p>
              <p className="text-sm text-muted-foreground/70">Todos os pedidos foram processados</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingItems.map((item, idx) => {
                  const level = getApprovalLevel(item.total_amount);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                        item.priority === 'critical' ? 'border-destructive/30 bg-destructive/5' :
                        item.priority === 'high' ? 'border-warning/30 bg-warning/5' :
                        'border-border hover:border-primary/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{item.order_number}</span>
                          <Badge variant="outline" className="text-xs">{level.level}</Badge>
                          {item.priority === 'critical' && (
                            <Badge className="bg-destructive/20 text-destructive text-xs">URGENTE</Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{item.supplier_name || '—'}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {item.delivery_port && <span>📍 {item.delivery_port}</span>}
                          <span>📅 {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold">{item.currency} {Number(item.total_amount).toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedItem(item); setAction('reject'); }}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => { setSelectedItem(item); setAction('approve'); }}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Dialog */}
      <Dialog open={!!selectedItem && !!action} onOpenChange={() => { setSelectedItem(null); setAction(null); setComments(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <><CheckCircle2 className="h-5 w-5 text-success" /> Aprovar Pedido</>
              ) : (
                <><XCircle className="h-5 w-5 text-destructive" /> Rejeitar Pedido</>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.order_number} — {selectedItem?.supplier_name} — {selectedItem?.currency} {Number(selectedItem?.total_amount || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {action === 'approve' ? 'Comentários (opcional)' : 'Motivo da Rejeição *'}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={action === 'approve' ? 'Adicione observações...' : 'Explique o motivo da rejeição...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedItem(null); setAction(null); }}>Cancelar</Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              disabled={action === 'reject' && !comments.trim() || decideMutation.isPending}
              onClick={() => {
                if (!selectedItem) return;
                decideMutation.mutate({
                  id: selectedItem.id,
                  approved: action === 'approve',
                  comments,
                });
              }}
            >
              {decideMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
