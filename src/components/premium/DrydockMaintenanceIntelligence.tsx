 /**
  * Drydock & Maintenance Intelligence Hub
  * Based on DNV 2024 rules, VesselMan, and BASSnet best practices
  * Features: Class renewal, hull coating, ESP code, PMS.A notation
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Wrench, Ship, Calendar, Shield, DollarSign, BarChart3,
   CheckCircle, AlertTriangle, Clock, TrendingUp, FileText,
   Hammer, Anchor, Droplets, Gauge, Thermometer, Zap,
   Activity, Target, Brain, Sparkles, RefreshCw, Download, Eye
 } from "lucide-react";
 import { toast } from "sonner";
 
 // DNV Class Surveys
 const CLASS_SURVEYS = [
   { type: "Annual Survey", code: "AS", interval: "12 months", lastDate: "2024-01-15", nextDue: "2025-01-15", status: "valid" },
   { type: "Intermediate Survey", code: "IS", interval: "30 months", lastDate: "2023-06-20", nextDue: "2025-12-20", status: "valid" },
   { type: "Special Survey", code: "SS", interval: "60 months", lastDate: "2021-03-10", nextDue: "2026-03-10", status: "upcoming" },
   { type: "Bottom Survey", code: "BS", interval: "60 months", lastDate: "2021-03-10", nextDue: "2026-03-10", status: "upcoming" },
   { type: "Tailshaft Survey", code: "TS", interval: "60 months", lastDate: "2021-03-10", nextDue: "2026-03-10", status: "upcoming" },
 ];
 
 // Drydock Projects
 const DRYDOCK_PROJECTS = [
   {
     id: "1", vessel: "MV Atlântico Sul", shipyard: "Estaleiro Atlântico Sul",
     type: "Special Survey", startDate: "2024-03-01", endDate: "2024-03-20",
     estimatedCost: 1250000, actualCost: null, status: "scheduled",
     workScope: ["Hull Blasting", "Propeller Polish", "Anodes Replacement", "Class Renewal"],
     progress: 0
   },
   {
     id: "2", vessel: "MV Ocean Pride", shipyard: "Jurong Shipyard",
     type: "Intermediate Survey", startDate: "2024-01-15", endDate: "2024-01-28",
     estimatedCost: 450000, actualCost: 478500, status: "completed",
     workScope: ["Underwater Inspection", "Valve Overhaul", "Tank Coating"],
     progress: 100
   },
   {
     id: "3", vessel: "MV Pacific Star", shipyard: "Keppel FELS",
     type: "Drydock", startDate: "2024-02-10", endDate: "2024-02-25",
     estimatedCost: 820000, actualCost: null, status: "in_progress",
     workScope: ["Hull Coating", "Rudder Inspection", "Main Engine Overhaul"],
     progress: 65
   },
 ];
 
 // Hull Coating Conditions (ESP Code)
 const HULL_CONDITIONS = [
   { area: "Ballast Tank #1", condition: "GOOD", lastInspection: "2024-01-10", nextDue: "2027-01-10" },
   { area: "Ballast Tank #2", condition: "FAIR", lastInspection: "2024-01-10", nextDue: "2025-01-10" },
   { area: "Ballast Tank #3", condition: "GOOD", lastInspection: "2024-01-10", nextDue: "2027-01-10" },
   { area: "Cargo Hold #1", condition: "GOOD", lastInspection: "2024-01-12", nextDue: "2027-01-12" },
   { area: "Cargo Hold #2", condition: "POOR", lastInspection: "2024-01-12", nextDue: "2024-07-12" },
   { area: "Void Spaces", condition: "FAIR", lastInspection: "2024-01-15", nextDue: "2025-01-15" },
 ];
 
 // PMS Equipment Health
 const EQUIPMENT_HEALTH = [
   { equipment: "Main Engine #1", health: 92, runningHours: 28450, nextOverhaul: 30000, status: "good" },
   { equipment: "Main Engine #2", health: 88, runningHours: 27800, nextOverhaul: 30000, status: "good" },
   { equipment: "Aux Generator #1", health: 75, runningHours: 18500, nextOverhaul: 20000, status: "warning" },
   { equipment: "Aux Generator #2", health: 95, runningHours: 15200, nextOverhaul: 20000, status: "good" },
   { equipment: "Bow Thruster", health: 82, runningHours: 4500, nextOverhaul: 6000, status: "good" },
   { equipment: "Steering Gear", health: 68, runningHours: 22000, nextOverhaul: 25000, status: "warning" },
 ];
 
 // DNV 2024 Rule Updates
 const DNV_UPDATES = [
   { code: "PMS.A", title: "Planned Maintenance System", description: "Unified notation consolidating previous schemes", effectiveDate: "2025-01-01" },
   { code: "ESP-2024", title: "Enhanced Survey Programme", description: "New coating condition requirements for ballast tanks", effectiveDate: "2024-07-01" },
   { code: "IWS-60", title: "In-Water Survey Extension", description: "60-month drydock interval for qualifying vessels", effectiveDate: "2024-01-01" },
 ];
 
 export default function DrydockMaintenanceIntelligence() {
   const [activeTab, setActiveTab] = useState("projects");
 
   const getConditionColor = (condition: string) => {
     switch (condition) {
       case "GOOD": return "bg-green-500/10 text-green-500 border-green-500/20";
       case "FAIR": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
       case "POOR": return "bg-red-500/10 text-red-500 border-red-500/20";
       default: return "bg-muted text-muted-foreground";
     }
   };
 
   const getHealthColor = (health: number) => {
     if (health >= 85) return "text-green-500";
     if (health >= 70) return "text-amber-500";
     return "text-red-500";
   };
 
   const totalProjectCost = DRYDOCK_PROJECTS.reduce((acc, p) => acc + p.estimatedCost, 0);
   const completedProjects = DRYDOCK_PROJECTS.filter(p => p.status === "completed").length;
   const avgEquipmentHealth = Math.round(EQUIPMENT_HEALTH.reduce((acc, e) => acc + e.health, 0) / EQUIPMENT_HEALTH.length);
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Projetos Drydock</p>
                 <p className="text-2xl font-bold">{DRYDOCK_PROJECTS.length}</p>
                 <p className="text-xs text-green-500">{completedProjects} concluídos</p>
               </div>
               <Ship className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-amber-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Budget Total</p>
                 <p className="text-2xl font-bold">${(totalProjectCost / 1000000).toFixed(1)}M</p>
                 <p className="text-xs text-muted-foreground">Estimado</p>
               </div>
               <DollarSign className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-green-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Saúde Equipamentos</p>
                 <p className="text-2xl font-bold">{avgEquipmentHealth}%</p>
                 <Progress value={avgEquipmentHealth} className="h-1 mt-1" />
               </div>
               <Gauge className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Surveys Válidos</p>
                 <p className="text-2xl font-bold">{CLASS_SURVEYS.filter(s => s.status === "valid").length}/{CLASS_SURVEYS.length}</p>
                 <p className="text-xs text-purple-500">DNV Class</p>
               </div>
               <Shield className="h-8 w-8 text-purple-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="projects" className="flex items-center gap-2">
             <Ship className="h-4 w-4" />
             Projetos
           </TabsTrigger>
           <TabsTrigger value="class" className="flex items-center gap-2">
             <Shield className="h-4 w-4" />
             Class Surveys
           </TabsTrigger>
           <TabsTrigger value="hull" className="flex items-center gap-2">
             <Droplets className="h-4 w-4" />
             Hull & Coating
           </TabsTrigger>
           <TabsTrigger value="pms" className="flex items-center gap-2">
             <Wrench className="h-4 w-4" />
             PMS.A
           </TabsTrigger>
           <TabsTrigger value="dnv" className="flex items-center gap-2">
             <FileText className="h-4 w-4" />
             DNV Updates
           </TabsTrigger>
         </TabsList>
 
         {/* Drydock Projects Tab */}
         <TabsContent value="projects" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Ship className="h-5 w-5 text-blue-500" />
                 Drydock Project Portfolio
               </CardTitle>
               <CardDescription>
                 Gestão completa de projetos de docagem e manutenção
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[400px]">
                 <div className="space-y-4">
                   {DRYDOCK_PROJECTS.map(project => (
                     <Card key={project.id} className="border-l-4 border-l-blue-500">
                       <CardContent className="p-4 space-y-4">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-semibold">{project.vessel}</h4>
                             <p className="text-sm text-muted-foreground">
                               {project.shipyard} • {project.type}
                             </p>
                           </div>
                           <Badge className={
                             project.status === "completed" ? "bg-green-500/10 text-green-500" :
                             project.status === "in_progress" ? "bg-blue-500/10 text-blue-500" :
                             "bg-amber-500/10 text-amber-500"
                           }>
                             {project.status === "completed" ? "Concluído" :
                              project.status === "in_progress" ? "Em Andamento" : "Agendado"}
                           </Badge>
                         </div>
 
                         <div className="grid grid-cols-3 gap-4 text-sm">
                           <div>
                             <p className="text-muted-foreground">Período</p>
                             <p className="font-medium">{project.startDate} - {project.endDate}</p>
                           </div>
                           <div>
                             <p className="text-muted-foreground">Budget</p>
                             <p className="font-medium">${(project.estimatedCost / 1000).toFixed(0)}K</p>
                           </div>
                           <div>
                             <p className="text-muted-foreground">Progresso</p>
                             <Progress value={project.progress} className="h-2 mt-1" />
                           </div>
                         </div>
 
                         <div className="flex flex-wrap gap-2">
                           {project.workScope.map((scope, i) => (
                             <Badge key={i} variant="outline" className="text-xs">{scope}</Badge>
                           ))}
                         </div>
 
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline">
                             <Eye className="h-3 w-3 mr-1" />
                             Detalhes
                           </Button>
                           <Button size="sm" variant="outline">
                             <FileText className="h-3 w-3 mr-1" />
                             Spec List
                           </Button>
                           <Button size="sm" variant="outline">
                             <Brain className="h-3 w-3 mr-1" />
                             AI Predict
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Class Surveys Tab */}
         <TabsContent value="class" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-green-500" />
                 DNV Class Survey Schedule
               </CardTitle>
               <CardDescription>
                 Cronograma de surveys de classe e certificações
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {CLASS_SURVEYS.map(survey => (
                   <div key={survey.type} className="flex items-center justify-between p-4 border rounded-lg">
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                         survey.status === "valid" ? "bg-green-500/10" : "bg-amber-500/10"
                       }`}>
                         <span className="font-bold text-sm">{survey.code}</span>
                       </div>
                       <div>
                         <p className="font-medium">{survey.type}</p>
                         <p className="text-sm text-muted-foreground">
                           Intervalo: {survey.interval}
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm">Último: {survey.lastDate}</p>
                       <p className={`text-sm font-medium ${
                         survey.status === "valid" ? "text-green-500" : "text-amber-500"
                       }`}>
                         Próximo: {survey.nextDue}
                       </p>
                     </div>
                     <Badge className={
                       survey.status === "valid" 
                         ? "bg-green-500/10 text-green-500" 
                         : "bg-amber-500/10 text-amber-500"
                     }>
                       {survey.status === "valid" ? "Válido" : "Próximo"}
                     </Badge>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Hull Coating Tab (ESP Code) */}
         <TabsContent value="hull" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Droplets className="h-5 w-5 text-blue-500" />
                 Hull Coating Condition (ESP Code 2024)
               </CardTitle>
               <CardDescription>
                 Condição de revestimento conforme Enhanced Survey Programme
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                 <p className="text-sm flex items-center gap-2">
                   <AlertTriangle className="h-4 w-4 text-amber-500" />
                   <strong>ESP-2024:</strong> Condição inferior a "GOOD" requer inspeção anual
                 </p>
               </div>
 
               <div className="space-y-3">
                 {HULL_CONDITIONS.map(area => (
                   <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{
                         backgroundColor: area.condition === "GOOD" ? "#22c55e" :
                           area.condition === "FAIR" ? "#f59e0b" : "#ef4444"
                       }} />
                       <span className="font-medium">{area.area}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <Badge className={getConditionColor(area.condition)}>{area.condition}</Badge>
                       <span className="text-sm text-muted-foreground">
                         Próx: {area.nextDue}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* PMS.A Tab */}
         <TabsContent value="pms" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Wrench className="h-5 w-5 text-purple-500" />
                 PMS.A - Planned Maintenance System
               </CardTitle>
               <CardDescription>
                 Saúde de equipamentos e manutenção preditiva
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {EQUIPMENT_HEALTH.map(eq => (
                   <div key={eq.equipment} className="p-4 border rounded-lg space-y-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <Gauge className={`h-5 w-5 ${getHealthColor(eq.health)}`} />
                         <div>
                           <p className="font-medium">{eq.equipment}</p>
                           <p className="text-xs text-muted-foreground">
                             Running Hours: {eq.runningHours.toLocaleString()}h
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`text-2xl font-bold ${getHealthColor(eq.health)}`}>
                           {eq.health}%
                         </p>
                         <p className="text-xs text-muted-foreground">Health Score</p>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs mb-1">
                         <span>Próximo Overhaul: {eq.nextOverhaul.toLocaleString()}h</span>
                         <span>{Math.round((eq.runningHours / eq.nextOverhaul) * 100)}%</span>
                       </div>
                       <Progress 
                         value={(eq.runningHours / eq.nextOverhaul) * 100} 
                         className={`h-2 ${eq.status === "warning" ? "[&>div]:bg-amber-500" : ""}`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* DNV Updates Tab */}
         <TabsContent value="dnv" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <FileText className="h-5 w-5 text-blue-500" />
                 DNV 2024 Rule Updates
               </CardTitle>
               <CardDescription>
                 Atualizações de regras de classe aplicáveis
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {DNV_UPDATES.map(update => (
                   <Card key={update.code} className="border-l-4 border-l-blue-500">
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between mb-2">
                         <Badge variant="outline" className="font-mono">{update.code}</Badge>
                         <span className="text-sm text-muted-foreground">
                           Efetivo: {update.effectiveDate}
                         </span>
                       </div>
                       <h4 className="font-semibold">{update.title}</h4>
                       <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }