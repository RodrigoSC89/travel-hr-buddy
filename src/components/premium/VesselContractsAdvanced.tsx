 /**
  * Vessel Contracts Advanced Component
  * Based on best practices from Veson Nautical, Danaos ONE
  * Features: Charter Party integration, laytime calculations, automated billing
  */
 
 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   FileText, Ship, Calendar, DollarSign, Clock, AlertTriangle,
   CheckCircle2, TrendingUp, BarChart3, MapPin, Anchor, Timer,
   Calculator, Bell, Eye, Download, Plus, Settings
 } from "lucide-react";
 
 interface Contract {
   id: string;
   contractNumber: string;
   vessel: string;
   charterer: string;
   type: "time_charter" | "voyage_charter" | "bareboat";
   status: "active" | "pending" | "expired" | "dispute";
   startDate: string;
   endDate: string;
   dailyRate: number;
   currency: string;
   laytimeUsed: number;
   laytimeAllowed: number;
   demurrageRate: number;
   despatchRate: number;
   performance: number;
 }
 
 const mockContracts: Contract[] = [
   {
     id: "1", contractNumber: "TC-2024-001", vessel: "MV Atlantic Explorer",
     charterer: "Petrobras S.A.", type: "time_charter", status: "active",
     startDate: "2024-01-15", endDate: "2024-07-15", dailyRate: 45000,
     currency: "USD", laytimeUsed: 36, laytimeAllowed: 48, demurrageRate: 55000,
     despatchRate: 27500, performance: 94
   },
   {
     id: "2", contractNumber: "VC-2024-012", vessel: "MV Pacific Voyager",
     charterer: "Shell Trading", type: "voyage_charter", status: "active",
     startDate: "2024-02-01", endDate: "2024-03-15", dailyRate: 0,
     currency: "USD", laytimeUsed: 52, laytimeAllowed: 48, demurrageRate: 48000,
     despatchRate: 24000, performance: 87
   },
 ];
 
 export default function VesselContractsAdvanced() {
   const [activeTab, setActiveTab] = useState("overview");
 
   const activeContracts = mockContracts.filter(c => c.status === "active");
   const totalDemurrage = mockContracts
     .filter(c => c.laytimeUsed > c.laytimeAllowed)
     .reduce((sum, c) => sum + ((c.laytimeUsed - c.laytimeAllowed) * c.demurrageRate / 24), 0);
   const totalDespatch = mockContracts
     .filter(c => c.laytimeUsed < c.laytimeAllowed)
     .reduce((sum, c) => sum + ((c.laytimeAllowed - c.laytimeUsed) * c.despatchRate / 24), 0);
 
   const getStatusBadge = (status: string) => {
     const config: Record<string, { color: string; label: string }> = {
       active: { color: "bg-success/10 text-success border-success/30", label: "Ativo" },
       pending: { color: "bg-warning/10 text-warning border-warning/30", label: "Pendente" },
       expired: { color: "bg-muted text-muted-foreground", label: "Expirado" },
       dispute: { color: "bg-destructive/10 text-destructive border-destructive/30", label: "Disputa" },
     };
     const { color, label } = config[status] || config.pending;
     return <Badge className={`${color} border`}>{label}</Badge>;
   };
 
   const getTypeLabel = (type: string) => {
     const labels: Record<string, string> = {
       time_charter: "Time Charter",
       voyage_charter: "Voyage Charter",
       bareboat: "Bareboat",
     };
     return labels[type] || type;
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4 text-center">
             <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
             <p className="text-2xl font-bold">{mockContracts.length}</p>
             <p className="text-xs text-muted-foreground">Contratos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4 text-center">
             <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-2" />
             <p className="text-2xl font-bold">{activeContracts.length}</p>
             <p className="text-xs text-muted-foreground">Ativos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
           <CardContent className="p-4 text-center">
             <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
             <p className="text-2xl font-bold">${(totalDemurrage / 1000).toFixed(0)}K</p>
             <p className="text-xs text-muted-foreground">Demurrage</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-info/10 to-info/5">
           <CardContent className="p-4 text-center">
             <TrendingUp className="h-5 w-5 text-info mx-auto mb-2" />
             <p className="text-2xl font-bold">${(totalDespatch / 1000).toFixed(0)}K</p>
             <p className="text-xs text-muted-foreground">Despatch</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4 text-center">
             <Timer className="h-5 w-5 text-warning mx-auto mb-2" />
             <p className="text-2xl font-bold">88h</p>
             <p className="text-xs text-muted-foreground">Laytime Total</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
           <CardContent className="p-4 text-center">
             <BarChart3 className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">91%</p>
             <p className="text-xs text-muted-foreground">Performance</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Laytime Calculator Alert */}
       <Card className="border-warning/50 bg-gradient-to-r from-warning/5 to-transparent">
         <CardContent className="p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-warning/10">
                 <Calculator className="h-5 w-5 text-warning" />
               </div>
               <div>
                 <p className="font-semibold">Calculadora de Laytime Inteligente</p>
                 <p className="text-sm text-muted-foreground">
                   2 contratos com risco de demurrage • Economia potencial: $24,000
                 </p>
               </div>
             </div>
             <Button size="sm" variant="outline" className="gap-2">
               <Calculator className="h-4 w-4" />
               Calcular Agora
             </Button>
           </div>
         </CardContent>
       </Card>
 
       {/* Contracts List */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Anchor className="h-5 w-5 text-primary" />
                 Contratos de Afretamento
               </CardTitle>
               <CardDescription>Gestão integrada de charter party e laytime</CardDescription>
             </div>
             <Button className="gap-2">
               <Plus className="h-4 w-4" />
               Novo Contrato
             </Button>
           </div>
         </CardHeader>
         <CardContent>
           <ScrollArea className="h-[400px]">
             <div className="space-y-4">
               {mockContracts.map((contract) => {
                 const laytimePercent = (contract.laytimeUsed / contract.laytimeAllowed) * 100;
                 const isOvertime = contract.laytimeUsed > contract.laytimeAllowed;
                 
                 return (
                   <div key={contract.id} className="p-4 rounded-lg border hover:shadow-md transition-all">
                     <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-primary/10">
                           <Ship className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="font-mono text-sm text-muted-foreground">{contract.contractNumber}</span>
                             {getStatusBadge(contract.status)}
                             <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
                           </div>
                           <p className="font-semibold">{contract.vessel}</p>
                           <p className="text-sm text-muted-foreground">{contract.charterer}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         {contract.dailyRate > 0 && (
                           <p className="font-bold text-lg">${contract.dailyRate.toLocaleString()}/dia</p>
                         )}
                         <p className="text-xs text-muted-foreground">
                           {contract.startDate} → {contract.endDate}
                         </p>
                       </div>
                     </div>
 
                     {/* Laytime Progress */}
                     <div className="mt-4 p-3 rounded-lg bg-muted/50">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-medium">Laytime</span>
                         <span className={`text-sm font-bold ${isOvertime ? "text-destructive" : "text-success"}`}>
                           {contract.laytimeUsed}h / {contract.laytimeAllowed}h
                         </span>
                       </div>
                       <Progress 
                         value={Math.min(laytimePercent, 100)} 
                         className={`h-2 ${isOvertime ? "[&>div]:bg-destructive" : ""}`} 
                       />
                       {isOvertime && (
                         <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
                           <AlertTriangle className="h-4 w-4" />
                           <span>
                             Demurrage: ${((contract.laytimeUsed - contract.laytimeAllowed) * contract.demurrageRate / 24).toLocaleString()}
                           </span>
                         </div>
                       )}
                     </div>
 
                     {/* Actions */}
                     <div className="mt-4 flex gap-2">
                       <Button variant="outline" size="sm" className="flex-1 gap-2">
                         <Eye className="h-4 w-4" />
                         Detalhes
                       </Button>
                       <Button variant="outline" size="sm" className="gap-2">
                         <Calculator className="h-4 w-4" />
                         Laytime
                       </Button>
                       <Button variant="outline" size="sm" className="gap-2">
                         <Download className="h-4 w-4" />
                         PDF
                       </Button>
                     </div>
                   </div>
                 );
               })}
             </div>
           </ScrollArea>
         </CardContent>
       </Card>
     </div>
   );
 }