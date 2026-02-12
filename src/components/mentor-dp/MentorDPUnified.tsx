 /**
  * MentorDPUnified - Componente Unificado do Mentor DP
  * Funde todas as funcionalidades: AI Chat, Academia DP, Simulador e Intelligence
  * Para uso dentro do People Hub
  */
 
 import React, { Suspense, lazy } from "react";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Skeleton } from "@/components/ui/skeleton";
 import { 
   MessageSquare, BookOpen, Gamepad2, Brain, 
   Award, Target, Activity, CheckCircle2, Calendar, Clock
 } from "lucide-react";
 
 // Lazy load heavy components
 const MentorDPProfessional = lazy(() => import("@/components/mentor-dp/MentorDPProfessional"));
 const DPMentorIntelligence = lazy(() => import("@/components/premium/DPMentorIntelligence"));
 
 function LoadingSkeleton() {
   return (
     <div className="space-y-4">
       <div className="grid grid-cols-4 gap-4">
         {[...Array(4)].map((_, i) => (
           <Skeleton key={i} className="h-24" />
         ))}
       </div>
       <Skeleton className="h-96" />
     </div>
   );
 }
 
 // KPIs do Mentor DP
 function MentorDPKPIs() {
   const kpis = [
     {
       title: "DPOs Certificados",
       value: "4",
       subtitle: "NI Standards",
       icon: Award,
       color: "text-green-500",
       bgColor: "bg-green-500/10",
     },
     {
       title: "Renovações Pendentes",
       value: "1",
       subtitle: "Próximos 90 dias",
       icon: Calendar,
       color: "text-amber-500",
       bgColor: "bg-amber-500/10",
     },
     {
       title: "Progresso CPD Médio",
       value: "58%",
       subtitle: "",
       icon: Target,
       color: "text-cyan-500",
       bgColor: "bg-cyan-500/10",
       showProgress: true,
       progress: 58,
     },
     {
       title: "Horas Simulador",
       value: "660h",
       subtitle: "Total equipe",
       icon: Clock,
       color: "text-purple-500",
       bgColor: "bg-purple-500/10",
     },
   ];
 
   return (
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
       {kpis.map((kpi, index) => (
         <Card key={index} className={`${kpi.bgColor} border-none`}>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">{kpi.title}</p>
                 <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                 {kpi.showProgress ? (
                   <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                     <div 
                       className={`h-1.5 rounded-full bg-cyan-500`} 
                       style={{ width: `${kpi.progress}%` }}
                     />
                   </div>
                 ) : (
                   <p className={`text-xs ${kpi.color}`}>
                     {kpi.subtitle && (
                       <>
                         {kpi.subtitle.includes("NI") && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                         {kpi.subtitle.includes("Próximos") && <span className="text-amber-500">⚠ </span>}
                         {kpi.subtitle}
                       </>
                     )}
                   </p>
                 )}
               </div>
               <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-50`} />
             </div>
           </CardContent>
         </Card>
       ))}
     </div>
   );
 }
 
 export default function MentorDPUnified() {
   return (
     <div className="space-y-6">
       {/* Header com badges */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <MessageSquare className="h-3 w-3 mr-1" />
              AI Chat
            </Badge>
            <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
              <Brain className="h-3 w-3 mr-1" />
              NI CPD 2024
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Award className="h-3 w-3 mr-1" />
             IMCA M117
           </Badge>
         </div>
         <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500">
           <Activity className="h-3 w-3 mr-1 animate-pulse" />
           Sincronizado
         </Badge>
       </div>
 
       {/* KPIs */}
       <MentorDPKPIs />
 
       {/* Tabs internas do Mentor DP */}
       <Tabs defaultValue="cpd" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="cpd" className="flex items-center gap-2">
             <Target className="h-4 w-4" />
             CPD Tracking
           </TabsTrigger>
           <TabsTrigger value="matrix" className="flex items-center gap-2">
             <Award className="h-4 w-4" />
             Matriz IMCA
           </TabsTrigger>
           <TabsTrigger value="mentor" className="flex items-center gap-2">
             <MessageSquare className="h-4 w-4" />
             AI Mentor
           </TabsTrigger>
           <TabsTrigger value="simulator" className="flex items-center gap-2">
             <Gamepad2 className="h-4 w-4" />
             Simulador
           </TabsTrigger>
           <TabsTrigger value="academy" className="flex items-center gap-2">
             <BookOpen className="h-4 w-4" />
             Academia DP
           </TabsTrigger>
         </TabsList>
 
         <Suspense fallback={<LoadingSkeleton />}>
           {/* CPD Tracking & Matriz IMCA - Intelligence Component */}
           <TabsContent value="cpd">
             <DPMentorIntelligence />
           </TabsContent>
 
           <TabsContent value="matrix">
             <DPMentorIntelligence />
           </TabsContent>
 
           {/* AI Mentor Chat */}
           <TabsContent value="mentor">
             <MentorDPProfessional />
           </TabsContent>
 
           {/* Simulador */}
           <TabsContent value="simulator">
             <MentorDPProfessional />
           </TabsContent>
 
           {/* Academia DP */}
           <TabsContent value="academy">
             <MentorDPProfessional />
           </TabsContent>
         </Suspense>
       </Tabs>
     </div>
   );
 }