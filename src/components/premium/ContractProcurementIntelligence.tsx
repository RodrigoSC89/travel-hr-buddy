 /**
  * Contract & Procurement Intelligence Hub
  * Advanced vessel contracts, charter party, and supplier management
  * Based on BIMCO standards, Veson IMOS, and Coupa best practices
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
   FileText, Ship, DollarSign, Clock, Users, TrendingUp,
   CheckCircle, AlertTriangle, Calendar, Target, BarChart3,
   Package, Store, Star, Send, Award, Timer, Globe,
   Sparkles, Brain, Zap, ArrowRight, PieChart, Scale
 } from "lucide-react";
 import { toast } from "sonner";
 
 // BIMCO Standard Forms
 const BIMCO_FORMS = [
   { code: "GENCON", name: "General Charter", type: "Voyage", usage: 45 },
   { code: "NYPE", name: "New York Produce Exchange", type: "Time", usage: 32 },
   { code: "BALTIME", name: "Baltic Time Charter", type: "Time", usage: 18 },
   { code: "BARECON", name: "Bareboat Charter", type: "Bareboat", usage: 5 },
 ];
 
 // Active Contracts
 const CONTRACTS = [
   {
     id: "1", contractNumber: "CP-2024-001", vessel: "MV Atlântico Sul",
     charterer: "Petrobras", owner: "NautiOne Maritime",
     type: "time_charter", form: "NYPE", startDate: "2024-01-15", endDate: "2025-01-15",
     dailyRate: 28500, currency: "USD", status: "active",
     laytimeAllowed: 72, laytimeUsed: 45, demurrageRate: 32000, despatchRate: 16000
   },
   {
     id: "2", contractNumber: "CP-2024-002", vessel: "MV Ocean Pride",
     charterer: "Shell Trading", owner: "NautiOne Maritime",
     type: "voyage_charter", form: "GENCON", startDate: "2024-02-01", endDate: "2024-03-15",
     dailyRate: 0, currency: "USD", status: "active",
     laytimeAllowed: 48, laytimeUsed: 52, demurrageRate: 48000, despatchRate: 24000
   },
   {
     id: "3", contractNumber: "CP-2024-003", vessel: "MV Pacific Star",
     charterer: "BP Shipping", owner: "NautiOne Maritime",
     type: "coa", form: "GENCON", startDate: "2024-01-01", endDate: "2024-12-31",
     dailyRate: 0, currency: "USD", status: "active",
     laytimeAllowed: 96, laytimeUsed: 78, demurrageRate: 42000, despatchRate: 21000
   },
 ];
 
 // Suppliers
 const SUPPLIERS = [
   {
     id: "1", name: "Global Marine Supplies", category: "Provisions",
     country: "Singapore", rating: 4.8, totalSpend: 450000,
     onTimeDelivery: 96, qualityScore: 95, responseTime: 4,
     status: "approved", contractEnd: "2025-06-30"
   },
   {
     id: "2", name: "Atlas Bunker Services", category: "Bunker",
     country: "Netherlands", rating: 4.6, totalSpend: 2800000,
     onTimeDelivery: 98, qualityScore: 92, responseTime: 2,
     status: "approved", contractEnd: "2024-12-31"
   },
   {
     id: "3", name: "Neptune Spares Ltd", category: "Spare Parts",
     country: "Germany", rating: 4.3, totalSpend: 680000,
     onTimeDelivery: 89, qualityScore: 94, responseTime: 8,
     status: "approved", contractEnd: "2025-03-15"
   },
   {
     id: "4", name: "OceanTech Solutions", category: "Equipment",
     country: "USA", rating: 4.9, totalSpend: 320000,
     onTimeDelivery: 99, qualityScore: 98, responseTime: 3,
     status: "approved", contractEnd: "2024-09-30"
   },
 ];
 
 // RFQs
 const RFQS = [
   {
     id: "RFQ-2024-015", title: "Main Engine Spare Parts",
     category: "Spare Parts", vessel: "MV Atlântico Sul",
     deadline: "2024-02-15", budget: 125000, responses: 4,
     status: "in_evaluation"
   },
   {
     id: "RFQ-2024-016", title: "Provisions Q1 2024",
     category: "Provisions", vessel: "Fleet-wide",
     deadline: "2024-02-10", budget: 85000, responses: 6,
     status: "awarded"
   },
   {
     id: "RFQ-2024-017", title: "Safety Equipment Renewal",
     category: "Safety", vessel: "MV Ocean Pride",
     deadline: "2024-02-20", budget: 45000, responses: 2,
     status: "open"
   },
 ];
 
 // Spend Analytics
 const SPEND_CATEGORIES = [
   { category: "Bunker", spend: 2800000, percentage: 42, trend: "up", change: 8 },
   { category: "Spare Parts", spend: 680000, percentage: 10, trend: "stable", change: 2 },
   { category: "Provisions", spend: 450000, percentage: 7, trend: "down", change: -5 },
   { category: "Port Charges", spend: 1200000, percentage: 18, trend: "up", change: 12 },
   { category: "Crew Costs", spend: 980000, percentage: 15, trend: "stable", change: 1 },
   { category: "Insurance", spend: 520000, percentage: 8, trend: "down", change: -3 },
 ];
 
 export default function ContractProcurementIntelligence() {
   const [activeTab, setActiveTab] = useState("contracts");
 
   const activeContracts = CONTRACTS.filter(c => c.status === "active").length;
   const totalDemurrage = CONTRACTS
     .filter(c => c.laytimeUsed > c.laytimeAllowed)
     .reduce((sum, c) => sum + ((c.laytimeUsed - c.laytimeAllowed) * c.demurrageRate / 24), 0);
   const totalDespatch = CONTRACTS
     .filter(c => c.laytimeUsed < c.laytimeAllowed)
     .reduce((sum, c) => sum + ((c.laytimeAllowed - c.laytimeUsed) * c.despatchRate / 24), 0);
   const avgSupplierRating = (SUPPLIERS.reduce((acc, s) => acc + s.rating, 0) / SUPPLIERS.length).toFixed(1);
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "active": case "approved": case "awarded":
         return "bg-green-500/10 text-green-500 border-green-500/20";
       case "in_evaluation": case "pending":
         return "bg-amber-500/10 text-amber-500 border-amber-500/20";
       case "open":
         return "bg-blue-500/10 text-blue-500 border-blue-500/20";
       default: return "bg-muted text-muted-foreground";
     }
   };
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Contratos Ativos</p>
                 <p className="text-2xl font-bold">{activeContracts}</p>
                 <p className="text-xs text-green-500 flex items-center gap-1">
                   <CheckCircle className="h-3 w-3" /> BIMCO Standard
                 </p>
               </div>
               <FileText className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-red-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Demurrage Acumulado</p>
                 <p className="text-2xl font-bold">${(totalDemurrage / 1000).toFixed(0)}K</p>
                 <p className="text-xs text-red-500">A receber</p>
               </div>
               <Clock className="h-8 w-8 text-red-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-green-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Despatch Economizado</p>
                 <p className="text-2xl font-bold">${(totalDespatch / 1000).toFixed(0)}K</p>
                 <p className="text-xs text-green-500">Performance bonus</p>
               </div>
               <TrendingUp className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-amber-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Rating Fornecedores</p>
                 <p className="text-2xl font-bold">{avgSupplierRating}/5.0</p>
                 <div className="flex gap-0.5 mt-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className={`h-3 w-3 ${i < 4 ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                   ))}
                 </div>
               </div>
               <Store className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="contracts" className="flex items-center gap-2">
             <FileText className="h-4 w-4" />
             Charter Party
           </TabsTrigger>
           <TabsTrigger value="laytime" className="flex items-center gap-2">
             <Clock className="h-4 w-4" />
             Laytime/Demurrage
           </TabsTrigger>
           <TabsTrigger value="suppliers" className="flex items-center gap-2">
             <Store className="h-4 w-4" />
             Fornecedores
           </TabsTrigger>
           <TabsTrigger value="rfq" className="flex items-center gap-2">
             <Send className="h-4 w-4" />
             RFQ
           </TabsTrigger>
           <TabsTrigger value="spend" className="flex items-center gap-2">
             <PieChart className="h-4 w-4" />
             Spend Analytics
           </TabsTrigger>
         </TabsList>
 
         {/* Charter Party Contracts Tab */}
         <TabsContent value="contracts" className="space-y-6">
           {/* BIMCO Forms Usage */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Scale className="h-5 w-5 text-blue-500" />
                 BIMCO Standard Forms Usage
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-4 gap-4">
                 {BIMCO_FORMS.map(form => (
                   <div key={form.code} className="p-4 bg-muted/50 rounded-lg text-center">
                     <p className="font-mono font-bold text-lg">{form.code}</p>
                     <p className="text-xs text-muted-foreground">{form.name}</p>
                     <Badge variant="outline" className="mt-2">{form.type}</Badge>
                     <p className="text-sm font-medium mt-2">{form.usage}%</p>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
 
           {/* Active Contracts */}
           <Card>
             <CardHeader>
               <CardTitle>Active Charter Parties</CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[300px]">
                 <div className="space-y-4">
                   {CONTRACTS.map(contract => (
                     <div key={contract.id} className="p-4 border rounded-lg space-y-3">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="font-mono">{contract.contractNumber}</Badge>
                             <Badge variant="outline">{contract.form}</Badge>
                           </div>
                           <h4 className="font-semibold mt-1">{contract.vessel}</h4>
                           <p className="text-sm text-muted-foreground">
                             {contract.charterer} ↔ {contract.owner}
                           </p>
                         </div>
                         <Badge className={getStatusColor(contract.status)}>
                           {contract.type.replace("_", " ").toUpperCase()}
                         </Badge>
                       </div>
                       <div className="grid grid-cols-4 gap-4 text-sm">
                         <div>
                           <p className="text-muted-foreground">Período</p>
                           <p className="font-medium">{contract.startDate}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Até</p>
                           <p className="font-medium">{contract.endDate}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Daily Rate</p>
                           <p className="font-medium">
                             {contract.dailyRate > 0 ? `$${contract.dailyRate.toLocaleString()}` : "N/A"}
                           </p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Demurrage Rate</p>
                           <p className="font-medium">${contract.demurrageRate.toLocaleString()}/day</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Laytime/Demurrage Tab */}
         <TabsContent value="laytime" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Clock className="h-5 w-5 text-amber-500" />
                 Laytime & Demurrage Calculator
               </CardTitle>
               <CardDescription>
                 Cálculo automático de demurrage e despatch por contrato
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {CONTRACTS.map(contract => {
                   const isOvertime = contract.laytimeUsed > contract.laytimeAllowed;
                   const difference = Math.abs(contract.laytimeUsed - contract.laytimeAllowed);
                   const financialImpact = isOvertime 
                     ? (difference * contract.demurrageRate / 24)
                     : (difference * contract.despatchRate / 24);
                   
                   return (
                     <Card key={contract.id} className={`border-l-4 ${isOvertime ? "border-l-red-500" : "border-l-green-500"}`}>
                       <CardContent className="p-4 space-y-4">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-semibold">{contract.vessel}</h4>
                             <p className="text-sm text-muted-foreground">{contract.contractNumber}</p>
                           </div>
                           <Badge className={isOvertime ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                             {isOvertime ? "DEMURRAGE" : "DESPATCH"}
                           </Badge>
                         </div>
                         
                         <div className="grid grid-cols-4 gap-4 text-center">
                           <div className="p-3 bg-muted/50 rounded-lg">
                             <p className="text-xs text-muted-foreground">Allowed</p>
                             <p className="text-lg font-bold">{contract.laytimeAllowed}h</p>
                           </div>
                           <div className="p-3 bg-muted/50 rounded-lg">
                             <p className="text-xs text-muted-foreground">Used</p>
                             <p className={`text-lg font-bold ${isOvertime ? "text-red-500" : "text-green-500"}`}>
                               {contract.laytimeUsed}h
                             </p>
                           </div>
                           <div className="p-3 bg-muted/50 rounded-lg">
                             <p className="text-xs text-muted-foreground">{isOvertime ? "Overtime" : "Saved"}</p>
                             <p className="text-lg font-bold">{difference}h</p>
                           </div>
                           <div className="p-3 bg-muted/50 rounded-lg">
                             <p className="text-xs text-muted-foreground">Amount</p>
                             <p className={`text-lg font-bold ${isOvertime ? "text-red-500" : "text-green-500"}`}>
                               ${financialImpact.toLocaleString()}
                             </p>
                           </div>
                         </div>
 
                         <Progress 
                           value={Math.min((contract.laytimeUsed / contract.laytimeAllowed) * 100, 150)} 
                           className={`h-2 ${isOvertime ? "[&>div]:bg-red-500" : ""}`}
                         />
                       </CardContent>
                     </Card>
                   );
                 })}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Suppliers Tab */}
         <TabsContent value="suppliers" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Store className="h-5 w-5 text-green-500" />
                 Supplier Scorecard
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[400px]">
                 <div className="space-y-4">
                   {SUPPLIERS.map(supplier => (
                     <Card key={supplier.id} className="border-l-4 border-l-green-500">
                       <CardContent className="p-4 space-y-4">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-semibold">{supplier.name}</h4>
                             <p className="text-sm text-muted-foreground flex items-center gap-2">
                               <Globe className="h-3 w-3" /> {supplier.country}
                               <Badge variant="outline" className="ml-2">{supplier.category}</Badge>
                             </p>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1">
                               <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                               <span className="font-bold">{supplier.rating}</span>
                             </div>
                             <Badge className={getStatusColor(supplier.status)}>
                               {supplier.status}
                             </Badge>
                           </div>
                         </div>
 
                         <div className="grid grid-cols-4 gap-4 text-center">
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Total Spend</p>
                             <p className="font-bold">${(supplier.totalSpend / 1000).toFixed(0)}K</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">On-Time</p>
                             <p className="font-bold text-green-500">{supplier.onTimeDelivery}%</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Quality</p>
                             <p className="font-bold text-blue-500">{supplier.qualityScore}%</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Response</p>
                             <p className="font-bold">{supplier.responseTime}h</p>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* RFQ Tab */}
         <TabsContent value="rfq" className="space-y-6">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <Send className="h-5 w-5 text-blue-500" />
                   Request for Quotation
                 </CardTitle>
                 <Button onClick={() => toast.success("Criando nova RFQ...")}>
                   <Zap className="h-4 w-4 mr-2" />
                   Nova RFQ
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {RFQS.map(rfq => (
                   <div key={rfq.id} className="p-4 border rounded-lg space-y-3">
                     <div className="flex items-center justify-between">
                       <div>
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className="font-mono">{rfq.id}</Badge>
                           <Badge variant="outline">{rfq.category}</Badge>
                         </div>
                         <h4 className="font-semibold mt-1">{rfq.title}</h4>
                         <p className="text-sm text-muted-foreground">{rfq.vessel}</p>
                       </div>
                       <Badge className={getStatusColor(rfq.status)}>
                         {rfq.status === "awarded" ? "Adjudicada" :
                          rfq.status === "in_evaluation" ? "Em Avaliação" : "Aberta"}
                       </Badge>
                     </div>
                     <div className="grid grid-cols-3 gap-4 text-sm">
                       <div>
                         <p className="text-muted-foreground">Deadline</p>
                         <p className="font-medium">{rfq.deadline}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Budget</p>
                         <p className="font-medium">${rfq.budget.toLocaleString()}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Propostas</p>
                         <p className="font-medium">{rfq.responses}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Spend Analytics Tab */}
         <TabsContent value="spend" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <PieChart className="h-5 w-5 text-purple-500" />
                 Spend Analytics by Category
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {SPEND_CATEGORIES.map(cat => (
                   <div key={cat.category} className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="font-medium">{cat.category}</span>
                       <div className="flex items-center gap-4">
                         <span className="text-muted-foreground">{cat.percentage}%</span>
                         <span className="font-bold">${(cat.spend / 1000000).toFixed(2)}M</span>
                         <span className={`text-sm flex items-center gap-1 ${
                           cat.trend === "up" ? "text-red-500" : 
                           cat.trend === "down" ? "text-green-500" : "text-muted-foreground"
                         }`}>
                           {cat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : 
                            cat.trend === "down" ? <TrendingUp className="h-3 w-3 rotate-180" /> : null}
                           {cat.change > 0 ? "+" : ""}{cat.change}%
                         </span>
                       </div>
                     </div>
                     <Progress value={cat.percentage} className="h-2" />
                   </div>
                 ))}
               </div>
 
               <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                 <div className="flex items-center justify-between">
                   <span className="font-semibold">Total Spend (YTD)</span>
                   <span className="text-2xl font-bold">
                     ${(SPEND_CATEGORIES.reduce((acc, c) => acc + c.spend, 0) / 1000000).toFixed(2)}M
                   </span>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }