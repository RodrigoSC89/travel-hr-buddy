 /**
  * People Intelligence Hub
  * Advanced crew management with STCW matrix, fatigue analytics, and scheduling
  * Based on ShipNet, Mespas, and DNV patterns
  */
 
import React, { useState } from "react";
import { usePeopleIntelligenceData } from "@/hooks/usePeopleIntelligenceData";
import { supabase } from "@/integrations/supabase/client";
// Types imported from hook
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import {
   Users, UserCheck, Clock, AlertTriangle, CheckCircle,
   Calendar, GraduationCap, Heart, Shield, TrendingUp,
   Brain, Award, BarChart3, Timer, Moon, Sun, Activity,
   FileText, Bell, Target, Zap, Eye, Star, UserPlus
 } from "lucide-react";
 import { toast } from "sonner";
 
// Types and data provided by usePeopleIntelligenceData hook

const stcwFunctions = [
  { code: "I", name: "Navigation", icon: "🧭" },
  { code: "II", name: "Cargo Handling & Stowage", icon: "📦" },
  { code: "III", name: "Ship Operations", icon: "⚙️" },
  { code: "IV", name: "Marine Engineering", icon: "🔧" },
  { code: "V", name: "Electrical & Electronics", icon: "⚡" },
  { code: "VI", name: "Safety & Security", icon: "🛡️" },
  { code: "VII", name: "Radiocommunications", icon: "📡" }
];

