/**
 * Medical Infirmary Enhanced - Enfermaria Digital Premium
 * PATCH PREMIUM-2.0
 */

import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Stethoscope, Heart, Users, Pill, FileText, 
  AlertTriangle, Activity, Brain, Calendar,
  Plus, Search, Clock, CheckCircle, TrendingUp,
  ThermometerSun, Syringe, Clipboard, Phone, Loader2, Video
} from "lucide-react";
import { toast } from "sonner";

// Lazy load premium components
const MedicalDashboard = lazy(() => import("@/modules/medical-infirmary/components/MedicalDashboard").catch(() => ({ default: () => <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" /><p>Módulo de dashboard médico não disponível. Utilize as outras abas.</p></div> })));
const InfirmaryCommandCenter = lazy(() => import("@/modules/digital-infirmary/components/InfirmaryCommandCenter"));

const healthStats = [
  { id: "crew", label: "Tripulantes Ativos", value: 247, icon: Users, color: "primary" },
  { id: "fit", label: "Aptos para Serviço", value: 239, icon: CheckCircle, color: "success", percentage: 96.8 },
  { id: "consultations", label: "Atendimentos (Mês)", value: 34, icon: Stethoscope, color: "info" },
  { id: "pending", label: "Exames Pendentes", value: 8, icon: Clock, color: "warning" },
];

const medications = [
  { id: "1", name: "Dipirona 500mg", quantity: 450, minStock: 100, status: "ok", expiry: "2026-12" },
  { id: "2", name: "Paracetamol 750mg", quantity: 380, minStock: 100, status: "ok", expiry: "2026-08" },
  { id: "3", name: "Omeprazol 20mg", quantity: 120, minStock: 50, status: "ok", expiry: "2026-10" },
  { id: "4", name: "Dramin B6", quantity: 45, minStock: 50, status: "low", expiry: "2026-06" },
  { id: "5", name: "Ciprofloxacino", quantity: 28, minStock: 30, status: "critical", expiry: "2026-04" },
];

const recentConsultations = [
  { id: "1", patient: "João Silva", reason: "Dor de cabeça", date: "2026-02-04", status: "completed", doctor: "Dr. Costa" },
  { id: "2", patient: "Maria Santos", reason: "Mal-estar", date: "2026-02-04", status: "in_progress", doctor: "Dra. Lima" },
  { id: "3", patient: "Pedro Oliveira", reason: "Exame periódico", date: "2026-02-03", status: "completed", doctor: "Dr. Costa" },
  { id: "4", patient: "Ana Rodrigues", reason: "Lesão no braço", date: "2026-02-03", status: "completed", doctor: "Dra. Lima" },
];

const upcomingExams = [
  { id: "1", crew: "Carlos Mendes", type: "Exame Admissional", date: "2026-02-06", vessel: "MV Atlântico Sul" },
  { id: "2", crew: "Roberto Alves", type: "Periódico Anual", date: "2026-02-08", vessel: "MV Horizonte" },
  { id: "3", crew: "Paulo Ferreira", type: "Demissional", date: "2026-02-10", vessel: "MV Oceano" },
];

const emergencyProtocols = [
  { id: "1", name: "Parada Cardíaca", priority: "critical", lastDrill: "2026-01-15" },
  { id: "2", name: "Afogamento", priority: "critical", lastDrill: "2026-01-20" },
  { id: "3", name: "Queimaduras", priority: "high", lastDrill: "2026-01-25" },
  { id: "4", name: "Fraturas", priority: "high", lastDrill: "2026-01-28" },
];

export default function MedicalInfirmaryEnhanced() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const getStockStatus = (status: string) => {
    switch (status) {
      case "ok": return { label: "Normal", variant: "default" as const };
      case "low": return { label: "Baixo", variant: "secondary" as const };
      case "critical": return { label: "Crítico", variant: "destructive" as const };
      default: return { label: "—", variant: "outline" as const };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <div className="border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-accent/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-lg">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Enfermaria Digital</h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                    <Brain className="h-3 w-3" />
                    IA Integrada
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Gestão de saúde conforme MLC 2006 e NORMAM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Telemedicina
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Atendimento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthStats.map((stat) => (
            <Card key={stat.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.percentage && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-emerald-600">{stat.percentage}%</span>
                      </div>
                    )}
                  </div>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="command" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="command" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Comando
              <Badge variant="secondary" className="text-[10px] px-1">PREMIUM</Badge>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Atendimentos
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medicamentos
              <Badge variant="destructive" className="h-5 w-5 p-0 text-[10px]">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Exames
            </TabsTrigger>
            <TabsTrigger value="telemedicine" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Telemedicina
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergência
            </TabsTrigger>
          </TabsList>

          {/* Command Center Premium */}
          <TabsContent value="command">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando Centro de Comando...</span>
              </div>
            }>
              <InfirmaryCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Dashboard Premium */}
          <TabsContent value="dashboard">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando dashboard...</span>
              </div>
            }>
              <MedicalDashboard />
            </Suspense>
          </TabsContent>

          {/* Atendimentos */}
          <TabsContent value="consultations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atendimentos Recentes
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar paciente..." 
                      className="pl-9 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="p-4 rounded-lg border flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${consultation.status === "completed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                        <div>
                          <p className="font-medium">{consultation.patient}</p>
                          <p className="text-sm text-muted-foreground">{consultation.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{consultation.doctor}</span>
                        <span className="text-sm text-muted-foreground">{consultation.date}</span>
                        <Badge variant={consultation.status === "completed" ? "default" : "secondary"}>
                          {consultation.status === "completed" ? "Concluído" : "Em Andamento"}
                        </Badge>
                        <Button variant="outline" size="sm">Ver Prontuário</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicamentos */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Estoque de Medicamentos
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((med) => {
                    const stockStatus = getStockStatus(med.status);
                    const stockPercentage = (med.quantity / (med.minStock * 5)) * 100;
                    
                    return (
                      <div key={med.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">Validade: {med.expiry}</p>
                          </div>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Quantidade: {med.quantity}</span>
                              <span>Mínimo: {med.minStock}</span>
                            </div>
                            <Progress 
                              value={stockPercentage} 
                              className={`h-2 ${med.status === "critical" ? "[&>div]:bg-destructive" : med.status === "low" ? "[&>div]:bg-amber-500" : ""}`}
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={async () => {
                            try {
                              const { supabase } = await import("@/integrations/supabase/client");
                              await supabase.from("ai_audit_logs").insert({
                                user_input: `Reposição solicitada: ${med.name} (qtd atual: ${med.quantity})`,
                                interaction_type: "medication_restock",
                                module_name: "medical-infirmary"
                              });
                              toast.success(`Pedido de reposição registrado: ${med.name}`);
                            } catch {
                              toast.error("Erro ao registrar pedido de reposição");
                            }
                          }}>
                            Repor
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exames */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Exames Agendados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clipboard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{exam.crew}</p>
                          <p className="text-sm text-muted-foreground">{exam.type} • {exam.vessel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{exam.date}</span>
                        <Button variant="outline" size="sm">Confirmar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergência */}
          <TabsContent value="emergency">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Protocolos de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emergencyProtocols.map((protocol) => (
                      <div key={protocol.id} className="p-4 rounded-lg border flex items-center justify-between">
                        <div>
                          <p className="font-medium">{protocol.name}</p>
                          <p className="text-sm text-muted-foreground">Último treino: {protocol.lastDrill}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={protocol.priority === "critical" ? "destructive" : "secondary"}>
                            {protocol.priority === "critical" ? "Crítico" : "Alto"}
                          </Badge>
                          <Button variant="outline" size="sm">Iniciar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Phone className="h-5 w-5" />
                    Contatos de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="font-medium">SAMU Marítimo</p>
                    <p className="text-lg font-bold text-destructive">192</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Coordenação SAR</p>
                    <p className="text-lg font-bold">+55 21 3344-5566</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Médico de Plantão</p>
                    <p className="text-lg font-bold">+55 21 98765-4321</p>
                  </div>
                  <Button className="w-full" variant="destructive">
                    <Phone className="h-4 w-4 mr-2" />
                    Acionar Emergência
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
