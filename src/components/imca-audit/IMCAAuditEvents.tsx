import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Plus, 
  Send,
  FileText,
  Clock,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  ExternalLink
} from "lucide-react";

type EventType = "incident" | "undesired" | "observation";
type EventSeverity = "high" | "medium" | "low";
type EventStatus = "open" | "investigating" | "closed" | "submitted_imca";

interface DPEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  severity: EventSeverity;
  status: EventStatus;
  dateOccurred: Date;
  location: string;
  vesselName: string;
  dpClass: "DP1" | "DP2" | "DP3";
  systemsAffected: string[];
  rootCause?: string;
  correctiveAction?: string;
  lessonsLearned?: string;
  imcaSubmitted: boolean;
  imcaReference?: string;
  createdAt: Date;
}

const SAMPLE_EVENTS: DPEvent[] = [
  {
    id: "EVT-001",
    type: "incident",
    title: "Perda temporária de posição durante operação de diving",
    description: "Durante operação de mergulho em DP2, houve drift de 15m devido a falha simultânea de dois sensores de posição. Sistema recuperou após 3 minutos.",
    severity: "high",
    status: "investigating",
    dateOccurred: new Date(2024, 11, 1),
    location: "Campos Basin, Brazil",
    vesselName: "DSV Ocean Explorer",
    dpClass: "DP2",
    systemsAffected: ["GPS Primary", "GPS Secondary", "DP Controller A"],
    rootCause: "Interferência de sinal GPS não prevista no FMEA",
    imcaSubmitted: false,
    createdAt: new Date()
  },
  {
    id: "EVT-002",
    type: "undesired",
    title: "Alarme de thruster não atendido em tempo adequado",
    description: "Alarme de superaquecimento do thruster #3 foi reconhecido com 5 minutos de atraso. Não houve impacto operacional.",
    severity: "medium",
    status: "closed",
    dateOccurred: new Date(2024, 10, 28),
    location: "Santos Basin",
    vesselName: "PSV Support One",
    dpClass: "DP2",
    systemsAffected: ["Thruster #3", "Alarm System"],
    correctiveAction: "Reforço no treinamento de watchkeeping e revisão do layout de alarmes",
    lessonsLearned: "Priorização de alarmes críticos deve ser revisada conforme IMCA M182",
    imcaSubmitted: true,
    imcaReference: "IMCA-2024-BR-0142",
    createdAt: new Date()
  },
  {
    id: "EVT-003",
    type: "observation",
    title: "Procedimento de changeover não seguiu checklist",
    description: "Durante troca de turno, checklist de handover não foi completamente preenchido. Items de configuração DP não verificados.",
    severity: "low",
    status: "closed",
    dateOccurred: new Date(2024, 10, 25),
    location: "Offshore",
    vesselName: "PLSV Constructor",
    dpClass: "DP3",
    systemsAffected: ["Procedures"],
    correctiveAction: "Briefing com equipe sobre importância do checklist de handover",
    imcaSubmitted: false,
    createdAt: new Date()
  }
];

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
}

