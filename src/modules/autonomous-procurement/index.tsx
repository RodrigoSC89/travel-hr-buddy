import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, LayoutDashboard, Package, Building2, BarChart3, Brain, FileText } from "lucide-react";
import ProcurementDashboard from "./components/ProcurementDashboard";

export default function AutonomousProcurement() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Autonomous Procurement
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestão inteligente de compras com requisições automáticas e análise de fornecedores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Fornecedores</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ProcurementDashboard />
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Aguardando Entrega</p>
                  <p className="text-2xl font-bold text-warning">8</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Entregues Hoje</p>
                  <p className="text-2xl font-bold text-success">4</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center py-4">
                Visualize detalhes completos no módulo Procurement & Inventory
              </p>
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Total Fornecedores</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Preferenciais</p>
                  <p className="text-2xl font-bold text-primary">8</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Taxa Entrega</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Lead Time Médio</p>
                  <p className="text-2xl font-bold">6d</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="font-semibold mb-2">Análise de Custos</h3>
                  <p className="text-3xl font-bold text-primary">R$ 245K</p>
                  <p className="text-sm text-success">↓ 12% vs mês anterior</p>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="font-semibold mb-2">Previsão Lead Time</h3>
                  <p className="text-3xl font-bold">5.2 dias</p>
                  <p className="text-sm text-muted-foreground">Média preditiva IA</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="font-semibold mb-4">Relatórios Disponíveis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Relatório de Compras - Janeiro 2026</span>
                    <Badge>PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Auditoria de Fornecedores Q4</span>
                    <Badge>PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Blockchain Transactions Log</span>
                    <Badge variant="secondary">JSON</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
