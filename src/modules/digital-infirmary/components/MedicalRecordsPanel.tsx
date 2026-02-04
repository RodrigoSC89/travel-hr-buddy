/**
 * Medical Records Panel - Prontuário Eletrônico Digital
 * Histórico médico completo com timeline e anexos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Pill,
  Syringe,
  Heart,
  Activity,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  Clock,
  User,
  Stethoscope,
  Clipboard,
  BarChart3,
  Shield,
  Eye,
  Edit,
  Trash2,
  Upload,
  FileImage,
  FileType,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  birthDate: Date;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
  lastCheckup: Date;
  fitnessStatus: "fit" | "restricted" | "unfit";
}

interface MedicalEvent {
  id: string;
  type: "consultation" | "procedure" | "medication" | "test" | "vaccination" | "incident";
  date: Date;
  title: string;
  description: string;
  provider: string;
  attachments?: string[];
  results?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  status: "active" | "completed" | "discontinued";
}

const MOCK_CREW: CrewMember = {
  id: "CREW-001",
  name: "João Carlos Silva",
  rank: "1° Oficial de Náutica",
  birthDate: new Date(1985, 5, 15),
  bloodType: "O+",
  allergies: ["Penicilina", "Dipirona"],
  chronicConditions: ["Hipertensão leve"],
  emergencyContact: "Maria Silva - (11) 99999-8888",
  lastCheckup: new Date(2024, 0, 15),
  fitnessStatus: "fit",
};

const MOCK_HISTORY: MedicalEvent[] = [
  {
    id: "1",
    type: "consultation",
    date: new Date(2024, 0, 20),
    title: "Consulta de Rotina",
    description: "Exame físico completo. Pressão arterial controlada.",
    provider: "Dr. Carlos Mendes",
  },
  {
    id: "2",
    type: "test",
    date: new Date(2024, 0, 15),
    title: "Exames Laboratoriais",
    description: "Hemograma, glicemia, lipidograma",
    provider: "Lab. Naval",
    results: "Todos os valores dentro da normalidade",
  },
  {
    id: "3",
    type: "vaccination",
    date: new Date(2023, 11, 10),
    title: "Vacina Febre Amarela",
    description: "Reforço decenal",
    provider: "Posto Médico",
  },
  {
    id: "4",
    type: "incident",
    date: new Date(2023, 10, 5),
    title: "Lesão no Tornozelo",
    description: "Torção durante manobra. Tratado com repouso e anti-inflamatório.",
    provider: "Dr. Roberto Lima",
  },
];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Losartana",
    dosage: "50mg",
    frequency: "1x ao dia",
    startDate: new Date(2023, 6, 1),
    prescribedBy: "Dr. Carlos Mendes",
    status: "active",
  },
  {
    id: "2",
    name: "Ibuprofeno",
    dosage: "400mg",
    frequency: "8/8h se dor",
    startDate: new Date(2023, 10, 5),
    endDate: new Date(2023, 10, 12),
    prescribedBy: "Dr. Roberto Lima",
    status: "completed",
  },
];

export default function MedicalRecordsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<CrewMember>(MOCK_CREW);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const getEventIcon = (type: MedicalEvent["type"]) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <Clipboard className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "test":
        return <BarChart3 className="h-4 w-4" />;
      case "vaccination":
        return <Syringe className="h-4 w-4" />;
      case "incident":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: MedicalEvent["type"]) => {
    switch (type) {
      case "consultation":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "procedure":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "medication":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "test":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/30";
      case "vaccination":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "incident":
        return "bg-red-500/10 text-red-500 border-red-500/30";
    }
  };

  const getFitnessColor = (status: CrewMember["fitnessStatus"]) => {
    switch (status) {
      case "fit":
        return "bg-green-500/10 text-green-500";
      case "restricted":
        return "bg-amber-500/10 text-amber-500";
      case "unfit":
        return "bg-red-500/10 text-red-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tripulante por nome, ID ou matrícula..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Trocar Paciente
            </Button>
            <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entrada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar ao Prontuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Registro</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consulta</SelectItem>
                          <SelectItem value="procedure">Procedimento</SelectItem>
                          <SelectItem value="medication">Medicação</SelectItem>
                          <SelectItem value="test">Exame</SelectItem>
                          <SelectItem value="vaccination">Vacinação</SelectItem>
                          <SelectItem value="incident">Incidente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                    </div>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input placeholder="Ex: Consulta de acompanhamento" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea placeholder="Detalhes do atendimento..." rows={4} />
                  </div>
                  <div>
                    <Label>Anexos</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Arraste arquivos ou clique para fazer upload
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Selecionar Arquivos
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => {
                      toast.success("Registro adicionado ao prontuário!");
                      setShowNewEntry(false);
                    }}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {selectedCrew.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCrew.name}</h2>
                  <p className="text-muted-foreground">{selectedCrew.rank}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline">{selectedCrew.id}</Badge>
                    <Badge className={getFitnessColor(selectedCrew.fitnessStatus)}>
                      {selectedCrew.fitnessStatus === "fit"
                        ? "Apto"
                        : selectedCrew.fitnessStatus === "restricted"
                        ? "Restrito"
                        : "Inapto"}
                    </Badge>
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">
                      {selectedCrew.bloodType}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p className="font-medium">{format(selectedCrew.birthDate, "dd/MM/yyyy")}</p>
              <p className="text-sm text-muted-foreground">
                {Math.floor((Date.now() - selectedCrew.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Alergias</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedCrew.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Condições Crônicas</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedCrew.chronicConditions.map((condition, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Último Check-up</p>
              <p className="font-medium">{format(selectedCrew.lastCheckup, "dd/MM/yyyy")}</p>
              <p className="text-sm text-muted-foreground">há {Math.floor((Date.now() - selectedCrew.lastCheckup.getTime()) / (24 * 60 * 60 * 1000))} dias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico Médico
            </CardTitle>
            <CardDescription>Linha do tempo de eventos médicos</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="relative pl-8">
                {/* Timeline Line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                {MOCK_HISTORY.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pb-6"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}
                    >
                      {getEventIcon(event.type)}
                    </div>

                    <div className="ml-6 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          {event.results && (
                            <div className="mt-2 p-2 bg-green-500/5 border border-green-500/20 rounded text-sm text-green-700 dark:text-green-400">
                              <strong>Resultado:</strong> {event.results}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {event.provider}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Medications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4" />
                Medicações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_MEDICATIONS.filter((m) => m.status === "active").map((med) => (
                  <div key={med.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desde {format(med.startDate, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500">Ativo</Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Medicação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Últimos Sinais Vitais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Pressão Arterial</span>
                  <span className="font-medium">120/80 mmHg</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Freq. Cardíaca</span>
                  <span className="font-medium">72 bpm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Temperatura</span>
                  <span className="font-medium">36.5 °C</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">SpO2</span>
                  <span className="font-medium">98%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Registrado em 20/01/2024 às 10:30
              </p>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <FileType className="h-5 w-5 text-destructive" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Hemograma_Jan2024.pdf</p>
                    <p className="text-xs text-muted-foreground">15/01/2024</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <FileImage className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Raio_X_Torax.jpg</p>
                    <p className="text-xs text-muted-foreground">10/01/2024</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <FileType className="h-5 w-5 text-destructive" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Atestado_Aptidao.pdf</p>
                    <p className="text-xs text-muted-foreground">05/01/2024</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
