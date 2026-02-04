/**
 * Telemedicine Panel - Consultas remotas com especialistas
 * Integração com videoconferência e prontuário digital
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Video,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  AlertCircle,
  CheckCircle2,
  Plus,
  History,
  Heart,
  Activity,
  Thermometer,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  specialistName: string;
  specialistType: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: Date;
  duration?: number;
  notes?: string;
  diagnosis?: string;
  prescription?: string[];
}

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  avatar?: string;
  rating: number;
  consultations: number;
}

const MOCK_SPECIALISTS: Specialist[] = [
  { id: "1", name: "Dr. Carlos Mendes", specialty: "Clínico Geral", available: true, rating: 4.9, consultations: 342 },
  { id: "2", name: "Dra. Ana Silva", specialty: "Cardiologista", available: true, rating: 4.8, consultations: 256 },
  { id: "3", name: "Dr. Roberto Lima", specialty: "Ortopedista", available: false, rating: 4.7, consultations: 189 },
  { id: "4", name: "Dra. Maria Santos", specialty: "Dermatologista", available: true, rating: 4.9, consultations: 421 },
  { id: "5", name: "Dr. Paulo Costa", specialty: "Psiquiatra", available: true, rating: 4.8, consultations: 167 },
];

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: "1",
    patientName: "João Silva",
    patientId: "CREW-001",
    specialistName: "Dr. Carlos Mendes",
    specialistType: "Clínico Geral",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    notes: "Queixa de dores nas costas",
  },
  {
    id: "2",
    patientName: "Maria Santos",
    patientId: "CREW-002",
    specialistName: "Dra. Ana Silva",
    specialistType: "Cardiologista",
    status: "completed",
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 25,
    diagnosis: "Hipertensão leve",
    prescription: ["Losartana 50mg", "Monitoramento diário"],
  },
];

export default function TelemedicinePanel() {
  const [activeCall, setActiveCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; time: Date }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConsultation, setShowNewConsultation] = useState(false);

  const startCall = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setActiveCall(true);
    toast.success(`Conectando com ${specialist.name}...`);
  };

  const endCall = () => {
    setActiveCall(false);
    setSelectedSpecialist(null);
    toast.info("Chamada encerrada");
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { sender: "Você", message: newMessage, time: new Date() }]);
      setNewMessage("");
      // Simulate response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: selectedSpecialist?.name || "Médico",
            message: "Recebi sua mensagem. Vamos discutir isso na consulta.",
            time: new Date(),
          },
        ]);
      }, 2000);
    }
  };

  const getStatusColor = (status: Consultation["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500";
      case "in_progress":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-gray-500/10 text-gray-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médicos Online</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">18min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">4.8★</p>
              </div>
              <Heart className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Call View */}
      <AnimatePresence>
        {activeCall && selectedSpecialist && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-2 border-green-500/50">
              <CardHeader className="bg-green-500/10">
                <CardTitle className="flex items-center gap-2">
                  <div className="animate-pulse h-3 w-3 rounded-full bg-green-500" />
                  Chamada em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Area */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Avatar className="h-32 w-32">
                          <AvatarFallback className="text-4xl">
                            {selectedSpecialist.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* Self View */}
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white/20">
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                          {videoEnabled ? <User className="h-8 w-8" /> : <VideoOff className="h-8 w-8" />}
                        </div>
                      </div>
                      {/* Call Info */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                        <div className="animate-pulse h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-white text-sm">00:05:32</span>
                      </div>
                    </div>
                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={audioEnabled ? "outline" : "destructive"}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                      </Button>
                      <Button
                        variant={videoEnabled ? "outline" : "destructive"}
                        size="lg"
                        className="rounded-full h-14 w-14"
                        onClick={() => setVideoEnabled(!videoEnabled)}
                      >
                        {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                      </Button>
                      <Button variant="destructive" size="lg" className="rounded-full h-14 w-14" onClick={endCall}>
                        <PhoneOff className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>

                  {/* Chat Sidebar */}
                  <div className="flex flex-col h-[400px]">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">Chat</span>
                    </div>
                    <ScrollArea className="flex-1 border rounded-lg p-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`mb-3 ${msg.sender === "Você" ? "text-right" : ""}`}>
                          <div
                            className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                              msg.sender === "Você" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">{format(msg.time, "HH:mm")}</p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Digite uma mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specialists List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Especialistas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {MOCK_SPECIALISTS.map((specialist) => (
                  <motion.div
                    key={specialist.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      specialist.available
                        ? "hover:bg-green-500/5 hover:border-green-500/30"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{specialist.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{specialist.name}</p>
                          {specialist.available && (
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>⭐ {specialist.rating}</span>
                          <span>•</span>
                          <span>{specialist.consultations} consultas</span>
                        </div>
                      </div>
                    </div>
                    {specialist.available && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1" onClick={() => startCall(specialist)}>
                          <Video className="h-4 w-4 mr-1" />
                          Chamar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Agendar
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Consultas
              </CardTitle>
              <CardDescription>Agendadas e realizadas</CardDescription>
            </div>
            <Dialog open={showNewConsultation} onOpenChange={setShowNewConsultation}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendar Nova Consulta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Tripulante</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tripulante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crew1">João Silva - CREW-001</SelectItem>
                        <SelectItem value="crew2">Maria Santos - CREW-002</SelectItem>
                        <SelectItem value="crew3">Pedro Costa - CREW-003</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Especialidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Clínico Geral</SelectItem>
                        <SelectItem value="cardio">Cardiologista</SelectItem>
                        <SelectItem value="orto">Ortopedista</SelectItem>
                        <SelectItem value="psiq">Psiquiatra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Motivo da Consulta</Label>
                    <Textarea placeholder="Descreva o motivo da consulta..." />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => {
                      toast.success("Consulta agendada com sucesso!");
                      setShowNewConsultation(false);
                    }}>
                      Agendar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewConsultation(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <div className="space-y-3">
                  {MOCK_CONSULTATIONS.filter((c) => c.status === "scheduled").map((consultation) => (
                    <motion.div
                      key={consultation.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {consultation.patientName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{consultation.patientName}</p>
                            <p className="text-sm text-muted-foreground">{consultation.patientId}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Stethoscope className="h-4 w-4 text-muted-foreground" />
                              <span>{consultation.specialistName}</span>
                              <Badge variant="secondary">{consultation.specialistType}</Badge>
                            </div>
                            {consultation.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">"{consultation.notes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status === "scheduled" ? "Agendada" : consultation.status}
                          </Badge>
                          <p className="text-sm mt-2">
                            {format(consultation.scheduledAt, "dd MMM, HH:mm", { locale: ptBR })}
                          </p>
                          <Button size="sm" className="mt-2">
                            <Video className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-3">
                  {MOCK_CONSULTATIONS.filter((c) => c.status === "completed").map((consultation) => (
                    <div key={consultation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {consultation.patientName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{consultation.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {consultation.specialistName} • {consultation.duration}min
                            </p>
                            {consultation.diagnosis && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <p className="text-sm font-medium">Diagnóstico:</p>
                                <p className="text-sm">{consultation.diagnosis}</p>
                              </div>
                            )}
                            {consultation.prescription && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Prescrição:</p>
                                <ul className="text-sm text-muted-foreground">
                                  {consultation.prescription.map((p, i) => (
                                    <li key={i}>• {p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(consultation.status)}>Concluída</Badge>
                          <p className="text-sm mt-2 text-muted-foreground">
                            {format(consultation.scheduledAt, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">
                            <FileText className="h-4 w-4 mr-1" />
                            Prontuário
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Health Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Triagem Rápida Assistida por IA
          </CardTitle>
          <CardDescription>
            Avaliação inicial para determinar prioridade e especialidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span>Cardiovascular</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <span>Neurológico</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <span>Febre/Infecção</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <span>Outros Sintomas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
