/**
 * Vessel History CRUD - Real Supabase Integration
 * Timeline with add/edit/delete events from navigation_history
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Ship, Plus, Edit, Trash2, Search, Filter, Download, Calendar,
  MapPin, Wrench, AlertTriangle, FileText, Anchor, Navigation,
  Users, Shield, Eye, Loader2
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
  createdBy: string;
  createdAt: Date;
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

interface VesselHistoryCRUDProps {
  vesselId?: string;
  vesselName?: string;
}

export function VesselHistoryCRUD({ vesselId = "v1", vesselName = "MV Atlantic Pioneer" }: VesselHistoryCRUDProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<VesselEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "voyage" as EventType, title: "", description: "", date: "", location: "", status: "scheduled" });

  // Fetch events from navigation_history
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['vessel-history', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- navigation_history columns not fully in generated types
      return data.map((d: any): VesselEvent => ({
        id: d.id,
        vesselId: d.vessel_id || vesselId,
        type: (d.event_type || d.action || 'voyage') as EventType,
        title: d.title || d.description?.slice(0, 60) || `Evento ${d.id.slice(0, 6)}`,
        description: d.description || d.notes || '',
        date: new Date(d.event_date || d.created_at),
        endDate: d.end_date ? new Date(d.end_date) : undefined,
        location: d.location || d.port_name || '',
        status: (d.status || 'completed') as VesselEvent['status'],
        createdBy: d.created_by || d.user_id || 'Sistema',
        createdAt: new Date(d.created_at),
      }));
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('navigation_history').insert({
        vessel_id: vesselId,
        event_type: formData.type,
        title: formData.title,
        description: formData.description,
        event_date: formData.date || new Date().toISOString(),
        location: formData.location || null,
        status: formData.status,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessel-history'] });
      setIsAddDialogOpen(false);
      setFormData({ type: "voyage", title: "", description: "", date: "", location: "", status: "scheduled" });
      toast({ title: "Evento Adicionado", description: "Registro salvo com sucesso" });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao salvar evento", variant: "destructive" }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('navigation_history').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessel-history'] });
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      toast({ title: "Evento Removido", description: "O registro foi excluído" });
    },
  });

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || e.type === typeFilter;
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events, searchQuery, typeFilter, statusFilter]);

  const getEventIcon = (type: EventType) => EVENT_TYPES.find(t => t.value === type)?.icon || FileText;
  const getStatusBadge = (status: VesselEvent["status"]) => {
    const config = { completed: { label: "Concluído", variant: "default" as const }, in_progress: { label: "Em Andamento", variant: "secondary" as const }, scheduled: { label: "Agendado", variant: "outline" as const }, cancelled: { label: "Cancelado", variant: "destructive" as const } };
    return config[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Ship className="h-6 w-6 text-primary" />Histórico da Embarcação</h2>
          <p className="text-muted-foreground">{vesselName} • {events.length} eventos registrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4" />Novo Evento</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar eventos..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os Tipos</SelectItem>{EVENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem><SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="scheduled">Agendado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando histórico...</p></div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mb-4">{searchQuery || typeFilter !== "all" ? "Tente ajustar os filtros" : "Adicione o primeiro evento"}</p>
              <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Evento</Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {filteredEvents.map((event) => {
                    const IconComponent = getEventIcon(event.type);
                    const statusConfig = getStatusBadge(event.status);
                    return (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-5 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                        <Card className="ml-4 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-muted"><IconComponent className="h-5 w-5" /></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{event.title}</h4>
                                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date.toLocaleDateString('pt-BR')}</span>
                                    {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.createdBy}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedEvent(event); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Evento</DialogTitle><DialogDescription>Registre um evento no histórico da embarcação</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as EventType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Título *</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Título do evento" /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Descrição detalhada..." /></div>
            <div className="space-y-2"><Label>Localização</Label><Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Porto ou coordenadas" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !formData.title}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Tem certeza que deseja excluir "{selectedEvent?.title}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => selectedEvent && deleteMutation.mutate(selectedEvent.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}