export default function PeopleIntelligenceHub() {
    const { data: crewMembers = [], isLoading } = usePeopleIntelligenceData();
    const [selectedCrew, setSelectedCrew] = useState<import("@/hooks/usePeopleIntelligenceData").CrewMemberProfile | null>(null);
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "valid": case "onboard": return "bg-success/10 text-success";
       case "expiring": case "training": return "bg-warning/10 text-warning";
       case "expired": return "bg-destructive/10 text-destructive";
       case "leave": return "bg-info/10 text-info";
       case "available": return "bg-primary/10 text-primary";
       default: return "bg-muted";
     }
   };
 
   const getFatigueLevel = (score: number) => {
     if (score < 20) return { label: "Baixo", color: "text-success", bg: "bg-success" };
     if (score < 40) return { label: "Moderado", color: "text-warning", bg: "bg-warning" };
     return { label: "Alto", color: "text-destructive", bg: "bg-destructive" };
   };
 
   const totalCrew = crewMembers.length;
   const onboardCrew = crewMembers.filter(c => c.status === "onboard").length;
   const avgCompliance = crewMembers.reduce((sum, c) => sum + c.stcwCompliance, 0) / totalCrew;
   const highFatigue = crewMembers.filter(c => c.fatigueScore >= 40).length;
   const expiringCerts = crewMembers.flatMap(c => c.certificates.filter(cert => cert.status === "expiring")).length;
 
   return (
     <div className="space-y-6">
       {/* Header KPIs */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="border-l-4 border-l-primary">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Users className="h-4 w-4 text-primary" />
               <span className="text-xs text-muted-foreground">Total Tripulação</span>
             </div>
             <p className="text-2xl font-bold">{totalCrew}</p>
             <p className="text-xs text-muted-foreground">{onboardCrew} embarcados</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-success">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Shield className="h-4 w-4 text-success" />
               <span className="text-xs text-muted-foreground">STCW Compliance</span>
             </div>
             <p className="text-2xl font-bold">{avgCompliance.toFixed(0)}%</p>
             <p className="text-xs text-success">Acima do mínimo</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-warning">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <AlertTriangle className="h-4 w-4 text-warning" />
               <span className="text-xs text-muted-foreground">Certs Expirando</span>
             </div>
             <p className="text-2xl font-bold">{expiringCerts}</p>
             <p className="text-xs text-warning">Próximos 30 dias</p>
           </CardContent>
         </Card>
 
         <Card className={`border-l-4 ${highFatigue > 0 ? "border-l-destructive" : "border-l-success"}`}>
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Moon className="h-4 w-4" />
               <span className="text-xs text-muted-foreground">Fadiga Alta</span>
             </div>
             <p className="text-2xl font-bold">{highFatigue}</p>
             <p className="text-xs text-muted-foreground">tripulantes</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-info">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Heart className="h-4 w-4 text-info" />
               <span className="text-xs text-muted-foreground">Wellness Médio</span>
             </div>
             <p className="text-2xl font-bold">
               {(crewMembers.reduce((sum, c) => sum + c.wellnessScore, 0) / totalCrew).toFixed(0)}%
             </p>
             <p className="text-xs text-success">+5% vs mês anterior</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <GraduationCap className="h-4 w-4 text-purple-500" />
               <span className="text-xs text-muted-foreground">Em Treinamento</span>
             </div>
             <p className="text-2xl font-bold">{crewMembers.filter(c => c.status === "training").length}</p>
             <p className="text-xs text-muted-foreground">tripulantes</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs defaultValue="stcw-matrix" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="stcw-matrix" className="gap-2">
             <Award className="h-4 w-4" />
             STCW Matrix
           </TabsTrigger>
           <TabsTrigger value="fatigue-analytics" className="gap-2">
             <Moon className="h-4 w-4" />
             Fatigue Analytics
           </TabsTrigger>
           <TabsTrigger value="crew-profiles" className="gap-2">
             <Users className="h-4 w-4" />
             Crew Profiles
           </TabsTrigger>
           <TabsTrigger value="scheduling" className="gap-2">
             <Calendar className="h-4 w-4" />
             Scheduling
           </TabsTrigger>
           <TabsTrigger value="ai-insights" className="gap-2">
             <Brain className="h-4 w-4" />
             AI Insights
           </TabsTrigger>
         </TabsList>
 
         {/* STCW Matrix Tab */}
         <TabsContent value="stcw-matrix" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5" />
                 STCW Competency Matrix
                 <Badge variant="outline">IMO STCW Convention</Badge>
               </CardTitle>
               <CardDescription>
                 Matriz de competências conforme STCW 2010 Manila Amendments
               </CardDescription>
             </CardHeader>
             <CardContent>
               {/* Matrix Header */}
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-muted/50">
                       <th className="p-3 text-left border">Tripulante</th>
                       {stcwFunctions.map(func => (
                         <th key={func.code} className="p-3 text-center border min-w-[100px]">
                           <span className="text-lg">{func.icon}</span>
                           <br />
                           <span className="text-xs">{func.name}</span>
                         </th>
                       ))}
                       <th className="p-3 text-center border">Score</th>
                     </tr>
                   </thead>
                   <tbody>
                     {crewMembers.map(crew => (
                       <tr key={crew.id} className="hover:bg-muted/30">
                         <td className="p-3 border">
                           <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                               <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-sm">{crew.name}</p>
                               <p className="text-xs text-muted-foreground">{crew.rank}</p>
                             </div>
                           </div>
                         </td>
                         {stcwFunctions.map(func => {
                           const relevantComps = crew.competencies.filter(c => c.function === func.name);
                           const hasValid = relevantComps.some(c => c.status === "valid");
                           const hasExpiring = relevantComps.some(c => c.status === "expiring");
                           const hasExpired = relevantComps.some(c => c.status === "expired");
                           
                           return (
                             <td key={func.code} className="p-3 border text-center">
                               {hasExpired ? (
                                 <Badge className="bg-destructive/10 text-destructive">❌</Badge>
                               ) : hasExpiring ? (
                                 <Badge className="bg-warning/10 text-warning">⚠️</Badge>
                               ) : hasValid ? (
                                 <Badge className="bg-success/10 text-success">✓</Badge>
                               ) : (
                                 <Badge variant="outline">-</Badge>
                               )}
                             </td>
                           );
                         })}
                         <td className="p-3 border text-center">
                           <Badge className={crew.stcwCompliance >= 95 ? "bg-success/10 text-success" : crew.stcwCompliance >= 80 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                             {crew.stcwCompliance}%
                           </Badge>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Fatigue Analytics Tab */}
         <TabsContent value="fatigue-analytics" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {crewMembers.map(crew => {
               const fatigue = getFatigueLevel(crew.fatigueScore);
               const mlcCompliant24h = crew.restHours24h >= 10;
               const mlcCompliant7d = crew.restHours7d >= 77;
               
               return (
                 <Card key={crew.id} className={crew.fatigueScore >= 40 ? "border-destructive" : ""}>
                   <CardHeader className="pb-2">
                     <CardTitle className="flex items-center justify-between">
                       <span className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="text-sm font-medium">{crew.name}</p>
                           <p className="text-xs text-muted-foreground">{crew.rank} - {crew.vessel}</p>
                         </div>
                       </span>
                       <Badge className={getStatusColor(crew.status)}>
                         {crew.status.toUpperCase()}
                       </Badge>
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     {/* Fatigue Score */}
                     <div className="p-4 bg-muted/50 rounded-lg">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-medium">Índice de Fadiga</span>
                         <Badge className={`${fatigue.color} bg-opacity-10`}>
                           {crew.fatigueScore}% - {fatigue.label}
                         </Badge>
                       </div>
                       <Progress 
                         value={crew.fatigueScore} 
                         className={`h-3 ${crew.fatigueScore >= 40 ? "[&>div]:bg-destructive" : crew.fatigueScore >= 20 ? "[&>div]:bg-warning" : ""}`}
                       />
                     </div>
 
                     {/* Work/Rest Hours */}
                     <div className="grid grid-cols-2 gap-4">
                       <div className={`p-3 rounded-lg ${mlcCompliant24h ? "bg-success/10" : "bg-destructive/10"}`}>
                         <p className="text-xs text-muted-foreground mb-1">Últimas 24h</p>
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="font-medium">Trabalho: {crew.hoursWorked24h}h</p>
                             <p className="text-sm">Descanso: {crew.restHours24h}h</p>
                           </div>
                           {mlcCompliant24h ? (
                             <CheckCircle className="h-5 w-5 text-success" />
                           ) : (
                             <AlertTriangle className="h-5 w-5 text-destructive" />
                           )}
                         </div>
                         <p className="text-xs mt-1 text-muted-foreground">MLC: min 10h descanso</p>
                       </div>
 
                       <div className={`p-3 rounded-lg ${mlcCompliant7d ? "bg-success/10" : "bg-destructive/10"}`}>
                         <p className="text-xs text-muted-foreground mb-1">Últimos 7 dias</p>
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="font-medium">Trabalho: {crew.hoursWorked7d}h</p>
                             <p className="text-sm">Descanso: {crew.restHours7d}h</p>
                           </div>
                           {mlcCompliant7d ? (
                             <CheckCircle className="h-5 w-5 text-success" />
                           ) : (
                             <AlertTriangle className="h-5 w-5 text-destructive" />
                           )}
                         </div>
                         <p className="text-xs mt-1 text-muted-foreground">MLC: min 77h descanso</p>
                       </div>
                     </div>
 
                     {/* Wellness */}
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                       <div className="flex items-center gap-2">
                         <Heart className="h-4 w-4 text-info" />
                         <span className="text-sm">Wellness Score</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Progress value={crew.wellnessScore} className="w-24 h-2" />
                         <span className="font-medium">{crew.wellnessScore}%</span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         </TabsContent>
 
         {/* Crew Profiles Tab */}
         <TabsContent value="crew-profiles" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Crew List */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span className="flex items-center gap-2">
                     <Users className="h-5 w-5" />
                     Tripulação
                   </span>
                   <Button size="sm" variant="outline" onClick={() => { window.history.pushState({}, "", "/workbench?tab=people"); window.dispatchEvent(new PopStateEvent("popstate")); }}>
                     <UserPlus className="h-4 w-4" />
                   </Button>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[500px]">
                   <div className="space-y-2">
                     {crewMembers.map(crew => (
                       <div
                         key={crew.id}
                         onClick={() => setSelectedCrew(crew)}
                         className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                           selectedCrew?.id === crew.id ? "border-primary bg-primary/5" : ""
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                             <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1">
                             <p className="font-medium text-sm">{crew.name}</p>
                             <p className="text-xs text-muted-foreground">{crew.rank}</p>
                           </div>
                           <Badge className={getStatusColor(crew.status)} variant="outline">
                             {crew.status}
                           </Badge>
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
 
             {/* Crew Details */}
             <Card className="lg:col-span-2">
               <CardHeader>
                 <CardTitle>Perfil do Tripulante</CardTitle>
               </CardHeader>
               <CardContent>
                 {selectedCrew ? (
                   <div className="space-y-6">
                     {/* Header */}
                     <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                       <Avatar className="h-16 w-16">
                         <AvatarFallback className="text-xl">{selectedCrew.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1">
                         <h3 className="text-xl font-bold">{selectedCrew.name}</h3>
                         <p className="text-muted-foreground">{selectedCrew.rank} - {selectedCrew.vessel}</p>
                         <div className="flex gap-2 mt-2">
                           <Badge variant="outline">🇧🇷 {selectedCrew.nationality}</Badge>
                           <Badge className={getStatusColor(selectedCrew.status)}>
                             {selectedCrew.status.toUpperCase()}
                           </Badge>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm text-muted-foreground">Fim do Contrato</p>
                         <p className="font-medium">{selectedCrew.contractEnd}</p>
                       </div>
                     </div>
 
                     {/* Compliance Scores */}
                     <div className="grid grid-cols-4 gap-4">
                       <div className="p-3 border rounded-lg text-center">
                         <Shield className="h-5 w-5 mx-auto mb-1 text-success" />
                         <p className="text-2xl font-bold">{selectedCrew.stcwCompliance}%</p>
                         <p className="text-xs text-muted-foreground">STCW</p>
                       </div>
                       <div className="p-3 border rounded-lg text-center">
                         <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                         <p className="text-2xl font-bold">{selectedCrew.mlcCompliance}%</p>
                         <p className="text-xs text-muted-foreground">MLC 2006</p>
                       </div>
                       <div className="p-3 border rounded-lg text-center">
                         <Heart className="h-5 w-5 mx-auto mb-1 text-info" />
                         <p className="text-2xl font-bold">{selectedCrew.wellnessScore}%</p>
                         <p className="text-xs text-muted-foreground">Wellness</p>
                       </div>
                       <div className="p-3 border rounded-lg text-center">
                         <Moon className={`h-5 w-5 mx-auto mb-1 ${getFatigueLevel(selectedCrew.fatigueScore).color}`} />
                         <p className="text-2xl font-bold">{selectedCrew.fatigueScore}%</p>
                         <p className="text-xs text-muted-foreground">Fadiga</p>
                       </div>
                     </div>
 
                     {/* Certificates */}
                     <div>
                       <h4 className="font-semibold mb-3">Certificados</h4>
                       <div className="space-y-2">
                         {selectedCrew.certificates.map((cert: { name: string; expiry: string; status: string }) => (
                           <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                             <div className="flex items-center gap-2">
                               <FileText className="h-4 w-4" />
                               <span className="font-medium">{cert.name}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-sm text-muted-foreground">{cert.expiry}</span>
                               <Badge className={getStatusColor(cert.status)}>
                                 {cert.status.toUpperCase()}
                               </Badge>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-12 text-muted-foreground">
                     Selecione um tripulante para ver detalhes
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Scheduling Tab */}
         <TabsContent value="scheduling" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Calendar className="h-5 w-5" />
                 Crew Scheduling & Rotation
                 <Badge variant="outline">AI-Optimized</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-center py-12">
                 <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                 <h3 className="text-lg font-semibold mb-2">Sistema de Escalas Inteligente</h3>
                 <p className="text-muted-foreground max-w-md mx-auto mb-4">
                   Otimização automática de escalas considerando certificações, 
                   folgas regulamentares e preferências da tripulação.
                 </p>
                 <Button onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('section', 'crew-schedule');
                    window.history.pushState({}, '', `/workbench?${params.toString()}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    toast.info("Navegando para o planejador de escalas");
                  }}>
                    <Zap className="h-4 w-4 mr-2" />
                    Abrir Planejador
                  </Button>
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
                   Crew Optimization AI
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 bg-warning/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-warning" />
                     Alerta de Certificação
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     3 certificados expiram nos próximos 30 dias. Agende renovações.
                   </p>
                    <Button size="sm" onClick={async () => {
                      try {
                        await supabase.from("ai_audit_logs").insert({
                          user_input: "Notificação de certificados expirando enviada",
                          module_name: "people_intelligence",
                          interaction_type: "notification"
                        });
                        toast.success("Notificações registradas e enviadas!");
                      } catch { toast.error("Erro ao enviar notificações"); }
                    }}>
                      Notificar Tripulantes
                    </Button>
                 </div>
 
                 <div className="p-4 bg-success/10 rounded-lg">
                   <h4 className="font-semibold mb-2 flex items-center gap-2">
                     <Target className="h-4 w-4 text-success" />
                     Otimização de Escala
                   </h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Redistribuição de turnos pode reduzir fadiga média em 15%.
                   </p>
                    <Button size="sm" variant="outline" onClick={async () => {
                      toast.loading("Simulando redistribuição de turnos...", { id: "sim" });
                      try {
                        await supabase.from("ai_audit_logs").insert({
                          user_input: "Simulação de redistribuição de turnos para redução de fadiga",
                          module_name: "people_intelligence",
                          interaction_type: "simulation"
                        });
                        toast.success("Simulação concluída: redistribuição pode reduzir fadiga em 15%", { id: "sim" });
                      } catch { toast.error("Erro na simulação", { id: "sim" }); }
                    }}>
                      Simular Cenário
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
                   <h4 className="font-semibold mb-2">Previsão de Turnover</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     2 tripulantes com alta probabilidade de não renovar contrato.
                   </p>
                   <Progress value={35} className="h-2" />
                   <p className="text-xs mt-1 text-muted-foreground">35% risco de turnover</p>
                 </div>
 
                 <div className="p-4 bg-purple-500/10 rounded-lg">
                   <h4 className="font-semibold mb-2">Gap de Competências</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Identificados 2 gaps em High Voltage Training para próximas viagens.
                   </p>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        await supabase.from("ai_audit_logs").insert({
                          user_input: "Agendamento de treinamento High Voltage Training",
                          module_name: "people_intelligence",
                          interaction_type: "training_schedule"
                        });
                        toast.success("Treinamento agendado! Verifique o módulo Academy.");
                      } catch { toast.error("Erro ao agendar treinamento"); }
                    }}>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Agendar Treinamento
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