 /**
  * Procurement Intelligence Hub
  * Advanced procurement with RFQ automation, supplier scoring, and spend analytics
  * Based on Coupa, SAP Ariba, and maritime-specific patterns
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Input } from "@/components/ui/input";
 import {
   ShoppingCart, Package, Store, FileText, Truck,
   BarChart3, DollarSign, Star, TrendingUp, AlertTriangle,
   CheckCircle, Clock, Users, Target, Zap, Brain,
   ArrowRight, PieChart, Award, Calendar, Send,
   ThumbsUp, ThumbsDown, Timer, Globe, Sparkles
 } from "lucide-react";
 import { toast } from "sonner";
 
 // Supplier Performance Interface
 interface Supplier {
   id: string;
   name: string;
   category: string;
   country: string;
   rating: number;
   totalSpend: number;
   onTimeDelivery: number;
   qualityScore: number;
   responseTime: number; // hours
   status: "approved" | "pending" | "blocked";
   lastOrder: string;
   contractEnd: string;
 }
 
 // RFQ Interface
 interface RFQ {
   id: string;
   rfqNumber: string;
   title: string;
   category: string;
   vessel: string;
   budget: number;
   status: "draft" | "sent" | "quoted" | "evaluating" | "awarded" | "closed";
   deadline: string;
   suppliers: number;
   responses: number;
   bestQuote?: number;
   savings?: number;
 }
 
 // Purchase Requisition Interface
 interface PurchaseRequisition {
   id: string;
   prNumber: string;
   title: string;
   requester: string;
   vessel: string;
   category: string;
   amount: number;
   status: "draft" | "pending" | "approved" | "rejected" | "ordered";
   priority: "low" | "medium" | "high" | "urgent";
   createdAt: string;
   approver?: string;
 }
 
 // Mock Data
 const suppliers: Supplier[] = [
   {
     id: "1", name: "MarineTech Solutions", category: "Spare Parts", country: "BR",
     rating: 4.8, totalSpend: 450000, onTimeDelivery: 96, qualityScore: 98,
     responseTime: 4, status: "approved", lastOrder: "2026-02-01", contractEnd: "2027-06-30"
   },
   {
     id: "2", name: "Global Ship Supplies", category: "Provisions", country: "SG",
     rating: 4.5, totalSpend: 280000, onTimeDelivery: 92, qualityScore: 95,
     responseTime: 8, status: "approved", lastOrder: "2026-01-28", contractEnd: "2026-12-31"
   },
   {
     id: "3", name: "NautiParts Express", category: "Spare Parts", country: "NL",
     rating: 4.2, totalSpend: 180000, onTimeDelivery: 88, qualityScore: 90,
     responseTime: 12, status: "pending", lastOrder: "2026-01-15", contractEnd: "2026-08-15"
   },
   {
     id: "4", name: "SeaFuel Bunkers", category: "Bunker", country: "AE",
     rating: 4.6, totalSpend: 890000, onTimeDelivery: 99, qualityScore: 97,
     responseTime: 2, status: "approved", lastOrder: "2026-02-03", contractEnd: "2027-12-31"
   }
 ];
 
 const rfqs: RFQ[] = [
   {
     id: "1", rfqNumber: "RFQ-2026-001", title: "Main Engine Spare Parts",
     category: "Spare Parts", vessel: "Nautilus Star", budget: 85000,
     status: "evaluating", deadline: "2026-02-15", suppliers: 5, responses: 4,
     bestQuote: 72000, savings: 13000
   },
   {
     id: "2", rfqNumber: "RFQ-2026-002", title: "Safety Equipment Annual Supply",
     category: "Safety", vessel: "Fleet-wide", budget: 120000,
     status: "quoted", deadline: "2026-02-20", suppliers: 8, responses: 6,
     bestQuote: 98000, savings: 22000
   },
   {
     id: "3", rfqNumber: "RFQ-2026-003", title: "Provisions Q1 2026",
     category: "Provisions", vessel: "Nautilus Explorer", budget: 45000,
     status: "sent", deadline: "2026-02-18", suppliers: 4, responses: 2
   },
   {
     id: "4", rfqNumber: "RFQ-2026-004", title: "Bunker - Singapore",
     category: "Bunker", vessel: "Nautilus Star", budget: 250000,
     status: "awarded", deadline: "2026-02-10", suppliers: 3, responses: 3,
     bestQuote: 235000, savings: 15000
   }
 ];
 
 const requisitions: PurchaseRequisition[] = [
   {
     id: "1", prNumber: "PR-2026-0125", title: "Hydraulic Pump Replacement",
     requester: "Chief Engineer", vessel: "Nautilus Star", category: "Spare Parts",
     amount: 28500, status: "pending", priority: "high", createdAt: "2026-02-03"
   },
   {
     id: "2", prNumber: "PR-2026-0124", title: "Galley Equipment",
     requester: "Chief Cook", vessel: "Nautilus Explorer", category: "Galley",
     amount: 8500, status: "approved", priority: "medium", createdAt: "2026-02-02", approver: "Procurement Manager"
   },
   {
     id: "3", prNumber: "PR-2026-0123", title: "Paint and Coatings",
     requester: "Bosun", vessel: "Nautilus Pioneer", category: "Deck",
     amount: 15000, status: "ordered", priority: "low", createdAt: "2026-01-30", approver: "Technical Superintendent"
   }
 ];
 
 // Spend Analytics Data
 const spendByCategory = [
   { category: "Spare Parts", value: 450000, percentage: 28 },
   { category: "Bunker", value: 380000, percentage: 24 },
   { category: "Provisions", value: 220000, percentage: 14 },
   { category: "Lubricants", value: 180000, percentage: 11 },
   { category: "Safety Equipment", value: 150000, percentage: 9 },
   { category: "Deck Stores", value: 120000, percentage: 8 },
   { category: "Other", value: 100000, percentage: 6 }
 ];
 
 export default function ProcurementIntelligenceHub() {
   const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(suppliers[0]);
   const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(rfqs[0]);
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "approved": case "awarded": case "ordered": return "bg-success/10 text-success";
       case "pending": case "sent": case "quoted": return "bg-warning/10 text-warning";
       case "evaluating": return "bg-info/10 text-info";
       case "blocked": case "rejected": return "bg-destructive/10 text-destructive";
       case "draft": case "closed": return "bg-muted text-muted-foreground";
       default: return "bg-muted";
     }
   };
 
   const getPriorityColor = (priority: string) => {
     switch (priority) {
       case "urgent": return "bg-destructive text-destructive-foreground";
       case "high": return "bg-warning text-warning-foreground";
       case "medium": return "bg-info text-info-foreground";
       default: return "bg-muted text-muted-foreground";
     }
   };
 
   const totalSpend = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);
   const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;
   const pendingRFQs = rfqs.filter(r => ["sent", "quoted", "evaluating"].includes(r.status)).length;
   const totalSavings = rfqs.reduce((sum, r) => sum + (r.savings || 0), 0);
   const pendingPRs = requisitions.filter(r => r.status === "pending").length;
 
   return (
     <div className="space-y-6">
       {/* Header KPIs */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="border-l-4 border-l-primary">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <DollarSign className="h-4 w-4 text-primary" />
               <span className="text-xs text-muted-foreground">Total Spend YTD</span>
             </div>
             <p className="text-2xl font-bold">R$ {(totalSpend / 1000000).toFixed(1)}M</p>
             <p className="text-xs text-success">-8% vs ano anterior</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-success">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <TrendingUp className="h-4 w-4 text-success" />
               <span className="text-xs text-muted-foreground">Savings</span>
             </div>
             <p className="text-2xl font-bold">R$ {(totalSavings / 1000).toFixed(0)}K</p>
             <p className="text-xs text-success">Identificados via RFQ</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-warning">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <FileText className="h-4 w-4 text-warning" />
               <span className="text-xs text-muted-foreground">RFQs Pendentes</span>
             </div>
             <p className="text-2xl font-bold">{pendingRFQs}</p>
             <p className="text-xs text-muted-foreground">{rfqs.length} total</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-info">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Store className="h-4 w-4 text-info" />
               <span className="text-xs text-muted-foreground">Fornecedores</span>
             </div>
             <p className="text-2xl font-bold">{suppliers.length}</p>
             <p className="text-xs text-muted-foreground">{suppliers.filter(s => s.status === "approved").length} aprovados</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Star className="h-4 w-4 text-purple-500" />
               <span className="text-xs text-muted-foreground">Rating Médio</span>
             </div>
             <p className="text-2xl font-bold">{avgRating.toFixed(1)}/5</p>
             <p className="text-xs text-success">+0.2 vs trimestre anterior</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-orange-500">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Clock className="h-4 w-4 text-orange-500" />
               <span className="text-xs text-muted-foreground">PRs Pendentes</span>
             </div>
             <p className="text-2xl font-bold">{pendingPRs}</p>
             <p className="text-xs text-warning">Aguardando aprovação</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs defaultValue="spend-analytics" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="spend-analytics" className="gap-2">
             <PieChart className="h-4 w-4" />
             Spend Analytics
           </TabsTrigger>
           <TabsTrigger value="rfq-management" className="gap-2">
             <FileText className="h-4 w-4" />
             RFQ Management
           </TabsTrigger>
           <TabsTrigger value="supplier-portal" className="gap-2">
             <Store className="h-4 w-4" />
             Supplier Portal
           </TabsTrigger>
           <TabsTrigger value="requisitions" className="gap-2">
             <ShoppingCart className="h-4 w-4" />
             Requisitions
           </TabsTrigger>
           <TabsTrigger value="ai-insights" className="gap-2">
             <Brain className="h-4 w-4" />
             AI Insights
           </TabsTrigger>
         </TabsList>
 
         {/* Spend Analytics Tab */}
         <TabsContent value="spend-analytics" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Spend by Category */}
             <Card className="lg:col-span-2">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <PieChart className="h-5 w-5" />
                   Spend by Category
                   <Badge variant="outline">YTD 2026</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {spendByCategory.map((item, idx) => (
                     <div key={idx} className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="font-medium">{item.category}</span>
                         <div className="flex items-center gap-2">
                           <span className="text-muted-foreground">R$ {(item.value / 1000).toFixed(0)}K</span>
                           <Badge variant="outline">{item.percentage}%</Badge>
                         </div>
                       </div>
                       <Progress value={item.percentage} className="h-2" />
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
 
             {/* Top Suppliers */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Award className="h-5 w-5" />
                   Top Suppliers
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   {suppliers.slice(0, 4).sort((a, b) => b.totalSpend - a.totalSpend).map((supplier, idx) => (
                     <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                       <div className="flex items-center gap-2">
                         <Badge className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                           {idx + 1}
                         </Badge>
                         <div>
                           <p className="font-medium text-sm">{supplier.name}</p>
                           <p className="text-xs text-muted-foreground">{supplier.category}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold">R$ {(supplier.totalSpend / 1000).toFixed(0)}K</p>
                         <div className="flex items-center gap-1">
                           <Star className="h-3 w-3 text-warning" />
                           <span className="text-xs">{supplier.rating}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
 
           {/* Spend Trends */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <BarChart3 className="h-5 w-5" />
                 Spend Optimization Opportunities
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-success/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-success" />
                     Consolidação de Pedidos
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Agrupar pedidos de peças pode gerar economia de R$ 45K.
                   </p>
                   <Badge className="bg-success/10 text-success">Economia: 12%</Badge>
                 </div>
                 <div className="p-4 bg-warning/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-warning" />
                     Renegociação de Contratos
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     2 contratos expiram em 60 dias. Oportunidade de melhores termos.
                   </p>
                   <Badge className="bg-warning/10 text-warning">Potencial: R$ 28K</Badge>
                 </div>
                 <div className="p-4 bg-info/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <Globe className="h-4 w-4 text-info" />
                     Novos Fornecedores
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     3 fornecedores locais com preços 15% menores identificados.
                   </p>
                   <Badge className="bg-info/10 text-info">Economia: 15%</Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* RFQ Management Tab */}
         <TabsContent value="rfq-management" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* RFQ List */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span className="flex items-center gap-2">
                     <FileText className="h-5 w-5" />
                     RFQs
                   </span>
                   <Button size="sm">+ Nova</Button>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[400px]">
                   <div className="space-y-3">
                     {rfqs.map((rfq) => (
                       <div
                         key={rfq.id}
                         onClick={() => setSelectedRFQ(rfq)}
                         className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                           selectedRFQ?.id === rfq.id ? "border-primary bg-primary/5" : ""
                         }`}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-mono text-sm">{rfq.rfqNumber}</span>
                           <Badge className={getStatusColor(rfq.status)}>
                             {rfq.status.toUpperCase()}
                           </Badge>
                         </div>
                         <p className="text-sm font-medium">{rfq.title}</p>
                         <p className="text-xs text-muted-foreground">{rfq.vessel}</p>
                         <div className="flex items-center justify-between mt-2">
                           <span className="text-xs">{rfq.responses}/{rfq.suppliers} respostas</span>
                           <span className="font-medium">R$ {(rfq.budget / 1000).toFixed(0)}K</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
 
             {/* RFQ Details */}
             <Card className="lg:col-span-2">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5" />
                   RFQ Details
                   <Badge variant="outline">Workflow Automation</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {selectedRFQ ? (
                   <div className="space-y-6">
                     {/* Header */}
                     <div className="p-4 bg-muted/50 rounded-lg">
                       <div className="flex items-center justify-between mb-2">
                         <h3 className="text-lg font-bold">{selectedRFQ.rfqNumber}</h3>
                         <Badge className={getStatusColor(selectedRFQ.status)}>
                           {selectedRFQ.status.toUpperCase()}
                         </Badge>
                       </div>
                       <p className="font-medium">{selectedRFQ.title}</p>
                       <p className="text-sm text-muted-foreground">{selectedRFQ.category} • {selectedRFQ.vessel}</p>
                     </div>
 
                     {/* Stats */}
                     <div className="grid grid-cols-4 gap-4">
                       <div className="p-3 border rounded-lg text-center">
                         <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                         <p className="text-lg font-bold">R$ {(selectedRFQ.budget / 1000).toFixed(0)}K</p>
                         <p className="text-xs text-muted-foreground">Budget</p>
                       </div>
                       <div className="p-3 border rounded-lg text-center">
                         <Users className="h-5 w-5 mx-auto mb-1 text-info" />
                         <p className="text-lg font-bold">{selectedRFQ.responses}/{selectedRFQ.suppliers}</p>
                         <p className="text-xs text-muted-foreground">Respostas</p>
                       </div>
                       <div className="p-3 border rounded-lg text-center">
                         <Calendar className="h-5 w-5 mx-auto mb-1 text-warning" />
                         <p className="text-lg font-bold">{selectedRFQ.deadline}</p>
                         <p className="text-xs text-muted-foreground">Deadline</p>
                       </div>
                       {selectedRFQ.savings && (
                         <div className="p-3 border rounded-lg text-center bg-success/10">
                           <TrendingUp className="h-5 w-5 mx-auto mb-1 text-success" />
                           <p className="text-lg font-bold text-success">R$ {(selectedRFQ.savings / 1000).toFixed(0)}K</p>
                           <p className="text-xs text-muted-foreground">Savings</p>
                         </div>
                       )}
                     </div>
 
                     {/* Best Quote */}
                     {selectedRFQ.bestQuote && (
                       <div className="p-4 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="text-sm text-muted-foreground">Melhor Cotação</p>
                             <p className="text-2xl font-bold text-primary">
                               R$ {selectedRFQ.bestQuote.toLocaleString()}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-sm text-muted-foreground">vs Budget</p>
                             <p className="text-lg font-bold text-success">
                               -{(((selectedRFQ.budget - selectedRFQ.bestQuote) / selectedRFQ.budget) * 100).toFixed(0)}%
                             </p>
                           </div>
                         </div>
                       </div>
                     )}
 
                     {/* Actions */}
                     <div className="flex gap-2">
                       {selectedRFQ.status === "evaluating" && (
                         <Button className="flex-1" onClick={() => toast.success("RFQ adjudicada!")}>
                           <Award className="h-4 w-4 mr-2" />
                           Adjudicar
                         </Button>
                       )}
                       {selectedRFQ.status === "draft" && (
                         <Button className="flex-1" onClick={() => toast.success("RFQ enviada!")}>
                           <Send className="h-4 w-4 mr-2" />
                           Enviar RFQ
                         </Button>
                       )}
                       <Button variant="outline" onClick={() => toast.info("Comparando cotações...")}>
                         <BarChart3 className="h-4 w-4 mr-2" />
                         Comparar
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-12 text-muted-foreground">
                     Selecione uma RFQ para ver detalhes
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Supplier Portal Tab */}
         <TabsContent value="supplier-portal" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {suppliers.map((supplier) => (
               <Card key={supplier.id} className={selectedSupplier?.id === supplier.id ? "border-primary" : ""}>
                 <CardHeader className="pb-2">
                   <CardTitle className="flex items-center justify-between">
                     <span className="flex items-center gap-2">
                       <Store className="h-5 w-5" />
                       {supplier.name}
                     </span>
                     <Badge className={getStatusColor(supplier.status)}>
                       {supplier.status.toUpperCase()}
                     </Badge>
                   </CardTitle>
                   <CardDescription>
                     {supplier.category} • 🌍 {supplier.country}
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {/* Rating & Spend */}
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-muted/50 rounded-lg">
                       <div className="flex items-center gap-2 mb-1">
                         <Star className="h-4 w-4 text-warning" />
                         <span className="text-xs text-muted-foreground">Rating</span>
                       </div>
                       <p className="text-2xl font-bold">{supplier.rating}/5</p>
                     </div>
                     <div className="p-3 bg-muted/50 rounded-lg">
                       <div className="flex items-center gap-2 mb-1">
                         <DollarSign className="h-4 w-4 text-success" />
                         <span className="text-xs text-muted-foreground">Total Spend</span>
                       </div>
                       <p className="text-2xl font-bold">R$ {(supplier.totalSpend / 1000).toFixed(0)}K</p>
                     </div>
                   </div>
 
                   {/* Performance Metrics */}
                   <div className="space-y-3">
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span>On-Time Delivery</span>
                         <span className="font-medium">{supplier.onTimeDelivery}%</span>
                       </div>
                       <Progress value={supplier.onTimeDelivery} className={`h-2 ${supplier.onTimeDelivery < 90 ? "[&>div]:bg-warning" : ""}`} />
                     </div>
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span>Quality Score</span>
                         <span className="font-medium">{supplier.qualityScore}%</span>
                       </div>
                       <Progress value={supplier.qualityScore} className="h-2" />
                     </div>
                   </div>
 
                   {/* Response Time */}
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-2">
                       <Timer className="h-4 w-4 text-info" />
                       <span className="text-sm">Response Time</span>
                     </div>
                     <Badge variant="outline">{supplier.responseTime}h avg</Badge>
                   </div>
 
                   {/* Contract Info */}
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Contrato até:</span>
                     <span className="font-medium">{supplier.contractEnd}</span>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>
 
         {/* Requisitions Tab */}
         <TabsContent value="requisitions" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <span className="flex items-center gap-2">
                   <ShoppingCart className="h-5 w-5" />
                   Purchase Requisitions
                 </span>
                 <Button>+ Nova Requisição</Button>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {requisitions.map((pr) => (
                   <div key={pr.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30">
                     <div className="flex items-center gap-4">
                       <div className="text-center min-w-[80px]">
                         <Badge className={getPriorityColor(pr.priority)}>
                           {pr.priority.toUpperCase()}
                         </Badge>
                       </div>
                       <div>
                         <p className="font-mono text-sm text-muted-foreground">{pr.prNumber}</p>
                         <p className="font-medium">{pr.title}</p>
                         <p className="text-sm text-muted-foreground">
                           {pr.requester} • {pr.vessel} • {pr.category}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-bold">R$ {pr.amount.toLocaleString()}</p>
                         <p className="text-xs text-muted-foreground">{pr.createdAt}</p>
                       </div>
                       <Badge className={getStatusColor(pr.status)}>
                         {pr.status.toUpperCase()}
                       </Badge>
                       {pr.status === "pending" && (
                         <div className="flex gap-1">
                           <Button size="sm" variant="outline" onClick={() => toast.success("Aprovado!")}>
                             <ThumbsUp className="h-4 w-4" />
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => toast.error("Rejeitado!")}>
                             <ThumbsDown className="h-4 w-4" />
                           </Button>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* AI Insights Tab */}
         <TabsContent value="ai-insights" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border-primary/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Brain className="h-5 w-5 text-primary" />
                   Procurement AI
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 bg-warning/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-warning" />
                     Alerta de Preço
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Fornecedor MarineTech aumentou preços em 8%. Considere alternativas.
                   </p>
                   <Button size="sm" onClick={() => toast.info("Buscando alternativas...")}>
                     Encontrar Alternativas
                   </Button>
                 </div>
 
                 <div className="p-4 bg-success/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <Sparkles className="h-4 w-4 text-success" />
                     Oportunidade de Economia
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Consolidar 5 pedidos pendentes pode gerar desconto de volume de 12%.
                   </p>
                   <Button size="sm" variant="outline" onClick={() => toast.success("Consolidando pedidos...")}>
                     Consolidar Pedidos
                   </Button>
                 </div>
               </CardContent>
             </Card>
 
             <Card className="border-info/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-info" />
                   Predictive Analytics
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 bg-info/10 rounded-lg">
                   <h4 className="font-semibold mb-2">Previsão de Demanda</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Consumo de peças de motor deve aumentar 15% no próximo trimestre.
                   </p>
                   <Progress value={65} className="h-2" />
                   <p className="text-xs mt-1 text-muted-foreground">65% confiança</p>
                 </div>
 
                 <div className="p-4 bg-purple-500/10 rounded-lg">
                   <h4 className="font-semibold mb-2">Risco de Supply Chain</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Lead time de 2 fornecedores-chave aumentou. Considere estoque de segurança.
                   </p>
                   <Button size="sm" variant="outline" onClick={() => toast.info("Analisando riscos...")}>
                     Analisar Riscos
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 }