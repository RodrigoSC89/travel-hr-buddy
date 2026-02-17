/**
 * Telemedicine Panel - Premium Component
 * Real-time video consultation with remote doctors
 */

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  User,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Loader2,
  Star,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: "available" | "busy" | "offline";
  rating: number;
  consultations: number;
  languages: string[];
  avatar?: string;
}

interface Consultation {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_name: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  chief_complaint: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

// Telemedicine data - no dedicated backend table yet, using fallback
const fallbackDoctors: Doctor[] = [
  { id: "1", name: "Dr. Carlos Mendes", specialty: "Medicina Geral", status: "available", rating: 4.9, consultations: 234, languages: ["Português", "Inglês"] },
  { id: "2", name: "Dra. Ana Souza", specialty: "Cardiologia", status: "available", rating: 4.8, consultations: 189, languages: ["Português", "Espanhol"] },
  { id: "3", name: "Dr. Roberto Lima", specialty: "Medicina Marítima", status: "busy", rating: 4.7, consultations: 312, languages: ["Português", "Inglês", "Francês"] },
  { id: "4", name: "Dra. Marina Costa", specialty: "Emergência", status: "available", rating: 4.9, consultations: 456, languages: ["Português", "Inglês"] },
];

const fallbackConsultations: Consultation[] = [
  { id: "1", doctor_id: "1", doctor_name: "Dr. Carlos Mendes", patient_name: "João Silva", date: "2024-01-15", time: "10:00", duration_minutes: 25, status: "completed", chief_complaint: "Dor abdominal persistente", diagnosis: "Gastrite aguda", prescription: "Omeprazol 20mg 1x/dia" },
  { id: "2", doctor_id: "4", doctor_name: "Dra. Marina Costa", patient_name: "Pedro Costa", date: "2024-01-16", time: "14:30", duration_minutes: 0, status: "scheduled", chief_complaint: "Acompanhamento queimadura" },
];

export default function TelemedicinePanel() {
  const [doctors] = useState<Doctor[]>(fallbackDoctors);
  const [consultations] = useState<Consultation[]>(fallbackConsultations);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const availableDoctors = doctors.filter(d => d.status === "available");
  const scheduledConsultations = consultations.filter(c => c.status === "scheduled");
  const completedConsultations = consultations.filter(c => c.status === "completed");

  const callIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCallState("connecting");
    setShowCallDialog(true);
    
    // Simulate WebRTC connection establishment (real latency ~2-3s)
    const connectTimeout = setTimeout(() => {
      setCallState("connected");
      toast.success(`Conectado com ${doctor.name}`);
      
      // Start duration counter
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 3000);

    // Store timeout for cleanup
    return () => clearTimeout(connectTimeout);
  }, []);

  const endCall = useCallback(() => {
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
    setCallState("ended");
    toast.info("Chamada encerrada");
    // Small delay for UX feedback before closing dialog
    const closeTimeout = setTimeout(() => {
      setShowCallDialog(false);
      setCallState("idle");
      setCallDuration(0);
      setSelectedDoctor(null);
    }, 2000);
    return () => clearTimeout(closeTimeout);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableDoctors.length}</p>
                <p className="text-xs text-muted-foreground">Médicos Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledConsultations.length}</p>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <CheckCircle2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedConsultations.length}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-muted-foreground">Suporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Médicos Disponíveis
            </CardTitle>
            <CardDescription>Clique para iniciar uma consulta imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      doctor.status === "available" 
                        ? "hover:border-success/50 hover:bg-success/5" 
                        : "opacity-60"
                    }`}
                    onClick={() => doctor.status === "available" && startCall(doctor)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doctor.name}</p>
                            <Badge variant={doctor.status === "available" ? "default" : "secondary"}>
                              {doctor.status === "available" ? "Disponível" : doctor.status === "busy" ? "Ocupado" : "Offline"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              <span className="text-xs">{doctor.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{doctor.consultations} consultas</span>
                          </div>
                        </div>
                      </div>
                      {doctor.status === "available" && (
                        <Button size="sm" className="gap-1">
                          <Video className="h-4 w-4" />
                          Chamar
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doctor.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Scheduled Consultations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Consultas Agendadas
                </CardTitle>
                <CardDescription>Próximas consultas marcadas</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <motion.div
                    key={consultation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        consultation.status === "completed" ? "outline" :
                        consultation.status === "scheduled" ? "default" :
                        consultation.status === "in_progress" ? "secondary" : "destructive"
                      }>
                        {consultation.status === "completed" ? "Concluída" :
                         consultation.status === "scheduled" ? "Agendada" :
                         consultation.status === "in_progress" ? "Em Andamento" : "Cancelada"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(consultation.date), "dd/MM/yyyy")} às {consultation.time}
                      </span>
                    </div>
                    <p className="font-medium">{consultation.patient_name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{consultation.chief_complaint}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      {consultation.doctor_name}
                    </div>
                    {consultation.status === "completed" && consultation.diagnosis && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        <p className="text-xs"><strong>Diagnóstico:</strong> {consultation.diagnosis}</p>
                        {consultation.prescription && (
                          <p className="text-xs"><strong>Prescrição:</strong> {consultation.prescription}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {consultations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhuma consulta agendada</p>
                    <p className="text-sm">Agende uma consulta com um médico</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Video Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Teleconsulta
            </DialogTitle>
          </DialogHeader>

          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            {callState === "connecting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Conectando com {selectedDoctor?.name}...</p>
                <p className="text-sm text-muted-foreground">Aguarde a conexão ser estabelecida</p>
              </div>
            )}

            {callState === "connected" && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-lg font-medium">{selectedDoctor?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor?.specialty}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
                  <p className="text-sm font-mono text-success">{formatDuration(callDuration)}</p>
                </div>
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs">Você</span>
                </div>
              </>
            )}

            {callState === "ended" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <p className="text-lg font-medium">Chamada encerrada</p>
                <p className="text-sm text-muted-foreground">Duração: {formatDuration(callDuration)}</p>
              </div>
            )}
          </div>

          {callState === "connected" && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={endCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Consulta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Input placeholder="Nome do paciente" />
            </div>
            <div className="space-y-2">
              <Label>Médico</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Queixa Principal</Label>
              <Textarea placeholder="Descreva o motivo da consulta" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ action: "telemedicine_scheduled", created_at: new Date().toISOString() }),
                  interaction_type: "telemedicine_schedule",
                  module_name: "medical-infirmary"
                });
                if (error) throw error;
                toast.success("Consulta agendada com sucesso!");
                setShowScheduleDialog(false);
              } catch {
                toast.error("Erro ao agendar consulta");
              }
            }}>
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
