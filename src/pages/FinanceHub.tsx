import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  CreditCard,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Filter,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Demo data
const financialSummary = {
  revenue: 2450000,
  expenses: 1890000,
  profit: 560000,
  budget: 2000000,
  budgetUsed: 1890000,
};

const recentTransactions = [
  { id: 1, description: "Combustível - Embarcação Alpha", amount: -45000, date: "2024-01-15", category: "fuel", status: "approved" },
  { id: 2, description: "Manutenção Preventiva", amount: -12500, date: "2024-01-14", category: "maintenance", status: "pending" },
  { id: 3, description: "Contrato de Frete #2024-001", amount: 180000, date: "2024-01-13", category: "revenue", status: "approved" },
  { id: 4, description: "Provisões - Tripulação", amount: -8900, date: "2024-01-12", category: "supplies", status: "approved" },
  { id: 5, description: "Certificação ISM", amount: -15000, date: "2024-01-11", category: "compliance", status: "approved" },
];

const budgetCategories = [
  { name: "Combustível", allocated: 500000, spent: 420000, color: "bg-primary" },
  { name: "Manutenção", allocated: 300000, spent: 280000, color: "bg-success" },
  { name: "Tripulação", allocated: 400000, spent: 390000, color: "bg-warning" },
  { name: "Provisões", allocated: 150000, spent: 120000, color: "bg-info" },
  { name: "Compliance", allocated: 200000, spent: 180000, color: "bg-purple-500" },
];

const pendingApprovals = [
  { id: 1, description: "Reparo Motor Principal", amount: 45000, requester: "Carlos Silva", date: "2024-01-15" },
  { id: 2, description: "Equipamento de Segurança", amount: 12000, requester: "Ana Santos", date: "2024-01-14" },
  { id: 3, description: "Treinamento Tripulação", amount: 8500, requester: "Pedro Costa", date: "2024-01-13" },
];

const FinanceHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const budgetPercentage = (financialSummary.budgetUsed / financialSummary.budget) * 100;

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={DollarSign}
        title="Finance Hub"
        description="Gestão financeira centralizada com análise de custos, orçamentos e aprovações"
        gradient="blue"
        badges={[
          { icon: TrendingUp, label: "Analytics" },
          { icon: PiggyBank, label: "Orçamento" },
          { icon: Receipt, label: "Despesas" }
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.revenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-success">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +12.5% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.expenses)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-destructive">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              +8.2% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(financialSummary.profit)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-1" />
              Margem: 22.8%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Usado</p>
                <p className="text-2xl font-bold text-foreground">{budgetPercentage.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-warning" />
              </div>
            </div>
            <Progress value={budgetPercentage} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="approvals">Aprovações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transações Recentes</CardTitle>
                  <CardDescription>Últimas movimentações financeiras</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("transactions")}>
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {tx.amount > 0 ? (
                            <ArrowUpRight className="h-5 w-5 text-success" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                          {formatCurrency(tx.amount)}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Orçamento por Categoria</CardTitle>
                  <CardDescription>Alocação e consumo do orçamento</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("budget")}>
                  Detalhes
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                        </span>
                      </div>
                      <Progress value={(cat.spent / cat.allocated) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals Alert */}
          {pendingApprovals.length > 0 && (
            <Card className="bg-warning/5 border-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-5 w-5" />
                  Aprovações Pendentes ({pendingApprovals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <Clock className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setActiveTab("approvals")}>
                    Ver todas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Histórico completo de movimentações</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => navigate("/expenses")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-6 w-6 text-success" />
                        ) : (
                          <Receipt className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {tx.date}
                          <span>•</span>
                          <Badge variant="outline">{tx.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                        {formatCurrency(tx.amount)}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Gestão de Orçamento</CardTitle>
              <CardDescription>Controle detalhado de alocação e consumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetCategories.map((cat) => (
                  <div key={cat.name} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full ${cat.color}`} />
                        <span className="font-medium text-foreground">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(cat.spent)}</p>
                        <p className="text-sm text-muted-foreground">de {formatCurrency(cat.allocated)}</p>
                      </div>
                    </div>
                    <Progress value={(cat.spent / cat.allocated) * 100} className="h-3" />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {((cat.spent / cat.allocated) * 100).toFixed(1)}% utilizado
                      </span>
                      <span className="text-success">
                        {formatCurrency(cat.allocated - cat.spent)} disponível
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Aprovações Pendentes</CardTitle>
              <CardDescription>Solicitações aguardando sua aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Solicitante: {item.requester}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Rejeitar
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                    <p>Nenhuma aprovação pendente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default FinanceHub;
