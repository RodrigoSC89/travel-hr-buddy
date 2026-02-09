/**
 * Operations Action Panel - Premium Component
 * WORLD-CLASS: Bulk actions, approval workflows, timeline
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, CheckCircle, XCircle, Clock,
  Ship, Anchor, MapPin, Package, Filter, Download,
  RefreshCw, MoreHorizontal, AlertTriangle, TrendingUp,
  Brain, Loader2, Eye, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Operation {
  id: string;
  name: string;
  vessel: string;
  vessel_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  type: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  imo_number?: string | null;
}

const STATUS_CONFIG = {
  draft: { color: 'bg-muted text-muted-foreground', icon: Edit, label: 'Rascunho' },
  pending: { color: 'bg-yellow-500/20 text-yellow-600', icon: Clock, label: 'Pendente' },
  approved: { color: 'bg-green-500/20 text-green-600', icon: CheckCircle, label: 'Aprovado' },
  rejected: { color: 'bg-red-500/20 text-red-600', icon: XCircle, label: 'Rejeitado' },
  active: { color: 'bg-blue-500/20 text-blue-600', icon: TrendingUp, label: 'Ativo' },
  completed: { color: 'bg-gray-500/20 text-gray-600', icon: CheckCircle, label: 'Concluído' },
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-muted text-muted-foreground', label: 'Baixa' },
  medium: { color: 'bg-blue-500/20 text-blue-600', label: 'Média' },
  high: { color: 'bg-orange-500/20 text-orange-600', label: 'Alta' },
  critical: { color: 'bg-red-500/20 text-red-600', label: 'Crítica' },
};

// Map real vessel status to operation status
function mapVesselStatus(status: string | null): Operation['status'] {
  switch (status) {
    case 'active':
    case 'operational': return 'active';
    case 'maintenance': return 'pending';
    case 'inactive':
    case 'decommissioned': return 'completed';
    case 'docked': return 'approved';
    default: return 'draft';
  }
}

// Map vessel type to operation type
function mapVesselType(type: string | null): string {
  if (!type) return 'general';
  return type;
}

export function OperationsActionPanel() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; operation: Operation | null }>({ open: false, operation: null });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; operation: Operation | null }>({ open: false, operation: null });
  const [newOpDialog, setNewOpDialog] = useState(false);
  const [newOpForm, setNewOpForm] = useState({ vessel_id: '', notes: '', priority: 'medium' });
  const queryClient = useQueryClient();

  // Fetch real operations from Supabase
  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['operations-list'],
    queryFn: async () => {
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('id, name, status, imo_number, vessel_type, updated_at, created_at')
        .limit(30);
      
      if (error) throw error;
      
      return (vessels || []).map((v) => ({
        id: v.id,
        name: `Op. ${v.name}`,
        vessel: v.name,
        vessel_id: v.id,
        status: mapVesselStatus(v.status),
        type: mapVesselType(v.vessel_type),
        createdAt: new Date(v.created_at || v.updated_at || Date.now()),
        updatedAt: new Date(v.updated_at || Date.now()),
        priority: 'medium' as const,
        imo_number: v.imo_number,
      }));
    },
  });

  // Fetch vessels for new operation dialog
  const { data: vesselsList = [] } = useQuery({
    queryKey: ['vessels-list-ops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, imo_number')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('vessels')
        .update({ status: 'active' })
        .in('id', ids);
      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      toast.success(`${ids.length} operação(ões) aprovada(s) com sucesso`);
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['operations-list'] });
      queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
    },
    onError: (err: any) => toast.error(`Erro ao aprovar: ${err.message}`),
  });

  // Bulk deactivate mutation
  const bulkDeactivateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('vessels')
        .update({ status: 'inactive' })
        .in('id', ids);
      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      toast.success(`${ids.length} operação(ões) desativada(s)`);
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['operations-list'] });
      queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  // Update single vessel status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('vessels')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-list'] });
      queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
      toast.success('Status atualizado');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  // Create new voyage/operation
  const createOperationMutation = useMutation({
    mutationFn: async () => {
      if (!newOpForm.vessel_id) throw new Error('Selecione uma embarcação');
      const { data, error } = await supabase
        .from('voyages')
        .insert([{
          voyage_number: `VYG-${Date.now()}`,
          vessel_id: newOpForm.vessel_id,
          status: 'planned',
          notes: newOpForm.notes || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-list'] });
      queryClient.invalidateQueries({ queryKey: ['operations-voyages'] });
      toast.success('Nova operação criada com sucesso!');
      setNewOpDialog(false);
      setNewOpForm({ vessel_id: '', notes: '', priority: 'medium' });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === filteredOperations.length ? [] : filteredOperations.map(o => o.id)
    );
  };

  const filteredOperations = operations.filter(op => 
    filter === 'all' || op.status === filter
  );

  // Export operations to CSV
  const handleExport = () => {
    const dataToExport = filteredOperations.length > 0 ? filteredOperations : operations;
    if (dataToExport.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    const headers = ['Nome', 'Embarcação', 'Status', 'Tipo', 'Prioridade', 'Atualizado'];
    const rows = dataToExport.map(op => [
      op.name,
      op.vessel,
      STATUS_CONFIG[op.status]?.label || op.status,
      op.type,
      PRIORITY_CONFIG[op.priority]?.label || op.priority,
      op.updatedAt.toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operacoes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${dataToExport.length} operações exportadas`);
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const summary = operations.map(op => `${op.name} | ${op.vessel} | Status: ${op.status} | Prioridade: ${op.priority}`).join('\n');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          agentId: 'nauti-brain',
          messages: [{
            role: 'user',
            content: `Analise estas operações marítimas e forneça: 1) Priorização inteligente, 2) Gargalos operacionais, 3) Recomendações de aprovação em lote, 4) Alertas de risco. Responda em PT-BR.\n\nOperações:\n${summary}`
          }]
        }
      });
      if (error) throw error;
      setAiAnalysis(data?.choices?.[0]?.message?.content || data?.message || 'Análise concluída sem resultados.');
      toast.success('Análise AI de operações concluída');
    } catch (err) {
      toast.error('Erro na análise AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="operations-action-panel">
      {/* Action Bar */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Actions */}
            <div className="flex items-center gap-2">
              <Button className="gap-2" onClick={() => setNewOpDialog(true)}>
                <Plus className="h-4 w-4" />
                Nova Operação
              </Button>
              
              {selectedItems.length > 0 && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <Badge variant="secondary" className="font-normal">
                    {selectedItems.length} selecionados
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1 text-green-600"
                    onClick={() => bulkApproveMutation.mutate(selectedItems)}
                    disabled={bulkApproveMutation.isPending}
                  >
                    {bulkApproveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Aprovar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1 text-red-600"
                    onClick={() => bulkDeactivateMutation.mutate(selectedItems)}
                    disabled={bulkDeactivateMutation.isPending}
                  >
                    {bulkDeactivateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Desativar
                  </Button>
                </>
              )}
            </div>

            {/* Right: Filters */}
            <div className="flex items-center gap-2">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-2 h-6">Todos</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs px-2 h-6">Pendentes</TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs px-2 h-6">Aprovados</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs px-2 h-6">Ativos</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 border-primary/50 text-primary"
                onClick={runAIAnalysis}
                disabled={isAnalyzing || operations.length === 0}
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Análise AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise AI de Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {aiAnalysis}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Operations List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Operações ({filteredOperations.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedItems.length === filteredOperations.length && filteredOperations.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Selecionar todos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Carregando operações...
            </div>
          ) : filteredOperations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhuma operação encontrada</p>
              <p className="text-sm">Crie uma nova operação para começar</p>
              <Button className="mt-4 gap-2" onClick={() => setNewOpDialog(true)}>
                <Plus className="h-4 w-4" />
                Nova Operação
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredOperations.map((operation) => {
                const statusConfig = STATUS_CONFIG[operation.status];
                const priorityConfig = PRIORITY_CONFIG[operation.priority];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div 
                    key={operation.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      selectedItems.includes(operation.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Checkbox 
                      checked={selectedItems.includes(operation.id)}
                      onCheckedChange={() => toggleSelectItem(operation.id)}
                    />
                    
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailDialog({ open: true, operation })}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{operation.name}</span>
                        <Badge className={priorityConfig.color} variant="secondary">
                          {priorityConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          {operation.vessel}
                        </span>
                        {operation.imo_number && (
                          <span className="text-xs">IMO: {operation.imo_number}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {operation.updatedAt.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <Badge className={statusConfig.color} variant="secondary">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailDialog({ open: true, operation })}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: operation.id, status: 'active' })}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Ativar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: operation.id, status: 'maintenance' })}>
                            <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                            Manutenção
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: operation.id, status: 'docked' })}>
                            <Anchor className="h-4 w-4 mr-2 text-blue-600" />
                            Atracado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => updateStatusMutation.mutate({ id: operation.id, status: 'inactive' })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Operation Dialog */}
      <Dialog open={newOpDialog} onOpenChange={setNewOpDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nova Operação
            </DialogTitle>
            <DialogDescription>Crie uma nova operação vinculada a uma embarcação</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Embarcação *</Label>
              <Select value={newOpForm.vessel_id} onValueChange={(v) => setNewOpForm(p => ({ ...p, vessel_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
                <SelectContent>
                  {vesselsList.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} {v.imo_number ? `(${v.imo_number})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={newOpForm.priority} onValueChange={(v) => setNewOpForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="critical">🔴 Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                placeholder="Notas sobre a operação..."
                value={newOpForm.notes}
                onChange={(e) => setNewOpForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => createOperationMutation.mutate()}
              disabled={createOperationMutation.isPending || !newOpForm.vessel_id}
            >
              {createOperationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Operação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Operation Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, operation: open ? detailDialog.operation : null })}>
        <DialogContent className="sm:max-w-[520px]">
          {detailDialog.operation && (() => {
            const op = detailDialog.operation;
            const sc = STATUS_CONFIG[op.status];
            const pc = PRIORITY_CONFIG[op.priority];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    {op.name}
                  </DialogTitle>
                  <DialogDescription>Detalhes da operação</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Embarcação</Label>
                      <p className="font-medium">{op.vessel}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">IMO</Label>
                      <p className="font-medium">{op.imo_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Prioridade</Label>
                      <Badge className={pc.color} variant="secondary">{pc.label}</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Tipo</Label>
                      <p className="font-medium capitalize">{op.type}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Última Atualização</Label>
                      <p className="font-medium">{op.updatedAt.toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    updateStatusMutation.mutate({ id: op.id, status: 'active' });
                    setDetailDialog({ open: false, operation: null });
                  }}>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> Ativar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    updateStatusMutation.mutate({ id: op.id, status: 'maintenance' });
                    setDetailDialog({ open: false, operation: null });
                  }}>
                    <Clock className="h-4 w-4 mr-1 text-yellow-600" /> Manutenção
                  </Button>
                  <Button variant="outline" onClick={() => setDetailDialog({ open: false, operation: null })}>
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OperationsActionPanel;
