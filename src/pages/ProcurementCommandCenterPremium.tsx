 /**
  * PROCUREMENT COMMAND CENTER PREMIUM
  * Versão Premium com todos os módulos avançados integrados
  */
 
 import { useState, lazy, Suspense } from "react";
 import { Helmet } from "react-helmet-async";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Skeleton } from "@/components/ui/skeleton";
 import { 
   ShoppingCart, Brain, Package, Store, FileText, Truck,
   BarChart3, DollarSign, Star, TrendingUp, AlertTriangle,
   Sparkles, Users, ClipboardList, PieChart, Settings,
   RefreshCw, Zap, Award, Target
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 // Lazy load premium components
 const SpendControlTower = lazy(() => import("@/modules/procurement-inventory/components/SpendControlTower"));
 const SupplierPerformanceDashboard = lazy(() => import("@/modules/procurement-inventory/components/SupplierPerformanceDashboard"));
 const PurchaseRequisitionWorkflow = lazy(() => import("@/modules/procurement-inventory/components/PurchaseRequisitionWorkflow"));
 
 function LoadingFallback() {
   return (
     <div className="space-y-4 p-4">
       <Skeleton className="h-8 w-64" />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Skeleton className="h-32" />
         <Skeleton className="h-32" />
         <Skeleton className="h-32" />
       </div>
       <Skeleton className="h-64" />
     </div>
   );
 }
 
 export default function ProcurementCommandCenterPremium() {
   const [activeTab, setActiveTab] = useState("command");
 
   const { data: kpis } = useQuery({
     queryKey: ["procurement-kpis"],
     queryFn: async () => {
       const [suppliersRes, rfqRes] = await Promise.all([
         supabase.from("suppliers").select("id, rating, total_value, is_approved").eq("is_active", true),
         supabase.from("rfq_requests").select("id, status, budget_estimate")
       ]);
 
       const suppliers = suppliersRes.data || [];
       const rfqs = rfqRes.data || [];
 
       return {
         totalSuppliers: suppliers.length,
         approvedSuppliers: suppliers.filter(s => s.is_approved).length,
         avgRating: suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / (suppliers.length || 1),
         totalSpend: suppliers.reduce((sum, s) => sum + (s.total_value || 0), 0),
         pendingRFQs: rfqs.filter(r => r.status === "sent" || r.status === "quoted").length,
         totalRFQValue: rfqs.reduce((sum, r) => sum + (r.budget_estimate || 0), 0)
       };
     },
     refetchInterval: 30000
   });
 
   const tabs = [
     { id: "command", label: "🎯 Comando (PREMIUM)", icon: Sparkles },
     { id: "spend-analytics", label: "💰 Spend Analytics", icon: PieChart },
     { id: "supplier-performance", label: "⭐ Performance Fornecedores", icon: Award },
     { id: "requisition-workflow", label: "📋 Workflow Requisições", icon: ClipboardList },
     { id: "inventory", label: "📦 Inventário", icon: Package },
     { id: "suppliers", label: "🏭 Fornecedores", icon: Store },
     { id: "rfq", label: "📄 RFQ/Cotações", icon: FileText },
     { id: "orders", label: "🚚 Pedidos", icon: Truck },
     { id: "ai-assistant", label: "🤖 IA Procurement", icon: Brain },
     { id: "reports", label: "📊 Relatórios", icon: BarChart3 }
   ];
 
   return (
     <>
       <Helmet>
         <title>Procurement Command Center Premium | Nautilus One</title>
         <meta name="description" content="Central de comando premium para procurement com IA" />
       </Helmet>
 
       <div className="min-h-screen bg-background p-6 space-y-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
               <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                 <ShoppingCart className="h-8 w-8 text-primary" />
               </div>
               Procurement Command Center
               <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                 <Sparkles className="h-3 w-3 mr-1" />
                 PREMIUM
               </Badge>
             </h1>
             <p className="text-muted-foreground mt-1">
               Gestão inteligente de compras com analytics avançado, workflows e IA
             </p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" className="gap-2">
               <Settings className="h-4 w-4" />
               Configurações
             </Button>
             <Button variant="outline" size="sm" className="gap-2">
               <RefreshCw className="h-4 w-4" />
               Sincronizar
             </Button>
           </div>
         </div>
 
         {/* KPI Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
           <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
             <CardContent className="p-4 text-center">
               <Users className="h-5 w-5 text-primary mx-auto mb-2" />
               <p className="text-2xl font-bold">{kpis?.totalSuppliers || 0}</p>
               <p className="text-xs text-muted-foreground">Fornecedores</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
             <CardContent className="p-4 text-center">
               <Award className="h-5 w-5 text-success mx-auto mb-2" />
               <p className="text-2xl font-bold">{kpis?.approvedSuppliers || 0}</p>
               <p className="text-xs text-muted-foreground">Aprovados</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
             <CardContent className="p-4 text-center">
               <Star className="h-5 w-5 text-warning mx-auto mb-2" />
               <p className="text-2xl font-bold">{(kpis?.avgRating || 0).toFixed(1)}</p>
               <p className="text-xs text-muted-foreground">Rating Médio</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
             <CardContent className="p-4 text-center">
               <DollarSign className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
               <p className="text-2xl font-bold">R${((kpis?.totalSpend || 0) / 1000).toFixed(0)}K</p>
               <p className="text-xs text-muted-foreground">Total Spend</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
             <CardContent className="p-4 text-center">
               <FileText className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
               <p className="text-2xl font-bold">{kpis?.pendingRFQs || 0}</p>
               <p className="text-xs text-muted-foreground">RFQs Pendentes</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-muted">
             <CardContent className="p-4 text-center">
               <Truck className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
               <p className="text-2xl font-bold">12</p>
               <p className="text-xs text-muted-foreground">Pedidos Ativos</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
             <CardContent className="p-4 text-center">
               <TrendingUp className="h-5 w-5 text-destructive mx-auto mb-2" />
               <p className="text-2xl font-bold">R${((kpis?.totalRFQValue || 0) / 1000).toFixed(0)}K</p>
               <p className="text-xs text-muted-foreground">Valor RFQs</p>
             </CardContent>
           </Card>
 
           <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
             <CardContent className="p-4 text-center">
               <Target className="h-5 w-5 text-info mx-auto mb-2" />
               <p className="text-2xl font-bold">94%</p>
               <p className="text-xs text-muted-foreground">OTD Rate</p>
             </CardContent>
           </Card>
         </div>
 
         {/* Main Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
           <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
             {tabs.map((tab) => (
               <TabsTrigger 
                 key={tab.id} 
                 value={tab.id} 
                 className={cn(
                   "gap-2 text-sm",
                   activeTab === tab.id && tab.id === "command" && "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                 )}
               >
                 <tab.icon className="h-4 w-4" />
                 <span className="hidden md:inline">{tab.label}</span>
               </TabsTrigger>
             ))}
           </TabsList>
 
           {/* COMMAND TAB */}
           <TabsContent value="command" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <PieChart className="h-5 w-5 text-primary" />
                     Visão Geral de Gastos
                     <Badge variant="outline" className="ml-2">Tempo Real</Badge>
                   </CardTitle>
                   <CardDescription>Analytics de procurement com IA</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-3 gap-4 mb-4">
                     <div className="text-center p-4 rounded-lg bg-background/50">
                       <p className="text-3xl font-bold text-primary">R$ 2.4M</p>
                       <p className="text-sm text-muted-foreground">Spend YTD</p>
                     </div>
                     <div className="text-center p-4 rounded-lg bg-background/50">
                       <p className="text-3xl font-bold text-success">-12%</p>
                       <p className="text-sm text-muted-foreground">vs. Ano Anterior</p>
                     </div>
                     <div className="text-center p-4 rounded-lg bg-background/50">
                       <p className="text-3xl font-bold text-info">R$ 180K</p>
                       <p className="text-sm text-muted-foreground">Savings Identificados</p>
                     </div>
                   </div>
                   <Button className="w-full gap-2" onClick={() => setActiveTab("spend-analytics")}>
                     <BarChart3 className="h-4 w-4" />
                     Acessar Spend Analytics Completo
                   </Button>
                 </CardContent>
               </Card>
 
               <Card className="border-info/20 bg-gradient-to-br from-info/5 to-primary/5">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Brain className="h-5 w-5 text-info" />
                     IA Insights
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                     <div className="flex items-center gap-2 mb-1">
                       <AlertTriangle className="h-4 w-4 text-warning" />
                       <span className="font-medium text-sm">Alerta de Preço</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Fornecedor ABC aumentou preços em 15%. Sugerimos renegociação.
                     </p>
                   </div>
                   <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                     <div className="flex items-center gap-2 mb-1">
                       <Zap className="h-4 w-4 text-success" />
                       <span className="font-medium text-sm">Oportunidade</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Consolidar pedidos pode gerar economia de R$ 45K.
                     </p>
                   </div>
                   <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                     <div className="flex items-center gap-2 mb-1">
                       <TrendingUp className="h-4 w-4 text-info" />
                       <span className="font-medium text-sm">Previsão</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Estoque de lubrificantes atingirá nível crítico em 5 dias.
                     </p>
                   </div>
                 </CardContent>
               </Card>
             </div>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Zap className="h-5 w-5 text-warning" />
                   Ações Rápidas
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("requisition-workflow")}>
                     <ClipboardList className="h-5 w-5" />
                     <span className="text-xs">Nova Requisição</span>
                   </Button>
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("suppliers")}>
                     <Store className="h-5 w-5" />
                     <span className="text-xs">Novo Fornecedor</span>
                   </Button>
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("rfq")}>
                     <FileText className="h-5 w-5" />
                     <span className="text-xs">Criar RFQ</span>
                   </Button>
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("inventory")}>
                     <Package className="h-5 w-5" />
                     <span className="text-xs">Ver Inventário</span>
                   </Button>
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("supplier-performance")}>
                     <Award className="h-5 w-5" />
                     <span className="text-xs">Avaliar Fornecedor</span>
                   </Button>
                   <Button variant="outline" className="flex-col h-auto py-4 gap-2" onClick={() => setActiveTab("reports")}>
                     <BarChart3 className="h-5 w-5" />
                     <span className="text-xs">Gerar Relatório</span>
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* SPEND ANALYTICS TAB */}
           <TabsContent value="spend-analytics">
             <Suspense fallback={<LoadingFallback />}>
               <SpendControlTower />
             </Suspense>
           </TabsContent>
 
           {/* SUPPLIER PERFORMANCE TAB */}
           <TabsContent value="supplier-performance">
             <Suspense fallback={<LoadingFallback />}>
               <SupplierPerformanceDashboard />
             </Suspense>
           </TabsContent>
 
           {/* REQUISITION WORKFLOW TAB */}
           <TabsContent value="requisition-workflow">
             <Suspense fallback={<LoadingFallback />}>
               <PurchaseRequisitionWorkflow />
             </Suspense>
           </TabsContent>
 
           {/* INVENTORY TAB */}
           <TabsContent value="inventory">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Package className="h-5 w-5 text-primary" />
                   Gestão de Inventário
                 </CardTitle>
                 <CardDescription>Controle de estoque e materiais</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-12 text-muted-foreground">
                   <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                   <p>Módulo de Inventário - Integrado com Spend Analytics</p>
                   <Button variant="outline" className="mt-4">Acessar Inventário Completo</Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* SUPPLIERS TAB */}
           <TabsContent value="suppliers">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Store className="h-5 w-5 text-primary" />
                   Marketplace de Fornecedores
                 </CardTitle>
                 <CardDescription>Gestão e avaliação de fornecedores</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-12 text-muted-foreground">
                   <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                   <p>Use a aba "Performance Fornecedores" para análise detalhada</p>
                   <Button variant="outline" className="mt-4">Adicionar Fornecedor</Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* RFQ TAB */}
           <TabsContent value="rfq">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <FileText className="h-5 w-5 text-primary" />
                   Solicitações de Cotação (RFQ)
                 </CardTitle>
                 <CardDescription>Gestão de cotações e propostas</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-12 text-muted-foreground">
                   <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                   <p>Crie e gerencie solicitações de cotação</p>
                   <Button className="mt-4">Nova RFQ</Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* ORDERS TAB */}
           <TabsContent value="orders">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Truck className="h-5 w-5 text-primary" />
                   Pedidos de Compra
                 </CardTitle>
                 <CardDescription>Acompanhamento de entregas</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-12 text-muted-foreground">
                   <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                   <p>Acompanhe seus pedidos em tempo real</p>
                   <Button variant="outline" className="mt-4">Ver Pedidos Ativos</Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* AI ASSISTANT TAB */}
           <TabsContent value="ai-assistant">
             <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-primary/5">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Brain className="h-5 w-5 text-secondary-foreground" />
                   Assistente IA de Procurement
                   <Badge className="bg-secondary text-secondary-foreground">Beta</Badge>
                 </CardTitle>
                 <CardDescription>Otimização inteligente de compras</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                     <p className="text-sm mb-2">💡 <strong>Dica do Dia:</strong></p>
                     <p className="text-sm text-muted-foreground">
                       Consolidar pedidos de múltiplas embarcações pode reduzir custos de frete em até 25%.
                     </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                       <Sparkles className="h-5 w-5" />
                       <span className="text-xs">Analisar Gastos</span>
                     </Button>
                     <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                       <TrendingUp className="h-5 w-5" />
                       <span className="text-xs">Prever Demanda</span>
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* REPORTS TAB */}
           <TabsContent value="reports">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-primary" />
                   Relatórios de Procurement
                 </CardTitle>
                 <CardDescription>Análises e exportações</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                     <FileText className="h-5 w-5" />
                     <span className="text-xs">Relatório Mensal</span>
                   </Button>
                   <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                     <DollarSign className="h-5 w-5" />
                     <span className="text-xs">Análise de Custos</span>
                   </Button>
                   <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                     <Store className="h-5 w-5" />
                     <span className="text-xs">Performance Fornecedores</span>
                   </Button>
                   <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                     <Package className="h-5 w-5" />
                     <span className="text-xs">Inventário</span>
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </>
   );
 }