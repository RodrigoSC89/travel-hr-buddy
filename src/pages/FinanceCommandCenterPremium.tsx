/**
 * Finance Command Center Premium - Hub Financeiro Completo
 * Integra todos os componentes financeiros com abas
 * ENTERPRISE UPGRADE - Phase 8
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, FileText, DollarSign, BarChart3, 
  TrendingUp, CreditCard, PiggyBank, Ship, Anchor, ShoppingCart, Users
} from "lucide-react";

// Lazy load original components
const FinanceCommandDashboard = lazy(() => import("@/modules/finance-hub/components/FinanceCommandDashboard"));
const ContractManagement = lazy(() => import("@/modules/finance-hub/components/ContractManagement"));
const FinanceIntelligenceHub = lazy(() => import("@/components/premium/FinanceIntelligenceHub"));

// Enterprise Components - Phase 8
import { 
  VoyageAccounting,
  SupplierPortal,
  ProcurementHub,
  FinanceExecutiveDashboard
} from "@/components/enterprise";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// Budget Management Component
function BudgetManagement() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Budget Anual</p>
            <p className="text-2xl font-bold">R$ 48.5M</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Utilizado</p>
            <p className="text-2xl font-bold">R$ 42.2M</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Disponível</p>
            <p className="text-2xl font-bold text-warning">R$ 6.3M</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Variância</p>
            <p className="text-2xl font-bold text-success">-2.5%</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Gestão de Orçamento</p>
          <p className="text-sm">Planejamento e controle orçamentário por centro de custo</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Accounts Payable/Receivable
function AccountsManagement() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-success" />
              <h3 className="font-medium">Contas a Receber</h3>
            </div>
            <p className="text-3xl font-bold text-success">R$ 8.2M</p>
            <p className="text-sm text-muted-foreground mt-2">15 faturas pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-destructive" />
              <h3 className="font-medium">Contas a Pagar</h3>
            </div>
            <p className="text-3xl font-bold text-destructive">R$ 3.5M</p>
            <p className="text-sm text-muted-foreground mt-2">28 pagamentos agendados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reports Component
function FinanceReports() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { title: "DRE Mensal", icon: BarChart3 },
        { title: "Fluxo de Caixa", icon: TrendingUp },
        { title: "OPEX por Navio", icon: DollarSign },
        { title: "Budget vs Realizado", icon: PiggyBank },
      ].map((report) => (
        <Card key={report.title} className="hover:border-primary transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <report.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">{report.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FinanceCommandCenterPremium() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-success" />
            Finance Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de comando financeiro e gestão de contratos
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Premium
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="voyage-pnl" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="voyage-pnl" className="flex flex-col items-center gap-1 py-2">
            <Ship className="h-4 w-4" />
            <span className="text-xs">Voyage P&L</span>
          </TabsTrigger>
          <TabsTrigger value="voyage-acct" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Contabilidade</span>
          </TabsTrigger>
          <TabsTrigger value="executive" className="flex flex-col items-center gap-1 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Executivo</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Contratos</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex flex-col items-center gap-1 py-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">Fornecedores</span>
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex flex-col items-center gap-1 py-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs">Compras</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex flex-col items-center gap-1 py-2">
            <PiggyBank className="h-4 w-4" />
            <span className="text-xs">Orçamento</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex flex-col items-center gap-1 py-2">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Contas</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voyage-pnl">
          <Suspense fallback={<LoadingSkeleton />}>
            <FinanceIntelligenceHub />
          </Suspense>
        </TabsContent>

        {/* Enterprise Components - Phase 8 */}
        <TabsContent value="voyage-acct">
          <VoyageAccounting />
        </TabsContent>

        <TabsContent value="executive">
          <FinanceExecutiveDashboard />
        </TabsContent>

        <TabsContent value="dashboard">
          <Suspense fallback={<LoadingSkeleton />}>
            <FinanceCommandDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="contracts">
          <Suspense fallback={<LoadingSkeleton />}>
            <ContractManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierPortal />
        </TabsContent>

        <TabsContent value="procurement">
          <ProcurementHub />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetManagement />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsManagement />
        </TabsContent>

        <TabsContent value="reports">
          <FinanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
