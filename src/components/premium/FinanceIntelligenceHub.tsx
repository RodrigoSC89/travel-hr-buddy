 /**
  * Finance Intelligence Hub
  * Advanced voyage accounting, P&L, bunker cost allocation
  * Based on Veson IMOS, Danaos best practices
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   DollarSign, 
   TrendingUp, 
   TrendingDown,
   Ship,
   Fuel,
   FileText,
   Clock,
   AlertTriangle,
   CheckCircle,
   Calculator,
   BarChart3,
   PieChart,
   Wallet,
   Receipt,
   RefreshCw,
   ArrowUpRight,
   ArrowDownRight,
   Anchor,
   Target
 } from "lucide-react";
 
 // Dynamic Voyage P&L data
 const voyagePnL = [
   {
     id: "VOY-2024-001",
     vessel: "MV Atlantic Star",
     route: "Santos → Rotterdam",
     status: "in_progress",
     revenue: {
       freight: 1250000,
       demurrage: 45000,
       dispatch: -12000,
       other: 8500
     },
     expenses: {
       bunkers: 385000,
       portCosts: 125000,
       tcHire: 280000,
       commissions: 37500,
       insurance: 45000,
       other: 28000
     },
     margin: 391000,
     marginPercent: 30.3,
     tce: 24500,
     daysAtSea: 18,
     cargoMt: 52000
   },
   {
     id: "VOY-2024-002",
     vessel: "MV Pacific Glory",
     route: "Singapore → Houston",
     status: "completed",
     revenue: {
       freight: 2100000,
       demurrage: 78000,
       dispatch: 0,
       other: 15000
     },
     expenses: {
       bunkers: 520000,
       portCosts: 185000,
       tcHire: 420000,
       commissions: 63000,
       insurance: 68000,
       other: 42000
     },
     margin: 895000,
     marginPercent: 40.8,
     tce: 31200,
     daysAtSea: 32,
     cargoMt: 78000
   }
 ];
 
 // Bunker Inventory with FIFO/AVE calculations
 const bunkerInventory = [
   {
     vessel: "MV Atlantic Star",
     fuelType: "VLSFO",
     currentQty: 850,
     avgCost: 585.50,
     lastLiftDate: "2024-01-28",
     method: "FIFO",
     lots: [
       { qty: 500, price: 580, date: "2024-01-28", supplier: "Shell Marine" },
       { qty: 350, price: 592, date: "2024-01-15", supplier: "BP Marine" }
     ]
   },
   {
     vessel: "MV Pacific Glory",
     fuelType: "VLSFO",
     currentQty: 1200,
     avgCost: 598.25,
     lastLiftDate: "2024-01-25",
     method: "AVE",
     lots: [
       { qty: 800, price: 595, date: "2024-01-25", supplier: "Chevron" },
       { qty: 400, price: 605, date: "2024-01-10", supplier: "TotalEnergies" }
     ]
   }
 ];
 
 // Demurrage Claims Tracker
 const demurrageClaims = [
   {
     id: "DEM-2024-015",
     voyage: "VOY-2024-001",
     vessel: "MV Atlantic Star",
     port: "Rotterdam",
     claimType: "demurrage",
     amount: 45000,
     laytimeDays: 2.5,
     rate: 18000,
     status: "pending",
     timeBarDays: 28,
     charterer: "Cargill Ocean"
   },
   {
     id: "DEM-2024-014",
     voyage: "VOY-2024-002",
     vessel: "MV Pacific Glory",
     port: "Singapore",
     claimType: "demurrage",
     amount: 78000,
     laytimeDays: 3.9,
     rate: 20000,
     status: "submitted",
     timeBarDays: 45,
     charterer: "Trafigura"
   }
 ];
 
 // Port Disbursement Accounts
 const pdaTracking = [
   {
     id: "PDA-2024-089",
     vessel: "MV Atlantic Star",
     port: "Rotterdam",
     agent: "Wilhelmsen Ships",
     pdaAmount: 125000,
     fdaAmount: 118500,
     variance: -6500,
     variancePercent: -5.2,
     status: "reconciled",
     items: [
       { category: "Pilotage", pda: 12000, fda: 11800 },
       { category: "Towage", pda: 18000, fda: 17500 },
       { category: "Port Dues", pda: 45000, fda: 42000 },
       { category: "Agency Fee", pda: 8000, fda: 8000 }
     ]
   }
 ];
 
 export default function FinanceIntelligenceHub() {
   const [selectedVoyage, setSelectedVoyage] = useState(voyagePnL[0]);
   const [bunkerMethod, setBunkerMethod] = useState<"FIFO" | "AVE" | "TBM">("FIFO");
 
   const totalRevenue = selectedVoyage.revenue.freight + selectedVoyage.revenue.demurrage + 
     selectedVoyage.revenue.dispatch + selectedVoyage.revenue.other;
   const totalExpenses = Object.values(selectedVoyage.expenses).reduce((a, b) => a + b, 0);
 
   return (
     <div className="space-y-6">
       {/* Header KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">TCE Médio (Fleet)</p>
                 <p className="text-2xl font-bold text-emerald-600">$27,850/dia</p>
                 <div className="flex items-center gap-1 mt-1">
                   <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                   <span className="text-xs text-emerald-500">+8.5% vs mês anterior</span>
                 </div>
               </div>
               <DollarSign className="h-10 w-10 text-emerald-500/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Margem Bruta</p>
                 <p className="text-2xl font-bold text-blue-600">35.6%</p>
                 <p className="text-xs text-muted-foreground">$1.28M acumulado</p>
               </div>
               <TrendingUp className="h-10 w-10 text-blue-500/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Demurrage Pendente</p>
                 <p className="text-2xl font-bold text-amber-600">$123,000</p>
                 <p className="text-xs text-muted-foreground">3 claims ativos</p>
               </div>
               <Clock className="h-10 w-10 text-amber-500/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Bunker Inventory</p>
                 <p className="text-2xl font-bold text-purple-600">2,050 MT</p>
                 <p className="text-xs text-muted-foreground">$1.2M valor</p>
               </div>
               <Fuel className="h-10 w-10 text-purple-500/40" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       <Tabs defaultValue="voyage-pnl" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="voyage-pnl">Voyage P&L</TabsTrigger>
           <TabsTrigger value="bunkers">Bunker Costing</TabsTrigger>
           <TabsTrigger value="claims">Demurrage Claims</TabsTrigger>
           <TabsTrigger value="pda">PDA Reconciliation</TabsTrigger>
           <TabsTrigger value="accruals">Accruals</TabsTrigger>
         </TabsList>
 
         {/* Dynamic Voyage P&L */}
         <TabsContent value="voyage-pnl" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
             {/* Voyage List */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm flex items-center gap-2">
                   <Ship className="h-4 w-4" />
                   Voyages Ativos
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                 {voyagePnL.map((voyage) => (
                   <div 
                     key={voyage.id}
                     onClick={() => setSelectedVoyage(voyage)}
                     className={`p-3 rounded-lg border cursor-pointer transition-all ${
                       selectedVoyage.id === voyage.id 
                         ? "border-primary bg-primary/5" 
                         : "hover:border-primary/50"
                     }`}
                   >
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-medium text-sm">{voyage.vessel}</p>
                         <p className="text-xs text-muted-foreground">{voyage.route}</p>
                       </div>
                       <Badge variant={voyage.status === "completed" ? "default" : "secondary"}>
                         {voyage.status === "completed" ? "Finalizado" : "Em Andamento"}
                       </Badge>
                     </div>
                     <div className="flex items-center justify-between mt-2">
                       <span className="text-xs text-muted-foreground">TCE</span>
                       <span className="font-semibold text-emerald-600">${voyage.tce.toLocaleString()}/dia</span>
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>
 
             {/* P&L Details */}
             <Card className="lg:col-span-2">
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <div>
                     <CardTitle className="flex items-center gap-2">
                       <BarChart3 className="h-5 w-5" />
                       {selectedVoyage.id} - P&L Dinâmico
                     </CardTitle>
                     <CardDescription>{selectedVoyage.vessel} | {selectedVoyage.route}</CardDescription>
                   </div>
                   <Button variant="outline" size="sm">
                     <RefreshCw className="h-4 w-4 mr-2" />
                     Atualizar
                   </Button>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-6">
                   {/* Revenues */}
                   <div className="space-y-4">
                     <h4 className="font-semibold text-sm flex items-center gap-2 text-emerald-600">
                       <ArrowUpRight className="h-4 w-4" />
                       Receitas
                     </h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>Freight</span>
                         <span className="font-medium">${selectedVoyage.revenue.freight.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Demurrage</span>
                         <span className="font-medium">${selectedVoyage.revenue.demurrage.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Despatch</span>
                         <span className={`font-medium ${selectedVoyage.revenue.dispatch < 0 ? "text-destructive" : ""}`}>
                           ${selectedVoyage.revenue.dispatch.toLocaleString()}
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Outros</span>
                         <span className="font-medium">${selectedVoyage.revenue.other.toLocaleString()}</span>
                       </div>
                       <div className="border-t pt-2 flex justify-between font-semibold">
                         <span>Total Receitas</span>
                         <span className="text-emerald-600">${totalRevenue.toLocaleString()}</span>
                       </div>
                     </div>
                   </div>
 
                   {/* Expenses */}
                   <div className="space-y-4">
                     <h4 className="font-semibold text-sm flex items-center gap-2 text-destructive">
                       <ArrowDownRight className="h-4 w-4" />
                       Despesas
                     </h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>Bunkers</span>
                         <span className="font-medium">${selectedVoyage.expenses.bunkers.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Port Costs</span>
                         <span className="font-medium">${selectedVoyage.expenses.portCosts.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>TC Hire</span>
                         <span className="font-medium">${selectedVoyage.expenses.tcHire.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Commissions</span>
                         <span className="font-medium">${selectedVoyage.expenses.commissions.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span>Insurance</span>
                         <span className="font-medium">${selectedVoyage.expenses.insurance.toLocaleString()}</span>
                       </div>
                       <div className="border-t pt-2 flex justify-between font-semibold">
                         <span>Total Despesas</span>
                         <span className="text-destructive">${totalExpenses.toLocaleString()}</span>
                       </div>
                     </div>
                   </div>
                 </div>
 
                 {/* Margin Summary */}
                 <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg">
                   <div className="grid grid-cols-3 gap-4 text-center">
                     <div>
                       <p className="text-xs text-muted-foreground">Margem Bruta</p>
                       <p className="text-xl font-bold text-emerald-600">${selectedVoyage.margin.toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-xs text-muted-foreground">% Margem</p>
                       <p className="text-xl font-bold">{selectedVoyage.marginPercent}%</p>
                     </div>
                     <div>
                       <p className="text-xs text-muted-foreground">TCE</p>
                       <p className="text-xl font-bold text-primary">${selectedVoyage.tce.toLocaleString()}/dia</p>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Bunker Costing */}
         <TabsContent value="bunkers" className="space-y-4">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <Fuel className="h-5 w-5" />
                     Bunker Cost Allocation
                   </CardTitle>
                   <CardDescription>Métodos FIFO, AVE e TBM para alocação de custos</CardDescription>
                 </div>
                 <div className="flex gap-2">
                   {(["FIFO", "AVE", "TBM"] as const).map((method) => (
                     <Button 
                       key={method}
                       variant={bunkerMethod === method ? "default" : "outline"}
                       size="sm"
                       onClick={() => setBunkerMethod(method)}
                     >
                       {method}
                     </Button>
                   ))}
                 </div>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {bunkerInventory.map((inv) => (
                   <div key={inv.vessel} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <p className="font-semibold">{inv.vessel}</p>
                         <p className="text-sm text-muted-foreground">{inv.fuelType} | Método: {bunkerMethod}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xl font-bold">{inv.currentQty} MT</p>
                         <p className="text-sm text-muted-foreground">
                           Valor: ${(inv.currentQty * inv.avgCost).toLocaleString()}
                         </p>
                       </div>
                     </div>
 
                     <div className="grid grid-cols-4 gap-4 text-sm">
                       <div className="p-3 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Custo Médio</p>
                         <p className="font-semibold">${inv.avgCost}/MT</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Último Lift</p>
                         <p className="font-semibold">{inv.lastLiftDate}</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Lotes</p>
                         <p className="font-semibold">{inv.lots.length} ativos</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Próximo Lift</p>
                         <p className="font-semibold text-amber-600">~5 dias</p>
                       </div>
                     </div>
 
                     {/* Lots Detail */}
                     <div className="mt-4">
                       <p className="text-xs font-medium text-muted-foreground mb-2">Lotes de Combustível:</p>
                       <div className="grid grid-cols-4 gap-2">
                         {inv.lots.map((lot, idx) => (
                           <div key={idx} className="p-2 bg-primary/5 rounded text-xs">
                             <p className="font-medium">{lot.qty} MT @ ${lot.price}</p>
                             <p className="text-muted-foreground">{lot.supplier}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Demurrage Claims */}
         <TabsContent value="claims" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Clock className="h-5 w-5" />
                 Demurrage & Despatch Claims
               </CardTitle>
               <CardDescription>Time Bar tracking e gestão de claims</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {demurrageClaims.map((claim) => (
                   <div key={claim.id} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div>
                           <p className="font-semibold">{claim.id}</p>
                           <p className="text-sm text-muted-foreground">{claim.vessel} | {claim.port}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge variant={claim.status === "pending" ? "secondary" : "default"}>
                           {claim.status === "pending" ? "Pendente" : "Submetido"}
                         </Badge>
                         {claim.timeBarDays < 30 && (
                           <Badge variant="destructive" className="flex items-center gap-1">
                             <AlertTriangle className="h-3 w-3" />
                             Time Bar: {claim.timeBarDays}d
                           </Badge>
                         )}
                       </div>
                     </div>
 
                     <div className="grid grid-cols-5 gap-4 text-sm">
                       <div>
                         <p className="text-xs text-muted-foreground">Charterer</p>
                         <p className="font-medium">{claim.charterer}</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Laytime</p>
                         <p className="font-medium">{claim.laytimeDays} dias</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Rate</p>
                         <p className="font-medium">${claim.rate.toLocaleString()}/dia</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Valor Claim</p>
                         <p className="font-semibold text-emerald-600">${claim.amount.toLocaleString()}</p>
                       </div>
                       <div className="flex items-center justify-end gap-2">
                         <Button size="sm" variant="outline">
                           <FileText className="h-4 w-4 mr-1" />
                           Laytime Sheet
                         </Button>
                         <Button size="sm">Submeter</Button>
                       </div>
                     </div>
 
                     {/* Time Bar Progress */}
                     <div className="mt-3">
                       <div className="flex items-center justify-between text-xs mb-1">
                         <span className="text-muted-foreground">Time Bar Countdown</span>
                         <span className={claim.timeBarDays < 30 ? "text-destructive" : "text-muted-foreground"}>
                           {claim.timeBarDays} dias restantes
                         </span>
                       </div>
                       <Progress 
                         value={Math.max(0, 100 - (claim.timeBarDays / 90 * 100))} 
                         className={claim.timeBarDays < 30 ? "bg-destructive/20" : ""}
                       />
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* PDA Reconciliation */}
         <TabsContent value="pda" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Receipt className="h-5 w-5" />
                 PDA vs FDA Reconciliation
               </CardTitle>
               <CardDescription>Comparação automática de Port Disbursement Accounts</CardDescription>
             </CardHeader>
             <CardContent>
               {pdaTracking.map((pda) => (
                 <div key={pda.id} className="p-4 border rounded-lg">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <p className="font-semibold">{pda.vessel} - {pda.port}</p>
                       <p className="text-sm text-muted-foreground">Agente: {pda.agent}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="text-right">
                         <p className="text-xs text-muted-foreground">Variação</p>
                         <p className={`font-semibold ${pda.variance < 0 ? "text-emerald-600" : "text-destructive"}`}>
                           {pda.variance < 0 ? "-" : "+"}${Math.abs(pda.variance).toLocaleString()} ({pda.variancePercent}%)
                         </p>
                       </div>
                       <Badge variant={pda.status === "reconciled" ? "default" : "secondary"}>
                         <CheckCircle className="h-3 w-3 mr-1" />
                         Reconciliado
                       </Badge>
                     </div>
                   </div>
 
                   <div className="grid grid-cols-4 gap-4 mb-4">
                     <div className="p-3 bg-blue-500/10 rounded text-center">
                       <p className="text-xs text-muted-foreground">PDA Estimado</p>
                       <p className="text-lg font-bold text-blue-600">${pda.pdaAmount.toLocaleString()}</p>
                     </div>
                     <div className="p-3 bg-emerald-500/10 rounded text-center">
                       <p className="text-xs text-muted-foreground">FDA Final</p>
                       <p className="text-lg font-bold text-emerald-600">${pda.fdaAmount.toLocaleString()}</p>
                     </div>
                     <div className={`p-3 rounded text-center ${pda.variance < 0 ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                       <p className="text-xs text-muted-foreground">Economia</p>
                       <p className={`text-lg font-bold ${pda.variance < 0 ? "text-emerald-600" : "text-destructive"}`}>
                         ${Math.abs(pda.variance).toLocaleString()}
                       </p>
                     </div>
                     <div className="p-3 bg-muted/50 rounded text-center">
                       <p className="text-xs text-muted-foreground">Precisão</p>
                       <p className="text-lg font-bold">{(100 - Math.abs(pda.variancePercent)).toFixed(1)}%</p>
                     </div>
                   </div>
 
                   {/* Line Items */}
                   <div className="border rounded-lg overflow-hidden">
                     <table className="w-full text-sm">
                       <thead className="bg-muted/50">
                         <tr>
                           <th className="p-2 text-left">Categoria</th>
                           <th className="p-2 text-right">PDA</th>
                           <th className="p-2 text-right">FDA</th>
                           <th className="p-2 text-right">Var.</th>
                         </tr>
                       </thead>
                       <tbody>
                         {pda.items.map((item) => (
                           <tr key={item.category} className="border-t">
                             <td className="p-2">{item.category}</td>
                             <td className="p-2 text-right">${item.pda.toLocaleString()}</td>
                             <td className="p-2 text-right">${item.fda.toLocaleString()}</td>
                             <td className={`p-2 text-right ${item.fda < item.pda ? "text-emerald-600" : "text-destructive"}`}>
                               ${(item.fda - item.pda).toLocaleString()}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Accruals */}
         <TabsContent value="accruals" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Calculator className="h-5 w-5" />
                 Voyage Accruals & Period Journals
               </CardTitle>
               <CardDescription>Provisionamentos automáticos para fechamento contábil</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 border rounded-lg">
                   <h4 className="font-semibold mb-4">Receitas a Faturar</h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded">
                       <span className="text-sm">Freight - VOY-2024-001</span>
                       <span className="font-semibold text-emerald-600">$625,000</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded">
                       <span className="text-sm">Demurrage Claims</span>
                       <span className="font-semibold text-emerald-600">$123,000</span>
                     </div>
                   </div>
                 </div>
                 <div className="p-4 border rounded-lg">
                   <h4 className="font-semibold mb-4">Despesas Provisionadas</h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded">
                       <span className="text-sm">Bunkers - ROB Valorizado</span>
                       <span className="font-semibold text-amber-600">$498,500</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded">
                       <span className="text-sm">TC Hire Prepaid</span>
                       <span className="font-semibold text-amber-600">$420,000</span>
                     </div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }