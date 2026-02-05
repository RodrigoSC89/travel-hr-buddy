 /**
  * Waste Management Intelligence - MARPOL Compliance
  * e-GRB (Electronic Garbage Record Book) with blockchain validation
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Trash2, Recycle, Droplets, AlertTriangle, FileText,
   Ship, CheckCircle2, Clock, Shield, BarChart3,
   Download, Lock, Flame, Anchor, TrendingDown
 } from "lucide-react";
 
 interface WasteCategory {
   id: string;
   name: string;
   code: string;
   currentVolume: number;
   capacity: number;
   unit: string;
   lastDischarge: string;
   method: string;
   status: "ok" | "warning" | "critical";
 }
 
 interface DischargeRecord {
   id: string;
   date: string;
   vessel: string;
   category: string;
   volume: number;
   unit: string;
   method: "sea" | "shore" | "incinerated";
   location: string;
   verified: boolean;
   signature: string;
 }
 
 const wasteCategories: WasteCategory[] = [
   { id: "A", name: "Plásticos", code: "MARPOL-A", currentVolume: 45, capacity: 100, unit: "kg", lastDischarge: "2026-01-28", method: "Porto", status: "ok" },
   { id: "B", name: "Restos de Alimentos", code: "MARPOL-B", currentVolume: 180, capacity: 200, unit: "kg", lastDischarge: "2026-02-03", method: "Mar (>12nm)", status: "warning" },
   { id: "C", name: "Resíduos Domésticos", code: "MARPOL-C", currentVolume: 75, capacity: 150, unit: "kg", lastDischarge: "2026-02-01", method: "Porto", status: "ok" },
   { id: "D", name: "Óleo de Cozinha", code: "MARPOL-D", currentVolume: 28, capacity: 30, unit: "L", lastDischarge: "2026-01-25", method: "Porto", status: "critical" },
   { id: "E", name: "Cinzas de Incinerador", code: "MARPOL-E", currentVolume: 15, capacity: 50, unit: "kg", lastDischarge: "2026-01-30", method: "Porto", status: "ok" },
   { id: "F", name: "Resíduos Operacionais", code: "MARPOL-F", currentVolume: 120, capacity: 200, unit: "kg", lastDischarge: "2026-02-02", method: "Porto", status: "ok" }
 ];
 
 const dischargeRecords: DischargeRecord[] = [
   { id: "1", date: "2026-02-03", vessel: "Nautilus Star", category: "Restos de Alimentos", volume: 50, unit: "kg", method: "sea", location: "23°45'S 45°12'W (>12nm)", verified: true, signature: "Cmdt. J. Silva" },
   { id: "2", date: "2026-02-02", vessel: "Nautilus Star", category: "Resíduos Operacionais", volume: 80, unit: "kg", method: "shore", location: "Porto de Santos", verified: true, signature: "Cmdt. J. Silva" },
   { id: "3", date: "2026-02-01", vessel: "Nautilus Explorer", category: "Plásticos", volume: 35, unit: "kg", method: "shore", location: "Porto de Paranaguá", verified: true, signature: "Cmdt. M. Costa" },
   { id: "4", date: "2026-01-30", vessel: "Nautilus Star", category: "Cinzas de Incinerador", volume: 25, unit: "kg", method: "shore", location: "Porto de Santos", verified: true, signature: "Cmdt. J. Silva" }
 ];
 
 export default function WasteManagementIntelligence() {
   const [activeTab, setActiveTab] = useState("overview");
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "critical": return "text-destructive bg-destructive/10";
       case "warning": return "text-warning bg-warning/10";
       default: return "text-success bg-success/10";
     }
   };
 
   const getMethodIcon = (method: string) => {
     switch (method) {
       case "sea": return <Droplets className="h-4 w-4 text-cyan-500" />;
       case "shore": return <Anchor className="h-4 w-4 text-primary" />;
       case "incinerated": return <Flame className="h-4 w-4 text-orange-500" />;
       default: return <Trash2 className="h-4 w-4" />;
     }
   };
 
   const totalWaste = wasteCategories.reduce((sum, cat) => sum + cat.currentVolume, 0);
   const totalCapacity = wasteCategories.reduce((sum, cat) => sum + cat.capacity, 0);
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Conformidade MARPOL</p>
                 <p className="text-2xl font-bold text-success">100%</p>
               </div>
               <Shield className="h-8 w-8 text-success/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">Anexo V compliant</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Capacidade Utilizada</p>
                 <p className="text-2xl font-bold">{Math.round((totalWaste / totalCapacity) * 100)}%</p>
               </div>
               <Trash2 className="h-8 w-8 text-primary/50" />
             </div>
             <Progress value={(totalWaste / totalCapacity) * 100} className="h-1.5 mt-2" />
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Reciclado</p>
                 <p className="text-2xl font-bold">67%</p>
               </div>
               <Recycle className="h-8 w-8 text-cyan-500/50" />
             </div>
             <p className="text-xs text-success mt-2">+12% vs mês anterior</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Registros e-GRB</p>
                 <p className="text-2xl font-bold">156</p>
               </div>
               <FileText className="h-8 w-8 text-purple-500/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">100% verificados</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Próx. Descarga</p>
                 <p className="text-2xl font-bold">2d</p>
               </div>
               <Clock className="h-8 w-8 text-orange-500/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">Porto de Santos</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
             <Trash2 className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Tanques</span>
           </TabsTrigger>
           <TabsTrigger value="records" className="flex items-center gap-2 py-2">
             <FileText className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">e-GRB</span>
           </TabsTrigger>
           <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
             <BarChart3 className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Analytics</span>
           </TabsTrigger>
           <TabsTrigger value="compliance" className="flex items-center gap-2 py-2">
             <Shield className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Compliance</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Tanks Overview */}
         <TabsContent value="overview" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Trash2 className="h-5 w-5 text-primary" />
                 Status dos Tanques de Resíduos
               </CardTitle>
               <CardDescription>
                 Monitoramento em tempo real conforme MARPOL Anexo V
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {wasteCategories.map((cat) => (
                   <div key={cat.id} className="border rounded-lg p-4 space-y-3">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-medium">{cat.name}</p>
                         <p className="text-xs text-muted-foreground">{cat.code}</p>
                       </div>
                       <Badge className={getStatusColor(cat.status)}>
                         {cat.status === "critical" ? "Crítico" : 
                          cat.status === "warning" ? "Atenção" : "OK"}
                       </Badge>
                     </div>
                     
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span>{cat.currentVolume} {cat.unit}</span>
                         <span className="text-muted-foreground">{cat.capacity} {cat.unit}</span>
                       </div>
                       <Progress 
                         value={(cat.currentVolume / cat.capacity) * 100} 
                         className={`h-2 ${cat.status === "critical" ? "[&>div]:bg-destructive" : 
                                          cat.status === "warning" ? "[&>div]:bg-warning" : ""}`}
                       />
                     </div>
 
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                       <span>Última descarga: {cat.lastDischarge}</span>
                       <span>{cat.method}</span>
                     </div>
 
                     <Button size="sm" variant="outline" className="w-full">
                       Registrar Descarga
                     </Button>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* e-GRB Records */}
         <TabsContent value="records" className="space-y-4">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <FileText className="h-5 w-5 text-primary" />
                     Livro de Registro de Lixo Eletrônico (e-GRB)
                   </CardTitle>
                   <CardDescription>
                     Registros com validação blockchain - IMO MEPC.312(74)
                   </CardDescription>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm">
                     <Download className="h-4 w-4 mr-2" />
                     Exportar PSC
                   </Button>
                   <Button size="sm">
                     + Novo Registro
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {dischargeRecords.map((record) => (
                   <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                     <div className="flex items-center gap-4">
                       {getMethodIcon(record.method)}
                       <div>
                         <p className="font-medium">{record.category}</p>
                         <p className="text-xs text-muted-foreground">
                           {record.vessel} • {record.date}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-medium">{record.volume} {record.unit}</p>
                         <p className="text-xs text-muted-foreground">{record.location}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {record.verified && (
                           <Badge className="bg-success/10 text-success">
                             <Lock className="h-3 w-3 mr-1" />
                             Verificado
                           </Badge>
                         )}
                         <Button variant="ghost" size="sm">
                           <FileText className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Analytics */}
         <TabsContent value="analytics" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingDown className="h-5 w-5 text-success" />
                   Tendência de Redução
                 </CardTitle>
               </CardHeader>
               <CardContent className="text-center py-8">
                 <p className="text-4xl font-bold text-success">-23%</p>
                 <p className="text-muted-foreground">Redução de resíduos vs ano anterior</p>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Recycle className="h-5 w-5 text-cyan-500" />
                   Taxa de Reciclagem por Frota
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {[
                   { vessel: "Nautilus Star", rate: 72 },
                   { vessel: "Nautilus Explorer", rate: 65 },
                   { vessel: "Nautilus Pioneer", rate: 58 }
                 ].map((v, idx) => (
                   <div key={idx} className="space-y-1">
                     <div className="flex justify-between text-sm">
                       <span>{v.vessel}</span>
                       <span className="font-medium">{v.rate}%</span>
                     </div>
                     <Progress value={v.rate} className="h-2" />
                   </div>
                 ))}
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Compliance */}
         <TabsContent value="compliance" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-success" />
                 Status de Conformidade MARPOL
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { regulation: "MARPOL Anexo V", status: "compliant", lastAudit: "2026-01-15" },
                   { regulation: "IMO MEPC.312(74)", status: "compliant", lastAudit: "2026-01-15" },
                   { regulation: "EU MRV Reporting", status: "compliant", lastAudit: "2025-12-20" },
                   { regulation: "Paris MoU Guidelines", status: "compliant", lastAudit: "2026-01-10" }
                 ].map((reg, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                     <div>
                       <p className="font-medium">{reg.regulation}</p>
                       <p className="text-xs text-muted-foreground">Última auditoria: {reg.lastAudit}</p>
                     </div>
                     <Badge className="bg-success/10 text-success">
                       <CheckCircle2 className="h-3 w-3 mr-1" />
                       Conforme
                     </Badge>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }