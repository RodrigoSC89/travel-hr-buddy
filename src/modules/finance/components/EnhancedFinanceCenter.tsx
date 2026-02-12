/**
 * Enhanced Finance Center - Finance & Contracts Premium Experience
 * PATCH FINANCE-2.0 - Complete financial management with AI
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Plus, RefreshCw,
  FileText, Receipt, CreditCard, PiggyBank, BarChart3, Brain,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Download, Upload, Filter, Search, Calendar, Building2, Ship,
  Sparkles, Target, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialKPI {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'percent' | 'number';
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  budget: number;
  percentage: number;
  trend: number;
}

interface PendingApproval {
  id: string;
  type: 'invoice' | 'expense' | 'reimbursement' | 'purchase_order';
  description: string;
  amount: number;
  requestedBy: string;
  requestedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vesselName?: string;
}

interface AIInsight {
  id: string;
  type: 'saving' | 'risk' | 'optimization' | 'forecast';
  title: string;
  description: string;
  potentialValue: number;
  confidence: number;
  actionable: boolean;
}

export const EnhancedFinanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Financial Data
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Load financial data

      // KPIs
      setKpis([
        {
          id: 'revenue',
          title: 'Receita Total',
          value: 2450000,
          previousValue: 2180000,
          format: 'currency',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-green-500',
          trend: 'up',
          description: 'Receita acumulada no período'
        },
        {
          id: 'expenses',
          title: 'Despesas Totais',
          value: 1680000,
          previousValue: 1720000,
          format: 'currency',
          icon: <TrendingDown className="h-5 w-5" />,
          color: 'text-red-500',
          trend: 'down',
          description: 'Despesas operacionais'
        },
        {
          id: 'profit_margin',
          title: 'Margem de Lucro',
          value: 31.4,
          previousValue: 28.5,
          format: 'percent',
          icon: <Target className="h-5 w-5" />,
          color: 'text-primary',
          trend: 'up',
          description: 'Margem operacional'
        },
        {
          id: 'pending_invoices',
          title: 'Faturas Pendentes',
          value: 12,
          previousValue: 18,
          format: 'number',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-yellow-500',
          trend: 'down',
          description: 'Aguardando pagamento'
        }
      ]);

      // Expense Categories
      setExpenseCategories([
        { category: 'Combustível', amount: 580000, budget: 600000, percentage: 96.7, trend: -2.3 },
        { category: 'Manutenção', amount: 320000, budget: 350000, percentage: 91.4, trend: 5.2 },
        { category: 'Tripulação', amount: 420000, budget: 450000, percentage: 93.3, trend: 1.8 },
        { category: 'Portuárias', amount: 180000, budget: 200000, percentage: 90.0, trend: -4.1 },
        { category: 'Seguros', amount: 95000, budget: 100000, percentage: 95.0, trend: 0 },
        { category: 'Outros', amount: 85000, budget: 100000, percentage: 85.0, trend: -8.5 }
      ]);

      // Pending Approvals
      setPendingApprovals([
        {
          id: '1',
          type: 'invoice',
          description: 'Fatura de combustível - Terminal Santos',
          amount: 45000,
          requestedBy: 'Dept. Operações',
          requestedAt: new Date(),
          priority: 'high',
          vesselName: 'MV Atlantic Star'
        },
        {
          id: '2',
          type: 'expense',
          description: 'Manutenção emergencial - Bomba hidráulica',
          amount: 12500,
          requestedBy: 'Chefe de Máquinas',
          requestedAt: subDays(new Date(), 1),
          priority: 'urgent',
          vesselName: 'MV Pacific Explorer'
        },
        {
          id: '3',
          type: 'purchase_order',
          description: 'Compra de peças de reposição',
          amount: 8200,
          requestedBy: 'Dept. Manutenção',
          requestedAt: subDays(new Date(), 2),
          priority: 'medium'
        },
        {
          id: '4',
          type: 'reimbursement',
          description: 'Reembolso de despesas - Viagem inspeção',
          amount: 3400,
          requestedBy: 'Inspetor QHSE',
          requestedAt: subDays(new Date(), 3),
          priority: 'low'
        }
      ]);

      // AI Insights
      setAiInsights([
        {
          id: '1',
          type: 'saving',
          title: 'Oportunidade de Economia em Combustível',
          description: 'Otimização de rotas pode reduzir consumo em 8% baseado em padrões históricos',
          potentialValue: 46400,
          confidence: 92,
          actionable: true
        },
        {
          id: '2',
          type: 'risk',
          title: 'Risco de Estouro Orçamentário',
          description: 'Categoria "Manutenção" pode exceder orçamento em 15 dias se tendência continuar',
          potentialValue: 52500,
          confidence: 78,
          actionable: true
        },
        {
          id: '3',
          type: 'optimization',
          title: 'Consolidação de Fornecedores',
          description: 'Negociação com 3 fornecedores pode reduzir custos de suprimentos em 12%',
          potentialValue: 28800,
          confidence: 85,
          actionable: true
        },
        {
          id: '4',
          type: 'forecast',
          title: 'Previsão de Fluxo de Caixa',
          description: 'Déficit previsto de R$ 180k no próximo trimestre sem intervenção',
          potentialValue: 180000,
          confidence: 71,
          actionable: false
        }
      ]);

    } catch (error) {
      logger.error('Error loading financial data', error as Error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'saving': return <PiggyBank className="h-5 w-5 text-green-500" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'forecast': return <BarChart3 className="h-5 w-5 text-purple-500" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const handleApprove = (id: string) => {
    toast.success('Item aprovado com sucesso!');
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
  };

  const handleReject = (id: string) => {
    toast.error('Item rejeitado');
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 border border-success/20">
            <DollarSign className="h-8 w-8 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro Financeiro</h1>
            <p className="text-muted-foreground">Gestão completa de finanças com IA integrada</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period as typeof selectedPeriod)}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : period === 'quarter' ? 'Trimestre' : 'Ano'}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={loadFinancialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setActiveTab('invoices')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{kpi.title}</span>
                  <div className={kpi.color}>{kpi.icon}</div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{formatValue(kpi.value, kpi.format)}</p>
                  <div className="flex items-center gap-2">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(calculateChange(kpi.value, kpi.previousValue)).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs período anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprovações
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingApprovals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Orçamento
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Faturas
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Execução Orçamentária
                </CardTitle>
                <CardDescription>Consumo por categoria vs orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          R$ {(cat.amount / 1000).toFixed(0)}k / R$ {(cat.budget / 1000).toFixed(0)}k
                        </span>
                        <Badge variant={cat.percentage > 95 ? 'destructive' : cat.percentage > 85 ? 'secondary' : 'default'}>
                          {cat.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={cat.percentage} 
                      className={`h-2 ${cat.percentage > 95 ? '[&>div]:bg-red-500' : cat.percentage > 85 ? '[&>div]:bg-yellow-500' : ''}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Transações Recentes
                </CardTitle>
                <CardDescription>Últimas movimentações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { type: 'expense', desc: 'Combustível - Santos', amount: -45000, date: new Date() },
                      { type: 'income', desc: 'Frete Internacional', amount: 125000, date: subDays(new Date(), 1) },
                      { type: 'expense', desc: 'Manutenção Preventiva', amount: -18500, date: subDays(new Date(), 2) },
                      { type: 'expense', desc: 'Taxas Portuárias', amount: -8200, date: subDays(new Date(), 3) },
                      { type: 'income', desc: 'Contrato Charter', amount: 280000, date: subDays(new Date(), 4) },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {tx.type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.desc}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(tx.date, "dd 'de' MMM", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pendentes de Aprovação</h3>
            <Badge variant="outline">
              {pendingApprovals.length} itens pendentes
            </Badge>
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {pendingApprovals.map((approval) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {approval.type === 'invoice' && <FileText className="h-5 w-5 text-primary" />}
                            {approval.type === 'expense' && <Receipt className="h-5 w-5 text-primary" />}
                            {approval.type === 'purchase_order' && <CreditCard className="h-5 w-5 text-primary" />}
                            {approval.type === 'reimbursement' && <Wallet className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{approval.description}</h4>
                              <Badge className={getPriorityColor(approval.priority)}>
                                {approval.priority === 'urgent' ? 'Urgente' : 
                                 approval.priority === 'high' ? 'Alta' : 
                                 approval.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{approval.requestedBy}</span>
                              {approval.vesselName && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Ship className="h-3 w-3" />
                                    {approval.vesselName}
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(approval.requestedAt, "dd/MM 'às' HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">
                            R$ {approval.amount.toLocaleString('pt-BR')}
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReject(approval.id)}
                            >
                              Rejeitar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(approval.id)}
                            >
                              Aprovar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {pendingApprovals.length === 0 && (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm">Não há itens pendentes de aprovação</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle Orçamentário por Embarcação</CardTitle>
              <CardDescription>Acompanhe o orçamento individual de cada embarcação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { vessel: 'MV Atlantic Star', budget: 450000, spent: 380000, status: 'ok' },
                  { vessel: 'MV Pacific Explorer', budget: 520000, spent: 510000, status: 'warning' },
                  { vessel: 'MV Ocean Titan', budget: 380000, spent: 295000, status: 'ok' },
                  { vessel: 'MV Caribbean Queen', budget: 410000, spent: 425000, status: 'critical' },
                ].map((v) => (
                  <div key={v.vessel} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Ship className="h-5 w-5 text-primary" />
                        <span className="font-medium">{v.vessel}</span>
                      </div>
                      <Badge 
                        variant={v.status === 'ok' ? 'default' : v.status === 'warning' ? 'secondary' : 'destructive'}
                      >
                        {((v.spent / v.budget) * 100).toFixed(0)}% utilizado
                      </Badge>
                    </div>
                    <Progress 
                      value={(v.spent / v.budget) * 100} 
                      className={`h-2 ${v.status === 'critical' ? '[&>div]:bg-red-500' : v.status === 'warning' ? '[&>div]:bg-yellow-500' : ''}`}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>Gasto: R$ {(v.spent / 1000).toFixed(0)}k</span>
                      <span>Orçamento: R$ {(v.budget / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar faturas..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setSearchQuery(''); toast.success("Filtros limpos"); }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button variant="outline" onClick={() => {
                const csvData = 'Fatura,Fornecedor,Embarcação,Valor,Vencimento,Status\nINV-2024-001,Petrobrás,MV Atlantic Star,45000,' + format(new Date(), 'dd/MM/yyyy') + ',Pendente\nINV-2024-002,PortoServices,MV Pacific Explorer,12300,' + format(subDays(new Date(), 3), 'dd/MM/yyyy') + ',Pago';
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `faturas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('CSV exportado com sucesso');
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => { window.history.pushState({}, '', '/procurement-command'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Fatura
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Fatura</th>
                    <th className="text-left p-4 font-medium">Fornecedor</th>
                    <th className="text-left p-4 font-medium">Embarcação</th>
                    <th className="text-left p-4 font-medium">Valor</th>
                    <th className="text-left p-4 font-medium">Vencimento</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'INV-2024-001', supplier: 'Petrobrás', vessel: 'MV Atlantic Star', amount: 45000, due: new Date(), status: 'pending' },
                    { id: 'INV-2024-002', supplier: 'PortoServices', vessel: 'MV Pacific Explorer', amount: 12300, due: subDays(new Date(), 3), status: 'paid' },
                    { id: 'INV-2024-003', supplier: 'MarineParts', vessel: 'MV Ocean Titan', amount: 8500, due: subDays(new Date(), -5), status: 'pending' },
                    { id: 'INV-2024-004', supplier: 'ShipTech', vessel: 'MV Caribbean Queen', amount: 22000, due: subDays(new Date(), 10), status: 'overdue' },
                  ].map((inv) => (
                    <tr key={inv.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{inv.id}</td>
                      <td className="p-4">{inv.supplier}</td>
                      <td className="p-4 text-muted-foreground">{inv.vessel}</td>
                      <td className="p-4 font-medium">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-muted-foreground">{format(inv.due, 'dd/MM/yyyy')}</td>
                      <td className="p-4">
                        <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {inv.status === 'paid' ? 'Pago' : inv.status === 'overdue' ? 'Vencido' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`Fatura: ${inv.id} | Fornecedor: ${inv.supplier} | Embarcação: ${inv.vessel} | Valor: R$ ${inv.amount.toLocaleString('pt-BR')} | Status: ${inv.status}`); toast.success(`Dados da fatura ${inv.id} copiados`); }}>Ver</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Insights Financeiros IA</h3>
                <p className="text-sm text-muted-foreground">Análises e recomendações baseadas em machine learning</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadFinancialData}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Novos Insights
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline">
                          {insight.confidence}% confiança
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold text-primary">
                          {insight.type === 'risk' ? '-' : '+'} R$ {insight.potentialValue.toLocaleString('pt-BR')}
                        </span>
                        {insight.actionable && (
                          <Button size="sm" onClick={() => { navigator.clipboard.writeText(`Recomendação: ${insight.title} | ${insight.description} | Economia: R$ ${insight.potentialValue.toLocaleString('pt-BR')}`); toast.success(`Recomendação "${insight.title}" copiada`); }}>
                            Aplicar Recomendação
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFinanceCenter;
