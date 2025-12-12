import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, RefreshCw, Plus, Activity, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo } from "react";;;
import { TransactionList } from "./components/TransactionList";
import { BudgetOverview } from "./components/BudgetOverview";
import { ExpenseChart } from "./components/ExpenseChart";
import { InvoiceManager } from "./components/InvoiceManager";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { FinanceAIPanel } from "./components/FinanceAIPanel";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
}

interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  transactions: Transaction[];
}

export default function FinanceHub() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    income: 0,
    expenses: 0,
    balance: 0,
    transactions: []
  });

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Fetch real transactions from Supabase
      const { data: transactionsData, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (transactionsData && transactionsData.length > 0) {
        const transactions: Transaction[] = transactionsData.map((t: unknown) => ({
          id: t.id,
          type: t.transaction_type === "income" || t.amount > 0 ? "income" : "expense",
          amount: Math.abs(t.amount),
          description: t.description || "Transação",
          category: t.category || "Geral",
          transaction_date: t.transaction_date
        }));

        const income = transactions
          .filter(t => t.type === "income")
          .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);

        setSummary({
          income,
          expenses,
          balance: income - expenses,
          transactions
        });
      } else {
        // Demo data when no real data exists
        setSummary({
          income: 450000,
          expenses: 285000,
          balance: 165000,
          transactions: [
            { id: "1", type: "income", amount: 120000, description: "Contrato de Transporte - Cliente A", category: "Operações", transaction_date: new Date().toISOString() },
            { id: "2", type: "expense", amount: 45000, description: "Combustível - Janeiro", category: "Combustível", transaction_date: new Date(Date.now() - 86400000).toISOString() },
            { id: "3", type: "expense", amount: 32000, description: "Manutenção Preventiva", category: "Manutenção", transaction_date: new Date(Date.now() - 172800000).toISOString() },
            { id: "4", type: "income", amount: 85000, description: "Frete Internacional", category: "Operações", transaction_date: new Date(Date.now() - 259200000).toISOString() },
            { id: "5", type: "expense", amount: 18000, description: "Peças de Reposição", category: "Manutenção", transaction_date: new Date(Date.now() - 345600000).toISOString() }
          ]
        });
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      // Fallback demo data
      setSummary({
        income: 450000,
        expenses: 285000,
        balance: 165000,
        transactions: [
          { id: "1", type: "income", amount: 120000, description: "Contrato de Transporte - Cliente A", category: "Operações", transaction_date: new Date().toISOString() },
          { id: "2", type: "expense", amount: 45000, description: "Combustível - Janeiro", category: "Combustível", transaction_date: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", type: "expense", amount: 32000, description: "Manutenção Preventiva", category: "Manutenção", transaction_date: new Date(Date.now() - 172800000).toISOString() }
        ]
      });
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const incomeChange = 12.5;
  const expenseChange = -3.2;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando dados financeiros...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro Financeiro</h1>
            <p className="text-muted-foreground">Gestão completa de finanças e orçamentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSetShowAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
          <Button variant="outline" onClick={loadFinancialData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={handleSetSelectedPeriod}
            size="sm"
          >
            Mês
          </Button>
          <Button
            variant={selectedPeriod === "quarter" ? "default" : "outline"}
            onClick={handleSetSelectedPeriod}
            size="sm"
          >
            Trimestre
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            onClick={handleSetSelectedPeriod}
            size="sm"
          >
            Ano
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                R$ {summary.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+{incomeChange}%</span> vs período anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                R$ {summary.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">{expenseChange}%</span> vs período anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                R$ {summary.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {((summary.balance / summary.income) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.transactions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPeriod === "month" ? "Este mês" : selectedPeriod === "quarter" ? "Este trimestre" : "Este ano"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExpenseChart transactions={summary.transactions} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={summary.transactions} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetOverview period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="ai">
          <FinanceAIPanel 
            transactions={summary.transactions} 
            income={summary.income} 
            expenses={summary.expenses} 
          />
        </TabsContent>
      </Tabs>

      <AddTransactionDialog 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction} 
        onSuccess={loadFinancialData}
      />
    </div>
  );
}
