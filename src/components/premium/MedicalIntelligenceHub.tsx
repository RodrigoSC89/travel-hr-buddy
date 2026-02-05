 /**
  * Medical Intelligence Hub - Digital Infirmary with Telemedicine
  * Based on HDHE (Human Digital Healthcare Engineering) framework
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Heart, Activity, Thermometer, User, AlertTriangle, 
   Video, Phone, Calendar, Pill, FileText, Brain,
   TrendingUp, Clock, Shield, Stethoscope, Syringe
 } from "lucide-react";
 
 interface CrewMember {
   id: string;
   name: string;
   role: string;
   vessel: string;
   vitals: {
     heartRate: number;
     oxygenLevel: number;
     temperature: number;
     bloodPressure: string;
   };
   riskLevel: "low" | "medium" | "high";
   lastCheckup: string;
   alerts: string[];
 }
 
 interface MedicalSupply {
   id: string;
   name: string;
   category: string;
   quantity: number;
   minStock: number;
   expiryDate: string;
   batchNumber: string;
   status: "ok" | "low" | "critical" | "expired";
 }
 
 const mockCrewHealth: CrewMember[] = [
   {
     id: "1",
     name: "João Silva",
     role: "Capitão",
     vessel: "Nautilus Star",
     vitals: { heartRate: 72, oxygenLevel: 98, temperature: 36.5, bloodPressure: "120/80" },
     riskLevel: "low",
     lastCheckup: "2026-02-01",
     alerts: []
   },
   {
     id: "2",
     name: "Maria Santos",
     role: "Oficial de Máquinas",
     vessel: "Nautilus Explorer",
     vitals: { heartRate: 88, oxygenLevel: 95, temperature: 37.2, bloodPressure: "135/90" },
     riskLevel: "medium",
     lastCheckup: "2026-01-28",
     alerts: ["Pressão arterial elevada", "Fadiga relatada"]
   },
   {
     id: "3",
     name: "Pedro Costa",
     role: "Marinheiro",
     vessel: "Nautilus Star",
     vitals: { heartRate: 95, oxygenLevel: 92, temperature: 38.1, bloodPressure: "140/95" },
     riskLevel: "high",
     lastCheckup: "2026-02-04",
     alerts: ["Febre detectada", "Baixa saturação O2", "Consulta urgente recomendada"]
   }
 ];
 
 const mockSupplies: MedicalSupply[] = [
   { id: "1", name: "Paracetamol 500mg", category: "Analgésicos", quantity: 120, minStock: 50, expiryDate: "2027-06-15", batchNumber: "LOT-2024-A1", status: "ok" },
   { id: "2", name: "Bandagem Elástica", category: "Curativos", quantity: 25, minStock: 30, expiryDate: "2028-01-01", batchNumber: "LOT-2024-B2", status: "low" },
   { id: "3", name: "Epinefrina 1mg/mL", category: "Emergência", quantity: 5, minStock: 10, expiryDate: "2026-03-01", batchNumber: "LOT-2023-E1", status: "critical" },
   { id: "4", name: "Antibiótico Amoxicilina", category: "Antibióticos", quantity: 0, minStock: 20, expiryDate: "2025-12-01", batchNumber: "LOT-2022-X1", status: "expired" }
 ];
 
 export default function MedicalIntelligenceHub() {
   const [activeTab, setActiveTab] = useState("monitoring");
 
   const getRiskColor = (level: string) => {
     switch (level) {
       case "high": return "text-destructive bg-destructive/10";
       case "medium": return "text-warning bg-warning/10";
       default: return "text-success bg-success/10";
     }
   };
 
   const getSupplyStatus = (status: string) => {
     switch (status) {
       case "critical": return "bg-destructive/10 text-destructive";
       case "low": return "bg-warning/10 text-warning";
       case "expired": return "bg-destructive text-destructive-foreground";
       default: return "bg-success/10 text-success";
     }
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Tripulantes Saudáveis</p>
                 <p className="text-2xl font-bold text-success">94%</p>
               </div>
               <Heart className="h-8 w-8 text-success/50" />
             </div>
             <Progress value={94} className="h-1.5 mt-2" />
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Alertas Ativos</p>
                 <p className="text-2xl font-bold text-warning">7</p>
               </div>
               <AlertTriangle className="h-8 w-8 text-warning/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">3 urgentes</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Telemedicina</p>
                 <p className="text-2xl font-bold">12</p>
               </div>
               <Video className="h-8 w-8 text-primary/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">consultas este mês</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Suprimentos</p>
                 <p className="text-2xl font-bold">87%</p>
               </div>
               <Pill className="h-8 w-8 text-cyan-500/50" />
             </div>
             <p className="text-xs text-warning mt-2">4 itens baixos</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">IA Diagnóstico</p>
                 <p className="text-2xl font-bold">98.5%</p>
               </div>
               <Brain className="h-8 w-8 text-purple-500/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">precisão HDHE</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Content Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="monitoring" className="flex items-center gap-2 py-2">
             <Activity className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Monitoramento</span>
           </TabsTrigger>
           <TabsTrigger value="telemedicine" className="flex items-center gap-2 py-2">
             <Video className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Telemedicina</span>
           </TabsTrigger>
           <TabsTrigger value="pharmacy" className="flex items-center gap-2 py-2">
             <Pill className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Farmácia</span>
           </TabsTrigger>
           <TabsTrigger value="records" className="flex items-center gap-2 py-2">
             <FileText className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Prontuários</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Real-Time Monitoring Tab */}
         <TabsContent value="monitoring" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Activity className="h-5 w-5 text-primary" />
                 Monitoramento de Saúde em Tempo Real
               </CardTitle>
               <CardDescription>
                 Sinais vitais via wearables IoT (HDHE Framework)
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {mockCrewHealth.map((crew) => (
                   <div key={crew.id} className="border rounded-lg p-4 space-y-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                           <User className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                           <p className="font-medium">{crew.name}</p>
                           <p className="text-xs text-muted-foreground">{crew.role} • {crew.vessel}</p>
                         </div>
                       </div>
                       <Badge className={getRiskColor(crew.riskLevel)}>
                         {crew.riskLevel === "high" ? "Alto Risco" : 
                          crew.riskLevel === "medium" ? "Atenção" : "Normal"}
                       </Badge>
                     </div>
 
                     <div className="grid grid-cols-4 gap-3">
                       <div className="text-center p-2 bg-muted/50 rounded">
                         <Heart className="h-4 w-4 mx-auto text-destructive mb-1" />
                         <p className="text-lg font-bold">{crew.vitals.heartRate}</p>
                         <p className="text-xs text-muted-foreground">BPM</p>
                       </div>
                       <div className="text-center p-2 bg-muted/50 rounded">
                         <Activity className="h-4 w-4 mx-auto text-cyan-500 mb-1" />
                         <p className="text-lg font-bold">{crew.vitals.oxygenLevel}%</p>
                         <p className="text-xs text-muted-foreground">SpO2</p>
                       </div>
                       <div className="text-center p-2 bg-muted/50 rounded">
                         <Thermometer className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                         <p className="text-lg font-bold">{crew.vitals.temperature}°</p>
                         <p className="text-xs text-muted-foreground">Temp</p>
                       </div>
                       <div className="text-center p-2 bg-muted/50 rounded">
                         <TrendingUp className="h-4 w-4 mx-auto text-purple-500 mb-1" />
                         <p className="text-lg font-bold">{crew.vitals.bloodPressure}</p>
                         <p className="text-xs text-muted-foreground">PA</p>
                       </div>
                     </div>
 
                     {crew.alerts.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {crew.alerts.map((alert, idx) => (
                           <Badge key={idx} variant="outline" className="text-destructive border-destructive/50">
                             <AlertTriangle className="h-3 w-3 mr-1" />
                             {alert}
                           </Badge>
                         ))}
                       </div>
                     )}
 
                     <div className="flex gap-2">
                       <Button size="sm" variant="outline" className="flex-1">
                         <FileText className="h-4 w-4 mr-2" />
                         Histórico
                       </Button>
                       <Button size="sm" variant="outline" className="flex-1">
                         <Video className="h-4 w-4 mr-2" />
                         Telemedicina
                       </Button>
                       {crew.riskLevel === "high" && (
                         <Button size="sm" variant="destructive" className="flex-1">
                           <Phone className="h-4 w-4 mr-2" />
                           Emergência
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Telemedicine Tab */}
         <TabsContent value="telemedicine" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Video className="h-5 w-5 text-primary" />
                   Consultas Agendadas
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {[
                   { time: "14:00", patient: "Pedro Costa", doctor: "Dr. Ana Médica", type: "Urgente" },
                   { time: "15:30", patient: "Maria Santos", doctor: "Dr. Carlos Cardio", type: "Rotina" },
                   { time: "16:00", patient: "José Ferreira", doctor: "Dr. Ana Médica", type: "Retorno" }
                 ].map((apt, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <Badge variant={apt.type === "Urgente" ? "destructive" : "outline"}>
                         {apt.time}
                       </Badge>
                       <div>
                         <p className="font-medium text-sm">{apt.patient}</p>
                         <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                       </div>
                     </div>
                     <Button size="sm">
                       <Video className="h-4 w-4 mr-2" />
                       Iniciar
                     </Button>
                   </div>
                 ))}
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Stethoscope className="h-5 w-5 text-primary" />
                   Médicos Disponíveis
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 {[
                   { name: "Dr. Ana Médica", specialty: "Clínico Geral", status: "online" },
                   { name: "Dr. Carlos Cardio", specialty: "Cardiologista", status: "online" },
                   { name: "Dr. Paulo Ortopedia", specialty: "Ortopedista", status: "busy" },
                   { name: "Dr. Marina Psico", specialty: "Psicóloga", status: "offline" }
                 ].map((doc, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${
                         doc.status === "online" ? "bg-success" : 
                         doc.status === "busy" ? "bg-warning" : "bg-muted"
                       }`} />
                       <div>
                         <p className="font-medium text-sm">{doc.name}</p>
                         <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                       </div>
                     </div>
                     <Button size="sm" variant="outline" disabled={doc.status !== "online"}>
                       Agendar
                     </Button>
                   </div>
                 ))}
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Pharmacy Tab */}
         <TabsContent value="pharmacy" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Pill className="h-5 w-5 text-primary" />
                 Inventário de Suprimentos Médicos
               </CardTitle>
               <CardDescription>
                 Controle de estoque com alertas de validade e reposição
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {mockSupplies.map((supply) => (
                   <div key={supply.id} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <Syringe className="h-5 w-5 text-muted-foreground" />
                       <div>
                         <p className="font-medium text-sm">{supply.name}</p>
                         <p className="text-xs text-muted-foreground">
                           {supply.category} • Lote: {supply.batchNumber}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-medium">{supply.quantity}/{supply.minStock}</p>
                         <p className="text-xs text-muted-foreground">Val: {supply.expiryDate}</p>
                       </div>
                       <Badge className={getSupplyStatus(supply.status)}>
                         {supply.status === "ok" ? "OK" : 
                          supply.status === "low" ? "Baixo" : 
                          supply.status === "critical" ? "Crítico" : "Vencido"}
                       </Badge>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Records Tab */}
         <TabsContent value="records" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <FileText className="h-5 w-5 text-primary" />
                 Prontuários Eletrônicos
               </CardTitle>
             </CardHeader>
             <CardContent className="text-center py-12 text-muted-foreground">
               <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p className="font-medium">Acesso Restrito</p>
               <p className="text-sm">Prontuários protegidos por autenticação médica</p>
               <Button className="mt-4">
                 Autenticar Acesso Médico
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }