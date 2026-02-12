/**
 * Vessel History Timeline
 * Full CRUD for vessel events with timeline visualization and filters
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Search, Filter, Edit, Trash2, Archive, Download, Loader2,
  History, Ship, Anchor, Wrench, AlertTriangle, FileText, MapPin,
  Calendar, Clock, User, ChevronRight, Eye, RefreshCw, CheckCircle,
  XCircle, Navigation, Fuel, Settings, Users, Package
} from 'lucide-react';

interface VesselEvent {
  id: string;
  vesselId: string;
  vesselName: string;
  type: 'voyage' | 'maintenance' | 'incident' | 'inspection' | 'port_call' | 'certification' | 'crew_change' | 'cargo' | 'fuel';
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  attachments?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Vessel {
  id: string;
  name: string;
  imo: string;
}

const EVENT_TYPES = [
  { value: 'voyage', label: 'Viagem', icon: Navigation, color: 'bg-info' },
  { value: 'maintenance', label: 'Manutenção', icon: Wrench, color: 'bg-warning' },
  { value: 'incident', label: 'Incidente', icon: AlertTriangle, color: 'bg-destructive' },
  { value: 'inspection', label: 'Inspeção', icon: FileText, color: 'bg-accent' },
  { value: 'port_call', label: 'Escala', icon: Anchor, color: 'bg-success' },
  { value: 'certification', label: 'Certificação', icon: CheckCircle, color: 'bg-success' },
  { value: 'crew_change', label: 'Troca de Tripulação', icon: Users, color: 'bg-info' },
  { value: 'cargo', label: 'Carga', icon: Package, color: 'bg-warning' },
  { value: 'fuel', label: 'Abastecimento', icon: Fuel, color: 'bg-muted-foreground' },
];

const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'bg-muted-foreground' },
  { value: 'medium', label: 'Média', color: 'bg-warning' },
  { value: 'high', label: 'Alta', color: 'bg-warning' },
  { value: 'critical', label: 'Crítica', color: 'bg-destructive' },
];

export function VesselHistoryTimeline() {
  const { toast } = useToast();
  
  // State
  const [events, setEvents] = useState<VesselEvent[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVessel, setFilterVessel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<VesselEvent | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<VesselEvent>>({
    type: 'voyage',
    status: 'planned',
    priority: 'medium',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Demo vessels
      const demoVessels: Vessel[] = [
        { id: 'v1', name: 'MV Santos Explorer', imo: 'IMO9123456' },
        { id: 'v2', name: 'MV Atlantic Pioneer', imo: 'IMO9234567' },
        { id: 'v3', name: 'MV Pacific Guardian', imo: 'IMO9345678' },
      ];

      // Demo events
      const demoEvents: VesselEvent[] = [
        {
          id: 'e1',
          vesselId: 'v1',
          vesselName: 'MV Santos Explorer',
          type: 'voyage',
          title: 'Viagem Santos → Rotterdam',
          description: 'Transporte de containers refrigerados. Carga de produtos agrícolas.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Oceano Atlântico',
          status: 'in_progress',
          priority: 'high',
          createdBy: 'Capitão Silva',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'e2',
          vesselId: 'v1',
          vesselName: 'MV Santos Explorer',
          type: 'maintenance',
          title: 'Manutenção Preventiva - Motor Principal',
          description: 'Troca de filtros e inspeção de injetores do motor principal.',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Porto de Santos',
          status: 'completed',
          priority: 'medium',
          createdBy: 'Chefe de Máquinas Costa',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'e3',
          vesselId: 'v2',
          vesselName: 'MV Atlantic Pioneer',
          type: 'incident',
          title: 'Colisão com objeto flutuante',
          description: 'Impacto leve com container à deriva. Sem danos estruturais. Relatório enviado.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Lat: -23.5, Long: -45.2',
          status: 'completed',
          priority: 'critical',
          createdBy: 'Oficial de Navegação',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'e4',
          vesselId: 'v1',
          vesselName: 'MV Santos Explorer',
          type: 'inspection',
          title: 'Inspeção PSC - Port State Control',
          description: 'Inspeção de rotina pelo controle do Estado do Porto. Resultado: Sem deficiências.',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Porto de Rotterdam',
          status: 'completed',
          priority: 'high',
          createdBy: 'Capitão Silva',
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'e5',
          vesselId: 'v3',
          vesselName: 'MV Pacific Guardian',
          type: 'port_call',
          title: 'Escala em Singapura',
          description: 'Parada técnica para abastecimento e provisões.',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Porto de Singapura',
          status: 'planned',
          priority: 'medium',
          createdBy: 'Agente Marítimo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'e6',
          vesselId: 'v2',
          vesselName: 'MV Atlantic Pioneer',
          type: 'crew_change',
          title: 'Troca de Tripulação - Oficiais',
          description: 'Embarque: 2º Oficial, 3º Maquinista. Desembarque: 2º Oficial (férias)',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Porto de Houston',
          status: 'completed',
          priority: 'medium',
          createdBy: 'RH Marítimo',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setVessels(demoVessels);
      setEvents(demoEvents);
    } catch (error) {
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o histórico. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                           e.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || e.type === filterType;
      const matchesVessel = filterVessel === 'all' || e.vesselId === filterVessel;
      const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchesSearch && matchesType && matchesVessel && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // CRUD Operations
  const handleCreate = useCallback(() => {
    setSelectedEvent(null);
    setFormData({
      type: 'voyage',
      status: 'planned',
      priority: 'medium',
      vesselId: vessels[0]?.id,
      vesselName: vessels[0]?.name,
      date: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  }, [vessels]);

  const handleEdit = useCallback((event: VesselEvent) => {
    setSelectedEvent(event);
    setFormData({ 
      ...event,
      date: event.date.split('T')[0],
      endDate: event.endDate?.split('T')[0],
    });
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((event: VesselEvent) => {
    setSelectedEvent(event);
    setIsViewOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }
    if (!formData.vesselId) {
      toast({ title: 'Erro', description: 'Selecione uma embarcação', variant: 'destructive' });
      return;
    }

    setActionLoading('save');
    try {
      const vessel = vessels.find(v => v.id === formData.vesselId);

      if (selectedEvent) {
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id 
            ? { 
                ...e, 
                ...formData,
                vesselName: vessel?.name || e.vesselName,
                date: new Date(formData.date!).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
                updatedAt: new Date().toISOString() 
              } as VesselEvent
            : e
        ));
        toast({ title: 'Sucesso', description: 'Evento atualizado com sucesso' });
      } else {
        const newEvent: VesselEvent = {
          id: `new-${Date.now()}`,
          ...formData,
          vesselName: vessel?.name || '',
          date: new Date(formData.date!).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          createdBy: 'Usuário Atual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as VesselEvent;
        setEvents(prev => [newEvent, ...prev]);
        toast({ title: 'Sucesso', description: 'Evento criado com sucesso' });
      }

      setIsFormOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar evento', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;

    setActionLoading(id);
    try {
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Sucesso', description: 'Evento excluído' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  // Export
  const handleExport = () => {
    const data = filteredEvents.map(e => ({
      Embarcação: e.vesselName,
      Tipo: EVENT_TYPES.find(t => t.value === e.type)?.label,
      Título: e.title,
      Descrição: e.description,
      Data: new Date(e.date).toLocaleDateString('pt-BR'),
      Local: e.location,
      Status: e.status,
      Prioridade: e.priority,
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_embarcacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({ title: 'Exportado', description: 'Arquivo CSV gerado com sucesso' });
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-info">Em Andamento</Badge>;
      case 'planned':
        return <Badge variant="secondary">Planejado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const info = PRIORITIES.find(p => p.value === priority);
    return (
      <Badge variant="outline" className="text-xs">
        <span className={`w-2 h-2 rounded-full ${info?.color} mr-1`} />
        {info?.label}
      </Badge>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={`timeline-skeleton-${i}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Histórico de Embarcações
          </h2>
          <p className="text-muted-foreground">
            Timeline completa de eventos, manutenções, viagens e incidentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterVessel} onValueChange={setFilterVessel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Embarcação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {vessels.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="planned">Planejado</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          title={sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}
        >
          <Clock className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
        </Button>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Registre eventos para construir o histórico da embarcação
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              const IconComponent = typeInfo.icon;
              
              return (
                <div key={event.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-5 h-5 rounded-full ${typeInfo.color} flex items-center justify-center`}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Ship className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {event.vesselName}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                              {event.endDate && (
                                <> → {new Date(event.endDate).toLocaleDateString('pt-BR')}</>
                              )}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {event.createdBy}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            {getStatusBadge(event.status)}
                            {getPriorityBadge(event.priority)}
                          </div>
                          
                          <div className="flex gap-1 mt-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleView(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDelete(event.id)}
                              disabled={actionLoading === event.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            <DialogDescription>
              Registre um evento no histórico da embarcação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Embarcação *</label>
                <Select
                  value={formData.vesselId}
                  onValueChange={(value) => {
                    const vessel = vessels.find(v => v.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      vesselId: value,
                      vesselName: vessel?.name 
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vessels.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Evento *</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as VesselEvent['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título do evento"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o evento em detalhes"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data Início *</label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data Fim (opcional)</label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Porto de Santos, Oceano Atlântico"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as VesselEvent['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planejado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as VesselEvent['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={actionLoading === 'save'}>
              {actionLoading === 'save' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedEvent ? 'Salvar Alterações' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {React.createElement(getEventTypeInfo(selectedEvent.type).icon, { className: 'h-5 w-5' })}
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {getStatusBadge(selectedEvent.status)}
                {getPriorityBadge(selectedEvent.priority)}
                <Badge variant="outline">{getEventTypeInfo(selectedEvent.type).label}</Badge>
              </div>

              <p className="text-muted-foreground">{selectedEvent.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.vesselName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString('pt-BR')}
                    {selectedEvent.endDate && (
                      <> → {new Date(selectedEvent.endDate).toLocaleDateString('pt-BR')}</>
                    )}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.createdBy}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-3">
                Criado em: {new Date(selectedEvent.createdAt).toLocaleString('pt-BR')} • 
                Atualizado em: {new Date(selectedEvent.updatedAt).toLocaleString('pt-BR')}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setIsViewOpen(false);
              if (selectedEvent) handleEdit(selectedEvent);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VesselHistoryTimeline;
