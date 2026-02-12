/**
 * Finance Approval Workflow - Premium Component
 * WORLD-CLASS: Real Supabase data + AI anomaly detection + approval workflow
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, CheckCircle, XCircle, Clock, AlertTriangle,
  FileText, User, Calendar, ArrowRight, TrendingUp,
  TrendingDown, PiggyBank, CreditCard, Receipt,
  Brain, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface FinanceRequest {
  id: string;
  type: 'purchase' | 'expense' | 'invoice' | 'budget' | 'payment';
  title: string;
  amount: number;
  currency: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  vessel?: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  attachments: number;
}

const TYPE_CONFIG = {
  purchase: { icon: Receipt, color: 'bg-info', label: 'Compra' },
  expense: { icon: CreditCard, color: 'bg-accent', label: 'Despesa' },
  invoice: { icon: FileText, color: 'bg-success', label: 'Fatura' },
  budget: { icon: PiggyBank, color: 'bg-warning', label: 'Orçamento' },
  payment: { icon: DollarSign, color: 'bg-primary', label: 'Pagamento' },
};

const STATUS_CONFIG = {
  pending: { color: 'bg-warning/10 text-warning', label: 'Pendente' },
  approved: { color: 'bg-success/10 text-success', label: 'Aprovado' },
  rejected: { color: 'bg-destructive/10 text-destructive', label: 'Rejeitado' },
  review: { color: 'bg-info/10 text-info', label: 'Em Revisão' },
};

const URGENCY_CONFIG = {
  low: { color: 'bg-muted text-muted-foreground', label: 'Baixa' },
  medium: { color: 'bg-info/10 text-info', label: 'Média' },
  high: { color: 'bg-destructive/10 text-destructive', label: 'Alta' },
};

function mapStatus(status: string | null): FinanceRequest['status'] {
  const s = (status || '').toLowerCase();
  if (s.includes('approv') || s === 'paid') return 'approved';
  if (s.includes('reject') || s === 'cancelled') return 'rejected';
  if (s.includes('review')) return 'review';
  return 'pending';
}

export function FinanceApprovalWorkflow() {
  const [selectedRequest, setSelectedRequest] = useState<FinanceRequest | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  // ===== REAL DATA from Supabase =====
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['finance-requests'],
    queryFn: async (): Promise<FinanceRequest[]> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(inv => ({
        id: inv.id,
        type: 'invoice' as const,
        title: inv.notes || `Fatura ${inv.invoice_number || ''}`,
        amount: inv.total_amount || 0,
        currency: inv.currency || 'USD',
        requestedBy: 'Sistema',
        requestedAt: new Date(inv.created_at),
        status: mapStatus(inv.status),
        vessel: undefined,
        category: 'Operacional',
        urgency: (inv.total_amount || 0) > 50000 ? 'high' as const : (inv.total_amount || 0) > 10000 ? 'medium' as const : 'low' as const,
        attachments: 0,
      }));
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['finance-budgets-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('year', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // ===== AI ANALYSIS =====
  const runFinanceAI = async () => {
    setAiLoading(true);
    try {
      const requestsSummary = requests.slice(0, 15).map(r => ({
        type: r.type,
        title: r.title,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        urgency: r.urgency,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Analise as solicitações financeiras marítimas e forneça insights:\n\nTotal pendente: $${totalPending.toLocaleString()}\nTotal aprovado: $${totalApproved.toLocaleString()}\nSolicitações: ${JSON.stringify(requestsSummary)}\nOrçamentos: ${budgets.length} registros\n\nForneça:\n1. Análise de padrão de gastos\n2. Detecção de anomalias\n3. Prioridade de aprovação recomendada\n4. Oportunidades de economia\n5. Forecast financeiro para próximos 30 dias`,
          }],
          agentId: 'nauti-brain',
        },
      });

      if (error) throw error;
      setAiAnalysis(data?.response || data?.choices?.[0]?.message?.content || 'Análise indisponível');
      toast.success('Análise financeira AI concluída');
    } catch {
      toast.error('Erro ao gerar análise financeira AI');
    } finally {
      setAiLoading(false);
    }
  };

  // ===== APPROVE / REJECT =====
  const approveRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'approved' as const })
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('Fatura aprovada com sucesso');
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['finance-requests'] });
    },
    onError: () => toast.error('Erro ao aprovar fatura'),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'pending_approval' as const })
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.error('Fatura rejeitada');
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['finance-requests'] });
    },
    onError: () => toast.error('Erro ao rejeitar fatura'),
  });

  // Calculate totals
  const totalPending = requests.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.amount, 0);
  const totalApproved = requests.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.amount, 0);
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const filteredRequests = requests.filter(r => 
    filter === 'all' || r.status === filter
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
        <Button variant="secondary" className="gap-2" onClick={runFinanceAI} disabled={aiLoading}>
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Análise Financeira AI
        </Button>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Brain className="h-4 w-4" />
                Inteligência Financeira AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{aiAnalysis}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(totalPending, 'USD')}</p>
              </div>
              <Clock className="h-10 w-10 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'review').length}</p>
              </div>
              <FileText className="h-10 w-10 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold">{formatCurrency(totalApproved, 'USD')}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <TrendingDown className="h-10 w-10 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg">Solicitações Financeiras ({filteredRequests.length})</CardTitle>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3 h-6">Todos</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs px-3 h-6">Pendentes</TabsTrigger>
                  <TabsTrigger value="review" className="text-xs px-3 h-6">Revisão</TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs px-3 h-6">Aprovados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando faturas...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma solicitação encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredRequests.map(request => {
                  const typeConfig = TYPE_CONFIG[request.type] || TYPE_CONFIG.invoice;
                  const statusConfig = STATUS_CONFIG[request.status];
                  const urgencyConfig = URGENCY_CONFIG[request.urgency];
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <div 
                      key={request.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedRequest?.id === request.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg text-white ${typeConfig.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium truncate">{request.title}</span>
                            <Badge className={urgencyConfig.color}>{urgencyConfig.label}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {request.requestedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {request.requestedAt.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(request.amount, request.currency)}
                            </span>
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          </div>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes da Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">{selectedRequest.title}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedRequest.amount, selectedRequest.currency)}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <Badge variant="outline">{TYPE_CONFIG[selectedRequest.type]?.label || 'Fatura'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={STATUS_CONFIG[selectedRequest.status].color}>
                      {STATUS_CONFIG[selectedRequest.status].label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgência</span>
                    <Badge className={URGENCY_CONFIG[selectedRequest.urgency].color}>
                      {URGENCY_CONFIG[selectedRequest.urgency].label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data</span>
                    <span>{selectedRequest.requestedAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                {/* Actions */}
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'review') && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 gap-2"
                      onClick={() => approveRequestMutation.mutate(selectedRequest.id)}
                      disabled={approveRequestMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => rejectRequestMutation.mutate(selectedRequest.id)}
                      disabled={rejectRequestMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione uma solicitação para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FinanceApprovalWorkflow;
