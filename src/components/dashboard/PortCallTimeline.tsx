/**
 * Port Call Timeline - Active port calls with ETA/ETD tracking
 * Shows upcoming and current port calls across the fleet
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Anchor, Clock, MapPin, ArrowRight, Ship } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format, isPast, isFuture, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PortCallTimeline() {
  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ['port-call-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('port_calls')
        .select('id, port_name, vessel_id, eta, etd, status, purpose, berth_number, created_at')
        .order('eta', { ascending: true })
        .limit(8);
      if (error) throw error;

      // Get vessel names
      const vesselIds = (data || []).map(d => d.vessel_id).filter((id): id is string => !!id);
      let vesselMap: Record<string, string> = {};
      if (vesselIds.length > 0) {
        const { data: vData } = await supabase
          .from('vessels')
          .select('id, name')
          .in('id', vesselIds);
        if (vData) vesselMap = Object.fromEntries(vData.map(v => [v.id, v.name || 'Unknown']));
      }

      return (data || []).map(d => ({
        ...d,
        vessel_name: vesselMap[d.vessel_id || ''] || 'N/A',
      }));
    },
    staleTime: 60000,
  });

  const activeCount = portCalls.filter(p => p.status === 'in_port' || p.status === 'berthed').length;
  const upcomingCount = portCalls.filter(p => p.eta && isFuture(new Date(p.eta))).length;

  if (isLoading) return <Skeleton className="h-80" />;

  const getStatusColor = (pc: typeof portCalls[0]) => {
    if (pc.status === 'in_port' || pc.status === 'berthed') return 'bg-success text-success-foreground';
    if (pc.eta && isPast(new Date(pc.eta))) return 'bg-warning text-warning-foreground';
    if (pc.eta) {
      const hoursUntil = differenceInHours(new Date(pc.eta), new Date());
      if (hoursUntil <= 24) return 'bg-info text-info-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (pc: typeof portCalls[0]) => {
    if (pc.status === 'in_port' || pc.status === 'berthed') return 'In Port';
    if (pc.status === 'departed') return 'Departed';
    if (pc.eta && isPast(new Date(pc.eta))) return 'Overdue';
    return 'En Route';
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Anchor className="h-4 w-4 text-hub-ops" />
            Port Call Timeline
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {activeCount} in port
            </Badge>
            <Badge variant="outline" className="text-xs">
              {upcomingCount} upcoming
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {portCalls.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Nenhuma escala portuária registrada</p>
            <p className="text-xs">Port calls aparecerão aqui quando registradas</p>
          </div>
        ) : (
          <div className="relative space-y-1">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

            {portCalls.map((pc, idx) => (
              <div key={pc.id} className="relative flex items-start gap-3 py-2 pl-1">
                {/* Timeline dot */}
                <div className={`relative z-10 mt-1 h-[10px] w-[10px] rounded-full border-2 border-background ${
                  pc.status === 'in_port' || pc.status === 'berthed' ? 'bg-success' : 
                  pc.eta && isPast(new Date(pc.eta)) ? 'bg-warning' : 'bg-muted-foreground/50'
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{pc.port_name || 'Unknown Port'}</span>
                    </div>
                    <Badge className={`text-[10px] h-5 px-1.5 flex-shrink-0 ${getStatusColor(pc)}`}>
                      {getStatusLabel(pc)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Ship className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{pc.vessel_name}</span>
                    {pc.berth_number && (
                      <>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">Berth {pc.berth_number}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {pc.eta && (
                      <span>ETA: {format(new Date(pc.eta), 'dd/MM HH:mm')}</span>
                    )}
                    {pc.eta && pc.etd && <ArrowRight className="h-2.5 w-2.5" />}
                    {pc.etd && (
                      <span>ETD: {format(new Date(pc.etd), 'dd/MM HH:mm')}</span>
                    )}
                    {pc.eta && isFuture(new Date(pc.eta)) && (
                      <span className="ml-1 text-primary">
                        ({formatDistanceToNow(new Date(pc.eta), { locale: ptBR, addSuffix: true })})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PortCallTimeline;
