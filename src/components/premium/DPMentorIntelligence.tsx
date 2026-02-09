 /**
  * DP Mentor Intelligence Hub
  * Advanced DP training management based on NI/IMCA 2024 standards
  * Features: CPD tracking, competency matrix, simulator management, NI certification
  */
 
  import React, { useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Progress } from "@/components/ui/progress";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import {
    Anchor, Brain, GraduationCap, Award, Target, Shield, Clock,
    CheckCircle, AlertTriangle, TrendingUp, Users, Calendar,
    BookOpen, PlayCircle, FileText, Star, Zap, BarChart3,
    RefreshCw, Download, Eye, Sparkles, Timer, Radio,
    Compass, Navigation, Waves, Activity, Loader2
  } from "lucide-react";
  import { toast } from "sonner";
  import { useDPMentorData } from "@/hooks/useDPMentorData";
 
 // NI CPD Requirement by Year (2024-2028)
 const CPD_REQUIREMENTS = [
   { year: 2024, modules: 2, description: "1 ano de CPD + exame online" },
   { year: 2025, modules: 4, description: "2 anos de CPD + exame online" },
   { year: 2026, modules: 6, description: "3 anos de CPD + exame online" },
   { year: 2027, modules: 8, description: "4 anos de CPD + exame online" },
   { year: 2028, modules: 10, description: "5 anos de CPD + exame online" },
 ];
 
 // IMCA M117 Rev.3 Key Personnel Roles
 const KEY_DP_PERSONNEL = [
   { role: "Master/OIM", code: "M117-5.1", requirements: ["DP Unlimited", "GMDSS GOC", "Leadership"] },
   { role: "Senior DPO (SDPO)", code: "M117-5.2", requirements: ["DP Unlimited", "3+ years experience", "Mentoring skills"] },
   { role: "DP Operator (DPO)", code: "M117-5.3", requirements: ["NI DP Certificate", "150 days sea time", "STCW II/1"] },
   { role: "Chief Engineer", code: "M117-5.4", requirements: ["CoC III/2", "DP Systems knowledge", "FMEA understanding"] },
   { role: "DP E/E Technician", code: "M117-5.7", requirements: ["ETO Certificate", "DP maintenance", "Vendor training"] },
 ];
 
 // Competency Matrix based on IMCA standards
 const COMPETENCY_MATRIX = [
   { category: "DP Fundamentals", items: [
     { skill: "6 Degrees of Freedom", level: 4, maxLevel: 5 },
     { skill: "Environmental Forces", level: 5, maxLevel: 5 },
     { skill: "Control Modes (Auto/Manual)", level: 4, maxLevel: 5 },
     { skill: "Model Verification", level: 3, maxLevel: 5 },
   ]},
   { category: "Position Reference Systems", items: [
     { skill: "GNSS/DGNSS/RTK", level: 5, maxLevel: 5 },
     { skill: "Acoustic (HPR/USBL/LBL)", level: 4, maxLevel: 5 },
     { skill: "Laser (Fanbeam/CyScan)", level: 3, maxLevel: 5 },
     { skill: "Taut Wire", level: 4, maxLevel: 5 },
   ]},
   { category: "Propulsion & Thrusters", items: [
     { skill: "Azimuth Thrusters (Z/L-drive)", level: 4, maxLevel: 5 },
     { skill: "Tunnel Thrusters", level: 5, maxLevel: 5 },
     { skill: "Thrust Allocation", level: 4, maxLevel: 5 },
     { skill: "Power Management", level: 3, maxLevel: 5 },
   ]},
   { category: "Redundancy & Safety", items: [
     { skill: "DP Class Requirements", level: 5, maxLevel: 5 },
     { skill: "WCFDI Understanding", level: 4, maxLevel: 5 },
     { skill: "FMEA/FMECA Analysis", level: 3, maxLevel: 5 },
     { skill: "CAMO vs TAM", level: 4, maxLevel: 5 },
   ]},
   { category: "Emergency Procedures", items: [
     { skill: "Drive-off Response", level: 4, maxLevel: 5 },
     { skill: "Drift-off Response", level: 4, maxLevel: 5 },
     { skill: "EDS Activation", level: 5, maxLevel: 5 },
     { skill: "Blackout Recovery", level: 3, maxLevel: 5 },
   ]},
 ];
 
 // Training Personnel (DPOs)
 const TRAINING_PERSONNEL = [
   { 
     id: "1", name: "Carlos Silva", role: "DPO", certLevel: "Unlimited",
     niCertNumber: "NI-DP-2021-4521", expiryDate: "2026-03-15",
     seaTime: 245, requiredSeaTime: 150, cpdModules: 4, cpdRequired: 6,
     simulatorHours: 120, status: "active", vessel: "MV Atlântico Sul"
   },
   { 
     id: "2", name: "Ana Rodrigues", role: "SDPO", certLevel: "Unlimited",
     niCertNumber: "NI-DP-2019-3287", expiryDate: "2024-11-20",
     seaTime: 520, requiredSeaTime: 150, cpdModules: 2, cpdRequired: 6,
     simulatorHours: 280, status: "renewal_due", vessel: "MV Ocean Pride"
   },
   { 
     id: "3", name: "Ricardo Santos", role: "DPO Trainee", certLevel: "Limited",
     niCertNumber: "NI-DP-2023-7891", expiryDate: "2028-06-01",
     seaTime: 85, requiredSeaTime: 150, cpdModules: 1, cpdRequired: 2,
     simulatorHours: 60, status: "in_training", vessel: "MV Pacific Star"
   },
   { 
     id: "4", name: "Marina Costa", role: "DPO", certLevel: "Unlimited",
     niCertNumber: "NI-DP-2020-5632", expiryDate: "2025-08-10",
     seaTime: 380, requiredSeaTime: 150, cpdModules: 5, cpdRequired: 6,
     simulatorHours: 200, status: "active", vessel: "MV Deep Explorer"
   },
 ];
 
 // Simulator Sessions
 const SIMULATOR_SESSIONS = [
   { id: "1", type: "Full Mission Bridge", scenario: "DP Offshore Loading", personnel: ["Carlos Silva"], date: "2024-02-01", duration: 4, score: 92, status: "completed" },
   { id: "2", type: "Desktop Drill", scenario: "Thruster Failure Response", personnel: ["Ana Rodrigues", "Ricardo Santos"], date: "2024-02-03", duration: 2, score: 88, status: "completed" },
   { id: "3", type: "Touch Drill", scenario: "EDS Activation", personnel: ["Marina Costa"], date: "2024-02-05", duration: 1, score: 95, status: "completed" },
   { id: "4", type: "Full Mission Bridge", scenario: "Multi-Failure Cascade", personnel: ["Carlos Silva", "Ana Rodrigues"], date: "2024-02-10", duration: 6, score: null, status: "scheduled" },
 ];
 
 // IMCA M273 Drill Types
 const DRILL_TYPES = [
   { type: "Live Drill", description: "Real equipment, controlled conditions", frequency: "Monthly", lastPerformed: "2024-01-28" },
   { type: "Desktop Exercise", description: "Tabletop discussion and planning", frequency: "Weekly", lastPerformed: "2024-02-02" },
   { type: "Touch Drill", description: "Physical familiarization, no operation", frequency: "Daily", lastPerformed: "2024-02-04" },
   { type: "Integrated Scenario", description: "Bridge + Engine Room linked", frequency: "Quarterly", lastPerformed: "2023-12-15" },
 ];
 
  export default function DPMentorIntelligence() {
    const [activeTab, setActiveTab] = useState("cpd");
    const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(null);
    const dpData = useDPMentorData();

    // Use real data from hook, fallback to static mock for reference data only
    const ACTIVE_PERSONNEL = dpData.personnel.length > 0 ? dpData.personnel : TRAINING_PERSONNEL;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
        case "renewal_due": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        case "in_training": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        default: return "bg-muted text-muted-foreground";
      }
    };
  
    const renewalsDue = dpData.personnel.length > 0 ? dpData.renewalsDue : TRAINING_PERSONNEL.filter(p => p.status === "renewal_due").length;
    const avgCPDProgress = dpData.personnel.length > 0 ? dpData.avgCPDProgress : Math.round(TRAINING_PERSONNEL.reduce((acc, p) => acc + (p.cpdModules / p.cpdRequired) * 100, 0) / TRAINING_PERSONNEL.length);
    const totalSimulatorHours = dpData.personnel.length > 0 ? dpData.totalSimulatorHours : TRAINING_PERSONNEL.reduce((acc, p) => acc + p.simulatorHours, 0);
    const ACTIVE_SIMULATOR = dpData.trainingRecords.length > 0 ? dpData.trainingRecords : SIMULATOR_SESSIONS;
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">DPOs Certificados</p>
                 <p className="text-2xl font-bold">{ACTIVE_PERSONNEL.length}</p>
                 <p className="text-xs text-green-500 flex items-center gap-1">
                   <CheckCircle className="h-3 w-3" /> NI Standards
                 </p>
               </div>
               <Anchor className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-amber-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Renovações Pendentes</p>
                 <p className="text-2xl font-bold">{renewalsDue}</p>
                 <p className="text-xs text-amber-500 flex items-center gap-1">
                   <AlertTriangle className="h-3 w-3" /> Próximos 90 dias
                 </p>
               </div>
               <Calendar className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-green-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Progresso CPD Médio</p>
                 <p className="text-2xl font-bold">{avgCPDProgress}%</p>
                 <Progress value={avgCPDProgress} className="h-1 mt-1" />
               </div>
               <GraduationCap className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Horas Simulador</p>
                 <p className="text-2xl font-bold">{totalSimulatorHours}h</p>
                 <p className="text-xs text-purple-500 flex items-center gap-1">
                   <PlayCircle className="h-3 w-3" /> Total equipe
                 </p>
               </div>
               <Radio className="h-8 w-8 text-purple-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="cpd" className="flex items-center gap-2">
             <GraduationCap className="h-4 w-4" />
             CPD Tracking
           </TabsTrigger>
           <TabsTrigger value="competency" className="flex items-center gap-2">
             <Target className="h-4 w-4" />
             Matriz IMCA
           </TabsTrigger>
           <TabsTrigger value="personnel" className="flex items-center gap-2">
             <Users className="h-4 w-4" />
             Key Personnel
           </TabsTrigger>
           <TabsTrigger value="simulator" className="flex items-center gap-2">
             <PlayCircle className="h-4 w-4" />
             Simulador
           </TabsTrigger>
           <TabsTrigger value="drills" className="flex items-center gap-2">
             <Shield className="h-4 w-4" />
             Drills M273
           </TabsTrigger>
         </TabsList>
 
         {/* CPD Tracking Tab */}
         <TabsContent value="cpd" className="space-y-6">
           {/* NI CPD Requirements Timeline */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5 text-blue-500" />
                 NI CPD Requirements (2024-2028)
               </CardTitle>
               <CardDescription>
                 Requisitos de Desenvolvimento Profissional Contínuo do Nautical Institute
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="relative">
                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                 <div className="space-y-6">
                   {CPD_REQUIREMENTS.map((req, index) => (
                     <div key={req.year} className="relative pl-10">
                       <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                         req.year === 2024 ? "bg-blue-500 text-white" : "bg-muted"
                       }`}>
                         {req.year === 2024 ? <CheckCircle className="h-3 w-3" /> : index + 1}
                       </div>
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="font-semibold">{req.year}</p>
                           <p className="text-sm text-muted-foreground">{req.description}</p>
                         </div>
                         <Badge variant="outline">{req.modules} módulos</Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Personnel CPD Status */}
           <Card>
             <CardHeader>
               <CardTitle>Status CPD por Operador</CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[300px]">
                 <div className="space-y-4">
                   {ACTIVE_PERSONNEL.map(person => (
                     <div key={person.id} className="p-4 border rounded-lg space-y-3">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <Anchor className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                             <p className="font-medium">{person.name}</p>
                             <p className="text-sm text-muted-foreground">
                               {person.role} • {person.vessel}
                             </p>
                           </div>
                         </div>
                         <Badge className={getStatusColor(person.status)}>
                           {person.status === "active" ? "Ativo" : 
                            person.status === "renewal_due" ? "Renovação Pendente" : "Em Treinamento"}
                         </Badge>
                       </div>
 
                       <div className="grid grid-cols-3 gap-4 text-sm">
                         <div>
                           <p className="text-muted-foreground">Sea Time</p>
                           <p className="font-medium">{person.seaTime} / {person.requiredSeaTime} dias</p>
                           <Progress value={(person.seaTime / person.requiredSeaTime) * 100} className="h-1 mt-1" />
                         </div>
                         <div>
                           <p className="text-muted-foreground">CPD Modules</p>
                           <p className="font-medium">{person.cpdModules} / {person.cpdRequired}</p>
                           <Progress value={(person.cpdModules / person.cpdRequired) * 100} className="h-1 mt-1" />
                         </div>
                         <div>
                           <p className="text-muted-foreground">Simulador</p>
                           <p className="font-medium">{person.simulatorHours}h</p>
                           <Progress value={Math.min((person.simulatorHours / 200) * 100, 100)} className="h-1 mt-1" />
                         </div>
                       </div>
 
                       <div className="flex items-center justify-between text-xs">
                         <span className="text-muted-foreground">NI Cert: {person.niCertNumber}</span>
                         <span className={person.status === "renewal_due" ? "text-amber-500" : "text-muted-foreground"}>
                           Expira: {person.expiryDate}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Competency Matrix Tab */}
         <TabsContent value="competency" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Target className="h-5 w-5 text-green-500" />
                 IMCA M117 Competency Matrix
               </CardTitle>
               <CardDescription>
                 Matriz de competências baseada no IMCA M 117 Rev. 3 (2024)
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-6">
                 {COMPETENCY_MATRIX.map(category => (
                   <div key={category.category} className="space-y-3">
                     <h4 className="font-semibold flex items-center gap-2">
                       <Compass className="h-4 w-4 text-primary" />
                       {category.category}
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {category.items.map(item => (
                         <div key={item.skill} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                           <span className="text-sm">{item.skill}</span>
                           <div className="flex items-center gap-2">
                             <div className="flex gap-1">
                               {[...Array(item.maxLevel)].map((_, i) => (
                                 <div
                                   key={i}
                                   className={`w-2 h-6 rounded ${
                                     i < item.level ? "bg-primary" : "bg-muted"
                                   }`}
                                 />
                               ))}
                             </div>
                             <span className="text-xs text-muted-foreground w-8">
                               {item.level}/{item.maxLevel}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Key Personnel Tab */}
         <TabsContent value="personnel" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Users className="h-5 w-5 text-blue-500" />
                 Key DP Personnel (IMCA M117)
               </CardTitle>
               <CardDescription>
                 Requisitos de treinamento por função conforme IMCA M 117 Seção 5
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {KEY_DP_PERSONNEL.map(personnel => (
                   <Card key={personnel.role} className="border-l-4 border-l-primary">
                     <CardContent className="p-4 space-y-3">
                       <div className="flex items-center justify-between">
                         <h4 className="font-semibold">{personnel.role}</h4>
                         <Badge variant="outline" className="text-xs">{personnel.code}</Badge>
                       </div>
                       <div className="space-y-2">
                         <p className="text-xs text-muted-foreground uppercase">Requisitos:</p>
                         {personnel.requirements.map((req, i) => (
                           <div key={i} className="flex items-center gap-2 text-sm">
                             <CheckCircle className="h-3 w-3 text-green-500" />
                             {req}
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Simulator Tab */}
         <TabsContent value="simulator" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <PlayCircle className="h-5 w-5 text-purple-500" />
                   Sessões de Simulador
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[350px]">
                   <div className="space-y-3">
                     {ACTIVE_SIMULATOR.map(session => (
                       <div key={session.id} className="p-3 border rounded-lg space-y-2">
                         <div className="flex items-center justify-between">
                           <Badge variant="outline">{session.type}</Badge>
                           <Badge className={
                             session.status === "completed" ? "bg-green-500/10 text-green-500" :
                             "bg-blue-500/10 text-blue-500"
                           }>
                             {session.status === "completed" ? "Concluído" : "Agendado"}
                           </Badge>
                         </div>
                         <p className="font-medium">{session.scenario}</p>
                         <div className="flex items-center justify-between text-sm text-muted-foreground">
                           <span>{session.personnel.join(", ")}</span>
                           <span>{session.duration}h</span>
                         </div>
                         {session.score && (
                           <div className="flex items-center gap-2">
                             <Star className="h-4 w-4 text-amber-500" />
                             <span className="font-medium">{session.score}%</span>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Sparkles className="h-5 w-5 text-blue-500" />
                   Recursos do Simulador
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Navigation className="h-6 w-6 mx-auto text-blue-500" />
                     <p className="text-sm font-medium mt-2">Full Mission Bridge</p>
                     <p className="text-xs text-muted-foreground">360° visualization</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Activity className="h-6 w-6 mx-auto text-green-500" />
                     <p className="text-sm font-medium mt-2">Engine Room Link</p>
                     <p className="text-xs text-muted-foreground">Total ship training</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Waves className="h-6 w-6 mx-auto text-purple-500" />
                     <p className="text-sm font-medium mt-2">Azipod Simulation</p>
                     <p className="text-xs text-muted-foreground">Conventional & electric</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Target className="h-6 w-6 mx-auto text-amber-500" />
                     <p className="text-sm font-medium mt-2">Capability Plots</p>
                     <p className="text-xs text-muted-foreground">Real-time analysis</p>
                   </div>
                 </div>
 
                 <Button className="w-full" onClick={() => toast.info("Sessão VR — Em implantação. Requer integração com hardware VR compatível (Oculus/HTC Vive).", { duration: 5000 })}>
                   <PlayCircle className="h-4 w-4 mr-2" />
                   Iniciar Sessão VR
                   <Badge variant="outline" className="ml-2 text-[10px]">Em implantação</Badge>
                 </Button>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* IMCA M273 Drills Tab */}
         <TabsContent value="drills" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-red-500" />
                 IMCA M273 - DP Drills & Preparedness
               </CardTitle>
               <CardDescription>
                 Guia para condução de drills e preparação para falhas DP (2026)
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {DRILL_TYPES.map(drill => (
                   <Card key={drill.type} className="border-l-4 border-l-red-500">
                     <CardContent className="p-4 space-y-3">
                       <div className="flex items-center justify-between">
                         <h4 className="font-semibold">{drill.type}</h4>
                         <Badge variant="outline">{drill.frequency}</Badge>
                       </div>
                       <p className="text-sm text-muted-foreground">{drill.description}</p>
                       <div className="flex items-center justify-between text-xs">
                         <span>Último: {drill.lastPerformed}</span>
                         <Button size="sm" variant="outline">
                           <PlayCircle className="h-3 w-3 mr-1" />
                           Iniciar
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
 
               <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                 <h4 className="font-semibold flex items-center gap-2 text-amber-600">
                   <AlertTriangle className="h-4 w-4" />
                   Princípio M273: Preparedness for Failure
                 </h4>
                 <p className="text-sm text-muted-foreground mt-2">
                   "DP incidents rarely result from a single technical failure alone. How people 
                   recognise developing problems, communicate, and intervene often determines the outcome."
                 </p>
                 <p className="text-xs text-muted-foreground mt-2">— Richard Purser, IMCA Technical Adviser</p>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }