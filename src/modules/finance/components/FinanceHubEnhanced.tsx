/**
 * Enhanced Finance Hub with Premium UX
 * PATCH FINANCE-3.0 - Ultimate Finance Experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Plus, RefreshCw,
  FileText, Receipt, CreditCard, PiggyBank, BarChart3, Brain,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Download, Upload, Filter, Search, Calendar, Building2, Ship,
  Sparkles, Target, Zap, Send, FileCheck, Calculator, Banknote,
  ClipboardList, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModuleOnboarding, QuickActionsBar, InteractiveKPICard, ActionableAlertList } from '@/components/ui/module-enhancements';

const FinanceHubEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  // Quick Action handlers
  const quickActions = [
    {
      id: 'new-invoice',
      label: 'Nova Fatura',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setShowNewInvoice(true),
      variant: 'default' as const
    },
    {
      id: 'new-expense',
      label: 'Registrar Despesa',
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => setShowNewTransaction(true)
    },
    {
      id: 'approve-pending',
      label: 'Aprovar Pendentes',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => setActiveTab('approvals'),
      badge: 4
    },
    {
      id: 'export-report',
      label: 'Exportar Relatório',
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        const csv = "Tipo;Descrição;Valor;Data\nDespesa;Combustível - Santos;-45000;" + new Date().toLocaleDateString('pt-BR') + "\nReceita;Frete Internacional;125000;" + new Date().toLocaleDateString('pt-BR');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Relatório exportado com sucesso!');
      }
    },
    {
      id: 'ai-analysis',
      label: 'Análise IA',
      icon: <Brain className="h-4 w-4" />,
      onClick: () => setActiveTab('ai'),
      variant: 'secondary' as const
    }
  ];

  // Onboarding steps
  const onboardingSteps = [
    {
      title: 'Centro Financeiro Completo',
      description: 'Gerencie receitas, despesas, faturas e orçamentos em um só lugar com inteligência artificial integrada.',
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      tip: 'Use o filtro de período para analisar diferentes intervalos de tempo'
    },
    {
      title: 'Aprovações Inteligentes',
      description: 'Fluxo de aprovação de despesas e faturas com priorização automática por urgência.',
      icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
      tip: 'Aprovações urgentes aparecem destacadas em vermelho'
    },
    {
      title: 'Insights de IA',
      description: 'A IA analisa seus gastos e sugere oportunidades de economia e otimização.',
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      tip: 'Clique em qualquer insight para ver detalhes e aplicar a recomendação'
    }
  ];

  // Alerts
  const [alerts] = useState([
    {
      id: '1',
      title: 'Fatura Vencendo Hoje',
      message: 'Fatura #INV-2024-001 de R$ 45.000 vence hoje. Clique para processar pagamento.',
      severity: 'critical' as const,
      timestamp: new Date(),
      source: 'Contas a Pagar',
      actions: [
        { label: 'Pagar Agora', onClick: () => toast.success('Pagamento iniciado') },
        { label: 'Adiar', onClick: () => toast.info('Fatura adiada'), variant: 'outline' as const }
      ]
    },
    {
      id: '2',
      title: 'Orçamento de Combustível Próximo do Limite',
      message: 'Consumo atingiu 96.7% do orçamento mensal. Considere revisão.',
      severity: 'warning' as const,
      timestamp: subDays(new Date(), 1),
      source: 'Orçamento',
      actions: [
        { label: 'Solicitar Aumento', onClick: () => toast.success('Solicitação enviada') }
      ]
    }
  ]);

  // Removed artificial loading state that caused flickering

  return (
    <div className="p-6 space-y-6">
      {/* Onboarding */}
      <ModuleOnboarding
        moduleId="finance-hub"
        moduleName="Centro Financeiro"
        steps={onboardingSteps}
      />

      {/* Header - NO motion to prevent flickering */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro Financeiro</h1>
            <p className="text-muted-foreground">Gestão completa de finanças com IA integrada</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowNewTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar actions={quickActions} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <ActionableAlertList 
          alerts={alerts}
          onDismiss={(id) => toast.info('Alerta removido')}
          maxVisible={3}
        />
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InteractiveKPICard
          title="Receita Total"
          value={2450000}
          change={12.4}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
          format="currency"
          status="success"
          details={[
            { label: 'Frete Internacional', value: 'R$ 1.8M', change: 15 },
            { label: 'Frete Cabotagem', value: 'R$ 450k', change: 8 },
            { label: 'Serviços Extras', value: 'R$ 200k', change: -3 }
          ]}
          onDrillDown={() => setActiveTab('invoices')}
        />
        <InteractiveKPICard
          title="Despesas Totais"
          value={1680000}
          change={-2.3}
          icon={<TrendingDown className="h-5 w-5" />}
          iconColor="text-red-500"
          iconBg="bg-red-500/10"
          format="currency"
          status="success"
          details={[
            { label: 'Combustível', value: 'R$ 580k', change: -2 },
            { label: 'Manutenção', value: 'R$ 320k', change: 5 },
            { label: 'Tripulação', value: 'R$ 420k', change: 2 }
          ]}
        />
        <InteractiveKPICard
          title="Margem de Lucro"
          value={31.4}
          change={2.9}
          icon={<Target className="h-5 w-5" />}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          format="percent"
          status="success"
          progress={78}
        />
        <InteractiveKPICard
          title="Faturas Pendentes"
          value={12}
          change={-33}
          icon={<FileText className="h-5 w-5" />}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-500/10"
          status="warning"
          onDrillDown={() => setActiveTab('approvals')}
          drillDownLabel="Ver pendências"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprovações
            <Badge variant="destructive" className="ml-1">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Faturas
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Orçamento
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Insights
          </TabsTrigger>
        </TabsList>

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
                {[
                  { category: 'Combustível', amount: 580000, budget: 600000, percentage: 96.7 },
                  { category: 'Manutenção', amount: 320000, budget: 350000, percentage: 91.4 },
                  { category: 'Tripulação', amount: 420000, budget: 450000, percentage: 93.3 },
                  { category: 'Portuárias', amount: 180000, budget: 200000, percentage: 90.0 },
                ].map((cat) => (
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
                      className={`h-2 ${cat.percentage > 95 ? '[&>div]:bg-destructive' : cat.percentage > 85 ? '[&>div]:bg-yellow-500' : ''}`}
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
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { type: 'expense', desc: 'Combustível - Santos', amount: -45000, date: new Date() },
                      { type: 'income', desc: 'Frete Internacional', amount: 125000, date: subDays(new Date(), 1) },
                      { type: 'expense', desc: 'Manutenção Preventiva', amount: -18500, date: subDays(new Date(), 2) },
                      { type: 'income', desc: 'Contrato Charter', amount: 280000, date: subDays(new Date(), 3) },
                    ].map((tx, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {tx.type === 'income' ? 
                              <ArrowUpRight className="h-4 w-4 text-green-500" /> : 
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.desc}</p>
                            <p className="text-xs text-muted-foreground">{format(tx.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : ''}R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aprovações Pendentes</CardTitle>
              <CardDescription>Itens aguardando sua aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: '1', type: 'Fatura', desc: 'Combustível - Terminal Santos', amount: 45000, priority: 'urgent', vessel: 'MV Atlantic Star' },
                  { id: '2', type: 'Despesa', desc: 'Manutenção emergencial - Bomba hidráulica', amount: 12500, priority: 'high', vessel: 'MV Pacific Explorer' },
                  { id: '3', type: 'PO', desc: 'Compra de peças de reposição', amount: 8200, priority: 'medium' },
                  { id: '4', type: 'Reembolso', desc: 'Despesas - Viagem inspeção', amount: 3400, priority: 'low' },
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        item.priority === 'urgent' ? 'destructive' : 
                        item.priority === 'high' ? 'secondary' : 'outline'
                      }>
                        {item.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.desc}</p>
                        {item.vessel && <p className="text-sm text-muted-foreground">{item.vessel}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">R$ {item.amount.toLocaleString('pt-BR')}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const { supabase } = await import("@/integrations/supabase/client");
                            await supabase.from("ai_audit_logs").insert({
                              user_input: `Rejeitado: ${item.desc} - R$ ${item.amount}`,
                              interaction_type: "finance_rejection",
                              module_name: "finance-hub"
                            });
                            toast.error(`Rejeitado: ${item.desc}`);
                          } catch { toast.error("Erro ao rejeitar"); }
                        }}>
                          Rejeitar
                        </Button>
                        <Button size="sm" onClick={async () => {
                          try {
                            const { supabase } = await import("@/integrations/supabase/client");
                            await supabase.from("ai_audit_logs").insert({
                              user_input: `Aprovado: ${item.desc} - R$ ${item.amount}`,
                              interaction_type: "finance_approval",
                              module_name: "finance-hub"
                            });
                            toast.success(`Aprovado: ${item.desc}`);
                          } catch { toast.error("Erro ao aprovar"); }
                        }}>
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Faturas</CardTitle>
                <CardDescription>Faturas emitidas e recebidas</CardDescription>
              </div>
              <Button onClick={() => setShowNewInvoice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Fatura
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma fatura para exibir</p>
                <Button className="mt-4" onClick={() => setShowNewInvoice(true)}>
                  Criar Primeira Fatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Orçamento</CardTitle>
              <CardDescription>Planejamento e controle orçamentário</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { category: 'Operacional', total: 2000000, used: 1680000, color: 'bg-blue-500' },
                  { category: 'Manutenção', total: 500000, used: 420000, color: 'bg-orange-500' },
                  { category: 'Administrativo', total: 300000, used: 180000, color: 'bg-green-500' },
                ].map((budget) => (
                  <Card key={budget.category}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{budget.category}</h4>
                      <Progress value={(budget.used / budget.total) * 100} className="h-3 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span>R$ {(budget.used / 1000).toFixed(0)}k usado</span>
                        <span className="text-muted-foreground">R$ {(budget.total / 1000).toFixed(0)}k total</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Contratos</CardTitle>
              <CardDescription>Contratos ativos e em negociação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Contrato Charter - Petrobras', value: 2500000, status: 'active', expiry: '2024-12-31' },
                  { id: '2', name: 'Fornecimento Combustível - Shell', value: 800000, status: 'active', expiry: '2024-09-15' },
                  { id: '3', name: 'Manutenção Anual - Estaleiro', value: 450000, status: 'negotiation', expiry: '2024-08-01' },
                ].map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">Vencimento: {contract.expiry}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">R$ {(contract.value / 1000).toFixed(0)}k</span>
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status === 'active' ? 'Ativo' : 'Negociação'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Insights de IA
              </CardTitle>
              <CardDescription>Recomendações inteligentes para otimização financeira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: 'saving', title: 'Economia em Combustível', desc: 'Otimização de rotas pode reduzir consumo em 8%', value: 46400, confidence: 92 },
                { type: 'risk', title: 'Risco de Estouro Orçamentário', desc: 'Categoria "Manutenção" pode exceder orçamento', value: 52500, confidence: 78 },
                { type: 'optimization', title: 'Consolidação de Fornecedores', desc: 'Negociação conjunta pode reduzir custos em 12%', value: 28800, confidence: 85 },
              ].map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'saving' ? 'bg-green-500/10' :
                        insight.type === 'risk' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        {insight.type === 'saving' ? <PiggyBank className="h-5 w-5 text-green-500" /> :
                         insight.type === 'risk' ? <AlertTriangle className="h-5 w-5 text-red-500" /> :
                         <Zap className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            <Brain className="h-3 w-3 mr-1" />
                            {insight.confidence}% confiança
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400">
                            R$ {insight.value.toLocaleString('pt-BR')} potencial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={async () => {
                      try {
                        const { supabase } = await import("@/integrations/supabase/client");
                        await supabase.from("ai_audit_logs").insert({
                          user_input: `Insight aplicado: ${insight.title} — Economia potencial: R$ ${insight.value}`,
                          interaction_type: "finance_ai_insight",
                          module_name: "finance-hub"
                        });
                        toast.success(`Insight "${insight.title}" aplicado e registrado`);
                      } catch { toast.error("Erro ao aplicar insight"); }
                    }}>Aplicar</Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Transaction Dialog */}
      <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select defaultValue="expense">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input placeholder="Descrição da transação" />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" placeholder="0,00" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="crew">Tripulação</SelectItem>
                  <SelectItem value="port">Taxas Portuárias</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                await supabase.from("ai_audit_logs").insert({
                  user_input: "Nova transação registrada via Finance Hub",
                  interaction_type: "finance_transaction",
                  module_name: "finance-hub"
                });
                toast.success('Transação registrada com sucesso!');
              } catch { toast.error("Erro ao registrar transação"); }
              setShowNewTransaction(false);
            }}>
              Registrar Transação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Fatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <Input placeholder="Nome do cliente" />
              </div>
              <div>
                <Label>Embarcação</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atlantic">MV Atlantic Star</SelectItem>
                    <SelectItem value="pacific">MV Pacific Explorer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Descrição dos serviços" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div>
                <Label>Vencimento</Label>
                <Input type="date" />
              </div>
            </div>
            <Button className="w-full" onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                await supabase.from("ai_audit_logs").insert({
                  user_input: "Nova fatura criada via Finance Hub",
                  interaction_type: "finance_invoice",
                  module_name: "finance-hub"
                });
                toast.success('Fatura criada com sucesso!');
              } catch { toast.error("Erro ao criar fatura"); }
              setShowNewInvoice(false);
            }}>
              <FileText className="h-4 w-4 mr-2" />
              Criar Fatura
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceHubEnhanced;