export function IMCAAuditEvents({ selectedDPClass }: Props) {
  const { toast } = useToast();
  const [events, setEvents] = useState<DPEvent[]>(SAMPLE_EVENTS);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DPEvent | null>(null);

  const [newEvent, setNewEvent] = useState<Partial<DPEvent>>({
    type: "observation",
    severity: "low",
    status: "open",
    dpClass: selectedDPClass,
    systemsAffected: []
  });

  const incidents = events.filter(e => e.type === "incident");
  const undesiredEvents = events.filter(e => e.type === "undesired");
  const observations = events.filter(e => e.type === "observation");

  const getEventIcon = (type: EventType) => {
    switch (type) {
    case "incident": return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case "undesired": return <AlertCircle className="h-5 w-5 text-amber-600" />;
    case "observation": return <Eye className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: EventSeverity) => {
    switch (severity) {
    case "high": return <Badge variant="destructive">Alta</Badge>;
    case "medium": return <Badge className="bg-amber-500">Média</Badge>;
    case "low": return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
    case "open": return <Badge variant="outline" className="border-amber-500 text-amber-600">Aberto</Badge>;
    case "investigating": return <Badge variant="outline" className="border-blue-500 text-blue-600">Investigando</Badge>;
    case "closed": return <Badge variant="outline" className="border-green-500 text-green-600">Fechado</Badge>;
    case "submitted_imca": return <Badge className="bg-purple-500">Enviado IMCA</Badge>;
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.description) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const event: DPEvent = {
      id: `EVT-${String(events.length + 1).padStart(3, "0")}`,
      type: newEvent.type || "observation",
      title: newEvent.title!,
      description: newEvent.description!,
      severity: newEvent.severity || "low",
      status: "open",
      dateOccurred: new Date(),
      location: newEvent.location || "",
      vesselName: newEvent.vesselName || "",
      dpClass: selectedDPClass,
      systemsAffected: newEvent.systemsAffected || [],
      imcaSubmitted: false,
      createdAt: new Date()
    };

    setEvents([event, ...events]);
    setNewEvent({ type: "observation", severity: "low", status: "open", dpClass: selectedDPClass, systemsAffected: [] });
    setIsAddEventOpen(false);

    toast({ title: "Evento registrado", description: `${event.id} - ${event.title}` });
  };

  const handleSubmitToIMCA = (event: DPEvent) => {
    const updatedEvents = events.map(e => 
      e.id === event.id 
        ? { ...e, imcaSubmitted: true, status: "submitted_imca" as EventStatus, imcaReference: `IMCA-2024-BR-${Math.floor(Math.random() * 9000) + 1000}` }
        : e
    );
    setEvents(updatedEvents);
    
    toast({
      title: "Evento enviado ao IMCA",
      description: "O formulário IMCA foi preenchido e submetido ao banco de dados."
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-red-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DP Incidents</p>
                <p className="text-3xl font-bold text-red-600">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Undesired Events</p>
                <p className="text-3xl font-bold text-amber-600">{undesiredEvents.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Observations</p>
                <p className="text-3xl font-bold text-blue-600">{observations.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviados IMCA</p>
                <p className="text-3xl font-bold text-purple-600">
                  {events.filter(e => e.imcaSubmitted).length}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Registro de Eventos DP</h3>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Evento DP</DialogTitle>
              <DialogDescription>
                Classifique conforme IMCA M190: Incident, Undesired Event ou Observation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Evento *</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={v => setNewEvent({ ...newEvent, type: v as EventType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          DP Incident
                        </span>
                      </SelectItem>
                      <SelectItem value="undesired">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          Undesired Event
                        </span>
                      </SelectItem>
                      <SelectItem value="observation">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          Observation
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severidade *</Label>
                  <Select 
                    value={newEvent.severity} 
                    onValueChange={v => setNewEvent({ ...newEvent, severity: v as EventSeverity })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  value={newEvent.title || ""}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Resumo do evento..."
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Detalhada *</Label>
                <Textarea 
                  value={newEvent.description || ""}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="O que aconteceu, quando, como, impacto..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Embarcação</Label>
                  <Input 
                    value={newEvent.vesselName || ""}
                    onChange={e => setNewEvent({ ...newEvent, vesselName: e.target.value })}
                    placeholder="Nome da embarcação"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input 
                    value={newEvent.location || ""}
                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Ex: Campos Basin"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEvent}>
                Registrar Evento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {events.map(event => (
            <Card 
              key={event.id}
              className={`transition-colors ${
                event.type === "incident" ? "border-red-500/30" :
                  event.type === "undesired" ? "border-amber-500/30" :
                    "border-blue-500/30"
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getEventIcon(event.type)}
                      <Badge variant="outline" className="font-mono">{event.id}</Badge>
                      {getSeverityBadge(event.severity)}
                      {getStatusBadge(event.status)}
                      <Badge variant="secondary">{event.dpClass}</Badge>
                      {event.imcaSubmitted && (
                        <Badge className="bg-purple-500 gap-1">
                          <Send className="h-3 w-3" />
                          {event.imcaReference}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.dateOccurred.toLocaleDateString("pt-BR")}
                      </span>
                      <span>{event.vesselName}</span>
                      <span>{event.location}</span>
                    </div>

                    {event.lessonsLearned && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-amber-600">Lição Aprendida</p>
                            <p className="text-sm">{event.lessonsLearned}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Detalhes
                    </Button>
                    {!event.imcaSubmitted && event.type !== "observation" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleSubmitToIMCA(event)}
                      >
                        <Send className="h-3 w-3" />
                        IMCA
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* IMCA Reference Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Classificação IMCA M190
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-600">DP Incident</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Perda de posição, aproximação perigosa, colisão evitada, dano a equipamento ou pessoa
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-600">Undesired Event</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Falha de sistema sem perda de posição, alarme não atendido, procedimento não seguido
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-600">Observation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Desvio menor, oportunidade de melhoria, boa prática não aplicada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
