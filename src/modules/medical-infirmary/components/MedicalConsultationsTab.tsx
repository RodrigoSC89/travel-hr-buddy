/**
 * Medical Consultations Tab - Complete attendance management
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  FileText,
  Activity,
  Heart,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Download,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConsultationWizard } from "./ConsultationWizard";

interface Consultation {
  id: string;
  patient_name: string;
  patient_role: string;
  date: string;
  time: string;
  chief_complaint: string;
  symptoms: string[];
  vital_signs: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    oxygen_saturation?: number;
  };
  diagnosis: string;
  treatment: string;
  medications_prescribed: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "follow_up";
  attending_officer: string;
  notes?: string;
}

// Fallback data
const fallbackConsultations: Consultation[] = [
  {
    id: "1",
    patient_name: "João Silva",
    patient_role: "Marinheiro",
    date: "2024-01-15",
    time: "08:30",
    chief_complaint: "Dor de cabeça persistente",
    symptoms: ["Cefaleia", "Náusea leve", "Fotofobia"],
    vital_signs: { temperature: 37.2, blood_pressure: "130/85", heart_rate: 78, oxygen_saturation: 98 },
    diagnosis: "Cefaleia tensional",
    treatment: "Repouso, hidratação, analgésico",
    medications_prescribed: ["Paracetamol 500mg 8/8h"],
    follow_up_required: true,
    follow_up_date: "2024-01-17",
    severity: "low",
    status: "completed",
    attending_officer: "Of. Médico Carlos",
    notes: "Paciente orientado a retornar se sintomas persistirem",
  },
  {
    id: "2",
    patient_name: "Pedro Costa",
    patient_role: "Cozinheiro",
    date: "2024-01-14",
    time: "14:15",
    chief_complaint: "Queimadura no braço",
    symptoms: ["Queimadura de 2º grau", "Dor local", "Edema"],
    vital_signs: { temperature: 36.8, blood_pressure: "120/80", heart_rate: 88, oxygen_saturation: 99 },
    diagnosis: "Queimadura térmica 2º grau em antebraço direito",
    treatment: "Curativo oclusivo, analgesia, profilaxia antitetânica",
    medications_prescribed: ["Dipirona 1g 6/6h", "Sulfadiazina de prata tópica"],
    follow_up_required: true,
    follow_up_date: "2024-01-16",
    severity: "medium",
    status: "follow_up",
    attending_officer: "Of. Médico Carlos",
    notes: "Curativo deve ser trocado diariamente",
  },
  {
    id: "3",
    patient_name: "Maria Santos",
    patient_role: "Oficial de Convés",
    date: "2024-01-14",
    time: "10:00",
    chief_complaint: "Mal estar e tontura",
    symptoms: ["Tontura", "Palidez", "Hipotensão"],
    vital_signs: { temperature: 36.5, blood_pressure: "100/60", heart_rate: 92, oxygen_saturation: 97 },
    diagnosis: "Hipotensão ortostática - desidratação",
    treatment: "Hidratação oral intensiva, repouso",
    medications_prescribed: ["Soro de reidratação oral"],
    follow_up_required: false,
    severity: "medium",
    status: "completed",
    attending_officer: "Of. Médico Carlos",
  },
];

const severityColors = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-accent/10 text-accent border-accent/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusLabels = {
  pending: { label: "Aguardando", color: "secondary" },
  in_progress: { label: "Em Atendimento", color: "default" },
  completed: { label: "Concluído", color: "outline" },
  follow_up: { label: "Retorno", color: "secondary" },
};

export default function MedicalConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>(fallbackConsultations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: consultations.length,
    pending: consultations.filter((c) => c.status === "pending").length,
    followUp: consultations.filter((c) => c.follow_up_required).length,
    today: consultations.filter((c) => c.date === format(new Date(), "yyyy-MM-dd")).length,
  };

  const handleNewConsultation = (data: Omit<Consultation, "id" | "date" | "time" | "status">) => {
    const newConsultation: Consultation = {
      id: Date.now().toString(),
      ...data,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      status: "completed",
    };
    setConsultations((prev) => [newConsultation, ...prev]);
    setShowWizard(false);
    toast.success("Atendimento registrado com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Atendimentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.followUp}</p>
                <p className="text-xs text-muted-foreground">Retornos Agendados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Atendimentos Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou sintoma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Aguardando</SelectItem>
              <SelectItem value="in_progress">Em Atendimento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="follow_up">Retorno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendimento
          </Button>
        </div>
      </div>

      {/* Consultation Wizard */}
      <ConsultationWizard
        open={showWizard}
        onOpenChange={(open) => {
          setShowWizard(open);
          if (!open) {
            // Refresh list when closed
          }
        }}
      />

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registro de Atendimentos
          </CardTitle>
          <CardDescription>
            {filteredConsultations.length} atendimentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              <AnimatePresence>
                {filteredConsultations.map((consultation, index) => (
                  <motion.div
                    key={consultation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border hover:border-primary/30 transition-all cursor-pointer bg-card"
                    onClick={() => {
                      setSelectedConsultation(consultation);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{consultation.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{consultation.patient_role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[consultation.severity]}>
                          {consultation.severity === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {consultation.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={statusLabels[consultation.status].color as "default" | "secondary" | "outline" | "destructive"}>
                          {statusLabels[consultation.status].label}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{consultation.chief_complaint}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {consultation.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(consultation.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {consultation.time}
                        </span>
                      </div>
                      <span>{consultation.attending_officer}</span>
                    </div>

                    {consultation.follow_up_required && consultation.follow_up_date && (
                      <div className="mt-2 pt-2 border-t text-xs text-info flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Retorno agendado: {format(new Date(consultation.follow_up_date), "dd/MM/yyyy")}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredConsultations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum atendimento encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou registre um novo atendimento</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Consultation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          {selectedConsultation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Detalhes do Atendimento
                </DialogTitle>
                <DialogDescription>
                  {selectedConsultation.patient_name} - {format(new Date(selectedConsultation.date), "dd/MM/yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Vital Signs */}
                <div className="grid grid-cols-4 gap-4">
                  {selectedConsultation.vital_signs.temperature && (
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Thermometer className="h-4 w-4 mx-auto mb-1 text-warning" />
                      <p className="text-lg font-bold">{selectedConsultation.vital_signs.temperature}°C</p>
                      <p className="text-xs text-muted-foreground">Temperatura</p>
                    </div>
                  )}
                  {selectedConsultation.vital_signs.blood_pressure && (
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Activity className="h-4 w-4 mx-auto mb-1 text-destructive" />
                      <p className="text-lg font-bold">{selectedConsultation.vital_signs.blood_pressure}</p>
                      <p className="text-xs text-muted-foreground">Pressão</p>
                    </div>
                  )}
                  {selectedConsultation.vital_signs.heart_rate && (
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Heart className="h-4 w-4 mx-auto mb-1 text-destructive" />
                      <p className="text-lg font-bold">{selectedConsultation.vital_signs.heart_rate}</p>
                      <p className="text-xs text-muted-foreground">FC (bpm)</p>
                    </div>
                  )}
                  {selectedConsultation.vital_signs.oxygen_saturation && (
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Activity className="h-4 w-4 mx-auto mb-1 text-info" />
                      <p className="text-lg font-bold">{selectedConsultation.vital_signs.oxygen_saturation}%</p>
                      <p className="text-xs text-muted-foreground">SpO2</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Queixa Principal</Label>
                    <p className="font-medium">{selectedConsultation.chief_complaint}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Diagnóstico</Label>
                    <p className="font-medium">{selectedConsultation.diagnosis}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Tratamento</Label>
                    <p>{selectedConsultation.treatment}</p>
                  </div>

                  {selectedConsultation.medications_prescribed.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Medicações Prescritas</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedConsultation.medications_prescribed.map((med, i) => (
                          <Badge key={`med-${med}-${i}`} variant="secondary">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedConsultation.notes && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Observações</Label>
                      <p className="text-sm">{selectedConsultation.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
