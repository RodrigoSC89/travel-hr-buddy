import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionList } from "./components/TransactionList";
import { BudgetOverview } from "./components/BudgetOverview";
import { ExpenseChart } from "./components/ExpenseChart";
import { InvoiceManager } from "./components/InvoiceManager";

export default function FinanceHub() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Mock data - substituir por dados reais da tabela financial_transactions quando criada
  const financialSummary = {
    income: 450000,
    expenses: 285000,
    balance: 165000,
    total: 735000,
    transactions: [
      {
        id: '1',
        type: 'income' as const,
        amount: 120000,
        description: 'Contrato de Transporte - Cliente A',
        category: 'Operações',
        transaction_date: new Date().toISOString()
      },
      {
        id: '2',
        type: 'expense' as const,
        amount: 45000,
        description: 'Combustível - Janeiro',
        category: 'Combustível',
        transaction_date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        type: 'expense' as const,
        amount: 32000,
        description: 'Manutenção Preventiva',
        category: 'Manutenção',
        transaction_date: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro Financeiro</h1>
          <p className="text-muted-foreground">Gestão completa de finanças e orçamentos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
            size="sm"
          >
            Mês
          </Button>
          <Button
            variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('quarter')}
            size="sm"
          >
            Trimestre
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
            size="sm"
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {financialSummary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {financialSummary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {financialSummary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{selectedPeriod}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExpenseChart transactions={financialSummary.transactions} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={financialSummary.transactions} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetOverview period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
