/**
 * Medical Dashboard - Premium Enfermaria Digital
 * Gestão completa de saúde da tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Activity,
  Pill,
  Stethoscope,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  FileText,
  Phone,
  Video,
  ThermometerSun,
  Syringe,
  Ambulance,
  ClipboardList,
  TrendingUp,
  Shield,
  Plus,
  Search,
  Download,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  medicalStatus: "fit" | "restricted" | "unfit" | "pending";
  lastCheckup: string;
  nextCheckup: string;
  certifications: { name: string; expiry: string; status: "valid" | "expiring" | "expired" }[];
}

interface MedicalRecord {
  id: string;
  crewId: string;
  crewName: string;
  type: "consultation" | "emergency" | "routine" | "telemedicine";
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  status: "open" | "closed" | "follow-up";
}

interface Medication {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  expiry: string;
  controlled: boolean;
}

// Mock data
const mockCrew: CrewMember[] = [
  {
    id: "1",
    name: "João Silva",
    rank: "Capitão",
    vessel: "MV Atlantic Star",
    medicalStatus: "fit",
    lastCheckup: "2024-01-10",
    nextCheckup: "2024-07-10",
    certifications: [
      { name: "ENG1 Medical", expiry: "2025-01-10", status: "valid" },
      { name: "Drug & Alcohol", expiry: "2024-03-15", status: "expiring" },
    ]
  },
  {
    id: "2",
    name: "Carlos Santos",
    rank: "Eng. Chefe",
    vessel: "MV Pacific Dream",
    medicalStatus: "restricted",
    lastCheckup: "2024-01-05",
    nextCheckup: "2024-02-05",
    certifications: [
      { name: "ENG1 Medical", expiry: "2024-02-01", status: "expiring" },
      { name: "Visão", expiry: "2024-06-20", status: "valid" },
    ]
  },
  {
    id: "3",
    name: "Pedro Costa",
    rank: "Oficial de Convés",
    vessel: "MV Atlantic Star",
    medicalStatus: "fit",
    lastCheckup: "2023-12-20",
    nextCheckup: "2024-06-20",
    certifications: [
      { name: "ENG1 Medical", expiry: "2024-12-20", status: "valid" },
    ]
  },
];

const mockRecords: MedicalRecord[] = [
  { id: "1", crewId: "2", crewName: "Carlos Santos", type: "consultation", date: "2024-01-15", diagnosis: "Hipertensão arterial leve", treatment: "Medicação diária, monitoramento", doctor: "Dr. Ana Oliveira", status: "follow-up" },
  { id: "2", crewId: "1", crewName: "João Silva", type: "routine", date: "2024-01-10", diagnosis: "Exame periódico - Apto", treatment: "N/A", doctor: "Dr. Ana Oliveira", status: "closed" },
  { id: "3", crewId: "3", crewName: "Pedro Costa", type: "emergency", date: "2024-01-08", diagnosis: "Entorse de tornozelo", treatment: "Imobilização, anti-inflamatório", doctor: "Dr. Carlos Mendes", status: "closed" },
  { id: "4", crewId: "2", crewName: "Carlos Santos", type: "telemedicine", date: "2024-01-12", diagnosis: "Acompanhamento cardiológico", treatment: "Ajuste de medicação", doctor: "Dr. Paulo Cardoso", status: "closed" },
];

const mockMedications: Medication[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Analgésico", quantity: 200, minStock: 50, expiry: "2025-06-15", controlled: false },
  { id: "2", name: "Morfina 10mg", category: "Opióide", quantity: 15, minStock: 10, expiry: "2024-12-01", controlled: true },
  { id: "3", name: "Amoxicilina 500mg", category: "Antibiótico", quantity: 80, minStock: 30, expiry: "2024-08-20", controlled: false },
  { id: "4", name: "Losartana 50mg", category: "Anti-hipertensivo", quantity: 120, minStock: 40, expiry: "2025-03-10", controlled: false },
  { id: "5", name: "Diazepam 5mg", category: "Ansiolítico", quantity: 8, minStock: 10, expiry: "2024-11-15", controlled: true },
];

const getStatusColor = (status: CrewMember["medicalStatus"]) => {
  const colors = {
    "fit": "bg-emerald-500",
    "restricted": "bg-amber-500",
    "unfit": "bg-red-500",
    "pending": "bg-blue-500"
  };
  return colors[status];
};

export default function MedicalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const fitCount = mockCrew.filter(c => c.medicalStatus === "fit").length;
  const restrictedCount = mockCrew.filter(c => c.medicalStatus === "restricted").length;
  const expiringCerts = mockCrew.flatMap(c => c.certifications).filter(cert => cert.status === "expiring").length;
  const lowStockMeds = mockMedications.filter(m => m.quantity <= m.minStock).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Aptos</p>
                <p className="text-3xl font-bold text-emerald-600">{fitCount}/{mockCrew.length}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {((fitCount / mockCrew.length) * 100).toFixed(0)}% da tripulação
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(restrictedCount > 0 && "border-amber-500/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Restrição Médica</p>
                <p className={cn("text-3xl font-bold", restrictedCount > 0 ? "text-amber-600" : "text-muted-foreground")}>
                  {restrictedCount}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Requer acompanhamento
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(expiringCerts > 0 && "border-amber-500/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cert. Vencendo</p>
                <p className={cn("text-3xl font-bold", expiringCerts > 0 ? "text-amber-600" : "text-muted-foreground")}>
                  {expiringCerts}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Próximos 30 dias
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(lowStockMeds > 0 && "border-destructive/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className={cn("text-3xl font-bold", lowStockMeds > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {lowStockMeds}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Medicamentos
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", lowStockMeds > 0 ? "bg-destructive/20" : "bg-muted")}>
                <Pill className={cn("h-6 w-6", lowStockMeds > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(restrictedCount > 0 || expiringCerts > 0) && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-600">Atenção Requerida</p>
                <p className="text-sm text-muted-foreground">
                  {restrictedCount} tripulante(s) com restrição médica e {expiringCerts} certificação(ões) próximas do vencimento
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="crew" className="gap-2">
              <User className="h-4 w-4" />
              Tripulação
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Prontuários
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <Pill className="h-4 w-4" />
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="telemedicine" className="gap-2">
              <Video className="h-4 w-4" />
              Telemedicina
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status da Tripulação */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status Médico da Tripulação</CardTitle>
                <CardDescription>Resumo de aptidão por embarcação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["MV Atlantic Star", "MV Pacific Dream", "MV Ocean Pride"].map((vessel) => {
                    const vesselCrew = mockCrew.filter(c => c.vessel === vessel);
                    const fitPercent = vesselCrew.length ? (vesselCrew.filter(c => c.medicalStatus === "fit").length / vesselCrew.length) * 100 : 0;
                    
                    return (
                      <div key={vessel} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{vessel}</span>
                          <Badge variant={fitPercent === 100 ? "default" : "secondary"}>
                            {fitPercent.toFixed(0)}% Aptos
                          </Badge>
                        </div>
                        <Progress value={fitPercent} className="h-2" />
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Aptos: {vesselCrew.filter(c => c.medicalStatus === "fit").length}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Restrição: {vesselCrew.filter(c => c.medicalStatus === "restricted").length}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Pendente: {vesselCrew.filter(c => c.medicalStatus === "pending").length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Vencimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
                <CardDescription>Certificações médicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCrew.flatMap(crew => 
                    crew.certifications
                      .filter(cert => cert.status !== "valid")
                      .map(cert => ({ crew, cert }))
                  ).map(({ crew, cert }, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium text-sm">{crew.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={cert.status === "expired" ? "destructive" : "secondary"}>
                          {cert.status === "expired" ? "Vencido" : "Vencendo"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{cert.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tripulação</CardTitle>
              <CardDescription>Status médico individual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCrew.map((crew) => (
                  <div key={crew.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{crew.name}</span>
                          <Badge variant="outline">{crew.rank}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{crew.vessel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Último Exame:</span>
                        <p className="font-medium">{crew.lastCheckup}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Próximo:</span>
                        <p className="font-medium">{crew.nextCheckup}</p>
                      </div>
                      <Badge className={cn(
                        crew.medicalStatus === "fit" ? "bg-emerald-500" :
                        crew.medicalStatus === "restricted" ? "bg-amber-500" :
                        crew.medicalStatus === "unfit" ? "bg-red-500" : "bg-blue-500"
                      )}>
                        {crew.medicalStatus === "fit" ? "Apto" :
                         crew.medicalStatus === "restricted" ? "Restrição" :
                         crew.medicalStatus === "unfit" ? "Inapto" : "Pendente"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Ver Prontuário
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prontuários Médicos</CardTitle>
              <CardDescription>Histórico de atendimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockRecords.map((record) => (
                    <div key={record.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            record.type === "emergency" ? "bg-red-500/20 text-red-600" :
                            record.type === "telemedicine" ? "bg-purple-500/20 text-purple-600" :
                            record.type === "consultation" ? "bg-blue-500/20 text-blue-600" :
                            "bg-emerald-500/20 text-emerald-600"
                          )}>
                            {record.type === "emergency" ? <Ambulance className="h-4 w-4" /> :
                             record.type === "telemedicine" ? <Video className="h-4 w-4" /> :
                             record.type === "consultation" ? <Stethoscope className="h-4 w-4" /> :
                             <ClipboardList className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{record.crewName}</p>
                            <p className="text-sm text-muted-foreground">{record.date} • {record.doctor}</p>
                          </div>
                        </div>
                        <Badge variant={
                          record.status === "closed" ? "default" :
                          record.status === "follow-up" ? "secondary" : "outline"
                        }>
                          {record.status === "closed" ? "Encerrado" :
                           record.status === "follow-up" ? "Acompanhamento" : "Aberto"}
                        </Badge>
                      </div>
                      <div className="ml-11">
                        <p className="text-sm"><strong>Diagnóstico:</strong> {record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground"><strong>Tratamento:</strong> {record.treatment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estoque de Medicamentos</CardTitle>
                <CardDescription>Controle de medicamentos da enfermaria</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Medicamento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMedications.map((med) => {
                  const stockPercent = (med.quantity / med.minStock) * 50;
                  const isLowStock = med.quantity <= med.minStock;
                  const isExpiring = new Date(med.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <div key={med.id} className={cn(
                      "p-4 rounded-lg border",
                      isLowStock && "border-destructive/50 bg-destructive/5"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{med.name}</span>
                          {med.controlled && (
                            <Badge variant="outline" className="text-purple-600 border-purple-500">
                              <Shield className="h-3 w-3 mr-1" />
                              Controlado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isLowStock && (
                            <Badge variant="destructive">Estoque Baixo</Badge>
                          )}
                          {isExpiring && (
                            <Badge variant="secondary">Vencendo</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Categoria</span>
                          <p className="font-medium">{med.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantidade</span>
                          <p className={cn("font-medium", isLowStock && "text-destructive")}>
                            {med.quantity} un.
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estoque Mín.</span>
                          <p className="font-medium">{med.minStock} un.</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Validade</span>
                          <p className={cn("font-medium", isExpiring && "text-amber-600")}>{med.expiry}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemedicine" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" />
                  Telemedicina
                </CardTitle>
                <CardDescription>Consultas remotas com especialistas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <Video className="h-5 w-5 mr-2" />
                  Iniciar Consulta de Emergência
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Stethoscope className="h-6 w-6 mb-2" />
                    <span>Clínico Geral</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Heart className="h-6 w-6 mb-2" />
                    <span>Cardiologista</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    <span>Ortopedista</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <ThermometerSun className="h-6 w-6 mb-2" />
                    <span>Dermatologista</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Consultas</CardTitle>
                <CardDescription>Agendamentos de telemedicina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Carlos Santos</span>
                      <Badge className="bg-purple-500">Hoje 15:00</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Acompanhamento Cardiológico</p>
                    <p className="text-sm text-muted-foreground">Dr. Paulo Cardoso</p>
                    <Button className="w-full mt-3" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Entrar na Sala
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">João Silva</span>
                      <Badge variant="secondary">Amanhã 10:00</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Exame Periódico</p>
                    <p className="text-sm text-muted-foreground">Dra. Ana Oliveira</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
