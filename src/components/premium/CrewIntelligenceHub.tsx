 /**
  * Crew Intelligence Hub Component
  * Based on best practices from ShipNet Crewing, AMOS Crewing
  * Features: STCW/MLC compliance, wellness monitoring, self-service portal
  */
 
 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { 
   Users, Award, FileCheck, AlertTriangle, Heart, Clock,
   Calendar, GraduationCap, Briefcase, Smile, Frown, Meh,
   TrendingUp, Brain, Shield, Ship, CheckCircle2, Timer
 } from "lucide-react";
 
 interface CrewMember {
   id: string;
   name: string;
   rank: string;
   vessel: string;
   status: "onboard" | "onleave" | "training" | "available";
   stcwCompliance: number;
   mlcCompliance: number;
   wellnessScore: number;
   fatigueRisk: "low" | "medium" | "high";
   hoursWorked: number;
   restHours: number;
   expiringCerts: number;
   nextLeave: string;
   avatar?: string;
 }
 
 const mockCrew: CrewMember[] = [
   {
     id: "1", name: "Carlos Silva", rank: "Master", vessel: "MV Atlantic Explorer",
     status: "onboard", stcwCompliance: 100, mlcCompliance: 98, wellnessScore: 85,
     fatigueRisk: "low", hoursWorked: 72, restHours: 96, expiringCerts: 0, nextLeave: "2024-03-15"
   },
   {
     id: "2", name: "João Pereira", rank: "Chief Officer", vessel: "MV Atlantic Explorer",
     status: "onboard", stcwCompliance: 95, mlcCompliance: 92, wellnessScore: 68,
     fatigueRisk: "medium", hoursWorked: 84, restHours: 84, expiringCerts: 2, nextLeave: "2024-02-28"
   },
   {
     id: "3", name: "Ana Costa", rank: "Chief Engineer", vessel: "MV Pacific Voyager",
     status: "onboard", stcwCompliance: 88, mlcCompliance: 85, wellnessScore: 52,
     fatigueRisk: "high", hoursWorked: 91, restHours: 77, expiringCerts: 3, nextLeave: "2024-02-20"
   },
   {
     id: "4", name: "Pedro Lima", rank: "2nd Officer", vessel: "MV Nordic Queen",
     status: "training", stcwCompliance: 100, mlcCompliance: 100, wellnessScore: 90,
     fatigueRisk: "low", hoursWorked: 40, restHours: 128, expiringCerts: 0, nextLeave: "2024-04-01"
   },
 ];
 
 export default function CrewIntelligenceHub() {
   const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
 
   const onboardCount = mockCrew.filter(c => c.status === "onboard").length;
   const avgCompliance = mockCrew.reduce((sum, c) => sum + c.stcwCompliance, 0) / mockCrew.length;
   const fatigueAlerts = mockCrew.filter(c => c.fatigueRisk === "high").length;
   const expiringCerts = mockCrew.reduce((sum, c) => sum + c.expiringCerts, 0);
 
   const getStatusBadge = (status: string) => {
     const config: Record<string, { color: string; label: string }> = {
       onboard: { color: "bg-success/10 text-success border-success/30", label: "A Bordo" },
       onleave: { color: "bg-info/10 text-info border-info/30", label: "Em Licença" },
       training: { color: "bg-primary/10 text-primary border-primary/30", label: "Treinamento" },
       available: { color: "bg-warning/10 text-warning border-warning/30", label: "Disponível" },
     };
     const { color, label } = config[status] || config.available;
     return <Badge className={`${color} border`}>{label}</Badge>;
   };
 
   const getFatigueConfig = (risk: string) => {
     const config: Record<string, { color: string; icon: typeof Smile; label: string }> = {
       low: { color: "text-success", icon: Smile, label: "Baixo" },
       medium: { color: "text-warning", icon: Meh, label: "Médio" },
       high: { color: "text-destructive", icon: Frown, label: "Alto" },
     };
     return config[risk] || config.low;
   };
 
   const getComplianceColor = (score: number) => {
     if (score >= 95) return "text-success";
     if (score >= 80) return "text-warning";
     return "text-destructive";
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4 text-center">
             <Users className="h-5 w-5 text-primary mx-auto mb-2" />
             <p className="text-2xl font-bold">{mockCrew.length}</p>
             <p className="text-xs text-muted-foreground">Total Tripulação</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4 text-center">
             <Ship className="h-5 w-5 text-success mx-auto mb-2" />
             <p className="text-2xl font-bold">{onboardCount}</p>
             <p className="text-xs text-muted-foreground">A Bordo</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-info/10 to-info/5">
           <CardContent className="p-4 text-center">
             <Award className="h-5 w-5 text-info mx-auto mb-2" />
             <p className="text-2xl font-bold">{avgCompliance.toFixed(0)}%</p>
             <p className="text-xs text-muted-foreground">STCW Compliance</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
           <CardContent className="p-4 text-center">
             <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
             <p className="text-2xl font-bold">{fatigueAlerts}</p>
             <p className="text-xs text-muted-foreground">Risco Fadiga</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4 text-center">
             <FileCheck className="h-5 w-5 text-warning mx-auto mb-2" />
             <p className="text-2xl font-bold">{expiringCerts}</p>
             <p className="text-xs text-muted-foreground">Certs Expirando</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
           <CardContent className="p-4 text-center">
             <Heart className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">78%</p>
             <p className="text-xs text-muted-foreground">Wellness Médio</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Fatigue Alert */}
       {fatigueAlerts > 0 && (
         <Card className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-transparent">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-destructive/10 animate-pulse">
                   <Heart className="h-5 w-5 text-destructive" />
                 </div>
                 <div>
                   <p className="font-semibold text-destructive">⚠️ Alerta de Fadiga (MLC 2006)</p>
                   <p className="text-sm text-muted-foreground">
                     {fatigueAlerts} tripulante(s) com alto risco de fadiga. Verificar horas de descanso.
                   </p>
                 </div>
               </div>
               <Button size="sm" variant="destructive" className="gap-2">
                 <Clock className="h-4 w-4" />
                 Revisar Escalas
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Crew List */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Users className="h-5 w-5 text-primary" />
                 Gestão de Tripulação
               </CardTitle>
               <CardDescription>Monitoramento de compliance, bem-estar e fadiga</CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[450px]">
                 <div className="space-y-4">
                   {mockCrew.map((crew) => {
                     const fatigueConfig = getFatigueConfig(crew.fatigueRisk);
                     const FatigueIcon = fatigueConfig.icon;
                     
                     return (
                       <div 
                         key={crew.id} 
                         className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                           selectedCrew?.id === crew.id ? "ring-2 ring-primary" : ""
                         } ${crew.fatigueRisk === "high" ? "border-destructive/50 bg-destructive/5" : ""}`}
                         onClick={() => setSelectedCrew(crew)}
                       >
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10">
                               <AvatarImage src={crew.avatar} />
                               <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-semibold">{crew.name}</p>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <span>{crew.rank}</span>
                                 <span>•</span>
                                 <Ship className="h-3 w-3" />
                                 {crew.vessel}
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {getStatusBadge(crew.status)}
                             <div className={`p-1 rounded-full ${fatigueConfig.color}`}>
                               <FatigueIcon className="h-4 w-4" />
                             </div>
                           </div>
                         </div>
 
                         {/* Compliance & Wellness */}
                         <div className="grid grid-cols-4 gap-4 mt-3">
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${getComplianceColor(crew.stcwCompliance)}`}>
                               {crew.stcwCompliance}%
                             </p>
                             <p className="text-xs text-muted-foreground">STCW</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${getComplianceColor(crew.mlcCompliance)}`}>
                               {crew.mlcCompliance}%
                             </p>
                             <p className="text-xs text-muted-foreground">MLC</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className="text-lg font-bold">{crew.wellnessScore}%</p>
                             <p className="text-xs text-muted-foreground">Bem-estar</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${crew.hoursWorked > 84 ? "text-destructive" : ""}`}>
                               {crew.hoursWorked}h
                             </p>
                             <p className="text-xs text-muted-foreground">Trabalhadas</p>
                           </div>
                         </div>
 
                         {/* Alerts */}
                         {(crew.expiringCerts > 0 || crew.fatigueRisk === "high") && (
                           <div className="flex gap-2 mt-3">
                             {crew.expiringCerts > 0 && (
                               <Badge variant="outline" className="text-warning border-warning/30">
                                 <AlertTriangle className="h-3 w-3 mr-1" />
                                 {crew.expiringCerts} cert(s) expirando
                               </Badge>
                             )}
                             {crew.fatigueRisk === "high" && (
                               <Badge variant="outline" className="text-destructive border-destructive/30">
                                 <Heart className="h-3 w-3 mr-1" />
                                 Risco de Fadiga
                               </Badge>
                             )}
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </div>
 
         {/* Crew Details */}
         <div>
           {selectedCrew ? (
             <Card>
               <CardHeader>
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={selectedCrew.avatar} />
                     <AvatarFallback>{selectedCrew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                   </Avatar>
                   <div>
                     <CardTitle className="text-base">{selectedCrew.name}</CardTitle>
                     <CardDescription>{selectedCrew.rank}</CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Compliance Gauges */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                     <p className={`text-2xl font-bold ${getComplianceColor(selectedCrew.stcwCompliance)}`}>
                       {selectedCrew.stcwCompliance}%
                     </p>
                     <p className="text-xs text-muted-foreground">STCW</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Award className="h-5 w-5 mx-auto mb-1 text-info" />
                     <p className={`text-2xl font-bold ${getComplianceColor(selectedCrew.mlcCompliance)}`}>
                       {selectedCrew.mlcCompliance}%
                     </p>
                     <p className="text-xs text-muted-foreground">MLC 2006</p>
                   </div>
                 </div>
 
                 {/* Work/Rest Hours */}
                 <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                   <p className="font-medium text-sm mb-3">Horas de Trabalho/Descanso (7 dias)</p>
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span>Horas Trabalhadas</span>
                       <span className={`font-bold ${selectedCrew.hoursWorked > 84 ? "text-destructive" : ""}`}>
                         {selectedCrew.hoursWorked}h / 84h máx
                       </span>
                     </div>
                     <Progress value={(selectedCrew.hoursWorked / 84) * 100} className="h-2" />
                     <div className="flex justify-between text-sm">
                       <span>Horas de Descanso</span>
                       <span className={`font-bold ${selectedCrew.restHours < 77 ? "text-warning" : "text-success"}`}>
                         {selectedCrew.restHours}h / 77h mín
                       </span>
                     </div>
                     <Progress value={(selectedCrew.restHours / 168) * 100} className="h-2" />
                   </div>
                 </div>
 
                 {/* Wellness & Fatigue */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Heart className="h-5 w-5 mx-auto mb-1 text-pink-500" />
                     <p className="text-xl font-bold">{selectedCrew.wellnessScore}%</p>
                     <p className="text-xs text-muted-foreground">Bem-estar</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Timer className="h-5 w-5 mx-auto mb-1" />
                     <p className={`text-xl font-bold ${getFatigueConfig(selectedCrew.fatigueRisk).color}`}>
                       {getFatigueConfig(selectedCrew.fatigueRisk).label}
                     </p>
                     <p className="text-xs text-muted-foreground">Risco Fadiga</p>
                   </div>
                 </div>
 
                 {/* Next Leave */}
                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                   <span className="flex items-center gap-2 text-sm">
                     <Calendar className="h-4 w-4" />
                     Próxima Licença
                   </span>
                   <span className="font-bold">{new Date(selectedCrew.nextLeave).toLocaleDateString("pt-BR")}</span>
                 </div>
 
                 <div className="flex gap-2">
                   <Button className="flex-1" size="sm">
                     <GraduationCap className="h-4 w-4 mr-2" />
                     Treinamentos
                   </Button>
                   <Button variant="outline" size="sm">
                     <FileCheck className="h-4 w-4" />
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="p-8 text-center text-muted-foreground">
                 <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                 <p>Selecione um tripulante para ver detalhes</p>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>
   );
 }