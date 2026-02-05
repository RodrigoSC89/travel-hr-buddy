 /**
  * Training Academy Intelligence Hub
  * Advanced training management with LMS, competency tracking, and certification
  * Based on MarinePALS, MTC, and IMCA best practices
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   GraduationCap, Award, Brain, BookOpen, PlayCircle, Target,
   CheckCircle, AlertTriangle, Clock, Users, Calendar, TrendingUp,
   FileText, Star, Zap, BarChart3, Video, Gamepad2, Headphones
 } from "lucide-react";
 import { toast } from "sonner";
 
 // Training Courses
 const COURSES = [
   {
     id: "1", title: "STCW Basic Safety Training", category: "Mandatory",
     duration: "40h", format: "Blended", enrolled: 45, completed: 38,
     rating: 4.8, status: "active", expiry: "5 years"
   },
   {
     id: "2", title: "MLC 2006 Awareness", category: "Compliance",
     duration: "8h", format: "E-Learning", enrolled: 120, completed: 115,
     rating: 4.5, status: "active", expiry: "3 years"
   },
   {
     id: "3", title: "ISM Code Implementation", category: "Management",
     duration: "16h", format: "Classroom", enrolled: 28, completed: 25,
     rating: 4.7, status: "active", expiry: "3 years"
   },
   {
     id: "4", title: "DP Induction Course", category: "Technical",
     duration: "5 days", format: "Simulator", enrolled: 12, completed: 8,
     rating: 4.9, status: "active", expiry: "5 years"
   },
   {
     id: "5", title: "MARPOL Annex V & VI", category: "Environmental",
     duration: "12h", format: "E-Learning", enrolled: 85, completed: 72,
     rating: 4.4, status: "active", expiry: "2 years"
   },
 ];
 
 // Certifications Tracker
 const CERTIFICATIONS = [
   { type: "STCW", name: "Basic Safety Training", holders: 245, expiring30: 12, expired: 3 },
   { type: "STCW", name: "Proficiency in Survival Craft", holders: 180, expiring30: 8, expired: 1 },
   { type: "MLC", name: "Medical Certificate", holders: 247, expiring30: 15, expired: 5 },
   { type: "NI", name: "DP Limited Certificate", holders: 45, expiring30: 3, expired: 0 },
   { type: "NI", name: "DP Unlimited Certificate", holders: 32, expiring30: 2, expired: 0 },
   { type: "GMDSS", name: "GOC Certificate", holders: 68, expiring30: 4, expired: 1 },
 ];
 
 // Crew Training Progress
 const CREW_PROGRESS = [
   { name: "Carlos Silva", role: "Chief Officer", progress: 92, courses: 8, pending: 1 },
   { name: "Ana Rodrigues", role: "2nd Engineer", progress: 78, courses: 6, pending: 2 },
   { name: "Ricardo Santos", role: "AB Seaman", progress: 95, courses: 5, pending: 0 },
   { name: "Marina Costa", role: "DPO", progress: 88, courses: 10, pending: 1 },
 ];
 
 // LMS Analytics
 const LMS_METRICS = {
   totalCourses: 45,
   activeLearners: 180,
   completionRate: 87,
   avgScore: 82,
   certificationsIssued: 312,
   hoursLearned: 4520,
 };
 
 // Gamification Stats
 const GAMIFICATION = {
   topLearners: [
     { name: "Carlos Silva", points: 2850, badges: 12, rank: 1 },
     { name: "Marina Costa", points: 2720, badges: 11, rank: 2 },
     { name: "Ricardo Santos", points: 2580, badges: 10, rank: 3 },
   ],
   badges: [
     { name: "STCW Master", icon: "🛡️", holders: 45 },
     { name: "Safety Champion", icon: "⭐", holders: 32 },
     { name: "Fast Learner", icon: "⚡", holders: 28 },
   ],
 };
 
 export default function TrainingAcademyIntelligence() {
   const [activeTab, setActiveTab] = useState("courses");
 
   const expiringCerts = CERTIFICATIONS.reduce((acc, c) => acc + c.expiring30, 0);
   const expiredCerts = CERTIFICATIONS.reduce((acc, c) => acc + c.expired, 0);
 
   const getFormatBadge = (format: string) => {
     switch (format) {
       case "E-Learning": return "bg-blue-500/10 text-blue-500";
       case "Classroom": return "bg-green-500/10 text-green-500";
       case "Simulator": return "bg-purple-500/10 text-purple-500";
       case "Blended": return "bg-amber-500/10 text-amber-500";
       default: return "bg-muted text-muted-foreground";
     }
   };
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Cursos Ativos</p>
                 <p className="text-2xl font-bold">{LMS_METRICS.totalCourses}</p>
                 <p className="text-xs text-green-500">{LMS_METRICS.activeLearners} learners</p>
               </div>
               <BookOpen className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-green-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                 <p className="text-2xl font-bold">{LMS_METRICS.completionRate}%</p>
                 <Progress value={LMS_METRICS.completionRate} className="h-1 mt-1" />
               </div>
               <CheckCircle className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-amber-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Certs Expirando</p>
                 <p className="text-2xl font-bold">{expiringCerts}</p>
                 <p className="text-xs text-amber-500">Próximos 30 dias</p>
               </div>
               <AlertTriangle className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Certificados Emitidos</p>
                 <p className="text-2xl font-bold">{LMS_METRICS.certificationsIssued}</p>
                 <p className="text-xs text-purple-500">{LMS_METRICS.hoursLearned}h aprendidas</p>
               </div>
               <Award className="h-8 w-8 text-purple-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="courses" className="flex items-center gap-2">
             <BookOpen className="h-4 w-4" />
             Cursos
           </TabsTrigger>
           <TabsTrigger value="certifications" className="flex items-center gap-2">
             <Award className="h-4 w-4" />
             Certificações
           </TabsTrigger>
           <TabsTrigger value="progress" className="flex items-center gap-2">
             <Users className="h-4 w-4" />
             Progresso
           </TabsTrigger>
           <TabsTrigger value="gamification" className="flex items-center gap-2">
             <Gamepad2 className="h-4 w-4" />
             Gamificação
           </TabsTrigger>
           <TabsTrigger value="analytics" className="flex items-center gap-2">
             <BarChart3 className="h-4 w-4" />
             Analytics
           </TabsTrigger>
         </TabsList>
 
         {/* Courses Tab */}
         <TabsContent value="courses" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <BookOpen className="h-5 w-5 text-blue-500" />
                 Catálogo de Cursos
               </CardTitle>
               <CardDescription>
                 Cursos e treinamentos disponíveis no LMS
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[400px]">
                 <div className="space-y-4">
                   {COURSES.map(course => (
                     <Card key={course.id} className="border-l-4 border-l-blue-500">
                       <CardContent className="p-4 space-y-3">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-semibold">{course.title}</h4>
                             <p className="text-sm text-muted-foreground">
                               {course.category} • {course.duration}
                             </p>
                           </div>
                           <div className="flex items-center gap-2">
                             <Badge className={getFormatBadge(course.format)}>{course.format}</Badge>
                             <div className="flex items-center gap-1">
                               <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                               <span className="font-medium">{course.rating}</span>
                             </div>
                           </div>
                         </div>
 
                         <div className="grid grid-cols-4 gap-4 text-sm text-center">
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Matriculados</p>
                             <p className="font-bold">{course.enrolled}</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Concluídos</p>
                             <p className="font-bold text-green-500">{course.completed}</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Taxa</p>
                             <p className="font-bold">{Math.round(course.completed / course.enrolled * 100)}%</p>
                           </div>
                           <div className="p-2 bg-muted/50 rounded">
                             <p className="text-xs text-muted-foreground">Validade</p>
                             <p className="font-bold">{course.expiry}</p>
                           </div>
                         </div>
 
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline">
                             <PlayCircle className="h-3 w-3 mr-1" />
                             Iniciar
                           </Button>
                           <Button size="sm" variant="outline">
                             <FileText className="h-3 w-3 mr-1" />
                             Conteúdo
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
 
         {/* Certifications Tab */}
         <TabsContent value="certifications" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5 text-green-500" />
                 Certificações da Tripulação
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {CERTIFICATIONS.map((cert, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                     <div className="flex items-center gap-4">
                       <Badge variant="outline">{cert.type}</Badge>
                       <div>
                         <p className="font-medium">{cert.name}</p>
                         <p className="text-sm text-muted-foreground">{cert.holders} portadores</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-6 text-sm">
                       <div className="text-center">
                         <p className={cert.expiring30 > 5 ? "text-amber-500 font-bold" : ""}>
                           {cert.expiring30}
                         </p>
                         <p className="text-xs text-muted-foreground">Expirando</p>
                       </div>
                       <div className="text-center">
                         <p className={cert.expired > 0 ? "text-red-500 font-bold" : "text-green-500"}>
                           {cert.expired}
                         </p>
                         <p className="text-xs text-muted-foreground">Expirados</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Progress Tab */}
         <TabsContent value="progress" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Users className="h-5 w-5 text-purple-500" />
                 Progresso Individual
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {CREW_PROGRESS.map((crew, i) => (
                   <div key={i} className="p-4 border rounded-lg space-y-3">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="font-semibold">{crew.name}</p>
                         <p className="text-sm text-muted-foreground">{crew.role}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-bold">{crew.progress}%</p>
                         <p className="text-xs text-muted-foreground">
                           {crew.courses} cursos • {crew.pending} pendentes
                         </p>
                       </div>
                     </div>
                     <Progress value={crew.progress} className="h-2" />
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Gamification Tab */}
         <TabsContent value="gamification" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Star className="h-5 w-5 text-amber-500" />
                   Leaderboard
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {GAMIFICATION.topLearners.map((learner, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                           i === 0 ? "bg-amber-500 text-white" :
                           i === 1 ? "bg-gray-400 text-white" :
                           "bg-amber-700 text-white"
                         }`}>
                           {learner.rank}
                         </div>
                         <div>
                           <p className="font-medium">{learner.name}</p>
                           <p className="text-xs text-muted-foreground">{learner.badges} badges</p>
                         </div>
                       </div>
                       <p className="font-bold text-lg">{learner.points.toLocaleString()} pts</p>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Award className="h-5 w-5 text-purple-500" />
                   Badges Disponíveis
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                   {GAMIFICATION.badges.map((badge, i) => (
                     <div key={i} className="p-4 border rounded-lg text-center">
                       <span className="text-4xl">{badge.icon}</span>
                       <p className="font-medium mt-2">{badge.name}</p>
                       <p className="text-sm text-muted-foreground">{badge.holders} portadores</p>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Analytics Tab */}
         <TabsContent value="analytics" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-blue-500" />
                 LMS Analytics Dashboard
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-muted/50 rounded-lg text-center">
                   <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                   <p className="text-2xl font-bold">{LMS_METRICS.totalCourses}</p>
                   <p className="text-sm text-muted-foreground">Total Cursos</p>
                 </div>
                 <div className="p-4 bg-muted/50 rounded-lg text-center">
                   <Users className="h-8 w-8 mx-auto text-green-500 mb-2" />
                   <p className="text-2xl font-bold">{LMS_METRICS.activeLearners}</p>
                   <p className="text-sm text-muted-foreground">Learners Ativos</p>
                 </div>
                 <div className="p-4 bg-muted/50 rounded-lg text-center">
                   <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                   <p className="text-2xl font-bold">{LMS_METRICS.avgScore}%</p>
                   <p className="text-sm text-muted-foreground">Nota Média</p>
                 </div>
                 <div className="p-4 bg-muted/50 rounded-lg text-center">
                   <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                   <p className="text-2xl font-bold">{LMS_METRICS.hoursLearned}</p>
                   <p className="text-sm text-muted-foreground">Horas Aprendidas</p>
                 </div>
               </div>
 
               <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                 <h4 className="font-semibold flex items-center gap-2">
                   <Brain className="h-4 w-4 text-blue-500" />
                   Micro-Learning & VR Training
                 </h4>
                 <p className="text-sm text-muted-foreground mt-2">
                   Integração com plataformas de micro-learning, gamificação e treinamento VR 
                   para reduzir tempo de simulador e aumentar engajamento.
                 </p>
                 <div className="flex gap-2 mt-3">
                   <Button size="sm" variant="outline">
                     <Video className="h-3 w-3 mr-1" />
                     Micro-Learning
                   </Button>
                   <Button size="sm" variant="outline">
                     <Gamepad2 className="h-3 w-3 mr-1" />
                     Gaming Apps
                   </Button>
                   <Button size="sm" variant="outline">
                     <Headphones className="h-3 w-3 mr-1" />
                     VR Training
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }