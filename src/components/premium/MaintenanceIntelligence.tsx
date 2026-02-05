 /**
  * Maintenance Intelligence Component
  * Based on best practices from AMOS, DNV ShipManager, ABS Nautical
  * Features: Predictive maintenance, digital twin, IoT integration
  */
 
 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp,
   Cpu, Thermometer, Gauge, Activity, Calendar, Ship,
   Brain, Zap, Settings, BarChart3, Target, Timer
 } from "lucide-react";
 
 interface Equipment {
   id: string;
   name: string;
   category: string;
   vessel: string;
   healthScore: number;
   runningHours: number;
   nextService: number;
   status: "operational" | "warning" | "critical" | "maintenance";
   prediction: {
     failureProbability: number;
     daysToFailure: number;
     confidence: number;
   };
   sensors: {
     temperature: number;
     vibration: number;
     pressure: number;
   };
 }
 
 const mockEquipment: Equipment[] = [
   {
     id: "1", name: "Main Engine #1 (MAN B&W 6S50ME-C)", category: "Propulsão",
     vessel: "MV Atlantic Explorer", healthScore: 87, runningHours: 12450,
     nextService: 150, status: "operational",
     prediction: { failureProbability: 12, daysToFailure: 45, confidence: 89 },
     sensors: { temperature: 78, vibration: 2.4, pressure: 6.2 }
   },
   {
     id: "2", name: "Auxiliary Generator #2 (Caterpillar 3512B)", category: "Geração",
     vessel: "MV Atlantic Explorer", healthScore: 64, runningHours: 8920,
     nextService: 80, status: "warning",
     prediction: { failureProbability: 45, daysToFailure: 12, confidence: 94 },
     sensors: { temperature: 92, vibration: 4.8, pressure: 5.8 }
   },
   {
     id: "3", name: "Bow Thruster Hydraulic System", category: "Manobra",
     vessel: "MV Pacific Voyager", healthScore: 42, runningHours: 5670,
     nextService: 0, status: "critical",
     prediction: { failureProbability: 78, daysToFailure: 5, confidence: 91 },
     sensors: { temperature: 105, vibration: 7.2, pressure: 4.1 }
   },
 ];
 
 export default function MaintenanceIntelligence() {
   const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
 
   const criticalCount = mockEquipment.filter(e => e.status === "critical").length;
   const warningCount = mockEquipment.filter(e => e.status === "warning").length;
   const avgHealth = mockEquipment.reduce((sum, e) => sum + e.healthScore, 0) / mockEquipment.length;
   const upcomingMaintenance = mockEquipment.filter(e => e.nextService <= 100).length;
 
   const getStatusConfig = (status: string) => {
     const config: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
       operational: { color: "text-success", icon: CheckCircle2, label: "Operacional" },
       warning: { color: "text-warning", icon: AlertTriangle, label: "Atenção" },
       critical: { color: "text-destructive", icon: AlertTriangle, label: "Crítico" },
       maintenance: { color: "text-info", icon: Wrench, label: "Em Manutenção" },
     };
     return config[status] || config.operational;
   };
 
   const getHealthColor = (score: number) => {
     if (score >= 80) return "text-success";
     if (score >= 60) return "text-warning";
     return "text-destructive";
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4 text-center">
             <Activity className="h-5 w-5 text-success mx-auto mb-2" />
             <p className="text-2xl font-bold">{avgHealth.toFixed(0)}%</p>
             <p className="text-xs text-muted-foreground">Saúde Média</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
           <CardContent className="p-4 text-center">
             <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
             <p className="text-2xl font-bold">{criticalCount}</p>
             <p className="text-xs text-muted-foreground">Críticos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4 text-center">
             <Clock className="h-5 w-5 text-warning mx-auto mb-2" />
             <p className="text-2xl font-bold">{warningCount}</p>
             <p className="text-xs text-muted-foreground">Atenção</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-info/10 to-info/5">
           <CardContent className="p-4 text-center">
             <Calendar className="h-5 w-5 text-info mx-auto mb-2" />
             <p className="text-2xl font-bold">{upcomingMaintenance}</p>
             <p className="text-xs text-muted-foreground">Próx. Manutenção</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4 text-center">
             <Cpu className="h-5 w-5 text-primary mx-auto mb-2" />
             <p className="text-2xl font-bold">{mockEquipment.length}</p>
             <p className="text-xs text-muted-foreground">Equipamentos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
           <CardContent className="p-4 text-center">
             <Brain className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">92%</p>
             <p className="text-xs text-muted-foreground">Precisão IA</p>
           </CardContent>
         </Card>
       </div>
 
       {/* AI Predictions Alert */}
       {criticalCount > 0 && (
         <Card className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-transparent">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-destructive/10 animate-pulse">
                   <Brain className="h-5 w-5 text-destructive" />
                 </div>
                 <div>
                   <p className="font-semibold text-destructive">⚠️ Alerta de Manutenção Preditiva</p>
                   <p className="text-sm text-muted-foreground">
                     IA detectou {criticalCount} equipamento(s) com alto risco de falha nos próximos 7 dias
                   </p>
                 </div>
               </div>
               <Button size="sm" variant="destructive" className="gap-2">
                 <Wrench className="h-4 w-4" />
                 Agendar Manutenção
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Equipment List with IoT Sensors */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Cpu className="h-5 w-5 text-primary" />
                 Monitoramento de Equipamentos
               </CardTitle>
               <CardDescription>Dados em tempo real de sensores IoT</CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[450px]">
                 <div className="space-y-4">
                   {mockEquipment.map((equipment) => {
                     const statusConfig = getStatusConfig(equipment.status);
                     const StatusIcon = statusConfig.icon;
                     
                     return (
                       <div 
                         key={equipment.id} 
                         className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                           selectedEquipment?.id === equipment.id ? "ring-2 ring-primary" : ""
                         } ${equipment.status === "critical" ? "border-destructive/50 bg-destructive/5" : ""}`}
                         onClick={() => setSelectedEquipment(equipment)}
                       >
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg bg-muted`}>
                               <Wrench className={`h-5 w-5 ${statusConfig.color}`} />
                             </div>
                             <div>
                               <p className="font-semibold">{equipment.name}</p>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <Ship className="h-3 w-3" />
                                 {equipment.vessel}
                                 <span>•</span>
                                 <Badge variant="outline" className="text-xs">{equipment.category}</Badge>
                               </div>
                             </div>
                           </div>
                           <Badge className={`${statusConfig.color} bg-transparent border`}>
                             <StatusIcon className="h-3 w-3 mr-1" />
                             {statusConfig.label}
                           </Badge>
                         </div>
 
                         {/* Health & Prediction */}
                         <div className="grid grid-cols-4 gap-4 mt-3">
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${getHealthColor(equipment.healthScore)}`}>
                               {equipment.healthScore}%
                             </p>
                             <p className="text-xs text-muted-foreground">Saúde</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className="text-lg font-bold">{equipment.runningHours}h</p>
                             <p className="text-xs text-muted-foreground">Horas</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${equipment.nextService <= 50 ? "text-warning" : ""}`}>
                               {equipment.nextService}h
                             </p>
                             <p className="text-xs text-muted-foreground">Próx. Serviço</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${equipment.prediction.failureProbability > 50 ? "text-destructive" : ""}`}>
                               {equipment.prediction.daysToFailure}d
                             </p>
                             <p className="text-xs text-muted-foreground">Pred. Falha</p>
                           </div>
                         </div>
 
                         {/* IoT Sensors */}
                         <div className="flex gap-4 mt-3 text-sm">
                           <div className="flex items-center gap-1">
                             <Thermometer className={`h-4 w-4 ${equipment.sensors.temperature > 90 ? "text-destructive" : "text-muted-foreground"}`} />
                             <span>{equipment.sensors.temperature}°C</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Activity className={`h-4 w-4 ${equipment.sensors.vibration > 5 ? "text-warning" : "text-muted-foreground"}`} />
                             <span>{equipment.sensors.vibration} mm/s</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Gauge className={`h-4 w-4 ${equipment.sensors.pressure < 5 ? "text-warning" : "text-muted-foreground"}`} />
                             <span>{equipment.sensors.pressure} bar</span>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </div>
 
         {/* Equipment Details */}
         <div>
           {selectedEquipment ? (
             <Card>
               <CardHeader>
                 <CardTitle className="text-base">{selectedEquipment.name}</CardTitle>
                 <CardDescription>{selectedEquipment.vessel}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Health Gauge */}
                 <div className="text-center p-4 bg-muted/50 rounded-lg">
                   <div className={`text-4xl font-bold ${getHealthColor(selectedEquipment.healthScore)}`}>
                     {selectedEquipment.healthScore}%
                   </div>
                   <p className="text-sm text-muted-foreground">Índice de Saúde</p>
                   <Progress value={selectedEquipment.healthScore} className="mt-2 h-2" />
                 </div>
 
                 {/* AI Prediction */}
                 <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                   <div className="flex items-center gap-2 mb-2">
                     <Brain className="h-4 w-4 text-primary" />
                     <span className="font-medium text-sm">Predição IA</span>
                     <Badge variant="outline" className="ml-auto text-xs">
                       {selectedEquipment.prediction.confidence}% confiança
                     </Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                     <div>
                       <p className="text-muted-foreground">Prob. Falha</p>
                       <p className={`font-bold ${selectedEquipment.prediction.failureProbability > 50 ? "text-destructive" : "text-success"}`}>
                         {selectedEquipment.prediction.failureProbability}%
                       </p>
                     </div>
                     <div>
                       <p className="text-muted-foreground">Dias até Falha</p>
                       <p className="font-bold">{selectedEquipment.prediction.daysToFailure} dias</p>
                     </div>
                   </div>
                 </div>
 
                 {/* Sensors Real-time */}
                 <div className="space-y-3">
                   <p className="font-medium text-sm">Sensores IoT (Tempo Real)</p>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                       <span className="flex items-center gap-2 text-sm">
                         <Thermometer className="h-4 w-4" />
                         Temperatura
                       </span>
                       <span className={`font-bold ${selectedEquipment.sensors.temperature > 90 ? "text-destructive" : ""}`}>
                         {selectedEquipment.sensors.temperature}°C
                       </span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                       <span className="flex items-center gap-2 text-sm">
                         <Activity className="h-4 w-4" />
                         Vibração
                       </span>
                       <span className={`font-bold ${selectedEquipment.sensors.vibration > 5 ? "text-warning" : ""}`}>
                         {selectedEquipment.sensors.vibration} mm/s
                       </span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                       <span className="flex items-center gap-2 text-sm">
                         <Gauge className="h-4 w-4" />
                         Pressão
                       </span>
                       <span className="font-bold">{selectedEquipment.sensors.pressure} bar</span>
                     </div>
                   </div>
                 </div>
 
                 <div className="flex gap-2">
                   <Button className="flex-1" size="sm">
                     <Wrench className="h-4 w-4 mr-2" />
                     Agendar Manutenção
                   </Button>
                   <Button variant="outline" size="sm">
                     <BarChart3 className="h-4 w-4" />
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="p-8 text-center text-muted-foreground">
                 <Cpu className="h-12 w-12 mx-auto mb-3 opacity-50" />
                 <p>Selecione um equipamento para ver detalhes</p>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>
   );
 }