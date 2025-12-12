import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  MapPin,
  Play,
  CheckCircle,
  AlertTriangle,
  Flame,
  LifeBuoy,
  Anchor,
  ShieldAlert,
  Save
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ScheduledDrill {
  id: string;
  title: string;
  type: string;
  date: Date;
  time: string;
  duration: string;
  location: string;
  coordinator: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

const initialDrills: ScheduledDrill[] = [
  { id: "1", title: "Exercício de Incêndio", type: "fire", date: addDays(new Date(), 3), time: "10:00", duration: "60", location: "Convés Principal", coordinator: "Capitão Silva", status: "scheduled" },
  { id: "2", title: "Abandono de Embarcação", type: "abandon", date: addDays(new Date(), 7), time: "14:00", duration: "90", location: "Área de Balsas", coordinator: "Imediato Santos", status: "scheduled" },
  { id: "3", title: "Homem ao Mar (MOB)", type: "mob", date: addDays(new Date(), 14), time: "08:00", duration: "45", location: "Convés Principal", coordinator: "Chefe de Máquinas", status: "scheduled" },
  { id: "4", title: "ISPS Security Drill", type: "isps", date: addDays(new Date(), 21), time: "11:00", duration: "60", location: "Áreas de Acesso", coordinator: "SSO - Oficial de Segurança", status: "scheduled" },
];

const DRILL_TYPES = [
  { value: "fire", label: "Combate a Incêndio", icon: Flame, color: "text-red-500" },
  { value: "abandon", label: "Abandono de Embarcação", icon: LifeBuoy, color: "text-blue-500" },
  { value: "mob", label: "Homem ao Mar", icon: Anchor, color: "text-cyan-500" },
  { value: "isps", label: "ISPS Security Drill", icon: ShieldAlert, color: "text-purple-500" },
  { value: "oil_spill", label: "Derramamento de Óleo", icon: AlertTriangle, color: "text-green-500" },
  { value: "medical", label: "Emergência Médica", icon: Plus, color: "text-pink-500" },
  { value: "blackout", label: "Blackout Recovery", icon: AlertTriangle, color: "text-amber-500" },
];

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function DrillsCalendarSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [drills, setDrills] = useState<ScheduledDrill[]>(initialDrills);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [drillSimulationOpen, setDrillSimulationOpen] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<ScheduledDrill | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    time: "10:00",
    duration: "60",
    location: "",
    coordinator: "",
    participants: "",
    objectives: "",
    notes: "",
  });

  const drillsOnSelectedDate = selectedDate 
    ? drills.filter(drill => isSameDay(drill.date, selectedDate))
    : [];

  const getDrillIcon = (type: string) => {
    const drillType = DRILL_TYPES.find(t => t.value === type);
    if (drillType) {
      const Icon = drillType.icon;
      return <Icon className={cn("h-5 w-5", drillType.color)} />;
    }
    return <CalendarIcon className="h-5 w-5" />;
  };

  const handleScheduleDrill = () => {
    if (!selectedDate || !formData.type || !formData.coordinator) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const drillType = DRILL_TYPES.find(t => t.value === formData.type);
    const newDrill: ScheduledDrill = {
      id: Date.now().toString(),
      title: drillType?.label || "Drill",
      type: formData.type,
      date: selectedDate,
      time: formData.time,
      duration: formData.duration,
      location: formData.location,
      coordinator: formData.coordinator,
      status: "scheduled",
    };

    setDrills(prev => [...prev, newDrill]);
    toast.success(`Drill agendado para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${formData.time}`);
    setScheduleDialogOpen(false);
    setFormData({
      type: "",
      time: "10:00",
      duration: "60",
      location: "",
      coordinator: "",
      participants: "",
      objectives: "",
      notes: "",
    });
  };

  const handleStartDrill = (drill: ScheduledDrill) => {
    setSelectedDrill(drill);
    setDrillSimulationOpen(true);
  };

  const handleCompleteDrill = () => {
    if (selectedDrill) {
      setDrills(prev => prev.map(d => 
        d.id === selectedDrill.id ? { ...d, status: "completed" as const } : d
      ));
      toast.success("Drill concluído e registrado com sucesso!");
      setDrillSimulationOpen(false);
      setSelectedDrill(null);
    }
  };

  const drillDates = drills.map(d => d.date);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Drills
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver ou agendar drills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                hasDrill: drillDates,
              }}
              modifiersClassNames={{
                hasDrill: "bg-orange-100 dark:bg-orange-900/30 font-bold",
              }}
            />
            <Separator className="my-4" />
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600"
              onClick={handleSetScheduleDialogOpen}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agendar Novo Drill
            </Button>
          </CardContent>
        </Card>

        {/* Drills for Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Drills em ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                : "Selecione uma data"
              }
            </CardTitle>
            <CardDescription>
              {drillsOnSelectedDate.length} drill(s) agendado(s) para esta data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {drillsOnSelectedDate.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum drill agendado</p>
                <p className="text-sm">Clique em "Agendar Novo Drill" para criar um</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {drillsOnSelectedDate.map((drill) => (
                    <Card key={drill.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-muted">
                              {getDrillIcon(drill.type)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{drill.title}</h3>
                              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {drill.time} ({drill.duration} min)
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {drill.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {drill.coordinator}
                                </div>
                                <Badge variant={drill.status === "completed" ? "default" : "secondary"}>
                                  {drill.status === "scheduled" ? "Agendado" : 
                                    drill.status === "in_progress" ? "Em Andamento" :
                                      drill.status === "completed" ? "Concluído" : "Cancelado"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {drill.status === "scheduled" && (
                              <Button 
                                onClick={() => handlehandleStartDrill}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar
                              </Button>
                            )}
                            {drill.status === "completed" && (
                              <Button variant="outline">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ver Relatório
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Drills */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Drills Agendados</CardTitle>
          <CardDescription>
            Visão geral de todos os drills programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drills
              .filter(d => d.status === "scheduled" && d.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 4)
              .map((drill) => (
                <Card key={drill.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getDrillIcon(drill.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{drill.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(drill.date, "dd/MM/yyyy", { locale: ptBR })} às {drill.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handlehandleStartDrill}>
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Drill Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Agendar Drill de Emergência
            </DialogTitle>
            <DialogDescription>
              Programe um drill conforme requisitos SOLAS/ISM/ISPS
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data do Drill *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Select value={formData.time} onValueChange={(v) => setFormData(prev => ({ ...prev, time: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Drill *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRILL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={cn("h-4 w-4", type.color)} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData(prev => ({ ...prev, duration: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Local / Área
              </Label>
              <Input
                value={formData.location}
                onChange={handleChange}))}
                placeholder="Ex: Convés principal, Praça de máquinas"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Coordenador *
              </Label>
              <Input
                value={formData.coordinator}
                onChange={handleChange}))}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label>Objetivos do Drill</Label>
              <Textarea
                value={formData.objectives}
                onChange={handleChange}))}
                placeholder="Descreva os objetivos..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSetScheduleDialogOpen}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleDrill} className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" />
              Agendar Drill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drill Simulation Dialog */}
      <Dialog open={drillSimulationOpen} onOpenChange={setDrillSimulationOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Executar Drill: {selectedDrill?.title}
            </DialogTitle>
            <DialogDescription>
              Registre a execução do drill e marque as etapas concluídas
            </DialogDescription>
          </DialogHeader>

          {selectedDrill && (
            <div className="space-y-4 py-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Data/Hora</p>
                      <p className="font-medium">{format(selectedDrill.date, "dd/MM/yyyy")} às {selectedDrill.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Local</p>
                      <p className="font-medium">{selectedDrill.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coordenador</p>
                      <p className="font-medium">{selectedDrill.coordinator}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Observações do Drill</Label>
                <Textarea
                  placeholder="Registre observações, não-conformidades ou pontos de melhoria..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Participantes (Total)</Label>
                <Input type="number" placeholder="Número de participantes" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleSetDrillSimulationOpen}>
              Cancelar
            </Button>
            <Button onClick={handleCompleteDrill} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir e Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
