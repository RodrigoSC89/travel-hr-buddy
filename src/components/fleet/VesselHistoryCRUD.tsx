/**
 * Vessel History CRUD - PATCH INTERACTIVITY 100%
 * Timeline with add/edit/delete events
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Ship,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  AlertTriangle,
  FileText,
  Anchor,
  Navigation,
  Users,
  Shield,
  ChevronRight,
  MoreVertical,
  Eye,
  Copy,
  Archive
} from "lucide-react";

type EventType = "voyage" | "maintenance" | "incident" | "inspection" | "crew_change" | "cargo" | "port_call" | "certification";

interface VesselEvent {
  id: string;
  vesselId: string;
  type: EventType;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location?: string;
  status: "completed" | "in_progress" | "scheduled" | "cancelled";
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

const EVENT_TYPES: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "voyage", label: "Viagem", icon: Navigation },
  { value: "maintenance", label: "Manutenção", icon: Wrench },
  { value: "incident", label: "Incidente", icon: AlertTriangle },
  { value: "inspection", label: "Inspeção", icon: Shield },
  { value: "crew_change", label: "Troca de Tripulação", icon: Users },
  { value: "cargo", label: "Carga", icon: FileText },
  { value: "port_call", label: "Escala Portuária", icon: Anchor },
  { value: "certification", label: "Certificação", icon: FileText }
];

const MOCK_EVENTS: VesselEvent[] = [
  {
    id: "e1",
    vesselId: "v1",
    type: "voyage",
    title: "Viagem Santos → Rotterdam",
    description: "Transporte de commodities agrícolas",
    date: new Date(2026, 0, 15),
    endDate: new Date(2026, 1, 5),
    location: "Santos, BR → Rotterdam, NL",
    status: "in_progress",
    attachments: ["voyage_plan.pdf"],
    createdBy: "Capitão Silva",
    createdAt: new Date(2026, 0, 10),
    updatedAt: new Date(2026, 0, 15)
  },
  {
    id: "e2",
    vesselId: "v1",
    type: "maintenance",
    title: "Manutenção Motor Principal",
    description: "Troca de filtros e verificação de sistema de combustível",
    date: new Date(2026, 0, 10),
    location: "Porto de Santos",
    status: "completed",
    attachments: ["maintenance_report.pdf", "photos.zip"],
    createdBy: "Eng. Martins",
    createdAt: new Date(2026, 0, 5),
    updatedAt: new Date(2026, 0, 10)
  },
  {
    id: "e3",
    vesselId: "v1",
    type: "inspection",
    title: "Inspeção PSC",
    description: "Inspeção de Port State Control - sem não conformidades",
    date: new Date(2025, 11, 20),
    location: "Porto de Paranaguá",
    status: "completed",
    attachments: ["psc_report.pdf"],
    createdBy: "Oficial Torres",
    createdAt: new Date(2025, 11, 18),
    updatedAt: new Date(2025, 11, 20)
  },
  {
    id: "e4",
    vesselId: "v1",
    type: "crew_change",
    title: "Troca de Tripulação",
    description: "Rotação programada - 8 tripulantes",
    date: new Date(2025, 11, 15),
    location: "Porto de Santos",
    status: "completed",
    attachments: ["crew_list.xlsx"],
    createdBy: "RH Maritime",
    createdAt: new Date(2025, 11, 10),
    updatedAt: new Date(2025, 11, 15)
  },
  {
    id: "e5",
    vesselId: "v1",
    type: "incident",
    title: "Falha de Comunicação Satélite",
    description: "Perda temporária de sinal VSAT por 2 horas",
    date: new Date(2025, 11, 5),
    location: "Alto Mar - Atlântico Sul",
    status: "completed",
    attachments: ["incident_report.pdf"],
    createdBy: "Radio Operador",
    createdAt: new Date(2025, 11, 5),
    updatedAt: new Date(2025, 11, 6)
  }
];

interface VesselHistoryCRUDProps {
  vesselId?: string;
  vesselName?: string;
}

export function VesselHistoryCRUD({ vesselId = "v1", vesselName = "MV Atlantic Pioneer" }: VesselHistoryCRUDProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<VesselEvent[]>(MOCK_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<VesselEvent | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<VesselEvent>>({
    type: "voyage",
    title: "",
    description: "",
    date: new Date(),
    location: "",
    status: "scheduled"
  });

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || e.type === typeFilter;
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events, searchQuery, typeFilter, statusFilter]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      type: "voyage",
      title: "",
      description: "",
      date: new Date(),
      location: "",
      status: "scheduled"
    });
  }, []);

  // Add event
  const handleAddEvent = useCallback(() => {
    if (!formData.title || !formData.type) {
      toast({
        title: "Erro de Validação",
        description: "Título e tipo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newEvent: VesselEvent = {
      id: `e_${Date.now()}`,
      vesselId,
      type: formData.type as EventType,
      title: formData.title,
      description: formData.description || "",
      date: formData.date || new Date(),
      endDate: formData.endDate,
      location: formData.location,
      status: formData.status as VesselEvent["status"] || "scheduled",
      attachments: [],
      createdBy: "Current User",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEvents(prev => [newEvent, ...prev]);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "Evento Adicionado",
      description: `${newEvent.title} foi registrado com sucesso`
    });
  }, [formData, vesselId, resetForm, toast]);

  // Edit event
  const handleEditEvent = useCallback(() => {
    if (!selectedEvent || !formData.title) return;

    setEvents(prev => prev.map(e => 
      e.id === selectedEvent.id 
        ? { 
            ...e, 
            type: formData.type as EventType || e.type,
            title: formData.title || e.title,
            description: formData.description || e.description,
            date: formData.date || e.date,
            endDate: formData.endDate,
            location: formData.location,
            status: formData.status as VesselEvent["status"] || e.status,
            updatedAt: new Date()
          }
        : e
    ));

    setIsEditDialogOpen(false);
    setSelectedEvent(null);
    resetForm();

    toast({
      title: "Evento Atualizado",
      description: "As alterações foram salvas"
    });
  }, [selectedEvent, formData, resetForm, toast]);

  // Delete event
  const handleDeleteEvent = useCallback(() => {
    if (!selectedEvent) return;

    setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    setIsDeleteDialogOpen(false);
    setSelectedEvent(null);

    toast({
      title: "Evento Removido",
      description: "O registro foi excluído"
    });
  }, [selectedEvent, toast]);

  // Duplicate event
  const handleDuplicateEvent = useCallback((event: VesselEvent) => {
    const duplicate: VesselEvent = {
      ...event,
      id: `e_${Date.now()}`,
      title: `${event.title} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEvents(prev => [duplicate, ...prev]);

    toast({
      title: "Evento Duplicado",
      description: `${duplicate.title} foi criado`
    });
  }, [toast]);

  // Open edit dialog
  const openEditDialog = useCallback((event: VesselEvent) => {
    setSelectedEvent(event);
    setFormData({
      type: event.type,
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      status: event.status
    });
    setIsEditDialogOpen(true);
  }, []);

  const getEventIcon = (type: EventType) => {
    const config = EVENT_TYPES.find(t => t.value === type);
    return config?.icon || FileText;
  };

  const getStatusBadge = (status: VesselEvent["status"]) => {
    const config = {
      completed: { label: "Concluído", variant: "default" as const },
      in_progress: { label: "Em Andamento", variant: "secondary" as const },
      scheduled: { label: "Agendado", variant: "outline" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const }
    };
    return config[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6 text-primary" />
            Histórico da Embarcação
          </h2>
          <p className="text-muted-foreground">
            {vesselName} • {events.length} eventos registrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                  ? "Tente ajustar os filtros"
                  : "Adicione o primeiro evento no histórico"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Evento
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {filteredEvents.map((event, index) => {
                    const IconComponent = getEventIcon(event.type);
                    const statusConfig = getStatusBadge(event.status);
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-5 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                        
                        <Card className="ml-4 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-muted">
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{event.title}</h4>
                                    <Badge variant={statusConfig.variant}>
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {event.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {event.date.toLocaleDateString('pt-BR')}
                                      {event.endDate && ` - ${event.endDate.toLocaleDateString('pt-BR')}`}
                                    </span>
                                    {event.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {event.createdBy}
                                    </span>
                                    {event.attachments.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {event.attachments.length} anexo(s)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => openEditDialog(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDuplicateEvent(event)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
            <DialogDescription>
              Adicionar registro ao histórico da embarcação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título do evento"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição detalhada..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.date?.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Data de Fim (opcional)</Label>
                <Input
                  type="date"
                  value={formData.endDate?.toISOString().split('T')[0] || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Local do evento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.date?.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Data de Fim</Label>
                <Input
                  type="date"
                  value={formData.endDate?.toISOString().split('T')[0] || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEditEvent}>
              <Edit className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadge(selectedEvent.status).variant}>
                  {getStatusBadge(selectedEvent.status).label}
                </Badge>
                <Badge variant="outline">
                  {EVENT_TYPES.find(t => t.value === selectedEvent.type)?.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p>{selectedEvent.date.toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedEvent.endDate && (
                  <div>
                    <Label className="text-muted-foreground">Data Fim</Label>
                    <p>{selectedEvent.endDate.toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {selectedEvent.location && (
                  <div>
                    <Label className="text-muted-foreground">Localização</Label>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Criado por</Label>
                  <p>{selectedEvent.createdBy}</p>
                </div>
              </div>
              {selectedEvent.attachments.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Anexos</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.attachments.map((file, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedEvent) openEditDialog(selectedEvent);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento <strong>{selectedEvent?.title}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VesselHistoryCRUD;
