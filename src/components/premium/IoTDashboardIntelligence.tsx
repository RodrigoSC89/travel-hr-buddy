 /**
  * IoT Dashboard Intelligence - SMART Notation Compliant
  * ABS SMART (SHM/MHM/AEM/OPM) framework
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Cpu, Activity, Thermometer, Gauge, AlertTriangle,
   Wifi, Battery, Signal, Zap, TrendingUp, Ship,
   Waves, Wind, Settings, BarChart3, Brain
 } from "lucide-react";
 
 interface SensorData {
   id: string;
   name: string;
   type: string;
   value: number;
   unit: string;
   status: "normal" | "warning" | "critical";
   trend: "up" | "down" | "stable";
   lastUpdate: string;
   battery: number;
   signalStrength: number;
 }
 
 interface EquipmentHealth {
   id: string;
   name: string;
   location: string;
   healthScore: number;
   operatingHours: number;
   nextMaintenance: string;
   anomalies: number;
   efficiency: number;
 }
 
 const sensors: SensorData[] = [
   { id: "1", name: "Motor Principal - Temp", type: "temperature", value: 78, unit: "°C", status: "normal", trend: "stable", lastUpdate: "2s ago", battery: 95, signalStrength: 98 },
   { id: "2", name: "Motor Principal - Vibração", type: "vibration", value: 2.3, unit: "mm/s", status: "normal", trend: "up", lastUpdate: "2s ago", battery: 88, signalStrength: 95 },
   { id: "3", name: "Gerador #1 - RPM", type: "rpm", value: 1800, unit: "RPM", status: "normal", trend: "stable", lastUpdate: "1s ago", battery: 92, signalStrength: 99 },
   { id: "4", name: "Casco - Stress Hull", type: "stress", value: 145, unit: "MPa", status: "warning", trend: "up", lastUpdate: "5s ago", battery: 78, signalStrength: 85 },
   { id: "5", name: "Tanque Combustível - Nível", type: "level", value: 67, unit: "%", status: "normal", trend: "down", lastUpdate: "10s ago", battery: 100, signalStrength: 97 },
   { id: "6", name: "Sistema HVAC - Pressão", type: "pressure", value: 2.1, unit: "bar", status: "critical", trend: "down", lastUpdate: "3s ago", battery: 65, signalStrength: 92 }
 ];
 
 const equipmentHealth: EquipmentHealth[] = [
   { id: "1", name: "Motor Principal MAN B&W", location: "Sala de Máquinas", healthScore: 94, operatingHours: 12450, nextMaintenance: "350h", anomalies: 0, efficiency: 97 },
   { id: "2", name: "Gerador Caterpillar #1", location: "Sala de Máquinas", healthScore: 88, operatingHours: 8920, nextMaintenance: "120h", anomalies: 2, efficiency: 92 },
   { id: "3", name: "Gerador Caterpillar #2", location: "Sala de Máquinas", healthScore: 91, operatingHours: 7650, nextMaintenance: "280h", anomalies: 1, efficiency: 95 },
   { id: "4", name: "Sistema de Propulsão", location: "Popa", healthScore: 96, operatingHours: 15200, nextMaintenance: "500h", anomalies: 0, efficiency: 98 },
   { id: "5", name: "Compressor de Ar", location: "Sala de Máquinas", healthScore: 72, operatingHours: 6300, nextMaintenance: "50h", anomalies: 4, efficiency: 78 }
 ];
 
 export default function IoTDashboardIntelligence() {
   const [activeTab, setActiveTab] = useState("realtime");
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "critical": return "text-destructive bg-destructive/10";
       case "warning": return "text-warning bg-warning/10";
       default: return "text-success bg-success/10";
     }
   };
 
   const getTrendIcon = (trend: string) => {
     switch (trend) {
       case "up": return <TrendingUp className="h-3 w-3 text-warning" />;
       case "down": return <TrendingUp className="h-3 w-3 text-cyan-500 rotate-180" />;
       default: return <Activity className="h-3 w-3 text-muted-foreground" />;
     }
   };
 
   const getHealthColor = (score: number) => {
     if (score >= 90) return "text-success";
     if (score >= 75) return "text-warning";
     return "text-destructive";
   };
 
   const onlineSensors = sensors.filter(s => s.signalStrength > 0).length;
   const criticalAlerts = sensors.filter(s => s.status === "critical").length;
   const avgHealth = Math.round(equipmentHealth.reduce((sum, e) => sum + e.healthScore, 0) / equipmentHealth.length);
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Sensores Online</p>
                 <p className="text-2xl font-bold text-success">{onlineSensors}/{sensors.length}</p>
               </div>
               <Wifi className="h-8 w-8 text-success/50" />
             </div>
             <p className="text-xs text-success mt-2">100% conectados</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Health Score Frota</p>
                 <p className="text-2xl font-bold">{avgHealth}%</p>
               </div>
               <Activity className="h-8 w-8 text-primary/50" />
             </div>
             <Progress value={avgHealth} className="h-1.5 mt-2" />
           </CardContent>
         </Card>
 
         <Card className={`bg-gradient-to-br ${criticalAlerts > 0 ? "from-destructive/10 to-destructive/5" : "from-muted/10 to-muted/5"}`}>
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Alertas Críticos</p>
                 <p className={`text-2xl font-bold ${criticalAlerts > 0 ? "text-destructive" : ""}`}>{criticalAlerts}</p>
               </div>
               <AlertTriangle className={`h-8 w-8 ${criticalAlerts > 0 ? "text-destructive/50 animate-pulse" : "text-muted/50"}`} />
             </div>
             <p className="text-xs text-muted-foreground mt-2">{criticalAlerts > 0 ? "Ação necessária" : "Sistema normal"}</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Prognóstico IA</p>
                 <p className="text-2xl font-bold">98.2%</p>
               </div>
               <Brain className="h-8 w-8 text-purple-500/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">Precisão preditiva</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Eficiência Média</p>
                 <p className="text-2xl font-bold">92%</p>
               </div>
               <Zap className="h-8 w-8 text-cyan-500/50" />
             </div>
             <p className="text-xs text-success mt-2">+3% vs baseline</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="realtime" className="flex items-center gap-2 py-2">
             <Activity className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Tempo Real</span>
           </TabsTrigger>
           <TabsTrigger value="health" className="flex items-center gap-2 py-2">
             <Gauge className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Health (SHM/MHM)</span>
           </TabsTrigger>
           <TabsTrigger value="efficiency" className="flex items-center gap-2 py-2">
             <BarChart3 className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Eficiência (AEM)</span>
           </TabsTrigger>
           <TabsTrigger value="operations" className="flex items-center gap-2 py-2">
             <Ship className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Operações (OPM)</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Real-Time Sensors */}
         <TabsContent value="realtime" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Activity className="h-5 w-5 text-primary animate-pulse" />
                 Sensores em Tempo Real
               </CardTitle>
               <CardDescription>
                 Telemetria IoT com atualização contínua
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {sensors.map((sensor) => (
                   <div key={sensor.id} className="border rounded-lg p-4 space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="font-medium text-sm">{sensor.name}</p>
                       <Badge className={getStatusColor(sensor.status)}>
                         {sensor.status === "critical" ? "Crítico" : 
                          sensor.status === "warning" ? "Alerta" : "Normal"}
                       </Badge>
                     </div>
 
                     <div className="flex items-center justify-center gap-2 py-3">
                       <span className="text-3xl font-bold">{sensor.value}</span>
                       <span className="text-lg text-muted-foreground">{sensor.unit}</span>
                       {getTrendIcon(sensor.trend)}
                     </div>
 
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                       <div className="flex items-center gap-1">
                         <Battery className="h-3 w-3" />
                         <span>{sensor.battery}%</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Signal className="h-3 w-3" />
                         <span>{sensor.signalStrength}%</span>
                       </div>
                       <span>{sensor.lastUpdate}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Equipment Health (SHM/MHM) */}
         <TabsContent value="health" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Gauge className="h-5 w-5 text-primary" />
                 Saúde de Equipamentos - ABS SMART (SHM/MHM)
               </CardTitle>
               <CardDescription>
                 Monitoramento estrutural e de maquinário
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {equipmentHealth.map((equip) => (
                   <div key={equip.id} className="border rounded-lg p-4">
                     <div className="flex items-center justify-between mb-3">
                       <div>
                         <p className="font-medium">{equip.name}</p>
                         <p className="text-xs text-muted-foreground">{equip.location}</p>
                       </div>
                       <div className="text-right">
                         <p className={`text-2xl font-bold ${getHealthColor(equip.healthScore)}`}>
                           {equip.healthScore}%
                         </p>
                         <p className="text-xs text-muted-foreground">Health Score</p>
                       </div>
                     </div>
 
                     <Progress 
                       value={equip.healthScore} 
                       className={`h-2 mb-3 ${equip.healthScore < 75 ? "[&>div]:bg-destructive" : 
                                              equip.healthScore < 90 ? "[&>div]:bg-warning" : ""}`}
                     />
 
                     <div className="grid grid-cols-4 gap-2 text-center text-xs">
                       <div className="bg-muted/50 rounded p-2">
                         <p className="font-medium">{equip.operatingHours.toLocaleString()}</p>
                         <p className="text-muted-foreground">Horas Op.</p>
                       </div>
                       <div className="bg-muted/50 rounded p-2">
                         <p className="font-medium">{equip.nextMaintenance}</p>
                         <p className="text-muted-foreground">Próx. Mnt.</p>
                       </div>
                       <div className={`rounded p-2 ${equip.anomalies > 0 ? "bg-warning/20" : "bg-muted/50"}`}>
                         <p className="font-medium">{equip.anomalies}</p>
                         <p className="text-muted-foreground">Anomalias</p>
                       </div>
                       <div className="bg-muted/50 rounded p-2">
                         <p className="font-medium">{equip.efficiency}%</p>
                         <p className="text-muted-foreground">Eficiência</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Asset Efficiency (AEM) */}
         <TabsContent value="efficiency" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Waves className="h-5 w-5 text-cyan-500" />
                   Resistência do Casco
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="text-center">
                   <p className="text-4xl font-bold">+2.3%</p>
                   <p className="text-muted-foreground">Incremento de resistência</p>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Biofouling Estimado</span>
                     <span className="font-medium text-warning">Moderado</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Próxima Limpeza</span>
                     <span className="font-medium">45 dias</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Economia Potencial</span>
                     <span className="font-medium text-success">$12,500/mês</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Zap className="h-5 w-5 text-primary" />
                   Eficiência Energética
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="text-center">
                   <p className="text-4xl font-bold text-success">92%</p>
                   <p className="text-muted-foreground">Eficiência do motor</p>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>EEOI Atual</span>
                     <span className="font-medium">8.2 g CO₂/t·nm</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Rating CII</span>
                     <Badge className="bg-success text-success-foreground">A</Badge>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span>Consumo vs Baseline</span>
                     <span className="font-medium text-success">-5.2%</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Operations Performance (OPM) */}
         <TabsContent value="operations" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Ship className="h-5 w-5 text-primary" />
                 Performance Operacional (OPM)
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="text-center p-4 border rounded-lg">
                 <Wind className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                 <p className="text-2xl font-bold">12.5 kn</p>
                 <p className="text-muted-foreground text-sm">Velocidade Média</p>
               </div>
               <div className="text-center p-4 border rounded-lg">
                 <Gauge className="h-8 w-8 mx-auto text-primary mb-2" />
                 <p className="text-2xl font-bold">18.2 t/d</p>
                 <p className="text-muted-foreground text-sm">Consumo Combustível</p>
               </div>
               <div className="text-center p-4 border rounded-lg">
                 <Activity className="h-8 w-8 mx-auto text-success mb-2" />
                 <p className="text-2xl font-bold">98.5%</p>
                 <p className="text-muted-foreground text-sm">Disponibilidade</p>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }