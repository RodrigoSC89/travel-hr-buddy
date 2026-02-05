/**
 * FASE 8 - Digital Infirmary
 * EHR - Prontuário Eletrônico GDPR-compliant (benchmark: VIKAND)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Stethoscope, Heart, Pill, FileText, Shield, 
  Search, Plus, Calendar, Activity, AlertTriangle,
  CheckCircle, Clock, User, Lock, Video
} from "lucide-react";
import { toast } from "sonner";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  medicalStatus: "fit" | "restricted" | "unfit";
  lastExam: string;
  nextExam: string;
  conditions: string[];
  allergies: string[];
  medications: string[];
}

const crewMedical: CrewMember[] = [
  {
    id: "1",
    name: "João Silva",
    rank: "Capitão",
    vessel: "MV Atlântico Sul",
    medicalStatus: "fit",
    lastExam: "2024-01-15",
    nextExam: "2025-01-15",
    conditions: [],
    allergies: ["Penicilina"],
    medications: []
  },
  {
    id: "2",
    name: "Carlos Santos",
    rank: "1º Oficial",
    vessel: "MV Atlântico Sul",
    medicalStatus: "restricted",
    lastExam: "2024-02-01",
    nextExam: "2024-08-01",
    conditions: ["Hipertensão controlada"],
    allergies: [],
    medications: ["Losartana 50mg"]
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    rank: "Marinheiro",
    vessel: "PSV Oceano Azul",
    medicalStatus: "fit",
    lastExam: "2023-12-10",
    nextExam: "2024-12-10",
    conditions: [],
    allergies: ["Frutos do mar"],
    medications: []
  },
  {
    id: "4",
    name: "Miguel Costa",
    rank: "Engenheiro Chefe",
    vessel: "AHTS Maré Alta",
    medicalStatus: "unfit",
    lastExam: "2024-02-10",
    nextExam: "2024-03-10",
    conditions: ["Lesão lombar", "Em tratamento"],
    allergies: [],
    medications: ["Ibuprofeno 600mg", "Relaxante muscular"]
  },
];

const recentConsultations = [
  { id: "1", crew: "Carlos Santos", type: "Rotina", date: "2024-02-15", doctor: "Dr. Marina Lopes", status: "completed" },
  { id: "2", crew: "Miguel Costa", type: "Emergência", date: "2024-02-10", doctor: "Dr. Ricardo Alves", status: "follow-up" },
  { id: "3", crew: "João Silva", type: "Telemedicina", date: "2024-02-08", doctor: "Dr. Ana Ferreira", status: "completed" },
];

const getMedicalStatusBadge = (status: string) => {
  switch (status) {
    case "fit": return <Badge className="bg-success/20 text-success border-success/30">Apto</Badge>;
    case "restricted": return <Badge className="bg-warning/20 text-warning border-warning/30">Restrição</Badge>;
    case "unfit": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Inapto</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function DigitalInfirmaryEHR() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);

  const filteredCrew = crewMedical.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vessel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fitCount = crewMedical.filter(c => c.medicalStatus === "fit").length;
  const restrictedCount = crewMedical.filter(c => c.medicalStatus === "restricted").length;
  const unfitCount = crewMedical.filter(c => c.medicalStatus === "unfit").length;

  const handleStartTelemedicine = () => {
    toast.info("Iniciando consulta de telemedicina...");
  };

  return (
    <div className="space-y-6">
      {/* GDPR Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium">Dados Médicos Protegidos</p>
            <p className="text-sm text-muted-foreground">
              Acesso restrito conforme LGPD/GDPR. Todas as operações são registradas em audit trail.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            <Lock className="h-3 w-3 mr-1" />
            Criptografado
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Aptos</p>
                <p className="text-2xl font-bold text-success">{fitCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Restrição</p>
                <p className="text-2xl font-bold text-warning">{restrictedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Inaptos</p>
                <p className="text-2xl font-bold text-destructive">{unfitCount}</p>
              </div>
              <Heart className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tripulantes</p>
                <p className="text-2xl font-bold">{crewMedical.length}</p>
              </div>
              <User className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Prontuários Eletrônicos
                </CardTitle>
                <Button onClick={handleStartTelemedicine}>
                  <Video className="h-4 w-4 mr-2" />
                  Telemedicina
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar tripulante..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredCrew.map((crew) => (
                    <div 
                      key={crew.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedCrew?.id === crew.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedCrew(crew)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{crew.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{crew.name}</p>
                            <p className="text-sm text-muted-foreground">{crew.rank} • {crew.vessel}</p>
                          </div>
                        </div>
                        {getMedicalStatusBadge(crew.medicalStatus)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Último Exame</p>
                          <p className="font-medium">{crew.lastExam}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próximo Exame</p>
                          <p className="font-medium">{crew.nextExam}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Condições</p>
                          <p className="font-medium">{crew.conditions.length || "Nenhuma"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Crew Details */}
          {selectedCrew ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedCrew.name}</CardTitle>
                <CardDescription>{selectedCrew.rank}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Condições Médicas</p>
                  {selectedCrew.conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedCrew.conditions.map((c, i) => (
                        <Badge key={i} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma condição registrada</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Alergias</p>
                  {selectedCrew.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedCrew.allergies.map((a, i) => (
                        <Badge key={i} variant="destructive">{a}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma alergia conhecida</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Medicamentos Atuais</p>
                  {selectedCrew.medications.length > 0 ? (
                    <div className="space-y-1">
                      {selectedCrew.medications.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Pill className="h-3 w-3" />
                          {m}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum medicamento</p>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Prontuário Completo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um tripulante para ver detalhes</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Consultas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentConsultations.map((consult) => (
                <div key={consult.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{consult.crew}</p>
                    <p className="text-xs text-muted-foreground">{consult.type} • {consult.date}</p>
                  </div>
                  <Badge variant={consult.status === "completed" ? "default" : "secondary"}>
                    {consult.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
