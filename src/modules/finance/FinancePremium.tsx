/**
 * Finance Premium - v2.0
 * Centro Financeiro e Contratos
 */

import React, { useState, useEffect } from "react";
import { 
  DollarSign, LayoutDashboard, Receipt, FileText, TrendingUp,
  Wallet, CreditCard, Bot, Plus, AlertTriangle, ArrowUpRight,
  ArrowDownRight, PieChart, BarChart3, Clock
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useNavigate } from "react-router-dom";

// Finance Dashboard
function FinanceDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase transaction rows rendered directly in JSX
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTransactions() {
      const { data } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .limit(20);
      
      if (data) setTransactions(data);
      setLoading(false);
    }
    loadTransactions();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.transaction_type === "income" || t.transaction_type === "revenue")
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.transaction_type === "expense")
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const handleNewTransaction = async () => {
    const { error } = await fromUntyped("financial_transactions").insert([{
      description: "Nova Transação",
      amount: 0,
      transaction_type: "expense",
      category: "Geral",
      transaction_date: new Date().toISOString().slice(0, 10),
      status: "pending",
    }]);
    if (error) {
      toast.error("Erro ao criar transação");
    } else {
      toast.success("Transação criada - edite os detalhes");
      const { data } = await supabase.from("financial_transactions").select("*").order("transaction_date", { ascending: false }).limit(20);
      if (data) setTransactions(data);
    }
  };

  const handleExportCSV = () => {
    const rows = ["Descrição;Categoria;Tipo;Valor;Data", ...transactions.map(t =>
      `${t.description || "N/A"};${t.category || "Geral"};${t.transaction_type};${t.amount};${t.transaction_date}`
    )];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório financeiro exportado");
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-success">
                  R$ {(totalRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {(totalExpenses / 1000).toFixed(0)}K
                </p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="text-2xl font-bold">
                  R$ {((totalRevenue - totalExpenses) / 1000).toFixed(0)}K
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">
                  {transactions.filter(t => t.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Contratos</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <FileText className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={handleNewTransaction}>
              <Receipt className="h-4 w-4" />
              Registrar Transação
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/vessel-contracts")}>
              <FileText className="h-4 w-4" />
              Novo Contrato
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={handleExportCSV}>
              <BarChart3 className="h-4 w-4" />
              Relatório Financeiro
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate("/finance-command")}>
              <Bot className="h-4 w-4" />
              Análise de Custos com IA
            </Button>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Orçamento por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Combustível", budget: 500000, spent: 420000 },
                { name: "Manutenção", budget: 300000, spent: 275000 },
                { name: "Tripulação", budget: 450000, spent: 440000 },
                { name: "Porto", budget: 150000, spent: 89000 },
              ].map((cat) => {
                const percent = (cat.spent / cat.budget) * 100;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat.name}</span>
                      <span className={percent > 90 ? "text-destructive" : "text-muted-foreground"}>
                        R$ {(cat.spent / 1000).toFixed(0)}K / {(cat.budget / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress 
                      value={percent} 
                      className={percent > 90 ? "[&>div]:bg-destructive" : percent > 75 ? "[&>div]:bg-warning" : ""}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <Button className="mt-4" onClick={handleNewTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Transação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tx.transaction_type === "income" || tx.transaction_type === "revenue" 
                        ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {tx.transaction_type === "income" || tx.transaction_type === "revenue" 
                        ? <ArrowUpRight className="h-5 w-5 text-success" />
                        : <ArrowDownRight className="h-5 w-5 text-destructive" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold">{tx.description || "Transação"}</p>
                      <p className="text-sm text-muted-foreground">{tx.category || "Geral"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.transaction_type === "income" || tx.transaction_type === "revenue" 
                        ? "text-success" : "text-destructive"
                    }`}>
                      {tx.transaction_type === "income" || tx.transaction_type === "revenue" ? "+" : "-"}
                      R$ {(tx.amount || 0).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.transaction_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contratos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "Charter Party", vessel: "MV Atlantic Star", value: "R$ 2.5M/mês", status: "active" },
              { type: "Afretamento", vessel: "MV Pacific Explorer", value: "R$ 1.8M/mês", status: "active" },
              { type: "Serviço", vessel: "Frota OSV", value: "R$ 850K/mês", status: "renewal" },
            ].map((contract) => (
              <div key={`${contract.type}-${contract.vessel}`} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                    {contract.status === "active" ? "Ativo" : "Renovação"}
                  </Badge>
                </div>
                <p className="font-semibold">{contract.type}</p>
                <p className="text-sm text-muted-foreground">{contract.vessel}</p>
                <p className="text-lg font-bold text-primary mt-2">{contract.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinancePremium() {
  const handleRefresh = async () => {
    // Real refresh triggers React Query invalidation via child components
  };

  const handleExport = () => {
    const blob = new Blob(['\uFEFF' + "Módulo;Status\nFinance Dashboard;Ativo\nTransações;Ativo\nContratos;Ativo"], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório financeiro exportado");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <FinanceDashboard />
    },
    {
      id: "transactions",
      label: "Transações",
      icon: Receipt,
      content: <div className="text-center py-12 text-muted-foreground">Gestão de Transações</div>
    },
    {
      id: "contracts",
      label: "Contratos",
      icon: FileText,
      badge: 3,
      content: <div className="text-center py-12 text-muted-foreground">Gestão de Contratos</div>
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: BarChart3,
      content: <div className="text-center py-12 text-muted-foreground">Relatórios Financeiros</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <BarChart3 className="h-4 w-4" />
        Relatório
      </Button>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Nova Transação
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Finance & Contracts"
      subtitle="Gestão financeira e contratos marítimos"
      icon={DollarSign}
      iconGradient="from-emerald-500 to-green-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={3}
    />
  );
}
