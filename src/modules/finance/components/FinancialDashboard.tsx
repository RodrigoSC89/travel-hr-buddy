/**
 * Financial Dashboard - Premium Finance Module
 * Gestão financeira completa com analytics e previsões
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  Building2,
  Ship,
  Calendar,
  Download,
  Filter,
  Plus,
  Eye,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  client?: string;
  status: "completed" | "pending" | "cancelled";
  vessel?: string;
  vendor?: string;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  type: "receivable" | "payable";
}

interface BudgetItem {
  category: string;
  allocated: number;
  spent: number;
  currency: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  { id: "1", type: "expense", category: "Combustível", description: "Bunker - Porto Santos", amount: 125000, currency: "USD", date: "2024-01-15", status: "completed", vessel: "MV Atlantic Star" },
  { id: "2", type: "expense", category: "Manutenção", description: "Reparo Motor Principal", amount: 45000, currency: "USD", date: "2024-01-14", status: "pending", vessel: "MV Pacific Dream" },
  { id: "3", type: "income", category: "Frete", description: "Contrato Charter Party", amount: 850000, currency: "USD", date: "2024-01-13", status: "completed", client: "Petrobras" },
  { id: "4", type: "expense", category: "Tripulação", description: "Salários Janeiro", amount: 180000, currency: "USD", date: "2024-01-12", status: "completed" },
  { id: "5", type: "expense", category: "Provisões", description: "Suprimentos Alimentícios", amount: 15000, currency: "USD", date: "2024-01-11", status: "completed", vessel: "MV Atlantic Star" },
];

const mockInvoices: Invoice[] = [
  { id: "1", number: "INV-2024-001", client: "Petrobras", amount: 850000, currency: "USD", dueDate: "2024-02-15", status: "pending", type: "receivable" },
  { id: "2", number: "INV-2024-002", client: "Shell Trading", amount: 420000, currency: "USD", dueDate: "2024-02-20", status: "pending", type: "receivable" },
  { id: "3", number: "BILL-2024-015", client: "Porto de Santos", amount: 35000, currency: "BRL", dueDate: "2024-01-20", status: "overdue", type: "payable" },
  { id: "4", number: "BILL-2024-016", client: "Bunker Supplier", amount: 125000, currency: "USD", dueDate: "2024-01-25", status: "pending", type: "payable" },
];

const mockBudget: BudgetItem[] = [
  { category: "Combustível", allocated: 500000, spent: 325000, currency: "USD" },
  { category: "Manutenção", allocated: 200000, spent: 145000, currency: "USD" },
  { category: "Tripulação", allocated: 600000, spent: 540000, currency: "USD" },
  { category: "Provisões", allocated: 80000, spent: 45000, currency: "USD" },
  { category: "Seguros", allocated: 150000, spent: 150000, currency: "USD" },
  { category: "Porto", allocated: 100000, spent: 78000, currency: "USD" },
];

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const totalRevenue = 2850000;
  const totalExpenses = 1250000;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const pendingReceivables = mockInvoices
    .filter(i => i.type === "receivable" && i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  const overduePayables = mockInvoices
    .filter(i => i.type === "payable" && i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header com KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600">+12.5% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-600">-3.2% vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(netProfit)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <PieChart className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-blue-600">Margem: {profitMargin}%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingReceivables)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-600">2 faturas pendentes</span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Receipt className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Financeiros */}
      {overduePayables > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Pagamentos em Atraso</p>
                <p className="text-sm text-muted-foreground">
                  Você tem {formatCurrency(overduePayables)} em faturas vencidas que precisam de atenção
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Faturas
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <PieChart className="h-4 w-4" />
              Orçamento
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Receitas vs Despesas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fluxo de Caixa - Últimos 6 Meses</CardTitle>
                <CardDescription>Comparativo de receitas e despesas mensais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-4">
                  {["Ago", "Set", "Out", "Nov", "Dez", "Jan"].map((month, i) => {
                    const revenue = [2.1, 2.4, 2.2, 2.6, 2.9, 2.85][i];
                    const expense = [1.1, 1.2, 1.15, 1.3, 1.4, 1.25][i];
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex gap-1 h-48 items-end">
                          <div 
                            className="w-6 bg-emerald-500 rounded-t"
                            style={{ height: `${(revenue / 3) * 100}%` }}
                          />
                          <div 
                            className="w-6 bg-red-400 rounded-t"
                            style={{ height: `${(expense / 3) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                    <span className="text-sm">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded" />
                    <span className="text-sm">Despesas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Despesas */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição do mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Combustível", value: 35, color: "bg-blue-500" },
                    { name: "Tripulação", value: 28, color: "bg-emerald-500" },
                    { name: "Manutenção", value: 18, color: "bg-amber-500" },
                    { name: "Porto", value: 12, color: "bg-purple-500" },
                    { name: "Outros", value: 7, color: "bg-gray-500" },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", item.color)}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Movimentações financeiras dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockTransactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          tx.type === "income" 
                            ? "bg-emerald-500/20 text-emerald-600" 
                            : "bg-red-500/20 text-red-600"
                        )}>
                          {tx.type === "income" ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{tx.category}</span>
                            {tx.vessel && (
                              <>
                                <span>•</span>
                                <Ship className="h-3 w-3" />
                                <span>{tx.vessel}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          tx.type === "income" ? "text-emerald-600" : "text-red-600"
                        )}>
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-muted-foreground">{tx.date}</span>
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                            {tx.status === "completed" ? "Concluído" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* A Receber */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-600">Contas a Receber</CardTitle>
                  <CardDescription>Faturas emitidas para clientes</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInvoices.filter(i => i.type === "receivable").map((inv) => (
                    <div key={inv.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{inv.client}</span>
                        </div>
                        <Badge variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"}>
                          {inv.status === "paid" ? "Pago" : inv.status === "overdue" ? "Vencido" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{inv.number}</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(inv.amount, inv.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Vence: {inv.dueDate}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* A Pagar */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-red-600">Contas a Pagar</CardTitle>
                  <CardDescription>Faturas de fornecedores</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInvoices.filter(i => i.type === "payable").map((inv) => (
                    <div key={inv.id} className={cn(
                      "p-4 rounded-lg border bg-card",
                      inv.status === "overdue" && "border-destructive/50 bg-destructive/5"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{inv.client}</span>
                        </div>
                        <Badge variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"}>
                          {inv.status === "paid" ? "Pago" : inv.status === "overdue" ? "Vencido" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{inv.number}</span>
                        <span className="font-bold text-red-600">{formatCurrency(inv.amount, inv.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Vence: {inv.dueDate}
                        </div>
                        <Button size="sm" variant={inv.status === "overdue" ? "destructive" : "outline"}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle Orçamentário</CardTitle>
              <CardDescription>Acompanhamento do orçamento por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockBudget.map((item) => {
                  const percentage = (item.spent / item.allocated) * 100;
                  const isOverBudget = percentage > 100;
                  const isNearLimit = percentage > 80 && percentage <= 100;
                  
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.category}</span>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.spent)} de {formatCurrency(item.allocated)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "default"}>
                            {percentage.toFixed(0)}%
                          </Badge>
                          {isOverBudget && (
                            <p className="text-xs text-destructive mt-1">
                              Excedido em {formatCurrency(item.spent - item.allocated)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={cn(
                          "h-3",
                          isOverBudget && "[&>div]:bg-destructive",
                          isNearLimit && "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
