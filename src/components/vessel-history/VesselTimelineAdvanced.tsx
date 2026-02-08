/**
 * VesselTimelineAdvanced - Timeline avançada de histórico da embarcação
 * Com filtros, busca OCR e análise de padrões
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  History,
  Ship,
  Wrench,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface HistoryEvent {
  id: string;
  vessel_id: string | null;
  vessel_name?: string;
  event_type: string;
  event_date: string;
  title: string;
  description?: string | null;
  cost?: number | null;
  downtime_hours?: number | null;
  documents?: unknown;
  tags?: string[];
  created_by?: string | null;
}

interface VesselTimelineAdvancedProps {
  vesselId?: string;
  showFilters?: boolean;
  maxHeight?: string;
  onEventClick?: (event: HistoryEvent) => void;
}

const EVENT_TYPES = [
  { value: 'all', label: 'Todos', icon: History },
  { value: 'maintenance', label: 'Manutenção', icon: Wrench },
  { value: 'inspection', label: 'Inspeção', icon: Shield },
  { value: 'incident', label: 'Incidente', icon: AlertTriangle },
  { value: 'modification', label: 'Modificação', icon: Ship },
  { value: 'crew_change', label: 'Troca de Tripulação', icon: Users },
  { value: 'voyage', label: 'Viagem', icon: Ship },
];

export function VesselTimelineAdvanced({
  vesselId,
  showFilters = true,
  maxHeight = '600px',
  onEventClick,
}: VesselTimelineAdvancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all');

  // Fetch history events
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['vessel-history', vesselId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('vessel_history')
        .select('*')
        .order('event_date', { ascending: false });

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      // Date filter
      if (dateRange !== 'all') {
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const days = daysMap[dateRange];
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        query = query.gte('event_date', fromDate.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) {
        return [];
      }

      return data || [];
    },
    staleTime: 30000,
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event: any) => {
      const matchesSearch =
        !searchTerm ||
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        eventTypeFilter === 'all' || event.event_type === eventTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, eventTypeFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (!filteredEvents.length) return null;

    const totalCost = filteredEvents.reduce((sum: number, e: any) => sum + (e.cost || 0), 0);
    const totalDowntime = filteredEvents.reduce((sum: number, e: any) => sum + (e.downtime_hours || 0), 0);
    const incidents = filteredEvents.filter((e: any) => e.event_type === 'incident').length;

    return { totalCost, totalDowntime, incidents, total: filteredEvents.length };
  }, [filteredEvents]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-warning" />;
      case 'inspection':
        return <Shield className="h-4 w-4 text-success" />;
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'modification':
        return <Ship className="h-4 w-4 text-info" />;
      case 'crew_change':
        return <Users className="h-4 w-4 text-secondary" />;
      case 'voyage':
        return <Ship className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'border-l-warning';
      case 'inspection':
        return 'border-l-success';
      case 'incident':
        return 'border-l-destructive';
      case 'modification':
        return 'border-l-info';
      case 'crew_change':
        return 'border-l-secondary';
      case 'voyage':
        return 'border-l-primary';
      default:
        return 'border-l-muted';
    }
  };

  const exportTimeline = () => {
    const csv = [
      ['Data', 'Tipo', 'Título', 'Descrição', 'Custo', 'Downtime (h)'].join(','),
      ...filteredEvents.map((e: any) =>
        [
          new Date(e.event_date).toLocaleDateString('pt-BR'),
          e.event_type,
          `"${e.title}"`,
          `"${e.description || ''}"`,
          e.cost || 0,
          e.downtime_hours || 0,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vessel-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Timeline exportada com sucesso');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Eventos</p>
                <p className="font-semibold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Custo Total</p>
                <p className="font-semibold">R$ {stats.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Downtime Total</p>
                <p className="font-semibold">{stats.totalDowntime}h</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-destructive/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Incidentes</p>
                <p className="font-semibold text-destructive">{stats.incidents}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportTimeline}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea style={{ maxHeight }}>
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum evento encontrado</p>
              </div>
            ) : (
              filteredEvents.map((event: any) => (
                <div
                  key={event.id}
                  className={`relative border-l-4 ${getEventColor(event.event_type)} bg-card rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => onEventClick?.(event)}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[22px] top-4 p-1.5 bg-background border-2 rounded-full">
                    {getEventIcon(event.event_type)}
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {EVENT_TYPES.find((t) => t.value === event.event_type)?.label || event.event_type}
                        </Badge>
                        {event.vessel_name && (
                          <Badge variant="secondary" className="text-xs">
                            <Ship className="h-3 w-3 mr-1" />
                            {event.vessel_name}
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-medium">{event.title}</h4>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Tags */}
                      {(event.tags as string[] || []).length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(event.tags as string[]).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        {event.cost && event.cost > 0 && (
                          <span>💰 R$ {event.cost.toLocaleString()}</span>
                        )}
                        {event.downtime_hours && event.downtime_hours > 0 && (
                          <span>⏱️ {event.downtime_hours}h downtime</span>
                        )}
                      </div>

                      {/* Documents */}
                      {(() => {
                        const docs = event.documents as Array<{name: string; url: string}> | null;
                        if (!docs || !Array.isArray(docs) || docs.length === 0) return null;
                        return (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {docs.map((doc: {name: string; url: string}, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-accent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (doc.url) window.open(doc.url, '_blank');
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {doc.name}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {new Date(event.event_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Mock data function
function getMockEvents(): HistoryEvent[] {
  return [
    {
      id: '1',
      vessel_id: 'v1',
      vessel_name: 'MV Atlantic Star',
      event_type: 'inspection',
      event_date: new Date().toISOString(),
      title: 'Inspeção PSC - Santos',
      description: 'Inspeção de controle do estado do porto realizada com sucesso. Sem deficiências identificadas.',
      cost: 5000,
      tags: ['PSC', 'Santos', 'Aprovado'],
      documents: [{ name: 'PSC Report', url: '#' }],
    },
    {
      id: '2',
      vessel_id: 'v1',
      vessel_name: 'MV Atlantic Star',
      event_type: 'maintenance',
      event_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Manutenção preventiva motor principal',
      description: 'Troca de filtros e óleo do motor principal conforme cronograma de manutenção.',
      cost: 45000,
      downtime_hours: 8,
      tags: ['Motor', 'Preventiva'],
      documents: [{ name: 'Work Order', url: '#' }, { name: 'Spare Parts List', url: '#' }],
    },
    {
      id: '3',
      vessel_id: 'v1',
      vessel_name: 'MV Atlantic Star',
      event_type: 'incident',
      event_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Near miss - procedimento de amarração',
      description: 'Quase-acidente durante operação de amarração. Investigação concluída, treinamento adicional realizado.',
      tags: ['Near Miss', 'Amarração', 'Investigado'],
      documents: [{ name: 'Incident Report', url: '#' }],
    },
    {
      id: '4',
      vessel_id: 'v1',
      vessel_name: 'MV Atlantic Star',
      event_type: 'modification',
      event_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Instalação BWTS',
      description: 'Instalação do sistema de tratamento de água de lastro em conformidade com IMO.',
      cost: 850000,
      downtime_hours: 168,
      tags: ['BWTS', 'IMO', 'Retrofit'],
      documents: [{ name: 'BWTS Certificate', url: '#' }, { name: 'Installation Report', url: '#' }],
    },
    {
      id: '5',
      vessel_id: 'v1',
      vessel_name: 'MV Pacific Dawn',
      event_type: 'crew_change',
      event_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Troca de tripulação - Rotação completa',
      description: '15 tripulantes embarcaram, 15 desembarcaram. Handover completo realizado.',
      tags: ['Crew Change', 'Rotação'],
    },
  ];
}

export default VesselTimelineAdvanced;
