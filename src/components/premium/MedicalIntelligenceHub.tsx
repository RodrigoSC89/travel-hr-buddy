 /**
  * Medical Intelligence Hub - Digital Infirmary with Telemedicine
  * Based on HDHE (Human Digital Healthcare Engineering) framework
  */
 
  import React, { useState, useEffect } from "react";
  import { useMedicalIntelligenceData } from "@/hooks/useMedicalIntelligenceData";
  import { supabase } from "@/integrations/supabase/client";
  import { logger } from "@/lib/logger";
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
 
  // Types and mock data replaced by useMedicalIntelligenceData hook
 
export default function MedicalIntelligenceHub() {
    const { crewHealth: mockCrewHealth, isLoading } = useMedicalIntelligenceData();
    const [activeTab, setActiveTab] = useState("monitoring");
    const [supplies, setSupplies] = useState<any[]>([]);

    // Fetch real medical supplies from Supabase
    useEffect(() => {
      const fetchSupplies = async () => {
        try {
          const { data, error } = await supabase
            .from('medical_supplies')
            .select('*')
            .order('name')
            .limit(50);

          if (error) {
            logger.warn('medical_supplies query error', error);
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- medical_supplies dynamic row
          const mapped = (data || []).map((s: any) => {
            const qty = s.quantity || 0;
            const minStock = s.min_stock || 10;
            const now = new Date();
            const expiry = s.expiry_date ? new Date(s.expiry_date) : null;
            const isExpired = expiry && expiry < now;
            const status = isExpired ? 'expired' : qty === 0 ? 'critical' : qty < minStock ? 'low' : 'ok';

            return {
              id: s.id,
              name: s.name,
              category: s.category || 'Geral',
              quantity: qty,
              minStock,
              expiryDate: s.expiry_date?.split('T')[0] || 'N/A',
              batchNumber: s.batch_number || 'N/A',
              status,
            };
          });

          setSupplies(mapped);
        } catch (err) {
          logger.error('Error fetching medical supplies', err);
        }
      };
      fetchSupplies();
    }, []);
 
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
                 {supplies.map((supply) => (
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