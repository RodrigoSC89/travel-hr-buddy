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
            <div className="text-center py-12 text-muted-foreground">
              Lista completa de pedidos e requisições - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="text-center py-12 text-muted-foreground">
              Gestão de fornecedores e contratos - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12 text-muted-foreground">
              Analytics preditivo de custos e lead time - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              Relatórios de auditoria e blockchain - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
