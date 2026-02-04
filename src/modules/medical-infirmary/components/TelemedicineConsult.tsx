/**
 * TelemedicineConsult - Componente Premium de Telemedicina
 * Consulta remota com médicos em terra, histórico e prontuário digital
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Video, PhoneOff, Mic, MicOff, Camera, CameraOff,
  MessageSquare, FileText, Clock, User, Stethoscope, 
  Calendar, ArrowRight, CheckCircle2, AlertTriangle,
  Heart, Activity, Thermometer, Brain, Pill, ClipboardList,
  Download, Send, Star
} from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  available: boolean;
  rating: number;
  experience: string;
  languages: string[];
}

interface ConsultHistory {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  prescription?: string;
  followUp?: string;
  status: "completed" | "pending-followup" | "cancelled";
}

const availableDoctors: Doctor[] = [
  { id: "1", name: "Dr. Carlos Mendes", specialty: "Clínico Geral", available: true, rating: 4.9, experience: "15 anos", languages: ["PT", "EN"] },
  { id: "2", name: "Dra. Ana Santos", specialty: "Cardiologista", available: true, rating: 4.8, experience: "12 anos", languages: ["PT", "EN", "ES"] },
  { id: "3", name: "Dr. João Oliveira", specialty: "Ortopedista", available: false, rating: 4.7, experience: "10 anos", languages: ["PT", "EN"] },
  { id: "4", name: "Dra. Maria Costa", specialty: "Dermatologista", available: true, rating: 4.9, experience: "8 anos", languages: ["PT", "EN"] },
  { id: "5", name: "Dr. Ricardo Lima", specialty: "Medicina do Trabalho", available: true, rating: 4.6, experience: "20 anos", languages: ["PT"] },
];

const consultHistory: ConsultHistory[] = [
  { id: "1", date: "2026-02-01", doctor: "Dr. Carlos Mendes", specialty: "Clínico Geral", diagnosis: "Gastroenterite leve", prescription: "Hidratação oral, dieta leve", status: "completed" },
  { id: "2", date: "2026-01-28", doctor: "Dra. Ana Santos", specialty: "Cardiologista", diagnosis: "Avaliação preventiva - Apto", status: "completed" },
  { id: "3", date: "2026-01-15", doctor: "Dr. João Oliveira", specialty: "Ortopedista", diagnosis: "Tendinite ombro direito", prescription: "Anti-inflamatório, fisioterapia", followUp: "Retorno em 30 dias", status: "pending-followup" },
];

function DoctorCard({ doctor, onSelect }: { doctor: Doctor; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        doctor.available 
          ? "hover:border-primary hover:bg-accent/50" 
          : "opacity-50 cursor-not-allowed"
      }`}
      onClick={doctor.available ? onSelect : undefined}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{doctor.name}</h4>
            <Badge variant={doctor.available ? "default" : "secondary"}>
              {doctor.available ? "Disponível" : "Ocupado"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {doctor.rating}
            </span>
            <span>{doctor.experience}</span>
            <span>{doctor.languages.join(", ")}</span>
          </div>
        </div>
      </div>
      {doctor.available && (
        <Button size="sm" className="w-full mt-3 gap-2">
          <Video className="h-4 w-4" />
          Iniciar Consulta
        </Button>
      )}
    </motion.div>
  );
}

function VideoCallInterface({ doctor, onEnd }: { doctor: Doctor; onEnd: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Area */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
        {/* Doctor Video (Main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto border-4 border-primary/50">
              <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-medium mt-3">{doctor.name}</p>
            <p className="text-white/70 text-sm">{doctor.specialty}</p>
            <Badge variant="secondary" className="mt-2">
              <Activity className="h-3 w-3 mr-1" />
              Em consulta
            </Badge>
          </div>
        </div>

        {/* Self Video (PIP) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-700 rounded-lg border-2 border-white/20 overflow-hidden">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              <CameraOff className="h-6 w-6 text-white/50" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/20">
              <User className="h-8 w-8 text-white/70" />
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full">
          <span className="text-white text-sm font-mono">{formatDuration(duration)}</span>
        </div>

        {/* Quality Indicator */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-success/80 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs">HD</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isVideoOff ? "destructive" : "outline"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={onEnd}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
        >
          <FileText className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4 text-destructive" />
          Sinais Vitais
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Pill className="h-4 w-4 text-primary" />
          Medicamentos
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <ClipboardList className="h-4 w-4 text-warning" />
          Histórico
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4 text-success" />
          Prontuário
        </Button>
      </div>
    </div>
  );
}

export default function TelemedicineConsult() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleStartConsult = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    toast.loading("Conectando com " + doctor.name + "...");
    setTimeout(() => {
      setIsInCall(true);
      toast.success("Consulta iniciada!");
    }, 2000);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setSelectedDoctor(null);
    toast.info("Consulta finalizada. Resumo será enviado por email.");
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Médicos Online</p>
                <p className="text-2xl font-bold text-success">
                  {availableDoctors.filter(d => d.available).length}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Consultas Mês</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Video className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Retornos</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <Calendar className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold text-purple-600">98%</p>
              </div>
              <Star className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call or Doctor Selection */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    {isInCall ? "Consulta em Andamento" : "Telemedicina 24/7"}
                  </CardTitle>
                  <CardDescription>
                    {isInCall 
                      ? `Conectado com ${selectedDoctor?.name}`
                      : "Selecione um médico disponível para iniciar"
                    }
                  </CardDescription>
                </div>
                {!isInCall && (
                  <Button variant="outline" onClick={() => setShowSchedule(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isInCall && selectedDoctor ? (
                  <motion.div
                    key="call"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <VideoCallInterface doctor={selectedDoctor} onEnd={handleEndCall} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="doctors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {availableDoctors.map((doctor) => (
                          <DoctorCard
                            key={doctor.id}
                            doctor={doctor}
                            onSelect={() => handleStartConsult(doctor)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Consultation History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Histórico de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {consultHistory.map((consult) => (
                  <motion.div
                    key={consult.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{consult.doctor}</p>
                        <p className="text-xs text-muted-foreground">{consult.specialty}</p>
                      </div>
                      <Badge variant={
                        consult.status === "completed" ? "default" :
                        consult.status === "pending-followup" ? "secondary" : "destructive"
                      }>
                        {consult.status === "completed" ? "Concluída" :
                         consult.status === "pending-followup" ? "Retorno" : "Cancelada"}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-sm">{consult.diagnosis}</p>
                    {consult.prescription && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💊 {consult.prescription}
                      </p>
                    )}
                    {consult.followUp && (
                      <p className="text-xs text-warning mt-1">
                        📅 {consult.followUp}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{consult.date}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
