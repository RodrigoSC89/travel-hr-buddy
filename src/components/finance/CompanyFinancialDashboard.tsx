/**
 * Company Financial Dashboard
 * Multi-currency, procurement, asset tracking
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Ship,
  Package,
  FileText,
  CreditCard,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  Fuel,
  Wrench
} from "lucide-react";
import { motion } from "framer-motion";

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  currency: string;
}

interface VesselFinancials {
  id: string;
  name: string;
  revenue: number;
  opex: number;
  profit: number;
  utilization: number;
}

interface ProcurementItem {
  id: string;
  description: string;
  vendor: string;
  amount: number;
  status: "pending" | "approved" | "ordered" | "delivered";
  category: string;
}

// Mock data
const financialSummary: FinancialSummary = {
  revenue: 12500000,
  expenses: 8750000,
  profit: 3750000,
  profitMargin: 30,
  currency: "USD"
};

const vesselFinancials: VesselFinancials[] = [
  { id: "1", name: "MV Nautilus I", revenue: 3200000, opex: 2100000, profit: 1100000, utilization: 92 },
  { id: "2", name: "MV Nautilus II", revenue: 2800000, opex: 1950000, profit: 850000, utilization: 88 },
  { id: "3", name: "MV Nautilus III", revenue: 3500000, opex: 2300000, profit: 1200000, utilization: 95 },
  { id: "4", name: "MV Nautilus IV", revenue: 3000000, opex: 2400000, profit: 600000, utilization: 78 }
];

const procurementItems: ProcurementItem[] = [
  { id: "1", description: "Spare Parts - Main Engine", vendor: "MAN Energy", amount: 125000, status: "approved", category: "Maintenance" },
  { id: "2", description: "Lubricants - Q1 2025", vendor: "Shell Marine", amount: 45000, status: "ordered", category: "Consumables" },
  { id: "3", description: "Safety Equipment", vendor: "Viking Life", amount: 32000, status: "pending", category: "Safety" },
  { id: "4", description: "Navigation Software Update", vendor: "Kongsberg", amount: 18000, status: "delivered", category: "Technology" }
];

const expenseBreakdown = [
  { category: "Combustível", amount: 3500000, percentage: 40, icon: Fuel, color: "bg-amber-500" },
  { category: "Tripulação", amount: 2100000, percentage: 24, icon: Ship, color: "bg-blue-500" },
  { category: "Manutenção", amount: 1400000, percentage: 16, icon: Wrench, color: "bg-purple-500" },
  { category: "Porto & Taxas", amount: 875000, percentage: 10, icon: Building2, color: "bg-green-500" },
  { category: "Seguros", amount: 525000, percentage: 6, icon: FileText, color: "bg-red-500" },
  { category: "Outros", amount: 350000, percentage: 4, icon: Package, color: "bg-gray-500" }
];

const statusColors: Record<ProcurementItem["status"], string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-blue-500/10 text-blue-500",
  ordered: "bg-purple-500/10 text-purple-500",
  delivered: "bg-green-500/10 text-green-500"
};

const statusLabels: Record<ProcurementItem["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  ordered: "Pedido",
  delivered: "Entregue"
};

export function CompanyFinancialDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Gestão Financeira
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada de receitas, despesas e procurement
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório Financeiro
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(financialSummary.revenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5% vs ano anterior
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(financialSummary.expenses)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <ArrowDownRight className="h-3 w-3" />
                    -3.2% otimizado
                  </div>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {formatCurrency(financialSummary.profit)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                    <ArrowUpRight className="h-3 w-3" />
                    Margem: {financialSummary.profitMargin}%
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Procurement Pendente</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(procurementItems.filter(p => p.status === "pending").reduce((a, p) => a + p.amount, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {procurementItems.filter(p => p.status === "pending").length} itens
                  </p>
                </div>
                <Package className="h-8 w-8 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="vessels">Por Embarcação</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Composição de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${item.color}/10`}>
                              <Icon className={`h-4 w-4 ${item.color.replace("bg-", "text-")}`} />
                            </div>
                            <span className="font-medium">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                            <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fleet Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vesselFinancials.map(vessel => (
                    <div key={vessel.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-primary" />
                          <span className="font-medium">{vessel.name}</span>
                        </div>
                        <Badge variant={vessel.profit > 1000000 ? "default" : "secondary"}>
                          {formatCurrency(vessel.profit)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receita</p>
                          <p className="font-medium text-green-500">{formatCurrency(vessel.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">OPEX</p>
                          <p className="font-medium text-red-500">{formatCurrency(vessel.opex)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilização</p>
                          <p className="font-medium">{vessel.utilization}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vessels Tab */}
        <TabsContent value="vessels" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vesselFinancials.map(vessel => (
              <Card key={vessel.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {vessel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Receita</p>
                      <p className="text-xl font-bold text-green-500">{formatCurrency(vessel.revenue)}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">OPEX</p>
                      <p className="text-xl font-bold text-red-500">{formatCurrency(vessel.opex)}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Lucro</p>
                      <p className="text-xl font-bold text-blue-500">{formatCurrency(vessel.profit)}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Utilização</p>
                      <p className="text-xl font-bold text-purple-500">{vessel.utilization}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Procurement Tab */}
        <TabsContent value="procurement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens de Procurement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {procurementItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.vendor} • {item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{formatCurrency(item.amount)}</span>
                      <Badge className={statusColors[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseBreakdown.map(item => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.category} className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${item.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{item.category}</p>
                            <p className="text-xs text-muted-foreground">{item.percentage}% do total</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(item.amount)}</p>
                      </CardContent>
                    </Card>
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

export default CompanyFinancialDashboard;
