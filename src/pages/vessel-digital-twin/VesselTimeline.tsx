/**
 * Vessel Timeline Component
 * Complete vessel history
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Ship,
  Building,
  Award,
  Anchor,
  AlertTriangle,
  Wrench,
  FileText,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Flag
} from 'lucide-react';
import { useVesselHistory, type VesselHistoryEvent } from '@/hooks/use-vessel-digital-twin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VesselTimelineProps {
  vesselId: string;
}

const EVENT_TYPES = [
  { value: 'all', label: 'Todos os Eventos' },
  { value: 'construction', label: 'Construção' },
  { value: 'delivery', label: 'Entrega' },
  { value: 'ownership', label: 'Propriedade' },
  { value: 'classification', label: 'Classificação' },
  { value: 'survey', label: 'Vistoria' },
  { value: 'drydock', label: 'Docagem' },
  { value: 'incident', label: 'Incidente' },
  { value: 'repair', label: 'Reparo' },
  { value: 'modification', label: 'Modificação' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'voyage', label: 'Viagem' },
  { value: 'flag_change', label: 'Mudança de Bandeira' },
];

const EVENT_ICONS: Record<string, React.ElementType> = {
  construction: Building,
  delivery: Ship,
  ownership: FileText,
  classification: Award,
  survey: FileText,
  drydock: Anchor,
  incident: AlertTriangle,
  repair: Wrench,
  modification: Wrench,
  certificate: Award,
  inspection: FileText,
  voyage: MapPin,
  flag_change: Flag,
};

const EVENT_COLORS: Record<string, string> = {
  construction: 'bg-blue-500',
  delivery: 'bg-green-500',
  ownership: 'bg-purple-500',
  classification: 'bg-cyan-500',
  survey: 'bg-indigo-500',
  drydock: 'bg-amber-500',
  incident: 'bg-red-500',
  repair: 'bg-orange-500',
  modification: 'bg-pink-500',
  certificate: 'bg-teal-500',
  inspection: 'bg-gray-500',
  voyage: 'bg-emerald-500',
  flag_change: 'bg-yellow-500',
};

function TimelineEvent({ event }: { event: VesselHistoryEvent }) {
  const Icon = EVENT_ICONS[event.event_type] || Calendar;
  const color = EVENT_COLORS[event.event_type] || 'bg-gray-500';

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1 h-6 w-6 rounded-full ${color} flex items-center justify-center`}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(event.event_date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {event.event_type.replace('_', ' ')}
              </Badge>
              {event.verified && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {event.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {event.location}
              </div>
            )}
            {event.performed_by && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building className="h-3 w-3" />
                {event.performed_by}
              </div>
            )}
            {event.duration_days && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {event.duration_days} dias
              </div>
            )}
            {event.cost && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                {event.currency} {event.cost.toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VesselTimeline({ vesselId }: VesselTimelineProps) {
  const [eventType, setEventType] = useState('all');
  const { data: events, isLoading } = useVesselHistory(vesselId);

  const filteredEvents = events?.filter(event => 
    eventType === 'all' || event.event_type === eventType
  ) || [];

  // Group by year
  const groupedByYear = filteredEvents.reduce((acc, event) => {
    const year = new Date(event.event_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, VesselHistoryEvent[]>);

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="pl-8">
            <Skeleton className="h-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {filteredEvents.length} eventos no histórico
          </h2>
        </div>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de evento" />
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

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento encontrado no histórico</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-lg font-bold px-4 py-1">
                  {year}
                </Badge>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-4">
                {groupedByYear[year].map(event => (
                  <TimelineEvent key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
